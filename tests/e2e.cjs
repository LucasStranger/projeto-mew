const {chromium} = require(process.env.MEW_NODE_MODULES ? `${process.env.MEW_NODE_MODULES}/playwright` : 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.MEW_TEST_URL;
const questions = JSON.parse(fs.readFileSync('Site/quiz_perguntas.json', 'utf8'));

(async () => {
  const browser = await chromium.launch({headless: true, ...(process.env.MEW_BROWSER_CHANNEL ? {channel: process.env.MEW_BROWSER_CHANNEL} : {})});
  const context = await browser.newContext({viewport: {width: 1280, height: 900}, acceptDownloads: true});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    // Isola a integração local; as APIs públicas de Pokémon não são parte do teste.
    await context.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
    await page.goto(`${base}/quiz.html?animal=pe-1`);
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
      const text = await page.locator('.pergunta-texto p').innerText();
      const question = questions['pe-1'].facil.find(q => q.pergunta === text);
      assert.ok(question, 'Pergunta mostrada pertence ao catálogo');
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
    assert.deepEqual(errors, []);
    console.log('E2E OK: quiz, retry, retomada, selo, recomendação, histórico, CSV, catálogo e celular.');
    console.log(`Motor de recomendação: ${(await (await context.request.get(`${base}/api/participantes/me/recomendacoes`, {headers: auth})).json()).motor}`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
