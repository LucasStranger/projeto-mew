# Projeto MEW

Site de educação ambiental com API de quizzes, registro de navegação, histórico,
credenciais, exportação CSV e recomendação por conteúdo com similaridade de cosseno.

## Executar

Requer Python 3.10 ou superior. A API usa apenas a biblioteca padrão, sem pacotes a instalar.
No Windows, dê dois cliques em **iniciar.bat**, ou execute na raiz:

```powershell
python -m backend.server
```

Abra [o site](http://127.0.0.1:8000/). Use esse endereço para todas as páginas,
inclusive catálogo, quiz e relatório. Abrir o HTML diretamente ou usar somente
um servidor de arquivos estáticos não inicia a API.

O iniciador procura o Python definido em `MEW_PYTHON`, o ambiente virtual
`.venv` e, depois, os comandos `py -3` ou `python`. Instale Python 3.10 ou
superior, ou configure `MEW_PYTHON` com o caminho do executável.

## O que está integrado

- Catálogo de 10 espécies com IDs estáveis `pe-1` a `pe-10`.
- Participação anônima por navegador, sem pedir nome, e-mail ou senha.
- Tentativas de cinco perguntas sorteadas entre as 300 perguntas existentes.
- Correção no servidor, com gabarito e explicação liberados apenas após responder.
- Gravação de cada resposta, retomada após recarregar e proteção contra duplicação.
- Resultado por tópico e selo persistente a partir de 70% (quatro de cinco acertos).
- Histórico, exportação individual e impressão da credencial.
- Registro de visitas aos detalhes das espécies e ao ambiente 3D.
- Três sugestões personalizadas de próximos desafios e ajuste de dificuldade.
- Relatório CSV da equipe com filtro por espécie e dificuldade.

Em uma oficina com computador compartilhado, abra **Meu histórico → Novo participante**
antes de passar o computador à próxima pessoa. A exportação mantém os registros
anteriores; o navegador deixa de ter acesso à participação anterior.

## Armazenamento temporário e banco futuro

O banco definitivo será integrado pela pessoa responsável. Por enquanto, os dados
são persistidos em `backend/data/mew.json`, com transações protegidas por lock e
substituição atômica do arquivo. Parar e iniciar o servidor preserva os dados.

Não apague esse arquivo para atualizar o código. Faça backup da pasta `backend/data`
com o servidor parado. Ela contém também a chave da equipe e fica fora do Git.
Use apenas **um processo da API por arquivo**, sem múltiplas instâncias ou workers.
O armazenamento é adequado para desenvolvimento e demonstração; todas as operações
passam pelo contrato em `backend/storage.py`.

O [guia de integração do banco](docs/BANCO.md) descreve o contrato, as relações,
os snapshots das perguntas e as regras que devem ser preservadas.

## Exportar respostas

Na primeira execução é criada a chave `backend/data/admin-token.txt`.
Abra [Relatório da equipe](http://127.0.0.1:8000/relatorios.html), informe a chave e
baixe o CSV. A chave não é mostrada no site nem armazenada pela tela de relatório.

O CSV usa UTF-8 com BOM e separador `;` para abertura no Excel. Há uma linha por
resposta salva, inclusive de tentativas incompletas, com identificação anônima,
pergunta, escolha, gabarito, acerto, dificuldade e horários em UTC. Tentativas sem
respostas ainda não produzem linhas. As alternativas usam índices de **0 a 3**.

## Recomendador C++

O código em `backend/recommender/main.cpp` calcula a similaridade de cosseno entre
as dificuldades do participante por tópico e o conteúdo de cada desafio. A API
monta as características usando respostas reais e visitas, seleciona o nível
adequado e chama o executável com entrada numérica, sem interpretar comandos.

Compile antes da apresentação para demonstrar a parte C++:

```powershell
python backend/recommender/build.py
```

É necessário um compilador C++17: g++, clang++, Visual C++ em seu terminal de
desenvolvimento, ou Zig. Também há um projeto CMake na mesma pasta. Com CMake e
Visual Studio, o binário pode ficar em `build/Release`; nesse caso configure
`MEW_RECOMMENDER_BIN` com o caminho completo do executável.

O destino padrão é `backend/recommender/build/recommender.exe` no Windows e
`backend/recommender/build/recommender` em outros sistemas. Sem o binário, a API
executa o mesmo cálculo em Python. O campo `motor` da rota de recomendações mostra
`cpp`, `python` ou `python_fallback`; assim uma falha nativa não é mascarada como C++.
O executável não vai para o Git e deve ser recompilado em outro computador.

O método é filtragem baseada em conteúdo, uma das opções previstas no documento.
Não é um modelo de aprendizado por reforço nem um modelo supervisionado treinado.
Fórmula, limitações e critérios estão em [RECOMENDADOR.md](docs/RECOMENDADOR.md).

## Configuração

| Variável | Padrão | Uso |
|---|---|---|
| `MEW_HOST` | `127.0.0.1` | Endereço de escuta |
| `MEW_PORT` | `8000` | Porta |
| `MEW_DATA_FILE` | `backend/data/mew.json` | Arquivo de persistência |
| `MEW_ADMIN_TOKEN` | Chave gerada em arquivo | Chave da exportação geral, mínimo 24 caracteres |
| `MEW_RECOMMENDER_BIN` | Binário em `backend/recommender/build` | Executável do recomendador |
| `MEW_PYTHON` | Detecção pelo iniciador Windows | Python usado por `iniciar.bat` |

Também existem os argumentos `--host`, `--port` e `--data-file`. As variáveis são
lidas do ambiente; não há carregamento automático de `.env`.

Para uma demonstração em rede local, `python -m backend.server --host 0.0.0.0`
permite acesso pelo IP do computador, sujeito ao firewall. Para publicação pública,
use servidor de aplicação/reverse proxy com HTTPS e integre o banco definitivo.
Recursos de câmera e AR em celulares precisam de contexto seguro compatível com
o navegador. As bibliotecas 3D e APIs públicas de Pokémon continuam dependendo
da internet; não foram reimplementadas pelo backend.

## Documentação e testes

- [Contrato HTTP e exemplos](docs/API.md)
- [Contrato para o banco definitivo](docs/BANCO.md)
- [Algoritmo de recomendação](docs/RECOMENDADOR.md)

```powershell
python -m unittest discover -s tests -v
```

Os testes usam diretórios temporários e não alteram os dados reais da oficina.
Para os testes de navegador, disponibilize Playwright e Chromium no ambiente de
desenvolvimento e execute `python -m tests.run_browser`. É possível fornecer
`--node CAMINHO` e `--modules PASTA_NODE_MODULES`; `MEW_BROWSER_CHANNEL=chrome`
usa o Chrome instalado. Os resultados temporários ficam em `test-results/`.
