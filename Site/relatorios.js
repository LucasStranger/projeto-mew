document.addEventListener('DOMContentLoaded', async () => {
  const status = document.getElementById('status');
  try {
    const data = await MewAPI.request('/api/especies');
    for (const animal of data.especies_ameacadas) {
      const option = document.createElement('option');
      option.value = animal.id; option.textContent = animal.nome_popular;
      document.getElementById('especie').appendChild(option);
    }
  } catch (error) { status.textContent = error.message; }

  document.getElementById('exportar-form').addEventListener('submit', async event => {
    event.preventDefault();
    const button = event.target.querySelector('button');
    button.disabled = true; status.textContent = 'Preparando arquivo…';
    const query = new URLSearchParams();
    if (document.getElementById('especie').value) query.set('especie_id', document.getElementById('especie').value);
    if (document.getElementById('nivel').value) query.set('dificuldade', document.getElementById('nivel').value);
    try {
      await MewAPI.download(`/api/exportacoes/respostas.csv?${query}`, 'mew-respostas.csv', document.getElementById('chave').value.trim());
      status.textContent = 'Arquivo pronto. Confira os downloads do navegador.';
    } catch (error) { status.textContent = error.message; }
    finally { button.disabled = false; }
  });
});
