-- Complementos da API. Não altera nem apaga as tabelas criadas pela equipe.
CREATE SCHEMA IF NOT EXISTS mew_api;

CREATE TABLE IF NOT EXISTS mew_api.migration (
    version integer PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE SEQUENCE IF NOT EXISTS mew_api.usuario_id_seq;
CREATE SEQUENCE IF NOT EXISTS mew_api.partida_id_seq;
CREATE SEQUENCE IF NOT EXISTS mew_api.resposta_id_seq;

CREATE TABLE IF NOT EXISTS mew_api.participante (
    id uuid PRIMARY KEY,
    id_usuario integer NOT NULL UNIQUE REFERENCES public.usuario(id_usuario),
    token_hash text NOT NULL UNIQUE CHECK (length(token_hash) = 64),
    created_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS mew_api.tentativa (
    id uuid PRIMARY KEY,
    participante_id uuid NOT NULL REFERENCES mew_api.participante(id),
    id_partida integer NOT NULL UNIQUE REFERENCES public.partida(id_partida),
    request_id varchar(100) NOT NULL,
    especie_id text NOT NULL,
    status text NOT NULL CHECK (status IN ('em_andamento', 'concluida')),
    questions jsonb NOT NULL CHECK (jsonb_typeof(questions) = 'array' AND jsonb_array_length(questions) = 5),
    finished_at timestamptz,
    UNIQUE (participante_id, request_id),
    CHECK ((status = 'concluida') = (finished_at IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS mew_api.evento (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    participante_id uuid NOT NULL REFERENCES mew_api.participante(id),
    especie_id text NOT NULL,
    tipo text NOT NULL CHECK (tipo IN ('visualizacao_especie', 'exploracao_3d', 'hotspot')),
    created_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS evento_participante_idx ON mew_api.evento(participante_id, id);

-- Inicializa os geradores sem reutilizar IDs já existentes.
SELECT setval('mew_api.usuario_id_seq', GREATEST((SELECT COALESCE(max(id_usuario), 0) FROM public.usuario), (SELECT last_value FROM mew_api.usuario_id_seq)), true);
SELECT setval('mew_api.partida_id_seq', GREATEST((SELECT COALESCE(max(id_partida), 0) FROM public.partida), (SELECT last_value FROM mew_api.partida_id_seq)), true);
SELECT setval('mew_api.resposta_id_seq', GREATEST((SELECT COALESCE(max(id_resposta_usuario), 0) FROM public.resposta_usuario), (SELECT last_value FROM mew_api.resposta_id_seq)), true);

INSERT INTO mew_api.migration(version) VALUES (1) ON CONFLICT DO NOTHING;
