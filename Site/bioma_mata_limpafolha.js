/* =========================================================
   bioma_mata_limpafolha.js
   Mata Atlântica de Altitude — Limpa-folha-do-nordeste
   (Philydor novaesi) — possivelmente extinto
   Depende de: bioma_componentes.js
   ========================================================= */
(function () {
  'use strict';

  function rand(a, b) { return a + Math.random() * (b - a); }
  function randInt(a, b) { return Math.floor(rand(a, b + 1)); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function pos(minR, maxR) {
    const a = Math.random() * Math.PI * 2;
    const r = rand(minR, maxR);
    return { x: Math.cos(a) * r, z: Math.sin(a) * r };
  }

  function gerarArvoreAlta(x, z, h) {
    const altura = h || rand(5.5, 9.0);
    const troncoC = pick(['#2E1A0E', '#3A2418', '#241408']);
    const folha1  = pick(['#1A3A1A', '#164018', '#0E3010']);
    const folha2  = pick(['#2A5A28', '#1E4A1E']);
    const rf = rand(1.8, 2.8);
    const rot = rand(0, 360);
    let raizes = '';
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const dx = Math.cos(a) * 0.55;
      const dz = Math.sin(a) * 0.55;
      raizes += '<a-cylinder position="' + dx.toFixed(2) + ' ' + (altura * 0.06).toFixed(2) + ' ' + dz.toFixed(2) + '" radius="0.07" height="' + (altura * 0.16).toFixed(2) + '" color="' + troncoC + '" rotation="' + rand(25,45).toFixed(1) + ' 0 ' + rand(-30,30).toFixed(1) + '"></a-cylinder>';
    }
    let musgo = '';
    for (let i = 0; i < randInt(5, 10); i++) {
      const y = altura * rand(0.1, 0.7);
      const a = rand(0, Math.PI * 2);
      musgo += '<a-sphere position="' + (Math.cos(a) * 0.16).toFixed(2) + ' ' + y.toFixed(2) + ' ' + (Math.sin(a) * 0.16).toFixed(2) + '" radius="' + rand(0.06, 0.12).toFixed(2) + '" color="#2E5A24" scale="1.3 0.6 1.3"></a-sphere>';
    }
    let folhagem = '';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + rand(-0.3, 0.3);
      const r = rf * rand(0.55, 0.95);
      const dy = rand(-0.2, 0.3) * rf;
      const c = pick([folha1, folha2]);
      folhagem += '<a-sphere position="' + (Math.cos(a) * r).toFixed(2) + ' ' + (altura + dy + rf * 0.35).toFixed(2) + ' ' + (Math.sin(a) * r).toFixed(2) + '" radius="' + (rf * rand(0.55, 0.8)).toFixed(2) + '" color="' + c + '" sway-leaf="ampl: ' + rand(3,6).toFixed(1) + '"></a-sphere>';
    }
    folhagem += '<a-sphere position="0 ' + (altura + rf * 0.6).toFixed(2) + ' 0" radius="' + (rf * 0.9).toFixed(2) + '" color="' + folha1 + '"></a-sphere>';
    let epifitas = '';
    for (let i = 0; i < randInt(2, 4); i++) {
      const by = altura * rand(0.3, 0.7);
      const ba = rand(0, Math.PI * 2);
      epifitas += '<a-entity position="' + (Math.cos(ba) * 0.16).toFixed(2) + ' ' + by.toFixed(2) + ' ' + (Math.sin(ba) * 0.16).toFixed(2) + '">' +
        '<a-cone position="0 0 0" radius-bottom="0.14" radius-top="0.06" height="0.16" color="#5A3828"></a-cone>' +
        '<a-cone position="0 0.09 0" radius-bottom="0.13" radius-top="0.02" height="0.14" color="#A03828"></a-cone>' +
        '<a-cone position="0 0.16 0" radius-bottom="0.05" radius-top="0" height="0.1" color="#C8382A"></a-cone>' +
        '</a-entity>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rot.toFixed(1) + ' 0">' +
      raizes + musgo +
      '<a-cylinder position="0 ' + (altura/2).toFixed(2) + ' 0" radius="0.16" height="' + altura.toFixed(2) + '" color="' + troncoC + '" shadow="cast: true"></a-cylinder>' +
      epifitas + folhagem +
      '</a-entity>';
  }

  function gerarSamambaia(x, z) {
    const h = rand(0.5, 1.0);
    const cor = pick(['#1E5A22', '#2A6A28', '#164A18', '#3A7A32']);
    let folhas = '';
    for (let i = 0; i < randInt(7, 10); i++) {
      const a = (i / 10) * Math.PI * 2;
      const comp = h * rand(0.7, 1.3);
      folhas += '<a-plane position="' + (Math.cos(a) * comp * 0.3).toFixed(2) + ' ' + (comp*0.35).toFixed(2) + ' ' + (Math.sin(a) * comp * 0.3).toFixed(2) + '" width="' + (comp*0.95).toFixed(2) + '" height="0.08" color="' + cor + '" material="shader: flat; side: double" rotation="' + rand(40,70).toFixed(1) + ' ' + (a*180/Math.PI).toFixed(1) + ' 0" sway-leaf="ampl: 3"></a-plane>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">' + folhas + '</a-entity>';
  }

  function gerarBromelia(x, z, t) {
    const t2 = t || 1;
    const cor1 = pick(['#A03828', '#C8382A', '#8A3820']);
    const cor2 = '#5A2818';
    const s = t2 * rand(0.8, 1.4);
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0" scale="' + s + ' ' + s + ' ' + s + '">' +
      '<a-cone position="0 0.1 0" radius-bottom="0.28" radius-top="0.16" height="0.16" color="' + cor2 + '"></a-cone>' +
      '<a-cone position="0 0.26 0" radius-bottom="0.24" radius-top="0.05" height="0.22" color="' + cor1 + '"></a-cone>' +
      '<a-cone position="0 0.42 0" radius-bottom="0.1" radius-top="0" height="0.16" color="' + cor1 + '"></a-cone>' +
      '<a-circle position="0 0.28 0" rotation="-90 0 0" radius="0.15" color="#4A8090" opacity="0.7" transparent="true"></a-circle>' +
      '</a-entity>';
  }

  function gerarFolhico(x, z) {
    const cor = pick(['#5A3A20', '#8A5A28', '#6A4A28', '#3A2818', '#A86A28']);
    const w = rand(0.12, 0.24);
    const h = rand(0.08, 0.16);
    return '<a-plane position="' + x.toFixed(2) + ' 0.014 ' + z.toFixed(2) + '" width="' + w.toFixed(2) + '" height="' + h.toFixed(2) + '" color="' + cor + '" material="shader: flat; side: double; opacity: 0.95; transparent: true" rotation="-90 ' + rand(0,360).toFixed(1) + ' 0"></a-plane>';
  }

  function gerarCogumelo(x, z) {
    const cor = pick(['#4A7A8A', '#8A4AD8', '#3AA07A', '#F0A0C0']);
    const h = rand(0.06, 0.14);
    const r = rand(0.04, 0.08);
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">' +
      '<a-cylinder position="0 ' + (h/2).toFixed(3) + ' 0" radius="' + (r*0.3).toFixed(3) + '" height="' + h.toFixed(3) + '" color="#D8D0B8"></a-cylinder>' +
      '<a-sphere position="0 ' + h.toFixed(3) + ' 0" radius="' + r.toFixed(3) + '" color="' + cor + '" material="shader: standard; emissive: ' + cor + '; emissiveIntensity: 0.6" scale="1 0.55 1"></a-sphere>' +
      '</a-entity>';
  }

  function gerarTroncoCaido(x, z) {
    const comp = rand(2.2, 3.8);
    const raio = rand(0.18, 0.26);
    let musgos = '';
    for (let i = 0; i < randInt(6, 10); i++) {
      const dx = rand(-comp/2 + 0.3, comp/2 - 0.3);
      const a = rand(0, Math.PI * 2);
      const dy = Math.cos(a) * raio * 0.9;
      const dz = Math.sin(a) * raio * 0.9;
      musgos += '<a-sphere position="' + dx.toFixed(2) + ' ' + (raio + dy*0.6).toFixed(2) + ' ' + dz.toFixed(2) + '" radius="' + rand(0.09,0.16).toFixed(2) + '" color="#2E5A24" scale="1.4 0.5 1.4"></a-sphere>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' ' + raio.toFixed(2) + ' ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0">' +
      '<a-cylinder position="0 0 0" rotation="0 0 90" radius="' + raio.toFixed(2) + '" height="' + comp.toFixed(2) + '" color="#2E1A0E" shadow="cast: true"></a-cylinder>' +
      musgos + '</a-entity>';
  }

  function gerarSapopema(x, z) {
    let raizes = '';
    for (let i = 0; i < randInt(5, 8); i++) {
      const a = (i / 8) * Math.PI * 2 + rand(-0.3, 0.3);
      const h = rand(0.8, 1.6);
      raizes += '<a-cone position="' + (Math.cos(a) * 0.5).toFixed(2) + ' ' + (h*0.35).toFixed(2) + ' ' + (Math.sin(a) * 0.5).toFixed(2) + '" radius-bottom="0.22" radius-top="0.08" height="' + h.toFixed(2) + '" color="#2E1A0E" rotation="' + rand(75,95).toFixed(1) + ' ' + (a*180/Math.PI).toFixed(1) + ' 0"></a-cone>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">' + raizes + '</a-entity>';
  }

  function gerarRaioCopa(x, z, alt, r) {
    return '<a-cone position="' + x.toFixed(2) + ' ' + (alt/2 + 2).toFixed(2) + ' ' + z.toFixed(2) + '" radius-bottom="' + r.toFixed(2) + '" radius-top="' + (r*0.35).toFixed(2) + '" height="' + alt.toFixed(2) + '" color="#FFF8C8" material="shader: flat; opacity: 0.09; transparent: true; side: double"></a-cone>';
  }

  function gerarLimpaFolha(x, y, z) {
    const vermelho = '#8A2818', vermelhoEsc = '#5A1808', marrom = '#6A3A1A';
    return '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '" ghost-fade="dur: 6000">' +
      '<a-sphere radius="0.09" color="' + vermelho + '" material="shader: standard; emissive: ' + vermelho + '; emissiveIntensity: 0.5; opacity: 0.4; transparent: true" scale="1.4 1 1"></a-sphere>' +
      '<a-sphere position="0.11 0.07 0" radius="0.065" color="' + vermelho + '" material="shader: standard; emissive: ' + vermelho + '; emissiveIntensity: 0.5; opacity: 0.4; transparent: true"></a-sphere>' +
      '<a-cone position="0.18 0.07 0" rotation="0 0 -90" radius-bottom="0.02" radius-top="0" height="0.05" color="' + vermelhoEsc + '" material="shader: standard; opacity: 0.5; transparent: true"></a-cone>' +
      '<a-sphere position="0.15 0.10 0.03" radius="0.008" color="#000" material="shader: standard; opacity: 0.7; transparent: true"></a-sphere>' +
      '<a-sphere position="-0.05 0.02 0.06" radius="0.065" color="' + marrom + '" material="shader: standard; emissive: ' + marrom + '; emissiveIntensity: 0.3; opacity: 0.35; transparent: true" scale="1.3 0.5 1"></a-sphere>' +
      '<a-sphere position="-0.05 0.02 -0.06" radius="0.065" color="' + marrom + '" material="shader: standard; emissive: ' + marrom + '; emissiveIntensity: 0.3; opacity: 0.35; transparent: true" scale="1.3 0.5 1"></a-sphere>' +
      '<a-cone position="-0.14 0 0" rotation="0 0 90" radius-bottom="0.04" radius-top="0.02" height="0.12" color="' + vermelhoEsc + '" material="shader: standard; opacity: 0.4; transparent: true"></a-cone>' +
      '</a-entity>';
  }

  function gerarMemorial(x, z, rot) {
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rot.toFixed(1) + ' 0">' +
      '<a-cylinder position="-0.7 0.7 0" radius="0.05" height="1.4" color="#3A2818"></a-cylinder>' +
      '<a-cylinder position="0.7 0.7 0" radius="0.05" height="1.4" color="#3A2818"></a-cylinder>' +
      '<a-box position="0 1.6 0" width="1.8" height="1.0" depth="0.06" color="#1A1A1A"></a-box>' +
      '<a-box position="0 1.6 0.035" width="1.72" height="0.92" depth="0.03" color="#2A2A2A"></a-box>' +
      '<a-text value="EM MEMÓRIA" position="0 1.85 0.06" align="center" color="#E8D5FF" width="2.6" font="mozillavr"></a-text>' +
      '<a-text value="Limpa-folha-do-nordeste" position="0 1.65 0.06" align="center" color="#C0A0E8" width="2.2" font="mozillavr"></a-text>' +
      '<a-text value="Philydor novaesi" position="0 1.48 0.06" align="center" color="#A080D0" width="2.0" font="mozillavr"></a-text>' +
      '<a-text value="Último registro: 2011 · PE" position="0 1.32 0.06" align="center" color="#8A7AB0" width="2.0" font="mozillavr"></a-text>' +
      '<a-entity position="0 1.1 0.06" light="type: point; color: #A080D0; intensity: 0.3; distance: 1.5"></a-entity>' +
      '</a-entity>';
  }

  function montarBiomaMataLimpafolha(animal, opts) {
    opts = opts || {};
    const denso = opts.densidade !== 'baixa';
    const skyTopo = '#3A5A6A', skyBase = '#6A8A7A', chaoBase = '#1E2E18', chaoVar = '#2A3A22';

    const skySrc = window.MewBiomas && window.MewBiomas.criarTexturaGradiente
      ? window.MewBiomas.criarTexturaGradiente(skyTopo, skyBase)
      : null;

    let html = skySrc
      ? '<a-sky src="' + skySrc + '" color="' + skyBase + '"></a-sky>'
      : '<a-sky color="' + skyBase + '"></a-sky>';

    html += '<a-circle position="0 0 0" rotation="-90 0 0" radius="90" color="' + chaoBase + '" shadow="receive: true"></a-circle>';

    for (let i = 0; i < (denso ? 30 : 18); i++) {
      const p = pos(2, 35);
      const r = rand(1.5, 4);
      const cor = Math.random() > 0.5 ? chaoVar : '#3A2818';
      html += '<a-circle position="' + p.x.toFixed(2) + ' 0.006 ' + p.z.toFixed(2) + '" rotation="-90 0 0" radius="' + r.toFixed(2) + '" color="' + cor + '" opacity="0.5" transparent="true"></a-circle>';
    }

    for (let i = 0; i < (denso ? 8 : 4); i++) {
      const p = pos(8, 25);
      const r = rand(3, 6);
      html += '<a-circle position="' + p.x.toFixed(2) + ' 0.3 ' + p.z.toFixed(2) + '" rotation="-90 0 0" radius="' + r.toFixed(2) + '" color="#A8B8C0" material="shader: flat; opacity: 0.15; transparent: true; side: double"></a-circle>';
    }

    for (let i = 0; i < (denso ? 10 : 5); i++) {
      const p = pos(2, 18);
      html += gerarRaioCopa(p.x, p.z, rand(7, 10), rand(0.8, 1.8));
    }

    for (let i = 0; i < (denso ? 30 : 18); i++) {
      const a = (i / (denso ? 30 : 18)) * Math.PI * 2 + rand(-0.2, 0.2);
      const r = 10 + Math.random() * 22;
      html += gerarArvoreAlta(Math.cos(a) * r, Math.sin(a) * r, rand(5.5, 9.0));
    }
    for (let i = 0; i < (denso ? 8 : 4); i++) {
      const p = pos(6, 14);
      html += gerarArvoreAlta(p.x, p.z, rand(6.5, 9.0));
    }

    for (let i = 0; i < (denso ? 10 : 6); i++) {
      const p = pos(4, 20);
      html += gerarSapopema(p.x, p.z);
    }
    for (let i = 0; i < (denso ? 8 : 4); i++) {
      const p = pos(4, 18);
      html += gerarTroncoCaido(p.x, p.z);
    }

    for (let i = 0; i < (denso ? 50 : 30); i++) {
      const p = pos(1.5, 22);
      html += gerarSamambaia(p.x, p.z);
    }
    for (let i = 0; i < (denso ? 30 : 18); i++) {
      const p = pos(2, 20);
      html += gerarBromelia(p.x, p.z, rand(0.8, 1.5));
    }
    for (let i = 0; i < (denso ? 100 : 55); i++) {
      const p = pos(1, 25);
      html += gerarFolhico(p.x, p.z);
    }
    for (let i = 0; i < (denso ? 30 : 15); i++) {
      const p = pos(1.5, 20);
      html += gerarCogumelo(p.x, p.z);
    }

    html += gerarLimpaFolha(-2.0, 1.2, -3.0);
    html += gerarLimpaFolha(2.5, 1.5, -4.0);
    html += gerarLimpaFolha(-3.2, 0.9, 2.0);
    if (denso) {
      html += gerarLimpaFolha(3.5, 1.4, 1.8);
      html += gerarLimpaFolha(0.5, 1.8, -6.0);
    }

    html += gerarMemorial(-4, -5, 30);

    html += '<a-entity position="0 2.2 2.5" info-hotspot="titulo: Limpa-folha-do-nordeste; descricao: Philydor novaesi — ave vermelho-tijolo de 18 cm. Visto por último em 2011. Provavelmente extinto na natureza.; cor: #8A2818"></a-entity>';
    html += '<a-entity position="-3.5 0.8 -3" info-hotspot="titulo: Samambaia; descricao: Indicador de mata úmida preservada. Camada baixa que mantém a umidade do solo.; cor: #2A6A28"></a-entity>';
    html += '<a-entity position="3.5 1.0 -4" info-hotspot="titulo: Bromélia gigante; descricao: Reservatório natural de água. Berçário de sapos, insetos e fonte de água para as aves.; cor: #C8382A"></a-entity>';
    html += '<a-entity position="-2 0.6 3" info-hotspot="titulo: Folhiço; descricao: Camada de folhas secas. O limpa-folha catava insetos aqui com o bico em forma de gancho.; cor: #8A5A28"></a-entity>';
    html += '<a-entity position="5 2.8 -6" info-hotspot="titulo: Dossel fechado; descricao: Copas que se tocam. Estrato superior onde o limpa-folha forrageava em bandos mistos.; cor: #164018"></a-entity>';
    html += '<a-entity position="-5 2.5 -8" info-hotspot="titulo: Tronco com musgo; descricao: Troncos caídos cobertos de musgo. Abrigam invertebrados que alimentam a ave.; cor: #2E5A24"></a-entity>';
    html += '<a-entity position="-4 1.6 -5" info-hotspot="titulo: Memorial; descricao: Último registro em 2011, em Pernambuco. A espécie é símbolo da extinção causada pelo desmatamento.; cor: #A080D0"></a-entity>';
    html += '<a-entity position="4 1.0 -6" info-hotspot="titulo: Mata Atlântica de altitude; descricao: 400-550 m, com névoa constante. Uma das matas mais úmidas e ameaçadas do planeta.; cor: #3A5A6A"></a-entity>';
    html += '<a-entity position="2 3.2 -12" info-hotspot="titulo: Centro de Endemismo PE; descricao: Região entre Alagoas e Pernambuco. Restam menos de 2% da cobertura original.; cor: #2E5A24"></a-entity>';
    html += '<a-entity position="-6 0.9 5" info-hotspot="titulo: Fragmentação; descricao: Retalhos de mata isolados condenam espécies endêmicas. É a maior ameaça à biodiversidade.; cor: #E8482A"></a-entity>';

    html += '<a-entity light="type: ambient; color: #A8C8B8; intensity: 0.5"></a-entity>' +
            '<a-entity position="3 14 4" light="type: directional; color: #E8F0D8; intensity: 0.85; castShadow: true; shadowMapWidth: 2048; shadowMapHeight: 2048"></a-entity>' +
            '<a-entity position="-4 4 -2" light="type: point; color: #A8D0B8; intensity: 0.35; distance: 14"></a-entity>' +
            '<a-entity position="2 3 3" light="type: point; color: #C8E8C8; intensity: 0.25; distance: 10"></a-entity>';

    return { html, bioma: { nome: 'Mata Atlântica de Altitude', skyTopo, skyBase, fog: '#4A6A5A', fogDensity: 0.06 } };
  }

  if (!window.MewBiomas) { console.warn('[bioma_mata_limpafolha] biomas_fauna.js ausente.'); return; }

  const _detectar = window.MewBiomas.detectarBioma;
  window.MewBiomas.detectarBioma = function (animal) {
    const nome = (animal.nome_popular || '').toLowerCase();
    if (nome.indexOf('limpa-folha') !== -1 || nome.indexOf('limpa folha') !== -1) {
      return 'mataLimpafolha';
    }
    return _detectar.call(this, animal);
  };

  const _montar = window.MewBiomas.montarCena3D;
  window.MewBiomas.montarCena3D = function (animal, opts) {
    const chave = window.MewBiomas.detectarBioma(animal);
    if (chave === 'mataLimpafolha') return montarBiomaMataLimpafolha(animal, opts);
    return _montar.call(this, animal, opts);
  };

  window.MewBiomas.montarBiomaMataLimpafolha = montarBiomaMataLimpafolha;
  console.log('[bioma_mata_limpafolha] Bioma Mata Atlântica de Altitude (Limpa-folha) registrado.');
})();