"""python -m backend.migrate: aplica apenas complementos aditivos da API."""
from pathlib import Path
import sys

from .config import ConfigurationError, database_url, load_environment

LOCK_KEY = 713430001


def migrate(url):
    import psycopg
    try:
        with psycopg.connect(url, connect_timeout=15, prepare_threshold=None) as conn:
            conn.execute('SET LOCAL statement_timeout = 30000')
            conn.execute('SELECT pg_advisory_xact_lock(%s)', (LOCK_KEY,))
            exists = conn.execute("SELECT to_regclass('mew_api.migration')").fetchone()[0]
            applied = {row[0] for row in conn.execute('SELECT version FROM mew_api.migration')} if exists else set()
            # Verificação anterior a qualquer escrita: o banco da equipe é obrigatório.
            for table in ('usuario', 'partida', 'resposta_usuario', 'questao', 'topico'):
                if conn.execute('SELECT to_regclass(%s)', ('public.' + table,)).fetchone()[0] is None:
                    raise ConfigurationError('As tabelas esperadas da equipe não foram encontradas no banco.')
            changed = False
            for source in sorted((Path(__file__).parent / 'migrations').glob('*.sql')):
                version = int(source.name.split('_', 1)[0])
                if version not in applied:
                    conn.execute(source.read_text(encoding='utf-8'), prepare=False)
                    changed = True
        return changed
    except psycopg.Error:
        raise ConfigurationError('Não foi possível aplicar a migração. Confira a conexão e as permissões do banco.') from None


def main():
    try:
        load_environment()
        url = database_url()
        if not url:
            raise ConfigurationError('Configure DATABASE_URL no .env antes de executar a migração.')
        print('Complementos do banco aplicados.' if migrate(url) else 'Banco já está atualizado.')
    except ConfigurationError as error:
        print(str(error), file=sys.stderr)
        raise SystemExit(1)


if __name__ == '__main__':
    main()
