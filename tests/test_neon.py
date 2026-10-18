import csv
import io
import json
import os
from pathlib import Path
import tempfile
import threading
from contextlib import contextmanager
from unittest.mock import patch
import unittest

from backend.catalog import build_quizzes
from backend.config import ConfigurationError, database_url, load_environment
from backend.service import Service
from backend.server import SITE
from backend.storage import JsonRepository


class ConfigAndCatalogTests(unittest.TestCase):
    def test_env_does_not_override_host_configuration(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / '.env'
            path.write_text('MEW_PORT=9999\nMEW_ENV_TEST=value\n', encoding='utf-8')
            with patch.dict(os.environ, {'MEW_PORT': '8000'}):
                load_environment(path)
                self.assertEqual(os.environ['MEW_PORT'], '8000')
                self.assertEqual(os.environ['MEW_ENV_TEST'], 'value')

    def test_invalid_connection_does_not_expose_credentials(self):
        for url in ('postgresql://user:private-test-password@host/db', 'https://user:private-test-password@host/db', 'postgresql://[broken'):
            with patch.dict(os.environ, {'DATABASE_URL': url}):
                with self.assertRaises(ConfigurationError) as raised:
                    database_url()
                self.assertNotIn('private-test-password', str(raised.exception))

    def test_bank_mapping_one_based_choices(self):
        catalog = {'pe-1': {'nome_popular': 'Peixe-boi-marinho'}}
        rows = []
        for level in ('Fácil', 'Intermediário', 'Difícil'):
            for index in range(5):
                rows.append({'id_questao': len(rows)+1, 'animal': 'Peixe-Boi-Marinho', 'nivel': level,
                    'nome_topico': 'Cadeia alimentar', 'enunciado': 'Qual alternativa?',
                    **{'alternativa_' + letter: letter.upper() for letter in 'abcd'},
                    'alternativa_correta': 1 if index == 0 else 4, 'explicacao': 'Explicação privada.'})
        quizzes = build_quizzes(rows, catalog)
        self.assertEqual(quizzes['pe-1']['facil'][0]['correta'], 0)
        self.assertEqual(quizzes['pe-1']['facil'][1]['correta'], 3)
        self.assertEqual(quizzes['pe-1']['facil'][0]['topico'], 'cadeia_alimentar')
        self.assertEqual(quizzes['pe-1']['facil'][0]['Id_Questao'], 1)
        rows[0]['animal'] = 'Espécie desconhecida'
        with self.assertRaises(ValueError):
            build_quizzes(rows, catalog)

    def test_unanswered_questions_never_expose_feedback(self):
        with tempfile.TemporaryDirectory() as folder:
            service = Service(JsonRepository(Path(folder) / 'data.json'), SITE, 'test-admin-key-with-24-characters')
            _, session = service.dispatch('POST', '/api/cadastro', {'nome': 'Teste local', 'email': 'local@example.com', 'senha': 'Senha longa local de teste!'}, '', {})
            token = session['token']
            _, attempt = service.dispatch('POST', '/api/tentativas', {'especie_id': 'pe-1', 'dificuldade': 'facil', 'request_id': 'safe-feedback'}, token, {})
            first, second = attempt['perguntas'][:2]
            self.assertEqual(set(first), {'id', 'Id_Questao', 'pergunta', 'opcoes', 'topico'})
            self.assertEqual(attempt['respostas'], [])
            _, feedback = service.dispatch('POST', '/api/resposta', {'tentativa_id': attempt['id'], 'Id_Questao': first['Id_Questao'], 'alternativa_escolhida': 0}, token, {})
            self.assertIn(feedback['letraCorreta'], 'ABCD')
            self.assertIn('explicacao', feedback)
            _, restored = service.dispatch('GET', '/api/tentativas/' + attempt['id'], {}, token, {})
            self.assertEqual([a['id'] for a in restored['respostas']], [first['id']])
            for question in restored['perguntas']:
                self.assertNotIn('correta', question)
                self.assertNotIn('alternativa_correta', question)
                self.assertNotIn('letraCorreta', question)
                self.assertNotIn('explicacao', question)
            _, payload = service.dispatch('GET', '/api/tentativas/' + attempt['id'] + '/respostas.csv', {}, token, {})
            rows = list(csv.DictReader(io.StringIO(payload.decode('utf-8-sig')), delimiter=';'))
            self.assertEqual(len(rows), 1)
            self.assertNotIn(second['id'], [row['pergunta_id'] for row in rows])


@unittest.skipUnless(os.getenv('MEW_TEST_NEON') == '1', 'Teste remoto opcional: MEW_TEST_NEON=1.')
class LiveNeonTests(unittest.TestCase):
    def test_real_connection_pool_and_health(self):
        from dotenv import dotenv_values
        from backend.postgres import PostgresRepository
        root = Path(__file__).resolve().parent.parent
        repo = PostgresRepository(dotenv_values(root / '.env')['DATABASE_URL'])
        try:
            repo.check_health()
            service = Service(repo, SITE, 'test-admin-key-with-24-characters')
            self.assertEqual(service.dispatch('GET', '/api/health', {}, '', {}), (200, {'status': 'ok', 'armazenamento': 'postgresql'}))
            self.assertEqual(len(service.quizzes), 10)
        finally:
            repo.close()

    def test_real_database_roundtrip_with_rollback(self):
        # Todos os inserts são desfeitos no final, sem criar usuários de teste
        # permanentes ou apagar qualquer registro já existente no banco.
        from dotenv import dotenv_values
        import psycopg
        from psycopg.rows import dict_row
        from backend.postgres import PostgresRepository

        class RollbackRepository(PostgresRepository):
            def __init__(self, url):
                self.conn = psycopg.connect(url, row_factory=dict_row, connect_timeout=15, prepare_threshold=None)
                self.lock = threading.RLock()
                self.conn.execute('SELECT 1')  # abre transação externa

            @contextmanager
            def connection(self):
                with self.lock, self.conn.transaction():
                    yield self.conn

            def close(self):
                self.conn.rollback()
                self.conn.close()

        root = Path(__file__).resolve().parent.parent
        url = dotenv_values(root / '.env').get('DATABASE_URL')
        self.assertTrue(url, 'Configure .env antes de executar o teste remoto.')
        repo = RollbackRepository(url)
        try:
            service = Service(repo, SITE, 'test-admin-key-with-24-characters')
            self.assertEqual(sum(len(quiz[level]) for quiz in service.quizzes.values() for level in ('facil','intermediario','dificil')), 300)
            from uuid import uuid4
            credentials = {'nome': 'Teste de cadastro', 'email': f'neon-{uuid4().hex}@example.com', 'senha': 'Senha longa no Neon de teste!'}
            status, session = service.dispatch('POST', '/api/cadastro', credentials, '', {})
            self.assertEqual(status, 201)
            token = session['token']
            body = {'especie_id': 'pe-1', 'dificuldade': 'facil', 'request_id': 'neon-rollback-test'}
            _, attempt = service.dispatch('POST', '/api/tentativas', body, token, {})
            retry_status, retry = service.dispatch('POST', '/api/tentativas', body, token, {})
            self.assertEqual(retry_status, 200)
            self.assertEqual(retry['id'], attempt['id'])
            self.assertNotIn('"explicacao"', json.dumps(attempt))
            self.assertNotIn('"correta"', json.dumps(attempt))
            private = {q['id']: q for q in service.quizzes['pe-1']['facil']}
            for index, question in enumerate(attempt['perguntas']):
                choice = private[question['id']]['correta']
                if index == 4:
                    choice = (choice + 1) % 4
                body = {'tentativa_id': attempt['id'], 'Id_Questao': question['Id_Questao'], 'alternativa_escolhida': choice}
                status, answer = service.dispatch('POST', '/api/resposta', body, token, {})
                self.assertEqual(status, 201)
                self.assertEqual(answer['letraCorreta'], chr(65 + private[question['id']]['correta']))
                _, again = service.dispatch('POST', '/resposta', body, token, {})
                self.assertEqual(again, answer)
            status, result = service.dispatch('POST', '/api/tentativas/' + attempt['id'] + '/finalizar', {}, token, {})
            self.assertEqual(status, 200)
            self.assertEqual(result['acertos'], 4)
            self.assertTrue(result['selo']['conquistado'])
            _, recommendations = service.dispatch('GET', '/api/participantes/me/recomendacoes', {}, token, {})
            self.assertEqual(recommendations['respostas_analisadas'], 5)
            self.assertTrue(all(r['dificuldade'] == 'intermediario' for r in recommendations['recomendacoes']))
            state = repo.snapshot()
            attempt_data = state['attempts'][attempt['id']]
            match_id = attempt_data['_db_match_id']
            saved = repo.conn.execute('SELECT * FROM public.resposta_usuario WHERE id_partida=%s ORDER BY id_resposta_usuario', (match_id,)).fetchall()
            self.assertEqual(len(saved), 5)
            self.assertTrue(all(1 <= a['resposta_usuario'] <= 4 and 1 <= a['letra_correta_apresentada'] <= 4 for a in saved))
            self.assertEqual(sum(a['acerto_erro'] for a in saved), 4)
            score = repo.conn.execute('SELECT pontuacao_usuario FROM public.usuario WHERE id_usuario=%s', (state['participants'][session['id']]['_db_user_id'],)).fetchone()['pontuacao_usuario']
            self.assertEqual(score, 4)
            saved_user = repo.conn.execute('SELECT nome,email,senha FROM public.usuario WHERE id_usuario=%s',
                (state['participants'][session['id']]['_db_user_id'],)).fetchone()
            self.assertEqual(saved_user['email'], credentials['email'])
            self.assertTrue(saved_user['senha'].startswith('scrypt$'))
            self.assertNotIn(credentials['senha'], saved_user['senha'])
            # Nova instância do serviço reconstrói a sessão e o resultado do SQL.
            reloaded = Service(repo, SITE, 'test-admin-key-with-24-characters')
            _, restored = reloaded.dispatch('GET', '/api/tentativas/' + attempt['id'], {}, token, {})
            self.assertEqual(restored['resultado'], result)
            _, another_device = reloaded.dispatch('POST', '/api/login', credentials, '', {})
            self.assertEqual(another_device['id'], session['id'])
            self.assertEqual(another_device['usuario']['pontuacao'], 4)
            reloaded.dispatch('POST', '/api/logout', {}, token, {})
            _, profile = reloaded.dispatch('GET', '/api/participantes/me', {}, another_device['token'], {})
            self.assertEqual(profile['pontuacao'], 4)
            _, payload = reloaded.dispatch('GET', '/api/tentativas/' + attempt['id'] + '/respostas.csv', {}, another_device['token'], {})
            self.assertEqual(len(list(csv.DictReader(io.StringIO(payload.decode('utf-8-sig')), delimiter=';'))), 5)
        finally:
            repo.close()


if __name__ == '__main__':
    unittest.main()
