"""Configuração local, sem sobrescrever variáveis do ambiente de hospedagem."""
import os
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

ROOT = Path(__file__).resolve().parent.parent


class ConfigurationError(RuntimeError):
    pass


def load_environment(path=None):
    from dotenv import load_dotenv
    load_dotenv(path or ROOT / '.env', override=False, interpolate=False)


def database_url():
    value = os.getenv('DATABASE_URL', '').strip()
    if not value:
        return None
    try:
        parsed = urlsplit(value)
        options = parse_qs(parsed.query)
        valid = parsed.scheme in ('postgres', 'postgresql') and parsed.hostname and parsed.username and parsed.path.strip('/')
        secure = options.get('sslmode', [''])[0] in ('require', 'verify-ca', 'verify-full')
    except ValueError:
        valid = secure = False
    if not valid or not secure:
        raise ConfigurationError('DATABASE_URL inválida. Configure uma conexão PostgreSQL com SSL no .env.')
    return value
