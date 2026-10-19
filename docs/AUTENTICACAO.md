# Cadastro e login para o frontend

O cadastro é obrigatório antes de iniciar ou responder um quiz. A navegação pelo
catálogo continua pública. As páginas `Site/login.html` e `Site/cadastro.html`
já estão conectadas às rotas abaixo, usando o estilo da Pokédex. O catálogo
oferece entrada, cadastro e saída; o histórico também permite sair. O quiz
encaminha visitantes ao login, preservando o desafio escolhido no retorno.

## Cadastro

`POST /api/cadastro`, com `Content-Type: application/json`:

```json
{"nome":"Nome do aluno","email":"aluno@example.com","senha":"Uma senha longa escolhida pelo aluno"}
```

Nome: 2 a 50 caracteres. E-mail: até 100 caracteres, normalizado para minúsculas
e sem espaços nas extremidades. Senha: 15 a 128 caracteres; espaços e Unicode
são aceitos, sem regras artificiais de símbolos obrigatórios.

Retorno 201, com token já autenticado:

```json
{
  "id":"UUID_DO_PARTICIPANTE",
  "token":"TOKEN_ALEATORIO",
  "cadastrado":true,
  "expira_em":"2026-10-25T20:00:00+00:00",
  "usuario":{"id":"UUID_DO_PARTICIPANTE","nome":"Nome do aluno","email":"aluno@example.com","cadastrado":true,"pontuacao":0,"criado_em":"2026-10-18T20:00:00+00:00"}
}
```

Se o navegador já possui uma participação visitante válida, o cadastro pode
enviar seu token no cabeçalho `Authorization: Bearer TOKEN_VISITANTE`. Isso
converte a participação existente em conta, preservando os vínculos anteriores.
O token de visitante é invalidado e deve ser substituído pelo token novo.
Sem token, o cadastro cria uma conta nova. Um token de conta já cadastrada não
pode ser usado para sobrescrever seu nome, e-mail ou senha por essa rota.

## Login

`POST /api/login`:

```json
{"email":"aluno@example.com","senha":"Uma senha longa escolhida pelo aluno"}
```

Retorna 200 com a mesma estrutura de sessão do cadastro, incluindo nome e
pontuação. É possível entrar em outro dispositivo e recuperar o mesmo ID,
histórico, credenciais e pontuação. Cada login gera um token diferente. O login
não duplica o participante nem a pontuação. Erros de e-mail inexistente e senha
incorreta retornam a mesma mensagem: `E-mail ou senha inválidos.`

## Integração com MewAPI

Depois do cadastro ou login, substitua a sessão local com `setSession()` e
carregue o destino desejado. O método também atualiza o cache em memória e limpa
atalhos de tentativas quando a conta é diferente da anterior:

```javascript
const session = await MewAPI.request('/api/login', {
  method: 'POST', body: {email, senha}
});
MewAPI.setSession(session);
location.assign('index.html');
```

Use o mesmo fluxo para `/api/cadastro`, acrescentando `nome` ao corpo. Não use
`ensureSession()` para simular cadastro: ele cria somente um visitante quando não
há sessão. O quiz exige uma conta autenticada.

`GET /api/participantes/me`, autenticado, retorna o perfil atualizado. Verifique
`cadastrado === true` antes de oferecer o início do quiz. A API também impõe essa
regra: visitantes recebem HTTP 403 e código `registration_required` ao iniciar,
responder ou finalizar uma tentativa. A tela pode então encaminhar ao cadastro
ou login. `MewAPI.requireAccount()` já faz esse encaminhamento no quiz e no
histórico. Token ausente, expirado ou revogado retorna 401.

## Sair da conta

`POST /api/logout`, corpo `{}`, com o token atual no cabeçalho Bearer. Depois do
retorno 200, remova `mew_session_v1` e as chaves locais `mew_attempt:*` e
`mew_pending:*`, e carregue uma nova página. A saída revoga somente a sessão
atual; o histórico permanece no banco e outras sessões continuam válidas.

`MewAPI.logout()` faz a revogação e limpeza local, inclusive se a sessão já
expirou. Os botões “Sair da conta” do catálogo e histórico usam esse método.
Se o servidor falhar, a interface informa o erro e permite tentar novamente.

## Sessões e proteção de senha

- Sessões duram sete dias e há até dez sessões por conta. Ao ultrapassar o limite,
  a mais antiga é encerrada. Tokens são aleatórios; o banco guarda somente hashes.
- A senha usa scrypt com salt aleatório, N=32768, r=8, p=3, uma configuração
  documentada pela [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).
  A API nunca devolve a senha ou seu hash. O campo `usuario.senha` armazena o hash.
- Login permite cinco tentativas por combinação de IP e conta e trinta por IP
  em quinze minutos. Cadastro permite dez tentativas por IP por hora. Exceder o
  limite retorna 429. Os limites são por processo; em múltiplas réplicas devem
  ser complementados por limitação compartilhada na hospedagem.
- Para publicação, use HTTPS. Senhas e tokens não devem ser colocados em URLs,
  logs, arquivos públicos ou mensagens de erro.

Esta entrega inclui cadastro, login, perfil e logout. Verificação de e-mail,
recuperação de senha e edição de perfil não foram solicitadas e não possuem rotas.
Contas antigas inseridas diretamente por outros clientes não são autenticadas
como texto puro: precisam de migração de credenciais e vínculo na API.
