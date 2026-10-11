/* =========================================================
   bioma_oceano_tartaruga_couro.js
   ALTO-MAR PELÁGICO — Tartaruga-de-couro (Dermochelys coriacea)
   Foco: oceano aberto, sem fundo, águas-vivas (alimento),
          plástico flutuante (ameaça), rede de pesca (ameaça),
          mergulho profundo até 1.200 m.
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

  /* ----- Água-viva (alimento da tartaruga-de-couro) ----- */
  function gerarAguaViva(x, y, z, tamanho, cor) {
    const r = (tamanho || 1) * rand(0.18, 0.4);
    const dur = randInt(4000, 8000);
    const amp = rand(0.3, 0.8);
    let tentaculos = '';
    const qtdT = randInt(8, 14);
    for (let i = 0; i < qtdT; i++) {
      const a = (i / qtdT) * Math.PI * 2;
      const dx = Math.cos(a) * r * 0.65;
      const dz = Math.sin(a) * r * 0.65;
      const h = rand(0.4, 1.0);
      tentaculos += '<a-cylinder position="' + dx.toFixed(3) + ' ' + (-h/2 - 0.02).toFixed(3) + ' ' + dz.toFixed(3) + '" radius="0.008" height="' + h.toFixed(3) + '" color="' + cor + '" opacity="0.65" transparent="true"></a-cylinder>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '" animation="property: position; from: ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '; to: ' + x.toFixed(2) + ' ' + (y + amp).toFixed(2) + ' ' + z.toFixed(2) + '; dur: ' + dur + '; dir: alternate; loop: true; easing: easeInOutSine">' +
      '<a-sphere radius="' + r.toFixed(3) + '" color="' + cor + '" material="shader: standard; emissive: ' + cor + '; emissiveIntensity: 0.35; opacity: 0.7; transparent: true" scale="1 0.75 1"></a-sphere>' +
      tentaculos +
      '</a-entity>';
  }

  /* ----- Sacola plástica (ameaça — a tartaruga confunde com água-viva) ----- */
  function gerarSacola(x, y, z) {
    const dur = randInt(7000, 12000);
    const drift = rand(2, 5);
    return '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '" animation="property: position; from: ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '; to: ' + (x + drift).toFixed(2) + ' ' + (y + 0.3).toFixed(2) + ' ' + z.toFixed(2) + '; dur: ' + dur + '; loop: true; easing: easeInOutSine">' +
      '<a-sphere radius="0.18" color="#F8F8F0" material="shader: standard; opacity: 0.55; transparent: true; side: double" scale="1.3 0.9 1"></a-sphere>' +
      '<a-cone position="0 -0.15 0" radius-bottom="0.12" radius-top="0.05" height="0.25" color="#F8F8F0" material="shader: standard; opacity: 0.5; transparent: true" rotation="0 0 0"></a-cone>' +
      '<a-cone position="0.08 -0.12 0.05" radius-bottom="0.05" radius-top="0.02" height="0.15" color="#F8F8F0" material="shader: standard; opacity: 0.5; transparent: true" rotation="0 0 -30"></a-cone>' +
      '<a-cone position="-0.08 -0.12 -0.05" radius-bottom="0.05" radius-top="0.02" height="0.15" color="#F8F8F0" material="shader: standard; opacity: 0.5; transparent: true" rotation="0 0 30"></a-cone>' +
      '</a-entity>';
  }

  /* ----- Rede de pesca flutuante (ameaça) ----- */
  function gerarRede(x, y, z) {
    let html = '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '" animation="property: position; from: ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '; to: ' + (x+3).toFixed(2) + ' ' + (y+0.2).toFixed(2) + ' ' + z.toFixed(2) + '; dur: 14000; loop: true; easing: easeInOutSine">';
    const linhas = 6;
    const cols = 6;
    const esp = 0.25;
    /* Linhas verticais */
    for (let i = 0; i < cols; i++) {
      html += '<a-cylinder position="' + (i*esp - cols*esp/2).toFixed(2) + ' 0 0" radius="0.008" height="' + (linhas*esp).toFixed(2) + '" color="#B0B0A0" material="shader: flat; opacity: 0.6; transparent: true"></a-cylinder>';
    }
    /* Linhas horizontais */
    for (let i = 0; i < linhas; i++) {
      html += '<a-cylinder position="0 ' + (i*esp - linhas*esp/2).toFixed(2) + ' 0" rotation="0 0 90" radius="0.008" height="' + (cols*esp).toFixed(2) + '" color="#B0B0A0" material="shader: flat; opacity: 0.6; transparent: true"></a-cylinder>';
    }
    /* Boias da rede */
    for (let i = 0; i < 3; i++) {
      html += '<a-sphere position="' + rand(-0.6, 0.6).toFixed(2) + ' ' + rand(-0.6, 0.6).toFixed(2) + ' 0.15" radius="0.06" color="#F0A020"></a-sphere>';
    }
    html += '</a-entity>';
    return html;
  }

  /* ----- Barco pesqueiro distante ----- */
  function gerarBarcoDistante(x, y, z) {
    return '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '" bobber="amp: 0.08; dur: 3200">' +
      '<a-box width="1.5" height="0.2" depth="0.4" color="#3A2818"></a-box>' +
      '<a-box position="0 0.25 0" width="1.0" height="0.15" depth="0.3" color="#5A4028"></a-box>' +
      '<a-cylinder position="0 0.7 0" radius="0.03" height="1.0" color="#3A2818"></a-cylinder>' +
      '<a-plane position="0.35 1.15 0" width="0.6" height="0.5" color="#E8E0C0" material="shader: flat; side: double; opacity: 0.9; transparent: true"></a-plane>' +
      '<a-plane position="-0.35 1.15 0" width="0.6" height="0.5" color="#E8E0C0" material="shader: flat; side: double; opacity: 0.9; transparent: true"></a-plane>' +
      '<a-entity position="0 1.8 0" light="type: point; color: #FFF0C0; intensity: 0.5; distance: 3"></a-entity>' +
      '</a-entity>';
  }

  /* ----- Peixe pequeno (sardinha / atum pequeno) ----- */
  function gerarPeixePelagico(x, y, z, cor, tam) {
    const t = (tam || 1) * rand(0.8, 1.2);
    const dur = randInt(8000, 14000);
    const dist = rand(4, 8);
    const dir = Math.random() > 0.5 ? 1 : -1;
    return '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '" animation="property: position; from: ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '; to: ' + (x+dist*dir).toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '; dur: ' + dur + '; dir: alternate; loop: true; easing: easeInOutSine">' +
      '<a-sphere radius="' + (0.05*t).toFixed(3) + '" color="' + cor + '" scale="2.0 0.9 0.5"></a-sphere>' +
      '<a-cone position="' + (0.1*t).toFixed(3) + ' 0 0" rotation="0 0 -90" radius-bottom="' + (0.05*t).toFixed(3) + '" radius-top="0" height="' + (0.1*t).toFixed(3) + '" color="' + cor + '"></a-cone>' +
      '</a-entity>';
  }

  /* ----- Cardume pelágico ----- */
  function gerarCardumePelagico(cx, cy, cz, cor, qtd) {
    let html = '<a-entity position="' + cx.toFixed(2) + ' ' + cy.toFixed(2) + ' ' + cz.toFixed(2) + '">';
    for (let i = 0; i < (qtd || randInt(8, 12)); i++) {
      html += gerarPeixePelagico(rand(-1.2, 1.2), rand(-0.5, 0.5), rand(-1.2, 1.2), cor, 0.7);
    }
    html += '</a-entity>';
    return html;
  }

  /* ----- Bolha ----- */
  function gerarBolha(x, y0, z, y1) {
    const dur = randInt(5000, 10000);
    const r = rand(0.03, 0.08);
    return '<a-sphere position="' + x.toFixed(2) + ' ' + y0.toFixed(2) + ' ' + z.toFixed(2) + '" radius="' + r.toFixed(3) + '" color="#E0F8FF" material="shader: standard; opacity: 0.35; transparent: true; emissive: #B0E8F5; emissiveIntensity: 0.5" animation="property: position; from: ' + x.toFixed(2) + ' ' + y0.toFixed(2) + ' ' + z.toFixed(2) + '; to: ' + x.toFixed(2) + ' ' + y1.toFixed(2) + ' ' + z.toFixed(2) + '; dur: ' + dur + '; loop: true; easing: linear"></a-sphere>';
  }

  /* ----- Raio de sol penetrando na água ----- */
  function gerarRaioSol(x, z, alt, r) {
    return '<a-cone position="' + x.toFixed(2) + ' ' + (alt/2 + 3).toFixed(2) + ' ' + z.toFixed(2) + '" radius-bottom="' + r.toFixed(2) + '" radius-top="' + (r*0.4).toFixed(2) + '" height="' + alt.toFixed(2) + '" color="#A0D8F0" material="shader: flat; opacity: 0.06; transparent: true; side: double"></a-cone>';
  }

  function montarBiomaOceanoTartarugaCouro(animal, opts) {
    opts = opts || {};
    const denso = opts.densidade !== 'baixa';

    /* Céu ao horizonte, água profunda em baixo */
    const skyTopo = '#2A5A80', skyBase = '#8AC0D8';

    const skySrc = window.MewBiomas && window.MewBiomas.criarTexturaGradiente
      ? window.MewBiomas.criarTexturaGradiente(skyTopo, skyBase)
      : null;

    let html = skySrc
      ? '<a-sky src="' + skySrc + '" color="' + skyBase + '"></a-sky>'
      : '<a-sky color="' + skyBase + '"></a-sky>';

    /* Camada de água profunda (azul escuro "sólido" abaixo) */
    html += '<a-circle position="0 -3 0" rotation="-90 0 0" radius="90" color="#0A2A5A" shadow="receive: true"></a-circle>';
    html += '<a-circle position="0 -2.5 0" rotation="-90 0 0" radius="90" color="#123A6A" opacity="0.75" transparent="true"></a-circle>';

    /* Superfície da água (bem alta, quase no topo) */
    html += '<a-circle position="0 3.0 0" rotation="-90 0 0" radius="90" color="#4A90B8" opacity="0.4" transparent="true"></a-circle>';
    html += '<a-circle position="0 3.02 0" rotation="-90 0 0" radius="90" color="#A8D8F0" opacity="0.12" transparent="true"></a-circle>';

    /* Linhas de horizonte: manchas claras */
    for (let i = 0; i < (denso ? 12 : 6); i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(20, 40);
      html += '<a-circle position="' + (Math.cos(a)*r).toFixed(2) + ' 2.99 ' + (Math.sin(a)*r).toFixed(2) + '" rotation="-90 0 0" radius="' + rand(2,4).toFixed(2) + '" color="#A8D8F0" opacity="0.35" transparent="true"></a-circle>';
    }

    /* Raios de sol atravessando a água */
    for (let i = 0; i < (denso ? 8 : 4); i++) {
      const p = pos(3, 18);
      html += gerarRaioSol(p.x, p.z, rand(6, 9), rand(1.2, 2.2));
    }

    /* ÁGUAS-VIVAS (alimento principal) — elemento único */
    const coresMedusa = ['#F0C8F0', '#C8E8F8', '#F8E0C8', '#E0D0F8', '#F0E8C8'];
    const nMedusas = denso ? 40 : 22;
    for (let i = 0; i < nMedusas; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(1.5, 16);
      const y = rand(0.2, 3.5);
      const tam = rand(0.5, 1.6);
      html += gerarAguaViva(Math.cos(a)*r, y, Math.sin(a)*r, tam, pick(coresMedusa));
    }
    /* Cardume de águas-vivas (grande aglomerado) */
    for (let i = 0; i < (denso ? 12 : 6); i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(0, 2.5);
      html += gerarAguaViva(-6 + Math.cos(a)*r, rand(0.5, 2.5), -5 + Math.sin(a)*r, rand(0.8, 1.4), pick(coresMedusa));
    }

    /* SACOLAS PLÁSTICAS (ameaça — a tartaruga confunde com medusa) */
    const nSacolas = denso ? 14 : 8;
    for (let i = 0; i < nSacolas; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(2, 14);
      html += gerarSacola(Math.cos(a)*r, rand(0.5, 3.2), Math.sin(a)*r);
    }

    /* REDES DE PESCA (ameaça) */
    html += gerarRede(-7, 1.2, -6);
    html += gerarRede(8, 2.0, 4);
    if (denso) html += gerarRede(2, 0.8, -9);

    /* BARCOS PESQUEIROS ao longe */
    html += gerarBarcoDistante(-18, 2.9, 15);
    html += gerarBarcoDistante(22, 2.9, -12);
    if (denso) html += gerarBarcoDistante(-25, 2.9, -8);

    /* Peixes pelágicos */
    const coresPeixes = ['#4A7A90', '#6A9AA8', '#3A5A78', '#8AC0D8'];
    for (let i = 0; i < (denso ? 18 : 10); i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(3, 14);
      html += gerarPeixePelagico(Math.cos(a)*r, rand(0.4, 2.8), Math.sin(a)*r, pick(coresPeixes), rand(0.9, 1.4));
    }
    /* Cardumes */
    for (let i = 0; i < (denso ? 4 : 2); i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(6, 16);
      html += gerarCardumePelagico(Math.cos(a)*r, rand(0.8, 2.5), Math.sin(a)*r, pick(coresPeixes), randInt(8, 12));
    }

    /* Bolhas subindo */
    for (let i = 0; i < (denso ? 40 : 24); i++) {
      const p = pos(0, 18);
      html += gerarBolha(p.x, rand(-2.5, 0.5), p.z, rand(2.6, 3.0));
    }

    /* Hotspots */
    html += '<a-entity position="0 2.0 3.5" info-hotspot="titulo: Tartaruga-de-couro; descricao: Dermochelys coriacea — maior tartaruga do mundo. Mergulha até 1.200 m para caçar águas-vivas. Criticamente em Perigo no Brasil.; cor: #4A7A90"></a-entity>';
    html += '<a-entity position="-6 2.0 -5" info-hotspot="titulo: Águas-vivas; descricao: Alimento principal da tartaruga-de-couro. Sua boca sem dentes é adaptada para engolir medusas inteiras.; cor: #F0C8F0"></a-entity>';
    html += '<a-entity position="6 1.8 4" info-hotspot="titulo: Sacola plástica; descricao: A MAIOR ameaça. Flutuando, parece uma água-viva — a tartaruga come e morre por obstrução intestinal.; cor: #F8F8F0"></a-entity>';
    html += '<a-entity position="-7 1.5 -6" info-hotspot="titulo: Rede de pesca; descricao: Captura acidental em redes de deriva mata milhares de tartarugas por ano no Atlântico.; cor: #B0B0A0"></a-entity>';
    html += '<a-entity position="18 3.2 15" info-hotspot="titulo: Barco pesqueiro; descricao: Frota industrial e artesanal divide o oceano com a tartaruga-de-couro. Fiscalização é essencial.; cor: #3A2818"></a-entity>';
    html += '<a-entity position="4 2.2 -8" info-hotspot="titulo: Peixes pelágicos; descricao: Pequenos cardumes vivem na zona pelágica. Sustentam atuns, tubarões e aves marinhas.; cor: #4A7A90"></a-entity>';
    html += '<a-entity position="-4 3.0 -10" info-hotspot="titulo: Alto-mar (pelágico); descricao: Zona oceânica aberta, longe da costa. A tartaruga-de-couro passa a maior parte da vida aqui, migrando milhares de km.; cor: #2A5A80"></a-entity>';
    html += '<a-entity position="0 3.5 -14" info-hotspot="titulo: Desova no litoral; descricao: No Brasil, desova principalmente no Espírito Santo. Volta à praia a cada 2-3 anos para botar ~100 ovos.; cor: #C8B080"></a-entity>';
    html += '<a-entity position="-10 1.5 8" info-hotspot="titulo: Mergulho profundo; descricao: Suporta pressão de mais de 120 atm. Adaptações únicas no tórax permitem colapso controlado.; cor: #0A2A5A"></a-entity>';

    /* Iluminação dramática azulada */
    html += '<a-entity light="type: ambient; color: #6A90B8; intensity: 0.6"></a-entity>' +
            '<a-entity position="6 18 6" light="type: directional; color: #C8E8F8; intensity: 0.9; castShadow: true; shadowMapWidth: 1024; shadowMapHeight: 1024"></a-entity>' +
            '<a-entity position="-4 5 -4" light="type: point; color: #5A9AC8; intensity: 0.35; distance: 14"></a-entity>' +
            '<a-entity position="2 2 -8" light="type: point; color: #3A6A98; intensity: 0.3; distance: 10"></a-entity>';

    return { html, bioma: { nome: 'Oceano Aberto (Pelágico)', skyTopo, skyBase, fog: '#2A5A80', fogDensity: 0.045 } };
  }

  if (!window.MewBiomas) { console.warn('[bioma_oceano_tartaruga_couro] biomas_fauna.js ausente.'); return; }

  const _detectar = window.MewBiomas.detectarBioma;
  window.MewBiomas.detectarBioma = function (animal) {
    const nome = (animal.nome_popular || '').toLowerCase();
    if (nome.indexOf('tartaruga-de-couro') !== -1 || nome.indexOf('tartaruga de couro') !== -1) {
      return 'oceanoTartarugaCouro';
    }
    return _detectar.call(this, animal);
  };

  const _montar = window.MewBiomas.montarCena3D;
  window.MewBiomas.montarCena3D = function (animal, opts) {
    const chave = window.MewBiomas.detectarBioma(animal);
    if (chave === 'oceanoTartarugaCouro') return montarBiomaOceanoTartarugaCouro(animal, opts);
    return _montar.call(this, animal, opts);
  };

  window.MewBiomas.montarBiomaOceanoTartarugaCouro = montarBiomaOceanoTartarugaCouro;
  console.log('[bioma_oceano_tartaruga_couro] Bioma Oceano Aberto (Tartaruga-de-couro) registrado.');
})();