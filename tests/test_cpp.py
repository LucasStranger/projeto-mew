import math
import os
from pathlib import Path
import random
import subprocess
import unittest
from unittest.mock import patch

from backend.recommendations import recommend, score
from backend.server import SITE
from backend.service import Service

BINARY = Path(__file__).resolve().parent.parent / 'backend' / 'recommender' / 'build' / ('recommender.exe' if os.name == 'nt' else 'recommender')


@unittest.skipUnless(BINARY.is_file(), 'Compile o recomendador para verificar o motor C++.')
class NativeTests(unittest.TestCase):
    def test_native_matches_python(self):
        rng = random.Random(42)
        for _ in range(10):
            weakness = [rng.random() for _ in range(7)]
            candidates = [[rng.random() for _ in range(9)] for _ in range(30)]
            payload = '7 30\n' + ' '.join(map(str, weakness)) + '\n' + '\n'.join(' '.join(map(str, row)) for row in candidates) + '\n'
            result = subprocess.run([str(BINARY)], input=payload, text=True, capture_output=True, timeout=5, check=True)
            actual = [float(x) for x in result.stdout.split()]
            self.assertEqual(len(actual), 30)
            for row, value in zip(candidates, actual):
                self.assertTrue(math.isfinite(value))
                self.assertAlmostEqual(value, score(weakness, row[:7], row[7], row[8]), places=12)

    def test_native_rejects_invalid_input(self):
        for payload in ('0 1\n', '7 -1\n', '1 1\nnan\n1 1 1\n', '1 1\n.5\n2 1 1\n', '1 1\n.5\n.5\n'):
            result = subprocess.run([str(BINARY)], input=payload, text=True, capture_output=True, timeout=5)
            self.assertNotEqual(result.returncode, 0)

    def test_api_recommendation_uses_cpp(self):
        service = Service(None, SITE, 'not-used')
        data = {'attempts': {}, 'events': []}
        with patch.dict(os.environ, {'MEW_RECOMMENDER_BIN': str(BINARY)}):
            result = recommend(data, 'test', service.catalog, service.quizzes)
        self.assertEqual(result['motor'], 'cpp')
        with patch.dict(os.environ, {'MEW_RECOMMENDER_BIN': str(BINARY.parent / 'missing')}):
            fallback = recommend(data, 'test', service.catalog, service.quizzes)
        self.assertEqual(fallback['motor'], 'python')
        self.assertEqual(fallback['recomendacoes'], result['recomendacoes'])


if __name__ == '__main__':
    unittest.main()
