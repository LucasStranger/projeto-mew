"""Servidor local sem dependências. Execute na raiz: python -m backend.server."""
import argparse
import json
import logging
import os
from pathlib import Path
import secrets
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, unquote, urlsplit

from .service import ApiError, Service
from .storage import JsonRepository

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "Site"
MAX_BODY = 16384


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(SITE), **kwargs)

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "same-origin")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):
        # Não registrar query string, cabeçalhos de autenticação ou corpos.
        logging.info("%s %s", self.command, urlsplit(self.path).path)

    def send_json(self, status, value):
        payload = json.dumps(value, ensure_ascii=False, allow_nan=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def api(self):
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
            token = authorization[7:] if authorization.startswith("Bearer ") else ""
            parsed = urlsplit(self.path)
            status, value = self.server.service.dispatch(self.command, parsed.path, body, token, parse_qs(parsed.query, keep_blank_values=True))
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
        except (BrokenPipeError, ConnectionResetError):
            pass
        except Exception:
            logging.exception("Falha interna da API")
            self.send_json(500, {"erro": {"codigo": "internal_error", "mensagem": "Não foi possível concluir. Tente novamente."}})

    def allowed_static(self):
        path = unquote(urlsplit(self.path).path)
        resolved = (SITE / path.lstrip("/")).resolve()
        if not resolved.is_relative_to(SITE.resolve()):
            return False
        if any(part.startswith(".") for part in Path(path).parts):
            return False
        if resolved.name.lower() == "quiz_perguntas.json":
            return False
        return resolved.is_file() or resolved == SITE.resolve()

    def do_GET(self):
        if urlsplit(self.path).path.startswith("/api/"):
            self.api()
        elif self.allowed_static():
            super().do_GET()
        else:
            self.send_error(404)

    def do_HEAD(self):
        if urlsplit(self.path).path.startswith("/api/") or not self.allowed_static():
            self.send_error(404)
        else:
            super().do_HEAD()

    def do_POST(self):
        if urlsplit(self.path).path.startswith("/api/"):
            self.api()
        else:
            self.send_error(404)


def create_server(host="127.0.0.1", port=8000, data_file=None, admin_token=None):
    data_file = Path(data_file or os.getenv("MEW_DATA_FILE", ROOT / "backend" / "data" / "mew.json"))
    if not admin_token:
        admin_token = os.getenv("MEW_ADMIN_TOKEN")
    if not admin_token:
        token_file = data_file.parent / "admin-token.txt"
        token_file.parent.mkdir(parents=True, exist_ok=True)
        if not token_file.exists():
            token_file.write_text(secrets.token_urlsafe(32), encoding="utf-8")
        admin_token = token_file.read_text(encoding="utf-8").strip()
    if len(admin_token) < 24:
        raise ValueError("A chave da equipe deve ter pelo menos 24 caracteres.")
    server = ThreadingHTTPServer((host, port), Handler)
    server.daemon_threads = True
    server.service = Service(JsonRepository(data_file), SITE, admin_token)
    return server


def main():
    parser = argparse.ArgumentParser(description="Projeto MEW — front e API no mesmo endereço")
    parser.add_argument("--host", default=os.getenv("MEW_HOST", "127.0.0.1"))
    parser.add_argument("--port", type=int, default=int(os.getenv("MEW_PORT", "8000")))
    parser.add_argument("--data-file", type=Path)
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    server = create_server(args.host, args.port, args.data_file)
    print(f"MEW disponível em http://{args.host}:{args.port}/", flush=True)
    print("Relatório da equipe: /relatorios.html. Chave em backend/data/admin-token.txt (ou MEW_ADMIN_TOKEN).", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
