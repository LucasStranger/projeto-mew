-- Cadastro usa nome, email e senha (hash) já existentes na tabela da equipe.
ALTER TABLE mew_api.participante ADD COLUMN IF NOT EXISTS registered_at timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS usuario_email_normalizado_key
    ON public.usuario (lower(btrim(email)));

CREATE TABLE IF NOT EXISTS mew_api.sessao (
    id uuid PRIMARY KEY,
    participante_id uuid NOT NULL REFERENCES mew_api.participante(id),
    token_hash text NOT NULL UNIQUE CHECK (length(token_hash)=64),
    created_at timestamptz NOT NULL,
    expires_at timestamptz NOT NULL CHECK (expires_at > created_at)
);
CREATE INDEX IF NOT EXISTS sessao_participante_idx ON mew_api.sessao(participante_id);
INSERT INTO mew_api.migration(version) VALUES (3) ON CONFLICT DO NOTHING;
