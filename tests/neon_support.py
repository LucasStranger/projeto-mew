"""Repositório de testes: usa PostgreSQL real sem confirmar os dados de teste."""
from contextlib import contextmanager
import threading

import psycopg
from psycopg.rows import dict_row

from backend.postgres import PostgresRepository


class RollbackPostgresRepository(PostgresRepository):
    def __init__(self, url):
        self.conn = psycopg.connect(url, row_factory=dict_row, connect_timeout=15, prepare_threshold=None)
        self.lock = threading.RLock()
        self.conn.execute('SELECT 1')

    @contextmanager
    def connection(self):
        with self.lock, self.conn.transaction():
            yield self.conn

    def close(self):
        self.conn.rollback()
        self.conn.close()
