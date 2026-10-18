/* API no mesmo endereço do site. Tokens não são colocados em URLs. */
window.MewAPI = (() => {
  let sessionPromise;
  const memory = new Map();
  const read = key => { try { return localStorage.getItem(key) ?? memory.get(key) ?? null; } catch (_) { return memory.get(key) || null; } };
  const write = (key, value) => { memory.set(key, value); try { localStorage.setItem(key, value); } catch (_) {} };
  const remove = key => { memory.delete(key); try { localStorage.removeItem(key); } catch (_) {} };
  const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  async function request(path, {method = 'GET', body, token, binary = false} = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(path, {
        method, signal: controller.signal,
        headers: { ...(body ? {'Content-Type': 'application/json'} : {}), ...(token ? {Authorization: `Bearer ${token}`} : {}) },
        ...(body ? {body: JSON.stringify(body)} : {})
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const error = new Error(data.erro?.mensagem || 'Não foi possível concluir a solicitação.');
        error.status = response.status;
        throw error;
      }
      return binary ? await response.blob() : await response.json();
    } catch (error) {
      if (error.name === 'AbortError' || error instanceof TypeError) {
        throw new Error('Sem conexão com o servidor. Confira a conexão e tente novamente.');
      }
      throw error;
    } finally { clearTimeout(timer); }
  }

  async function ensureSession() {
    if (!sessionPromise) sessionPromise = (async () => {
      let session;
      try { session = JSON.parse(read('mew_session_v1') || 'null'); } catch (_) {}
      if (session?.token) {
        try { await request('/api/participantes/me', {token: session.token}); return session; }
        catch (error) { if (error.status !== 401) throw error; }
      }
      session = await request('/api/participantes', {method: 'POST', body: {}});
      write('mew_session_v1', JSON.stringify(session));
      return session;
    })().catch(error => { sessionPromise = null; throw error; });
    return sessionPromise;
  }

  async function authenticated(path, options = {}) {
    const session = await ensureSession();
    return request(path, {...options, token: session.token});
  }

  async function createAttempt(speciesId, level) {
    const key = `mew_pending:${speciesId}:${level}`;
    const requestId = read(key) || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
    write(key, requestId);
    const attempt = await authenticated('/api/tentativas', {method: 'POST', body: {especie_id: speciesId, dificuldade: level, request_id: requestId}});
    write(`mew_attempt:${speciesId}`, attempt.id);
    remove(key);
    return attempt;
  }

  async function download(path, filename, adminToken) {
    const blob = adminToken ? await request(path, {token: adminToken, binary: true}) : await authenticated(path, {binary: true});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = filename;
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function track(speciesId, type = 'visualizacao_especie') {
    if (/^pe-\d+$/.test(speciesId || '')) {
      authenticated('/api/eventos', {method: 'POST', body: {especie_id: speciesId, tipo: type}}).catch(error => console.warn(error.message));
    }
  }

  return {request, authenticated, ensureSession, createAttempt, download, track, escape, read, write, remove};
})();
