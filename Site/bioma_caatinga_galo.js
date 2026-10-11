/* =========================================================
   bioma_caatinga_galo.js
   Caatinga — Galo-de-campina (Paroaria dominicana)
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

  function gerarMandacaru(x, z, h) {
    const altura = h || rand(1.6, 3.2);
    const cor = '#3E7A3E', corEsc = '#2E5A2E', flor = '#F0E0A0';
    let bracos = '';
    const nBracos = randInt(1, 3);
    for (let i = 0; i < nBracos; i++) {
      const ang = (i / nBracos) * Math.PI * 2 + rand(-0.3, 0.3);
      const bh = altura * rand(0.4, 0.7);
      const dx = Math.cos(ang) * 0.35;
      const dz = Math.sin(ang) * 0.35;
      bracos += '<a-cylinder position="' + (dx * 0.5).toFixed(2) + ' ' + (bh * 0.5).toFixed(2) + ' ' + (dz * 0.5).toFixed(2) + '" radius="0.13" height="' + bh.toFixed(2) + '" color="' + corEsc + '" rotation="' + rand(-30,30).toFixed(1) + ' 0 ' + rand(-30,30).toFixed(1) + '"></a-cylinder>' +
                '<a-cylinder position="' + dx.toFixed(2) + ' ' + (bh * 0.95).toFixed(2) + ' ' + dz.toFixed(2) + '" radius="0.13" height="' + (bh * 0.7).toFixed(2) + '" color="' + cor + '"></a-cylinder>' +
                '<a-sphere position="' + dx.toFixed(2) + ' ' + (bh * 1.3).toFixed(2) + ' ' + dz.toFixed(2) + '" radius="0.13" color="' + cor + '"></a-sphere>';
    }
    let flores = '';
    for (let i = 0; i < randInt(2, 5); i++) {
      const a = rand(0, Math.PI * 2);
      const r = rand(0.05, 0.15);
      flores += '<a-sphere position="' + (Math.cos(a)*r).toFixed(2) + ' ' + (altura + 0.05).toFixed(2) + ' ' + (Math.sin(a)*r).toFixed(2) + '" radius="0.06" color="' + flor + '"></a-sphere>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0">' +
      '<a-cylinder position="0 ' + (altura/2).toFixed(2) + ' 0" radius="0.16" height="' + altura.toFixed(2) + '" color="' + cor + '" shadow="cast: true"></a-cylinder>' +
      bracos + flores +
      '<a-sphere position="0 ' + altura.toFixed(2) + ' 0" radius="0.16" color="' + cor + '"></a-sphere>' +
      '</a-entity>';
  }

  function gerarXiqueXique(x, z) {
    const cor = '#5A8A4A';
    const altura = rand(0.5, 1.0);
    let html = '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">';
    const qtd = randInt(5, 8);
    for (let i = 0; i < qtd; i++) {
      const a = (i / qtd) * Math.PI * 2 + rand(-0.3, 0.3);
      const tilt = rand(50, 75);
      const h = altura * rand(0.6, 1.1);
      html += '<a-cylinder position="' + (Math.cos(a) * 0.15).toFixed(2) + ' ' + (h/2).toFixed(2) + ' ' + (Math.sin(a) * 0.15).toFixed(2) + '" radius="0.08" height="' + h.toFixed(2) + '" color="' + cor + '" rotation="' + tilt.toFixed(1) + ' ' + (a*180/Math.PI).toFixed(1) + ' 0"></a-cylinder>';
    }
    html += '</a-entity>';
    return html;
  }

  function gerarFacheiro(x, z, h) {
    const altura = h || rand(2.5, 4.5);
    const cor = '#4A7A3E';
    let espinhos = '';
    for (let i = 0; i < 15; i++) {
      const y = (i / 15) * altura;
      const a = rand(0, Math.PI * 2);
      espinhos += '<a-cone position="' + (Math.cos(a) * 0.18).toFixed(2) + ' ' + y.toFixed(2) + ' ' + (Math.sin(a) * 0.18).toFixed(2) + '" radius-bottom="0.02" radius-top="0" height="0.08" color="#D0B878" rotation="' + rand(-30,30).toFixed(1) + ' ' + (a*180/Math.PI).toFixed(1) + ' ' + rand(-30,30).toFixed(1) + '"></a-cone>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">' +
      '<a-cylinder position="0 ' + (altura/2).toFixed(2) + ' 0" radius="0.20" height="' + altura.toFixed(2) + '" color="' + cor + '" shadow="cast: true"></a-cylinder>' +
      espinhos +
      '<a-sphere position="0 ' + altura.toFixed(2) + ' 0" radius="0.18" color="' + cor + '"></a-sphere>' +
      '</a-entity>';
  }

  function gerarJuazeiro(x, z) {
    const altura = rand(2.5, 4.5);
    const tronco = '#4A3A28', folha = '#5A8A3A';
    let copa = '';
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const r = rand(0.6, 1.1);
      copa += '<a-sphere position="' + (Math.cos(a)*r).toFixed(2) + ' ' + (altura + rand(-0.3, 0.4)).toFixed(2) + ' ' + (Math.sin(a)*r).toFixed(2) + '" radius="' + rand(0.55,0.85).toFixed(2) + '" color="' + folha + '" sway-dry="ampl: 4"></a-sphere>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0">' +
      '<a-cylinder position="0 ' + (altura/2).toFixed(2) + ' 0" radius="0.14" height="' + altura.toFixed(2) + '" color="' + tronco + '" shadow="cast: true"></a-cylinder>' +
      copa +
      '<a-sphere position="0 ' + (altura + 0.4).toFixed(2) + ' 0" radius="0.7" color="' + folha + '"></a-sphere>' +
      '</a-entity>';
  }

  function gerarAroeira(x, z) {
    const altura = rand(3.5, 5.5);
    const tronco = '#5A3A24', folha = '#4A7A3A';
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">' +
      '<a-cylinder position="0 ' + (altura/2).toFixed(2) + ' 0" radius="0.15" height="' + altura.toFixed(2) + '" color="' + tronco + '" shadow="cast: true"></a-cylinder>' +
      '<a-sphere position="0 ' + (altura + 0.3).toFixed(2) + ' 0" radius="1.2" color="' + folha + '"></a-sphere>' +
      '<a-sphere position="0.7 ' + (altura - 0.1).toFixed(2) + ' 0.3" radius="0.85" color="' + folha + '"></a-sphere>' +
      '<a-sphere position="-0.6 ' + (altura + 0.2).toFixed(2) + ' -0.4" radius="0.8" color="' + folha + '"></a-sphere>' +
      '</a-entity>';
  }

  function gerarArbusto(x, z) {
    const cor = pick(['#7A8A4A', '#8A7A3A', '#6A7A42']);
    let galhos = '';
    for (let i = 0; i < randInt(5, 8); i++) {
      const a = rand(0, Math.PI * 2);
      const h = rand(0.4, 0.9);
      galhos += '<a-cylinder position="' + (Math.cos(a)*0.15).toFixed(2) + ' ' + (h/2).toFixed(2) + ' ' + (Math.sin(a)*0.15).toFixed(2) + '" radius="0.02" height="' + h.toFixed(2) + '" color="' + cor + '" rotation="' + rand(-25,25).toFixed(1) + ' ' + (a*180/Math.PI).toFixed(1) + ' ' + rand(-25,25).toFixed(1) + '" sway-dry="ampl: 8"></a-cylinder>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">' + galhos + '</a-entity>';
  }

  function gerarCupinzeiro(x, z, tam) {
    const t = tam || 1;
    const h = 0.7 * t + Math.random() * 0.4;
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">' +
      '<a-cone position="0 ' + (h/2).toFixed(2) + ' 0" radius-bottom="' + (0.4*t).toFixed(2) + '" radius-top="0.08" height="' + h.toFixed(2) + '" color="#7A5A3A"></a-cone>' +
      '<a-sphere position="0 ' + (h*0.4).toFixed(2) + ' 0" radius="' + (0.22*t).toFixed(2) + '" color="#8A6A48"></a-sphere>' +
      '</a-entity>';
  }

  function gerarPedra(x, z, t) {
    const r = (t || 1) * rand(0.3, 0.7);
    return '<a-dodecahedron position="' + x.toFixed(2) + ' ' + (r*0.4).toFixed(2) + ' ' + z.toFixed(2) + '" radius="' + r.toFixed(2) + '" color="#8A7A5A" rotation="0 ' + rand(0,360).toFixed(1) + ' 0" scale="1.2 ' + rand(0.3,0.5).toFixed(2) + ' 1.2"></a-dodecahedron>';
  }

  function gerarCacimba(x, z) {
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">' +
      '<a-circle position="0 0.02 0" rotation="-90 0 0" radius="1.1" color="#8A7A5A"></a-circle>' +
      '<a-circle position="0 0.03 0" rotation="-90 0 0" radius="0.85" color="#4A8090" material="shader: standard; emissive: #2A5A70; emissiveIntensity: 0.3"></a-circle>' +
      '<a-circle position="0 0.04 0" rotation="-90 0 0" radius="0.6" color="#8AC8D8" opacity="0.5" transparent="true"></a-circle>' +
      '</a-entity>';
  }

  function gerarRioSeco() {
    let html = '';
    let x = -14, z = -6;
    for (let i = 0; i < 16; i++) {
      const t = i / 16;
      x += rand(0.8, 1.4) + Math.sin(t * 2) * 0.4;
      z += 1.2;
      const w = rand(0.9, 1.6);
      html += '<a-circle position="' + x.toFixed(2) + ' 0.008 ' + z.toFixed(2) + '" rotation="-90 0 0" radius="' + w.toFixed(2) + '" color="#B8A888" opacity="0.7" transparent="true"></a-circle>';
      for (let j = 0; j < 2; j++) {
        const rx = x + rand(-w, w) * 0.7;
        const rz = z + rand(-w, w) * 0.7;
        const rr = rand(0.08, 0.18);
        html += '<a-dodecahedron position="' + rx.toFixed(2) + ' ' + (rr*0.4).toFixed(2) + ' ' + rz.toFixed(2) + '" radius="' + rr.toFixed(2) + '" color="#9A8A6A" rotation="0 ' + rand(0,360).toFixed(1) + ' 0"></a-dodecahedron>';
      }
    }
    return html;
  }

  function gerarBromelia(x, z) {
    const cor1 = pick(['#A03828', '#C8382A', '#8A3820']);
    const cor2 = '#6A2818';
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0">' +
      '<a-cone position="0 0.1 0" radius-bottom="0.24" radius-top="0.14" height="0.14" color="' + cor2 + '"></a-cone>' +
      '<a-cone position="0 0.24 0" radius-bottom="0.20" radius-top="0.04" height="0.18" color="' + cor1 + '"></a-cone>' +
      '<a-cone position="0 0.38 0" radius-bottom="0.09" radius-top="0" height="0.14" color="' + cor1 + '"></a-cone>' +
      '</a-entity>';
  }

  function gerarCapimSeco(x, z) {
    const cor = pick(['#C8B888', '#B8A878', '#D8C898']);
    let html = '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">';
    for (let i = 0; i < randInt(3, 6); i++) {
      const a = rand(0, Math.PI * 2);
      const dx = Math.cos(a) * 0.04;
      const dz = Math.sin(a) * 0.04;
      const h = rand(0.2, 0.4);
      html += '<a-cone position="' + dx.toFixed(3) + ' ' + (h/2).toFixed(3) + ' ' + dz.toFixed(3) + '" radius-bottom="0.02" radius-top="0.002" height="' + h.toFixed(3) + '" color="' + cor + '" rotation="' + rand(-20,20).toFixed(1) + ' 0 ' + rand(-20,20).toFixed(1) + '"></a-cone>';
    }
    html += '</a-entity>';
    return html;
  }

  function gerarGaloPousado(x, y, z) {
    const cinza = '#7A7A7A', vermelho = '#C82A2A', branco = '#E8E8E0', preto = '#1A1A1A';
    return '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '">' +
      '<a-cylinder position="0 -0.16 0" rotation="0 0 90" radius="0.02" height="0.5" color="#4A3520"></a-cylinder>' +
      '<a-sphere radius="0.12" color="' + cinza + '" scale="1.4 1 1"></a-sphere>' +
      '<a-sphere position="0 -0.02 0.08" radius="0.08" color="' + branco + '" scale="1.15 1 1"></a-sphere>' +
      '<a-sphere position="0.14 0.12 0" radius="0.09" color="' + vermelho + '"></a-sphere>' +
      '<a-cone position="0.14 0.24 0" radius-bottom="0.06" radius-top="0.005" height="0.14" color="' + vermelho + '" rotation="0 0 -10"></a-cone>' +
      '<a-cone position="0.26 0.12 0" rotation="0 0 -90" radius-bottom="0.03" radius-top="0.005" height="0.07" color="' + branco + '"></a-cone>' +
      '<a-sphere position="0.20 0.14 0.05" radius="0.013" color="' + preto + '"></a-sphere>' +
      '<a-sphere position="-0.03 0.02 0.10" radius="0.08" color="' + cinza + '" scale="1.4 0.4 1" rotation="0 0 20"></a-sphere>' +
      '<a-sphere position="-0.03 0.02 -0.10" radius="0.08" color="' + cinza + '" scale="1.4 0.4 1" rotation="0 0 20"></a-sphere>' +
      '<a-cone position="-0.18 0 0" rotation="0 0 90" radius-bottom="0.05" radius-top="0.02" height="0.16" color="' + cinza + '"></a-cone>' +
      '<a-cone position="0 -0.08 0" radius-bottom="0.05" radius-top="0" height="0.06" color="' + preto + '"></a-cone>' +
      '</a-entity>';
  }

  function gerarGaloVoando(x, y, z) {
    const cinza = '#7A7A7A', vermelho = '#C82A2A', branco = '#E8E8E0';
    const r = rand(2, 4);
    const dur = randInt(8000, 12000);
    return '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '" flutter-bird="raio: ' + r.toFixed(2) + '; alt: ' + y.toFixed(2) + '; dur: ' + dur + '">' +
      '<a-sphere radius="0.08" color="' + cinza + '" scale="1.5 0.9 0.7"></a-sphere>' +
      '<a-sphere position="0.10 0.04 0" radius="0.055" color="' + vermelho + '"></a-sphere>' +
      '<a-cone position="0.18 0.04 0" rotation="0 0 -90" radius-bottom="0.02" radius-top="0" height="0.05" color="' + branco + '"></a-cone>' +
      '<a-plane position="-0.06 0.06 0.10" width="0.15" height="0.08" color="' + cinza + '" material="shader: flat; side: double" rotation="0 30 -20"></a-plane>' +
      '<a-plane position="-0.06 0.06 -0.10" width="0.15" height="0.08" color="' + cinza + '" material="shader: flat; side: double" rotation="0 -30 -20"></a-plane>' +
      '</a-entity>';
  }

  function montarBiomaCaatingaGalo(animal, opts) {
    opts = opts || {};
    const denso = opts.densidade !== 'baixa';
    const skyTopo = '#6CB4EE', skyBase = '#F0D8A0', chaoBase = '#C8B080', chaoVar = '#D8C090';

    const skySrc = window.MewBiomas && window.MewBiomas.criarTexturaGradiente
      ? window.MewBiomas.criarTexturaGradiente(skyTopo, skyBase)
      : null;

    let html = skySrc
      ? '<a-sky src="' + skySrc + '" color="' + skyBase + '"></a-sky>'
      : '<a-sky color="' + skyBase + '"></a-sky>';

    html += '<a-circle position="0 0 0" rotation="-90 0 0" radius="90" color="' + chaoBase + '" shadow="receive: true"></a-circle>';

    for (let i = 0; i < (denso ? 25 : 15); i++) {
      const p = pos(2, 40);
      const r = rand(1.5, 4.5);
      html += '<a-circle position="' + p.x.toFixed(2) + ' 0.005 ' + p.z.toFixed(2) + '" rotation="-90 0 0" radius="' + r.toFixed(2) + '" color="' + chaoVar + '" opacity="0.55" transparent="true"></a-circle>';
    }

    html += gerarRioSeco();
    html += gerarCacimba(-8, 4);
    html += gerarCacimba(9, -6);

    for (let i = 0; i < (denso ? 10 : 6); i++) {
      const p = pos(8, 25);
      html += gerarJuazeiro(p.x, p.z);
    }
    for (let i = 0; i < (denso ? 6 : 4); i++) {
      const p = pos(10, 28);
      html += gerarAroeira(p.x, p.z);
    }
    for (let i = 0; i < (denso ? 22 : 14); i++) {
      const p = pos(3, 24);
      html += gerarMandacaru(p.x, p.z, rand(1.6, 3.2));
    }
    for (let i = 0; i < (denso ? 8 : 5); i++) {
      const p = pos(5, 22);
      html += gerarFacheiro(p.x, p.z, rand(2.5, 4.5));
    }
    for (let i = 0; i < (denso ? 18 : 10); i++) {
      const p = pos(2, 20);
      html += gerarXiqueXique(p.x, p.z);
    }
    for (let i = 0; i < (denso ? 30 : 18); i++) {
      const p = pos(1.5, 25);
      html += gerarArbusto(p.x, p.z);
    }
    for (let i = 0; i < (denso ? 8 : 4); i++) {
      const p = pos(5, 20);
      html += gerarCupinzeiro(p.x, p.z, rand(0.8, 1.4));
    }
    for (let i = 0; i < (denso ? 20 : 12); i++) {
      const p = pos(2, 25);
      html += gerarPedra(p.x, p.z, rand(0.6, 1.3));
    }
    for (let i = 0; i < (denso ? 80 : 45); i++) {
      const p = pos(1, 22);
      html += gerarCapimSeco(p.x, p.z);
    }
    for (let i = 0; i < (denso ? 12 : 7); i++) {
      const p = pos(2, 18);
      html += gerarBromelia(p.x, p.z);
    }

    html += gerarGaloPousado(-2.0, 1.0, -2.5);
    html += gerarGaloPousado(2.5, 1.3, -3.2);
    html += gerarGaloPousado(-3.8, 0.9, 2.2);
    if (denso) {
      html += gerarGaloPousado(4.0, 1.2, 1.8);
      html += gerarGaloPousado(0.5, 1.6, -5.0);
    }
    for (let i = 0; i < (denso ? 5 : 3); i++) {
      const p = pos(3, 12);
      html += gerarGaloVoando(p.x, rand(2.5, 4.5), p.z);
    }

    html += '<a-entity position="0 2.2 2.5" info-hotspot="titulo: Galo-de-campina; descricao: Paroaria dominicana — endêmico da Caatinga. Cabeça vermelha e corpo cinza. Adaptou-se a áreas abertas e cidades.; cor: #C82A2A"></a-entity>';
    html += '<a-entity position="-4 1.0 -3" info-hotspot="titulo: Mandacaru; descricao: Cacto colunar símbolo da Caatinga. Armazena água e alimenta aves e insetos na seca.; cor: #3E7A3E"></a-entity>';
    html += '<a-entity position="3 1.2 -4" info-hotspot="titulo: Juazeiro; descricao: Árvore espinhosa da mata baixa. Oferece sombra e frutos para o galo-de-campina.; cor: #5A8A3A"></a-entity>';
    html += '<a-entity position="-8 0.8 4" info-hotspot="titulo: Cacimba; descricao: Poço natural que mantém água na seca. Ponto de encontro de aves e fonte de vida no sertão.; cor: #4A8090"></a-entity>';
    html += '<a-entity position="-4 0.6 -5" info-hotspot="titulo: Rio seco; descricao: Leito pedregoso que só enche na estação das chuvas. Corredor ecológico da Caatinga.; cor: #B8A888"></a-entity>';
    html += '<a-entity position="5 1.0 -6" info-hotspot="titulo: Cupinzeiro; descricao: Construção de cupins. Regula o solo e alimenta tamanduás e tatus da região.; cor: #7A5A3A"></a-entity>';
    html += '<a-entity position="-3 0.6 4" info-hotspot="titulo: Bromélia; descricao: Reservatório natural de água. Abriga sapos, insetos e micro-organismos na seca.; cor: #A03828"></a-entity>';
    html += '<a-entity position="0 3.0 -10" info-hotspot="titulo: Caatinga; descricao: Bioma exclusivamente brasileiro. Vegetação que perde folhas na seca e renasce nas chuvas.; cor: #D8C090"></a-entity>';

    html += '<a-entity light="type: ambient; color: #FFF0D8; intensity: 0.85"></a-entity>' +
            '<a-entity position="8 14 4" light="type: directional; color: #FFE8A8; intensity: 1.3; castShadow: true; shadowMapWidth: 2048; shadowMapHeight: 2048"></a-entity>' +
            '<a-entity position="-6 6 -3" light="type: point; color: #FFE0A0; intensity: 0.4; distance: 15"></a-entity>';

    return { html, bioma: { nome: 'Caatinga', skyTopo, skyBase, fog: '#E8D0A0', fogDensity: 0.012 } };
  }

  if (!window.MewBiomas) { console.warn('[bioma_caatinga_galo] biomas_fauna.js ausente.'); return; }

  const _detectar = window.MewBiomas.detectarBioma;
  window.MewBiomas.detectarBioma = function (animal) {
    const nome = (animal.nome_popular || '').toLowerCase();
    if (nome.indexOf('galo-de-campina') !== -1 || nome.indexOf('galo de campina') !== -1 || nome.indexOf('cardeal') !== -1) {
      return 'caatingaGalo';
    }
    return _detectar.call(this, animal);
  };

  const _montar = window.MewBiomas.montarCena3D;
  window.MewBiomas.montarCena3D = function (animal, opts) {
    const chave = window.MewBiomas.detectarBioma(animal);
    if (chave === 'caatingaGalo') return montarBiomaCaatingaGalo(animal, opts);
    return _montar.call(this, animal, opts);
  };

  window.MewBiomas.montarBiomaCaatingaGalo = montarBiomaCaatingaGalo;
  console.log('[bioma_caatinga_galo] Bioma Caatinga (Galo-de-campina) registrado.');
})();