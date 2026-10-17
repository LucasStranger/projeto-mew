# Recomendação de desafios ecológicos

Implementação de filtragem baseada em conteúdo com similaridade de cosseno,
conforme uma das alternativas descritas no projeto. Não exige um dataset de
treinamento externo. O perfil é atualizado usando as respostas registradas.

## Características

São sete dimensões: bioma, habitat, cadeia_alimentar, predacao, conservacao,
ecologia e taxonomia. Para cada tópico:

`necessidade = 1 - (acertos + 1) / (respostas + 2)`

A suavização de Laplace evita divisões por zero e conclusões extremas com uma
única resposta. Sem histórico, todas as necessidades começam em 0,5. O vetor de
conteúdo de cada candidato é a proporção de suas dez perguntas por tópico.

## Dificuldade

Sem tentativa concluída, começar no fácil. Considerando a última tentativa
concluída, subir um nível com pelo menos 80% de acertos, descer um nível com menos
de 50%, ou manter o nível nos outros resultados. Respeitar os limites fácil e
difícil. O ranking prioriza candidatos no nível alvo antes de comparar conteúdo.

## Pontuação

`pontuacao = 0,65 × cosseno(necessidade, conteudo) + 0,25 × ajuste_nivel + 0,10 × novidade`

`ajuste_nivel = 1 / (1 + distancia_ao_nivel_alvo)`

`novidade = 1 / (1 + tentativas_concluidas_no_desafio + penalidade_visita)`

A penalidade de visita é 0,25 se a espécie já foi visitada. Visitas não equivalem
a domínio: são apenas um sinal leve para diversificar a exploração. Tentativas
incompletas contribuem para o perfil de tópicos por suas respostas salvas, mas
não mudam o nível alvo. Retornar três espécies diferentes, com foco e motivo.

## C++ e integração

Python lê os registros e monta vetores. O binário C++ recebe dimensões, quantidade
de candidatos, vetor de necessidades e, para cada candidato, conteúdo, ajuste e
novidade. A saída é uma pontuação por candidato. A comunicação usa stdin/stdout,
sem shell e sem dependências de JSON. Há timeout de três segundos e validação da
quantidade de resultados e dos valores finitos.

O ranking final, o controle de dificuldade e as explicações ficam na API. Sem
executável, o motor Python usa exatamente a mesma fórmula. `motor=cpp` comprova
uso do executável; `python_fallback` identifica falha do executável e `python`
identifica ausência dele. O teste de paridade compara pontuações entre motores.

## Limites

O sistema adapta conteúdo ao histórico, mas não estima causalmente aprendizado
nem valida a qualidade científica das perguntas. Os pesos foram definidos para
o protótipo e não calibrados com uma avaliação pedagógica. Como cada nível usa
dez perguntas por espécie, há pouco conteúdo para diversificação prolongada.
