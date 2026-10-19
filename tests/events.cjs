// Executa os pontos reais de integração com a API, isolando o renderizador 3D.
const fs = require('node:fs');
const assert = require('node:assert/strict');

module.exports = async function testEvents(context, base) {
  const page = await context.newPage();
  const requests = [];
  page.on('request', request => {
    if (request.url() === `${base}/api/eventos` && request.method() === 'POST') requests.push(request.postDataJSON());
  });
  try {
    await page.route('**/eventos-teste.html?*', route => route.fulfill({contentType: 'text/html', body:
      '<!doctype html><div id="loading"></div><div id="nome-popular"></div><div id="nome-cientifico"></div><div id="nome-bioma"></div>'}));
    await page.goto(`${base}/eventos-teste.html?id=pe-1`);
    await page.evaluate(() => {
      window.AFRAME = {components: {}, registerComponent(name, definition) { this.components[name] = definition; }};
    });
    await page.addScriptTag({url: `${base}/api.js`});
    await page.addScriptTag({url: `${base}/bioma_componentes.js`});
    const html = fs.readFileSync('Site/visualizar3d_fauna.html', 'utf8');
    const start = html.indexOf('async function iniciarFluxoFauna()');
    const end = html.indexOf('function trocarModo(', start);
    assert.ok(start >= 0 && end > start);
    // A função de carregamento é a do produto; apenas a renderização é substituída.
    await page.addScriptTag({content: `const faunaId = 'pe-1', EstadoApp = {}, isMobile = false;
      const params = new URLSearchParams(location.search);
      function trocarModo() {}
      ${html.slice(start, end)}`});
    const exploration = page.waitForResponse(response => response.url() === `${base}/api/eventos`);
    await page.evaluate(() => iniciarFluxoFauna());
    assert.equal((await exploration).status(), 201);
    const hotspot = page.waitForResponse(response => response.url() === `${base}/api/eventos`);
    await page.evaluate(() => {
      window.testHotspot = {aberto: false, popupHTML: null, painelVR: null};
      AFRAME.components['info-hotspot'].toggle.call(testHotspot);
    });
    assert.equal((await hotspot).status(), 201);
    await page.evaluate(() => AFRAME.components['info-hotspot'].toggle.call(testHotspot));
    assert.deepEqual(requests, [
      {especie_id: 'pe-1', tipo: 'exploracao_3d'}, {especie_id: 'pe-1', tipo: 'hotspot'}
    ], 'Carregar o ambiente e abrir o hotspot registram eventos; fechar não registra');
  } finally { await page.close(); }
};
