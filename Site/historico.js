document.addEventListener('DOMContentLoaded', async () => {
  const area = document.getElementById('historico');
  const labels = {facil: 'Fácil', intermediario: 'Intermediário', dificil: 'Difícil'};
  document.getElementById('novo-participante').addEventListener('click', () => {
    // O histórico anterior permanece no servidor e na exportação da equipe.
    if (confirm('Iniciar a participação de outra pessoa neste navegador? O acesso ao histórico atual será encerrado.')) {
      MewAPI.remove('mew_session_v1');
      for (let i = 1; i <= 10; i++) {
        MewAPI.remove(`mew_attempt:pe-${i}`);
        for (const level of Object.keys(labels)) MewAPI.remove(`mew_pending:pe-${i}:${level}`);
      }
      location.reload();
    }
  });
  try {
    const session = await MewAPI.ensureSession();
    document.getElementById('identificacao').textContent = `Participação: ${session.id}`;
    const [history, fauna] = await Promise.all([
      MewAPI.authenticated('/api/participantes/me/historico'), MewAPI.request('/api/especies')
    ]);
    const names = Object.fromEntries(fauna.especies_ameacadas.map(animal => [animal.id, animal.nome_popular]));
    if (!history.tentativas.length) { area.textContent = 'Você ainda não iniciou um desafio. Escolha um animal na Mewdex para começar.'; return; }
    area.innerHTML = history.tentativas.map(attempt => `<section class="mew-recomendacoes">
      <h2>${MewAPI.escape(names[attempt.especie_id])} · ${MewAPI.escape(labels[attempt.dificuldade])}</h2>
      <p>${MewAPI.escape(new Date(attempt.iniciada_em).toLocaleString('pt-BR'))} · ${attempt.resultado ? `${attempt.resultado.acertos}/${attempt.resultado.total} acertos` : 'Em andamento'}</p>
      ${attempt.resultado?.selo.conquistado ? '<p>★ Credencial Analista Ambiental conquistada</p>' : ''}
      <a href="quiz.html?animal=${encodeURIComponent(attempt.especie_id)}&tentativa=${encodeURIComponent(attempt.id)}">${attempt.resultado ? 'Ver resultado e baixar respostas' : 'Continuar desafio'}</a>
    </section>`).join('');
  } catch (error) { area.textContent = error.message; }
});
