"""Converte o conteúdo PostgreSQL para o contrato já usado pelo quiz."""
import unicodedata

from .recommendations import LEVELS, TOPICS

DATABASE_LEVELS = {'facil': 'Fácil', 'intermediario': 'Intermediário', 'dificil': 'Difícil'}


def normalized(value):
    return ''.join(c for c in unicodedata.normalize('NFKD', value.casefold()) if c.isalnum() and not unicodedata.combining(c))


def build_quizzes(rows, catalog):
    aliases = {}
    for species_id, animal in catalog.items():
        aliases[normalized(animal['nome_popular'])] = species_id
        # O catálogo chama a espécie de "Saíra-pintor ou Pintor-verdadeiro".
        aliases[normalized(animal['nome_popular'].split(' ou ')[0])] = species_id
        aliases[normalized(species_id)] = species_id
    levels = {normalized(label): key for key, label in DATABASE_LEVELS.items()}
    topics = {normalized(topic): topic for topic in TOPICS}
    quizzes = {key: {'nome': animal['nome_popular'], **{level: [] for level in LEVELS}} for key, animal in catalog.items()}
    for row in rows:
        species = aliases.get(normalized(row['animal']))
        level = levels.get(normalized(row['nivel']))
        topic = topics.get(normalized(row['nome_topico']))
        if not species or not level or not topic or not 1 <= row['alternativa_correta'] <= 4:
            raise ValueError('Questão do banco com espécie, nível, tópico ou gabarito não reconhecido.')
        quizzes[species][level].append({
            'id': str(row['id_questao']), 'Id_Questao': row['id_questao'],
            'pergunta': row['enunciado'], 'opcoes': [row['alternativa_' + letter] for letter in 'abcd'],
            'correta': row['alternativa_correta'] - 1,
            'explicacao': row['explicacao'], 'topico': topic,
        })
    if any(len(quiz[level]) < 5 for quiz in quizzes.values() for level in LEVELS):
        raise ValueError('O banco precisa de ao menos cinco perguntas por espécie e dificuldade.')
    return quizzes
