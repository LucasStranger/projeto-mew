/* =========================================================
   bioma_mataatlantica.js — v2
   Bioma Mata Atlântica — Saíra-pintor (Tangara fastuosa).
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
    const altura = h || rand(4.5, 7.5);
    const troncoC = pick(['#3A2418', '#4A2E1C', '#2E1A0E']);
    const folha1  = pick(['#1E4A1E', '#2A5A28', '#164018']);
    const folha2  = pick(['#2E6A30', '#386A34', '#1A5020']);
    const folha3  = pick(['#3E7A3A', '#4A8A40']);
    const rf = rand(1.4, 2.1);
    const rot = rand(0, 360);
    let raizes = '';
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const dx = Math.cos(a) * 0.45;
      const dz = Math.sin(a) * 0.45;
      raizes += '<a-cylinder position="' + dx.toFixed(2) + ' ' + (altura * 0.06).toFixed(2) + ' ' + dz.toFixed(2) + '" radius="0.06" height="' + (altura * 0.14).toFixed(2) + '" color="' + troncoC + '" rotation="' + rand(20,40).toFixed(1) + ' 0 ' + rand(-30,30).toFixed(1) + '"></a-cylinder>';
    }
    let folhagem = '';
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + rand(-0.3, 0.3);
      const r = rf * rand(0.55, 0.95);
      const dy = rand(-0.15, 0.25) * rf;
      const c = pick([folha1, folha2, folha3]);
      folhagem += '<a-sphere position="' + (Math.cos(a) * r).toFixed(2) + ' ' + (altura + dy + rf * 0.35).toFixed(2) + ' ' + (Math.sin(a) * r).toFixed(2) + '" radius="' + (rf * rand(0.55, 0.75)).toFixed(2) + '" color="' + c + '" sway-leaf="ampl: ' + rand(3,7).toFixed(1) + '; dur: ' + randInt(2600,4200) + '"></a-sphere>';
    }
    folhagem += '<a-sphere position="0 ' + (altura + rf * 0.55).toFixed(2) + ' 0" radius="' + (rf * 0.85).toFixed(2) + '" color="' + folha1 + '" sway-leaf="ampl: 4; dur: 3400"></a-sphere>';
    const temBrom = Math.random() > 0.5;
    let brom = '';
    if (temBrom) {
      const by = altura * rand(0.3, 0.6);
      const ba = rand(0, Math.PI * 2);
      brom = '<a-entity position="' + (Math.cos(ba) * 0.15).toFixed(2) + ' ' + by.toFixed(2) + ' ' + (Math.sin(ba) * 0.15).toFixed(2) + '">' +
        '<a-cone position="0 0 0" radius-bottom="0.15" radius-top="0.08" height="0.18" color="#8A5A2A"></a-cone>' +
        '<a-cone position="0 0.1 0" radius-bottom="0.14" radius-top="0.02" height="0.14" color="#C8382A"></a-cone>' +
        '<a-cone position="0 0.18 0" radius-bottom="0.06" radius-top="0" height="0.1" color="#E8482A"></a-cone>' +
        '</a-entity>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rot.toFixed(1) + ' 0">' +
      raizes +
      '<a-cylinder position="0 ' + (altura/2).toFixed(2) + ' 0" radius="0.14" height="' + altura.toFixed(2) + '" color="' + troncoC + '" shadow="cast: true"></a-cylinder>' +
      brom + folhagem + '</a-entity>';
  }

  function gerarPalmeira(x, z, h) {
    const altura = h || rand(2.5, 4.5);
    const troncoC = pick(['#8A6A48', '#7A5A3A', '#5A4028']);
    const folhaC  = pick(['#2E7A30', '#3A8A3A', '#1E5A22']);
    const rot = rand(0, 360);
    let aneis = '';
    const nAneis = Math.floor(altura * 3);
    for (let i = 0; i < nAneis; i++) {
      const y = (i / nAneis) * altura;
      aneis += '<a-torus position="0 ' + y.toFixed(2) + ' 0" rotation="90 0 0" radius="0.13" radius-tubular="0.015" color="' + troncoC + '"></a-torus>';
    }
    let folhas = '';
    const nFolhas = randInt(6, 9);
    for (let i = 0; i < nFolhas; i++) {
      const a = (i / nFolhas) * Math.PI * 2;
      const tilt = rand(35, 65);
      const incl = rand(-20, 20);
      folhas += '<a-cone position="' + (Math.cos(a) * 0.9).toFixed(2) + ' ' + (altura + 0.15).toFixed(2) + ' ' + (Math.sin(a) * 0.9).toFixed(2) + '" radius-bottom="0.28" radius-top="0.02" height="1.9" color="' + folhaC + '" rotation="' + tilt.toFixed(1) + ' ' + (a*180/Math.PI).toFixed(1) + ' ' + incl.toFixed(1) + '" sway-leaf="ampl: 6; dur: ' + randInt(2400,3600) + '"></a-cone>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rot.toFixed(1) + ' 0">' +
      '<a-cylinder position="0 ' + (altura/2).toFixed(2) + ' 0" radius="0.11" height="' + altura.toFixed(2) + '" color="' + troncoC + '" shadow="cast: true"></a-cylinder>' +
      aneis + folhas +
      '<a-sphere position="0 ' + altura.toFixed(2) + ' 0" radius="0.12" color="' + troncoC + '"></a-sphere>' +
      '</a-entity>';
  }

  function gerarSamambaia(x, z) {
    const h = rand(0.4, 0.9);
    const cor = pick(['#2E7A30', '#3A8A3A', '#1E5A22', '#4A9A40']);
    let folhas = '';
    const n = randInt(6, 9);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const comp = h * rand(0.7, 1.2);
      folhas += '<a-plane position="' + (Math.cos(a) * comp * 0.3).toFixed(2) + ' ' + (comp*0.35).toFixed(2) + ' ' + (Math.sin(a) * comp * 0.3).toFixed(2) + '" width="' + (comp*0.9).toFixed(2) + '" height="0.08" color="' + cor + '" material="shader: flat; side: double" rotation="' + rand(40,70).toFixed(1) + ' ' + (a*180/Math.PI).toFixed(1) + ' 0" sway-leaf="ampl: 4; dur: ' + randInt(2800,4000) + '"></a-plane>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">' + folhas + '</a-entity>';
  }

  function gerarBromeliaChao(x, z) {
    const cor1 = pick(['#C8382A', '#E8482A', '#D02E5A']);
    const cor2 = pick(['#8A2820', '#A03820']);
    const rot = rand(0, 360);
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rot.toFixed(1) + ' 0">' +
      '<a-cone position="0 0.08 0" radius-bottom="0.28" radius-top="0.18" height="0.16" color="' + cor2 + '"></a-cone>' +
      '<a-cone position="0 0.22 0" radius-bottom="0.22" radius-top="0.05" height="0.2" color="' + cor1 + '"></a-cone>' +
      '<a-cone position="0 0.36 0" radius-bottom="0.10" radius-top="0" height="0.16" color="' + cor1 + '"></a-cone>' +
      '<a-sphere position="0 0.42 0" radius="0.04" color="#F0E0A0"></a-sphere>' +
      '</a-entity>';
  }

  function gerarBambu(x, z) {
    const cor = pick(['#6A9A40', '#5A8A3A', '#7AAA50']);
    const n = randInt(5, 9);
    let html = '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">';
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2);
      const r = rand(0, 0.4);
      const dx = Math.cos(a) * r;
      const dz = Math.sin(a) * r;
      const h = rand(3.5, 6);
      const tilt = rand(-5, 5);
      html += '<a-cylinder position="' + dx.toFixed(2) + ' ' + (h/2).toFixed(2) + ' ' + dz.toFixed(2) + '" radius="0.055" height="' + h.toFixed(2) + '" color="' + cor + '" rotation="' + tilt.toFixed(1) + ' 0 ' + tilt.toFixed(1) + '" sway-bamboo="ampl: ' + randInt(8,14) + '"></a-cylinder>';
      for (let j = 1; j < Math.floor(h); j++) {
        html += '<a-torus position="' + dx.toFixed(2) + ' ' + j.toFixed(1) + ' ' + dz.toFixed(2) + '" rotation="90 0 0" radius="0.06" radius-tubular="0.012" color="' + cor + '"></a-torus>';
      }
    }
    html += '</a-entity>';
    return html;
  }

  function gerarLiana(x, y, z) {
    const cor = pick(['#3A5A28', '#4A6A30', '#2A4A1E']);
    const n = randInt(6, 12);
    const alt = rand(1.2, 2.5);
    let html = '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '">';
    let ox = 0, oz = 0;
    for (let i = 0; i < n; i++) {
      const dy = -alt / n;
      ox += rand(-0.08, 0.08);
      oz += rand(-0.08, 0.08);
      html += '<a-cylinder position="' + ox.toFixed(2) + ' ' + (dy*(i+0.5)).toFixed(2) + ' ' + oz.toFixed(2) + '" radius="0.015" height="' + (alt/n*1.05).toFixed(2) + '" color="' + cor + '" rotation="' + rand(-8,8).toFixed(1) + ' 0 ' + rand(-8,8).toFixed(1) + '"></a-cylinder>';
    }
    for (let i = 0; i < randInt(4, 8); i++) {
      const yy = -rand(0.3, alt);
      const aa = rand(0, Math.PI * 2);
      html += '<a-plane position="' + (Math.cos(aa)*0.15).toFixed(2) + ' ' + yy.toFixed(2) + ' ' + (Math.sin(aa)*0.15).toFixed(2) + '" width="0.15" height="0.08" color="' + cor + '" material="shader: flat; side: double" rotation="0 ' + rand(0,360).toFixed(1) + ' ' + rand(-25,25).toFixed(1) + '" sway-leaf="ampl: 8; dur: ' + randInt(2600,3800) + '"></a-plane>';
    }
    html += '</a-entity>';
    return html;
  }

  function gerarTroncoCaido(x, z) {
    const rot = rand(0, 360);
    const comp = rand(1.8, 3.2);
    const raio = rand(0.15, 0.22);
    const musgo = pick(['#3A6A2A', '#4A7A32', '#2A5A20']);
    let musgos = '';
    for (let i = 0; i < randInt(4, 7); i++) {
      const dx = rand(-comp/2 + 0.3, comp/2 - 0.3);
      const a = rand(0, Math.PI * 2);
      const dy = Math.cos(a) * raio * 0.9;
      const dz = Math.sin(a) * raio * 0.9;
      musgos += '<a-sphere position="' + dx.toFixed(2) + ' ' + (raio + dy*0.6).toFixed(2) + ' ' + dz.toFixed(2) + '" radius="' + rand(0.08,0.14).toFixed(2) + '" color="' + musgo + '" scale="1.3 0.5 1.3"></a-sphere>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' ' + raio.toFixed(2) + ' ' + z.toFixed(2) + '" rotation="0 ' + rot.toFixed(1) + ' 0">' +
      '<a-cylinder position="0 0 0" rotation="0 0 90" radius="' + raio.toFixed(2) + '" height="' + comp.toFixed(2) + '" color="#3A2418" shadow="cast: true"></a-cylinder>' +
      musgos + '</a-entity>';
  }

  function gerarCogumelo(x, z) {
    const tipo = Math.random();
    const cor = pick(['#E8482A', '#F0A028', '#D02E5A', '#8A4AD8', '#F0E0A0']);
    if (tipo < 0.4) {
      const h = rand(0.15, 0.3);
      const r = rand(0.08, 0.14);
      return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">' +
        '<a-cylinder position="0 ' + (h/2).toFixed(2) + ' 0" radius="' + (r*0.35).toFixed(2) + '" height="' + h.toFixed(2) + '" color="#F0E0C8"></a-cylinder>' +
        '<a-sphere position="0 ' + h.toFixed(2) + ' 0" radius="' + r.toFixed(2) + '" color="' + cor + '" scale="1 0.5 1"></a-sphere>' +
        '</a-entity>';
    }
    let html = '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">';
    for (let i = 0; i < randInt(3, 6); i++) {
      const dx = rand(-0.2, 0.2);
      const dz = rand(-0.2, 0.2);
      const h = rand(0.06, 0.12);
      const r = rand(0.05, 0.09);
      html += '<a-cylinder position="' + dx.toFixed(2) + ' ' + (h/2).toFixed(2) + ' ' + dz.toFixed(2) + '" radius="' + (r*0.3).toFixed(2) + '" height="' + h.toFixed(2) + '" color="#E8D8B8"></a-cylinder>' +
              '<a-sphere position="' + dx.toFixed(2) + ' ' + h.toFixed(2) + ' ' + dz.toFixed(2) + '" radius="' + r.toFixed(2) + '" color="' + cor + '" scale="1 0.55 1"></a-sphere>';
    }
    html += '</a-entity>';
    return html;
  }

  function gerarPedraMusgo(x, z, tam) {
    const r = (tam || 1) * rand(0.25, 0.55);
    const musgo = pick(['#3A6A2A', '#4A7A32', '#2E5A22']);
    return '<a-entity position="' + x.toFixed(2) + ' ' + (r*0.55).toFixed(2) + ' ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0">' +
      '<a-dodecahedron radius="' + r.toFixed(2) + '" color="#5A5A50" scale="1.1 ' + rand(0.65,0.9).toFixed(2) + ' 1.1"></a-dodecahedron>' +
      '<a-sphere position="0 ' + (r*0.6).toFixed(2) + ' 0" radius="' + (r*0.55).toFixed(2) + '" color="' + musgo + '" scale="1.2 0.4 1.2"></a-sphere>' +
      '</a-entity>';
  }

  function gerarArvoreFrutifera(x, z) {
    const altura = rand(2.5, 3.5);
    const frutaCor = pick(['#E8482A', '#F0A028', '#8A4AD8', '#D02E5A']);
    const folhaC = pick(['#2E6A30', '#3A8A3A', '#1E5A22']);
    let frutas = '';
    for (let i = 0; i < randInt(10, 18); i++) {
      const a = rand(0, Math.PI * 2);
      const r = rand(0.3, 1.0);
      const y = altura + rand(-0.3, 0.5);
      frutas += '<a-sphere position="' + (Math.cos(a)*r).toFixed(2) + ' ' + y.toFixed(2) + ' ' + (Math.sin(a)*r).toFixed(2) + '" radius="0.055" color="' + frutaCor + '" material="shader: standard; emissive: ' + frutaCor + '; emissiveIntensity: 0.3"></a-sphere>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0">' +
      '<a-cylinder position="0 ' + (altura/2).toFixed(2) + ' 0" radius="0.11" height="' + altura.toFixed(2) + '" color="#3A2418" shadow="cast: true"></a-cylinder>' +
      '<a-sphere position="0 ' + (altura + 0.6).toFixed(2) + ' 0" radius="1.1" color="' + folhaC + '" sway-leaf="ampl: 4; dur: 3200"></a-sphere>' +
      '<a-sphere position="0.6 ' + (altura + 0.3).toFixed(2) + ' 0.3" radius="0.7" color="' + folhaC + '"></a-sphere>' +
      '<a-sphere position="-0.55 ' + (altura + 0.4).toFixed(2) + ' -0.35" radius="0.75" color="' + folhaC + '"></a-sphere>' +
      frutas + '</a-entity>';
  }

  function gerarSairaPousada(x, y, z) {
    const cor1 = '#3FD9E0', cor2 = '#F0D830', cor3 = '#1A1A1A', cor4 = '#7A3A88';
    return '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '">' +
      '<a-cylinder position="0 -0.15 0" rotation="0 0 90" radius="0.02" height="0.4" color="#3A2818"></a-cylinder>' +
      '<a-sphere radius="0.11" color="' + cor1 + '" scale="1.3 1 1"></a-sphere>' +
      '<a-sphere position="0 -0.02 0.07" radius="0.075" color="' + cor2 + '" scale="1.1 1 1"></a-sphere>' +
      '<a-sphere position="0.12 0.10 0" radius="0.075" color="' + cor3 + '"></a-sphere>' +
      '<a-cone position="0.10 0.20 0" radius-bottom="0.04" radius-top="0.005" height="0.12" color="' + cor4 + '" rotation="0 0 -15"></a-cone>' +
      '<a-cone position="0.22 0.10 0" rotation="0 0 -90" radius-bottom="0.025" radius-top="0.005" height="0.06" color="#3A1A10"></a-cone>' +
      '<a-sphere position="0.17 0.12 0.05" radius="0.012" color="#FFF"></a-sphere>' +
      '<a-sphere position="0.17 0.12 0.05" radius="0.007" color="#000"></a-sphere>' +
      '<a-sphere position="-0.02 0.02 0.09" radius="0.07" color="' + cor1 + '" scale="1.3 0.4 1" rotation="0 0 20"></a-sphere>' +
      '<a-sphere position="-0.02 0.02 -0.09" radius="0.07" color="' + cor1 + '" scale="1.3 0.4 1" rotation="0 0 20"></a-sphere>' +
      '<a-cone position="-0.15 0 0" rotation="0 0 90" radius-bottom="0.045" radius-top="0.02" height="0.14" color="' + cor2 + '"></a-cone>' +
      '</a-entity>';
  }

  function gerarPassaroVoando(x, y, z) {
    const cor1 = pick(['#3FD9E0', '#F0D830', '#E8482A', '#8A4AD8', '#40E0D0']);
    const r = rand(1.2, 2.5);
    const dur = randInt(7000, 12000);
    return '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '" flutter-by="raio: ' + r.toFixed(2) + '; alt: ' + y.toFixed(2) + '; dur: ' + dur + '">' +
      '<a-sphere radius="0.08" color="' + cor1 + '" scale="1.4 0.9 0.7"></a-sphere>' +
      '<a-sphere position="0.09 0.03 0" radius="0.05" color="' + cor1 + '"></a-sphere>' +
      '<a-cone position="0.16 0.03 0" rotation="0 0 -90" radius-bottom="0.02" radius-top="0" height="0.05" color="#F0A028"></a-cone>' +
      '<a-plane position="-0.05 0.05 0.09" width="0.14" height="0.07" color="' + cor1 + '" material="shader: flat; side: double" rotation="0 30 -20"></a-plane>' +
      '<a-plane position="-0.05 0.05 -0.09" width="0.14" height="0.07" color="' + cor1 + '" material="shader: flat; side: double" rotation="0 -30 -20"></a-plane>' +
      '</a-entity>';
  }

  function gerarBorboleta(x, y, z) {
    const cor = pick(['#F0A028', '#E8482A', '#F0D830', '#8A4AD8', '#40E0D0', '#FF6B9D']);
    const r = rand(0.8, 1.8);
    const dur = randInt(6000, 10000);
    return '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '" flutter-by="raio: ' + r.toFixed(2) + '; alt: ' + y.toFixed(2) + '; dur: ' + dur + '">' +
      '<a-plane width="0.16" height="0.12" color="' + cor + '" material="shader: flat; side: double; opacity: 0.85; transparent: true" rotation="0 40 0" position="0 0.04 0"></a-plane>' +
      '<a-plane width="0.16" height="0.12" color="' + cor + '" material="shader: flat; side: double; opacity: 0.85; transparent: true" rotation="0 -40 0" position="0 0.04 0"></a-plane>' +
      '<a-plane width="0.12" height="0.09" color="' + cor + '" material="shader: flat; side: double; opacity: 0.7; transparent: true" rotation="0 40 0" position="0 -0.05 0"></a-plane>' +
      '<a-plane width="0.12" height="0.09" color="' + cor + '" material="shader: flat; side: double; opacity: 0.7; transparent: true" rotation="0 -40 0" position="0 -0.05 0"></a-plane>' +
      '<a-sphere radius="0.02" color="#1A1A1A" scale="0.5 1.5 0.5"></a-sphere>' +
      '</a-entity>';
  }

  function gerarRaioCopa(x, z, alt, r) {
    return '<a-cone position="' + x.toFixed(2) + ' ' + (alt/2 + 1).toFixed(2) + ' ' + z.toFixed(2) + '" radius-bottom="' + r.toFixed(2) + '" radius-top="' + (r*0.4).toFixed(2) + '" height="' + alt.toFixed(2) + '" color="#FFF8C8" material="shader: flat; opacity: 0.10; transparent: true; side: double"></a-cone>';
  }

  function gerarRiacho() {
    let html = '';
    let x = -12, z = -8;
    for (let i = 0; i < 20; i++) {
      const t = i / 20;
      x += Math.sin(t * 2.5) * 1.8 + rand(-0.15, 0.15);
      z += 1.2;
      const w = rand(0.5, 1.1);
      html += '<a-circle position="' + x.toFixed(2) + ' 0.02 ' + z.toFixed(2) + '" rotation="-90 0 0" radius="' + w.toFixed(2) + '" color="#4A90B8" material="shader: standard; opacity: 0.65; transparent: true; emissive: #2A6A90; emissiveIntensity: 0.3"></a-circle>';
    }
    return html;
  }

  function montarBiomaMataAtlantica(animal, opts) {
    opts = opts || {};
    const denso = opts.densidade !== 'baixa';
    const skyTopo = '#4A90A4', skyBase = '#8AB890', chaoBase = '#2E4520', chaoVar = '#3A5528';

    const skySrc = window.MewBiomas && window.MewBiomas.criarTexturaGradiente
      ? window.MewBiomas.criarTexturaGradiente(skyTopo, skyBase)
      : null;

    let html = skySrc
      ? '<a-sky src="' + skySrc + '" color="' + skyBase + '"></a-sky>'
      : '<a-sky color="' + skyBase + '"></a-sky>';

    html += '<a-circle position="0 0 0" rotation="-90 0 0" radius="90" color="' + chaoBase + '" shadow="receive: true"></a-circle>';

    for (let i = 0; i < (denso ? 20 : 12); i++) {
      const p = pos(2, 35);
      const r = rand(1.5, 4);
      const cor = Math.random() > 0.5 ? chaoVar : '#241A10';
      html += '<a-circle position="' + p.x.toFixed(2) + ' 0.006 ' + p.z.toFixed(2) + '" rotation="-90 0 0" radius="' + r.toFixed(2) + '" color="' + cor + '" opacity="0.55" transparent="true"></a-circle>';
    }

    for (let i = 0; i < (denso ? 60 : 30); i++) {
      const p = pos(1, 25);
      const cor = pick(['#5A3A20', '#8A5A28', '#4A7A32', '#A86A28']);
      html += '<a-plane position="' + p.x.toFixed(2) + ' 0.012 ' + p.z.toFixed(2) + '" width="' + rand(0.12,0.22).toFixed(2) + '" height="' + rand(0.08,0.15).toFixed(2) + '" color="' + cor + '" material="shader: flat; side: double; opacity: 0.9; transparent: true" rotation="-90 ' + rand(0,360).toFixed(1) + ' 0"></a-plane>';
    }

    for (let i = 0; i < (denso ? 8 : 4); i++) {
      const p = pos(2, 20);
      html += gerarRaioCopa(p.x, p.z, rand(6, 9), rand(0.8, 1.8));
    }

    for (let i = 0; i < (denso ? 4 : 2); i++) {
      const a = rand(0, Math.PI * 2);
      const r = rand(12, 20);
      html += gerarBambu(Math.cos(a) * r, Math.sin(a) * r);
    }

    html += gerarRiacho();

    for (let i = 0; i < (denso ? 6 : 3); i++) {
      const p = pos(4, 18);
      html += gerarTroncoCaido(p.x, p.z);
    }

    for (let i = 0; i < (denso ? 24 : 14); i++) {
      const a = (i / (denso ? 24 : 14)) * Math.PI * 2 + rand(-0.2, 0.2);
      const r = 12 + Math.random() * 18;
      html += gerarArvoreAlta(Math.cos(a) * r, Math.sin(a) * r, rand(4.5, 7.5));
    }
    for (let i = 0; i < (denso ? 6 : 3); i++) {
      const p = pos(6, 12);
      html += gerarArvoreAlta(p.x, p.z, rand(5, 7.5));
    }

    for (let i = 0; i < (denso ? 14 : 8); i++) {
      const p = pos(4, 22);
      html += gerarPalmeira(p.x, p.z, rand(2.5, 4.5));
    }
    for (let i = 0; i < (denso ? 8 : 5); i++) {
      const p = pos(4, 16);
      html += gerarArvoreFrutifera(p.x, p.z);
    }

    for (let i = 0; i < (denso ? 40 : 24); i++) {
      const p = pos(1.5, 20);
      html += gerarSamambaia(p.x, p.z);
    }
    for (let i = 0; i < (denso ? 22 : 12); i++) {
      const p = pos(2, 18);
      html += gerarBromeliaChao(p.x, p.z);
    }
    for (let i = 0; i < (denso ? 18 : 10); i++) {
      const p = pos(2, 22);
      html += gerarPedraMusgo(p.x, p.z, rand(0.8, 1.7));
    }
    for (let i = 0; i < 4; i++) {
      const p = pos(10, 25);
      html += gerarPedraMusgo(p.x, p.z, 2.4);
    }
    for (let i = 0; i < (denso ? 22 : 12); i++) {
      const p = pos(1.5, 18);
      html += gerarCogumelo(p.x, p.z);
    }
    for (let i = 0; i < (denso ? 14 : 8); i++) {
      const a = rand(0, Math.PI * 2);
      const r = rand(3, 14);
      html += gerarLiana(Math.cos(a) * r, rand(3.5, 5.5), Math.sin(a) * r);
    }

    html += gerarSairaPousada(-1.8, 1.15, -2.5);
    html += gerarSairaPousada(2.2, 1.55, -3.5);
    html += gerarSairaPousada(-3.5, 0.85, 1.8);
    if (denso) {
      html += gerarSairaPousada(3.8, 1.35, 1.5);
      html += gerarSairaPousada(0.5, 1.75, -5.2);
    }

    for (let i = 0; i < (denso ? 6 : 3); i++) {
      const a = rand(0, Math.PI * 2);
      const r = rand(3, 10);
      html += gerarPassaroVoando(Math.cos(a) * r, rand(2, 4.5), Math.sin(a) * r);
    }
    for (let i = 0; i < (denso ? 16 : 8); i++) {
      const a = rand(0, Math.PI * 2);
      const r = rand(1.5, 14);
      html += gerarBorboleta(Math.cos(a) * r, rand(0.6, 2.6), Math.sin(a) * r);
    }

    html += '<a-entity position="0 2.2 2.5" info-hotspot="titulo: Saíra-pintor; descricao: Tangara fastuosa — endêmica do Nordeste. Plumagem turquesa, amarela, preta e violeta. Ameaçada pelo tráfico e perda de mata.; cor: #3FD9E0"></a-entity>';
    html += '<a-entity position="-3.5 0.8 -3" info-hotspot="titulo: Samambaia; descricao: Indicador de mata úmida preservada. Só cresce em sub-bosque com sombra e alta umidade.; cor: #4A9A40"></a-entity>';
    html += '<a-entity position="3.5 1.0 -4" info-hotspot="titulo: Árvore frutífera; descricao: Frutos silvestres são o principal alimento da saíra. Sem floresta nativa, a espécie some.; cor: #F0A028"></a-entity>';
    html += '<a-entity position="-2 0.6 3" info-hotspot="titulo: Bromélia; descricao: Planta-epífita que acumula água e vira minipiscina para sapos e insetos. Símbolo da Mata Atlântica.; cor: #C8382A"></a-entity>';
    html += '<a-entity position="5 2.8 -6" info-hotspot="titulo: Bambu; descricao: Bambuzais nativos formam corredores de fauna. A saíra usa para se esconder de predadores.; cor: #6A9A40"></a-entity>';
    html += '<a-entity position="-5 2.5 -8" info-hotspot="titulo: Lianas e cipós; descricao: Conectam as copas e criam passagens aéreas. A saíra forrageia pelas lianas em busca de insetos e frutas.; cor: #3A5A28"></a-entity>';
    html += '<a-entity position="-1 0.5 -6" info-hotspot="titulo: Folhiço; descricao: Camada de folhas em decomposição. Mantém a umidade, alimenta o solo e abriga invertebrados.; cor: #5A3A20"></a-entity>';
    html += '<a-entity position="6 1.3 -2" info-hotspot="titulo: Riacho; descricao: Cursos d.água são essenciais na Mata Atlântica. Água limpa = floresta viva.; cor: #4A90B8"></a-entity>';
    html += '<a-entity position="2 3.2 -12" info-hotspot="titulo: Mata Atlântica; descricao: Um dos biomas mais ricos e ameaçados do planeta. Restam ~12% da cobertura original, muito fragmentada.; cor: #2E7A30"></a-entity>';
    html += '<a-entity position="-4 0.9 5" info-hotspot="titulo: Tráfico de aves; descricao: A saíra é cobiçada por sua beleza. A captura ilegal e o desmatamento a colocaram em risco de extinção.; cor: #E8482A"></a-entity>';

    html += '<a-entity light="type: ambient; color: #C8E8D8; intensity: 0.65"></a-entity>' +
            '<a-entity position="4 12 5" light="type: directional; color: #FFF0C8; intensity: 1.0; castShadow: true; shadowMapWidth: 2048; shadowMapHeight: 2048"></a-entity>' +
            '<a-entity position="-5 5 -2" light="type: point; color: #C8F0A8; intensity: 0.4; distance: 14"></a-entity>' +
            '<a-entity position="3 4 3" light="type: point; color: #FFE8A0; intensity: 0.35; distance: 12"></a-entity>';

    return { html, bioma: { nome: 'Mata Atlântica', skyTopo, skyBase, fog: '#4A8060', fogDensity: 0.045 } };
  }

  if (!window.MewBiomas) { console.warn('[bioma_mataatlantica] biomas_fauna.js ausente.'); return; }

  const _detectar = window.MewBiomas.detectarBioma;
  window.MewBiomas.detectarBioma = function (animal) {
    const nome = (animal.nome_popular || '').toLowerCase();
    if (nome.indexOf('saíra') !== -1 || nome.indexOf('saira') !== -1 || nome.indexOf('pintor') !== -1) {
      return 'mataAtlanticaSaira';
    }
    return _detectar.call(this, animal);
  };

  const _montar = window.MewBiomas.montarCena3D;
  window.MewBiomas.montarCena3D = function (animal, opts) {
    const chave = window.MewBiomas.detectarBioma(animal);
    if (chave === 'mataAtlanticaSaira') return montarBiomaMataAtlantica(animal, opts);
    return _montar.call(this, animal, opts);
  };

  window.MewBiomas.montarBiomaMataAtlantica = montarBiomaMataAtlantica;
  console.log('[bioma_mataatlantica] Bioma Mata Atlântica (Saíra-pintor) registrado.');
})();