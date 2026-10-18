# Contrato da API MEW

Base local: `http://127.0.0.1:8000/api`. O mesmo servidor entrega o site na raiz.
Sem CORS: front e API usam a mesma origem. Corpos POST são objetos JSON com
`Content-Type: application/json`, até 16 KB. Horários são ISO 8601 em UTC.

## Identificação

`POST /participantes` com `{}` cria um participante anônimo e retorna HTTP 201:

```json
{"id":"UUID", "token":"TOKEN_ALEATORIO"}
```

Enviar `Authorization: Bearer TOKEN_ALEATORIO` nas rotas privadas. A identificação
fica no navegador; não existe login por nome ou e-mail. Uma chave de participante
não autoriza acesso aos dados de outro participante. Guarde o token, pois a API
não oferece recuperação. O armazenamento persiste somente seu hash.

## Rotas

| Método | Rota após /api | Autorização | Resultado |
|---|---|---|---|
| GET | `/health` | Pública | Status e armazenamento |
| GET | `/especies` | Pública | Objeto com `especies_ameacadas` |
| GET | `/especies/:id` | Pública | Dados do animal e `niveis` disponíveis |
| POST | `/participantes` | Pública | Novo ID e token |
| GET | `/participantes/me` | Participante | ID e data de criação |
| GET | `/participantes/me/historico` | Participante | `tentativas`, da mais recente para a mais antiga |
| GET | `/participantes/me/recomendacoes` | Participante | Motor, método, perfil por tópico e três sugestões |
| POST | `/eventos` | Participante | Registro de navegação |
| POST | `/tentativas` | Participante | Tentativa com cinco perguntas sem gabarito |
| GET | `/tentativas/:id` | Dono | Estado, perguntas, respostas já enviadas e resultado se concluída |
| POST | `/tentativas/:id/respostas` | Dono | Correção e explicação da resposta enviada |
| POST | `/tentativas/:id/finalizar` | Dono | Nota, tópicos e selo persistente |
| GET | `/tentativas/:id/respostas.csv` | Dono | CSV das respostas desta tentativa |
| GET | `/exportacoes/respostas.csv` | Chave da equipe | CSV geral, com filtros opcionais |

IDs de espécie são `pe-1` a `pe-10`. Dificuldades são `facil`, `intermediario`,
`dificil`. IDs de perguntas são os IDs originais, por exemplo `pe1-f1`.

## Iniciar tentativa

`POST /tentativas`:

```json
{"especie_id":"pe-1", "dificuldade":"facil", "request_id":"UUID_GERADO_PELO_CLIENTE"}
```

`request_id` deve ter de 1 a 100 caracteres e ser novo para cada intenção de
iniciar um desafio. Repetir a mesma requisição retorna a tentativa anterior
(HTTP 200); uma criação nova retorna 201. Reutilizar o ID com outra espécie ou
dificuldade retorna 409. Esse comportamento evita duplicação se a conexão cair.

Exemplo de resposta, abreviado para uma pergunta:

```json
{
  "id":"UUID_DA_TENTATIVA",
  "especie_id":"pe-1",
  "dificuldade":"facil",
  "status":"em_andamento",
  "iniciada_em":"2026-10-16T23:00:00+00:00",
  "finalizada_em":null,
  "perguntas":[{"id":"pe1-f1","pergunta":"Enunciado","opcoes":["A","B","C","D"],"topico":"bioma"}],
  "respostas":[],
  "resultado":null
}
```

Cada tentativa tem cinco perguntas sem repetição, sorteadas das dez do nível.
Guarde seu ID para retomada. A API guarda snapshots privados completos das cinco
perguntas; mudanças posteriores no arquivo editorial não alteram essa tentativa.

## Responder

`POST /tentativas/:id/respostas`:

```json
{"pergunta_id":"pe1-f1", "alternativa_escolhida":1}
```

As alternativas são inteiros de **0 a 3**, correspondentes à ordem devolvida.
Booleanos e números fora desse intervalo são rejeitados. Retorno HTTP 201:

```json
{
  "id":"pe1-f1",
  "topico":"bioma",
  "escolha":1,
  "acertou":true,
  "correta":1,
  "explicacao":"Explicação do conteúdo",
  "respondida_em":"2026-10-16T23:01:00+00:00"
}
```

