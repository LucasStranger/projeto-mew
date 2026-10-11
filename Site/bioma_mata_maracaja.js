/* =========================================================
   bioma_mata_maracaja.js
   Mata Atlântica NOTURNA/ARBORÍCOLA — Gato-maracajá (Leopardus wiedii)
   Foco: copa fechada, lianas, vagalumes, corujas, luar.
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

  /* ----- Árvore alta do dossel noturno ----- */
  function gerarArvoreNoturna(x, z, h) {
    const altura = h || rand(5.5, 8.5);
    const tronco = '#1A1410';
    const folha1 = '#0E2A14';
    const folha2 = '#153A1E';
    const rf = rand(1.8, 2.6);
    const rot = rand(0, 360);

    let raizes = '';
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const dx = Math.cos(a) * 0.5;
      const dz = Math.sin(a) * 0.5;
      raizes += '<a-cylinder position="' + dx.toFixed(2) + ' ' + (altura*0.05).toFixed(2) + ' ' + dz.toFixed(2) + '" radius="0.07" height="' + (altura*0.15).toFixed(2) + '" color="' + tronco + '" rotation="' + rand(25,45).toFixed(1) + ' 0 ' + rand(-30,30).toFixed(1) + '"></a-cylinder>';
    }
    let folhagem = '';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const r = rf * rand(0.55, 0.95);
      const c = pick([folha1, folha2]);
      folhagem += '<a-sphere position="' + (Math.cos(a)*r).toFixed(2) + ' ' + (altura + rand(-0.3,0.3)).toFixed(2) + ' ' + (Math.sin(a)*r).toFixed(2) + '" radius="' + (rf*rand(0.55,0.8)).toFixed(2) + '" color="' + c + '" sway-leaf="ampl: 3; dur: ' + randInt(3000,4500) + '"></a-sphere>';
    }
    folhagem += '<a-sphere position="0 ' + (altura + rf*0.5).toFixed(2) + ' 0" radius="' + (rf*0.9).toFixed(2) + '" color="' + folha1 + '"></a-sphere>';

    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rot.toFixed(1) + ' 0">' +
      raizes +
      '<a-cylinder position="0 ' + (altura/2).toFixed(2) + ' 0" radius="0.15" height="' + altura.toFixed(2) + '" color="' + tronco + '"></a-cylinder>' +
      folhagem + '</a-entity>';
  }

  /* ----- Galho horizontal (estrada do maracajá) ----- */
  function gerarGalho(x, y, z, comp) {
    const c = comp || rand(2.5, 4.5);
    const rot = rand(0, 360);
    return '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '" rotation="0 ' + rot.toFixed(1) + ' 0">' +
      '<a-cylinder position="0 0 0" rotation="0 0 90" radius="0.09" height="' + c.toFixed(2) + '" color="#1A1410"></a-cylinder>' +
      '<a-cylinder position="' + (c*0.3).toFixed(2) + ' 0.15 0" radius="0.05" height="0.4" color="#1A1410" rotation="0 0 35"></a-cylinder>' +
      '<a-cylinder position="' + (-c*0.35).toFixed(2) + ' 0.1 0" radius="0.04" height="0.3" color="#1A1410" rotation="0 0 -28"></a-cylinder>' +
      '</a-entity>';
  }

  /* ----- Bromélia sobre galho ----- */
  function gerarBromeliaGalho(x, y, z) {
    const cor1 = pick(['#6A1810', '#8A2818', '#4A1818']);
    const cor2 = '#3A1810';
    return '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '">' +
      '<a-cone position="0 0 0" radius-bottom="0.15" radius-top="0.08" height="0.14" color="' + cor2 + '"></a-cone>' +
      '<a-cone position="0 0.1 0" radius-bottom="0.12" radius-top="0.03" height="0.14" color="' + cor1 + '"></a-cone>' +
      '<a-cone position="0 0.2 0" radius-bottom="0.05" radius-top="0" height="0.1" color="' + cor1 + '"></a-cone>' +
      '</a-entity>';
  }

  /* ----- Liana / cipó ----- */
  function gerarLiana(x, y, z) {
    const n = randInt(8, 14);
    const alt = rand(2.0, 3.5);
    let html = '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '">';
    let ox = 0, oz = 0;
    for (let i = 0; i < n; i++) {
      const dy = -alt / n;
      ox += rand(-0.1, 0.1);
      oz += rand(-0.1, 0.1);
      html += '<a-cylinder position="' + ox.toFixed(2) + ' ' + (dy*(i+0.5)).toFixed(2) + ' ' + oz.toFixed(2) + '" radius="0.02" height="' + (alt/n*1.05).toFixed(2) + '" color="#0A1A0A" rotation="' + rand(-10,10).toFixed(1) + ' 0 ' + rand(-10,10).toFixed(1) + '"></a-cylinder>';
    }
    html += '</a-entity>';
    return html;
  }

  /* ----- Vagalume ----- */
  function gerarVagalume(x, y, z) {
    const dur = randInt(2500, 5000);
    const drift = rand(0.4, 1.2);
    return '<a-sphere position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '" radius="0.035" color="#FFF8A0" ' +
      'material="shader: standard; emissive: #FFE860; emissiveIntensity: 1.2; opacity: 0.9; transparent: true" ' +
      'animation="property: position; from: ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '; to: ' + (x+drift).toFixed(2) + ' ' + (y+0.4).toFixed(2) + ' ' + (z+drift).toFixed(2) + '; dur: ' + dur + '; dir: alternate; loop: true; easing: easeInOutSine">' +
      '</a-sphere>';
  }

  /* ----- Lua ----- */
  function gerarLua() {
    return '<a-entity position="18 22 -35">' +
      '<a-sphere radius="2.5" color="#F0E8C0" material="shader: standard; emissive: #F0E8C0; emissiveIntensity: 0.9"></a-sphere>' +
      '<a-sphere radius="2.8" color="#FFFFFF" material="shader: standard; opacity: 0.15; transparent: true; emissive: #FFF8D0; emissiveIntensity: 0.5"></a-sphere>' +
      '<a-entity light="type: point; color: #E8E0C0; intensity: 0.5; distance: 60"></a-entity>' +
      '</a-entity>';
  }

  /* ----- Estrela ----- */
  function gerarEstrela(x, y, z) {
    const dur = randInt(2000, 5000);
    return '<a-sphere position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '" radius="0.08" color="#FFF8E0" ' +
      'material="shader: standard; emissive: #FFF8E0; emissiveIntensity: 1" ' +
      'animation="property: material.emissiveIntensity; from: 0.4; to: 1.4; dur: ' + dur + '; dir: alternate; loop: true"></a-sphere>';
  }

  /* ----- Coruja pousada ----- */
  function gerarCoruja(x, y, z) {
    const marrom = '#4A3020';
    const claro = '#8A6A48';
    const amarelo = '#F0C830';
    return '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '" rotation="0 ' + rand(-30,30).toFixed(1) + ' 0">' +
      '<a-sphere position="0 0 0" radius="0.18" color="' + marrom + '" scale="1.2 1.4 1"></a-sphere>' +
      '<a-sphere position="0 0.13 0.05" radius="0.14" color="' + marrom + '"></a-sphere>' +
      '<a-sphere position="-0.05 0.15 0.14" radius="0.04" color="' + amarelo + '"></a-sphere>' +
      '<a-sphere position="0.05 0.15 0.14" radius="0.04" color="' + amarelo + '"></a-sphere>' +
      '<a-sphere position="-0.05 0.15 0.155" radius="0.02" color="#000"></a-sphere>' +
      '<a-sphere position="0.05 0.15 0.155" radius="0.02" color="#000"></a-sphere>' +
      '<a-cone position="0 0.17 0.16" rotation="0 0 0" radius-bottom="0.03" radius-top="0.005" height="0.06" color="' + amarelo + '"></a-cone>' +
      '<a-cone position="-0.08 0.2 0" radius-bottom="0.05" radius-top="0.01" height="0.08" color="' + claro + '" rotation="0 0 15"></a-cone>' +
      '<a-cone position="0.08 0.2 0" radius-bottom="0.05" radius-top="0.01" height="0.08" color="' + claro + '" rotation="0 0 -15"></a-cone>' +
      '<a-sphere position="0 -0.05 0.14" radius="0.09" color="' + claro + '" scale="0.9 0.7 1"></a-sphere>' +
      '</a-entity>';
  }

  /* ----- Morcego voando ----- */
  function gerarMorcego(x, y, z) {
    const cor = '#0A0A0A';
    const r = rand(2.5, 5);
    const dur = randInt(6000, 10000);
    return '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '" flutter-bird="raio: ' + r.toFixed(2) + '; alt: ' + y.toFixed(2) + '; dur: ' + dur + '">' +
      '<a-sphere radius="0.06" color="' + cor + '" scale="1.4 0.7 1"></a-sphere>' +
      '<a-sphere position="0.08 0 0" radius="0.04" color="' + cor + '"></a-sphere>' +
      '<a-cone position="0.14 0 0" rotation="0 0 -90" radius-bottom="0.015" radius-top="0" height="0.04" color="' + cor + '"></a-cone>' +
      '<a-plane position="-0.04 0.02 0.08" width="0.14" height="0.08" color="' + cor + '" material="shader: flat; side: double; opacity: 0.85; transparent: true" rotation="0 30 -30"></a-plane>' +
      '<a-plane position="-0.04 0.02 -0.08" width="0.14" height="0.08" color="' + cor + '" material="shader: flat; side: double; opacity: 0.85; transparent: true" rotation="0 -30 -30"></a-plane>' +
      '</a-entity>';
  }

  /* ----- Tronco caído com musgo bioluminescente ----- */
  function gerarTroncoBiolum(x, z) {
    const comp = rand(2.0, 3.2);
    const raio = rand(0.16, 0.24);
    let fungi = '';
    for (let i = 0; i < randInt(6, 10); i++) {
      const dx = rand(-comp/2 + 0.3, comp/2 - 0.3);
      const a = rand(0, Math.PI * 2);
      const dy = Math.cos(a) * raio * 0.9;
      const dz = Math.sin(a) * raio * 0.9;
      const cor = pick(['#40E0D0', '#7EE8C8', '#A080FF']);
      fungi += '<a-sphere position="' + dx.toFixed(2) + ' ' + (raio + dy*0.7).toFixed(2) + ' ' + dz.toFixed(2) + '" radius="' + rand(0.04,0.08).toFixed(2) + '" color="' + cor + '" material="shader: standard; emissive: ' + cor + '; emissiveIntensity: 0.9" scale="1 0.6 1"></a-sphere>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' ' + raio.toFixed(2) + ' ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0">' +
      '<a-cylinder position="0 0 0" rotation="0 0 90" radius="' + raio.toFixed(2) + '" height="' + comp.toFixed(2) + '" color="#0E1408"></a-cylinder>' +
      fungi + '</a-entity>';
  }

  /* ----- Samambaia noturna ----- */
  function gerarSamambaiaNoturna(x, z) {
    const h = rand(0.4, 0.8);
    const cor = pick(['#0E3A1A', '#1A4A22', '#0A2A10']);
    let folhas = '';
    for (let i = 0; i < randInt(6, 9); i++) {
      const a = (i / 9) * Math.PI * 2;
      const comp = h * rand(0.8, 1.2);
      folhas += '<a-plane position="' + (Math.cos(a)*comp*0.3).toFixed(2) + ' ' + (comp*0.35).toFixed(2) + ' ' + (Math.sin(a)*comp*0.3).toFixed(2) + '" width="' + (comp*0.9).toFixed(2) + '" height="0.07" color="' + cor + '" material="shader: flat; side: double" rotation="' + rand(40,70).toFixed(1) + ' ' + (a*180/Math.PI).toFixed(1) + ' 0" sway-leaf="ampl: 3"></a-plane>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">' + folhas + '</a-entity>';
  }

  function montarBiomaMaracaja(animal, opts) {
    opts = opts || {};
    const denso = opts.densidade !== 'baixa';
    const skyTopo = '#0A0A2A', skyBase = '#2A1A4A';

    const skySrc = window.MewBiomas && window.MewBiomas.criarTexturaGradiente
      ? window.MewBiomas.criarTexturaGradiente(skyTopo, skyBase)
      : null;

    let html = skySrc
      ? '<a-sky src="' + skySrc + '" color="' + skyBase + '"></a-sky>'
      : '<a-sky color="' + skyBase + '"></a-sky>';

    /* Estrelas */
    for (let i = 0; i < (denso ? 80 : 50); i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 40 + Math.random() * 40;
      const y = 10 + Math.random() * 25;
      html += gerarEstrela(Math.cos(a) * r, y, Math.sin(a) * r);
    }

    html += gerarLua();

    /* Chão escuro */
    html += '<a-circle position="0 0 0" rotation="-90 0 0" radius="90" color="#0A1408" shadow="receive: true"></a-circle>';
    for (let i = 0; i < (denso ? 15 : 8); i++) {
      const p = pos(2, 30);
      const r = rand(1.5, 3.5);
      html += '<a-circle position="' + p.x.toFixed(2) + ' 0.005 ' + p.z.toFixed(2) + '" rotation="-90 0 0" radius="' + r.toFixed(2) + '" color="#0E1A08" opacity="0.7" transparent="true"></a-circle>';
    }

    /* Árvores altas em círculo */
    const nAltas = denso ? 26 : 16;
    for (let i = 0; i < nAltas; i++) {
      const a = (i / nAltas) * Math.PI * 2 + rand(-0.2, 0.2);
      const r = 10 + Math.random() * 20;
      html += gerarArvoreNoturna(Math.cos(a) * r, Math.sin(a) * r, rand(5.5, 8.5));
    }
    /* Árvores sobre a câmera (dossel fechado) */
    for (let i = 0; i < (denso ? 8 : 4); i++) {
      const p = pos(6, 13);
      html += gerarArvoreNoturna(p.x, p.z, rand(6.5, 8.5));
    }

    /* Galhos horizontais (as "autoestradas" do maracajá) */
    const nGalhos = denso ? 14 : 8;
    for (let i = 0; i < nGalhos; i++) {
      const p = pos(4, 14);
      const y = rand(2.5, 4.5);
      html += gerarGalho(p.x, y, p.z, rand(2.5, 4.5));
    }

    /* Bromélias nos galhos */
    for (let i = 0; i < (denso ? 12 : 6); i++) {
      const p = pos(4, 13);
      html += gerarBromeliaGalho(p.x, rand(2.8, 4.2), p.z);
    }

    /* Lianas */
    for (let i = 0; i < (denso ? 16 : 9); i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(3, 12);
      html += gerarLiana(Math.cos(a) * r, rand(3.5, 5.5), Math.sin(a) * r);
    }

    /* Troncos com fungos bioluminescentes */
    for (let i = 0; i < (denso ? 8 : 4); i++) {
      const p = pos(4, 16);
      html += gerarTroncoBiolum(p.x, p.z);
    }

    /* Samambaias */
    for (let i = 0; i < (denso ? 40 : 25); i++) {
      const p = pos(1.5, 18);
      html += gerarSamambaiaNoturna(p.x, p.z);
    }

    /* Vagalumes */
    const nVagalumes = denso ? 60 : 35;
    for (let i = 0; i < nVagalumes; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(1, 15);
      html += gerarVagalume(Math.cos(a) * r, rand(0.5, 4.5), Math.sin(a) * r);
    }

    /* Corujas pousadas */
    html += gerarCoruja(-2.5, 2.8, -3.5);
    html += gerarCoruja(3.0, 3.2, -4.0);
    if (denso) html += gerarCoruja(-4.5, 2.5, 2.5);

    /* Morcegos voando */
    for (let i = 0; i < (denso ? 6 : 3); i++) {
      const p = pos(4, 12);
      html += gerarMorcego(p.x, rand(3, 5.5), p.z);
    }

    /* Hotspots */
    html += '<a-entity position="0 2.2 2.5" info-hotspot="titulo: Gato-maracajá; descricao: Leopardus wiedii — felino arborícola de hábitos noturnos. Desce de troncos de cabeça para baixo. Vulnerável no Brasil.; cor: #C8A860"></a-entity>';
    html += '<a-entity position="-2.5 3.0 -3.5" info-hotspot="titulo: Coruja; descricao: Predador noturno que divide a copa com o maracajá. Ambos caçam roedores e marsupiais.; cor: #8A6A48"></a-entity>';
    html += '<a-entity position="-5 3.5 -6" info-hotspot="titulo: Copa fechada; descricao: Estrato superior onde o maracajá passa a maior parte do tempo. Suas articulações giram 180°.; cor: #153A1E"></a-entity>';
    html += '<a-entity position="4 4.0 -4" info-hotspot="titulo: Lianas; descricao: Pontes naturais entre as copas. O maracajá usa como atalho para caçar sem descer ao chão.; cor: #0A1A0A"></a-entity>';
    html += '<a-entity position="-2 0.9 3" info-hotspot="titulo: Bromélia; descricao: Reservatório de água na copa. Atrai insetos, rãs e lagartixas — presas do maracajá.; cor: #6A1810"></a-entity>';
    html += '<a-entity position="4 0.8 4" info-hotspot="titulo: Fungos bioluminescentes; descricao: Brilham no escuro da mata. Indicam madeira em decomposição e alta umidade.; cor: #40E0D0"></a-entity>';
    html += '<a-entity position="-4 1.2 -8" info-hotspot="titulo: Vagalumes; descricao: Sinalizam a mata saudável. São bioindicadores de umidade e ausência de pesticidas.; cor: #FFE860"></a-entity>';
    html += '<a-entity position="3 5.0 -10" info-hotspot="titulo: APA Aldeia-Beberibe; descricao: Um dos últimos refúgios do gato-maracajá na Região Metropolitana do Recife.; cor: #A080FF"></a-entity>';
    html += '<a-entity position="-6 0.6 6" info-hotspot="titulo: Fragmentação; descricao: Estradas e urbanização isolam populações. Atropelamentos e perda de habitat são as maiores ameaças.; cor: #E8482A"></a-entity>';

    /* Iluminação noturna */
    html += '<a-entity light="type: ambient; color: #4050A0; intensity: 0.35"></a-entity>' +
            '<a-entity position="15 18 -25" light="type: directional; color: #B8C8E8; intensity: 0.4; castShadow: true; shadowMapWidth: 1024; shadowMapHeight: 1024"></a-entity>' +
            '<a-entity position="-4 5 -3" light="type: point; color: #4A6A9A; intensity: 0.25; distance: 12"></a-entity>';

    return { html, bioma: { nome: 'Mata Atlântica Noturna', skyTopo, skyBase, fog: '#0A1A20', fogDensity: 0.055 } };
  }

  if (!window.MewBiomas) { console.warn('[bioma_mata_maracaja] biomas_fauna.js ausente.'); return; }

  const _detectar = window.MewBiomas.detectarBioma;
  window.MewBiomas.detectarBioma = function (animal) {
    const nome = (animal.nome_popular || '').toLowerCase();
    if (nome.indexOf('maracajá') !== -1 || nome.indexOf('maracaja') !== -1) {
      return 'mataMaracaja';
    }
    return _detectar.call(this, animal);
  };

  const _montar = window.MewBiomas.montarCena3D;
  window.MewBiomas.montarCena3D = function (animal, opts) {
    const chave = window.MewBiomas.detectarBioma(animal);
    if (chave === 'mataMaracaja') return montarBiomaMaracaja(animal, opts);
    return _montar.call(this, animal, opts);
  };

  window.MewBiomas.montarBiomaMaracaja = montarBiomaMaracaja;
  console.log('[bioma_mata_maracaja] Bioma Mata Atlântica Noturna (Gato-maracajá) registrado.');
})();