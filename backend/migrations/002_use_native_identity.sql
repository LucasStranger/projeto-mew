-- Usa os IDs GENERATED ALWAYS da equipe. Remove apenas os geradores
-- auxiliares criados pela versão 001 da própria API, sem CASCADE.
DROP SEQUENCE IF EXISTS mew_api.usuario_id_seq;
DROP SEQUENCE IF EXISTS mew_api.partida_id_seq;
DROP SEQUENCE IF EXISTS mew_api.resposta_id_seq;
INSERT INTO mew_api.migration(version) VALUES (2) ON CONFLICT DO NOTHING;
