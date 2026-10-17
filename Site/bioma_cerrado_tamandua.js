/* =========================================================
   bioma_cerrado_tamandua.js — v4 (LOD + qualidade)
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

  function glb(src, x, z, rot, alturaAlvo, yOffset) {
  const id = 'glb_' + Math.random().toString(36).slice(2, 9);
  const altura = alturaAlvo || 3;
  const yBase = yOffset || 0;

  const caminhoOriginal = 'assets/ambiente/' + src;
  const caminhoFinal = window.MewQualidade
    ? window.MewQualidade.resolverModelo(caminhoOriginal)
    : caminhoOriginal;

  setTimeout(() => {
    const el = document.getElementById(id);
    if (!el) return;

    const ajustar = () => {
      const mesh = el.getObject3D('mesh');
      if (!mesh) return false;

      mesh.position.set(0, 0, 0);
      mesh.rotation.set(0, 0, 0);
      mesh.scale.set(1, 1, 1);
      mesh.updateMatrixWorld(true);

      const box = new THREE.Box3().setFromObject(mesh);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      if (!isFinite(maxDim) || maxDim <= 0.0001) return false;

      const escala = altura / size.y;
      mesh.scale.set(escala, escala, escala);
      mesh.updateMatrixWorld(true);

      const box2 = new THREE.Box3().setFromObject(mesh);
      const center2 = box2.getCenter(new THREE.Vector3());

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

  const fallbackAttr = (caminhoFinal !== caminhoOriginal)
    ? ' data-fallback-src="url(' + caminhoOriginal + ')"'
    : '';
  const sombraAttr = (window.MewQualidade && window.MewQualidade.perfil.sombras)
    ? 'shadow="cast: true; receive: true"'
    : 'shadow="cast: false; receive: false"';

  return '<a-entity id="' + id + '" ' +
         'position="' + x.toFixed(2) + ' ' + yBase + ' ' + z.toFixed(2) + '" ' +
         'rotation="0 ' + (rot || 0).toFixed(1) + ' 0"' + fallbackAttr + ' ' +
         'gltf-model="url(' + caminhoFinal + ')" ' +
         sombraAttr + '></a-entity>';
}

  /* ---------- Procedurais leves ---------- */
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

  function gerarFlor(x, z) {
    const cor = pick(['#F0A028', '#E8482A', '#F0C230', '#D0A0C8', '#FFFFFF']);
    const h = rand(0.15, 0.3);
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">' +
      '<a-cylinder position="0 ' + (h/2).toFixed(2) + ' 0" radius="0.008" height="' + h.toFixed(2) + '" color="#5A7A3A"></a-cylinder>' +
      '<a-sphere position="0 ' + h.toFixed(2) + ' 0" radius="0.04" color="' + cor + '"></a-sphere>' +
      '</a-entity>';
  }

  function gerarPedra(x, z, t) {
    const r = (t || 1) * rand(0.25, 0.55);
    return '<a-dodecahedron position="' + x.toFixed(2) + ' ' + (r*0.5).toFixed(2) + ' ' + z.toFixed(2) + '" radius="' + r.toFixed(2) + '" color="#7A7A6A" rotation="0 ' + rand(0,360).toFixed(1) + ' 0" scale="1.1 ' + rand(0.5,0.8).toFixed(2) + ' 1.1"></a-dodecahedron>';
  }

  function gerarQueimada(x, z) {
    const r = rand(0.8, 2.0);
    return '<a-circle position="' + x.toFixed(2) + ' 0.004 ' + z.toFixed(2) + '" rotation="-90 0 0" radius="' + r.toFixed(2) + '" color="#2A2018" opacity="0.75" transparent="true"></a-circle>';
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

    /* Buritis */
    const nBuriti = denso ? 7 : 4;
    for (let i = 0; i < nBuriti; i++) {
      const a = (i / nBuriti) * Math.PI * 2;
      const r = rand(2, 3.5);
      html += glb('cerrado_buriti.glb', 10 + Math.cos(a) * r, -8 + Math.sin(a) * r, rand(0,360), 5.0);
    }

    /* Ipês */
    const nIpe = denso ? 6 : 3;
    for (let i = 0; i < nIpe; i++) {
      const p = pos(10, 28);
      html += glb('cerrado_ipe.glb', p.x, p.z, rand(0,360), 5.0);
    }

    /* Pequizeiros */
    const nPequi = denso ? 14 : 8;
    for (let i = 0; i < nPequi; i++) {
      const p = pos(6, 26);
      html += glb('pequizeiro_cerrado.glb', p.x, p.z, rand(0,360), 4.5);
    }

    /* Cupinzeiros gigantes */
    const nCupin = denso ? 10 : 6;
    for (let i = 0; i < nCupin; i++) {
      const p = pos(4, 22);
      html += glb('cerrado_cupinzeiro.glb', p.x, p.z, rand(0,360), 3.5);
    }

    /* Árvores mortas */
    const nMorta = denso ? 6 : 3;
    for (let i = 0; i < nMorta; i++) {
      const p = pos(5, 22);
      html += glb('cerrado_morto.glb', p.x, p.z, rand(0,360), 4.0);
    }

    /* Murundus */
    for (let i = 0; i < (denso ? 20 : 12); i++) {
      const p = pos(2, 20);
      html += gerarMurundu(p.x, p.z);
    }

    /* Capim */
    for (let i = 0; i < (denso ? 140 : 80); i++) {
      const p = pos(1, 28);
      html += gerarCapim(p.x, p.z);
    }

    /* Flores */
    for (let i = 0; i < (denso ? 32 : 18); i++) {
      const p = pos(1.5, 20);
      html += gerarFlor(p.x, p.z);
    }

    /* Pedras */
    for (let i = 0; i < (denso ? 14 : 8); i++) {
      const p = pos(2, 25);
      html += gerarPedra(p.x, p.z, rand(0.6, 1.3));
    }

    /* Seriemas */
    html += gerarSeriema(-3.5, 0.4, -4.0);
    html += gerarSeriema(3.0, 0.4, -3.5);
    if (denso) html += gerarSeriema(-5.0, 0.4, 1.5);

    /* Araras voando */
    for (let i = 0; i < (denso ? 6 : 3); i++) {
      const p = pos(5, 15);
      html += gerarAraraVoando(p.x, rand(4, 7), p.z);
    }

    /* HOTSPOTS */
    html += '<a-entity position="0 2.0 2.5" info-hotspot="titulo: Tamandua-bandeira; categoria: Mamifero; imagem: assets/hotspots/cerrado_tamandua_animal.jpg; descricao: Myrmecophaga tridactyla. Pode medir ate 2.10 m e pesar 40 kg. Come cerca de 30 mil formigas e cupins por dia com sua lingua de 60 cm coberta de saliva pegajosa. Considerado Vulneravel no Brasil.; cor: #4A3A2A"></a-entity>';
    html += '<a-entity position="4 1.6 -4" info-hotspot="titulo: Cupinzeiro; categoria: Ecologia; imagem: assets/hotspots/cerrado_tamandua_cupinzeiro.jpg; descricao: Construcao de cupins gigante do Cerrado. Fonte de alimento principal do tamandua.; cor: #7A5A3A"></a-entity>';
    html += '<a-entity position="-4 0.7 -3" info-hotspot="titulo: Capim do Cerrado; categoria: Planta; imagem: assets/hotspots/cerrado_tamandua_capim.jpg; descricao: Base da cadeia alimentar do Cerrado. Renasce rapidamente apos o fogo natural.; cor: #A0A860"></a-entity>';
    html += '<a-entity position="4 1.2 -6" info-hotspot="titulo: Pequizeiro; categoria: Planta; imagem: assets/hotspots/cerrado_tamandua_pequizeiro.jpg; descricao: Caryocar brasiliense. Arvore retorcida tipica do Cerrado. Seus frutos, os pequis, alimentam a fauna e as populacoes humanas.; cor: #3A6A2A"></a-entity>';
    html += '<a-entity position="10 4 -8" info-hotspot="titulo: Buriti; categoria: Planta; imagem: assets/hotspots/cerrado_tamandua_buriti.jpg; descricao: Mauritia flexuosa. Palmeira das veredas, areas umidas do Cerrado.; cor: #2E7A30"></a-entity>';
    html += '<a-entity position="-4 0.6 -5" info-hotspot="titulo: Murundu; categoria: Ecologia; imagem: assets/hotspots/cerrado_tamandua_murundu.jpg; descricao: Montinho de terra feito por cupins ao longo de milhares de anos.; cor: #8A6A4A"></a-entity>';
    html += '<a-entity position="6 0.6 -8" info-hotspot="titulo: Marcas do fogo; categoria: Ecologia; imagem: assets/hotspots/cerrado_tamandua_fogo.jpg; descricao: O fogo natural faz parte do ciclo do Cerrado. Queimadas criminosas devastam fauna e flora.; cor: #2A2018"></a-entity>';
    html += '<a-entity position="-6 1.4 -3" info-hotspot="titulo: Ipe florido; categoria: Planta; imagem: assets/hotspots/cerrado_tamandua_ipe.jpg; descricao: Handroanthus spp. Simbolo do Cerrado e do Brasil. Floresce na estacao seca.; cor: #F0C230"></a-entity>';
    html += '<a-entity position="3 1.2 -3" info-hotspot="titulo: Seriema; categoria: Ave; imagem: assets/hotspots/cerrado_tamandua_seriema.jpg; descricao: Cariama cristata. Ave tipica do Cerrado. Anda em casais pelo chao.; cor: #8A8A80"></a-entity>';
    html += '<a-entity position="0 3.0 -12" info-hotspot="titulo: Cerrado; categoria: Bioma; imagem: assets/hotspots/cerrado_tamandua_bioma.jpg; descricao: Berco das aguas do Brasil. Considerado a savana mais biodiversa do planeta.; cor: #E8D8B0"></a-entity>';
    html += '<a-entity position="-6 0.6 3" info-hotspot="titulo: Ameacas; categoria: Conservacao; imagem: assets/hotspots/cerrado_tamandua_ameacas.jpg; descricao: Queimadas criminosas, atropelamentos, expansao do agronegocio e fragmentacao do habitat ameacam o tamandua-bandeira.; cor: #E8482A"></a-entity>';

    /* Iluminação */
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
  console.log('[bioma_cerrado_tamandua] v4 — LOD + qualidade registrado.');
})();