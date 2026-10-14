/* =========================================================
   bioma_costeiro.js — v4 (com GLBs)
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
      const box2 = new THREE.Box3().setFromObject(mesh);
      const center2 = box2.getCenter(new THREE.Vector3());

      /* Centraliza em X/Z e sobe o Y pra base tocar o chão */
      mesh.position.x = -center2.x;
      mesh.position.z = -center2.z;
      mesh.position.y = -box2.min.y;
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

  /* ---------- Procedurais LEVES ---------- */
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

  function gerarBolha(x, y0, z, y1) {
    const dur = randInt(4000, 8000);
    const r = rand(0.03, 0.07);
    return '<a-sphere position="' + x.toFixed(2) + ' ' + y0.toFixed(2) + ' ' + z.toFixed(2) + '" radius="' + r.toFixed(3) + '" color="#E0F8FF" material="shader: standard; opacity: 0.4; transparent: true; emissive: #B0E8F5; emissiveIntensity: 0.6" animation="property: position; from: ' + x.toFixed(2) + ' ' + y0.toFixed(2) + ' ' + z.toFixed(2) + '; to: ' + x.toFixed(2) + ' ' + y1.toFixed(2) + ' ' + z.toFixed(2) + '; dur: ' + dur + '; loop: true; easing: linear"></a-sphere>';
  }

  function gerarRaioSol(x, z, alt, r) {
  return '<a-cone position="' + x.toFixed(2) + ' ' + (alt/2 + 1).toFixed(2) + ' ' + z.toFixed(2) + '" ' +
         'radius-bottom="' + r.toFixed(2) + '" ' +
         'radius-top="' + (r*0.3).toFixed(2) + '" ' +
         'height="' + alt.toFixed(2) + '" ' +
         'color="#FFF8E0" ' +
         'material="shader: flat; opacity: 0.05; transparent: true; side: double; depthWrite: false" ' +
         'render-order="-100"></a-cone>';
}

  function gerarPoste(x, z, h) {
    const alt = h || rand(1.8, 3);
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0">' +
      '<a-cylinder position="0 ' + (alt/2).toFixed(2) + ' 0" radius="0.08" height="' + alt.toFixed(2) + '" color="#3A2818"></a-cylinder>' +
      '<a-sphere position="0 ' + alt.toFixed(2) + ' 0" radius="0.1" color="#2A1A10"></a-sphere>' +
      '<a-cylinder position="0.05 ' + (alt*0.7).toFixed(2) + ' 0" radius="0.02" height="0.15" color="#5A4A30" rotation="0 0 -40"></a-cylinder>' +
      '</a-entity>';
  }