Reenviar a mesma escolha retorna o mesmo registro com 200. Tentar mudar a escolha
retorna 409. Perguntas fora da tentativa retornam 400. Campos extras de pontuação
ou gabarito enviados pelo cliente não influenciam a correção. Cada resposta é
persistida antes da confirmação; não é preciso esperar o final para salvar.

`GET /tentativas/:id` permite reconstituir a tela e continuar nas perguntas não
respondidas. O gabarito e a explicação aparecem apenas nas respostas já enviadas.

## Finalizar e emitir selo

`POST /tentativas/:id/finalizar` com `{}`. Só é permitido após cinco respostas:

```json
{
  "tentativa_id":"UUID",
  "acertos":4,
  "total":5,
  "percentual":0.8,
  "topicos":{"bioma":{"acertos":1,"total":1}},
  "selo":{"conquistado":true,"nome":"Analista Ambiental","id":"MEW-UUID","emitido_em":"2026-10-16T23:05:00+00:00"}
}
```

O selo exige percentual maior ou igual a 0,7. Caso não seja conquistado, `id` e
`emitido_em` são nulos. A finalização é idempotente: repetir mantém a mesma data,
nota e credencial, sem gerar uma conquista nova. A credencial é uma conquista
interna do quiz, identificada pela tentativa; não há certificação externa.

## Navegação e recomendações

`POST /eventos`:

```json
{"especie_id":"pe-1","tipo":"visualizacao_especie"}
```

Tipos aceitos: `visualizacao_especie`, `exploracao_3d`, `hotspot`. O front atual
registra detalhes e exploração 3D. São mantidos até mil eventos por participante;
as respostas não são descartadas por esse limite.

`GET /participantes/me/recomendacoes` retorna:

```json
{
  "motor":"cpp",
  "metodo":"conteudo_cosseno",
  "respostas_analisadas":5,
  "taxa_acertos":0.8,
  "topicos":{"bioma":{"acertos":1,"total":1}},
  "recomendacoes":[{"especie_id":"pe-2","nome":"Tamanduá-bandeira","dificuldade":"intermediario","pontuacao":0.9,"topico_foco":"habitat","motivo":"Reforce este tema em uma dificuldade ajustada ao seu último resultado."}]
}
```

O exemplo abrevia listas e tópicos. Sem respostas, `taxa_acertos` é nula.
`motor` identifica C++, Python sem executável ou fallback após falha do binário.
Os critérios completos estão em `RECOMENDADOR.md`.

## CSV da equipe

Usa o mesmo cabeçalho Bearer, mas com `MEW_ADMIN_TOKEN` ou a chave criada no
arquivo `backend/data/admin-token.txt`. A chave não deve ir para código do front,
URLs ou Git. Filtros opcionais: `?especie_id=pe-1&dificuldade=facil`.

O retorno tem `Content-Type: text/csv; charset=utf-8` e `Content-Disposition`
de download. UTF-8 com BOM, delimitador `;`, uma linha por resposta. Campos:

`participante_id, tentativa_id, especie_id, especie, dificuldade, status,
iniciada_em, finalizada_em, pergunta_id, enunciado, topico, alternativa_escolhida,
texto_escolhido, alternativa_correta, texto_correto, acertou, respondida_em`.

Tentativas incompletas também entram, com status `em_andamento`; datas de fim
ficam vazias. `acertou` é 0 ou 1. Nenhuma resposta significa apenas o cabeçalho.

## Erros

```json
{"erro":{"codigo":"invalid_choice","mensagem":"Escolha uma alternativa entre 0 e 3."}}
```

| Código HTTP | Significado |
|---|---|
| 400 | JSON, campos, pergunta ou filtro inválido |
| 401 | Token ausente ou inválido |
| 404 | Espécie, tentativa ou rota inexistente; também tentativa de outra pessoa |
| 409 | Resposta já enviada com outra escolha, tentativa incompleta ou request_id conflitante |
| 413 | Corpo ausente ou maior que 16 KB |
| 415 | Content-Type diferente de application/json |
| 500 | Falha interna; cliente pode reenviar uma operação idempotente |

O servidor nunca retorna stack traces ou caminhos internos nos erros JSON.
Os arquivos de persistência ficam fora da pasta servida. O JSON de perguntas
editoriais também é bloqueado para download, inclusive via HEAD.
