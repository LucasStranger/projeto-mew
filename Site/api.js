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
    // Timeout curto para não travar a tela caso o backend não esteja rodando
    const timer = setTimeout(() => controller.abort(), 3000);
    try {
      const response = await fetch(path, {
        method, signal: controller.signal,
        headers: { ...(body ? {'Content-Type': 'application/json'} : {}), ...(token ? {Authorization: `Bearer ${token}`} : {}) },
        ...(body ? {body: JSON.stringify(body)} : {})
      });
      
      const contentType = response.headers.get("content-type");
      if (!response.ok || (contentType && !contentType.includes("application/json"))) {
        throw new Error('Erro na API');
      }
      
      return binary ? await response.blob() : await response.json();
    } catch (error) {
      // =========================================================
      // FALLBACK LOCAL: Se o backend do Dhavi não estiver rodando
      // =========================================================
      console.warn(`[MewAPI] Backend não encontrado (${path}). Usando dados locais...`);
      
      if (path === '/api/especies' && method === 'GET') {
        const res = await fetch('fauna_pe.json');
        if (res.ok) return await res.json();
      }
      
      if (path.startsWith('/api/especies/') && method === 'GET') {
        const id = path.split('/').pop();
        const res = await fetch('fauna_pe.json');
        if (res.ok) {
          const data = await res.json();
          const animal = data.especies_ameacadas.find(a => a.id === id || String(a.id) === id);
          if (animal) return animal;
        }
      }

      if (path.includes('/api/tentativas') && method === 'POST') {
         if (path === '/api/tentativas') {
             const reqId = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
             localStorage.setItem(`mew_attempt:${body.especie_id}`, reqId);
             try {
                 const resQ = await fetch('quiz_perguntas.json');
                 if (resQ.ok) {
                     const dataQ = await resQ.json();
                     const perguntas = dataQ[body.especie_id][body.dificuldade] || [];
                     const sorteadas = perguntas.sort(() => 0.5 - Math.random()).slice(0, 5).map(q => ({
                         id: q.id, pergunta: q.pergunta, opcoes: q.opcoes, topico: q.topico
                     }));
                     return { id: reqId, especie_id: body.especie_id, dificuldade: body.dificuldade, perguntas: sorteadas, respostas: [] };
                 }
             } catch(e) { console.error('Erro ao ler quiz local', e); }
         }
         
         if (path.endsWith('/respostas')) {
             return { pergunta_id: body.pergunta_id, alternativa_escolhida: body.alternativa_escolhida, acertou: true, correta: 0, explicacao: "Modo offline (simulação)." };
         }

         if (path.endsWith('/finalizar')) {
             return { total: 5, acertos: 5, percentual: 1.0, selo: { conquistado: true, id: "offline-id", emitido_em: new Date().toISOString() } };
         }
      }

      if (error.name === 'AbortError' || error instanceof TypeError) {
        throw new Error('Sem conexão com o servidor.');
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
    try {
      const session = await ensureSession();
      return request(path, {...options, token: session.token});
    } catch(e) {
      if (path.includes('/api/tentativas')) return request(path, options);
      throw e;
    }
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