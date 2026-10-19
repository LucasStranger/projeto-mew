# Banco PostgreSQL Neon

O backend usa o banco criado pela equipe quando `DATABASE_URL` está configurada.
A conexão real fica somente em `.env`, ignorado pelo Git. O arquivo
`.env.example` mostra o formato com placeholders. O front nunca recebe a conexão.

## Configuração

1. Criar um ambiente virtual Python e instalar `requirements.txt`.
2. Preencher `DATABASE_URL` no `.env`, mantendo `sslmode=require` e os parâmetros
   de segurança fornecidos pelo Neon.
3. Executar `python -m backend.migrate`.
4. Iniciar com `python -m backend.server` ou `iniciar.bat`.

O servidor imprime `Armazenamento: postgresql`. `GET /api/health` verifica a conexão
e retorna esse tipo de armazenamento. Sem conexão, a API devolve 503 com mensagem
genérica. Não há fallback silencioso para JSON. Variáveis definidas pela hospedagem
têm prioridade sobre o `.env`.

## Tabelas existentes da equipe

| Tabela | Uso implementado |
|---|---|
| `topico` | Nome do tópico associado a cada questão |
| `questao` | Fonte das 300 questões, quatro alternativas, gabarito e explicação |
| `usuario` | Nome, e-mail, senha protegida e pontuação acumulada |
| `partida` | Cada tentativa, nível e data de início |
| `resposta_usuario` | Escolha, gabarito apresentado, acerto, tempo e data de cada resposta |

A API não altera nem reimporta as questões. O catálogo descritivo e os caminhos
dos modelos 3D continuam em `Site/fauna_pe.json`, porque não há tabela de espécies
no schema enviado. O conteúdo das questões é carregado do SQL ao iniciar a API;
reinicie-a depois de editar questões no painel do banco.

As alternativas no PostgreSQL são **1 a 4**. No contrato HTTP continuam **0 a 3**,
preservando o front existente. A conversão é feita pelo adaptador. Os níveis
`Fácil`, `Intermediário`, `Difícil` são mapeados para `facil`, `intermediario`,
`dificil`. Nomes de animais e tópicos são normalizados para reconhecer acentos,
maiúsculas e hífens. Espécies, níveis ou tópicos desconhecidos causam erro de
configuração, em vez de associar uma pergunta ao animal errado.

## Complementos aditivos

A migração cria somente complementos no schema `mew_api`:

| Objeto | Finalidade |
|---|---|
| `migration` | Versões já aplicadas |
| `participante` | UUID público, hash do token e vínculo com `usuario` |
| `tentativa` | UUID, vínculo com `partida`, request_id, espécie, snapshots, status e finalização |
| `evento` | Visitas aos detalhes, exploração 3D e interações |
| `sessao` | Hash do token de login, participante e expiração |

As definições originais das tabelas `public` não são alteradas. Os inserts usam
os IDs automáticos já definidos no banco, sem sobrescrever os geradores da equipe.

## Participação e pontuação

O cadastro é obrigatório antes de iniciar o quiz. `usuario` recebe nome, e-mail
normalizado e hash scrypt com salt aleatório; a senha nunca é armazenada em texto
puro. `mew_api.participante.registered_at` identifica uma conta cadastrada, e
`mew_api.sessao` permite logins independentes com expiração de sete dias e logout.
Um índice único em `lower(btrim(email))` impede e-mails duplicados por diferença
de maiúsculas ou espaços. Nenhuma questão ou resposta existente é apagada.

Visitantes ainda podem navegar no catálogo e registrar visitas. Seus registros
usam identificadores no domínio reservado `mew.invalid` e um marcador de conta
sem senha. Esses endereços não são contatos reais. Ao cadastrar usando o token
visitante, a API converte o mesmo usuário em conta e invalida o token anterior.

Dados de usuários inseridos por outros clientes não ganham acesso automático à
API sem credencial compatível e vínculo de participante. A pontuação SQL aumenta
em uma unidade por resposta correta salva, inclusive antes de finalizar a partida;
reenviar ou finalizar novamente não duplica pontuação.

O tempo de resposta é medido no servidor desde a resposta anterior ou o início
da tentativa. Ele inclui pausas e retomadas, portanto não representa tempo de
interação contínua com a tela. Datas sem fuso nas tabelas originais são gravadas
e interpretadas como UTC; as datas dos complementos usam `timestamptz`.

## Consistência e sigilo

- Operações são confirmadas em transações PostgreSQL. Falhas desfazem a operação.
- Gravações usam `SELECT ... FOR UPDATE` na linha do participante. Operações da
  mesma conta são serializadas; participantes diferentes não usam um lock global.
- A sessão é localizada pelo hash indexado do token. Consultas de perfil e login
  não carregam respostas, partidas ou eventos. Rotas de tentativa filtram pelo
  participante e pelo ID da tentativa ou request_id; as respostas são buscadas
  somente para as partidas selecionadas. Consultas GET não pedem bloqueio de escrita.
- Histórico e recomendação carregam apenas tentativas/eventos do participante.
  O CSV da equipe lê tentativas e respostas com filtros SQL, sem carregar contas,
  hashes de senha, sessões ou eventos. Para grandes históricos, pode-se acrescentar
  paginação e processamento incremental. Esta alteração não exige nova migração.
- Constraints impedem duas respostas para a mesma questão da partida e dois
  request_ids iguais por participante.
- Snapshots preservam o enunciado, as opções e o gabarito de uma tentativa iniciada.
- O cliente recebe apenas os campos públicos das perguntas. Gabarito e explicação
  são liberados exclusivamente nas respostas já enviadas pelo próprio participante.
- O CSV individual contém somente respostas já registradas, nunca questões ainda
  não respondidas. O relatório geral exige a chave da equipe.
- O arquivo `Site/quiz_perguntas.json` é apenas a fonte do modo local JSON e seu
  download continua bloqueado pelo servidor da aplicação.

## Dados anteriores e testes

O JSON local não é importado automaticamente. Preserve `backend/data/mew.json`
se houver participações anteriores que precisem de migração. O backend não apaga
esse arquivo nem os dados existentes no Neon.

A suíte padrão usa arquivos temporários. Para verificar o banco real, defina
`MEW_TEST_NEON=1` e execute os testes. Inserts de teste ficam em uma transação
externa desfeita no final; os números das sequências podem avançar, sem deixar
usuários ou respostas de teste. `python -m tests.run_browser --neon` faz o mesmo
para o teste de navegador. A migração precisa estar aplicada antes desses testes.
