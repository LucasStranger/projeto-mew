import copy
import csv
import hashlib
import hmac
import io
import json
import secrets
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from .recommendations import LEVELS, recommend


def now():
    return datetime.now(timezone.utc).isoformat()


class ApiError(Exception):
    def __init__(self, status, code, message):
        self.status, self.code, self.message = status, code, message
        super().__init__(message)


def require(condition, status, code, message):
    if not condition:
        raise ApiError(status, code, message)


def digest(token):
    return hashlib.sha256(token.encode()).hexdigest()


class Service:
    def __init__(self, repository, site, admin_token):
        self.repository = repository
        self.admin_token = admin_token
        fauna = json.loads((Path(site) / "fauna_pe.json").read_text(encoding="utf-8"))
        self.catalog = {a["id"]: a for a in fauna["especies_ameacadas"]}
        self.quizzes = json.loads((Path(site) / "quiz_perguntas.json").read_text(encoding="utf-8"))
        for species_id, quiz in self.quizzes.items():
            if species_id not in self.catalog:
                raise ValueError("Quiz sem espécie cadastrada")
            for level in LEVELS:
                if not quiz.get(level):
                    raise ValueError("Quiz sem perguntas")
                for question in quiz[level]:
                    if not (len(question["opcoes"]) == 4 and type(question["correta"]) is int and 0 <= question["correta"] < 4):
                        raise ValueError("Pergunta inválida")

    def participant(self, data, token):
        require(isinstance(token, str) and 0 < len(token) <= 200, 401, "unauthorized", "Identificação ausente ou inválida.")
        hashed = digest(token)
        for participant in data["participants"].values():
            if hmac.compare_digest(participant["token_hash"], hashed):
                return participant
        raise ApiError(401, "unauthorized", "Identificação expirada ou inválida. Inicie uma nova sessão.")

    def own_attempt(self, data, attempt_id, participant):
        attempt = data["attempts"].get(attempt_id)
        require(attempt is not None and attempt["participant_id"] == participant["id"], 404, "not_found", "Tentativa não encontrada.")
        return attempt

    def public_attempt(self, attempt):
        return {"id": attempt["id"], "especie_id": attempt["especie_id"], "dificuldade": attempt["dificuldade"],
                "status": attempt["status"], "iniciada_em": attempt["started_at"], "finalizada_em": attempt["finished_at"],
                "perguntas": [{k: q[k] for k in ("id", "pergunta", "opcoes", "topico")} for q in attempt["questions"]],
                "respostas": list(attempt["answers"].values()), "resultado": self.result(attempt) if attempt["status"] == "concluida" else None}

    def result(self, attempt):
        answers = list(attempt["answers"].values())
        correct = sum(x["acertou"] for x in answers)
        total = len(attempt["questions"])
        topics = {}
        for answer in answers:
            item = topics.setdefault(answer["topico"], {"acertos": 0, "total": 0})
            item["total"] += 1
            item["acertos"] += int(answer["acertou"])
        awarded = correct / total >= .7
        return {"tentativa_id": attempt["id"], "acertos": correct, "total": total, "percentual": correct / total,
                "topicos": topics, "selo": {"conquistado": awarded, "nome": "Analista Ambiental",
                "id": "MEW-" + attempt["id"] if awarded else None, "emitido_em": attempt["finished_at"] if awarded else None}}

    def dispatch(self, method, path, body, token, query):
        parts = path.strip("/").split("/")
        if method == "GET" and path == "/api/health":
            return 200, {"status": "ok", "armazenamento": "json"}
        if method == "GET" and path == "/api/especies":
            return 200, {"estado": "Pernambuco", "pais": "Brasil", "especies_ameacadas": list(self.catalog.values())}
        if method == "GET" and len(parts) == 3 and parts[:2] == ["api", "especies"]:
            animal = self.catalog.get(parts[2])
            require(animal is not None, 404, "not_found", "Espécie não encontrada.")
            return 200, {**animal, "nome": animal["nome_popular"], "niveis": list(LEVELS)}
        if method == "POST" and path == "/api/participantes":
            token_value = secrets.token_urlsafe(32)
            participant = {"id": str(uuid4()), "token_hash": digest(token_value), "created_at": now()}
            with self.repository.transaction() as data:
                data["participants"][participant["id"]] = participant
            return 201, {"id": participant["id"], "token": token_value}

        if method == "GET" and path == "/api/exportacoes/respostas.csv":
            require(bool(token) and hmac.compare_digest(digest(token), digest(self.admin_token)), 401, "unauthorized", "Chave da equipe ausente ou inválida.")
            data = self.repository.snapshot()
            attempts = list(data["attempts"].values())
            for key in query:
                require(key in ("especie_id", "dificuldade"), 400, "invalid_filter", "Filtro desconhecido.")
            for key in ("especie_id", "dificuldade"):
                if key in query:
                    value = query[key][0]
                    require(value in (self.catalog if key == "especie_id" else LEVELS), 400, "invalid_filter", "Filtro inválido.")
                    attempts = [a for a in attempts if a[key] == value]
            return 200, self.csv(attempts)

        with self.repository.transaction() as data:
            participant = self.participant(data, token)
            pid = participant["id"]
            if method == "GET" and path == "/api/participantes/me":
                return 200, {"id": pid, "criado_em": participant["created_at"]}
            if method == "GET" and path == "/api/participantes/me/historico":
                attempts = sorted((a for a in data["attempts"].values() if a["participant_id"] == pid), key=lambda a: a["started_at"], reverse=True)
                return 200, {"tentativas": [{"id": a["id"], "especie_id": a["especie_id"], "dificuldade": a["dificuldade"], "status": a["status"],
                                            "iniciada_em": a["started_at"], "resultado": self.result(a) if a["status"] == "concluida" else None} for a in attempts]}
            if method == "GET" and path == "/api/participantes/me/recomendacoes":
                return 200, recommend(data, pid, self.catalog, self.quizzes)
            if method == "POST" and path == "/api/eventos":
                require(isinstance(body.get("tipo"), str) and body["tipo"] in ("visualizacao_especie", "exploracao_3d", "hotspot"), 400, "invalid_event", "Evento inválido.")
                require(isinstance(body.get("especie_id"), str) and body["especie_id"] in self.catalog, 400, "invalid_species", "Espécie inválida.")
                # Evita crescimento ilimitado das visitas; respostas nunca são descartadas.
                personal_events = [e for e in data["events"] if e["participant_id"] == pid]
                if len(personal_events) >= 1000:
                    data["events"].remove(personal_events[0])
                data["events"].append({"participant_id": pid, "especie_id": body["especie_id"], "tipo": body["tipo"], "created_at": now()})
                return 201, {"registrado": True}
            if method == "POST" and path == "/api/tentativas":
                species_id, level, request_id = body.get("especie_id"), body.get("dificuldade"), body.get("request_id")
                require(isinstance(species_id, str) and species_id in self.quizzes, 400, "invalid_species", "Espécie inválida.")
                require(isinstance(level, str) and level in LEVELS, 400, "invalid_level", "Dificuldade inválida.")
                require(isinstance(request_id, str) and 1 <= len(request_id) <= 100, 400, "invalid_request_id", "Informe um request_id de até 100 caracteres.")
                for existing in data["attempts"].values():
                    if existing["participant_id"] == pid and existing["request_id"] == request_id:
                        require(existing["especie_id"] == species_id and existing["dificuldade"] == level, 409, "request_conflict", "request_id já utilizado para outro desafio.")
                        return 200, self.public_attempt(existing)
                attempt = {"id": str(uuid4()), "participant_id": pid, "request_id": request_id, "especie_id": species_id,
                           "dificuldade": level, "started_at": now(), "finished_at": None, "status": "em_andamento",
                           "questions": copy.deepcopy(secrets.SystemRandom().sample(self.quizzes[species_id][level], 5)), "answers": {}}
                data["attempts"][attempt["id"]] = attempt
                return 201, self.public_attempt(attempt)
            if len(parts) in (3, 4) and parts[:2] == ["api", "tentativas"]:
                attempt = self.own_attempt(data, parts[2], participant)
                if method == "GET" and len(parts) == 3:
                    return 200, self.public_attempt(attempt)
                action = parts[3] if len(parts) == 4 else ""
                if method == "GET" and action == "respostas.csv":
                    return 200, self.csv([attempt])
                if method == "POST" and action == "respostas":
                    question_id, choice = body.get("pergunta_id"), body.get("alternativa_escolhida")
                    require(isinstance(question_id, str), 400, "invalid_question", "Pergunta inválida.")
                    require(type(choice) is int and 0 <= choice < 4, 400, "invalid_choice", "Escolha uma alternativa entre 0 e 3.")
                    question = next((q for q in attempt["questions"] if q["id"] == question_id), None)
                    require(question is not None, 400, "invalid_question", "Pergunta não pertence a esta tentativa.")
                    previous = attempt["answers"].get(question_id)
                    if previous:
                        require(previous["escolha"] == choice, 409, "already_answered", "Esta pergunta já foi respondida com outra alternativa.")
                        return 200, previous
                    require(attempt["status"] == "em_andamento", 409, "finished", "Tentativa já finalizada.")
                    answer = {"id": question_id, "topico": question["topico"], "escolha": choice,
                              "acertou": choice == question["correta"], "correta": question["correta"],
                              "explicacao": question["explicacao"], "respondida_em": now()}
                    attempt["answers"][question_id] = answer
                    return 201, answer
                if method == "POST" and action == "finalizar":
                    require(len(attempt["answers"]) == len(attempt["questions"]), 409, "incomplete", "Responda todas as perguntas antes de finalizar.")
                    if attempt["status"] != "concluida":
                        attempt["status"], attempt["finished_at"] = "concluida", now()
                    return 200, self.result(attempt)
            raise ApiError(404, "not_found", "Rota não encontrada.")

    def csv(self, attempts):
        output = io.StringIO(newline="")
        fields = ["participante_id", "tentativa_id", "especie_id", "especie", "dificuldade", "status", "iniciada_em", "finalizada_em",
                  "pergunta_id", "enunciado", "topico", "alternativa_escolhida", "texto_escolhido", "alternativa_correta", "texto_correto", "acertou", "respondida_em"]
        writer = csv.DictWriter(output, fieldnames=fields, delimiter=";")
        writer.writeheader()
        for attempt in sorted(attempts, key=lambda a: a["started_at"]):
            for question in attempt["questions"]:
                answer = attempt["answers"].get(question["id"])
                if not answer:
                    continue
                row = {"participante_id": attempt["participant_id"], "tentativa_id": attempt["id"], "especie_id": attempt["especie_id"],
                       "especie": self.catalog[attempt["especie_id"]]["nome_popular"], "dificuldade": attempt["dificuldade"], "status": attempt["status"],
                       "iniciada_em": attempt["started_at"], "finalizada_em": attempt["finished_at"], "pergunta_id": question["id"],
                       "enunciado": question["pergunta"], "topico": answer["topico"], "alternativa_escolhida": answer["escolha"],
                       "texto_escolhido": question["opcoes"][answer["escolha"]], "alternativa_correta": question["correta"],
                       "texto_correto": question["opcoes"][question["correta"]], "acertou": int(answer["acertou"]), "respondida_em": answer["respondida_em"]}
                # Texto exportado não deve se tornar fórmula ao abrir no Excel.
                writer.writerow({k: "'" + v if isinstance(v, str) and v.lstrip().startswith(("=", "+", "-", "@")) else v for k, v in row.items()})
        return output.getvalue().encode("utf-8-sig")
