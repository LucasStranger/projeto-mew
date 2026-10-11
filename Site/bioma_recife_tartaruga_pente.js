/* =========================================================
   bioma_recife_tartaruga_pente.js
   RECIFE DE CORAIS RASO — Tartaruga-de-pente (Eretmochelys imbricata)
   Foco: esponjas gigantes (alimento), recife colorido, peixes
          limpadores, águas turquesa rasas.
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

  /* ----- ESPONJA gigante do mar (alimento da tartaruga-de-pente) ----- */
  function gerarEsponja(x, z, cor) {
    const tipo = randInt(0, 2);
    const h = rand(0.6, 1.1);
    const r = rand(0.25, 0.45);
    if (tipo === 0) {
      /* Esponja barril */
      return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">' +
        '<a-cylinder position="0 ' + (h/2).toFixed(2) + ' 0" radius="' + r.toFixed(2) + '" height="' + h.toFixed(2) + '" color="' + cor + '" open-ended="true" material="shader: standard; side: double"></a-cylinder>' +
        '<a-cylinder position="0 ' + (h*0.5).toFixed(2) + ' 0" radius="' + (r*0.7).toFixed(2) + '" height="' + (h*1.02).toFixed(2) + '" color="#0A0A0A" opacity="0.8" transparent="true"></a-cylinder>' +
        '<a-torus position="0 ' + h.toFixed(2) + ' 0" rotation="90 0 0" radius="' + r.toFixed(2) + '" radius-tubular="0.03" color="' + cor + '"></a-torus>' +
        '<a-torus position="0 0.05 0" rotation="90 0 0" radius="' + r.toFixed(2) + '" radius-tubular="0.03" color="' + cor + '"></a-torus>' +
        '</a-entity>';
    }
    if (tipo === 1) {
      /* Esponja tubo (grupo) */
      let tubos = '';
      for (let i = 0; i < randInt(3, 5); i++) {
        const hh = rand(0.5, 1.0);
        const dx = rand(-0.3, 0.3);
        const dz = rand(-0.3, 0.3);
        const rr = rand(0.07, 0.12);
        tubos += '<a-cylinder position="' + dx.toFixed(2) + ' ' + (hh/2).toFixed(2) + ' ' + dz.toFixed(2) + '" radius="' + rr.toFixed(2) + '" height="' + hh.toFixed(2) + '" color="' + cor + '"></a-cylinder>' +
                 '<a-cylinder position="' + dx.toFixed(2) + ' ' + hh.toFixed(2) + ' ' + dz.toFixed(2) + '" radius="' + rr.toFixed(2) + '" height="0.05" color="#0A0A0A" opacity="0.8" transparent="true"></a-cylinder>';
      }
      return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">' + tubos + '</a-entity>';
    }
    /* Esponja incrustante */
    return '<a-entity position="' + x.toFixed(2) + ' 0.05 ' + z.toFixed(2) + '">' +
      '<a-sphere radius="' + (r*0.9).toFixed(2) + '" color="' + cor + '" scale="1.3 0.4 1.3" material="shader: standard; emissive: ' + cor + '; emissiveIntensity: 0.15"></a-sphere>' +
      '<a-sphere position="0.15 0 0.05" radius="' + (r*0.5).toFixed(2) + '" color="' + cor + '" scale="1.4 0.35 1.4"></a-sphere>' +
      '</a-entity>';
  }

  /* ----- Coral tipo ramo ----- */
  function gerarCoralRamo(x, z, cor) {
    const h = rand(0.3, 0.55);
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0">' +
      '<a-cylinder position="0 ' + (h/2).toFixed(2) + ' 0" radius="0.05" height="' + h.toFixed(2) + '" color="' + cor + '"></a-cylinder>' +
      '<a-cylinder position="0.08 ' + (h*0.8).toFixed(2) + ' 0" radius="0.035" height="' + (h*0.55).toFixed(2) + '" color="' + cor + '" rotation="0 0 -30"></a-cylinder>' +
      '<a-cylinder position="-0.08 ' + (h*0.85).toFixed(2) + ' 0" radius="0.035" height="' + (h*0.5).toFixed(2) + '" color="' + cor + '" rotation="0 0 30"></a-cylinder>' +
      '<a-sphere position="0 ' + h.toFixed(2) + ' 0" radius="0.07" color="' + cor + '"></a-sphere>' +
      '</a-entity>';
  }

  /* ----- Coral cérebro ----- */
  function gerarCoralCerebro(x, z, cor) {
    const r = rand(0.2, 0.35);
    return '<a-entity position="' + x.toFixed(2) + ' ' + (r*0.55).toFixed(2) + ' ' + z.toFixed(2) + '">' +
      '<a-dodecahedron radius="' + r.toFixed(2) + '" color="' + cor + '" scale="1.15 0.65 1.15"></a-dodecahedron>' +
      '<a-sphere position="0 ' + (r*0.35).toFixed(2) + ' 0" radius="' + (r*0.6).toFixed(2) + '" color="' + cor + '" scale="1.1 0.5 1.1"></a-sphere>' +
      '</a-entity>';
  }

  /* ----- Coral leque ----- */
  function gerarCoralLeque(x, z, cor) {
    const h = rand(0.5, 0.9);
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0">' +
      '<a-circle position="0 ' + (h*0.6).toFixed(2) + ' 0" radius="' + (h*0.45).toFixed(2) + '" color="' + cor + '" material="shader: flat; side: double; opacity: 0.7; transparent: true"></a-circle>' +
      '<a-circle position="0 ' + (h*0.6).toFixed(2) + ' 0" rotation="90 0 0" radius="' + (h*0.38).toFixed(2) + '" color="' + cor + '" material="shader: flat; side: double; opacity: 0.55; transparent: true"></a-circle>' +
      '<a-cylinder position="0 ' + (h*0.28).toFixed(2) + ' 0" radius="0.025" height="' + (h*0.55).toFixed(2) + '" color="' + cor + '"></a-cylinder>' +
      '</a-entity>';
  }

  /* ----- Coral tubo ----- */
  function gerarCoralTubo(x, z, cor) {
    let html = '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">';
    for (let i = 0; i < randInt(3, 5); i++) {
      const h = rand(0.25, 0.5);
      const dx = rand(-0.15, 0.15);
      const dz = rand(-0.15, 0.15);
      html += '<a-cylinder position="' + dx.toFixed(2) + ' ' + (h/2).toFixed(2) + ' ' + dz.toFixed(2) + '" radius="0.045" height="' + h.toFixed(2) + '" color="' + cor + '"></a-cylinder>' +
              '<a-sphere position="' + dx.toFixed(2) + ' ' + h.toFixed(2) + ' ' + dz.toFixed(2) + '" radius="0.045" color="' + cor + '"></a-sphere>';
    }
    html += '</a-entity>';
    return html;
  }

  /* ----- Anêmona ----- */
  function gerarAnemona(x, z, cor) {
    const base = rand(0.1, 0.16);
    let html = '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">';
    html += '<a-cylinder position="0 0.04 0" radius="' + base.toFixed(3) + '" height="0.08" color="#A04060"></a-cylinder>';
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const dx = Math.cos(a) * base * 0.8;
      const dz = Math.sin(a) * base * 0.8;
      const h = rand(0.15, 0.25);
      html += '<a-cylinder position="' + dx.toFixed(3) + ' ' + (h/2 + 0.06).toFixed(3) + ' ' + dz.toFixed(3) + '" radius="0.013" height="' + h.toFixed(3) + '" color="' + cor + '" rotation="' + rand(15,30).toFixed(1) + ' ' + (a*180/Math.PI).toFixed(1) + ' 0"></a-cylinder>';
    }
    html += '</a-entity>';
    return html;
  }

  /* ----- Peixe de recife (colorido) ----- */
  function gerarPeixeRecife(x, y, z, cor, tam) {
    const t = (tam || 1) * rand(0.8, 1.3);
    const dur = randInt(6000, 11000);
    const dist = rand(3, 6);
    const dir = Math.random() > 0.5 ? 1 : -1;
    return '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '" animation="property: position; from: ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '; to: ' + (x+dist*dir).toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '; dur: ' + dur + '; dir: alternate; loop: true; easing: easeInOutSine">' +
      '<a-sphere radius="' + (0.055*t).toFixed(3) + '" color="' + cor + '" scale="1.7 1 0.5" material="shader: standard; emissive: ' + cor + '; emissiveIntensity: 0.15"></a-sphere>' +
      '<a-cone position="' + (0.09*t).toFixed(3) + ' 0 0" rotation="0 0 -90" radius-bottom="' + (0.05*t).toFixed(3) + '" radius-top="0" height="' + (0.09*t).toFixed(3) + '" color="' + cor + '"></a-cone>' +
      '<a-sphere position="' + (0.02*t).toFixed(3) + ' ' + (0.012*t).toFixed(3) + ' ' + (0.045*t).toFixed(3) + '" radius="' + (0.015*t).toFixed(3) + '" color="#1A1A1A"></a-sphere>' +
      '<a-sphere position="' + (0.02*t).toFixed(3) + ' ' + (0.012*t).toFixed(3) + ' ' + (-0.045*t).toFixed(3) + '" radius="' + (0.015*t).toFixed(3) + '" color="#1A1A1A"></a-sphere>' +
      '</a-entity>';
  }

  /* ----- Cardume ----- */
  function gerarCardume(cx, cy, cz, corBase, qtd) {
    let html = '<a-entity position="' + cx.toFixed(2) + ' ' + cy.toFixed(2) + ' ' + cz.toFixed(2) + '">';
    const n = qtd || randInt(6, 10);
    for (let i = 0; i < n; i++) {
      html += gerarPeixeRecife(rand(-0.8, 0.8), rand(-0.3, 0.3), rand(-0.8, 0.8), Math.random() > 0.6 ? '#FFD166' : corBase, 0.7);
    }
    html += '</a-entity>';
    return html;
  }

  /* ----- Peixe-palhaço (nemo) no coral ----- */
  function gerarNemo(x, y, z) {
    return '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '" bobber="amp: 0.05; dur: 3000">' +
      '<a-sphere radius="0.05" color="#F07020" scale="1.5 1 0.6"></a-sphere>' +
      '<a-box position="0.02 0 0" width="0.02" height="0.08" depth="0.08" color="#F0F0F0"></a-box>' +
      '<a-sphere position="0.07 0 0" radius="0.02" color="#F07020"></a-sphere>' +
      '</a-entity>';
  }

  /* ----- Estrela-do-mar ----- */
  function gerarEstrela(x, z, cor) {
    const r = rand(0.1, 0.16);
    let bracos = '';
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const dx = Math.cos(a) * r * 0.9;
      const dz = Math.sin(a) * r * 0.9;
      bracos += '<a-cone position="' + dx.toFixed(3) + ' 0.02 ' + dz.toFixed(3) + '" radius-bottom="' + (r*0.35).toFixed(3) + '" radius-top="0.005" height="' + (r*1.1).toFixed(3) + '" color="' + cor + '" rotation="90 ' + (a*180/Math.PI).toFixed(1) + ' 0"></a-cone>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0"><a-cylinder position="0 0.02 0" radius="' + (r*0.55).toFixed(3) + '" height="0.04" color="' + cor + '"></a-cylinder>' + bracos + '</a-entity>';
  }

  /* ----- Bolha ----- */
  function gerarBolha(x, y0, z, y1) {
    const dur = randInt(4000, 8000);
    const r = rand(0.03, 0.07);
    return '<a-sphere position="' + x.toFixed(2) + ' ' + y0.toFixed(2) + ' ' + z.toFixed(2) + '" radius="' + r.toFixed(3) + '" color="#E0F8FF" material="shader: standard; opacity: 0.4; transparent: true; emissive: #B0E8F5; emissiveIntensity: 0.6" animation="property: position; from: ' + x.toFixed(2) + ' ' + y0.toFixed(2) + ' ' + z.toFixed(2) + '; to: ' + x.toFixed(2) + ' ' + y1.toFixed(2) + ' ' + z.toFixed(2) + '; dur: ' + dur + '; loop: true; easing: linear"></a-sphere>';
  }

  /* ----- Raio de sol na água ----- */
  function gerarRaioSol(x, z, alt, r) {
    return '<a-cone position="' + x.toFixed(2) + ' ' + (alt/2 + 1).toFixed(2) + ' ' + z.toFixed(2) + '" radius-bottom="' + r.toFixed(2) + '" radius-top="' + (r*0.3).toFixed(2) + '" height="' + alt.toFixed(2) + '" color="#FFF8E0" material="shader: flat; opacity: 0.10; transparent: true; side: double"></a-cone>';
  }

  /* ----- Pedra ----- */
  function gerarPedra(x, z, t) {
    const r = (t || 1) * rand(0.25, 0.5);
    return '<a-dodecahedron position="' + x.toFixed(2) + ' ' + (r*0.6).toFixed(2) + ' ' + z.toFixed(2) + '" radius="' + r.toFixed(2) + '" color="#6A6A5E" rotation="0 ' + rand(0,360).toFixed(1) + ' 0" scale="1 ' + rand(0.55,0.9).toFixed(2) + ' 1"></a-dodecahedron>';
  }

  function montarBiomaRecifeTartarugaPente(animal, opts) {
    opts = opts || {};
    const denso = opts.densidade !== 'baixa';
    const skyTopo = '#40C8E8', skyBase = '#C8F5FF';
    const areia = '#F0E8C0';

    const skySrc = window.MewBiomas && window.MewBiomas.criarTexturaGradiente
      ? window.MewBiomas.criarTexturaGradiente(skyTopo, skyBase)
      : null;

    let html = skySrc
      ? '<a-sky src="' + skySrc + '" color="' + skyBase + '"></a-sky>'
      : '<a-sky color="' + skyBase + '"></a-sky>';

    /* Fundo de areia clara */
    html += '<a-circle position="0 0 0" rotation="-90 0 0" radius="90" color="' + areia + '" shadow="receive: true"></a-circle>';
    for (let i = 0; i < (denso ? 15 : 8); i++) {
      const p = pos(2, 40);
      html += '<a-circle position="' + p.x.toFixed(2) + ' 0.005 ' + p.z.toFixed(2) + '" rotation="-90 0 0" radius="' + rand(2,4.5).toFixed(2) + '" color="#D8C898" opacity="0.6" transparent="true"></a-circle>';
    }

    /* Lâmina d'água turquesa (muito translúcida, para ver tudo) */
    html += '<a-circle position="0 2.5 0" rotation="-90 0 0" radius="90" color="#40C8E8" opacity="0.22" transparent="true"></a-circle>';
    html += '<a-circle position="0 2.52 0" rotation="-90 0 0" radius="90" color="#A8E8F5" opacity="0.08" transparent="true"></a-circle>';

    /* Raios de sol */
    for (let i = 0; i < (denso ? 8 : 4); i++) {
      const p = pos(3, 18);
      html += gerarRaioSol(p.x, p.z, rand(5, 7), rand(1.0, 2.0));
    }

    /* ESPONJAS (alimento da tartaruga-de-pente) — o elemento único */
    const coresEsponja = ['#FF6B9D', '#E86A9C', '#F0A040', '#D070B0', '#F08060', '#A860D0'];
    for (let i = 0; i < (denso ? 24 : 14); i++) {
      const p = pos(3, 20);
      html += gerarEsponja(p.x, p.z, pick(coresEsponja));
    }
    /* Núcleo de esponjas no centro-esquerda */
    for (let i = 0; i < (denso ? 12 : 6); i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(0, 2.0);
      html += gerarEsponja(-4 + Math.cos(a)*r, -4 + Math.sin(a)*r, pick(coresEsponja));
    }

    /* Corais variados */
    const coresCorais = ['#FFD700', '#40E0D0', '#EE82EE', '#FF8C69', '#FFA07A', '#7EE0C8', '#F0A8D8'];
    for (let i = 0; i < (denso ? 40 : 24); i++) {
      const p = pos(4, 24);
      const c = pick(coresCorais);
      const t = randInt(0, 3);
      if (t === 0) html += gerarCoralRamo(p.x, p.z, c);
      else if (t === 1) html += gerarCoralCerebro(p.x, p.z, c);
      else if (t === 2) html += gerarCoralLeque(p.x, p.z, c);
      else html += gerarCoralTubo(p.x, p.z, c);
    }
    /* Núcleo de corais à direita */
    for (let i = 0; i < (denso ? 20 : 10); i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(0, 2.5);
      const c = pick(coresCorais);
      const t = randInt(0, 3);
      const xx = 5 + Math.cos(a)*r;
      const zz = -5 + Math.sin(a)*r;
      if (t === 0) html += gerarCoralRamo(xx, zz, c);
      else if (t === 1) html += gerarCoralCerebro(xx, zz, c);
      else if (t === 2) html += gerarCoralLeque(xx, zz, c);
      else html += gerarCoralTubo(xx, zz, c);
    }

    /* Anêmonas */
    const coresAne = ['#FFB6C1', '#FF9AA2', '#E8B4D8', '#FFC0CB', '#F0A0E0'];
    for (let i = 0; i < (denso ? 16 : 9); i++) {
      const p = pos(4, 16);
      html += gerarAnemona(p.x, p.z, pick(coresAne));
    }

    /* Pedras */
    for (let i = 0; i < (denso ? 12 : 7); i++) {
      const p = pos(3, 22);
      html += gerarPedra(p.x, p.z, rand(0.8, 1.6));
    }

    /* Estrelas-do-mar e detalhes */
    const coresEstrela = ['#FF8C69', '#FF6B9D', '#FFD700', '#E8A87C', '#F0A8D8'];
    for (let i = 0; i < (denso ? 18 : 10); i++) {
      const p = pos(2, 20);
      html += gerarEstrela(p.x, p.z, pick(coresEstrela));
    }

    /* Peixes de recife (coloridos, muitos) */
    const coresPeixes = ['#FFD166', '#FF8C42', '#7ED9E5', '#F7A072', '#E0BBE4', '#FFB347', '#F0A8D8'];
    for (let i = 0; i < (denso ? 22 : 12); i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(2, 12);
      html += gerarPeixeRecife(Math.cos(a)*r, rand(0.4, 2.2), Math.sin(a)*r, pick(coresPeixes), rand(0.8, 1.3));
    }

    /* Cardumes */
    for (let i = 0; i < (denso ? 5 : 3); i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(4, 13);
      html += gerarCardume(Math.cos(a)*r, rand(0.8, 2.2), Math.sin(a)*r, pick(coresPeixes), randInt(6, 10));
    }

    /* Nemos (peixe-palhaço) entre as anêmonas */
    for (let i = 0; i < (denso ? 8 : 4); i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(2, 8);
      html += gerarNemo(Math.cos(a)*r, rand(0.4, 1.2), Math.sin(a)*r);
    }

    /* Bolhas subindo */
    for (let i = 0; i < (denso ? 30 : 18); i++) {
      const p = pos(0, 15);
      html += gerarBolha(p.x, rand(0.1, 0.6), p.z, rand(2.2, 2.6));
    }

    /* Hotspots */
    html += '<a-entity position="0 1.8 2.5" info-hotspot="titulo: Tartaruga-de-pente; descricao: Eretmochelys imbricata — carapaça em mosaico marrom/âmbar. Criticamente em Perigo (IUCN) e Em Perigo no Brasil.; cor: #FFA07A"></a-entity>';
    html += '<a-entity position="-4 0.9 -4" info-hotspot="titulo: Esponjas gigantes; descricao: Principal alimento da tartaruga-de-pente. Seu bico afilado arranca pedaços de esponjas entre os corais.; cor: #FF6B9D"></a-entity>';
    html += '<a-entity position="5 1.0 -5" info-hotspot="titulo: Recife de corais; descricao: Berçário de peixes e invertebrados. Habitat crítico para a tartaruga-de-pente, ameaçado por branqueamento e poluição.; cor: #FFD700"></a-entity>';
    html += '<a-entity position="-6 0.8 3" info-hotspot="titulo: Anêmona; descricao: Animal urticante que vive em simbiose com peixes-palhaço. Invertebrados do recife sustentam toda a cadeia.; cor: #FFB6C1"></a-entity>';
    html += '<a-entity position="4 1.5 -3" info-hotspot="titulo: Peixes de recife; descricao: Ricos em cores e espécies. Muitos limpam a carapaça da tartaruga-de-pente, removendo parasitas.; cor: #FFD166"></a-entity>';
    html += '<a-entity position="-3 1.2 5" info-hotspot="titulo: Estrela-do-mar; descricao: Predadora de moluscos e detritívora. Sinaliza recifes saudáveis — desparece em áreas poluídas.; cor: #FF8C69"></a-entity>';
    html += '<a-entity position="0 2.4 -8" info-hotspot="titulo: Águas rasas; descricao: A tartaruga-de-pente forrageia em recifes rasos até ~20 m. Diferente da tartaruga-de-couro, que vive em alto-mar.; cor: #40C8E8"></a-entity>';
    html += '<a-entity position="-7 0.7 -6" info-hotspot="titulo: Ameaças; descricao: Pesca acidental em redes, poluição por plástico, ocupação costeira e coleta ilegal de ovos.; cor: #E8482A"></a-entity>';

    /* Iluminação clara e quente (águas rasas) */
    html += '<a-entity light="type: ambient; color: #E0F8FF; intensity: 0.9"></a-entity>' +
            '<a-entity position="8 14 6" light="type: directional; color: #FFF8E0; intensity: 1.15; castShadow: true; shadowMapWidth: 2048; shadowMapHeight: 2048"></a-entity>' +
            '<a-entity position="-6 6 -3" light="type: point; color: #C8F0FF; intensity: 0.5; distance: 15"></a-entity>' +
            '<a-entity position="6 4 5" light="type: point; color: #E0FFF0; intensity: 0.35; distance: 12"></a-entity>';

    return { html, bioma: { nome: 'Recife de Corais (águas rasas)', skyTopo, skyBase, fog: '#B8E8F0', fogDensity: 0.016 } };
  }

  if (!window.MewBiomas) { console.warn('[bioma_recife_tartaruga_pente] biomas_fauna.js ausente.'); return; }

  const _detectar = window.MewBiomas.detectarBioma;
  window.MewBiomas.detectarBioma = function (animal) {
    const nome = (animal.nome_popular || '').toLowerCase();
    if (nome.indexOf('tartaruga-de-pente') !== -1 || nome.indexOf('tartaruga de pente') !== -1) {
      return 'recifeTartarugaPente';
    }
    return _detectar.call(this, animal);
  };

  const _montar = window.MewBiomas.montarCena3D;
  window.MewBiomas.montarCena3D = function (animal, opts) {
    const chave = window.MewBiomas.detectarBioma(animal);
    if (chave === 'recifeTartarugaPente') return montarBiomaRecifeTartarugaPente(animal, opts);
    return _montar.call(this, animal, opts);
  };

  window.MewBiomas.montarBiomaRecifeTartarugaPente = montarBiomaRecifeTartarugaPente;
  console.log('[bioma_recife_tartaruga_pente] Bioma Recife de Corais (Tartaruga-de-pente) registrado.');
})();