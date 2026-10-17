/* =========================================================
   bioma_transicao_jaguatirica.js — v5 (LOD + qualidade)
   Jaguatirica — Transição Mata Atlântica ↔ Caatinga
   Depende de: bioma_componentes.js
   ========================================================= */
(function () {
  'use strict';

  function rand(a, b) { return a + Math.random() * (b - a); }
  function randInt(a, b) { return Math.floor(rand(a, b + 1)); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

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

      const parentPos = new THREE.Vector3();
      el.object3D.getWorldPosition(parentPos);

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

  /* ============================================================
     ÂNGULO DA RODOVIA (35°)
     ============================================================ */
  const ANG = 35 * Math.PI / 180;
  const COS = Math.cos(ANG);
  const SIN = Math.sin(ANG);

  function posRodovia(along, perp) {
    return {
      x: along * SIN + perp * COS,
      z: along * COS - perp * SIN
    };
  }

  /* ============================================================
     VISUAIS
     ============================================================ */
  function placaConteudo() {
    return '<a-entity>' +
      '<a-cylinder position="0 0.8 0" radius="0.04" height="1.6" color="#6A6A6A"></a-cylinder>' +
      '<a-box position="0 1.75 0" width="0.9" height="0.75" depth="0.05" color="#F0C830" material="shader: flat"></a-box>' +
      '<a-box position="0 1.75 0.03" width="0.85" height="0.7" depth="0.03" color="#F0D850" material="shader: flat"></a-box>' +
      '<a-sphere position="0 1.75 0.06" radius="0.09" color="#1A1A1A" scale="1.8 1 0.2"></a-sphere>' +
      '<a-sphere position="0.1 1.85 0.06" radius="0.05" color="#1A1A1A" scale="1 1 0.2"></a-sphere>' +
      '<a-cone position="0.15 1.85 0.06" rotation="0 0 -90" radius-bottom="0.02" radius-top="0" height="0.05" color="#1A1A1A" scale="1 1 0.2"></a-cone>' +
      '<a-cylinder position="-0.05 1.6 0.06" radius="0.02" height="0.15" color="#1A1A1A" scale="1 1 0.2"></a-cylinder>' +
      '<a-cylinder position="0.05 1.6 0.06" radius="0.02" height="0.15" color="#1A1A1A" scale="1 1 0.2"></a-cylinder>' +
    '</a-entity>';
  }

  function caminhaoVisual() {
    return '<a-entity>' +
      '<a-box width="1.2" height="1.5" depth="2.5" color="#3A5A80" position="0 0 0"></a-box>' +
      '<a-box width="1.3" height="0.5" depth="2.8" color="#2A2A2A" position="0 -0.8 0"></a-box>' +
      '<a-box position="0 0.3 1.28" width="1.05" height="0.5" depth="0.02" color="#A8D8F0" material="shader: standard; opacity: 0.7; transparent: true"></a-box>' +
      '<a-box position="0 -0.4 1.28" width="0.9" height="0.15" depth="0.02" color="#F0E8A0"></a-box>' +
      '<a-cylinder position="0.65 -0.6 0.9" rotation="0 0 90" radius="0.35" height="0.2" color="#1A1A1A"></a-cylinder>' +
      '<a-cylinder position="-0.65 -0.6 0.9" rotation="0 0 90" radius="0.35" height="0.2" color="#1A1A1A"></a-cylinder>' +
      '<a-cylinder position="0.65 -0.6 -0.9" rotation="0 0 90" radius="0.35" height="0.2" color="#1A1A1A"></a-cylinder>' +
      '<a-cylinder position="-0.65 -0.6 -0.9" rotation="0 0 90" radius="0.35" height="0.2" color="#1A1A1A"></a-cylinder>' +
    '</a-entity>';
  }

  function gerarRodovia() {
    let html = '<a-entity position="0 0.02 0" rotation="0 35 0">';

    html += '<a-plane position="0 0 0" rotation="-90 0 0" width="5" height="90" color="#2A2A2A"></a-plane>';

    for (let i = -20; i <= 20; i += 2) {
      html += '<a-plane position="0 0.005 ' + i + '" rotation="-90 0 0" width="0.15" height="1.2" color="#F0E8A0"></a-plane>';
    }

    html += '<a-plane position="-2.4 0.005 0" rotation="-90 0 0" width="0.1" height="90" color="#F0E8C0"></a-plane>';
    html += '<a-plane position="2.4 0.005 0" rotation="-90 0 0" width="0.1" height="90" color="#F0E8C0"></a-plane>';

    for (let i = 0; i < 5; i++) {
      const z = -22 + i * 11;
      html += '<a-entity position="-3.8 0 ' + z + '" rotation="0 90 0">' +
                placaConteudo() +
              '</a-entity>';
    }

    html += '<a-entity position="1.2 0.85 -26" ' +
              'animation="property: position; from: 1.2 0.85 -26; to: 1.2 0.85 26; dur: 15000; loop: true; easing: linear">' +
              caminhaoVisual() +
            '</a-entity>';

    html += '<a-entity position="-1.2 0.85 26" rotation="0 180 0" ' +
              'animation="property: position; from: -1.2 0.85 26; to: -1.2 0.85 -26; dur: 17000; loop: true; easing: linear">' +
              caminhaoVisual() +
            '</a-entity>';

    html += '</a-entity>';
    return html;
  }

  /* ============================================================
     PROCEDURAIS
     ============================================================ */
  function gerarArbusto(x, z) {
    const cor = pick(['#7A8A4A', '#8A7A3A', '#6A7A42']);
    let galhos = '';
    for (let i = 0; i < randInt(4, 6); i++) {
      const a = rand(0, Math.PI * 2);
      const h = rand(0.3, 0.6);
      galhos += '<a-cylinder position="' + (Math.cos(a)*0.1).toFixed(2) + ' ' + (h/2).toFixed(2) + ' ' + (Math.sin(a)*0.1).toFixed(2) + '" radius="0.015" height="' + h.toFixed(2) + '" color="' + cor + '" rotation="' + rand(-25,25).toFixed(1) + ' ' + (a*180/Math.PI).toFixed(1) + ' ' + rand(-25,25).toFixed(1) + '" sway-dry="ampl: 6"></a-cylinder>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">' + galhos + '</a-entity>';
  }

  function gerarCapim(x, z, seco) {
    const cor = seco ? pick(['#C8B888', '#B8A878', '#A89870']) : pick(['#8A9A4A', '#7A8A3A', '#A0A860']);
    let html = '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" sway-capim="ampl: 10">';
    for (let i = 0; i < randInt(3, 5); i++) {
      const a = rand(0, Math.PI * 2);
      const h = rand(0.25, 0.55);
      html += '<a-cone position="' + (Math.cos(a)*0.05).toFixed(3) + ' ' + (h/2).toFixed(3) + ' ' + (Math.sin(a)*0.05).toFixed(3) + '" radius-bottom="0.03" radius-top="0.003" height="' + h.toFixed(3) + '" color="' + cor + '" rotation="' + rand(-15,15).toFixed(1) + ' 0 ' + rand(-15,15).toFixed(1) + '"></a-cone>';
    }
    html += '</a-entity>';
    return html;
  }

  function gerarPedra(x, z, t) {
    const r = (t || 1) * rand(0.25, 0.5);
    return '<a-dodecahedron position="' + x.toFixed(2) + ' ' + (r*0.5).toFixed(2) + ' ' + z.toFixed(2) + '" radius="' + r.toFixed(2) + '" color="#8A7A5A" rotation="0 ' + rand(0,360).toFixed(1) + ' 0" scale="1.1 ' + rand(0.5,0.8).toFixed(2) + ' 1.1"></a-dodecahedron>';
  }

  function gerarMandacaru(x, z) {
    const altura = rand(1.5, 2.8);
    const cor = '#3E7A3E';
    let bracos = '';
    for (let i = 0; i < randInt(1, 3); i++) {
      const a = rand(0, Math.PI * 2);
      const bh = altura * rand(0.4, 0.6);
      const dx = Math.cos(a) * 0.35;
      const dz = Math.sin(a) * 0.35;
      bracos += '<a-cylinder position="' + dx.toFixed(2) + ' ' + (bh*0.85).toFixed(2) + ' ' + dz.toFixed(2) + '" radius="0.1" height="' + (bh*0.7).toFixed(2) + '" color="' + cor + '"></a-cylinder>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0">' +
      '<a-cylinder position="0 ' + (altura/2).toFixed(2) + ' 0" radius="0.15" height="' + altura.toFixed(2) + '" color="' + cor + '"></a-cylinder>' +
      bracos +
      '<a-sphere position="0 ' + altura.toFixed(2) + ' 0" radius="0.15" color="' + cor + '"></a-sphere>' +
      '</a-entity>';
  }

  function gerarMataCiliar(x, z) {
    let html = '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">';
    html += '<a-circle position="0 0.02 0" rotation="-90 0 0" radius="2.2" color="#4A90B8" material="shader: standard; opacity: 0.75; transparent: true; emissive: #2A6A90; emissiveIntensity: 0.3"></a-circle>';
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const r = rand(2.8, 3.8);
      html += glb('transicao_arvore_mata.glb', Math.cos(a) * r, Math.sin(a) * r, rand(0,360), 5.0);
    }
    html += '</a-entity>';
    return html;
  }

  /* ============================================================
     MONTAGEM PRINCIPAL
     ============================================================ */
  function montarBiomaTransicaoJaguatirica(animal, opts) {
    opts = opts || {};
    const denso = opts.densidade !== 'baixa';
    const skyTopo = '#5FA8D3', skyBase = '#E8D8B0';

    const skySrc = window.MewBiomas && window.MewBiomas.criarTexturaGradiente
      ? window.MewBiomas.criarTexturaGradiente(skyTopo, skyBase)
      : null;

    let html = skySrc
      ? '<a-sky src="' + skySrc + '" color="' + skyBase + '"></a-sky>'
      : '<a-sky color="' + skyBase + '"></a-sky>';

    /* CHÃO */
    html += '<a-circle position="0 0 0" rotation="-90 0 0" radius="90" color="#B8A880" shadow="receive: true"></a-circle>';
    html += '<a-circle position="-38 0.004 0" rotation="-90 0 0" radius="36" color="#3A5528" shadow="receive: true"></a-circle>';
    html += '<a-circle position="38 0.004 0" rotation="-90 0 0" radius="36" color="#D8C090" shadow="receive: true"></a-circle>';

    /* RODOVIA */
    html += gerarRodovia();

    /* Árvores da MATA */
    const nMata = denso ? 22 : 14;
    for (let i = 0; i < nMata; i++) {
      const along = rand(-32, 32);
      const perp = -rand(9, 30);
      const p = posRodovia(along, perp);
      html += glb('transicao_arvore_mata.glb', p.x, p.z, rand(0,360), 5.5);
    }

    /* Árvores da CAATINGA */
    const nCaatinga = denso ? 22 : 14;
    for (let i = 0; i < nCaatinga; i++) {
      const along = rand(-32, 32);
      const perp = rand(9, 30);
      const p = posRodovia(along, perp);
      html += glb('transicao_arvore_caatinga.glb', p.x, p.z, rand(0,360), 4.5);
    }

    /* Mandacarus */
    const nMandacarus = denso ? 14 : 8;
    for (let i = 0; i < nMandacarus; i++) {
      const along = rand(-30, 30);
      const perp = rand(12, 32);
      const p = posRodovia(along, perp);
      html += gerarMandacaru(p.x, p.z);
    }

    /* Mata ciliar */
    html += gerarMataCiliar(-20, -14);
    html += gerarMataCiliar(-24, 12);
    html += gerarMataCiliar(22, -14);
    html += gerarMataCiliar(26, 10);

    /* Arbustos */
    const nArbustos = denso ? 30 : 18;
    for (let i = 0; i < nArbustos; i++) {
      const along = rand(-35, 35);
      const perp = (Math.random() > 0.5 ? 1 : -1) * rand(7, 32);
      const p = posRodovia(along, perp);
      html += gerarArbusto(p.x, p.z);
    }

    /* Capim */
    const nCapim = denso ? 90 : 50;
    for (let i = 0; i < nCapim; i++) {
      const along = rand(-38, 38);
      const perp = (Math.random() > 0.5 ? 1 : -1) * rand(5.5, 36);
      const p = posRodovia(along, perp);
      html += gerarCapim(p.x, p.z, perp > 0);
    }

    /* Pedras */
    const nPedras = denso ? 16 : 10;
    for (let i = 0; i < nPedras; i++) {
      const along = rand(-35, 35);
      const perp = (Math.random() > 0.5 ? 1 : -1) * rand(6, 30);
      const p = posRodovia(along, perp);
      html += gerarPedra(p.x, p.z, rand(0.6, 1.2));
    }

    /* Placa grande informativa */
    const placaPos = posRodovia(-18, -12);
    html += '<a-entity position="' + placaPos.x.toFixed(2) + ' 0 ' + placaPos.z.toFixed(2) + '" rotation="0 ' + (35 + 90).toFixed(1) + ' 0">' +
      '<a-cylinder position="-0.7 1.0 0" radius="0.05" height="2.0" color="#3A2818"></a-cylinder>' +
      '<a-cylinder position="0.7 1.0 0" radius="0.05" height="2.0" color="#3A2818"></a-cylinder>' +
      '<a-box position="0 2.1 0" width="2.0" height="1.0" depth="0.06" color="#1A4A20"></a-box>' +
      '<a-box position="0 2.1 0.035" width="1.9" height="0.92" depth="0.03" color="#2E6A3E"></a-box>' +
      '<a-text value="BR-232 · PE-145" position="0 2.35 0.06" align="center" color="#F0F8E0" width="2.8" font="mozillavr"></a-text>' +
      '<a-text value="Atravessia de felinos" position="0 2.05 0.06" align="center" color="#A8D8B0" width="2.4" font="mozillavr"></a-text>' +
    '</a-entity>';

    /* HOTSPOTS */
    html += '<a-entity position="0 2.2 6" info-hotspot="titulo: Jaguatirica; categoria: Mamifero; imagem: assets/hotspots/transicao_jaguatirica_animal.jpg; descricao: Leopardus pardalis. Felino solitario, territorial e de habitos noturnos. Pelagem amarelada com ocelas em fileiras. Adapta-se a Mata Atlantica e a Caatinga. Em Pernambuco ocorre em Moreno, Gravata, Santa Cruz do Capibaribe e Brejo da Madre de Deus.; cor: #E8C860"></a-entity>';
    html += '<a-entity position="-8 2.0 -12" info-hotspot="titulo: Rodovia BR-232; categoria: Ameaca; imagem: assets/hotspots/transicao_jaguatirica_rodovia.jpg; descricao: Atravessa o estado e corta fragmentos de mata. Atropelamentos sao uma das principais causas de morte da jaguatirica.; cor: #2A2A2A"></a-entity>';
    html += '<a-entity position="-16 2.5 -10" info-hotspot="titulo: Placa informativa; categoria: Conservacao; imagem: assets/hotspots/transicao_jaguatirica_placa.jpg; descricao: Alerta motoristas sobre a travessia de felinos. Estudos mostram que placas educativas combinadas com redutores de velocidade reduzem atropelamentos em ate 40 porcento.; cor: #F0C830"></a-entity>';
    html += '<a-entity position="-20 2.0 -14" info-hotspot="titulo: Mata ciliar; categoria: Ecologia; imagem: assets/hotspots/transicao_jaguatirica_mataciliar.jpg; descricao: Vegetacao ao longo de rios. Serve de corredor entre fragmentos.; cor: #2E6A30"></a-entity>';
    html += '<a-entity position="14 1.5 -10" info-hotspot="titulo: Caatinga densa; categoria: Bioma; imagem: assets/hotspots/transicao_jaguatirica_caatinga.jpg; descricao: Areas com vegetacao fechada e umida da Caatinga. A jaguatirica caca e se abriga aqui no Agreste e Sertao.; cor: #7A8A4A"></a-entity>';
    html += '<a-entity position="8 1.2 -14" info-hotspot="titulo: Mandacaru; categoria: Planta; imagem: assets/hotspots/transicao_jaguatirica_mandacaru.jpg; descricao: Cereus jamacaru. Cacto simbolo da Caatinga. Marca a transicao entre os biomas no Agreste pernambucano.; cor: #3E7A3E"></a-entity>';
    html += '<a-entity position="0 3.0 -20" info-hotspot="titulo: Zona de transicao; categoria: Bioma; imagem: assets/hotspots/transicao_jaguatirica_zona.jpg; descricao: Encontro entre Mata Atlantica e Caatinga. A jaguatirica e o felino mais adaptavel do Brasil.; cor: #B89A60"></a-entity>';
    html += '<a-entity position="-14 1.5 8" info-hotspot="titulo: Fragmentacao; categoria: Ameaca; imagem: assets/hotspots/transicao_jaguatirica_fragmentacao.jpg; descricao: Estradas e cidades dividem a mata em ilhas. Populacoes isoladas tem menos diversidade genetica e maior risco de extincao local.; cor: #E8482A"></a-entity>';
    html += '<a-entity position="10 0.9 10" info-hotspot="titulo: Caminhao; categoria: Ameaca; imagem: assets/hotspots/transicao_jaguatirica_caminhao.jpg; descricao: Trafego pesado nas rodovias pernambucanas e a maior ameaca direta aos felinos. Reducao de velocidade e passagens de fauna sao essenciais.; cor: #3A5A80"></a-entity>';

    /* Iluminação */
    html += '<a-entity light="type: ambient; color: #E8E0D0; intensity: 0.8"></a-entity>' +
            '<a-entity position="8 14 4" light="type: directional; color: #FFF4D0; intensity: 1.1; castShadow: true; shadowMapWidth: 2048; shadowMapHeight: 2048"></a-entity>' +
            '<a-entity position="-6 6 -3" light="type: point; color: #FFE8B8; intensity: 0.3; distance: 12"></a-entity>';

    return { html, bioma: { nome: 'Transição Mata Atlântica ↔ Caatinga', skyTopo, skyBase, fog: '#D8C8A8', fogDensity: 0.012 } };
  }

  if (!window.MewBiomas) { console.warn('[bioma_transicao_jaguatirica] biomas_fauna.js ausente.'); return; }

  const _detectar = window.MewBiomas.detectarBioma;
  window.MewBiomas.detectarBioma = function (animal) {
    const nome = (animal.nome_popular || '').toLowerCase();
    if (nome.indexOf('jaguatirica') !== -1) return 'transicaoJaguatirica';
    return _detectar.call(this, animal);
  };

  const _montar = window.MewBiomas.montarCena3D;
  window.MewBiomas.montarCena3D = function (animal, opts) {
    const chave = window.MewBiomas.detectarBioma(animal);
    if (chave === 'transicaoJaguatirica') return montarBiomaTransicaoJaguatirica(animal, opts);
    return _montar.call(this, animal, opts);
  };

  window.MewBiomas.montarBiomaTransicaoJaguatirica = montarBiomaTransicaoJaguatirica;
  console.log('[bioma_transicao_jaguatirica] v5 — LOD + qualidade registrado.');
})();