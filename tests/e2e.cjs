const {chromium} = require(process.env.MEW_NODE_MODULES ? `${process.env.MEW_NODE_MODULES}/playwright` : 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.MEW_TEST_URL;
const questions = JSON.parse(fs.readFileSync(process.env.MEW_TEST_QUESTIONS_PATH || 'Site/quiz_perguntas.json', 'utf8'));

(async () => {
  const browser = await chromium.launch({headless: true, ...(process.env.MEW_BROWSER_CHANNEL ? {channel: process.env.MEW_BROWSER_CHANNEL} : {})});
  const context = await browser.newContext({viewport: {width: 1280, height: 900}, acceptDownloads: true});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    // Isola a integração local; as APIs públicas de Pokémon não são parte do teste.
    await context.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
    const email = `browser-${require('node:crypto').randomUUID()}@example.com`;
    const password = 'Senha longa do navegador de teste!';
    // Visitante é encaminhado à entrada e volta ao mesmo quiz após se cadastrar.
    await page.goto(`${base}/quiz.html?animal=pe-1`);
    await page.waitForURL('**/login.html?next=*');
    await page.screenshot({path: 'test-results/login-desktop.png', fullPage: true});
    const guest = JSON.parse(await page.evaluate(() => localStorage.getItem('mew_session_v1')));
    await page.setViewportSize({width: 390, height: 844});
    await page.screenshot({path: 'test-results/login-mobile.png', fullPage: true});
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    await page.getByRole('link', {name: 'Crie sua conta', exact: true}).click();
    await page.screenshot({path: 'test-results/cadastro-mobile.png', fullPage: true});
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    await page.setViewportSize({width: 1280, height: 900});
    await page.screenshot({path: 'test-results/cadastro-desktop.png', fullPage: true});
    await page.getByLabel('Nome', {exact: true}).fill('Teste navegador');
    await page.getByLabel('E-mail', {exact: true}).fill(email);
    await page.getByLabel('Senha', {exact: true}).fill(password);
    await page.getByRole('button', {name: 'Mostrar', exact: true}).click();
    assert.equal(await page.locator('#senha').getAttribute('type'), 'text');
    await page.getByRole('button', {name: 'Ocultar', exact: true}).click();
    await page.getByLabel('Confirmar senha', {exact: true}).fill('Outra senha longa diferente!');
    await page.getByRole('button', {name: 'Criar minha conta', exact: true}).click();
    assert.equal(await page.locator('#confirmar-senha').evaluate(input => input.validity.customError), true);
    await page.getByLabel('Confirmar senha', {exact: true}).fill(password);
    await page.getByRole('button', {name: 'Criar minha conta', exact: true}).click();
    await page.waitForURL('**/quiz.html?animal=pe-1');
    assert.equal(JSON.parse(await page.evaluate(() => localStorage.getItem('mew_session_v1'))).id, guest.id);
    await page.getByRole('button', {name: /Fácil/}).click();
    await page.locator('.pergunta-texto p').waitFor();
    const session = JSON.parse(await page.evaluate(() => localStorage.getItem('mew_session_v1')));
    const attemptId = await page.evaluate(() => localStorage.getItem('mew_attempt:pe-1'));
    const auth = {Authorization: `Bearer ${session.token}`};
    const initial = await (await context.request.get(`${base}/api/tentativas/${attemptId}`, {headers: auth})).json();
    assert.equal(initial.perguntas.length, 5);
    assert.ok(!JSON.stringify(initial).includes('"correta"'));

    // Servidor grava, mas a primeira resposta da rede se perde: retry não duplica.
    let loseResponse = true;
    const answerRoute = `${base}/api/tentativas/${attemptId}/respostas`;
    await page.route(answerRoute, async route => {
      if (loseResponse) { loseResponse = false; await route.fetch(); await route.abort(); }
      else await route.continue();
    });
    async function choose(correct = true) {
      const text = await page.locator('.pergunta-texto p').textContent();
      const normalized = value => value.normalize('NFC').replace(/\s+/gu, ' ').trim();
      const question = questions['pe-1'].facil.find(q => normalized(q.pergunta) === normalized(text));
      assert.ok(question, `Pergunta mostrada pertence ao catálogo: ${text}`);
      await page.locator('.btn-opcao').nth(correct ? question.correta : (question.correta + 1) % 4).click();
    }
    await choose();
    await page.locator('#erroEnvio').waitFor();
    await choose();
    await page.locator('#btnProxima').waitFor();
    await page.locator('#btnProxima').click();
    await choose();
    await page.locator('#btnProxima').click();
    await page.reload();
    await page.getByText('Pergunta 3 de 5', {exact: true}).waitFor();
    for (let i = 2; i < 5; i++) {
      await choose(i !== 4);
      await page.locator('#btnProxima').click();
    }
    await page.locator('.selo-credencial').waitFor();
    await page.locator('#recomendacoes a').first().waitFor();
    assert.equal(await page.locator('.resultado-placar').innerText(), '4/5');
    const result = await (await context.request.get(`${base}/api/tentativas/${attemptId}`, {headers: auth})).json();
    assert.equal(result.respostas.length, 5);
    assert.equal(result.resultado.acertos, 4);
    assert.ok(result.resultado.selo.conquistado);
    await page.screenshot({path: 'test-results/quiz-resultado.png', fullPage: true});
    const ownDownload = page.waitForEvent('download');
    await page.locator('#btnExportar').click();
    const ownFile = await ownDownload;
    await ownFile.saveAs('test-results/respostas-participante.csv');
    const csv = fs.readFileSync('test-results/respostas-participante.csv', 'utf8');
    assert.ok(csv.includes(attemptId));
    await page.reload();
    await page.locator('.selo-credencial').waitFor();

    await page.getByRole('link', {name: 'Meu histórico', exact: true}).click();
    await page.getByRole('link', {name: 'Ver resultado e baixar respostas'}).waitFor();
    await page.getByRole('link', {name: 'Ver resultado e baixar respostas'}).click();
    await page.locator('.selo-credencial').waitFor();
    await page.locator('#recomendacoes a').first().click();
    await page.locator('.pergunta-texto p').waitFor();
    assert.match(await page.locator('.badge-dificuldade').textContent(), /Intermediário/i);

    await page.goto(`${base}/relatorios.html`);
    await page.locator('#especie option[value="pe-1"]').waitFor({state: 'attached'});
    await page.locator('#chave').fill('chave-incorreta');
    await page.getByRole('button', {name: 'Baixar respostas em CSV'}).click();
    await page.getByText('Chave da equipe ausente ou inválida.', {exact: true}).waitFor();
    await page.locator('#chave').fill(process.env.MEW_TEST_ADMIN_TOKEN);
    const adminDownload = page.waitForEvent('download');
    await page.getByRole('button', {name: 'Baixar respostas em CSV'}).click();
    await (await adminDownload).saveAs('test-results/respostas-equipe.csv');
    assert.equal(fs.readFileSync('test-results/respostas-equipe.csv', 'utf8'), csv);

    await page.goto(`${base}/index.html`);
    await page.locator('[data-aba="mewdex"]').click();
    await page.locator('.mewdex-card').first().waitFor();
    assert.equal(await page.locator('.mewdex-card').count(), 10);
    assert.equal(await page.locator('.mewdex-card').first().getAttribute('href'), 'detalhes.html?id=pe-1');
    // Mesmo fluxo em tela estreita, usando o resultado já salvo.
    await page.setViewportSize({width: 390, height: 844});
    await page.goto(`${base}/quiz.html?animal=pe-1&tentativa=${attemptId}`);
    await page.locator('.selo-credencial').waitFor();
    await page.screenshot({path: 'test-results/quiz-mobile.png', fullPage: true});
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    assert.equal(overflow, false, 'Resultado não deve ultrapassar a largura do celular');

    // A saída revoga o token, e o login recupera conta, pontos e resultado salvo.
    await page.goto(`${base}/historico.html`);
    await page.getByRole('link', {name: 'Ver resultado e baixar respostas'}).waitFor();
    await page.getByRole('button', {name: 'Sair da conta', exact: true}).click();
    await page.waitForURL('**/login.html');
    assert.equal(await page.evaluate(() => localStorage.getItem('mew_session_v1')), null);
    assert.equal(await page.evaluate(() => Object.keys(localStorage).some(key => /^mew_(attempt|pending):/.test(key))), false);
    assert.equal((await context.request.get(`${base}/api/participantes/me`, {headers: auth})).status(), 401);
    await page.getByLabel('E-mail', {exact: true}).fill(email);
    await page.getByLabel('Senha', {exact: true}).fill('Senha incorreta de teste');
    await page.getByRole('button', {name: 'Entrar na conta', exact: true}).click();
    await page.getByRole('alert').filter({hasText: 'E-mail ou senha inválidos.'}).waitFor();
    assert.equal(await page.locator('#auth-error').evaluate(element => document.activeElement === element), true);
    await page.getByLabel('Senha', {exact: true}).fill(password);
    await page.getByRole('button', {name: 'Entrar na conta', exact: true}).click();
    await page.waitForURL('**/index.html');
    await page.getByText('Olá, Teste navegador · 4 pontos', {exact: true}).waitFor();
    const restored = JSON.parse(await page.evaluate(() => localStorage.getItem('mew_session_v1')));
    assert.equal(restored.id, session.id);
    assert.notEqual(restored.token, session.token);
    await page.locator('#mew-account').getByRole('link', {name: 'Meu histórico', exact: true}).click();
    await page.getByRole('link', {name: 'Ver resultado e baixar respostas'}).click();
    await page.locator('.selo-credencial').waitFor();

    // Um destino externo nunca é aceito na volta do login.
    await page.goto(`${base}/login.html?next=https%3A%2F%2Fexample.com`);
    await page.getByText('Você está conectado como Teste navegador.', {exact: false}).waitFor();
    assert.equal(await page.getByRole('link', {name: 'Continuar com esta conta'}).getAttribute('href'), 'index.html');

    // Trocar de conta limpa os atalhos locais da pessoa anterior.
    await page.evaluate(() => localStorage.setItem('mew_attempt:pe-1', 'tentativa-da-conta-anterior'));
    await page.goto(`${base}/cadastro.html`);
    await page.getByLabel('Nome', {exact: true}).fill('Outra pessoa');
    await page.getByLabel('E-mail', {exact: true}).fill(`other-${require('node:crypto').randomUUID()}@example.com`);
    await page.getByLabel('Senha', {exact: true}).fill(password);
    await page.getByLabel('Confirmar senha', {exact: true}).fill(password);
    await page.getByRole('button', {name: 'Criar minha conta', exact: true}).click();
    await page.waitForURL('**/index.html');
    await page.getByText('Olá, Outra pessoa · 0 pontos', {exact: true}).waitFor();
    assert.equal(await page.evaluate(() => localStorage.getItem('mew_attempt:pe-1')), null);
    assert.deepEqual(errors, []);
    console.log('E2E OK: cadastro e login pelas telas, validações, logout, retorno ao quiz, recuperação de pontos, troca de conta, quiz, retry, retomada, selo, recomendação, histórico, CSV, catálogo e celular.');
    console.log(`Motor de recomendação: ${(await (await context.request.get(`${base}/api/participantes/me/recomendacoes`, {headers: {Authorization: `Bearer ${restored.token}`}})).json()).motor}`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
