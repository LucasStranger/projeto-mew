/* =========================================================
   bioma_mata_limpafolha.js — v2 (com GLBs)
   Mata Atlântica de Altitude — Limpa-folha-do-nordeste
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

  function gerarSamambaia(x, z) {
    const h = rand(0.5, 1.0);
    const cor = pick(['#1E5A22', '#2A6A28', '#164A18', '#3A7A32']);
    let folhas = '';
    for (let i = 0; i < randInt(7, 10); i++) {
      const a = (i / 10) * Math.PI * 2;
      const comp = h * rand(0.7, 1.3);
      folhas += '<a-plane position="' + (Math.cos(a) * comp * 0.3).toFixed(2) + ' ' + (comp*0.35).toFixed(2) + ' ' + (Math.sin(a) * comp * 0.3).toFixed(2) + '" width="' + (comp*0.95).toFixed(2) + '" height="0.08" color="' + cor + '" material="shader: flat; side: double" rotation="' + rand(40,70).toFixed(1) + ' ' + (a*180/Math.PI).toFixed(1) + ' 0" sway-leaf="ampl: 3"></a-plane>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">' + folhas + '</a-entity>';
  }

  function gerarFolhico(x, z) {
    const cor = pick(['#5A3A20', '#8A5A28', '#6A4A28', '#3A2818', '#A86A28']);
    const w = rand(0.12, 0.24);
    const h = rand(0.08, 0.16);
    return '<a-plane position="' + x.toFixed(2) + ' 0.014 ' + z.toFixed(2) + '" width="' + w.toFixed(2) + '" height="' + h.toFixed(2) + '" color="' + cor + '" material="shader: flat; side: double; opacity: 0.95; transparent: true" rotation="-90 ' + rand(0,360).toFixed(1) + ' 0"></a-plane>';
  }

  function gerarRaioCopa(x, z, alt, r) {
    return '<a-cone position="' + x.toFixed(2) + ' ' + (alt/2 + 2).toFixed(2) + ' ' + z.toFixed(2) + '" radius-bottom="' + r.toFixed(2) + '" radius-top="' + (r*0.35).toFixed(2) + '" height="' + alt.toFixed(2) + '" color="#FFF8C8" material="shader: flat; opacity: 0.09; transparent: true; side: double"></a-cone>';
  }

  function gerarLimpaFolha(x, y, z) {
    const vermelho = '#8A2818', vermelhoEsc = '#5A1808', marrom = '#6A3A1A';
    return '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '" ghost-fade="dur: 6000">' +
      '<a-sphere radius="0.09" color="' + vermelho + '" material="shader: standard; emissive: ' + vermelho + '; emissiveIntensity: 0.5; opacity: 0.4; transparent: true" scale="1.4 1 1"></a-sphere>' +
      '<a-sphere position="0.11 0.07 0" radius="0.065" color="' + vermelho + '" material="shader: standard; emissive: ' + vermelho + '; emissiveIntensity: 0.5; opacity: 0.4; transparent: true"></a-sphere>' +
      '<a-cone position="0.18 0.07 0" rotation="0 0 -90" radius-bottom="0.02" radius-top="0" height="0.05" color="' + vermelhoEsc + '" material="shader: standard; opacity: 0.5; transparent: true"></a-cone>' +
      '<a-sphere position="0.15 0.10 0.03" radius="0.008" color="#000" material="shader: standard; opacity: 0.7; transparent: true"></a-sphere>' +
      '<a-sphere position="-0.05 0.02 0.06" radius="0.065" color="' + marrom + '" material="shader: standard; emissive: ' + marrom + '; emissiveIntensity: 0.3; opacity: 0.35; transparent: true" scale="1.3 0.5 1"></a-sphere>' +
      '<a-sphere position="-0.05 0.02 -0.06" radius="0.065" color="' + marrom + '" material="shader: standard; emissive: ' + marrom + '; emissiveIntensity: 0.3; opacity: 0.35; transparent: true" scale="1.3 0.5 1"></a-sphere>' +
      '<a-cone position="-0.14 0 0" rotation="0 0 90" radius-bottom="0.04" radius-top="0.02" height="0.12" color="' + vermelhoEsc + '" material="shader: standard; opacity: 0.4; transparent: true"></a-cone>' +
      '</a-entity>';
  }

  function gerarMemorial(x, z, rot) {
  return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rot.toFixed(1) + ' 0">' +
    '<a-cylinder position="-0.7 0.7 0" radius="0.05" height="1.4" color="#3A2818"></a-cylinder>' +
    '<a-cylinder position="0.7 0.7 0" radius="0.05" height="1.4" color="#3A2818"></a-cylinder>' +
    '<a-box position="0 1.6 0" width="1.8" height="1.0" depth="0.06" color="#1A1A1A"></a-box>' +
    '<a-box position="0 1.6 0.035" width="1.72" height="0.92" depth="0.03" color="#2A2A2A"></a-box>' +
    '<a-text value="EM MEMÓRIA" position="0 1.85 0.06" align="center" color="#E8D5FF" width="2.6"></a-text>' +
    '<a-text value="Limpa-folha-do-nordeste" position="0 1.65 0.06" align="center" color="#C0A0E8" width="2.2"></a-text>' +
    '<a-text value="Philydor novaesi" position="0 1.48 0.06" align="center" color="#A080D0" width="2.0"></a-text>' +
    '<a-text value="Último registro: 2011 · PE" position="0 1.32 0.06" align="center" color="#8A7AB0" width="2.0"></a-text>' +
    '<a-entity position="0 1.1 0.06" light="type: point; color: #A080D0; intensity: 0.3; distance: 1.5"></a-entity>' +
    '</a-entity>';
}

  function montarBiomaMataLimpafolha(animal, opts) {
    opts = opts || {};
    const denso = opts.densidade !== 'baixa';
    const skyTopo = '#3A5A6A', skyBase = '#6A8A7A', chaoBase = '#1E2E18', chaoVar = '#2A3A22';

    const skySrc = window.MewBiomas && window.MewBiomas.criarTexturaGradiente
      ? window.MewBiomas.criarTexturaGradiente(skyTopo, skyBase)
      : null;

    let html = skySrc
      ? '<a-sky src="' + skySrc + '" color="' + skyBase + '"></a-sky>'
      : '<a-sky color="' + skyBase + '"></a-sky>';

    html += '<a-circle position="0 0 0" rotation="-90 0 0" radius="90" color="' + chaoBase + '" shadow="receive: true"></a-circle>';

    /* Manchas escuras no chão */
    for (let i = 0; i < (denso ? 30 : 18); i++) {
      const p = pos(2, 35);
      const r = rand(1.5, 4);
      const cor = Math.random() > 0.5 ? chaoVar : '#3A2818';
      html += '<a-circle position="' + p.x.toFixed(2) + ' 0.006 ' + p.z.toFixed(2) + '" rotation="-90 0 0" radius="' + r.toFixed(2) + '" color="' + cor + '" opacity="0.5" transparent="true"></a-circle>';
    }

    /* Névoa baixa */
    for (let i = 0; i < (denso ? 8 : 4); i++) {
      const p = pos(8, 25);
      const r = rand(3, 6);
      html += '<a-circle position="' + p.x.toFixed(2) + ' 0.3 ' + p.z.toFixed(2) + '" rotation="-90 0 0" radius="' + r.toFixed(2) + '" color="#A8B8C0" material="shader: flat; opacity: 0.15; transparent: true; side: double"></a-circle>';
    }

    /* Raios de luz */
    for (let i = 0; i < (denso ? 10 : 5); i++) {
      const p = pos(2, 18);
      html += gerarRaioCopa(p.x, p.z, rand(7, 10), rand(0.8, 1.8));
    }

    /* ============================================================
       GLBs — Árvores com sapopema (raízes gigantes)
       ============================================================ */
    const nSapo = denso ? 14 : 8;
    for (let i = 0; i < nSapo; i++) {
      const a = (i / nSapo) * Math.PI * 2 + rand(-0.2, 0.2);
      const r = 10 + Math.random() * 22;
      html += glb('altitude_sapopema.glb', Math.cos(a) * r, Math.sin(a) * r, rand(0,360), 1.0);
    }
    /* Sapopemas próximas à câmera */
    for (let i = 0; i < (denso ? 6 : 3); i++) {
      const p = pos(6, 14);
      html += glb('altitude_sapopema.glb', p.x, p.z, rand(0,360), 1.0);
    }

    /* ============================================================
       GLBs — Troncos caídos com musgo
       ============================================================ */
    const nTroncos = denso ? 8 : 4;
    for (let i = 0; i < nTroncos; i++) {
      const p = pos(4, 18);
      html += glb('altitude_tronco.glb', p.x, p.z, rand(0,360), 1.0);
    }

    /* ============================================================
       GLBs — Bromélias gigantes
       ============================================================ */
    const nBrom = denso ? 24 : 14;
    for (let i = 0; i < nBrom; i++) {
      const p = pos(2, 20);
      html += glb('altitude_bromelia.glb', p.x, p.z, rand(0,360), 1.0);
    }

    /* ============================================================
       GLBs — Cogumelos bioluminescentes
       ============================================================ */
    const nCogu = denso ? 22 : 12;
    for (let i = 0; i < nCogu; i++) {
      const p = pos(1.5, 20);
      html += glb('altitude_cogumelo.glb', p.x, p.z, rand(0,360), 1.0);
    }

    /* ============================================================
       Procedurais de volume
       ============================================================ */
    for (let i = 0; i < (denso ? 40 : 24); i++) {
      const p = pos(1.5, 22);
      html += gerarSamambaia(p.x, p.z);
    }
    for (let i = 0; i < (denso ? 100 : 55); i++) {
      const p = pos(1, 25);
      html += gerarFolhico(p.x, p.z);
    }

    /* Limpa-folhas (silhuetas fantasma) */
    html += gerarLimpaFolha(-2.0, 1.2, -3.0);
    html += gerarLimpaFolha(2.5, 1.5, -4.0);
    html += gerarLimpaFolha(-3.2, 0.9, 2.0);
    if (denso) {
      html += gerarLimpaFolha(3.5, 1.4, 1.8);
      html += gerarLimpaFolha(0.5, 1.8, -6.0);
    }

    /* Memorial */
    html += gerarMemorial(-4, -5, 30);

    /* Hotspots */
        /* ============================================================
       HOTSPOTS — v2 (categoria + descrição + imagem)
       ============================================================ */
    html += '<a-entity position="0 2.2 2.5" info-hotspot="' +
      'titulo: Limpa-folha-do-nordeste; ' +
      'categoria: Ave; ' +
      'imagem: assets/hotspots/altitude_limpafolha_ave.jpg; ' +
      'descricao: Philydor novaesi. Ave vermelho-tijola de 18 cm. Vivía nas copas da Mata Atlantica de encosta. Ultimo registro em 2011, na Serra do Urubu em Pernambuco. Considerada Extinta pela IUCN e simbolo da perda de biodiversidade no Nordeste.; ' +
      'cor: #8A2818"></a-entity>';

    html += '<a-entity position="-3.5 0.8 -3" info-hotspot="' +
      'titulo: Samambaia; ' +
      'categoria: Planta; ' +
      'imagem: assets/hotspots/altitude_limpafolha_samambaia.jpg; ' +
      'descricao: Indicador de mata umida preservada. A camada baixa de samambaias mantem a umidade do solo e cria microhabitat para insetos. Essencial para a cadeia alimentar do limpa-folha, que cata artropodes entre as folhas.; ' +
      'cor: #2A6A28"></a-entity>';

    html += '<a-entity position="3.5 1.0 -4" info-hotspot="' +
      'titulo: Bromelia gigante; ' +
      'categoria: Planta; ' +
      'imagem: assets/hotspots/altitude_limpafolha_bromelia.jpg; ' +
      'descricao: Reservatorio natural de agua nas copas das arvores. Berco de sapos, insetos e fonte de agua para aves. O limpa-folha dependia dessas bromelias como microhabitat de forrageamento para caca de artropodes.; ' +
      'cor: #C8382A"></a-entity>';

    html += '<a-entity position="-2 0.6 3" info-hotspot="' +
      'titulo: Folhico; ' +
      'categoria: Ecologia; ' +
      'imagem: assets/hotspots/altitude_limpafolha_folhico.jpg; ' +
      'descricao: Camada de folhas secas acumuladas no chao e nos galhos. O limpa-folha catava insetos aqui com seu bico em forma de gancho. Esse comportamento deu origem ao nome popular da ave e de seus parentes da familia Furnariidae.; ' +
      'cor: #8A5A28"></a-entity>';

    html += '<a-entity position="5 2.8 -6" info-hotspot="' +
      'titulo: Dossel fechado; ' +
      'categoria: Habitat; ' +
      'imagem: assets/hotspots/altitude_limpafolha_dossel.jpg; ' +
      'descricao: Copas que se tocam formando um teto verde continuo. Estrato superior onde o limpa-folha forrageava em bandos mistos com outras aves. A fragmentacao da mata quebra esse dossel, essencial para a especie.; ' +
      'cor: #164018"></a-entity>';

    html += '<a-entity position="-5 2.5 -8" info-hotspot="' +
      'titulo: Tronco com musgo; ' +
      'categoria: Ecologia; ' +
      'imagem: assets/hotspots/altitude_limpafolha_tronco.jpg; ' +
      'descricao: Troncos caidos cobertos de musgo. Abrigam invertebrados que alimentam aves insetivoras como o limpa-folha. Esses microhabitats umidos sao os primeiros a desaparecer quando a mata e fragmentada.; ' +
      'cor: #2E5A24"></a-entity>';

    html += '<a-entity position="-4 1.6 -5" info-hotspot="' +
      'titulo: Memorial; ' +
      'categoria: Conservacao; ' +
      'imagem: assets/hotspots/altitude_limpafolha_memorial.jpg; ' +
      'descricao: Ultimo registro em 2011, na Serra do Urubu em Pernambuco. A especie e simbolo da extincao causada pelo desmatamento. Sua perda representa uma historia evolutiva unica apagada para sempre.; ' +
      'cor: #A080D0"></a-entity>';

    html += '<a-entity position="4 1.0 -6" info-hotspot="' +
      'titulo: Mata Atlantica de altitude; ' +
      'categoria: Bioma; ' +
      'imagem: assets/hotspots/altitude_limpafolha_bioma.jpg; ' +
      'descricao: Floresta umida de 400 a 550 m de altitude, com nevoa constante. Uma das matas mais umidas e ameacadas do planeta. O limpa-folha dependia desse ambiente unico, que praticamente desapareceu em Pernambuco.; ' +
      'cor: #3A5A6A"></a-entity>';

    html += '<a-entity position="2 3.2 -12" info-hotspot="' +
      'titulo: Centro de Endemismo PE; ' +
      'categoria: Bioma; ' +
      'imagem: assets/hotspots/altitude_limpafolha_endemismo.jpg; ' +
      'descricao: Regiao entre Alagoas e Pernambuco, ao norte do Rio Sao Francisco. Abriga especies unicas que nao existem em nenhum outro lugar do mundo. Restam menos de 2 porcento da cobertura original, tornando-a uma das areas mais criticas para conservacao.; ' +
      'cor: #2E5A24"></a-entity>';

    html += '<a-entity position="-6 0.9 5" info-hotspot="' +
      'titulo: Fragmentacao; ' +
      'categoria: Ameaca; ' +
      'imagem: assets/hotspots/altitude_limpafolha_fragmentacao.jpg; ' +
      'descricao: Retalhos de mata isolados condenam especies endemicas. Sem corredores ecologicos, populacoes pequenas nao se reproduzem e entram em vortice de extincao. Foi o que aconteceu com o limpa-folha-do-nordeste.; ' +
      'cor: #E8482A"></a-entity>';

    /* Iluminação */
    html += '<a-entity light="type: ambient; color: #A8C8B8; intensity: 0.5"></a-entity>' +
            '<a-entity position="3 14 4" light="type: directional; color: #E8F0D8; intensity: 0.85; castShadow: true; shadowMapWidth: 2048; shadowMapHeight: 2048"></a-entity>' +
            '<a-entity position="-4 4 -2" light="type: point; color: #A8D0B8; intensity: 0.35; distance: 14"></a-entity>' +
            '<a-entity position="2 3 3" light="type: point; color: #C8E8C8; intensity: 0.25; distance: 10"></a-entity>';

    return { html, bioma: { nome: 'Mata Atlântica de Altitude', skyTopo, skyBase, fog: '#4A6A5A', fogDensity: 0.06 } };
  }

  if (!window.MewBiomas) { console.warn('[bioma_mata_limpafolha] biomas_fauna.js ausente.'); return; }

  const _detectar = window.MewBiomas.detectarBioma;
  window.MewBiomas.detectarBioma = function (animal) {
    const nome = (animal.nome_popular || '').toLowerCase();
    if (nome.indexOf('limpa-folha') !== -1 || nome.indexOf('limpa folha') !== -1) {
      return 'mataLimpafolha';
    }
    return _detectar.call(this, animal);
  };

  const _montar = window.MewBiomas.montarCena3D;
  window.MewBiomas.montarCena3D = function (animal, opts) {
    const chave = window.MewBiomas.detectarBioma(animal);
    if (chave === 'mataLimpafolha') return montarBiomaMataLimpafolha(animal, opts);
    return _montar.call(this, animal, opts);
  };

  window.MewBiomas.montarBiomaMataLimpafolha = montarBiomaMataLimpafolha;
  console.log('[bioma_mata_limpafolha] v2 — Mata de Altitude (Limpa-folha) com GLBs registrado.');
})();