function gerarPlacaItamaraca(x, z, rot) {
  const moldura = '#0F2A18';
  const face    = '#2E7A3E';
  const header  = '#1F5A30';
  const branco  = '#E8FFE8';
  const verde   = '#A8F0C0';
  const fraco   = '#7EE898';

  return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rot.toFixed(1) + ' 0">' +

    /* Postes */
    '<a-cylinder position="-0.7 0.8 0" radius="0.05" height="1.6" color="#3A2818"></a-cylinder>' +
    '<a-cylinder position="0.7 0.8 0" radius="0.05" height="1.6" color="#3A2818"></a-cylinder>' +

    /* Moldura escura */
    '<a-box position="0 1.65 0" width="2.0" height="1.25" depth="0.07" ' +
    'color="' + moldura + '" material="shader: flat; color: ' + moldura + '"></a-box>' +

    /* Face verde */
    '<a-box position="0 1.65 0.04" width="1.88" height="1.13" depth="0.03" ' +
    'color="' + face + '" material="shader: flat; color: ' + face + '"></a-box>' +

    /* Faixa do header */
    '<a-box position="0 2.13 0.06" width="1.88" height="0.26" depth="0.01" ' +
    'color="' + header + '" material="shader: flat; color: ' + header + '"></a-box>' +

    /* Linha fina */
    '<a-box position="0 1.99 0.065" width="1.88" height="0.015" depth="0.005" ' +
    'color="' + branco + '" material="shader: flat; color: ' + branco + '"></a-box>' +

    /* Logos circulares */
    '<a-circle position="-0.74 2.13 0.07" radius="0.08" ' +
    'color="' + verde + '" material="shader: flat; color: ' + verde + '"></a-circle>' +
    '<a-circle position="-0.74 2.13 0.071" radius="0.055" ' +
    'color="' + header + '" material="shader: flat; color: ' + header + '"></a-circle>' +
    '<a-circle position="0.74 2.13 0.07" radius="0.08" ' +
    'color="' + verde + '" material="shader: flat; color: ' + verde + '"></a-circle>' +
    '<a-circle position="0.74 2.13 0.071" radius="0.055" ' +
    'color="' + header + '" material="shader: flat; color: ' + header + '"></a-circle>' +

    /* Textos — SEM material override (usa msdf padrão, que tem acentos) */
    '<a-text value="CENTRO DE PRESERVAÇÃO" ' +
    'position="0 2.13 0.08" align="center" ' +
    'color="' + branco + '" width="1.5"></a-text>' +

    '<a-text value="Ilha de Itamaracá - ICMBio / CMA" ' +
    'position="0 1.82 0.08" align="center" ' +
    'color="' + verde + '" width="1.75"></a-text>' +

    '<a-text value="Resgate - Reabilitação - Soltura" ' +
    'position="0 1.55 0.08" align="center" ' +
    'color="' + fraco + '" width="1.7"></a-text>' +

    '<a-text value="Peixe-boi-marinho" ' +
    'position="0 1.32 0.08" align="center" ' +
    'color="' + branco + '" width="1.4"></a-text>' +

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

    /* Superfície da água */
    html += '<a-circle position="0 2.85 0" rotation="-90 0 0" radius="90" color="#5FB8D4" opacity="0.18" transparent="true"></a-circle>';
    html += '<a-circle position="0 2.86 0" rotation="-90 0 0" radius="90" color="#A8E8F5" opacity="0.06" transparent="true"></a-circle>';

    /* Raios de sol */
    for (let i = 0; i < (denso ? 5 : 3); i++) {
      const p = pos(3, 15);
      html += gerarRaioSol(p.x, p.z, rand(4, 6), rand(0.8, 1.6));
    }

    /* ============================================================
       GLBs — Mangue (círculo no horizonte)
       ============================================================ */
    const nMangues = denso ? 16 : 10;
    for (let i = 0; i < nMangues; i++) {
      const ang = (i / nMangues) * Math.PI * 2 + rand(-0.15, 0.15);
      const r = 40 + rand(-3, 3);
      html += glb('costeiro_mangue.glb', Math.cos(ang) * r, Math.sin(ang) * r, rand(0,360), 1.0);
    }

    /* ============================================================
       GLBs — Recife de corais (à direita)
       ============================================================ */
    const nRecife = denso ? 14 : 8;
    for (let i = 0; i < nRecife; i++) {
      const p = pos(5, 20);
      html += glb('costeiro_recife.glb', p.x, p.z, rand(0,360), 1.0);
    }
    /* Núcleo de recife */
    for (let i = 0; i < (denso ? 10 : 5); i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(0, 2.5);
      html += glb('costeiro_recife.glb', 4 + Math.cos(a) * r, -4 + Math.sin(a) * r, rand(0,360), 1.0);
    }

    /* Capim-marinho (procedural em massa) */
    for (let i = 0; i < (denso ? 130 : 80); i++) {
      const p = pos(1.5, 20);
      html += gerarTufoCapim(p.x, p.z);
    }
    for (let i = 0; i < (denso ? 40 : 22); i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(0, 2.2);
      html += gerarTufoCapim(Math.cos(a) * r, Math.sin(a) * r, 0.32);
    }

    /* Anêmonas */
    const coresAne = ['#FFB6C1', '#FF9AA2', '#E8B4D8', '#FFC0CB'];
    for (let i = 0; i < (denso ? 12 : 7); i++) {
      const p = pos(4, 16);
      html += gerarAnemona(p.x, p.z, pick(coresAne));
    }

    /* Pedras */
    for (let i = 0; i < (denso ? 14 : 9); i++) {
      const p = pos(3, 25);
      html += gerarPedra(p.x, p.z, rand(0.8, 1.6));
    }
    for (let i = 0; i < 4; i++) {
      const p = pos(15, 30);
      html += gerarPedra(p.x, p.z, 2.5);
    }

    /* Detalhes (estrela, ouriço, concha) */
    for (let i = 0; i < (denso ? 22 : 12); i++) {
      const p = pos(2, 20);
      const t = Math.random();
      if (t < 0.35) html += gerarEstrela(p.x, p.z, pick(['#FF8C69', '#FF6B9D', '#FFD700', '#E8A87C']));
      else if (t < 0.7) html += gerarOurico(p.x, p.z);
      else html += gerarConcha(p.x, p.z);
    }

    /* Peixes */
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

    /* Bolhas */
    for (let i = 0; i < (denso ? 30 : 18); i++) {
      const p = pos(0, 15);
      html += gerarBolha(p.x, rand(0.05, 0.5), p.z, rand(2.4, 3));
    }

    /* Postes */
    for (let i = 0; i < (denso ? 10 : 6); i++) {
      const a = (i / (denso ? 10 : 6)) * Math.PI * 0.4 - Math.PI * 0.2;
      const r = 10 + Math.random() * 3;
      html += gerarPoste(Math.cos(a) * r - 5, Math.sin(a) * r - 8, rand(1.8, 3.2));
    }

    /* ============================================================
       GLBs — Boias e barco
       ============================================================ */
    const nBoias = denso ? 4 : 2;
    for (let i = 0; i < nBoias; i++) {
      const p = pos(8, 16);
      html += glb('costeiro_boia.glb', p.x, p.z, rand(0,360), 1.0, 2.6);
    }
    const nBarcos = denso ? 3 : 2;
    for (let i = 0; i < nBarcos; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(28, 38);
      html += glb('costeiro_barco.glb', Math.cos(a) * r, Math.sin(a) * r, rand(0,360), 1.0, 2.5);
    }

    /* Placa ICMBio */
    html += gerarPlacaItamaraca(-9, -5, 30);

    /* Hotspots */
    html += '<a-entity position="-3 0.75 -3.5" info-hotspot="titulo: Capim-marinho; descricao: Principal alimento do peixe-boi. Cada adulto come 30-50 kg por dia.; cor: #7ee898"></a-entity>';
    html += '<a-entity position="4 0.95 -4" info-hotspot="titulo: Recife de corais; descricao: Berçário de peixes e invertebrados. Peixes-boi usam como abrigo e área de descanso.; cor: #FF8C69"></a-entity>';
    html += '<a-entity position="0 3.2 -30" info-hotspot="titulo: Manguezal; descricao: Raízes aéreas seguram o lodo e protegem filhotes. Fonte de água doce para o peixe-boi.; cor: #2E8B57"></a-entity>';
    html += '<a-entity position="-9 1.6 -5" info-hotspot="titulo: Centro de Preservação; descricao: Ilha de Itamaracá sedia o CMA/ICMBio — resgate, reabilitação e soltura de peixes-boi.; cor: #40E0D0"></a-entity>';
    html += '<a-entity position="0 0.85 -7" info-hotspot="titulo: Estuário; descricao: Encontro da água doce do rio com o mar. Água salobra rica em nutrientes — rota do peixe-boi.; cor: #FFD166"></a-entity>';
    html += '<a-entity position="-4 2.3 -10" info-hotspot="titulo: Bacia do Pina; descricao: Zona portuária do Recife onde peixes-boi já foram registrados. Corredor urbano da espécie.; cor: #F7A072"></a-entity>';
    html += '<a-entity position="7 2.7 -12" info-hotspot="titulo: Boia sinalizadora; descricao: Marca zonas de proteção e rotas de navegação para evitar colisões com peixes-boi.; cor: #E85A3A"></a-entity>';
    html += '<a-entity position="0 1.5 2.5" info-hotspot="titulo: Peixe-boi-marinho; descricao: Mamífero aquático dócil. Em Pernambuco é Em Perigo — perda de habitat, redes e poluição.; cor: #FF6B9D"></a-entity>';

    /* Iluminação */
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
  console.log('[bioma_costeiro] v4 — Costeiro/Marinho (com GLBs) registrado.');
})();