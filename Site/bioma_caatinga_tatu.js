/* =========================================================
   bioma_caatinga_tatu.js
   Caatinga — Tatu-bola-do-nordeste (Tolypeutes tricinctus)
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

  function gerarLajeado(x, z, t) {
    const r = (t || 1) * rand(0.8, 1.6);
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0">' +
      '<a-circle position="0 0.006 0" rotation="-90 0 0" radius="' + r.toFixed(2) + '" color="#8A7A5A"></a-circle>' +
      '<a-circle position="0.3 0.008 0" rotation="-90 0 0" radius="' + (r*0.5).toFixed(2) + '" color="#9A8A6A"></a-circle>' +
      '<a-circle position="-0.2 0.008 0.2" rotation="-90 0 0" radius="' + (r*0.6).toFixed(2) + '" color="#7A6A4A"></a-circle>' +
      '</a-entity>';
  }

  function gerarCupinzeiro(x, z, tam) {
    const t = tam || 1;
    const h = 0.9 * t + Math.random() * 0.6;
    let detalhes = '';
    for (let i = 0; i < randInt(6, 12); i++) {
      const a = rand(0, Math.PI * 2);
      const r = (0.35 * t) * rand(0.4, 1.0);
      const y = h * rand(0.1, 0.9);
      detalhes += '<a-sphere position="' + (Math.cos(a)*r).toFixed(2) + ' ' + y.toFixed(2) + ' ' + (Math.sin(a)*r).toFixed(2) + '" radius="' + rand(0.04,0.1).toFixed(2) + '" color="#6A4A2A"></a-sphere>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">' +
      '<a-cone position="0 ' + (h/2).toFixed(2) + ' 0" radius-bottom="' + (0.5*t).toFixed(2) + '" radius-top="0.12" height="' + h.toFixed(2) + '" color="#7A5A3A"></a-cone>' +
      '<a-sphere position="0 ' + (h*0.35).toFixed(2) + ' 0" radius="' + (0.3*t).toFixed(2) + '" color="#8A6A48"></a-sphere>' +
      detalhes +
      '</a-entity>';
  }

  function gerarFormigueiro(x, z) {
    const r = rand(0.3, 0.55);
    let formigas = '';
    for (let i = 0; i < randInt(3, 6); i++) {
      const a = rand(0, Math.PI * 2);
      const rr = r * rand(0.3, 0.9);
      formigas += '<a-sphere position="' + (Math.cos(a)*rr).toFixed(2) + ' ' + (r*0.9).toFixed(2) + ' ' + (Math.sin(a)*rr).toFixed(2) + '" radius="0.015" color="#1A1A1A"></a-sphere>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">' +
      '<a-cone position="0 ' + (r*0.5).toFixed(2) + ' 0" radius-bottom="' + r.toFixed(2) + '" radius-top="0.05" height="' + (r).toFixed(2) + '" color="#B89A78"></a-cone>' +
      formigas + '</a-entity>';
  }

  function gerarMandacaru(x, z, h) {
    const altura = h || rand(1.0, 2.0);
    const cor = '#3E7A3E';
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0">' +
      '<a-cylinder position="0 ' + (altura/2).toFixed(2) + ' 0" radius="0.12" height="' + altura.toFixed(2) + '" color="' + cor + '" shadow="cast: true"></a-cylinder>' +
      '<a-sphere position="0 ' + altura.toFixed(2) + ' 0" radius="0.12" color="' + cor + '"></a-sphere>' +
      '</a-entity>';
  }

  function gerarXiqueXique(x, z) {
    const cor = '#5A8A4A';
    let html = '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">';
    const qtd = randInt(4, 7);
    for (let i = 0; i < qtd; i++) {
      const a = (i / qtd) * Math.PI * 2 + rand(-0.3, 0.3);
      const tilt = rand(55, 80);
      const h = rand(0.4, 0.8);
      html += '<a-cylinder position="' + (Math.cos(a) * 0.12).toFixed(2) + ' ' + (h/2).toFixed(2) + ' ' + (Math.sin(a) * 0.12).toFixed(2) + '" radius="0.06" height="' + h.toFixed(2) + '" color="' + cor + '" rotation="' + tilt.toFixed(1) + ' ' + (a*180/Math.PI).toFixed(1) + ' 0"></a-cylinder>';
    }
    html += '</a-entity>';
    return html;
  }

  function gerarArbusto(x, z) {
    const cor = pick(['#7A8A4A', '#8A7A3A', '#6A7A42']);
    let galhos = '';
    for (let i = 0; i < randInt(4, 7); i++) {
      const a = rand(0, Math.PI * 2);
      const h = rand(0.3, 0.7);
      galhos += '<a-cylinder position="' + (Math.cos(a)*0.12).toFixed(2) + ' ' + (h/2).toFixed(2) + ' ' + (Math.sin(a)*0.12).toFixed(2) + '" radius="0.018" height="' + h.toFixed(2) + '" color="' + cor + '" rotation="' + rand(-25,25).toFixed(1) + ' ' + (a*180/Math.PI).toFixed(1) + ' ' + rand(-25,25).toFixed(1) + '" sway-dry="ampl: 6"></a-cylinder>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">' + galhos + '</a-entity>';
  }

  function gerarPedra(x, z, t) {
    const r = (t || 1) * rand(0.2, 0.5);
    return '<a-dodecahedron position="' + x.toFixed(2) + ' ' + (r*0.4).toFixed(2) + ' ' + z.toFixed(2) + '" radius="' + r.toFixed(2) + '" color="#8A7A5A" rotation="0 ' + rand(0,360).toFixed(1) + ' 0" scale="1.1 ' + rand(0.5,0.8).toFixed(2) + ' 1.1"></a-dodecahedron>';
  }

  function gerarTroncoSeco(x, z) {
    const comp = rand(1.5, 2.8);
    const raio = rand(0.12, 0.18);
    return '<a-entity position="' + x.toFixed(2) + ' ' + raio.toFixed(2) + ' ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0">' +
      '<a-cylinder position="0 0 0" rotation="0 0 90" radius="' + raio.toFixed(2) + '" height="' + comp.toFixed(2) + '" color="#6A4A30" shadow="cast: true"></a-cylinder>' +
      '</a-entity>';
  }

  function gerarCapimSeco(x, z) {
    const cor = pick(['#C8B888', '#B8A878', '#D8C898', '#A89870']);
    let html = '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">';
    for (let i = 0; i < randInt(3, 5); i++) {
      const a = rand(0, Math.PI * 2);
      const dx = Math.cos(a) * 0.04;
      const dz = Math.sin(a) * 0.04;
      const h = rand(0.15, 0.35);
      html += '<a-cone position="' + dx.toFixed(3) + ' ' + (h/2).toFixed(3) + ' ' + dz.toFixed(3) + '" radius-bottom="0.02" radius-top="0.002" height="' + h.toFixed(3) + '" color="' + cor + '" rotation="' + rand(-20,20).toFixed(1) + ' 0 ' + rand(-20,20).toFixed(1) + '"></a-cone>';
    }
    html += '</a-entity>';
    return html;
  }

  function gerarTocaTatu(x, z) {
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">' +
      '<a-circle position="0 0.012 0" rotation="-90 0 0" radius="0.35" color="#3A2818" opacity="0.85" transparent="true"></a-circle>' +
      '<a-circle position="0 0.014 0" rotation="-90 0 0" radius="0.22" color="#1A0E08" opacity="0.95" transparent="true"></a-circle>' +
      '<a-sphere position="0 0.06 -0.25" radius="0.18" color="#5A4028" scale="1.4 0.7 1"></a-sphere>' +
      '</a-entity>';
  }

  function gerarTatuBola(x, z, esc) {
    const s = esc || 1;
    const marrom = '#6A4A2A', escuro = '#3A2818', amarelo = '#C8A860';
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0" scale="' + s + ' ' + s + ' ' + s + '">' +
      '<a-sphere position="0 0.18 0" radius="0.18" color="' + marrom + '" scale="1.3 1 0.95"></a-sphere>' +
      '<a-sphere position="0.14 0.19 0" radius="0.14" color="' + amarelo + '"></a-sphere>' +
      '<a-sphere position="-0.05 0.2 0" radius="0.16" color="' + escuro + '" scale="0.9 1 0.95"></a-sphere>' +
      '<a-sphere position="0.02 0.15 0.15" radius="0.05" color="' + escuro + '"></a-sphere>' +
      '<a-sphere position="0.02 0.15 -0.15" radius="0.05" color="' + escuro + '"></a-sphere>' +
      '</a-entity>';
  }

  function montarBiomaCaatingaTatu(animal, opts) {
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

    for (let i = 0; i < (denso ? 30 : 18); i++) {
      const p = pos(2, 40);
      const r = rand(1.5, 4);
      const cor = Math.random() > 0.5 ? chaoVar : '#B89A78';
      html += '<a-circle position="' + p.x.toFixed(2) + ' 0.005 ' + p.z.toFixed(2) + '" rotation="-90 0 0" radius="' + r.toFixed(2) + '" color="' + cor + '" opacity="0.55" transparent="true"></a-circle>';
    }

    for (let i = 0; i < (denso ? 14 : 8); i++) {
      const p = pos(2, 25);
      html += gerarLajeado(p.x, p.z, rand(0.9, 1.7));
    }
    for (let i = 0; i < (denso ? 12 : 6); i++) {
      const p = pos(4, 22);
      html += gerarCupinzeiro(p.x, p.z, rand(0.8, 1.5));
    }
    for (let i = 0; i < (denso ? 16 : 9); i++) {
      const p = pos(2, 20);
      html += gerarFormigueiro(p.x, p.z);
    }
    for (let i = 0; i < (denso ? 6 : 3); i++) {
      const p = pos(4, 16);
      html += gerarTocaTatu(p.x, p.z);
    }
    for (let i = 0; i < (denso ? 16 : 9); i++) {
      const p = pos(3, 22);
      html += gerarMandacaru(p.x, p.z, rand(1.0, 2.0));
    }
    for (let i = 0; i < (denso ? 20 : 12); i++) {
      const p = pos(2, 20);
      html += gerarXiqueXique(p.x, p.z);
    }
    for (let i = 0; i < (denso ? 30 : 18); i++) {
      const p = pos(1.5, 22);
      html += gerarArbusto(p.x, p.z);
    }
    for (let i = 0; i < (denso ? 26 : 15); i++) {
      const p = pos(1.5, 25);
      html += gerarPedra(p.x, p.z, rand(0.5, 1.2));
    }
    for (let i = 0; i < (denso ? 8 : 4); i++) {
      const p = pos(4, 18);
      html += gerarTroncoSeco(p.x, p.z);
    }
    for (let i = 0; i < (denso ? 90 : 50); i++) {
      const p = pos(1, 22);
      html += gerarCapimSeco(p.x, p.z);
    }

    html += gerarTatuBola(-1.5, -2.5, 1.0);
    html += gerarTatuBola(2.2, -3.0, 0.9);
    html += gerarTatuBola(-3.0, 1.8, 1.1);
    if (denso) {
      html += gerarTatuBola(3.5, 1.5, 0.95);
      html += gerarTatuBola(0.3, -4.8, 1.0);
    }

    html += '<a-entity position="0 2.0 2.5" info-hotspot="titulo: Tatu-bola-do-nordeste; descricao: Tolypeutes tricinctus — o menor tatu do Brasil (até 1,8 kg). Enrola-se em bola quando ameaçado. Endêmico do Brasil.; cor: #C8A860"></a-entity>';
    html += '<a-entity position="4 1.2 -4" info-hotspot="titulo: Cupinzeiro; descricao: Fonte de alimento principal. O tatu usa as garras para abrir o cupinzeiro e lamber os cupins.; cor: #7A5A3A"></a-entity>';
    html += '<a-entity position="-4 0.9 -3" info-hotspot="titulo: Formigueiro; descricao: Também parte da dieta. O tatu-bola controla naturalmente populações de formigas e cupins.; cor: #B89A78"></a-entity>';
    html += '<a-entity position="2 0.6 -5" info-hotspot="titulo: Lajeado; descricao: Chão de pedra rachada. O tatu-bola escala e se esconde nessas formações durante o dia.; cor: #8A7A5A"></a-entity>';
    html += '<a-entity position="-4.5 0.5 3" info-hotspot="titulo: Toca; descricao: Abrigo cavado em solo fofo. O tatu-bola costuma reaproveitar tocas de outros animais.; cor: #3A2818"></a-entity>';
    html += '<a-entity position="3 1.1 -6" info-hotspot="titulo: Mandacaru; descricao: Cacto da Caatinga. Fornece frutos e flores que o tatu come na época das chuvas.; cor: #3E7A3E"></a-entity>';
    html += '<a-entity position="-3 0.9 4" info-hotspot="titulo: Xique-xique; descricao: Cacto rastejante. Espinhos protegem o tatu de predadores quando ele se enrola perto.; cor: #5A8A4A"></a-entity>';
    html += '<a-entity position="0 3.2 -10" info-hotspot="titulo: Caatinga; descricao: Único bioma exclusivamente brasileiro. Chuvas escassas, vegetação caducifólia e alta biodiversidade adaptada.; cor: #D8C090"></a-entity>';
    html += '<a-entity position="-5 1.0 -6" info-hotspot="titulo: Ameaças; descricao: Caça ilegal, atropelamentos, desmatamento, agropecuária e usinas eólicas/solares ameaçam o tatu-bola.; cor: #E8482A"></a-entity>';
    html += '<a-entity position="5 0.9 5" info-hotspot="titulo: Fuleco; descricao: O tatu-bola foi o mascote da Copa do Mundo de 2014 no Brasil, mundialmente conhecido como Fuleco.; cor: #F0A028"></a-entity>';

    html += '<a-entity light="type: ambient; color: #FFF0D8; intensity: 0.85"></a-entity>' +
            '<a-entity position="8 14 4" light="type: directional; color: #FFE8A8; intensity: 1.35; castShadow: true; shadowMapWidth: 2048; shadowMapHeight: 2048"></a-entity>' +
            '<a-entity position="-6 6 -3" light="type: point; color: #FFE0A0; intensity: 0.4; distance: 15"></a-entity>';

    return { html, bioma: { nome: 'Caatinga', skyTopo, skyBase, fog: '#E8D0A0', fogDensity: 0.012 } };
  }

  if (!window.MewBiomas) { console.warn('[bioma_caatinga_tatu] biomas_fauna.js ausente.'); return; }

  const _detectar = window.MewBiomas.detectarBioma;
  window.MewBiomas.detectarBioma = function (animal) {
    const nome = (animal.nome_popular || '').toLowerCase();
    if (nome.indexOf('tatu-bola') !== -1 || nome.indexOf('tatu bola') !== -1) {
      return 'caatingaTatu';
    }
    return _detectar.call(this, animal);
  };

  const _montar = window.MewBiomas.montarCena3D;
  window.MewBiomas.montarCena3D = function (animal, opts) {
    const chave = window.MewBiomas.detectarBioma(animal);
    if (chave === 'caatingaTatu') return montarBiomaCaatingaTatu(animal, opts);
    return _montar.call(this, animal, opts);
  };

  window.MewBiomas.montarBiomaCaatingaTatu = montarBiomaCaatingaTatu;
  console.log('[bioma_caatinga_tatu] Bioma Caatinga (Tatu-bola) registrado.');
})();