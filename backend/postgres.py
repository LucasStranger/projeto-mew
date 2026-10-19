"""Adapter Neon para as tabelas da equipe e os metadados privados da API.

O contrato de estado atual é mantido para não alterar o front. Uma transação
PostgreSQL e um advisory lock serializam os deltas entre instâncias da API.
"""
import copy
from contextlib import contextmanager
from datetime import datetime, timezone

import psycopg
from psycopg.rows import dict_row
from psycopg.types.json import Jsonb
from psycopg_pool import ConnectionPool, PoolTimeout

from .catalog import DATABASE_LEVELS, build_quizzes
from .config import ConfigurationError
from .migrate import LOCK_KEY
from .storage import AccountConflict, StorageUnavailable


def utc_iso(value):
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc).isoformat()


def utc_naive(value):
    return datetime.fromisoformat(value).astimezone(timezone.utc).replace(tzinfo=None)


class PostgresRepository:
    kind = 'postgresql'

    def __init__(self, url):
        self.pool = ConnectionPool(
            conninfo=url, name='mew-api', min_size=0, max_size=4, timeout=12,
            kwargs={'row_factory': dict_row, 'connect_timeout': 10, 'prepare_threshold': None},
            open=True,
        )
        try:
            with self.connection() as conn:
                exists = conn.execute("SELECT to_regclass('mew_api.migration') AS name").fetchone()['name']
                if not exists or not conn.execute('SELECT 1 FROM mew_api.migration WHERE version=3').fetchone():
                    raise ConfigurationError('Prepare o banco executando: python -m backend.migrate')
        except Exception:
            self.close()
            raise

    @contextmanager
    def connection(self):
        try:
            with self.pool.connection() as conn:
                conn.execute('SET LOCAL statement_timeout = 10000')
                yield conn
        except psycopg.errors.UniqueViolation as error:
            if error.diag.constraint_name in ('usuario_email_key', 'usuario_email_normalizado_key'):
                raise AccountConflict() from None
            raise StorageUnavailable() from None
        except (psycopg.Error, PoolTimeout):
            raise StorageUnavailable() from None

    def close(self):
        self.pool.close()

    def load_quizzes(self, catalog):
        with self.connection() as conn:
            rows = conn.execute('''SELECT q.*, t.nome_topico FROM public.questao q
                JOIN public.topico t ON t.id_topico=q.id_topico ORDER BY q.id_questao''').fetchall()
        return build_quizzes(rows, catalog)

    def check_health(self):
        with self.connection() as conn:
            conn.execute('SELECT 1')

    def _read(self, conn):
        data = {'schema_version': 1, 'participants': {}, 'attempts': {}, 'events': [], 'sessions': {}}
        for row in conn.execute('''SELECT p.*,u.nome,u.email,u.senha,u.pontuacao_usuario
                FROM mew_api.participante p JOIN public.usuario u ON u.id_usuario=p.id_usuario'''):
            pid = str(row['id'])
            data['participants'][pid] = {'id': pid, 'token_hash': row['token_hash'],
                'created_at': utc_iso(row['created_at']), '_db_user_id': row['id_usuario'],
                '_db_score': row['pontuacao_usuario'], 'nome': row['nome'],
                'email': row['email'] if row['registered_at'] else None,
                'password_hash': row['senha'] if row['registered_at'] else None,
                'registered_at': utc_iso(row['registered_at']) if row['registered_at'] else None}
        for row in conn.execute('SELECT * FROM mew_api.sessao'):
            sid = str(row['id'])
            data['sessions'][sid] = {'id': sid, 'participant_id': str(row['participante_id']),
                'token_hash': row['token_hash'], 'created_at': utc_iso(row['created_at']), 'expires_at': utc_iso(row['expires_at'])}
        level_codes = {label: key for key, label in DATABASE_LEVELS.items()}
        by_match = {}
        for row in conn.execute('''SELECT t.*, p.nivel, p.data_inicio FROM mew_api.tentativa t
                JOIN public.partida p ON p.id_partida=t.id_partida'''):
            aid = str(row['id'])
            attempt = {'id': aid, 'participant_id': str(row['participante_id']), 'request_id': row['request_id'],
                       'especie_id': row['especie_id'], 'dificuldade': level_codes[row['nivel']],
                       'started_at': utc_iso(row['data_inicio']), 'finished_at': utc_iso(row['finished_at']) if row['finished_at'] else None,
                       'status': row['status'], 'questions': row['questions'], 'answers': {}, '_db_match_id': row['id_partida']}
            data['attempts'][aid] = attempt
            by_match[row['id_partida']] = attempt
        for row in conn.execute('''SELECT r.* FROM public.resposta_usuario r
                JOIN mew_api.tentativa t ON t.id_partida=r.id_partida ORDER BY r.id_resposta_usuario'''):
            attempt = by_match[row['id_partida']]
            question = next(q for q in attempt['questions'] if q['Id_Questao'] == row['id_questao'])
            qid = question['id']
            correct = row['letra_correta_apresentada'] - 1
            attempt['answers'][qid] = {'id': qid, 'Id_Questao': row['id_questao'], 'topico': question['topico'],
                'escolha': row['resposta_usuario'] - 1, 'acertou': bool(row['acerto_erro']), 'correta': correct,
                'letraCorreta': chr(65 + correct), 'explicacao': question['explicacao'],
                'respondida_em': utc_iso(row['data_resposta']), 'tempo_resposta_segundos': row['tempo_resposta_segundos']}
        for row in conn.execute('SELECT * FROM mew_api.evento ORDER BY id'):
            data['events'].append({'participant_id': str(row['participante_id']), 'especie_id': row['especie_id'],
                                   'tipo': row['tipo'], 'created_at': utc_iso(row['created_at']), '_db_id': row['id']})
        return data

    def _write(self, conn, old, data):
        # Apenas inserções e alterações pertencentes à API. Registros externos
        # não são consultados como usuários da API nem apagados pelo adaptador.
        for pid, participant in data['participants'].items():
            if pid in old['participants']:
                previous = old['participants'][pid]
                if (participant.get('registered_at'), participant['token_hash']) != (previous.get('registered_at'), previous['token_hash']):
                    conn.execute('UPDATE mew_api.participante SET registered_at=%s,token_hash=%s WHERE id=%s',
                                 (participant.get('registered_at'), participant['token_hash'], pid))
                if participant.get('registered_at') and any(participant.get(k) != previous.get(k) for k in ('nome', 'email', 'password_hash')):
                    conn.execute('UPDATE public.usuario SET nome=%s,email=%s,senha=%s WHERE id_usuario=%s',
                        (participant['nome'], participant['email'], participant['password_hash'], participant['_db_user_id']))
                continue
            registered = bool(participant.get('registered_at'))
            user_id = conn.execute('''INSERT INTO public.usuario
                (nome,email,senha,pontuacao_usuario,data_cadastro) VALUES (%s,%s,%s,0,%s) RETURNING id_usuario''',
                (participant['nome'] if registered else 'Participante ' + pid[:8],
                 participant['email'] if registered else 'anon-' + pid + '@mew.invalid',
                 participant['password_hash'] if registered else '!' + participant['token_hash'],
                 utc_naive(participant['created_at']))).fetchone()['id_usuario']
            conn.execute('''INSERT INTO mew_api.participante (id,id_usuario,token_hash,created_at,registered_at) VALUES (%s,%s,%s,%s,%s)''',
                         (pid, user_id, participant['token_hash'], participant['created_at'], participant.get('registered_at')))
            participant['_db_user_id'] = user_id
        for aid, attempt in data['attempts'].items():
            previous = old['attempts'].get(aid)
            user_id = data['participants'][attempt['participant_id']]['_db_user_id']
            if previous is None:
                match_id = conn.execute('''INSERT INTO public.partida (id_usuario,nivel,data_inicio)
                    VALUES (%s,%s,%s) RETURNING id_partida''',
                    (user_id, DATABASE_LEVELS[attempt['dificuldade']], utc_naive(attempt['started_at']))).fetchone()['id_partida']
                conn.execute('''INSERT INTO mew_api.tentativa
                    (id,participante_id,id_partida,request_id,especie_id,status,questions,finished_at)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s)''',
                    (aid, attempt['participant_id'], match_id, attempt['request_id'], attempt['especie_id'],
                     attempt['status'], Jsonb(attempt['questions']), attempt['finished_at']))
                attempt['_db_match_id'] = match_id
            elif (attempt['status'], attempt['finished_at']) != (previous['status'], previous['finished_at']):
                conn.execute('UPDATE mew_api.tentativa SET status=%s,finished_at=%s WHERE id=%s',
                             (attempt['status'], attempt['finished_at'], aid))
            previous_answers = previous['answers'] if previous else {}
            for qid, answer in attempt['answers'].items():
                if qid in previous_answers:
                    continue
                question = next(q for q in attempt['questions'] if q['id'] == qid)
                conn.execute('''INSERT INTO public.resposta_usuario
                    (id_partida,id_questao,resposta_usuario,letra_correta_apresentada,acerto_erro,tempo_resposta_segundos,data_resposta)
                    VALUES (%s,%s,%s,%s,%s,%s,%s)''',
                    (attempt['_db_match_id'], question['Id_Questao'], answer['escolha'] + 1,
                     answer['correta'] + 1, int(answer['acertou']), answer.get('tempo_resposta_segundos'), utc_naive(answer['respondida_em'])))
                if answer['acertou']:
                    conn.execute('UPDATE public.usuario SET pontuacao_usuario=pontuacao_usuario+1 WHERE id_usuario=%s', (user_id,))
        before = {e['_db_id'] for e in old['events']}
        after = {e['_db_id'] for e in data['events'] if '_db_id' in e}
        if before - after:
            conn.execute('DELETE FROM mew_api.evento WHERE id = ANY(%s)', (list(before - after),))
        for event in data['events']:
            if '_db_id' not in event:
                conn.execute('''INSERT INTO mew_api.evento (participante_id,especie_id,tipo,created_at) VALUES (%s,%s,%s,%s)''',
                             (event['participant_id'], event['especie_id'], event['tipo'], event['created_at']))
        removed = set(old.get('sessions', {})) - set(data.get('sessions', {}))
        if removed:
            conn.execute('DELETE FROM mew_api.sessao WHERE id = ANY(%s::uuid[])', (list(removed),))
        for sid, session in data.get('sessions', {}).items():
            if sid not in old.get('sessions', {}):
                conn.execute('''INSERT INTO mew_api.sessao (id,participante_id,token_hash,created_at,expires_at)
                    VALUES (%s,%s,%s,%s,%s)''', (sid, session['participant_id'], session['token_hash'], session['created_at'], session['expires_at']))

    @contextmanager
    def transaction(self):
        with self.connection() as conn:
            conn.execute('SELECT pg_advisory_xact_lock(%s)', (LOCK_KEY,))
            original = self._read(conn)
            data = copy.deepcopy(original)
            yield data
            if data != original:
                self._write(conn, original, data)

    def snapshot(self):
        with self.connection() as conn:
            conn.execute('SELECT pg_advisory_xact_lock(%s)', (LOCK_KEY,))
            return self._read(conn)
