#include <cmath>
#include <iomanip>
#include <iostream>
#include <vector>

// Protocolo stdin: dimensões candidatos; vetor de dificuldades por tópico;
// para cada candidato: vetor de conteúdo, ajuste de nível e novidade.
// stdout: uma pontuação por candidato, na mesma ordem. Sem dependências.
int main() {
    int dimensions, candidates;
    if (!(std::cin >> dimensions >> candidates) || dimensions < 1 || dimensions > 100 || candidates < 1 || candidates > 10000) return 1;
    std::vector<double> weakness(dimensions);
    double normA = 0;
    for (double &v : weakness) {
        if (!(std::cin >> v) || !std::isfinite(v) || v < 0 || v > 1) return 1;
        normA += v * v;
    }
    std::cout << std::setprecision(17);
    for (int n = 0; n < candidates; ++n) {
        double dot = 0, normB = 0, fit, novelty;
        for (int i = 0; i < dimensions; ++i) {
            double value;
            if (!(std::cin >> value) || !std::isfinite(value) || value < 0 || value > 1) return 1;
            dot += weakness[i] * value;
            normB += value * value;
        }
        if (!(std::cin >> fit >> novelty) || !std::isfinite(fit) || !std::isfinite(novelty) || fit < 0 || fit > 1 || novelty < 0 || novelty > 1) return 1;
        const double norm = std::sqrt(normA * normB);
        std::cout << 0.65 * (norm ? dot / norm : 0) + 0.25 * fit + 0.10 * novelty << '\n';
    }
}
