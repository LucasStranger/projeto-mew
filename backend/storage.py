"""Adapter temporário. Um banco pode implementar a mesma transação atômica."""
import copy
import json
import os
import threading
from contextlib import contextmanager
from pathlib import Path
from typing import Protocol, ContextManager


class Repository(Protocol):
    def transaction(self) -> ContextManager[dict]: ...
    def snapshot(self) -> dict: ...


class JsonRepository:
    """Persistência para UM processo da API, inclusive com várias threads.

    Escritas usam arquivo temporário, fsync e replace. Se uma operação falhar,
    o estado em memória e o arquivo anterior permanecem intactos.
    """

    def __init__(self, path):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.lock = threading.RLock()
        self.state = {"schema_version": 1, "participants": {}, "attempts": {}, "events": []}
        if self.path.exists():
            # Não substituir silenciosamente um arquivo corrompido.
            self.state = json.loads(self.path.read_text(encoding="utf-8"))
            if self.state.get("schema_version") != 1:
                raise ValueError("Versão de armazenamento não suportada")

    @contextmanager
    def transaction(self):
        with self.lock:
            draft = copy.deepcopy(self.state)
            yield draft
            if draft != self.state:
                tmp = self.path.with_suffix(".tmp")
                try:
                    with tmp.open("w", encoding="utf-8") as file:
                        json.dump(draft, file, ensure_ascii=False, allow_nan=False)
                        file.flush()
                        os.fsync(file.fileno())
                    os.replace(tmp, self.path)
                finally:
                    tmp.unlink(missing_ok=True)
                self.state = draft

    def snapshot(self):
        with self.lock:
            return copy.deepcopy(self.state)
