/* =========================================================
   bioma_mataatlantica.js — v3 (com GLBs)
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

  function glb(src, x, z, rot, alturaAlvo, yOffset) {
  const id = 'glb_' + Math.random().toString(36).slice(2, 9);
  const altura = alturaAlvo || 3;
  const yBase = yOffset || 0;

  setTimeout(() => {
    const el = document.getElementById(id);
    if (!el) return;

    const ajustar = () => {
      const mesh = el.getObject3D('mesh');
      if (!mesh) return false;

      /* Reset */
      mesh.position.set(0, 0, 0);
      mesh.rotation.set(0, 0, 0);
      mesh.scale.set(1, 1, 1);
      mesh.updateMatrixWorld(true);

      /* Mede tamanho original */
      const box = new THREE.Box3().setFromObject(mesh);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      if (!isFinite(maxDim) || maxDim <= 0.0001) return false;

      /* Escala pra bater a altura alvo */
      const escala = altura / size.y;
      mesh.scale.set(escala, escala, escala);
      mesh.updateMatrixWorld(true);

      /* Recalcula depois da escala */
      /* Recalcula depois da escala */
      const box2 = new THREE.Box3().setFromObject(mesh);
      const center2 = box2.getCenter(new THREE.Vector3());

      // Captura a posição global da entidade pai (<a-entity>)
      const parentPos = new THREE.Vector3();
      el.object3D.getWorldPosition(parentPos);

      // Ajusta o mesh internamente compensando a posição original do pai
      mesh.position.x = parentPos.x - center2.x;
      mesh.position.z = parentPos.z - center2.z;
      mesh.position.y = parentPos.y - box2.min.y;
      mesh.updateMatrixWorld(true);

      return true;
    };

    if (ajustar()) return;

    let tentativas = 0;
    const interval = setInterval(() => {
      tentativas++;
      if (ajustar() || tentativas > 60) clearInterval(interval);
    }, 100);
  }, 100);

  return '<a-entity id="' + id + '" ' +
         'position="' + x.toFixed(2) + ' ' + yBase + ' ' + z.toFixed(2) + '" ' +
         'rotation="0 ' + (rot || 0).toFixed(1) + ' 0" ' +
         'gltf-model="url(assets/ambiente/' + src + ')" ' +
         'shadow="cast: true; receive: true"></a-entity>';
}

  /* Procedurais leves */
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

    /* Manchas de folhiço */
    for (let i = 0; i < (denso ? 20 : 12); i++) {
      const p = pos(2, 35);
      const r = rand(1.5, 4);
      const cor = Math.random() > 0.5 ? chaoVar : '#241A10';
      html += '<a-circle position="' + p.x.toFixed(2) + ' 0.006 ' + p.z.toFixed(2) + '" rotation="-90 0 0" radius="' + r.toFixed(2) + '" color="' + cor + '" opacity="0.55" transparent="true"></a-circle>';
    }

    /* Folhas soltas */
    for (let i = 0; i < (denso ? 60 : 30); i++) {
      const p = pos(1, 25);
      const cor = pick(['#5A3A20', '#8A5A28', '#4A7A32', '#A86A28']);
      html += '<a-plane position="' + p.x.toFixed(2) + ' 0.012 ' + p.z.toFixed(2) + '" width="' + rand(0.12,0.22).toFixed(2) + '" height="' + rand(0.08,0.15).toFixed(2) + '" color="' + cor + '" material="shader: flat; side: double; opacity: 0.9; transparent: true" rotation="-90 ' + rand(0,360).toFixed(1) + ' 0"></a-plane>';
    }

    /* Raios de luz */
    for (let i = 0; i < (denso ? 8 : 4); i++) {
      const p = pos(2, 20);
      html += gerarRaioCopa(p.x, p.z, rand(6, 9), rand(0.8, 1.8));
    }

    /* ============================================================
       GLBs — Palmeiras juçara
       ============================================================ */
    const nPalm = denso ? 14 : 8;
    for (let i = 0; i < nPalm; i++) {
      const p = pos(4, 22);
      html += glb('mata_palmeira.glb', p.x, p.z, rand(0,360), 1.0);
    }

    /* ============================================================
       GLBs — Árvores frutíferas (fonte de alimento da saíra)
       ============================================================ */
    const nFrut = denso ? 8 : 5;
    for (let i = 0; i < nFrut; i++) {
      const p = pos(4, 16);
      html += glb('mata_frutifera.glb', p.x, p.z, rand(0,360), 1.0);
    }

    /* ============================================================
       GLBs — Bromélias gigantes
       ============================================================ */
    const nBrom = denso ? 18 : 10;
    for (let i = 0; i < nBrom; i++) {
      const p = pos(2, 18);
      html += glb('mata_bromelia.glb', p.x, p.z, rand(0,360), 1.0);
    }

    /* ============================================================
       GLBs — Troncos caídos com musgo
       ============================================================ */
    const nTroncos = denso ? 6 : 3;
    for (let i = 0; i < nTroncos; i++) {
      const p = pos(4, 18);
      html += glb('mata_tronco.glb', p.x, p.z, rand(0,360), 1.0);
    }

    /* Bambu */
    for (let i = 0; i < (denso ? 4 : 2); i++) {
      const a = rand(0, Math.PI * 2);
      const r = rand(12, 20);
      html += gerarBambu(Math.cos(a) * r, Math.sin(a) * r);
    }

    /* Riacho */
    html += gerarRiacho();

    /* Samambaias (procedural em massa) */
    for (let i = 0; i < (denso ? 40 : 24); i++) {
      const p = pos(1.5, 20);
      html += gerarSamambaia(p.x, p.z);
    }

    /* Cogumelos */
    for (let i = 0; i < (denso ? 22 : 12); i++) {
      const p = pos(1.5, 18);
      html += gerarCogumelo(p.x, p.z);
    }

    /* Pedras com musgo */
    for (let i = 0; i < (denso ? 18 : 10); i++) {
      const p = pos(2, 22);
      html += gerarPedraMusgo(p.x, p.z, rand(0.8, 1.7));
    }
    for (let i = 0; i < 4; i++) {
      const p = pos(10, 25);
      html += gerarPedraMusgo(p.x, p.z, 2.4);
    }

    /* Lianas */
    for (let i = 0; i < (denso ? 14 : 8); i++) {
      const a = rand(0, Math.PI * 2);
      const r = rand(3, 14);
      html += gerarLiana(Math.cos(a) * r, rand(3.5, 5.5), Math.sin(a) * r);
    }

    /* Saíras pousadas */
    html += gerarSairaPousada(-1.8, 1.15, -2.5);
    html += gerarSairaPousada(2.2, 1.55, -3.5);
    html += gerarSairaPousada(-3.5, 0.85, 1.8);
    if (denso) {
      html += gerarSairaPousada(3.8, 1.35, 1.5);
      html += gerarSairaPousada(0.5, 1.75, -5.2);
    }

    /* Pássaros voando + borboletas */
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

    /* Hotspots */
        /* ============================================================
       HOTSPOTS — v2 (categoria + descrição + imagem)
       ============================================================ */
    html += '<a-entity position="0 2.2 2.5" info-hotspot="' +
      'titulo: Saiara-pintor; ' +
      'categoria: Ave; ' +
      'imagem: assets/hotspots/mata_saira_ave.jpg; ' +
      'descricao: Tangara fastuosa. Endemica do Nordeste brasileiro. Plumagem com turquesa, verde, amarelo, preto e violeta. Mede 13 a 14 cm e pesa 16 a 21 g. Vive em pequenos grupos familiares e e bastante territorialista. Ameacada pelo trafico.; ' +
      'cor: #3FD9E0"></a-entity>';

    html += '<a-entity position="-3.5 0.8 -3" info-hotspot="' +
      'titulo: Samambaia; ' +
      'categoria: Planta; ' +
      'imagem: assets/hotspots/mata_saira_samambaia.jpg; ' +
      'descricao: Indicador de mata umida preservada. So cresce em sub-bosque com sombra e alta umidade. Sua presenca sinaliza que a floresta mantem condicoes ideais para a saira-pintor e outras especies sensiveis.; ' +
      'cor: #4A9A40"></a-entity>';

    html += '<a-entity position="3.5 1.0 -4" info-hotspot="' +
      'titulo: Arvore frutifera; ' +
      'categoria: Planta; ' +
      'imagem: assets/hotspots/mata_saira_frutifera.jpg; ' +
      'descricao: Frutos silvestres sao o principal alimento da saira-pintor. Sem floresta nativa, a especie desaparece. Ela atua como dispersora de sementes, ajudando a regenerar a propria Mata Atlantica.; ' +
      'cor: #F0A028"></a-entity>';

    html += '<a-entity position="-2 0.6 3" info-hotspot="' +
      'titulo: Bromelia; ' +
      'categoria: Planta; ' +
      'imagem: assets/hotspots/mata_saira_bromelia.jpg; ' +
      'descricao: Planta epifita que acumula agua entre as folhas, formando uma minipiscina. Abriga sapos, insetos e micro-organismos. Simbolo da Mata Atlantica e microhabitat crucial para muitas especies.; ' +
      'cor: #C8382A"></a-entity>';

    html += '<a-entity position="5 2.8 -6" info-hotspot="' +
      'titulo: Bambu; ' +
      'categoria: Planta; ' +
      'imagem: assets/hotspots/mata_saira_bambu.jpg; ' +
      'descricao: Bambuzais nativos formam corredores de fauna na Mata Atlantica. A saira-pintor usa esses emaranhados para se esconder de predadores e como area de forrageamento. Tambem servem de abrigo para pequenos mamiferos.; ' +
      'cor: #6A9A40"></a-entity>';

    html += '<a-entity position="-5 2.5 -8" info-hotspot="' +
      'titulo: Lianas e cipos; ' +
      'categoria: Ecologia; ' +
      'imagem: assets/hotspots/mata_saira_liana.jpg; ' +
      'descricao: Plantas trepadeiras que conectam as copas das arvores, criando passagens aereas para a fauna. A saira-pintor forrageia pelas lianas em busca de insetos e frutas, usando-as como verdadeiras estradas na floresta.; ' +
      'cor: #3A5A28"></a-entity>';

    html += '<a-entity position="-1 0.5 -6" info-hotspot="' +
      'titulo: Folhico; ' +
      'categoria: Ecologia; ' +
      'imagem: assets/hotspots/mata_saira_folhico.jpg; ' +
      'descricao: Camada de folhas secas em decomposicao. Mantem a umidade do solo, alimenta decompositores e abriga invertebrados. Parte da cadeia alimentar que sustenta insetos, que alimentam aves como a saira-pintor.; ' +
      'cor: #5A3A20"></a-entity>';

    html += '<a-entity position="6 1.3 -2" info-hotspot="' +
      'titulo: Riacho; ' +
      'categoria: Habitat; ' +
      'imagem: assets/hotspots/mata_saira_riacho.jpg; ' +
      'descricao: Cursos de agua sao essenciais na Mata Atlantica. Riachos limpos indicam floresta viva e sao fonte de agua para todas as especies. A saira-pintor costuma forragear nas margens, onde a umidade atrai insetos.; ' +
      'cor: #4A90B8"></a-entity>';

    html += '<a-entity position="2 3.2 -12" info-hotspot="' +
      'titulo: Mata Atlantica; ' +
      'categoria: Bioma; ' +
      'imagem: assets/hotspots/mata_saira_bioma.jpg; ' +
      'descricao: Um dos biomas mais ricos e ameacados do planeta. Restam cerca de 12 porcento da cobertura original, muito fragmentada. No Nordeste, o Centro de Endemismo Pernambuco abriga especies unicas como a saira-pintor.; ' +
      'cor: #2E7A30"></a-entity>';

    html += '<a-entity position="-4 0.9 5" info-hotspot="' +
      'titulo: Trafico de aves; ' +
      'categoria: Ameaca; ' +
      'imagem: assets/hotspots/mata_saira_trafico.jpg; ' +
      'descricao: A saira-pintor e cobicada por sua beleza e canto. A captura ilegal e o desmatamento a colocaram em risco de extincao. Combater o trafico e restaurar a Mata Atlantica sao as principais estrategias para salva-la.; ' +
      'cor: #E8482A"></a-entity>';

    /* Iluminação */
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
  console.log('[bioma_mataatlantica] v3 — Mata Atlântica (com GLBs) registrado.');
})();