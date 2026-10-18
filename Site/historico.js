document.addEventListener('DOMContentLoaded', async () => {
  const area = document.getElementById('historico');
  const labels = {facil: 'Fácil', intermediario: 'Intermediário', dificil: 'Difícil'};
  document.getElementById('sair-conta').addEventListener('click', async event => {
    event.currentTarget.disabled = true;
    try { await MewAPI.logout(); location.assign('login.html'); }
    catch (error) { area.textContent = error.message; document.getElementById('sair-conta').disabled = false; }
  });
  try {
    const session = await MewAPI.requireAccount();
    if (!session) return;
    document.getElementById('identificacao').textContent = `${session.usuario.nome} · ${session.usuario.pontuacao} pontos`;
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
