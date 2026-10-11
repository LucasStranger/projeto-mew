/* =========================================================
   bioma_cerrado_tamandua.js
   Cerrado — Tamanduá-bandeira (Myrmecophaga tridactyla)
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

  function gerarPequizeiro(x, z) {
    const altura = rand(2.5, 4.0);
    const tronco = '#3A2818', folha = '#3A6A2A';
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0">' +
      '<a-cylinder position="0 ' + (altura*0.35).toFixed(2) + ' 0" radius="0.16" height="' + (altura*0.7).toFixed(2) + '" color="' + tronco + '" shadow="cast: true" rotation="' + rand(-3,3).toFixed(1) + ' 0 ' + rand(-3,3).toFixed(1) + '"></a-cylinder>' +
      '<a-cylinder position="' + rand(-0.15,0.15).toFixed(2) + ' ' + (altura*0.75).toFixed(2) + ' ' + rand(-0.15,0.15).toFixed(2) + '" radius="0.12" height="' + (altura*0.5).toFixed(2) + '" color="' + tronco + '" rotation="' + rand(-8,8).toFixed(1) + ' 0 ' + rand(-8,8).toFixed(1) + '"></a-cylinder>' +
      '<a-sphere position="0 ' + (altura + 0.2).toFixed(2) + ' 0" radius="1.1" color="' + folha + '"></a-sphere>' +
      '<a-sphere position="0.7 ' + (altura - 0.1).toFixed(2) + ' 0.3" radius="0.75" color="' + folha + '"></a-sphere>' +
      '<a-sphere position="-0.6 ' + (altura + 0.2).toFixed(2) + ' -0.4" radius="0.7" color="' + folha + '"></a-sphere>' +
      '<a-sphere position="0 ' + (altura + 0.5).toFixed(2) + ' 0.3" radius="0.6" color="#4A7A3A"></a-sphere>' +
      '</a-entity>';
  }

  function gerarIpe(x, z, corFlor) {
    const altura = rand(3.0, 5.0);
    const tronco = '#5A4028';
    const cor = corFlor || pick(['#F0C230', '#F0A028', '#E8482A', '#C8382A']);
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0">' +
      '<a-cylinder position="0 ' + (altura/2).toFixed(2) + ' 0" radius="0.13" height="' + altura.toFixed(2) + '" color="' + tronco + '" shadow="cast: true"></a-cylinder>' +
      '<a-sphere position="0 ' + (altura + 0.3).toFixed(2) + ' 0" radius="1.15" color="' + cor + '"></a-sphere>' +
      '<a-sphere position="0.6 ' + (altura + 0.1).toFixed(2) + ' 0.4" radius="0.85" color="' + cor + '"></a-sphere>' +
      '<a-sphere position="-0.55 ' + (altura + 0.4).toFixed(2) + ' -0.35" radius="0.8" color="' + cor + '"></a-sphere>' +
      '<a-sphere position="0.1 ' + (altura + 0.7).toFixed(2) + ' 0" radius="0.75" color="' + cor + '"></a-sphere>' +
      '</a-entity>';
  }

  function gerarBuriti(x, z) {
    const altura = rand(5.0, 7.0);
    const tronco = '#6A4A28', folha = '#2E7A30';
    let folhas = '';
    const n = randInt(10, 14);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const tilt = rand(45, 75);
      folhas += '<a-cone position="' + (Math.cos(a) * 1.3).toFixed(2) + ' ' + (altura + 0.2).toFixed(2) + ' ' + (Math.sin(a) * 1.3).toFixed(2) + '" radius-bottom="0.35" radius-top="0.02" height="2.4" color="' + folha + '" rotation="' + tilt.toFixed(1) + ' ' + (a*180/Math.PI).toFixed(1) + ' ' + rand(-15,15).toFixed(1) + '"></a-cone>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0">' +
      '<a-cylinder position="0 ' + (altura/2).toFixed(2) + ' 0" radius="0.16" height="' + altura.toFixed(2) + '" color="' + tronco + '" shadow="cast: true"></a-cylinder>' +
      folhas +
      '<a-sphere position="0 ' + altura.toFixed(2) + ' 0" radius="0.18" color="' + tronco + '"></a-sphere>' +
      '</a-entity>';
  }

  function gerarCupinzeiroGrande(x, z, tam) {
    const t = tam || 1;
    const h = 1.5 * t + Math.random() * 0.8;
    const r = 0.65 * t;
    let detalhes = '';
    for (let i = 0; i < randInt(10, 18); i++) {
      const a = rand(0, Math.PI * 2);
      const rr = r * rand(0.4, 1.05);
      const y = h * rand(0.1, 0.9);
      detalhes += '<a-sphere position="' + (Math.cos(a)*rr).toFixed(2) + ' ' + y.toFixed(2) + ' ' + (Math.sin(a)*rr).toFixed(2) + '" radius="' + rand(0.05,0.14).toFixed(2) + '" color="#6A4A2A"></a-sphere>';
    }
    let buracos = '';
    for (let i = 0; i < randInt(3, 6); i++) {
      const a = rand(0, Math.PI * 2);
      const rr = r * 0.9;
      const y = rand(0.1, 0.4) * h;
      buracos += '<a-sphere position="' + (Math.cos(a)*rr).toFixed(2) + ' ' + y.toFixed(2) + ' ' + (Math.sin(a)*rr).toFixed(2) + '" radius="0.06" color="#1A0E08"></a-sphere>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0">' +
      '<a-cone position="0 ' + (h/2).toFixed(2) + ' 0" radius-bottom="' + r.toFixed(2) + '" radius-top="' + (r*0.3).toFixed(2) + '" height="' + h.toFixed(2) + '" color="#8A6A48"></a-cone>' +
      '<a-sphere position="0 ' + (h*0.35).toFixed(2) + ' 0" radius="' + (r*0.55).toFixed(2) + '" color="#7A5A3A"></a-sphere>' +
      detalhes + buracos +
      '</a-entity>';
  }

  function gerarMurundu(x, z) {
    const r = rand(0.3, 0.6);
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">' +
      '<a-cone position="0 ' + (r*0.4).toFixed(2) + ' 0" radius-bottom="' + r.toFixed(2) + '" radius-top="0.08" height="' + (r*1.1).toFixed(2) + '" color="#8A6A4A"></a-cone>' +
      '</a-entity>';
  }

  function gerarCapim(x, z) {
    const cor = pick(['#8A9A4A', '#7A8A3A', '#A0A860', '#B8B070']);
    const h = rand(0.4, 0.9);
    const qtd = randInt(4, 8);
    const swayAmp = rand(8, 16).toFixed(1);
    let html = '';
    for (let i = 0; i < qtd; i++) {
      const a = (i / qtd) * Math.PI * 2 + rand(-0.4, 0.4);
      const dx = Math.cos(a) * 0.06;
      const dz = Math.sin(a) * 0.06;
      const hh = h * rand(0.7, 1.2);
      html += '<a-cone position="' + dx.toFixed(3) + ' ' + (hh/2).toFixed(3) + ' ' + dz.toFixed(3) + '" radius-bottom="0.035" radius-top="0.003" height="' + hh.toFixed(3) + '" color="' + cor + '" rotation="' + rand(-15,15).toFixed(1) + ' 0 ' + rand(-15,15).toFixed(1) + '"></a-cone>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" sway-capim="ampl: ' + swayAmp + '">' + html + '</a-entity>';
  }

  function gerarQueimada(x, z) {
    const r = rand(0.8, 2.0);
    return '<a-circle position="' + x.toFixed(2) + ' 0.004 ' + z.toFixed(2) + '" rotation="-90 0 0" radius="' + r.toFixed(2) + '" color="#2A2018" opacity="0.75" transparent="true"></a-circle>';
  }

  function gerarArvoreMorta(x, z) {
    const altura = rand(2.0, 3.5);
    const tronco = '#1A1008';
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0">' +
      '<a-cylinder position="0 ' + (altura*0.4).toFixed(2) + ' 0" radius="0.14" height="' + (altura*0.8).toFixed(2) + '" color="' + tronco + '" rotation="0 0 4"></a-cylinder>' +
      '<a-cylinder position="0.25 ' + (altura*0.7).toFixed(2) + ' 0" radius="0.06" height="' + (altura*0.4).toFixed(2) + '" color="' + tronco + '" rotation="0 0 30"></a-cylinder>' +
      '<a-cylinder position="-0.2 ' + (altura*0.75).toFixed(2) + ' 0.1" radius="0.05" height="' + (altura*0.35).toFixed(2) + '" color="' + tronco + '" rotation="0 0 -25"></a-cylinder>' +
      '</a-entity>';
  }

  function gerarPedra(x, z, t) {
    const r = (t || 1) * rand(0.25, 0.55);
    return '<a-dodecahedron position="' + x.toFixed(2) + ' ' + (r*0.5).toFixed(2) + ' ' + z.toFixed(2) + '" radius="' + r.toFixed(2) + '" color="#7A7A6A" rotation="0 ' + rand(0,360).toFixed(1) + ' 0" scale="1.1 ' + rand(0.5,0.8).toFixed(2) + ' 1.1"></a-dodecahedron>';
  }

  function gerarFlor(x, z) {
    const cor = pick(['#F0A028', '#E8482A', '#F0C230', '#D0A0C8', '#FFFFFF']);
    const h = rand(0.15, 0.3);
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">' +
      '<a-cylinder position="0 ' + (h/2).toFixed(2) + ' 0" radius="0.008" height="' + h.toFixed(2) + '" color="#5A7A3A"></a-cylinder>' +
      '<a-sphere position="0 ' + h.toFixed(2) + ' 0" radius="0.04" color="' + cor + '"></a-sphere>' +
      '</a-entity>';
  }

  function gerarTamanduaBandeira(x, z, esc) {
    const s = esc || 1;
    const corpo = '#4A3A2A', faixa1 = '#1A1008', faixa2 = '#D8C8A8', focinho = '#8A7A6A';
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0" scale="' + s + ' ' + s + ' ' + s + '">' +
      '<a-sphere position="0 0.55 0" radius="0.35" color="' + corpo + '" scale="2.0 1 1"></a-sphere>' +
      '<a-sphere position="-0.55 0.55 0" radius="0.28" color="' + faixa1 + '" scale="0.4 1 1"></a-sphere>' +
      '<a-sphere position="-0.75 0.55 0" radius="0.26" color="' + faixa2 + '" scale="0.4 1 1"></a-sphere>' +
      '<a-sphere position="0.5 0.6 0" radius="0.22" color="' + corpo + '"></a-sphere>' +
      '<a-cone position="0.75 0.5 0" rotation="0 0 -100" radius-bottom="0.09" radius-top="0.02" height="0.45" color="' + focinho + '"></a-cone>' +
      '<a-sphere position="0.55 0.65 0.08" radius="0.015" color="#1A1A1A"></a-sphere>' +
      '<a-sphere position="0.55 0.65 -0.08" radius="0.015" color="#1A1A1A"></a-sphere>' +
      '<a-sphere position="-1.0 0.45 0" radius="0.28" color="' + corpo + '" scale="1 1.3 1"></a-sphere>' +
      '<a-cylinder position="0.3 0.2 0.15" radius="0.05" height="0.4" color="' + corpo + '"></a-cylinder>' +
      '<a-cylinder position="0.3 0.2 -0.15" radius="0.05" height="0.4" color="' + corpo + '"></a-cylinder>' +
      '<a-cylinder position="-0.3 0.2 0.15" radius="0.05" height="0.4" color="' + corpo + '"></a-cylinder>' +
      '<a-cylinder position="-0.3 0.2 -0.15" radius="0.05" height="0.4" color="' + corpo + '"></a-cylinder>' +
      '</a-entity>';
  }

  function gerarSeriema(x, y, z) {
    const cinza = '#8A8A80', vermelho = '#C82A2A', preto = '#1A1A1A';
    return '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '">' +
      '<a-sphere radius="0.11" color="' + cinza + '" scale="1.3 1 1"></a-sphere>' +
      '<a-sphere position="0.13 0.14 0" radius="0.08" color="' + cinza + '"></a-sphere>' +
      '<a-cone position="0.22 0.14 0" rotation="0 0 -90" radius-bottom="0.025" radius-top="0.005" height="0.08" color="' + preto + '"></a-cone>' +
      '<a-cone position="0.08 0.22 0" radius-bottom="0.04" radius-top="0.005" height="0.1" color="' + cinza + '"></a-cone>' +
      '<a-sphere position="0.16 0.16 0.06" radius="0.014" color="' + preto + '"></a-sphere>' +
      '<a-cylinder position="0.02 -0.1 0.03" radius="0.012" height="0.2" color="' + vermelho + '"></a-cylinder>' +
      '<a-cylinder position="0.02 -0.1 -0.03" radius="0.012" height="0.2" color="' + vermelho + '"></a-cylinder>' +
      '<a-sphere position="-0.16 0.02 0" radius="0.06" color="' + cinza + '" scale="1.4 0.7 1"></a-sphere>' +
      '<a-cone position="-0.3 0.02 0" rotation="0 0 90" radius-bottom="0.05" radius-top="0.02" height="0.18" color="' + cinza + '"></a-cone>' +
      '</a-entity>';
  }

  function gerarAraraVoando(x, y, z) {
    const cor1 = pick(['#3A6AD8', '#F0C230', '#E8482A', '#40E0D0']);
    const r = rand(3, 6);
    const dur = randInt(9000, 13000);
    return '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '" flutter-bird="raio: ' + r.toFixed(2) + '; alt: ' + y.toFixed(2) + '; dur: ' + dur + '">' +
      '<a-sphere radius="0.09" color="' + cor1 + '" scale="1.6 0.9 0.7"></a-sphere>' +
      '<a-sphere position="0.11 0.04 0" radius="0.06" color="' + cor1 + '"></a-sphere>' +
      '<a-cone position="0.19 0.04 0" rotation="0 0 -90" radius-bottom="0.02" radius-top="0" height="0.05" color="#1A1A1A"></a-cone>' +
      '<a-plane position="-0.07 0.06 0.11" width="0.18" height="0.08" color="' + cor1 + '" material="shader: flat; side: double" rotation="0 30 -20"></a-plane>' +
      '<a-plane position="-0.07 0.06 -0.11" width="0.18" height="0.08" color="' + cor1 + '" material="shader: flat; side: double" rotation="0 -30 -20"></a-plane>' +
      '</a-entity>';
  }

  function montarBiomaCerrado(animal, opts) {
    opts = opts || {};
    const denso = opts.densidade !== 'baixa';
    const skyTopo = '#5FA8D3', skyBase = '#E8D8B0', chaoBase = '#B89A60', chaoVar = '#C8AA70';

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
      const cor = Math.random() > 0.5 ? chaoVar : '#A87840';
      html += '<a-circle position="' + p.x.toFixed(2) + ' 0.005 ' + p.z.toFixed(2) + '" rotation="-90 0 0" radius="' + r.toFixed(2) + '" color="' + cor + '" opacity="0.5" transparent="true"></a-circle>';
    }

    for (let i = 0; i < (denso ? 5 : 3); i++) {
      const p = pos(8, 25);
      html += gerarQueimada(p.x, p.z);
    }

    html += '<a-circle position="10 0.02 -8" rotation="-90 0 0" radius="2.5" color="#6A7A5A" opacity="0.6" transparent="true"></a-circle>';
    for (let i = 0; i < (denso ? 7 : 4); i++) {
      const a = (i / (denso ? 7 : 4)) * Math.PI * 2;
      const r = rand(2, 3.5);
      html += gerarBuriti(10 + Math.cos(a) * r, -8 + Math.sin(a) * r);
    }

    for (let i = 0; i < (denso ? 8 : 4); i++) {
      const p = pos(5, 22);
      html += gerarArvoreMorta(p.x, p.z);
    }
    for (let i = 0; i < (denso ? 14 : 8); i++) {
      const p = pos(4, 22);
      html += gerarCupinzeiroGrande(p.x, p.z, rand(0.9, 1.6));
    }
    for (let i = 0; i < (denso ? 20 : 12); i++) {
      const p = pos(2, 20);
      html += gerarMurundu(p.x, p.z);
    }
    for (let i = 0; i < (denso ? 18 : 10); i++) {
      const p = pos(8, 28);
      html += gerarPequizeiro(p.x, p.z);
    }
    for (let i = 0; i < (denso ? 6 : 3); i++) {
      const p = pos(12, 30);
      html += gerarIpe(p.x, p.z, pick(['#F0C230', '#F0A028', '#E8482A']));
    }
    for (let i = 0; i < (denso ? 180 : 100); i++) {
      const p = pos(1, 28);
      html += gerarCapim(p.x, p.z);
    }
    for (let i = 0; i < (denso ? 40 : 20); i++) {
      const p = pos(1.5, 20);
      html += gerarFlor(p.x, p.z);
    }
    for (let i = 0; i < (denso ? 16 : 9); i++) {
      const p = pos(2, 25);
      html += gerarPedra(p.x, p.z, rand(0.6, 1.3));
    }

    html += gerarSeriema(-3.5, 0.4, -4.0);
    html += gerarSeriema(3.0, 0.4, -3.5);
    if (denso) html += gerarSeriema(-5.0, 0.4, 1.5);

    for (let i = 0; i < (denso ? 6 : 3); i++) {
      const p = pos(5, 15);
      html += gerarAraraVoando(p.x, rand(4, 7), p.z);
    }

    /* Tamanduás distantes (o GLB principal fica no centro via detalhes.js) */
    html += gerarTamanduaBandeira(-7, -5, 0.7);
    html += gerarTamanduaBandeira(8, 3, 0.65);
    if (denso) html += gerarTamanduaBandeira(-9, 6, 0.6);

    html += '<a-entity position="0 2.0 2.5" info-hotspot="titulo: Tamanduá-bandeira; descricao: Myrmecophaga tridactyla — até 2,10 m e 40 kg. Come 30 mil formigas e cupins por dia com sua língua de 60 cm.; cor: #4A3A2A"></a-entity>';
    html += '<a-entity position="4 1.6 -4" info-hotspot="titulo: Cupinzeiro; descricao: Fonte de alimento principal. O tamanduá abre o cupinzeiro com as garras dianteiras e lambe os insetos.; cor: #7A5A3A"></a-entity>';
    html += '<a-entity position="-4 0.7 -3" info-hotspot="titulo: Capim do Cerrado; descricao: Base da cadeia alimentar. Renasce após o fogo, alimenta insetos que alimentam o tamanduá.; cor: #A0A860"></a-entity>';
    html += '<a-entity position="4 1.2 -6" info-hotspot="titulo: Pequizeiro; descricao: Árvore retorcida do Cerrado. Seus frutos (pequi) alimentam a fauna e o povo do Cerrado.; cor: #3A6A2A"></a-entity>';
    html += '<a-entity position="10 4 -8" info-hotspot="titulo: Buriti; descricao: Palmeira das veredas — áreas úmidas do Cerrado. Corredor ecológico e fonte de alimento.; cor: #2E7A30"></a-entity>';
    html += '<a-entity position="-4 0.6 -5" info-hotspot="titulo: Murundu; descricao: Montinho de terra feito por cupins. Muda o solo e cria microambientes únicos no Cerrado.; cor: #8A6A4A"></a-entity>';
    html += '<a-entity position="6 0.6 -8" info-hotspot="titulo: Marcas do fogo; descricao: O fogo natural faz parte do Cerrado. Queimadas criminosas, porém, devastam fauna e flora.; cor: #2A2018"></a-entity>';
    html += '<a-entity position="-6 1.4 -3" info-hotspot="titulo: Ipê florido; descricao: Símbolo do Cerrado. Floresce na seca e anuncia a chegada das chuvas.; cor: #F0C230"></a-entity>';
    html += '<a-entity position="3 1.2 -3" info-hotspot="titulo: Seriema; descricao: Ave típica do Cerrado. Anda em casais e come insetos, lagartos e cobras pequenas.; cor: #8A8A80"></a-entity>';
    html += '<a-entity position="0 3.0 -12" info-hotspot="titulo: Cerrado; descricao: Berço das águas do Brasil. Considerado a savana mais biodiversa do planeta.; cor: #E8D8B0"></a-entity>';
    html += '<a-entity position="-6 0.6 3" info-hotspot="titulo: Ameaças; descricao: Queimadas, atropelamentos, agronegócio e fragmentação ameaçam o tamanduá-bandeira.; cor: #E8482A"></a-entity>';

    /* ===== ILUMINAÇÃO (ajustada: menos laranja) ===== */
    html += '<a-entity light="type: ambient; color: #D8E0E0; intensity: 0.55"></a-entity>' +
            '<a-entity position="8 15 4" light="type: directional; color: #FFF4D0; intensity: 0.95; castShadow: true; shadowMapWidth: 2048; shadowMapHeight: 2048"></a-entity>' +
            '<a-entity position="-6 6 -3" light="type: point; color: #FFE8B8; intensity: 0.25; distance: 12"></a-entity>';

    return { html, bioma: { nome: 'Cerrado', skyTopo, skyBase, fog: '#E0D0A8', fogDensity: 0.015 } };
  }

  if (!window.MewBiomas) { console.warn('[bioma_cerrado_tamandua] biomas_fauna.js ausente.'); return; }

  const _detectar = window.MewBiomas.detectarBioma;
  window.MewBiomas.detectarBioma = function (animal) {
    const nome = (animal.nome_popular || '').toLowerCase();
    if (nome.indexOf('tamanduá') !== -1 || nome.indexOf('tamandua') !== -1 || nome.indexOf('bandeira') !== -1) {
      return 'cerradoTamandua';
    }
    return _detectar.call(this, animal);
  };

  const _montar = window.MewBiomas.montarCena3D;
  window.MewBiomas.montarCena3D = function (animal, opts) {
    const chave = window.MewBiomas.detectarBioma(animal);
    if (chave === 'cerradoTamandua') return montarBiomaCerrado(animal, opts);
    return _montar.call(this, animal, opts);
  };

  window.MewBiomas.montarBiomaCerrado = montarBiomaCerrado;
  console.log('[bioma_cerrado_tamandua] Bioma Cerrado (Tamanduá-bandeira) registrado.');
})();