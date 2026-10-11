/* =========================================================
   bioma_costeiro.js — v3
   Bioma Costeiro/Marinho — Peixe-boi-marinho.
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

  function gerarMangue(x, z, rot, h) {
    const tronco = '#2E3D2E', folha = '#26402C', folha2 = '#1F3624', raiz = '#243024';
    const altura = h || rand(1.6, 2.6);
    const rf = rand(0.7, 1.1);
    let raizes = '';
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2;
      const dx = Math.cos(ang) * 0.32;
      const dz = Math.sin(ang) * 0.32;
      const incl = rand(15, 30) * (i % 2 === 0 ? 1 : -1);
      raizes += '<a-cylinder position="' + dx.toFixed(2) + ' ' + (altura * 0.16).toFixed(2) + ' ' + dz.toFixed(2) + '" radius="0.024" height="' + (altura * 0.38).toFixed(2) + '" color="' + raiz + '" rotation="' + incl.toFixed(1) + ' 0 ' + (-incl * 0.6).toFixed(1) + '"></a-cylinder>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rot.toFixed(1) + ' 0">' +
      raizes +
      '<a-cylinder position="0 ' + (altura / 2).toFixed(2) + ' 0" radius="0.08" height="' + altura.toFixed(2) + '" color="' + tronco + '"></a-cylinder>' +
      '<a-sphere position="0 ' + (altura + rf * 0.4).toFixed(2) + ' 0" radius="' + rf.toFixed(2) + '" color="' + folha + '"></a-sphere>' +
      '<a-sphere position="' + (rf * 0.5).toFixed(2) + ' ' + (altura + rf * 0.2).toFixed(2) + ' ' + (rf * 0.35).toFixed(2) + '" radius="' + (rf * 0.68).toFixed(2) + '" color="' + folha2 + '"></a-sphere>' +
      '<a-sphere position="' + (-rf * 0.45).toFixed(2) + ' ' + (altura + rf * 0.3).toFixed(2) + ' ' + (-rf * 0.4).toFixed(2) + '" radius="' + (rf * 0.6).toFixed(2) + '" color="' + folha + '"></a-sphere>' +
      '<a-sphere position="' + (rf * 0.15).toFixed(2) + ' ' + (altura + rf * 0.7).toFixed(2) + ' ' + (-rf * 0.15).toFixed(2) + '" radius="' + (rf * 0.5).toFixed(2) + '" color="' + folha2 + '"></a-sphere>' +
      '</a-entity>';
  }

  function gerarTufoCapim(x, z, alt) {
    const cores = ['#3E7A3A', '#4A8A42', '#356E32'];
    const cor = pick(cores);
    const h = alt || rand(0.16, 0.34);
    const qtd = randInt(4, 7);
    const swayAmp = rand(6, 14).toFixed(1);
    const dur = randInt(2000, 3400);
    let html = '';
    for (let i = 0; i < qtd; i++) {
      const a = (i / qtd) * Math.PI * 2 + Math.random() * 0.6;
      const dx = Math.cos(a) * 0.05;
      const dz = Math.sin(a) * 0.05;
      const hh = h * rand(0.7, 1.25);
      const tilt = rand(-14, 14);
      html += '<a-cone position="' + dx.toFixed(3) + ' ' + (hh / 2).toFixed(3) + ' ' + dz.toFixed(3) + '" radius-bottom="0.04" radius-top="0.003" height="' + hh.toFixed(3) + '" color="' + cor + '" rotation="' + tilt.toFixed(1) + ' 0 ' + (tilt * 0.5).toFixed(1) + '"></a-cone>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" sway-grass="ampl: ' + swayAmp + '" animation__dur="property: rotation; dur: ' + dur + '">' + html + '</a-entity>';
  }

  function gerarCoralRamo(x, z, cor) {
    const h = rand(0.28, 0.5);
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0">' +
      '<a-cylinder position="0 ' + (h/2).toFixed(2) + ' 0" radius="0.05" height="' + h.toFixed(2) + '" color="' + cor + '"></a-cylinder>' +
      '<a-cylinder position="0.08 ' + (h*0.75).toFixed(2) + ' 0" radius="0.035" height="' + (h*0.55).toFixed(2) + '" color="' + cor + '" rotation="0 0 -30"></a-cylinder>' +
      '<a-cylinder position="-0.08 ' + (h*0.8).toFixed(2) + ' 0" radius="0.035" height="' + (h*0.5).toFixed(2) + '" color="' + cor + '" rotation="0 0 30"></a-cylinder>' +
      '<a-sphere position="0 ' + h.toFixed(2) + ' 0" radius="0.07" color="' + cor + '"></a-sphere>' +
      '</a-entity>';
  }

  function gerarCoralCerebro(x, z, cor) {
    const r = rand(0.18, 0.32);
    return '<a-entity position="' + x.toFixed(2) + ' ' + (r*0.6).toFixed(2) + ' ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0">' +
      '<a-dodecahedron radius="' + r.toFixed(2) + '" color="' + cor + '" scale="1.15 0.7 1.15"></a-dodecahedron>' +
      '<a-sphere position="0 ' + (r*0.4).toFixed(2) + ' 0" radius="' + (r*0.55).toFixed(2) + '" color="' + cor + '" scale="1.1 0.6 1.1"></a-sphere>' +
      '</a-entity>';
  }

  function gerarCoralLeque(x, z, cor) {
    const h = rand(0.4, 0.7);
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0">' +
      '<a-circle position="0 ' + (h*0.55).toFixed(2) + ' 0" radius="' + (h*0.45).toFixed(2) + '" color="' + cor + '" material="shader: flat; side: double; opacity: 0.75; transparent: true"></a-circle>' +
      '<a-circle position="0 ' + (h*0.55).toFixed(2) + ' 0" rotation="90 0 0" radius="' + (h*0.38).toFixed(2) + '" color="' + cor + '" material="shader: flat; side: double; opacity: 0.6; transparent: true"></a-circle>' +
      '<a-cylinder position="0 ' + (h*0.25).toFixed(2) + ' 0" radius="0.025" height="' + (h*0.5).toFixed(2) + '" color="' + cor + '"></a-cylinder>' +
      '</a-entity>';
  }

  function gerarCoralTubo(x, z, cor) {
    const qtd = randInt(3, 5);
    let html = '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">';
    for (let i = 0; i < qtd; i++) {
      const h = rand(0.25, 0.5);
      const dx = rand(-0.15, 0.15);
      const dz = rand(-0.15, 0.15);
      html += '<a-cylinder position="' + dx.toFixed(2) + ' ' + (h/2).toFixed(2) + ' ' + dz.toFixed(2) + '" radius="0.045" height="' + h.toFixed(2) + '" color="' + cor + '"></a-cylinder>' +
              '<a-sphere position="' + dx.toFixed(2) + ' ' + h.toFixed(2) + ' ' + dz.toFixed(2) + '" radius="0.045" color="' + cor + '"></a-sphere>';
    }
    html += '</a-entity>';
    return html;
  }

  function gerarAnemona(x, z, cor) {
    const qtd = randInt(8, 14);
    const base = rand(0.08, 0.13);
    let html = '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">';
    html += '<a-cylinder position="0 0.03 0" radius="' + base.toFixed(3) + '" height="0.06" color="#B06A80"></a-cylinder>';
    for (let i = 0; i < qtd; i++) {
      const a = (i / qtd) * Math.PI * 2;
      const dx = Math.cos(a) * base * 0.8;
      const dz = Math.sin(a) * base * 0.8;
      const h = rand(0.12, 0.22);
      const tilt = rand(10, 25);
      html += '<a-cylinder position="' + dx.toFixed(3) + ' ' + (h/2 + 0.05).toFixed(3) + ' ' + dz.toFixed(3) + '" radius="0.012" height="' + h.toFixed(3) + '" color="' + cor + '" rotation="' + tilt.toFixed(1) + ' ' + (a*180/Math.PI).toFixed(1) + ' 0"></a-cylinder>';
    }
    html += '</a-entity>';
    return html;
  }

  function gerarPedra(x, z, escala) {
    const r = (escala || 1) * rand(0.22, 0.45);
    return '<a-dodecahedron position="' + x.toFixed(2) + ' ' + (r*0.6).toFixed(2) + ' ' + z.toFixed(2) + '" radius="' + r.toFixed(2) + '" color="#6A6A5E" rotation="0 ' + rand(0,360).toFixed(1) + ' 0" scale="1 ' + rand(0.55,0.9).toFixed(2) + ' 1"></a-dodecahedron>';
  }

  function gerarEstrela(x, z, cor) {
    const r = rand(0.08, 0.13);
    let bracos = '';
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const dx = Math.cos(a) * r * 0.9;
      const dz = Math.sin(a) * r * 0.9;
      bracos += '<a-cone position="' + dx.toFixed(3) + ' 0.015 ' + dz.toFixed(3) + '" radius-bottom="' + (r*0.35).toFixed(3) + '" radius-top="0.005" height="' + (r*1.1).toFixed(3) + '" color="' + cor + '" rotation="90 ' + (a*180/Math.PI).toFixed(1) + ' 0"></a-cone>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0"><a-cylinder position="0 0.015 0" radius="' + (r*0.55).toFixed(3) + '" height="0.03" color="' + cor + '"></a-cylinder>' + bracos + '</a-entity>';
  }

  function gerarOurico(x, z) {
    const r = rand(0.06, 0.1);
    let espinhos = '';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const dx = Math.cos(a) * r * 0.7;
      const dz = Math.sin(a) * r * 0.7;
      espinhos += '<a-cone position="' + dx.toFixed(3) + ' ' + (r*0.6).toFixed(3) + ' ' + dz.toFixed(3) + '" radius-bottom="0.008" radius-top="0" height="' + (r*1.3).toFixed(3) + '" color="#3A2A20" rotation="' + rand(-30,30).toFixed(1) + ' ' + (a*180/Math.PI).toFixed(1) + ' ' + rand(-30,30).toFixed(1) + '"></a-cone>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '"><a-sphere position="0 ' + (r*0.6).toFixed(3) + ' 0" radius="' + r.toFixed(3) + '" color="#4A3528"></a-sphere>' + espinhos + '</a-entity>';
  }

  function gerarConcha(x, z) {
    const r = rand(0.07, 0.12);
    return '<a-sphere position="' + x.toFixed(2) + ' ' + (r*0.4).toFixed(3) + ' ' + z.toFixed(2) + '" radius="' + r.toFixed(3) + '" color="#F0E0C8" scale="1.2 0.6 1"></a-sphere>';
  }

  function gerarPeixe(x, y, z, cor, tam) {
    const t = (tam || 1) * rand(0.7, 1.3);
    const dur = randInt(5000, 9000);
    const dist = rand(2.5, 5);
    const dir = Math.random() > 0.5 ? 1 : -1;
    return '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '" animation="property: position; from: ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '; to: ' + (x + dist * dir).toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '; dur: ' + dur + '; dir: alternate; loop: true; easing: easeInOutSine">' +
      '<a-sphere radius="' + (0.05*t).toFixed(3) + '" color="' + cor + '" scale="1.8 0.9 0.55"></a-sphere>' +
      '<a-cone position="' + (0.08*t).toFixed(3) + ' 0 0" rotation="0 0 -90" radius-bottom="' + (0.05*t).toFixed(3) + '" radius-top="0" height="' + (0.09*t).toFixed(3) + '" color="' + cor + '"></a-cone>' +
      '<a-sphere position="' + (0.02*t).toFixed(3) + ' ' + (0.012*t).toFixed(3) + ' ' + (0.045*t).toFixed(3) + '" radius="' + (0.012*t).toFixed(3) + '" color="#000"></a-sphere>' +
      '<a-sphere position="' + (0.02*t).toFixed(3) + ' ' + (0.012*t).toFixed(3) + ' ' + (-0.045*t).toFixed(3) + '" radius="' + (0.012*t).toFixed(3) + '" color="#000"></a-sphere>' +
      '</a-entity>';
  }

  function gerarCardume(cx, cy, cz, corBase, qtd) {
    let html = '<a-entity position="' + cx.toFixed(2) + ' ' + cy.toFixed(2) + ' ' + cz.toFixed(2) + '">';
    const n = qtd || randInt(5, 9);
    for (let i = 0; i < n; i++) {
      const ox = rand(-0.6, 0.6);
      const oy = rand(-0.25, 0.25);
      const oz = rand(-0.6, 0.6);
      const c = Math.random() > 0.7 ? '#FFD166' : corBase;
      html += gerarPeixe(ox, oy, oz, c, 0.7);
    }
    html += '</a-entity>';
    return html;
  }

  function gerarAguaViva(x, y, z, cor) {
    const r = rand(0.16, 0.24);
    const dur = randInt(2800, 4200);
    const amp = rand(0.15, 0.3);
    let tentaculos = '';
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const dx = Math.cos(a) * r * 0.55;
      const dz = Math.sin(a) * r * 0.55;
      const h = rand(0.25, 0.45);
      tentaculos += '<a-cylinder position="' + dx.toFixed(3) + ' ' + (-h/2 - 0.02).toFixed(3) + ' ' + dz.toFixed(3) + '" radius="0.008" height="' + h.toFixed(3) + '" color="' + cor + '" opacity="0.6" transparent="true"></a-cylinder>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '" animation="property: position; from: ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '; to: ' + x.toFixed(2) + ' ' + (y+amp).toFixed(2) + ' ' + z.toFixed(2) + '; dur: ' + dur + '; dir: alternate; loop: true; easing: easeInOutSine">' +
      '<a-sphere radius="' + r.toFixed(3) + '" color="' + cor + '" material="shader: standard; emissive: ' + cor + '; emissiveIntensity: 0.4; opacity: 0.65; transparent: true" scale="1 0.7 1"></a-sphere>' + tentaculos + '</a-entity>';
  }

  function gerarBolha(x, y0, z, y1) {
    const dur = randInt(4000, 8000);
    const r = rand(0.03, 0.07);
    return '<a-sphere position="' + x.toFixed(2) + ' ' + y0.toFixed(2) + ' ' + z.toFixed(2) + '" radius="' + r.toFixed(3) + '" color="#E0F8FF" material="shader: standard; opacity: 0.4; transparent: true; emissive: #B0E8F5; emissiveIntensity: 0.6" animation="property: position; from: ' + x.toFixed(2) + ' ' + y0.toFixed(2) + ' ' + z.toFixed(2) + '; to: ' + x.toFixed(2) + ' ' + y1.toFixed(2) + ' ' + z.toFixed(2) + '; dur: ' + dur + '; loop: true; easing: linear"></a-sphere>';
  }

  function gerarRaioSol(x, z, alt, r) {
    return '<a-cone position="' + x.toFixed(2) + ' ' + (alt/2 + 1).toFixed(2) + ' ' + z.toFixed(2) + '" radius-bottom="' + r.toFixed(2) + '" radius-top="' + (r*0.3).toFixed(2) + '" height="' + alt.toFixed(2) + '" color="#FFF8E0" material="shader: flat; opacity: 0.08; transparent: true; side: double"></a-cone>';
  }

  function gerarPoste(x, z, h) {
    const alt = h || rand(1.8, 3);
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0">' +
      '<a-cylinder position="0 ' + (alt/2).toFixed(2) + ' 0" radius="0.08" height="' + alt.toFixed(2) + '" color="#3A2818"></a-cylinder>' +
      '<a-sphere position="0 ' + alt.toFixed(2) + ' 0" radius="0.1" color="#2A1A10"></a-sphere>' +
      '<a-cylinder position="0.05 ' + (alt*0.7).toFixed(2) + ' 0" radius="0.02" height="0.15" color="#5A4A30" rotation="0 0 -40"></a-cylinder>' +
      '</a-entity>';
  }

  function gerarBoia(x, y, z, cor) {
    return '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '" bobber="amp: 0.1; dur: ' + randInt(2200,3200) + '">' +
      '<a-sphere radius="0.14" color="' + cor + '"></a-sphere>' +
      '<a-sphere position="0 0.08 0" radius="0.1" color="#FFFFFF"></a-sphere>' +
      '<a-cylinder position="0 0.18 0" radius="0.015" height="0.15" color="#333"></a-cylinder>' +
      '</a-entity>';
  }

  function gerarBarco(x, y, z, rot) {
    return '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '" rotation="0 ' + rot.toFixed(1) + ' 0" bobber="amp: 0.06; dur: 3200">' +
      '<a-box width="1.2" height="0.15" depth="0.4" color="#4A3520"></a-box>' +
      '<a-box position="0 0.18 0" width="0.8" height="0.1" depth="0.3" color="#6A4A28"></a-box>' +
      '<a-cylinder position="0 0.55 0" radius="0.02" height="0.8" color="#3A2818"></a-cylinder>' +
      '<a-plane position="0.3 0.9 0" width="0.5" height="0.5" color="#F0F0E8" material="shader: flat; side: double; opacity: 0.9; transparent: true"></a-plane>' +
      '</a-entity>';
  }

  function gerarPlacaItamaraca(x, z, rot) {
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rot.toFixed(1) + ' 0">' +
      '<a-cylinder position="-0.55 0.6 0" radius="0.045" height="1.2" color="#3A2818"></a-cylinder>' +
      '<a-cylinder position="0.55 0.6 0" radius="0.045" height="1.2" color="#3A2818"></a-cylinder>' +
      '<a-box position="0 1.35 0" width="1.5" height="0.85" depth="0.05" color="#1F5A30"></a-box>' +
      '<a-box position="0 1.35 0.03" width="1.42" height="0.77" depth="0.03" color="#2E7A3E"></a-box>' +
      '<a-text value="CENTRO DE PRESERVAÇÃO" position="0 1.55 0.06" align="center" color="#d5ffdd" width="2.6" font="mozillavr"></a-text>' +
      '<a-text value="Ilha de Itamaracá — ICMBio / CMA" position="0 1.38 0.06" align="center" color="#7ee898" width="2.2" font="mozillavr"></a-text>' +
      '<a-text value="Resgate · Reabilitação · Soltura" position="0 1.22 0.06" align="center" color="#a8d8b8" width="2.2" font="mozillavr"></a-text>' +
      '</a-entity>';
  }

  function montarBiomaCosteiro(animal, opts) {
    opts = opts || {};
    const denso = opts.densidade !== 'baixa';

    const skyTopo = '#3FA8C8', skyBase = '#B8E8F0', areia = '#D8C896';

    const skySrc = window.MewBiomas && window.MewBiomas.criarTexturaGradiente
      ? window.MewBiomas.criarTexturaGradiente(skyTopo, skyBase)
      : null;

    let html = skySrc
      ? '<a-sky src="' + skySrc + '" color="' + skyBase + '"></a-sky>'
      : '<a-sky color="' + skyBase + '"></a-sky>';

    html += '<a-circle position="0 0 0" rotation="-90 0 0" radius="90" color="' + areia + '" shadow="receive: true"></a-circle>' +
            '<a-circle position="0 0.005 0" rotation="-90 0 0" radius="90" color="#6FB8D8" opacity="0.30" transparent="true"></a-circle>';

    for (let i = 0; i < (denso ? 14 : 8); i++) {
      const p = pos(2, 40);
      const r = rand(1.5, 4);
      const cor = Math.random() > 0.5 ? '#C8B888' : '#E8D8A8';
      html += '<a-circle position="' + p.x.toFixed(2) + ' 0.008 ' + p.z.toFixed(2) + '" rotation="-90 0 0" radius="' + r.toFixed(2) + '" color="' + cor + '" opacity="0.45" transparent="true"></a-circle>';
    }

    html += '<a-circle position="0 2.85 0" rotation="-90 0 0" radius="90" color="#5FB8D4" opacity="0.18" transparent="true"></a-circle>' +
            '<a-circle position="0 2.86 0" rotation="-90 0 0" radius="90" color="#A8E8F5" opacity="0.06" transparent="true"></a-circle>';

    for (let i = 0; i < (denso ? 5 : 3); i++) {
      const p = pos(3, 15);
      html += gerarRaioSol(p.x, p.z, rand(4, 6), rand(0.8, 1.6));
    }

    const nMangues = denso ? 18 : 12;
    for (let i = 0; i < nMangues; i++) {
      const ang = (i / nMangues) * Math.PI * 2 + rand(-0.15, 0.15);
      const r = 40 + rand(-3, 3);
      html += gerarMangue(Math.cos(ang) * r, Math.sin(ang) * r, rand(0, 360), rand(2.4, 3.8));
    }

    for (let i = 0; i < (denso ? 130 : 80); i++) {
      const p = pos(1.5, 20);
      html += gerarTufoCapim(p.x, p.z);
    }
    for (let i = 0; i < (denso ? 40 : 22); i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(0, 2.2);
      html += gerarTufoCapim(Math.cos(a) * r, Math.sin(a) * r, 0.32);
    }

    const coresCorais = ['#FF6B9D', '#FFA07A', '#FFD700', '#EE82EE', '#40E0D0', '#FF8C69', '#B57EDC', '#7EE0C8'];
    for (let i = 0; i < (denso ? 42 : 26); i++) {
      const p = pos(4, 22);
      const c = pick(coresCorais);
      const t = randInt(0, 3);
      if (t === 0) html += gerarCoralRamo(p.x, p.z, c);
      else if (t === 1) html += gerarCoralCerebro(p.x, p.z, c);
      else if (t === 2) html += gerarCoralLeque(p.x, p.z, c);
      else html += gerarCoralTubo(p.x, p.z, c);
    }
    for (let i = 0; i < (denso ? 22 : 12); i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(0, 2.5);
      const c = pick(coresCorais);
      const t = randInt(0, 3);
      const xx = 4 + Math.cos(a) * r;
      const zz = -4 + Math.sin(a) * r;
      if (t === 0) html += gerarCoralRamo(xx, zz, c);
      else if (t === 1) html += gerarCoralCerebro(xx, zz, c);
      else if (t === 2) html += gerarCoralLeque(xx, zz, c);
      else html += gerarCoralTubo(xx, zz, c);
    }

    const coresAne = ['#FFB6C1', '#FF9AA2', '#E8B4D8', '#FFC0CB'];
    for (let i = 0; i < (denso ? 12 : 7); i++) {
      const p = pos(4, 16);
      html += gerarAnemona(p.x, p.z, pick(coresAne));
    }

    for (let i = 0; i < (denso ? 14 : 9); i++) {
      const p = pos(3, 25);
      html += gerarPedra(p.x, p.z, rand(0.8, 1.6));
    }
    for (let i = 0; i < 4; i++) {
      const p = pos(15, 30);
      html += gerarPedra(p.x, p.z, 2.5);
    }

    for (let i = 0; i < (denso ? 22 : 12); i++) {
      const p = pos(2, 20);
      const t = Math.random();
      if (t < 0.35) html += gerarEstrela(p.x, p.z, pick(['#FF8C69', '#FF6B9D', '#FFD700', '#E8A87C']));
      else if (t < 0.7) html += gerarOurico(p.x, p.z);
      else html += gerarConcha(p.x, p.z);
    }

    const peixesCores = ['#FFD166', '#FF8C42', '#7ED9E5', '#F7A072', '#E0BBE4', '#FFB347'];
    for (let i = 0; i < (denso ? 14 : 8); i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(2, 10);
      html += gerarPeixe(Math.cos(a) * r, rand(0.4, 2.3), Math.sin(a) * r, pick(peixesCores), rand(0.8, 1.3));
    }
    for (let i = 0; i < (denso ? 4 : 2); i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(4, 12);
      html += gerarCardume(Math.cos(a) * r, rand(0.8, 2.2), Math.sin(a) * r, pick(peixesCores), randInt(6, 10));
    }
    for (let i = 0; i < (denso ? 6 : 3); i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(3, 12);
      html += gerarAguaViva(Math.cos(a) * r, rand(0.6, 2.2), Math.sin(a) * r, pick(['#F0C8F0', '#C8E8F8', '#F8E0C8']));
    }
    for (let i = 0; i < (denso ? 30 : 18); i++) {
      const p = pos(0, 15);
      html += gerarBolha(p.x, rand(0.05, 0.5), p.z, rand(2.4, 3));
    }
    for (let i = 0; i < (denso ? 10 : 6); i++) {
      const a = (i / (denso ? 10 : 6)) * Math.PI * 0.4 - Math.PI * 0.2;
      const r = 10 + Math.random() * 3;
      html += gerarPoste(Math.cos(a) * r - 5, Math.sin(a) * r - 8, rand(1.8, 3.2));
    }
    const coresBoias = ['#E85A3A', '#F0C230', '#3AA0E8', '#E85A85'];
    for (let i = 0; i < (denso ? 4 : 2); i++) {
      const p = pos(8, 16);
      html += gerarBoia(p.x, 2.6, p.z, pick(coresBoias));
    }
    for (let i = 0; i < (denso ? 3 : 2); i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(28, 38);
      html += gerarBarco(Math.cos(a) * r, 2.5, Math.sin(a) * r, rand(0, 360));
    }
    html += gerarPlacaItamaraca(-9, -5, 30);

    html += '<a-entity position="-3 0.75 -3.5" info-hotspot="titulo: Capim-marinho; descricao: Principal alimento do peixe-boi. Cada adulto come 30-50 kg por dia.; cor: #7ee898"></a-entity>';
    html += '<a-entity position="4 0.95 -4" info-hotspot="titulo: Recife de corais; descricao: Berçário de peixes e invertebrados. Peixes-boi usam como abrigo e área de descanso.; cor: #FF8C69"></a-entity>';
    html += '<a-entity position="0 3.2 -30" info-hotspot="titulo: Manguezal; descricao: Raízes aéreas seguram o lodo e protegem filhotes. Fonte de água doce para o peixe-boi.; cor: #2E8B57"></a-entity>';
    html += '<a-entity position="-9 1.6 -5" info-hotspot="titulo: Centro de Preservação; descricao: Ilha de Itamaracá sedia o CMA/ICMBio — resgate, reabilitação e soltura de peixes-boi.; cor: #40E0D0"></a-entity>';
    html += '<a-entity position="0 0.85 -7" info-hotspot="titulo: Estuário; descricao: Encontro da água doce do rio com o mar. Água salobra rica em nutrientes — rota do peixe-boi.; cor: #FFD166"></a-entity>';
    html += '<a-entity position="-4 2.3 -10" info-hotspot="titulo: Bacia do Pina; descricao: Zona portuária do Recife onde peixes-boi já foram registrados. Corredor urbano da espécie.; cor: #F7A072"></a-entity>';
    html += '<a-entity position="7 2.7 -12" info-hotspot="titulo: Boia sinalizadora; descricao: Marca zonas de proteção e rotas de navegação para evitar colisões com peixes-boi.; cor: #E85A3A"></a-entity>';
    html += '<a-entity position="0 1.5 2.5" info-hotspot="titulo: Peixe-boi-marinho; descricao: Mamífero aquático dócil. Em Pernambuco é Em Perigo — perda de habitat, redes e poluição.; cor: #FF6B9D"></a-entity>';

    html += '<a-entity light="type: ambient; color: #DFF8FF; intensity: 0.85"></a-entity>' +
            '<a-entity position="6 12 6" light="type: directional; color: #FFF8E0; intensity: 1.15; castShadow: true; shadowMapWidth: 2048; shadowMapHeight: 2048"></a-entity>' +
            '<a-entity position="-6 5 -3" light="type: point; color: #B8E8F8; intensity: 0.4; distance: 12"></a-entity>' +
            '<a-entity position="5 3 -8" light="type: point; color: #C8F5FF; intensity: 0.3; distance: 10"></a-entity>';

    return { html, bioma: { nome: 'Costeiro e Marinho', skyTopo, skyBase, fog: '#A8D8E8', fogDensity: 0.018 } };
  }

  if (!window.MewBiomas) { console.warn('[bioma_costeiro] biomas_fauna.js ausente.'); return; }

  const _detectar = window.MewBiomas.detectarBioma;
  window.MewBiomas.detectarBioma = function (animal) {
    const nome = (animal.nome_popular || '').toLowerCase();
    if (nome.indexOf('peixe-boi') !== -1) return 'costeiroMarinho';
    return _detectar.call(this, animal);
  };

  const _montar = window.MewBiomas.montarCena3D;
  window.MewBiomas.montarCena3D = function (animal, opts) {
    const chave = window.MewBiomas.detectarBioma(animal);
    if (chave === 'costeiroMarinho') return montarBiomaCosteiro(animal, opts);
    return _montar.call(this, animal, opts);
  };

  window.MewBiomas.montarBiomaCosteiro = montarBiomaCosteiro;
  console.log('[bioma_costeiro] v3 — Bioma Costeiro/Marinho registrado.');
})();