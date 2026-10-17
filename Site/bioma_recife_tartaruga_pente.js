/* =========================================================
   bioma_recife_tartaruga_pente.js — v3 (LOD + qualidade)
   RECIFE DE CORAIS RASO — Tartaruga-de-pente (Eretmochelys imbricata)
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

  function gerarAnemona(x, z, cor) {
    const base = rand(0.1, 0.16);
    let html = '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">';
    html += '<a-cylinder position="0 0.04 0" radius="' + base.toFixed(3) + '" height="0.08" color="#A04060"></a-cylinder>';
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const dx = Math.cos(a) * base * 0.8;
      const dz = Math.sin(a) * base * 0.8;
      const h = rand(0.15, 0.25);
      html += '<a-cylinder position="' + dx.toFixed(3) + ' ' + (h/2 + 0.06).toFixed(3) + ' ' + dz.toFixed(3) + '" radius="0.013" height="' + h.toFixed(3) + '" color="' + cor + '" rotation="' + rand(15,30).toFixed(1) + ' ' + (a*180/Math.PI).toFixed(1) + ' 0"></a-cylinder>';
    }
    html += '</a-entity>';
    return html;
  }

  function gerarPeixeRecife(x, y, z, cor, tam) {
    const t = (tam || 1) * rand(0.8, 1.3);
    const dur = randInt(6000, 11000);
    const dist = rand(3, 6);
    const dir = Math.random() > 0.5 ? 1 : -1;
    return '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '" animation="property: position; from: ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '; to: ' + (x+dist*dir).toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '; dur: ' + dur + '; dir: alternate; loop: true; easing: easeInOutSine">' +
      '<a-sphere radius="' + (0.055*t).toFixed(3) + '" color="' + cor + '" scale="1.7 1 0.5" material="shader: standard; emissive: ' + cor + '; emissiveIntensity: 0.15"></a-sphere>' +
      '<a-cone position="' + (0.09*t).toFixed(3) + ' 0 0" rotation="0 0 -90" radius-bottom="' + (0.05*t).toFixed(3) + '" radius-top="0" height="' + (0.09*t).toFixed(3) + '" color="' + cor + '"></a-cone>' +
      '<a-sphere position="' + (0.02*t).toFixed(3) + ' ' + (0.012*t).toFixed(3) + ' ' + (0.045*t).toFixed(3) + '" radius="' + (0.015*t).toFixed(3) + '" color="#1A1A1A"></a-sphere>' +
      '<a-sphere position="' + (0.02*t).toFixed(3) + ' ' + (0.012*t).toFixed(3) + ' ' + (-0.045*t).toFixed(3) + '" radius="' + (0.015*t).toFixed(3) + '" color="#1A1A1A"></a-sphere>' +
      '</a-entity>';
  }

  function gerarCardume(cx, cy, cz, corBase, qtd) {
    let html = '<a-entity position="' + cx.toFixed(2) + ' ' + cy.toFixed(2) + ' ' + cz.toFixed(2) + '">';
    const n = qtd || randInt(6, 10);
    for (let i = 0; i < n; i++) {
      html += gerarPeixeRecife(rand(-0.8, 0.8), rand(-0.3, 0.3), rand(-0.8, 0.8), Math.random() > 0.6 ? '#FFD166' : corBase, 0.7);
    }
    html += '</a-entity>';
    return html;
  }

  function gerarNemo(x, y, z) {
    return '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '" bobber="amp: 0.05; dur: 3000">' +
      '<a-sphere radius="0.05" color="#F07020" scale="1.5 1 0.6"></a-sphere>' +
      '<a-box position="0.02 0 0" width="0.02" height="0.08" depth="0.08" color="#F0F0F0"></a-box>' +
      '<a-sphere position="0.07 0 0" radius="0.02" color="#F07020"></a-sphere>' +
      '</a-entity>';
  }

  function gerarEstrela(x, z, cor) {
    const r = rand(0.1, 0.16);
    let bracos = '';
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const dx = Math.cos(a) * r * 0.9;
      const dz = Math.sin(a) * r * 0.9;
      bracos += '<a-cone position="' + dx.toFixed(3) + ' 0.02 ' + dz.toFixed(3) + '" radius-bottom="' + (r*0.35).toFixed(3) + '" radius-top="0.005" height="' + (r*1.1).toFixed(3) + '" color="' + cor + '" rotation="90 ' + (a*180/Math.PI).toFixed(1) + ' 0"></a-cone>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0"><a-cylinder position="0 0.02 0" radius="' + (r*0.55).toFixed(3) + '" height="0.04" color="' + cor + '"></a-cylinder>' + bracos + '</a-entity>';
  }

  function gerarBolha(x, y0, z, y1) {
    const dur = randInt(4000, 8000);
    const r = rand(0.03, 0.07);
    return '<a-sphere position="' + x.toFixed(2) + ' ' + y0.toFixed(2) + ' ' + z.toFixed(2) + '" radius="' + r.toFixed(3) + '" color="#E0F8FF" material="shader: standard; opacity: 0.4; transparent: true; emissive: #B0E8F5; emissiveIntensity: 0.6" animation="property: position; from: ' + x.toFixed(2) + ' ' + y0.toFixed(2) + ' ' + z.toFixed(2) + '; to: ' + x.toFixed(2) + ' ' + y1.toFixed(2) + ' ' + z.toFixed(2) + '; dur: ' + dur + '; loop: true; easing: linear"></a-sphere>';
  }

  function gerarRaioSol(x, z, alt, r) {
    return '<a-cone position="' + x.toFixed(2) + ' ' + (alt/2 + 1).toFixed(2) + ' ' + z.toFixed(2) + '" radius-bottom="' + r.toFixed(2) + '" radius-top="' + (r*0.3).toFixed(2) + '" height="' + alt.toFixed(2) + '" color="#FFF8E0" material="shader: flat; opacity: 0.10; transparent: true; side: double"></a-cone>';
  }

  function gerarPedra(x, z, t) {
    const r = (t || 1) * rand(0.25, 0.5);
    return '<a-dodecahedron position="' + x.toFixed(2) + ' ' + (r*0.6).toFixed(2) + ' ' + z.toFixed(2) + '" radius="' + r.toFixed(2) + '" color="#6A6A5E" rotation="0 ' + rand(0,360).toFixed(1) + ' 0" scale="1 ' + rand(0.55,0.9).toFixed(2) + ' 1"></a-dodecahedron>';
  }

  function montarBiomaRecifeTartarugaPente(animal, opts) {
    opts = opts || {};
    const denso = opts.densidade !== 'baixa';
    const skyTopo = '#40C8E8', skyBase = '#C8F5FF', areia = '#F0E8C0';

    const skySrc = window.MewBiomas && window.MewBiomas.criarTexturaGradiente
      ? window.MewBiomas.criarTexturaGradiente(skyTopo, skyBase)
      : null;

    let html = skySrc
      ? '<a-sky src="' + skySrc + '" color="' + skyBase + '"></a-sky>'
      : '<a-sky color="' + skyBase + '"></a-sky>';

    html += '<a-circle position="0 0 0" rotation="-90 0 0" radius="90" color="' + areia + '" shadow="receive: true"></a-circle>';
    for (let i = 0; i < (denso ? 15 : 8); i++) {
      const p = pos(2, 40);
      html += '<a-circle position="' + p.x.toFixed(2) + ' 0.005 ' + p.z.toFixed(2) + '" rotation="-90 0 0" radius="' + rand(2,4.5).toFixed(2) + '" color="#D8C898" opacity="0.6" transparent="true"></a-circle>';
    }

    /* Superfície da água */
    html += '<a-circle position="0 2.5 0" rotation="-90 0 0" radius="90" color="#40C8E8" opacity="0.22" transparent="true"></a-circle>';
    html += '<a-circle position="0 2.52 0" rotation="-90 0 0" radius="90" color="#A8E8F5" opacity="0.08" transparent="true"></a-circle>';

    /* Raios de sol */
    for (let i = 0; i < (denso ? 8 : 4); i++) {
      const p = pos(3, 18);
      html += gerarRaioSol(p.x, p.z, rand(5, 7), rand(1.0, 2.0));
    }

    /* Esponjas */
    const nEspBarril = denso ? 14 : 8;
    for (let i = 0; i < nEspBarril; i++) {
      const p = pos(3, 20);
      html += glb('recife_esponja_barril.glb', p.x, p.z, rand(0,360), 1.2);
    }
    const nEspTubo = denso ? 14 : 8;
    for (let i = 0; i < nEspTubo; i++) {
      const p = pos(3, 20);
      html += glb('recife_esponja_tubo.glb', p.x, p.z, rand(0,360), 1.2);
    }
    for (let i = 0; i < (denso ? 10 : 5); i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(0, 2.5);
      const src = Math.random() > 0.5 ? 'recife_esponja_barril.glb' : 'recife_esponja_tubo.glb';
      html += glb(src, -4 + Math.cos(a)*r, -4 + Math.sin(a)*r, rand(0,360), 1.2);
    }

    /* Corais */
    const nCoralRamo = denso ? 12 : 7;
    for (let i = 0; i < nCoralRamo; i++) {
      const p = pos(4, 22);
      html += glb('recife_coral_remo.glb', p.x, p.z, rand(0,360), 1.0);
    }
    const nCoralLeque = denso ? 12 : 7;
    for (let i = 0; i < nCoralLeque; i++) {
      const p = pos(4, 22);
      html += glb('recife_coral_leque.glb', p.x, p.z, rand(0,360), 1.5);
    }
    const nCoralCerebro = denso ? 12 : 7;
    for (let i = 0; i < nCoralCerebro; i++) {
      const p = pos(4, 22);
      html += glb('recife_coral_cerebro.glb', p.x, p.z, rand(0,360), 1.0);
    }
    for (let i = 0; i < (denso ? 15 : 8); i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(0, 3);
      const srcs = ['recife_coral_remo.glb', 'recife_coral_leque.glb', 'recife_coral_cerebro.glb'];
      html += glb(pick(srcs), 5 + Math.cos(a)*r, -5 + Math.sin(a)*r, rand(0,360), 1.0);
    }

    /* Anêmonas */
    const coresAne = ['#FFB6C1', '#FF9AA2', '#E8B4D8', '#FFC0CB', '#F0A0E0'];
    for (let i = 0; i < (denso ? 16 : 9); i++) {
      const p = pos(4, 16);
      html += gerarAnemona(p.x, p.z, pick(coresAne));
    }

    /* Pedras */
    for (let i = 0; i < (denso ? 12 : 7); i++) {
      const p = pos(3, 22);
      html += gerarPedra(p.x, p.z, rand(0.8, 1.6));
    }

    /* Estrelas */
    const coresEstrela = ['#FF8C69', '#FF6B9D', '#FFD700', '#E8A87C', '#F0A8D8'];
    for (let i = 0; i < (denso ? 18 : 10); i++) {
      const p = pos(2, 20);
      html += gerarEstrela(p.x, p.z, pick(coresEstrela));
    }

    /* Peixes */
    const coresPeixes = ['#FFD166', '#FF8C42', '#7ED9E5', '#F7A072', '#E0BBE4', '#FFB347', '#F0A8D8'];
    for (let i = 0; i < (denso ? 22 : 12); i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(2, 12);
      html += gerarPeixeRecife(Math.cos(a)*r, rand(0.4, 2.2), Math.sin(a)*r, pick(coresPeixes), rand(0.8, 1.3));
    }
    for (let i = 0; i < (denso ? 5 : 3); i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(4, 13);
      html += gerarCardume(Math.cos(a)*r, rand(0.8, 2.2), Math.sin(a)*r, pick(coresPeixes), randInt(6, 10));
    }

    /* Nemos */
    for (let i = 0; i < (denso ? 8 : 4); i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(2, 8);
      html += gerarNemo(Math.cos(a)*r, rand(0.4, 1.2), Math.sin(a)*r);
    }

    /* Bolhas */
    for (let i = 0; i < (denso ? 30 : 18); i++) {
      const p = pos(0, 15);
      html += gerarBolha(p.x, rand(0.1, 0.6), p.z, rand(2.2, 2.6));
    }

    /* HOTSPOTS */
    html += '<a-entity position="0 1.8 2.5" info-hotspot="titulo: Tartaruga-de-pente; categoria: Reptil; imagem: assets/hotspots/recife_pente_animal.jpg; descricao: Eretmochelys imbricata. Carapaca em mosaico marrom e ambar. Bico estreito em forma de gancho, adaptado para retirar esponjas das fendas do recife. Criticamente em Perigo segundo a IUCN, e Em Perigo no Brasil.; cor: #FFA07A"></a-entity>';
    html += '<a-entity position="-4 0.9 -4" info-hotspot="titulo: Esponjas gigantes; categoria: Ecologia; imagem: assets/hotspots/recife_pente_esponjas.jpg; descricao: Principal alimento da tartaruga-de-pente. Esponjas-do-mar competem por espaco com os corais, e ao controla-las a tartaruga ajuda a manter o recife saudavel.; cor: #FF6B9D"></a-entity>';
    html += '<a-entity position="5 1.0 -5" info-hotspot="titulo: Recife de corais; categoria: Ecologia; imagem: assets/hotspots/recife_pente_corais.jpg; descricao: Bercario de peixes e invertebrados. Habitat critico para a tartaruga-de-pente, ameacado por branqueamento e poluicao.; cor: #FFD700"></a-entity>';
    html += '<a-entity position="-6 0.8 3" info-hotspot="titulo: Anemona; categoria: Ecologia; imagem: assets/hotspots/recife_pente_anemona.jpg; descricao: Animal urticante que vive em simbiose com peixes-palhaco. Invertebrados do recife sustentam toda a cadeia alimentar.; cor: #FFB6C1"></a-entity>';
    html += '<a-entity position="4 1.5 -3" info-hotspot="titulo: Peixes de recife; categoria: Ecologia; imagem: assets/hotspots/recife_pente_peixes.jpg; descricao: Ricos em cores e especies. Muitos limpam a carapaca da tartaruga-de-pente, removendo parasitas.; cor: #FFD166"></a-entity>';
    html += '<a-entity position="-3 1.2 5" info-hotspot="titulo: Estrela-do-mar; categoria: Ecologia; imagem: assets/hotspots/recife_pente_estrela.jpg; descricao: Predadora de moluscos e detritivora. Sinaliza recifes saudaveis e desaparece em areas poluidas.; cor: #FF8C69"></a-entity>';
    html += '<a-entity position="0 2.4 -8" info-hotspot="titulo: Aguas rasas; categoria: Habitat; imagem: assets/hotspots/recife_pente_aguasrasas.jpg; descricao: A tartaruga-de-pente forrageia em recifes rasos ate cerca de 20 m de profundidade. Diferente da tartaruga-de-couro, que vive em alto-mar.; cor: #40C8E8"></a-entity>';
    html += '<a-entity position="-7 0.7 -6" info-hotspot="titulo: Ameacas; categoria: Conservacao; imagem: assets/hotspots/recife_pente_ameacas.jpg; descricao: Pesca acidental em redes, poluicao por plastico, ocupacao costeira e coleta ilegal de ovos ameacam a tartaruga-de-pente.; cor: #E8482A"></a-entity>';

    /* Iluminação */
    html += '<a-entity light="type: ambient; color: #E0F8FF; intensity: 0.9"></a-entity>' +
            '<a-entity position="8 14 6" light="type: directional; color: #FFF8E0; intensity: 1.15; castShadow: true; shadowMapWidth: 2048; shadowMapHeight: 2048"></a-entity>' +
            '<a-entity position="-6 6 -3" light="type: point; color: #C8F0FF; intensity: 0.5; distance: 15"></a-entity>' +
            '<a-entity position="6 4 5" light="type: point; color: #E0FFF0; intensity: 0.35; distance: 12"></a-entity>';

    return { html, bioma: { nome: 'Recife de Corais (águas rasas)', skyTopo, skyBase, fog: '#B8E8F0', fogDensity: 0.016 } };
  }

  if (!window.MewBiomas) { console.warn('[bioma_recife_tartaruga_pente] biomas_fauna.js ausente.'); return; }

  const _detectar = window.MewBiomas.detectarBioma;
  window.MewBiomas.detectarBioma = function (animal) {
    const nome = (animal.nome_popular || '').toLowerCase();
    if (nome.indexOf('tartaruga-de-pente') !== -1 || nome.indexOf('tartaruga de pente') !== -1) {
      return 'recifeTartarugaPente';
    }
    return _detectar.call(this, animal);
  };

  const _montar = window.MewBiomas.montarCena3D;
  window.MewBiomas.montarCena3D = function (animal, opts) {
    const chave = window.MewBiomas.detectarBioma(animal);
    if (chave === 'recifeTartarugaPente') return montarBiomaRecifeTartarugaPente(animal, opts);
    return _montar.call(this, animal, opts);
  };

  window.MewBiomas.montarBiomaRecifeTartarugaPente = montarBiomaRecifeTartarugaPente;
  console.log('[bioma_recife_tartaruga_pente] v3 — LOD + qualidade registrado.');
})();