# Integração do banco definitivo

A persistência JSON é temporária. O front usa somente HTTP e não precisa conhecer
a tecnologia do banco escolhido pela equipe.

## Ponto de substituição

`backend/storage.py` define `Repository` com dois métodos:

- `transaction()`: context manager que fornece um estado mutável; confirma todas
  as mudanças ao sair sem exceção e desfaz todas ao sair com erro.
- `snapshot()`: devolve uma cópia consistente do estado, sem permitir alteração
  indireta do armazenamento.

`create_server()` em `backend/server.py` instancia o repositório. Substitua ali
`JsonRepository` pelo adaptador do banco. A implementação SQL pode inicialmente
hidratar o estado e aplicar o delta dentro de uma transação real, preservando o
contrato. Para grandes volumes, evolua a interface para consultas específicas por
participante e tentativa, mantendo o contrato HTTP de `docs/API.md`.

O estado tem `schema_version: 1`, `participants` e `attempts` indexados por UUID,
e uma lista `events`. Veja os campos exatos em `backend/service.py`; o JSON real
de desenvolvimento também pode ser usado como exemplo, sem publicar seus tokens.

## Relações sugeridas

| Relação | Chave e campos |
|---|---|
| participantes | UUID, hash SHA-256 do token aleatório, criado_em |
| especies | ID textual estável, nome e metadados do catálogo |
| perguntas | ID atual do JSON, espécie, dificuldade, tópico, enunciado, opções, gabarito, explicação, versão |
| tentativas | UUID, participante, request_id, espécie, dificuldade, status, início, fim |
| tentativa_perguntas | tentativa, posição, ID da pergunta, snapshot completo da pergunta usada |
| respostas | tentativa, ID da pergunta, escolha, acerto, tópico, horário |
| eventos | participante, espécie, tipo e horário |

Catálogo inicial: `Site/fauna_pe.json`. Banco inicial de perguntas:
`Site/quiz_perguntas.json`. O segundo arquivo é uma fonte privada do servidor;
o servidor bloqueia seu download pelo navegador. Use esses arquivos como seeds
e mantenha IDs e associação das espécies. Os arquivos GLB e imagens continuam
como arquivos estáticos, não precisam ser inseridos como binários no banco.

O backend atual carrega catálogo e perguntas desses seeds ao iniciar. Quando
forem migrados para tabelas, substitua também a leitura em `Service.__init__`
por consultas do adaptador. Preservar apenas as tentativas no banco já é uma
primeira integração válida; conteúdo editorial pode continuar versionado em JSON.

## Garantias necessárias

- Constraint única `(participante_id, request_id)` para criação idempotente.
- Constraint única `(tentativa_id, pergunta_id)` para cada resposta.
- Bloqueio da tentativa ou transação serializável para resposta e finalização.
- Verificação de que a tentativa pertence ao participante autenticado.
- Verificação de que a pergunta pertence ao snapshot da tentativa.
- Reenvio da mesma escolha retorna a resposta anterior; outra escolha retorna 409.
- Gabarito, acerto, pontuação e selo calculados no servidor.
- Finalização somente com cinco respostas; nova finalização mantém data e selo.
- Snapshot das perguntas imutável: editar o seed não muda uma prova já iniciada.
- Não armazenar o token do participante em texto puro; o navegador recebe um token
  aleatório de 256 bits e o armazenamento guarda somente seu hash.
- Consultas e exportações devem continuar isoladas por participante; relatório
  geral exige a chave da equipe.

## Migração dos dados da demonstração

Pare a API, faça backup de `backend/data`, importe os UUIDs originais e mantenha
`token_hash`, `request_id`, snapshots e datas. Use uma transação para a migração.
Preservar os hashes permite que os participantes continuem usando suas sessões.
Execute a suíte de testes contra o novo adaptador antes de trocar o armazenamento.

Não há conexão fictícia nem credenciais de banco no projeto. URL de conexão,
driver, migrations e deploy ficam para a integração com o banco escolhido.
