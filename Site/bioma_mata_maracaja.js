/* =========================================================
   bioma_mata_maracaja.js — v3
   Mata Atlântica NOTURNA — Gato-maracajá (Leopardus wiedii)
   Correções:
   - Iluminação muito mais forte (fog leve, ambient alto)
   - Árvores em anel distante (raio 15-28)
   - Galhos com altura adequada
   - Nada no centro
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

  /* ---- GLB helper (com a correção que o Gemini fez) ---- */
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

        /* Correção do Gemini — compensa a posição do pai */
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
      let t = 0;
      const iv = setInterval(() => {
        t++;
        if (ajustar() || t > 60) clearInterval(iv);
      }, 100);
    }, 100);
    return '<a-entity id="' + id + '" ' +
           'position="' + x.toFixed(2) + ' ' + yBase + ' ' + z.toFixed(2) + '" ' +
           'rotation="0 ' + (rot || 0).toFixed(1) + ' 0" ' +
           'gltf-model="url(assets/ambiente/' + src + ')" ' +
           'shadow="cast: true; receive: true"></a-entity>';
  }

  /* ============================================================
     PROCEDURAIS
     ============================================================ */

  function gerarVagalume(x, y, z) {
    const dur = randInt(2500, 5000);
    const drift = rand(0.4, 1.2);
    return '<a-sphere position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '" radius="0.08" color="#FFF8A0" ' +
      'material="shader: standard; emissive: #FFE860; emissiveIntensity: 1.6; opacity: 0.95; transparent: true" ' +
      'animation="property: position; from: ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '; to: ' + (x+drift).toFixed(2) + ' ' + (y+0.4).toFixed(2) + ' ' + (z+drift).toFixed(2) + '; dur: ' + dur + '; dir: alternate; loop: true; easing: easeInOutSine">' +
      '</a-sphere>';
  }

  function gerarLua() {
    return '<a-entity position="18 22 -35">' +
      '<a-sphere radius="3.5" color="#F0E8C0" material="shader: standard; emissive: #F0E8C0; emissiveIntensity: 1.4"></a-sphere>' +
      '<a-sphere radius="4.0" color="#FFFFFF" material="shader: standard; opacity: 0.18; transparent: true; emissive: #FFF8D0; emissiveIntensity: 0.7"></a-sphere>' +
      '<a-entity light="type: point; color: #E8E0C0; intensity: 1.2; distance: 80"></a-entity>' +
      '</a-entity>';
  }

  function gerarEstrela(x, y, z) {
    const dur = randInt(2000, 5000);
    return '<a-sphere position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '" radius="0.12" color="#FFF8E0" ' +
      'material="shader: standard; emissive: #FFF8E0; emissiveIntensity: 1.4" ' +
      'animation="property: material.emissiveIntensity; from: 0.6; to: 1.8; dur: ' + dur + '; dir: alternate; loop: true"></a-sphere>';
  }

  function gerarSamambaiaNoturna(x, z) {
    const h = rand(0.4, 0.8);
    const cor = pick(['#1E5A22', '#2A6A28', '#1A4A1E']);
    let folhas = '';
    for (let i = 0; i < randInt(6, 9); i++) {
      const a = (i / 9) * Math.PI * 2;
      const comp = h * rand(0.8, 1.2);
      folhas += '<a-plane position="' + (Math.cos(a)*comp*0.3).toFixed(2) + ' ' + (comp*0.35).toFixed(2) + ' ' + (Math.sin(a)*comp*0.3).toFixed(2) + '" width="' + (comp*0.9).toFixed(2) + '" height="0.07" color="' + cor + '" material="shader: flat; side: double; opacity: 0.9; transparent: true" rotation="' + rand(40,70).toFixed(1) + ' ' + (a*180/Math.PI).toFixed(1) + ' 0" sway-leaf="ampl: 3"></a-plane>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">' + folhas + '</a-entity>';
  }

  /* ============================================================
     MONTAGEM PRINCIPAL
     ============================================================ */
  function montarBiomaMaracaja(animal, opts) {
    opts = opts || {};
    const denso = opts.densidade !== 'baixa';
    const skyTopo = '#1A1A3A', skyBase = '#3A2A5A';

    const skySrc = window.MewBiomas && window.MewBiomas.criarTexturaGradiente
      ? window.MewBiomas.criarTexturaGradiente(skyTopo, skyBase)
      : null;

    let html = skySrc
      ? '<a-sky src="' + skySrc + '" color="' + skyBase + '"></a-sky>'
      : '<a-sky color="' + skyBase + '"></a-sky>';

    /* ============================================================
       ESTRELAS (grandes, brilhantes)
       ============================================================ */
    for (let i = 0; i < (denso ? 60 : 40); i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 50 + Math.random() * 40;
      const y = 15 + Math.random() * 25;
      html += gerarEstrela(Math.cos(a) * r, y, Math.sin(a) * r);
    }

    html += gerarLua();

    /* ============================================================
       CHÃO — mais claro pra dar pra ver a cena
       ============================================================ */
    html += '<a-circle position="0 0 0" rotation="-90 0 0" radius="90" color="#1A2A18" shadow="receive: true"></a-circle>';
    for (let i = 0; i < (denso ? 15 : 8); i++) {
      const p = pos(4, 30);
      const r = rand(1.5, 3.5);
      html += '<a-circle position="' + p.x.toFixed(2) + ' 0.005 ' + p.z.toFixed(2) + '" rotation="-90 0 0" radius="' + r.toFixed(2) + '" color="#223018" opacity="0.7" transparent="true"></a-circle>';
    }

    /* ============================================================
   GLBs — ÁRVORES (guardando posições pra prender os galhos)
   ============================================================ */
    const arvoresPosicoes = [];

    const nArvores = denso ? 22 : 14;
    for (let i = 0; i < nArvores; i++) {
      const a = (i / nArvores) * Math.PI * 2 + rand(-0.15, 0.15);
      const r = rand(15, 28);
      const ax = Math.cos(a) * r;
      const az = Math.sin(a) * r;
      const altura = 9.0;
      html += glb('noite_arvore.glb', ax, az, rand(0,360), altura);
      arvoresPosicoes.push({ x: ax, z: az, altura });
    }

    /* Árvores intermediárias */
    for (let i = 0; i < (denso ? 6 : 3); i++) {
      const p = pos(12, 16);
      const altura = 9.5;
      html += glb('noite_arvore.glb', p.x, p.z, rand(0,360), altura);
      arvoresPosicoes.push({ x: p.x, z: p.z, altura });
    }

    /* ============================================================
      GLBs — GALHOS presos nas árvores (um por árvore, alternado)
      Cada galho sai do TRONCO da árvore, na altura Y=3.5
      ============================================================ */
    const arvoresComGalho = [...arvoresPosicoes].sort(() => Math.random() - 0.5);
    const nGalhos = Math.min(denso ? 10 : 6, arvoresComGalho.length);

    for (let i = 0; i < nGalhos; i++) {
      const arvore = arvoresComGalho[i];

      /* Ângulo aleatório em volta do tronco — o galho aponta pra fora */
      const ang = rand(0, Math.PI * 2);

      /* Pequeno deslocamento pra sair do centro do tronco */
      const offset = 0.9;
      const gx = arvore.x + Math.cos(ang) * offset;
      const gz = arvore.z + Math.sin(ang) * offset;

      /* Rotação = ângulo em graus. Assim o galho aponta pra fora do tronco. */
      const rotacaoY = (ang * 180 / Math.PI);

      /* Altura do galho: entre 3 e 5m do chão */
      const alturaY = rand(3.0, 5.0);

      html += glb('noite_galho.glb', gx, gz, rotacaoY, 0.8, alturaY);
    }

    /* ============================================================
       GLBs — Troncos bioluminescentes no chão
       ============================================================ */
    const nTroncos = denso ? 10 : 5;
    for (let i = 0; i < nTroncos; i++) {
      const p = pos(6, 18);
      html += glb('noite_tronco_biopunk.glb', p.x, p.z, rand(0,360), 1.2);
    }

    /* ============================================================
       Procedurais de volume
       ============================================================ */
    for (let i = 0; i < (denso ? 30 : 18); i++) {
      const p = pos(4, 20);
      html += gerarSamambaiaNoturna(p.x, p.z);
    }

    /* ============================================================
       VAGALUMES — muitos, brilhantes, em toda a cena
       ============================================================ */
    const nVagalumes = denso ? 80 : 45;
    for (let i = 0; i < nVagalumes; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(2, 20);
      html += gerarVagalume(Math.cos(a) * r, rand(0.8, 5.5), Math.sin(a) * r);
    }

    /* ============================================================
       HOTSPOTS — sempre fora do centro
       ============================================================ */
        /* ============================================================
       HOTSPOTS — v2 (categoria + descrição + imagem)
       ============================================================ */
    html += '<a-entity position="0 2.2 6" info-hotspot="' +
      'titulo: Gato-maracaja; ' +
      'categoria: Mamifero; ' +
      'imagem: assets/hotspots/noite_maracaja_animal.jpg; ' +
      'descricao: Leopardus wiedii. Felino arboricola de habitos noturnos. Desce de troncos de cabeca para baixo usando tornozelos que giram 180 graus. Vulneravel no Brasil. Ocorre em remanescentes de Mata Atlantica e Brejos de Altitude em Pernambuco.; ' +
      'cor: #C8A860"></a-entity>';

    html += '<a-entity position="-8 3.0 -8" info-hotspot="' +
      'titulo: Copa fechada; ' +
      'categoria: Habitat; ' +
      'imagem: assets/hotspots/noite_maracaja_copa.jpg; ' +
      'descricao: Estrato superior da floresta, onde o maracaja passa a maior parte do tempo. Suas articulacoes flexiveis permitem que ele cace, durma e crie filhotes a dezenas de metros do chao, longe de predadores terrestres.; ' +
      'cor: #153A1E"></a-entity>';

    html += '<a-entity position="6 3.0 -10" info-hotspot="' +
      'titulo: Lianas; ' +
      'categoria: Ecologia; ' +
      'imagem: assets/hotspots/noite_maracaja_liana.jpg; ' +
      'descricao: Pontes naturais entre as copas das arvores. O maracaja usa essas conexoes como atalho para cacar sem descer ao chao, o que reduz o risco de encontros com predadores maiores como a jaguatirica.; ' +
      'cor: #0A1A0A"></a-entity>';

    html += '<a-entity position="-6 1.5 -12" info-hotspot="' +
      'titulo: Fungos bioluminescentes; ' +
      'categoria: Ecologia; ' +
      'imagem: assets/hotspots/noite_maracaja_fungos.jpg; ' +
      'descricao: Brilham no escuro da mata. Indicam madeira em decomposicao e alta umidade. Sao bioindicadores de floresta saudavel e fazem parte do ciclo de reciclagem de nutrientes do sub-bosque, onde o maracaja tambem caca.; ' +
      'cor: #40E0D0"></a-entity>';

    html += '<a-entity position="8 2.0 -14" info-hotspot="' +
      'titulo: Vagalumes; ' +
      'categoria: Ecologia; ' +
      'imagem: assets/hotspots/noite_maracaja_vagalumes.jpg; ' +
      'descricao: Sinalizam mata saudavel. Sao bioindicadores de umidade e ausencia de pesticidas. A presenca de muitos vagalumes indica que o fragmento ainda sustenta a cadeia alimentar completa, incluindo predadores noturnos como o maracaja.; ' +
      'cor: #FFE860"></a-entity>';

    html += '<a-entity position="-4 3.5 -18" info-hotspot="' +
      'titulo: APA Aldeia-Beberibe; ' +
      'categoria: Conservacao; ' +
      'imagem: assets/hotspots/noite_maracaja_apa.jpg; ' +
      'descricao: Area de Protecao Ambiental na Regiao Metropolitana do Recife. Um dos ultimos refugios do gato-maracaja na regiao. A APA protege remanescentes de Mata Atlantica que conectam fragmentos importantes para a especie.; ' +
      'cor: #A080FF"></a-entity>';

    html += '<a-entity position="-10 1.5 6" info-hotspot="' +
      'titulo: Fragmentacao; ' +
      'categoria: Ameaca; ' +
      'imagem: assets/hotspots/noite_maracaja_ameacas.jpg; ' +
      'descricao: Estradas e urbanizacao isolam populacoes. Atropelamentos e perda de habitat sao as maiores ameacas ao gato-maracaja. Sem corredores ecologicos, os jovens nao conseguem se dispersar e a especie desaparece dos fragmentos.; ' +
      'cor: #E8482A"></a-entity>';

    /* ============================================================
       ILUMINAÇÃO — MUITO mais clara pra ver a cena
       ============================================================ */
    html += '<a-entity light="type: ambient; color: #8090C0; intensity: 0.9"></a-entity>' +
            '<a-entity position="18 22 -35" light="type: point; color: #F0E8C0; intensity: 1.2; distance: 80"></a-entity>' +
            '<a-entity position="10 15 10" light="type: point; color: #6A9AC8; intensity: 0.7; distance: 30"></a-entity>' +
            '<a-entity position="-10 12 -8" light="type: point; color: #5A80B0; intensity: 0.6; distance: 25"></a-entity>' +
            '<a-entity position="0 8 0" light="type: point; color: #7A90C0; intensity: 0.5; distance: 20"></a-entity>';

    return {
      html,
      bioma: {
        nome: 'Mata Atlântica Noturna',
        skyTopo,
        skyBase,
        fog: '#1A2A30',
        fogDensity: 0.025
      }
    };
  }

  if (!window.MewBiomas) { console.warn('[bioma_mata_maracaja] biomas_fauna.js ausente.'); return; }

  const _detectar = window.MewBiomas.detectarBioma;
  window.MewBiomas.detectarBioma = function (animal) {
    const nome = (animal.nome_popular || '').toLowerCase();
    if (nome.indexOf('maracajá') !== -1 || nome.indexOf('maracaja') !== -1) {
      return 'mataMaracaja';
    }
    return _detectar.call(this, animal);
  };

  const _montar = window.MewBiomas.montarCena3D;
  window.MewBiomas.montarCena3D = function (animal, opts) {
    const chave = window.MewBiomas.detectarBioma(animal);
    if (chave === 'mataMaracaja') return montarBiomaMaracaja(animal, opts);
    return _montar.call(this, animal, opts);
  };

  window.MewBiomas.montarBiomaMaracaja = montarBiomaMaracaja;
  console.log('[bioma_mata_maracaja] v3 — Iluminação clara, árvores em anel, sem sobreposição.');
})();