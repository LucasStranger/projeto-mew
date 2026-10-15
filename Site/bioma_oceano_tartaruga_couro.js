/* =========================================================
   bioma_oceano_tartaruga_couro.js — v2 (com GLBs)
   ALTO-MAR PELÁGICO — Tartaruga-de-couro (Dermochelys coriacea)
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

  function gerarRede(x, y, z) {
    let html = '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '" animation="property: position; from: ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '; to: ' + (x+3).toFixed(2) + ' ' + (y+0.2).toFixed(2) + ' ' + z.toFixed(2) + '; dur: 14000; loop: true; easing: easeInOutSine">';
    const linhas = 6, cols = 6, esp = 0.25;
    for (let i = 0; i < cols; i++) {
      html += '<a-cylinder position="' + (i*esp - cols*esp/2).toFixed(2) + ' 0 0" radius="0.008" height="' + (linhas*esp).toFixed(2) + '" color="#B0B0A0" material="shader: flat; opacity: 0.6; transparent: true"></a-cylinder>';
    }
    for (let i = 0; i < linhas; i++) {
      html += '<a-cylinder position="0 ' + (i*esp - linhas*esp/2).toFixed(2) + ' 0" rotation="0 0 90" radius="0.008" height="' + (cols*esp).toFixed(2) + '" color="#B0B0A0" material="shader: flat; opacity: 0.6; transparent: true"></a-cylinder>';
    }
    for (let i = 0; i < 3; i++) {
      html += '<a-sphere position="' + rand(-0.6, 0.6).toFixed(2) + ' ' + rand(-0.6, 0.6).toFixed(2) + ' 0.15" radius="0.06" color="#F0A020"></a-sphere>';
    }
    html += '</a-entity>';
    return html;
  }

  function gerarPeixePelagico(x, y, z, cor, tam) {
    const t = (tam || 1) * rand(0.8, 1.2);
    const dur = randInt(8000, 14000);
    const dist = rand(4, 8);
    const dir = Math.random() > 0.5 ? 1 : -1;
    return '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '" animation="property: position; from: ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '; to: ' + (x+dist*dir).toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '; dur: ' + dur + '; dir: alternate; loop: true; easing: easeInOutSine">' +
      '<a-sphere radius="' + (0.05*t).toFixed(3) + '" color="' + cor + '" scale="2.0 0.9 0.5"></a-sphere>' +
      '<a-cone position="' + (0.1*t).toFixed(3) + ' 0 0" rotation="0 0 -90" radius-bottom="' + (0.05*t).toFixed(3) + '" radius-top="0" height="' + (0.1*t).toFixed(3) + '" color="' + cor + '"></a-cone>' +
      '</a-entity>';
  }

  function gerarCardumePelagico(cx, cy, cz, cor, qtd) {
    let html = '<a-entity position="' + cx.toFixed(2) + ' ' + cy.toFixed(2) + ' ' + cz.toFixed(2) + '">';
    for (let i = 0; i < (qtd || randInt(8, 12)); i++) {
      html += gerarPeixePelagico(rand(-1.2, 1.2), rand(-0.5, 0.5), rand(-1.2, 1.2), cor, 0.7);
    }
    html += '</a-entity>';
    return html;
  }

  function gerarBolha(x, y0, z, y1) {
    const dur = randInt(5000, 10000);
    const r = rand(0.03, 0.08);
    return '<a-sphere position="' + x.toFixed(2) + ' ' + y0.toFixed(2) + ' ' + z.toFixed(2) + '" radius="' + r.toFixed(3) + '" color="#E0F8FF" material="shader: standard; opacity: 0.35; transparent: true; emissive: #B0E8F5; emissiveIntensity: 0.5" animation="property: position; from: ' + x.toFixed(2) + ' ' + y0.toFixed(2) + ' ' + z.toFixed(2) + '; to: ' + x.toFixed(2) + ' ' + y1.toFixed(2) + ' ' + z.toFixed(2) + '; dur: ' + dur + '; loop: true; easing: linear"></a-sphere>';
  }

  function gerarRaioSol(x, z, alt, r) {
    return '<a-cone position="' + x.toFixed(2) + ' ' + (alt/2 + 3).toFixed(2) + ' ' + z.toFixed(2) + '" radius-bottom="' + r.toFixed(2) + '" radius-top="' + (r*0.4).toFixed(2) + '" height="' + alt.toFixed(2) + '" color="#A0D8F0" material="shader: flat; opacity: 0.06; transparent: true; side: double"></a-cone>';
  }

  function montarBiomaOceanoTartarugaCouro(animal, opts) {
    opts = opts || {};
    const denso = opts.densidade !== 'baixa';
    const skyTopo = '#2A5A80', skyBase = '#8AC0D8';

    const skySrc = window.MewBiomas && window.MewBiomas.criarTexturaGradiente
      ? window.MewBiomas.criarTexturaGradiente(skyTopo, skyBase)
      : null;

    let html = skySrc
      ? '<a-sky src="' + skySrc + '" color="' + skyBase + '"></a-sky>'
      : '<a-sky color="' + skyBase + '"></a-sky>';

    /* Água profunda */
    html += '<a-circle position="0 -3 0" rotation="-90 0 0" radius="90" color="#0A2A5A" shadow="receive: true"></a-circle>';
    html += '<a-circle position="0 -2.5 0" rotation="-90 0 0" radius="90" color="#123A6A" opacity="0.75" transparent="true"></a-circle>';

    /* Superfície */
    html += '<a-circle position="0 3.0 0" rotation="-90 0 0" radius="90" color="#4A90B8" opacity="0.4" transparent="true"></a-circle>';
    html += '<a-circle position="0 3.02 0" rotation="-90 0 0" radius="90" color="#A8D8F0" opacity="0.12" transparent="true"></a-circle>';

    /* Manchas de horizonte */
    for (let i = 0; i < (denso ? 12 : 6); i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(20, 40);
      html += '<a-circle position="' + (Math.cos(a)*r).toFixed(2) + ' 2.99 ' + (Math.sin(a)*r).toFixed(2) + '" rotation="-90 0 0" radius="' + rand(2,4).toFixed(2) + '" color="#A8D8F0" opacity="0.35" transparent="true"></a-circle>';
    }

    /* Raios de sol */
    for (let i = 0; i < (denso ? 8 : 4); i++) {
      const p = pos(3, 18);
      html += gerarRaioSol(p.x, p.z, rand(6, 9), rand(1.2, 2.2));
    }

    /* ============================================================
       GLBs — ÁGUAS-VIVAS (alimento principal)
       ============================================================ */
    const nAguaPink = denso ? 20 : 12;
    for (let i = 0; i < nAguaPink; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(4, 18);
      const y = rand(0.2, 3.5);
      html += glb('oceano_agua_viva_pink.glb', Math.cos(a)*r, Math.sin(a)*r, rand(0,360), 1.0, y);
    }
    const nAguaBlue = denso ? 20 : 12;
    for (let i = 0; i < nAguaBlue; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(4, 18);
      const y = rand(0.2, 3.5);
      html += glb('oceano_agua_viva_blue.glb', Math.cos(a)*r, Math.sin(a)*r, rand(0,360), 1.0, y);
    }
    /* Cardume de águas-vivas */
    for (let i = 0; i < (denso ? 12 : 6); i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(0, 2.5);
      const y = rand(0.5, 2.5);
      const src = Math.random() > 0.5 ? 'oceano_agua_viva_pink.glb' : 'oceano_agua_viva_blue.glb';
      html += glb(src, -10 + Math.cos(a)*r, -9 + Math.sin(a)*r, rand(0,360), 1.0, y);
    }

    /* ============================================================
       GLBs — Sacolas plásticas (ameaça)
       ============================================================ */
        /* SACOLAS PLÁSTICAS (poucas, espalhadas longe) */
    const nSacolas = denso ? 4 : 2;
    for (let i = 0; i < nSacolas; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(10, 18);
      const y = rand(0.8, 3.0);
      html += glb('oceano_sacola.glb', Math.cos(a)*r, Math.sin(a)*r, rand(0,360), 0.4, y);
    }

    /* ============================================================
       GLBs — Barcos pesqueiros
       ============================================================ */
    html += glb('oceano_barco.glb', -18, 15, rand(0,360), 1.0, 2.9);
    html += glb('oceano_barco.glb', 22, -12, rand(0,360), 1.0, 2.9);
    if (denso) html += glb('oceano_barco.glb', -25, -8, rand(0,360), 1.0, 2.9);

    /* ============================================================
       Procedurais de volume
       ============================================================ */

    /* REDES DE PESCA (procedural, mais leves) */
    html += gerarRede(-7, 1.2, -6);
    html += gerarRede(8, 2.0, 4);
    if (denso) html += gerarRede(2, 0.8, -9);

    /* Peixes pelágicos */
    const coresPeixes = ['#4A7A90', '#6A9AA8', '#3A5A78', '#8AC0D8'];
    for (let i = 0; i < (denso ? 18 : 10); i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(3, 14);
      html += gerarPeixePelagico(Math.cos(a)*r, rand(0.4, 2.8), Math.sin(a)*r, pick(coresPeixes), rand(0.9, 1.4));
    }
    for (let i = 0; i < (denso ? 4 : 2); i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(6, 16);
      html += gerarCardumePelagico(Math.cos(a)*r, rand(0.8, 2.5), Math.sin(a)*r, pick(coresPeixes), randInt(8, 12));
    }

    /* Bolhas */
    for (let i = 0; i < (denso ? 40 : 24); i++) {
      const p = pos(0, 18);
      html += gerarBolha(p.x, rand(-2.5, 0.5), p.z, rand(2.6, 3.0));
    }

    /* Hotspots */
        /* ============================================================
       HOTSPOTS — v2 (categoria + descrição + imagem)
       ============================================================ */
    html += '<a-entity position="0 2.0 3.5" info-hotspot="' +
      'titulo: Tartaruga-de-couro; ' +
      'categoria: Reptil; ' +
      'imagem: assets/hotspots/oceano_couro_animal.jpg; ' +
      'descricao: Dermochelys coriacea. Maior tartaruga do mundo, pode medir 2 m e pesar 700 kg. Mergulha ate 1.200 m para caca aguas-vivas. Carapaca coriacea, sem placas rigidas. Criticamente em Perigo globalmente e Vulneravel no Brasil.; ' +
      'cor: #4A7A90"></a-entity>';

    html += '<a-entity position="-6 2.0 -5" info-hotspot="' +
      'titulo: Aguas-vivas; ' +
      'categoria: Ecologia; ' +
      'imagem: assets/hotspots/oceano_couro_aguaviva.jpg; ' +
      'descricao: Alimento principal da tartaruga-de-couro. Sua boca sem dentes e adaptada para engolir medusas inteiras. Papilas queratinizadas no esofago impedem que as presas escorregadias voltem para fora quando ela expulsa a agua ingerida.; ' +
      'cor: #F0C8F0"></a-entity>';

    html += '<a-entity position="6 1.8 4" info-hotspot="' +
      'titulo: Sacola plastica; ' +
      'categoria: Ameaca; ' +
      'imagem: assets/hotspots/oceano_couro_sacola.jpg; ' +
      'descricao: A maior ameaca a tartaruga-de-couro. Flutuando, sacolas plasticas parecem aguas-vivas. A tartaruga come e morre por obstrucao intestinal. Estima-se que mais de 1 milhao de animais marinhos morrem por plastico a cada ano.; ' +
      'cor: #F8F8F0"></a-entity>';

    html += '<a-entity position="-7 1.5 -6" info-hotspot="' +
      'titulo: Rede de pesca; ' +
      'categoria: Ameaca; ' +
      'imagem: assets/hotspots/oceano_couro_rede.jpg; ' +
      'descricao: Captura acidental em redes de deriva mata milhares de tartarugas por ano no Atlantico. O espinhel pelagico e as redes de emalhe sao as artes que mais matam tartarugas-de-couro, que engancham as nadadeiras longas ou engolem o anzol.; ' +
      'cor: #B0B0A0"></a-entity>';

    html += '<a-entity position="18 3.2 15" info-hotspot="' +
      'titulo: Barco pesqueiro; ' +
      'categoria: Ameaca; ' +
      'imagem: assets/hotspots/oceano_couro_barco.jpg; ' +
      'descricao: Frota industrial e artesanal divide o oceano com a tartaruga-de-couro. Fiscalizacao e uso de dispositivos como o TED sao essenciais para reduzir a mortalidade. O Brasil tem legislacao, mas a fiscalizacao ainda e um desafio.; ' +
      'cor: #3A2818"></a-entity>';

    html += '<a-entity position="4 2.2 -8" info-hotspot="' +
      'titulo: Peixes pelagicos; ' +
      'categoria: Ecologia; ' +
      'imagem: assets/hotspots/oceano_couro_peixes.jpg; ' +
      'descricao: Pequenos cardumes vivem na zona pelagica. Sustentam atuns, tubaroes e aves marinhas. Fazem parte da mesma teia trofica que a tartaruga-de-couro, que ocupa o topo como predador de medusas.; ' +
      'cor: #4A7A90"></a-entity>';

    html += '<a-entity position="-4 3.0 -10" info-hotspot="' +
      'titulo: Alto-mar pelagico; ' +
      'categoria: Habitat; ' +
      'imagem: assets/hotspots/oceano_couro_altomar.jpg; ' +
      'descricao: Zona oceanica aberta, longe da costa. A tartaruga-de-couro passa a maior parte da vida aqui, migrando milhares de quilometros entre areas de alimentacao e reproducao. Uma das especies mais migratorias do planeta.; ' +
      'cor: #2A5A80"></a-entity>';

    html += '<a-entity position="0 3.5 -14" info-hotspot="' +
      'titulo: Desova no litoral; ' +
      'categoria: Conservacao; ' +
      'imagem: assets/hotspots/oceano_couro_desova.jpg; ' +
      'descricao: No Brasil, a especie desova principalmente no Espirito Santo, com registros ocasionais em Pernambuco. A femea volta a praia a cada 2 ou 3 anos para botar cerca de 100 ovos. Apenas 1 em cada 1.000 filhotes chega a fase adulta.; ' +
      'cor: #C8B080"></a-entity>';

    html += '<a-entity position="-10 1.5 8" info-hotspot="' +
      'titulo: Mergulho profundo; ' +
      'categoria: Ecologia; ' +
      'imagem: assets/hotspots/oceano_couro_mergulho.jpg; ' +
      'descricao: Suporta pressao de mais de 120 atmosferas. Adaptacoes unicas permitem colapso pulmonar controlado e bradicardia extrema durante mergulhos de ate 1.200 m. Pode ficar mais de 1 hora submersa sem respirar.; ' +
      'cor: #0A2A5A"></a-entity>';
    /* Iluminação */
    html += '<a-entity light="type: ambient; color: #6A90B8; intensity: 0.6"></a-entity>' +
            '<a-entity position="6 18 6" light="type: directional; color: #C8E8F8; intensity: 0.9; castShadow: true; shadowMapWidth: 1024; shadowMapHeight: 1024"></a-entity>' +
            '<a-entity position="-4 5 -4" light="type: point; color: #5A9AC8; intensity: 0.35; distance: 14"></a-entity>' +
            '<a-entity position="2 2 -8" light="type: point; color: #3A6A98; intensity: 0.3; distance: 10"></a-entity>';

    return { html, bioma: { nome: 'Oceano Aberto (Pelágico)', skyTopo, skyBase, fog: '#2A5A80', fogDensity: 0.045 } };
  }

  if (!window.MewBiomas) { console.warn('[bioma_oceano_tartaruga_couro] biomas_fauna.js ausente.'); return; }

  const _detectar = window.MewBiomas.detectarBioma;
  window.MewBiomas.detectarBioma = function (animal) {
    const nome = (animal.nome_popular || '').toLowerCase();
    if (nome.indexOf('tartaruga-de-couro') !== -1 || nome.indexOf('tartaruga de couro') !== -1) {
      return 'oceanoTartarugaCouro';
    }
    return _detectar.call(this, animal);
  };

  const _montar = window.MewBiomas.montarCena3D;
  window.MewBiomas.montarCena3D = function (animal, opts) {
    const chave = window.MewBiomas.detectarBioma(animal);
    if (chave === 'oceanoTartarugaCouro') return montarBiomaOceanoTartarugaCouro(animal, opts);
    return _montar.call(this, animal, opts);
  };

  window.MewBiomas.montarBiomaOceanoTartarugaCouro = montarBiomaOceanoTartarugaCouro;
  console.log('[bioma_oceano_tartaruga_couro] v2 — Oceano (Tartaruga-de-couro) com GLBs registrado.');
})();