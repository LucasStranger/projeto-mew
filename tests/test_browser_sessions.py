"""Contrato HTTP do navegador: cookie, CSRF, troca de conta e logout."""
from http.cookiejar import CookieJar
import json
from pathlib import Path
import tempfile
import threading
import unittest
from urllib.error import HTTPError
from urllib.request import build_opener, HTTPCookieProcessor, Request

from backend.browser import cookie_header
from backend.server import create_server

PASSWORD = 'Senha longa dos testes de cookie!'


class BrowserSessionTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.server = create_server(port=0, data_file=Path(self.tmp.name) / 'state.json',
                                    admin_token='admin-cookie-test-with-24-characters', cookie_secure=False)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.base = f'http://127.0.0.1:{self.server.server_port}'
        self.cookies = CookieJar()
        self.opener = build_opener(HTTPCookieProcessor(self.cookies))

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()
        self.tmp.cleanup()

    def call(self, method, path, body=None, csrf=True, owner=True, origin=None, client=True, bearer=None):
        headers = {'X-MEW-Client': 'browser'} if client else {}
        if bearer:
            headers['Authorization'] = 'Bearer ' + bearer
        if origin is not None:
            headers['Origin'] = origin
        if method == 'POST':
            meta = self.call('GET', '/api/sessao')[1] if csrf is True or owner is True else {}
            csrf_value = meta.get('csrf_token') if csrf is True else csrf
            owner_value = meta.get('id') if owner is True else owner
            if csrf_value:
                headers['X-CSRF-Token'] = csrf_value
            if owner_value:
                headers['X-MEW-Participant'] = owner_value
            headers['Content-Type'] = 'application/json'
        request = Request(self.base + path, method=method, headers=headers,
                          data=json.dumps(body or {}).encode() if method == 'POST' else None)
        try:
            response = self.opener.open(request, timeout=10)
        except HTTPError as error:
            response = error
        with response:
            return response.status, json.loads(response.read()), response.headers

    def signup(self, email='cookie@example.com'):
        status, session, headers = self.call('POST', '/api/cadastro',
            {'nome': 'Conta de teste', 'email': email, 'senha': PASSWORD})
        self.assertEqual(status, 201)
        return session, headers

    def test_cookie_is_httponly_and_json_never_returns_auth_token(self):
        session, headers = self.signup()
        cookie = headers['Set-Cookie']
        self.assertIn('HttpOnly', cookie)
        self.assertIn('SameSite=Strict', cookie)
        self.assertIn('Path=/', cookie)
        self.assertNotIn('token', session)
        self.assertEqual(len(session['csrf_token']), 64)
        _, restored, _ = self.call('GET', '/api/sessao')
        self.assertEqual(restored['id'], session['id'])
        self.assertEqual(restored['csrf_token'], session['csrf_token'])
        self.assertNotIn('token', restored)
        self.assertIn('Secure', cookie_header('example', secure=True))

    def test_csrf_and_origin_are_required_without_writing_an_attempt(self):
        self.signup()
        body = {'especie_id': 'pe-1', 'dificuldade': 'facil', 'request_id': 'csrf-test'}
        for options in ({'csrf': False}, {'csrf': 'incorrect'}, {'csrf': 'é'*64},
                        {'origin': 'https://other.example'}, {'client': False}):
            status, error, _ = self.call('POST', '/api/tentativas', body, **options)
            self.assertEqual(status, 403)
            self.assertEqual(error['erro']['codigo'], 'csrf_failed')
        self.assertFalse(self.server.service.repository.snapshot()['attempts'])
        self.assertEqual(self.call('POST', '/api/tentativas', body, origin=self.base)[0], 201)

    def test_stale_tab_cannot_mutate_or_logout_the_new_account(self):
        first, _ = self.signup()
        second, _ = self.signup('second-cookie@example.com')
        self.assertNotEqual(first['id'], second['id'])
        for path, body in (('/api/logout', {}), ('/api/eventos', {'especie_id': 'pe-1', 'tipo': 'hotspot'}),
                           ('/api/tentativas', {'especie_id': 'pe-1', 'dificuldade': 'facil', 'request_id': 'stale'})):
            status, error, _ = self.call('POST', path, body, owner=first['id'])
            self.assertEqual(status, 409)
            self.assertEqual(error['erro']['codigo'], 'session_changed')
        self.assertEqual(self.call('GET', '/api/sessao')[1]['id'], second['id'])
        state = self.server.service.repository.snapshot()
        self.assertFalse(state['events'])
        self.assertFalse(state['attempts'])

    def test_logout_revokes_cookie_session_and_bearer_token(self):
        self.signup()
        token = next(cookie.value for cookie in self.cookies if cookie.name == 'mew_session')
        status, value, headers = self.call('POST', '/api/logout')
        self.assertEqual((status, value), (200, {'encerrado': True}))
        self.assertIn('Max-Age=0', headers['Set-Cookie'])
        self.assertIsNone(self.call('GET', '/api/sessao')[1]['id'])
        self.assertEqual(self.call('GET', '/api/participantes/me', client=False, bearer=token)[0], 401)

    def test_cross_origin_login_cannot_replace_the_browser_account(self):
        session, _ = self.signup()
        status, error, _ = self.call('POST', '/api/login', {'email': 'cookie@example.com', 'senha': PASSWORD},
                                    origin='https://other.example')
        self.assertEqual(status, 403)
        self.assertEqual(self.call('GET', '/api/sessao')[1]['id'], session['id'])


if __name__ == '__main__':
    unittest.main()
