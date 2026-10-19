import json
import logging
import os
import sys
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlsplit

# Adiciona a raiz do projeto ao sys.path para importar a pasta 'backend'
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.service import ApiError, Service
from backend.storage import AccountConflict, StorageUnavailable
from backend.config import ConfigurationError, database_url as configured_database_url, load_environment
from backend.browser import browser_session, cookie_header, read_cookie, secure_cookie_setting, verify_browser_post
from backend.postgres import PostgresRepository

MAX_BODY = 16384

# Inicialização do Serviço (roda quando o Vercel "acorda" a função)
load_environment()
url = configured_database_url()

if not url:
    raise RuntimeError("A variável DATABASE_URL não está configurada no Vercel.")

# Conecta ao Neon
repository = PostgresRepository(url)
admin_token = os.getenv("MEW_ADMIN_TOKEN")

if not admin_token:
    raise RuntimeError("A variável MEW_ADMIN_TOKEN não está configurada no Vercel.")

# Caminho para a pasta Site (necessário para carregar o fauna_pe.json)
SITE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Site')
service = Service(repository, SITE_DIR, admin_token)
cookie_secure = secure_cookie_setting()

class handler(BaseHTTPRequestHandler):
    def end_headers(self):
        if getattr(self, '_session_cookie', None):
            self.send_header('Set-Cookie', self._session_cookie)
            self._session_cookie = None
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "same-origin")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):
        logging.info("%s %s", self.command, urlsplit(self.path).path)

    def send_json(self, status, value):
        payload = json.dumps(value, ensure_ascii=False, allow_nan=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        self.handle_api()

    def do_POST(self):
        self.handle_api()

    def do_HEAD(self):
        self.handle_api()

    def handle_api(self):
        self._session_cookie = None
        try:
            body = {}
            if self.command == "POST":
                if self.headers.get("Transfer-Encoding"):
                    raise ApiError(400, "invalid_body", "Transfer-Encoding não suportado.")
                if self.headers.get_content_type() != "application/json":
                    raise ApiError(415, "invalid_content_type", "Envie application/json.")
                try:
                    length = int(self.headers.get("Content-Length", "0"))
                except ValueError:
                    raise ApiError(400, "invalid_body", "Tamanho de corpo inválido.")
                if not 0 < length <= MAX_BODY:
                    raise ApiError(413, "invalid_body", "Corpo ausente ou acima de 16 KB.")
                try:
                    body = json.loads(self.rfile.read(length).decode("utf-8"))
                except (ValueError, UnicodeError):
                    raise ApiError(400, "invalid_json", "JSON inválido.")
                if not isinstance(body, dict):
                    raise ApiError(400, "invalid_json", "Envie um objeto JSON.")
            
            authorization = self.headers.get("Authorization", "")
            bearer = authorization[7:] if authorization.startswith("Bearer ") else ""
            cookie = read_cookie(self.headers)
            browser_client = not bearer and (self.headers.get('X-MEW-Client') == 'browser' or bool(cookie))
            token = bearer or cookie
            parsed = urlsplit(self.path)
            
            if self.command == 'POST' and browser_client:
                verify_browser_post(self.headers, cookie, cookie_secure)
                if parsed.path not in ('/api/login', '/api/cadastro', '/api/participantes'):
                    if not self.headers.get('X-MEW-Participant'):
                        raise ApiError(409, 'session_changed', 'Atualize a página para confirmar a conta atual.')
            
            if self.command == 'GET' and parsed.path == '/api/sessao':
                if not cookie:
                    self.send_json(200, {'id': None, 'cadastrado': False, 'usuario': None, 'csrf_token': None})
                    return
                try:
                    _, profile = service.dispatch('GET', '/api/participantes/me', {}, cookie, {})
                except ApiError as error:
                    if error.status != 401:
                        raise
                    self._session_cookie = cookie_header('', cookie_secure)
                    self.send_json(200, {'id': None, 'cadastrado': False, 'usuario': None, 'csrf_token': None})
                    return
                self.send_json(200, browser_session(profile, cookie))
                return
            
            if browser_client and self.command == 'POST' and parsed.path == '/api/cadastro' and cookie:
                _, profile = service.dispatch('GET', '/api/participantes/me', {}, cookie, {})
                if profile['cadastrado']:
                    token = ''
            
            status, value = service.dispatch(self.command, parsed.path, body, token,
                parse_qs(parsed.query, keep_blank_values=True), client_ip=self.client_address[0],
                expected_participant=self.headers.get('X-MEW-Participant') if browser_client else None)
            
            if browser_client and self.command == 'POST' and parsed.path in ('/api/login', '/api/cadastro', '/api/participantes'):
                fresh_token = value['token']
                _, profile = service.dispatch('GET', '/api/participantes/me', {}, fresh_token, {})
                self._session_cookie = cookie_header(fresh_token, cookie_secure)
                value = browser_session(profile, fresh_token, value.get('expira_em'))
            elif browser_client and parsed.path == '/api/logout':
                self._session_cookie = cookie_header('', cookie_secure)
            
            if isinstance(value, bytes):
                self.send_response(status)
                self.send_header("Content-Type", "text/csv; charset=utf-8")
                self.send_header("Content-Disposition", 'attachment; filename="mew-respostas.csv"')
                self.send_header("Content-Length", str(len(value)))
                self.end_headers()
                self.wfile.write(value)
            else:
                self.send_json(status, value)
                
        except ApiError as error:
            self.send_json(error.status, {"erro": {"codigo": error.code, "mensagem": error.message}})
        except AccountConflict as error:
            self.send_json(409, {'erro': {'codigo': 'registration_conflict', 'mensagem': str(error)}})
        except StorageUnavailable as error:
            logging.warning('Solicitação não concluída: banco indisponível.')
            self.send_json(503, {'erro': {'codigo': 'database_unavailable', 'mensagem': str(error)}})
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            pass
        except Exception:
            logging.exception("Falha interna da API")
            self.send_json(500, {"erro": {"codigo": "internal_error", "mensagem": "Não foi possível concluir. Tente novamente."}})