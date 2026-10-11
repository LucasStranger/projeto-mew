/* =========================================================
   bioma_transicao_jaguatirica.js
   Zona de TRANSIÇÃO Mata Atlântica ↔ Caatinga — Jaguatirica
   (Leopardus pardalis) — PE: Zona da Mata, Agreste e Sertão.
   Foco: rodovia BR-232 com placas, mata ciliar, fragmentação.
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

  /* ----- Árvore da Mata Atlântica (verde) ----- */
  function gerarArvoreMata(x, z) {
    const altura = rand(3.5, 5.5);
    const tronco = '#3A2418';
    const folha = pick(['#2E6A30', '#3A8A3A', '#1E5A22']);
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0">' +
      '<a-cylinder position="0 ' + (altura/2).toFixed(2) + ' 0" radius="0.14" height="' + altura.toFixed(2) + '" color="' + tronco + '"></a-cylinder>' +
      '<a-sphere position="0 ' + (altura + 0.4).toFixed(2) + ' 0" radius="1.1" color="' + folha + '" sway-leaf="ampl: 4"></a-sphere>' +
      '<a-sphere position="0.6 ' + (altura + 0.1).toFixed(2) + ' 0.3" radius="0.8" color="' + folha + '"></a-sphere>' +
      '<a-sphere position="-0.5 ' + (altura + 0.3).toFixed(2) + ' -0.4" radius="0.75" color="' + folha + '"></a-sphere>' +
      '</a-entity>';
  }

  /* ----- Juazeiro / aroeira (Caatinga seca) ----- */
  function gerarArvoreCaatinga(x, z) {
    const altura = rand(2.5, 4.0);
    const tronco = '#5A3A20';
    const folha = pick(['#7A8A4A', '#8A7A3A', '#6A7A42']);
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0">' +
      '<a-cylinder position="0 ' + (altura/2).toFixed(2) + ' 0" radius="0.12" height="' + altura.toFixed(2) + '" color="' + tronco + '"></a-cylinder>' +
      '<a-sphere position="0 ' + (altura + 0.4).toFixed(2) + ' 0" radius="0.9" color="' + folha + '" sway-dry="ampl: 5"></a-sphere>' +
      '<a-sphere position="0.5 ' + (altura + 0.1).toFixed(2) + ' 0.3" radius="0.6" color="' + folha + '"></a-sphere>' +
      '<a-sphere position="-0.4 ' + (altura + 0.3).toFixed(2) + ' -0.35" radius="0.55" color="' + folha + '"></a-sphere>' +
      '</a-entity>';
  }

  /* ----- Mandacaru ----- */
  function gerarMandacaru(x, z) {
    const altura = rand(1.5, 2.8);
    const cor = '#3E7A3E';
    let bracos = '';
    for (let i = 0; i < randInt(1, 3); i++) {
      const a = rand(0, Math.PI * 2);
      const bh = altura * rand(0.4, 0.6);
      const dx = Math.cos(a) * 0.35;
      const dz = Math.sin(a) * 0.35;
      bracos += '<a-cylinder position="' + dx.toFixed(2) + ' ' + (bh*0.85).toFixed(2) + ' ' + dz.toFixed(2) + '" radius="0.1" height="' + (bh*0.7).toFixed(2) + '" color="' + cor + '"></a-cylinder>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0">' +
      '<a-cylinder position="0 ' + (altura/2).toFixed(2) + ' 0" radius="0.15" height="' + altura.toFixed(2) + '" color="' + cor + '"></a-cylinder>' +
      bracos +
      '<a-sphere position="0 ' + altura.toFixed(2) + ' 0" radius="0.15" color="' + cor + '"></a-sphere>' +
      '</a-entity>';
  }

  /* ----- Fragmento de mata ciliar (árvores densas + água) ----- */
  function gerarMataCiliar(x, z) {
    let html = '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">';
    /* Riacho */
    html += '<a-circle position="0 0.02 0" rotation="-90 0 0" radius="2.2" color="#4A90B8" material="shader: standard; opacity: 0.75; transparent: true; emissive: #2A6A90; emissiveIntensity: 0.3"></a-circle>';
    /* Árvores densas ao redor */
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const r = rand(2.5, 3.5);
      html += gerarArvoreMata(Math.cos(a) * r, Math.sin(a) * r);
    }
    html += '</a-entity>';
    return html;
  }

  /* ----- Rodovia (asfalto) ----- */
  function gerarRodovia() {
    /* Faixa de asfalto em diagonal atravessando a cena */
    let html = '<a-entity position="0 0.02 0" rotation="0 35 0">';
    html += '<a-plane position="0 0 0" rotation="-90 0 0" width="5" height="80" color="#2A2A2A"></a-plane>';
    /* Linhas centrais tracejadas */
    for (let i = -18; i <= 18; i += 2) {
      html += '<a-plane position="0 0.005 ' + i + '" rotation="-90 0 0" width="0.15" height="1.2" color="#F0E8A0"></a-plane>';
    }
    /* Bordas brancas */
    html += '<a-plane position="-2.4 0.005 0" rotation="-90 0 0" width="0.1" height="80" color="#F0E8C0"></a-plane>';
    html += '<a-plane position="2.4 0.005 0" rotation="-90 0 0" width="0.1" height="80" color="#F0E8C0"></a-plane>';
    html += '</a-entity>';
    return html;
  }

  /* ----- Placa de atropelamento (amarela com silhueta) ----- */
  function gerarPlaca(x, z, rot) {
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rot.toFixed(1) + ' 0">' +
      '<a-cylinder position="0 0.8 0" radius="0.04" height="1.6" color="#6A6A6A"></a-cylinder>' +
      '<a-box position="0 1.75 0" width="0.9" height="0.75" depth="0.05" color="#F0C830" material="shader: flat"></a-box>' +
      '<a-box position="0 1.75 0.03" width="0.85" height="0.7" depth="0.03" color="#F0D850" material="shader: flat"></a-box>' +
      /* Silhueta do felino */
      '<a-sphere position="0 1.75 0.06" radius="0.09" color="#1A1A1A" scale="1.8 1 0.2"></a-sphere>' +
      '<a-sphere position="0.1 1.85 0.06" radius="0.05" color="#1A1A1A" scale="1 1 0.2"></a-sphere>' +
      '<a-cone position="0.15 1.85 0.06" rotation="0 0 -90" radius-bottom="0.02" radius-top="0" height="0.05" color="#1A1A1A" scale="1 1 0.2"></a-cone>' +
      '<a-cylinder position="-0.05 1.6 0.06" radius="0.02" height="0.15" color="#1A1A1A" scale="1 1 0.2"></a-cylinder>' +
      '<a-cylinder position="0.05 1.6 0.06" radius="0.02" height="0.15" color="#1A1A1A" scale="1 1 0.2"></a-cylinder>' +
      /* Borda preta */
      '<a-box position="0 1.75 0.06" width="0.9" height="0.75" depth="0.005" color="#1A1A1A" material="shader: flat; opacity: 0; transparent: true"></a-box>' +
      '</a-entity>';
  }

  /* ----- Placa grande informativa ----- */
  function gerarPlacaGrande(x, z, rot, texto1, texto2) {
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rot.toFixed(1) + ' 0">' +
      '<a-cylinder position="-0.7 1.0 0" radius="0.05" height="2.0" color="#3A2818"></a-cylinder>' +
      '<a-cylinder position="0.7 1.0 0" radius="0.05" height="2.0" color="#3A2818"></a-cylinder>' +
      '<a-box position="0 2.1 0" width="2.0" height="1.0" depth="0.06" color="#1A4A20"></a-box>' +
      '<a-box position="0 2.1 0.035" width="1.9" height="0.92" depth="0.03" color="#2E6A3E"></a-box>' +
      '<a-text value="' + texto1 + '" position="0 2.35 0.06" align="center" color="#F0F8E0" width="2.8" font="mozillavr"></a-text>' +
      '<a-text value="' + texto2 + '" position="0 2.05 0.06" align="center" color="#A8D8B0" width="2.4" font="mozillavr"></a-text>' +
      '</a-entity>';
  }

  /* ----- Arbusto seco ----- */
  function gerarArbusto(x, z) {
    const cor = pick(['#7A8A4A', '#8A7A3A', '#6A7A42']);
    let galhos = '';
    for (let i = 0; i < randInt(4, 6); i++) {
      const a = rand(0, Math.PI * 2);
      const h = rand(0.3, 0.6);
      galhos += '<a-cylinder position="' + (Math.cos(a)*0.1).toFixed(2) + ' ' + (h/2).toFixed(2) + ' ' + (Math.sin(a)*0.1).toFixed(2) + '" radius="0.015" height="' + h.toFixed(2) + '" color="' + cor + '" rotation="' + rand(-25,25).toFixed(1) + ' ' + (a*180/Math.PI).toFixed(1) + ' ' + rand(-25,25).toFixed(1) + '" sway-dry="ampl: 6"></a-cylinder>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">' + galhos + '</a-entity>';
  }

  /* ----- Capim (transição: metade verde, metade seco) ----- */
  function gerarCapimTransicao(x, z, seco) {
    const cor = seco ? pick(['#C8B888', '#B8A878', '#A89870']) : pick(['#8A9A4A', '#7A8A3A', '#A0A860']);
    let html = '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" sway-capim="ampl: 10">';
    for (let i = 0; i < randInt(3, 5); i++) {
      const a = rand(0, Math.PI * 2);
      const h = rand(0.25, 0.55);
      html += '<a-cone position="' + (Math.cos(a)*0.05).toFixed(3) + ' ' + (h/2).toFixed(3) + ' ' + (Math.sin(a)*0.05).toFixed(3) + '" radius-bottom="0.03" radius-top="0.003" height="' + h.toFixed(3) + '" color="' + cor + '" rotation="' + rand(-15,15).toFixed(1) + ' 0 ' + rand(-15,15).toFixed(1) + '"></a-cone>';
    }
    html += '</a-entity>';
    return html;
  }

  /* ----- Pedra ----- */
  function gerarPedra(x, z, t) {
    const r = (t || 1) * rand(0.25, 0.5);
    return '<a-dodecahedron position="' + x.toFixed(2) + ' ' + (r*0.5).toFixed(2) + ' ' + z.toFixed(2) + '" radius="' + r.toFixed(2) + '" color="#8A7A5A" rotation="0 ' + rand(0,360).toFixed(1) + ' 0" scale="1.1 ' + rand(0.5,0.8).toFixed(2) + ' 1.1"></a-dodecahedron>';
  }

  /* ----- Jaguatirica (silhueta estilizada) ----- */
  function gerarJaguatirica(x, z, esc) {
    const s = esc || 1;
    const amarelo = '#E8C860';
    const preto = '#1A1A1A';
    const branco = '#F0E8D0';
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0" scale="' + s + ' ' + s + ' ' + s + '">' +
      '<a-sphere position="0 0.45 0" radius="0.32" color="' + amarelo + '" scale="1.9 1 1"></a-sphere>' +
      '<a-sphere position="0.5 0.55 0" radius="0.22" color="' + amarelo + '"></a-sphere>' +
      '<a-cone position="0.68 0.5 0" rotation="0 0 -95" radius-bottom="0.06" radius-top="0.01" height="0.2" color="' + branco + '"></a-cone>' +
      '<a-sphere position="0.56 0.62 0.1" radius="0.02" color="' + preto + '"></a-sphere>' +
      '<a-sphere position="0.56 0.62 -0.1" radius="0.02" color="' + preto + '"></a-sphere>' +
      '<a-cone position="0.48 0.72 0.08" radius-bottom="0.05" radius-top="0.01" height="0.1" color="' + amarelo + '" rotation="0 0 20"></a-cone>' +
      '<a-cone position="0.48 0.72 -0.08" radius-bottom="0.05" radius-top="0.01" height="0.1" color="' + amarelo + '" rotation="0 0 -20"></a-cone>' +
      '<a-cylinder position="-0.85 0.35 0" rotation="0 0 20" radius="0.08" height="0.55" color="' + amarelo + '"></a-cylinder>' +
      '<a-sphere position="-1.05 0.5 0" radius="0.08" color="' + amarelo + '"></a-sphere>' +
      '<a-sphere position="-1.05 0.5 0" radius="0.045" color="' + preto + '"></a-sphere>' +
      '<a-cylinder position="0.25 0.15 0.15" radius="0.05" height="0.35" color="' + amarelo + '"></a-cylinder>' +
      '<a-cylinder position="0.25 0.15 -0.15" radius="0.05" height="0.35" color="' + amarelo + '"></a-cylinder>' +
      '<a-cylinder position="-0.2 0.15 0.15" radius="0.05" height="0.35" color="' + amarelo + '"></a-cylinder>' +
      '<a-cylinder position="-0.2 0.15 -0.15" radius="0.05" height="0.35" color="' + amarelo + '"></a-cylinder>' +
      '<a-sphere position="-0.3 0.55 0.15" radius="0.045" color="' + preto + '"></a-sphere>' +
      '<a-sphere position="-0.05 0.6 0.15" radius="0.045" color="' + preto + '"></a-sphere>' +
      '<a-sphere position="0.2 0.58 -0.15" radius="0.045" color="' + preto + '"></a-sphere>' +
      '</a-entity>';
  }

  /* ----- Caminhão passando na estrada (atropelamento = ameaça) ----- */
  function gerarCaminhao(x, y, z) {
    const dur = randInt(8000, 12000);
    return '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '" ' +
      'animation="property: position; from: ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' -20; to: ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' 20; dur: ' + dur + '; loop: true; easing: linear">' +
      '<a-box width="1.2" height="1.5" depth="0.7" color="#3A5A80"></a-box>' +
      '<a-box position="0 -0.5 0" width="1.3" height="0.5" depth="0.8" color="#2A2A2A"></a-box>' +
      '<a-box position="0.62 -0.2 -0.36" width="0.15" height="0.3" depth="0.01" color="#F0E8A0"></a-box>' +
      '<a-box position="0.62 -0.2 0.36" width="0.15" height="0.3" depth="0.01" color="#F0E8A0"></a-box>' +
      '<a-sphere position="0.35 -0.7 0.42" radius="0.15" color="#1A1A1A"></a-sphere>' +
      '<a-sphere position="0.35 -0.7 -0.42" radius="0.15" color="#1A1A1A"></a-sphere>' +
      '<a-sphere position="-0.35 -0.7 0.42" radius="0.15" color="#1A1A1A"></a-sphere>' +
      '<a-sphere position="-0.35 -0.7 -0.42" radius="0.15" color="#1A1A1A"></a-sphere>' +
      '</a-entity>';
  }

  function montarBiomaTransicaoJaguatirica(animal, opts) {
    opts = opts || {};
    const denso = opts.densidade !== 'baixa';
    const skyTopo = '#5FA8D3', skyBase = '#E8D8B0';
    const chaoMata = '#3A5528';
    const chaoCaatinga = '#C8B080';

    const skySrc = window.MewBiomas && window.MewBiomas.criarTexturaGradiente
      ? window.MewBiomas.criarTexturaGradiente(skyTopo, skyBase)
      : null;

    let html = skySrc
      ? '<a-sky src="' + skySrc + '" color="' + skyBase + '"></a-sky>'
      : '<a-sky color="' + skyBase + '"></a-sky>';

    /* Chão em DUAS METADES: esquerda (mata) verde, direita (caatinga) bege */
    html += '<a-circle position="-12 0 0" rotation="-90 0 0" radius="35" color="' + chaoMata + '" shadow="receive: true"></a-circle>';
    html += '<a-circle position="12 0 0" rotation="-90 0 0" radius="35" color="' + chaoCaatinga + '" shadow="receive: true"></a-circle>';
    html += '<a-circle position="0 0 0" rotation="-90 0 0" radius="90" color="#8A7A5A" shadow="receive: true" opacity="0.3" transparent="true"></a-circle>';

    /* Manchas */
    for (let i = 0; i < (denso ? 20 : 12); i++) {
      const p = pos(2, 30);
      const cor = p.x < 0 ? '#4A6A32' : '#D8C090';
      html += '<a-circle position="' + p.x.toFixed(2) + ' 0.006 ' + p.z.toFixed(2) + '" rotation="-90 0 0" radius="' + rand(1.5,3).toFixed(2) + '" color="' + cor + '" opacity="0.6" transparent="true"></a-circle>';
    }

    /* RODOVIA BR-232 atravessando */
    html += gerarRodovia();

    /* Vegetação da MATA (x < 0) */
    const nMata = denso ? 20 : 12;
    for (let i = 0; i < nMata; i++) {
      const p = pos(8, 25);
      const px = -Math.abs(p.x) - 3;
      html += gerarArvoreMata(px, p.z);
    }

    /* Vegetação da CAATINGA (x > 0) */
    const nCaatinga = denso ? 20 : 12;
    for (let i = 0; i < nCaatinga; i++) {
      const p = pos(8, 25);
      const px = Math.abs(p.x) + 3;
      html += gerarArvoreCaatinga(px, p.z);
    }

    /* Mandacarus (só na caatinga) */
    const nMandacarus = denso ? 16 : 8;
    for (let i = 0; i < nMandacarus; i++) {
      const p = pos(5, 22);
      const px = Math.abs(p.x) + 3;
      html += gerarMandacaru(px, p.z);
    }

    /* Mata ciliar (dois fragmentos nas laterais) */
    html += gerarMataCiliar(-14, -6);
    html += gerarMataCiliar(-16, 8);
    html += gerarMataCiliar(14, -4);
    html += gerarMataCiliar(18, 6);

    /* Arbustos secos */
    const nArbustos = denso ? 30 : 15;
    for (let i = 0; i < nArbustos; i++) {
      const p = pos(2, 22);
      html += gerarArbusto(p.x, p.z);
    }

    /* Capim (verde na mata, seco na caatinga) */
    const nCapim = denso ? 100 : 50;
    for (let i = 0; i < nCapim; i++) {
      const p = pos(1, 24);
      html += gerarCapimTransicao(p.x, p.z, p.x > 2);
    }

    /* Pedras */
    const nPedras = denso ? 18 : 10;
    for (let i = 0; i < nPedras; i++) {
      const p = pos(2, 22);
      html += gerarPedra(p.x, p.z, rand(0.6, 1.2));
    }

    /* PLACAS de atropelamento (5 na estrada) */
    for (let i = 0; i < 5; i++) {
      const z = -16 + i * 8;
      html += gerarPlaca(-2.7, z, 35);
    }

    /* Placa grande informativa */
    html += gerarPlacaGrande(-6, -5, 40, 'BR-232 · PE-145', 'Atravessia de felinos');

    /* Jaguatiricas */
    html += gerarJaguatirica(-3.5, -3, 1.0);
    html += gerarJaguatirica(4.5, -6, 0.85);
    html += gerarJaguatirica(-5, 4, 0.9);
    if (denso) html += gerarJaguatirica(6, 5, 0.8);

    /* Caminhão (ameaça) */
    html += gerarCaminhao(2.7, 0.6, -14);
    html += gerarCaminhao(-2.7, 0.6, -10);

    /* Hotspots */
    html += '<a-entity position="0 2.2 2.5" info-hotspot="titulo: Jaguatirica; descricao: Leopardus pardalis — adapta-se a Mata Atlântica e Caatinga. Ocorre em PE em Moreno, Gravatá, Santa Cruz do Capibaribe e Brejo da Madre de Deus.; cor: #E8C860"></a-entity>';
    html += '<a-entity position="-4 2.0 -5" info-hotspot="titulo: Rodovia BR-232; descricao: Atravessa o estado e corta fragmentos de mata. Atropelamentos são uma das principais causas de morte da jaguatirica.; cor: #2A2A2A"></a-entity>';
    html += '<a-entity position="-2.7 2.5 -8" info-hotspot="titulo: Placa de atropelamento; descricao: Alerta motoristas sobre a travessia de felinos. Reduzem acidentes em até 40%.; cor: #F0C830"></a-entity>';
    html += '<a-entity position="-14 2.0 -6" info-hotspot="titulo: Mata ciliar; descricao: Vegetação ao longo de rios. Serve de corredor entre fragmentos — a jaguatirica usa como estrada segura.; cor: #2E6A30"></a-entity>';
    html += '<a-entity position="8 1.5 -4" info-hotspot="titulo: Caatinga densa; descricao: Áreas com vegetação fechada e úmida. A jaguatirica caça e se abriga aqui no Agreste e Sertão.; cor: #7A8A4A"></a-entity>';
    html += '<a-entity position="3 1.2 -3" info-hotspot="titulo: Mandacaru; descricao: Cacto símbolo da Caatinga. Marca a transição entre os biomas no Agreste pernambucano.; cor: #3E7A3E"></a-entity>';
    html += '<a-entity position="0 3.0 -12" info-hotspot="titulo: Zona de transição; descricao: Encontro entre Mata Atlântica e Caatinga. A jaguatirica é o felino mais adaptável do Brasil, vivendo nos dois biomas.; cor: #B89A60"></a-entity>';
    html += '<a-entity position="-8 1.5 4" info-hotspot="titulo: Fragmentação; descricao: Estradas e cidades dividem a mata em ilhas. Populações isoladas têm menos diversidade genética.; cor: #E8482A"></a-entity>';
    html += '<a-entity position="6 0.9 5" info-hotspot="titulo: Caminhão; descricao: Tráfego pesado nas rodovias PE é a maior ameaça direta aos felinos. Rodovias BR-232 e PE-145 são críticas.; cor: #3A5A80"></a-entity>';

    /* Iluminação neutra */
    html += '<a-entity light="type: ambient; color: #E8E0D0; intensity: 0.75"></a-entity>' +
            '<a-entity position="8 14 4" light="type: directional; color: #FFF4D0; intensity: 1.1; castShadow: true; shadowMapWidth: 2048; shadowMapHeight: 2048"></a-entity>' +
            '<a-entity position="-6 6 -3" light="type: point; color: #FFE8B8; intensity: 0.3; distance: 12"></a-entity>';

    return { html, bioma: { nome: 'Transição Mata Atlântica ↔ Caatinga', skyTopo, skyBase, fog: '#D8C8A8', fogDensity: 0.012 } };
  }

  if (!window.MewBiomas) { console.warn('[bioma_transicao_jaguatirica] biomas_fauna.js ausente.'); return; }

  const _detectar = window.MewBiomas.detectarBioma;
  window.MewBiomas.detectarBioma = function (animal) {
    const nome = (animal.nome_popular || '').toLowerCase();
    if (nome.indexOf('jaguatirica') !== -1) {
      return 'transicaoJaguatirica';
    }
    return _detectar.call(this, animal);
  };

  const _montar = window.MewBiomas.montarCena3D;
  window.MewBiomas.montarCena3D = function (animal, opts) {
    const chave = window.MewBiomas.detectarBioma(animal);
    if (chave === 'transicaoJaguatirica') return montarBiomaTransicaoJaguatirica(animal, opts);
    return _montar.call(this, animal, opts);
  };

  window.MewBiomas.montarBiomaTransicaoJaguatirica = montarBiomaTransicaoJaguatirica;
  console.log('[bioma_transicao_jaguatirica] Bioma Transição Mata Atlântica ↔ Caatinga (Jaguatirica) registrado.');
})();