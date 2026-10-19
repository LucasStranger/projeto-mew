/* Formulários e acesso à conta usam a mesma sessão do quiz. */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('auth-form');
  if (form) setupForm(form);
  const account = document.getElementById('mew-account');
  if (account) setupAccount(account);
});

function authDestination() {
  const next = new URLSearchParams(location.search).get('next');
  if (next) {
    try {
      const target = new URL(next, location.href);
      if (target.origin === location.origin && /^\/(index|quiz|historico|detalhes)\.html$/.test(target.pathname)) {
        return target.pathname + target.search;
      }
    } catch (_) {}
  }
  return 'index.html';
}

function setupForm(form) {
  const mode = form.dataset.mode;
  const destination = authDestination();
  const errorArea = document.getElementById('auth-error');
  const status = document.getElementById('auth-status');
  const button = form.querySelector('[type="submit"]');
  const password = document.getElementById('senha');
  const confirmPassword = document.getElementById('confirmar-senha');
  document.querySelectorAll('[data-auth-link]').forEach(link => {
    if (destination !== 'index.html') link.search = `?next=${encodeURIComponent(destination)}`;
  });
  document.querySelector('.auth-toggle').addEventListener('click', event => {
    const visible = password.type === 'password';
    password.type = visible ? 'text' : 'password';
    event.currentTarget.textContent = visible ? 'Ocultar' : 'Mostrar';
    event.currentTarget.setAttribute('aria-pressed', String(visible));
  });
  if (confirmPassword) {
    const check = () => confirmPassword.setCustomValidity(
      confirmPassword.value && confirmPassword.value !== password.value ? 'As senhas precisam ser iguais.' : ''
    );
    confirmPassword.addEventListener('input', check);
    password.addEventListener('input', check);
  }

  // Informa sobre a conta atual sem impedir a troca de usuário.
  let saved;
  try { saved = JSON.parse(MewAPI.read('mew_session_v1') || 'null'); } catch (_) {}
  if (saved?.token) {
    MewAPI.request('/api/participantes/me', { token: saved.token }).then(profile => {
      if (!profile.cadastrado) return;
      const notice = document.getElementById('conta-atual');
      notice.textContent = `Você está conectado como ${profile.nome}. `;
      const link = document.createElement('a');
      link.href = destination;
      link.textContent = 'Continuar com esta conta';
      notice.append(link);
      notice.hidden = false;
    }).catch(() => {});
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (button.disabled || !form.reportValidity()) return;
    errorArea.hidden = true;
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.textContent = mode === 'cadastro' ? 'Criando sua conta…' : 'Entrando na sua conta…';
    try {
      const body = { email: form.elements.email.value.trim(), senha: password.value };
      let token;
      if (mode === 'cadastro') {
        body.nome = form.elements.nome.value.trim();
        // Aproveita a participação visitante, sem tentar sobrescrever outra conta.
        let current;
        try { current = JSON.parse(MewAPI.read('mew_session_v1') || 'null'); } catch (_) {}
        if (current?.token) {
          try {
            const profile = await MewAPI.request('/api/participantes/me', { token: current.token });
            if (!profile.cadastrado) token = current.token;
          } catch (error) { if (error.status !== 401) throw error; }
        }
      }
      const session = await MewAPI.request(`/api/${mode}`, { method: 'POST', body, token });
      MewAPI.setSession(session);
      form.reset();
      status.textContent = 'Tudo pronto! Abrindo sua jornada…';
      location.assign(destination);
    } catch (error) {
      status.textContent = '';
      errorArea.textContent = error.message;
      errorArea.hidden = false;
      errorArea.focus();
      button.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });
}

async function setupAccount(area) {
  try {
    const session = await MewAPI.ensureSession();
    if (!session.cadastrado) return;
    area.replaceChildren();
    const name = document.createElement('span');
    name.textContent = `Olá, ${session.usuario.nome} · ${session.usuario.pontuacao} pontos`;
    const history = document.createElement('a');
    history.href = 'historico.html'; history.textContent = 'Meu histórico';
    const logout = document.createElement('button');
    logout.type = 'button'; logout.textContent = 'Sair da conta';
    logout.addEventListener('click', async () => {
      logout.disabled = true;
      area.querySelector('.auth-error')?.remove();
      try { await MewAPI.logout(); location.assign('login.html'); }
      catch (error) {
        const message = document.createElement('p');
        message.className = 'auth-error'; message.setAttribute('role', 'alert');
        message.textContent = error.message;
        area.append(message);
        logout.disabled = false;
      }
    });
    area.append(name, history, logout);
  } catch (_) {
    // Os links de entrada continuam disponíveis se o servidor estiver indisponível.
  }
}
