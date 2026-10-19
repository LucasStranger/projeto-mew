/* API no mesmo endereço do site. Tokens não são colocados em URLs. */
window.MewAPI = (() => {
  let sessionPromise;
  const memory = new Map();
  const read = key => { try { return localStorage.getItem(key) ?? memory.get(key) ?? null; } catch (_) { return memory.get(key) || null; } };
  const write = (key, value) => { memory.set(key, value); try { localStorage.setItem(key, value); } catch (_) {} };
  const remove = key => { memory.delete(key); try { localStorage.removeItem(key); } catch (_) {} };
  const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  class ApiHttpError extends Error {
    constructor(status, code, message) {
      super(message || `Erro ${status}`);
      this.name = 'ApiHttpError';
      this.status = status;
      this.code = code;
      this.isHttp = true;
    }
  }

  async function request(path, { method = 'GET', body, token, binary = false } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(path, {
        method,
        signal: controller.signal,
        headers: {
          ...(body ? { 'Content-Type': 'application/json' } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        ...(body ? { body: JSON.stringify(body) } : {})
      });

      const contentType = (response.headers.get('content-type') || '').toLowerCase();
      const isJson = contentType.includes('application/json');

      if (!response.ok) {
        let payload = null;
        if (isJson) { try { payload = await response.json(); } catch (_) {} }
        throw new ApiHttpError(
          response.status,
          payload?.erro?.codigo || payload?.code,
          payload?.erro?.mensagem || payload?.message
        );
      }

      if (binary) return await response.blob();
      if (isJson) return await response.json();
      throw new Error('Resposta inesperada do servidor.');
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof ApiHttpError) throw error;

      // Erro de rede ou timeout: só aceita fallback de dados estáticos.
      const fallback = await tryStaticFallback(path, { method });
      if (fallback !== undefined) return fallback;

      if (error.name === 'AbortError') throw new Error('O servidor demorou para responder. Tente novamente.');
      throw new Error('Sem conexão com o servidor. Verifique a rede e tente novamente.');
    } finally {
      clearTimeout(timer);
    }
  }

  async function tryStaticFallback(path, { method }) {
    if (method !== 'GET') return undefined;

    if (path === '/api/especies') {
      try {
        const res = await fetch('fauna_pe.json', { cache: 'no-store' });
        if (res.ok) return await res.json();
      } catch (_) {}
    }

    const match = path.match(/^\/api\/especies\/([^/?#]+)$/);
    if (match) {
      const id = decodeURIComponent(match[1]);
      try {
        const res = await fetch('fauna_pe.json', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const animal = (data.especies_ameacadas || []).find(a => String(a.id) === id);
          if (animal) {
            return { ...animal, nome: animal.nome_popular, niveis: ['facil', 'intermediario', 'dificil'] };
          }
        }
      } catch (_) {}
    }

    return undefined;
  }

  async function ensureSession() {
    if (!sessionPromise) sessionPromise = (async () => {
      let session;
      try { session = JSON.parse(read('mew_session_v1') || 'null'); } catch (_) {}
      if (session?.token) {
        try {
          const profile = await request('/api/participantes/me', { token: session.token });
          session = { ...session, cadastrado: profile.cadastrado, usuario: profile };
          write('mew_session_v1', JSON.stringify(session));
          return session;
        } catch (error) {
          if (!(error instanceof ApiHttpError) || error.status !== 401) throw error;
        }
      }
      session = await request('/api/participantes', { method: 'POST', body: {} });
      write('mew_session_v1', JSON.stringify(session));
      return session;
    })().catch(error => { sessionPromise = null; throw error; });
    return sessionPromise;
  }

  async function authenticated(path, options = {}) {
    const session = await ensureSession();
    try {
      return await request(path, { ...options, token: session.token });
    } catch (error) {
      if ((error.status === 401 && session.cadastrado) || error.code === 'registration_required') {
        goToLogin();
      }
      throw error;
    }
  }

  function goToLogin() {
    location.assign(`login.html?next=${encodeURIComponent(location.pathname + location.search)}`);
  }

  async function requireAccount() {
    const session = await ensureSession();
    if (!session.cadastrado) { goToLogin(); return null; }
    return session;
  }

  function clearProgress() {
    const keys = new Set(memory.keys());
    try { for (let i = 0; i < localStorage.length; i++) keys.add(localStorage.key(i)); } catch (_) {}
    for (const key of keys) {
      if (key?.startsWith('mew_attempt:') || key?.startsWith('mew_pending:')) remove(key);
    }
  }

  function setSession(session) {
    let previous;
    try { previous = JSON.parse(read('mew_session_v1') || 'null'); } catch (_) {}
    if (previous?.id !== session.id) clearProgress();
    write('mew_session_v1', JSON.stringify(session));
    sessionPromise = Promise.resolve(session);
  }

  async function logout() {
    let session;
    try { session = JSON.parse(read('mew_session_v1') || 'null'); } catch (_) {}
    if (session?.token) {
      try { await request('/api/logout', { method: 'POST', body: {}, token: session.token }); }
      catch (error) { if (error.status !== 401) throw error; }
    }
    clearProgress();
    remove('mew_session_v1');
    sessionPromise = null;
  }

  async function createAttempt(speciesId, level) {
    const key = `mew_pending:${speciesId}:${level}`;
    const requestId = read(key) || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
    write(key, requestId);
    const attempt = await authenticated('/api/tentativas', {
      method: 'POST',
      body: { especie_id: speciesId, dificuldade: level, request_id: requestId }
    });
    write(`mew_attempt:${speciesId}`, attempt.id);
    remove(key);
    return attempt;
  }

  async function download(path, filename, adminToken) {
    const blob = adminToken
      ? await request(path, { token: adminToken, binary: true })
      : await authenticated(path, { binary: true });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = filename;
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function track(speciesId, type = 'visualizacao_especie') {
    if (/^pe-\d+$/.test(speciesId || '')) {
      authenticated('/api/eventos', { method: 'POST', body: { especie_id: speciesId, tipo: type } })
        .catch(error => console.warn('[MewAPI] Falha ao registrar evento:', error.message));
    }
  }

  return { request, authenticated, ensureSession, requireAccount, setSession, logout, createAttempt, download, track, escape, read, write, remove, ApiHttpError };
})();
