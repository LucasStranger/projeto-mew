/* =========================================================
   bioma_caatinga_galo.js — v2 (com GLBs)
   Caatinga — Galo-de-campina (Paroaria dominicana)
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

  function gerarFacheiro(x, z, h) {
    const altura = h || rand(2.5, 4.5);
    const cor = '#4A7A3E';
    let espinhos = '';
    for (let i = 0; i < 15; i++) {
      const y = (i / 15) * altura;
      const a = rand(0, Math.PI * 2);
      espinhos += '<a-cone position="' + (Math.cos(a) * 0.18).toFixed(2) + ' ' + y.toFixed(2) + ' ' + (Math.sin(a) * 0.18).toFixed(2) + '" radius-bottom="0.02" radius-top="0" height="0.08" color="#D0B878" rotation="' + rand(-30,30).toFixed(1) + ' ' + (a*180/Math.PI).toFixed(1) + ' ' + rand(-30,30).toFixed(1) + '"></a-cone>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">' +
      '<a-cylinder position="0 ' + (altura/2).toFixed(2) + ' 0" radius="0.20" height="' + altura.toFixed(2) + '" color="' + cor + '" shadow="cast: true"></a-cylinder>' +
      espinhos +
      '<a-sphere position="0 ' + altura.toFixed(2) + ' 0" radius="0.18" color="' + cor + '"></a-sphere>' +
      '</a-entity>';
  }

  function gerarAroeira(x, z) {
    const altura = rand(3.5, 5.5);
    const tronco = '#5A3A24', folha = '#4A7A3A';
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">' +
      '<a-cylinder position="0 ' + (altura/2).toFixed(2) + ' 0" radius="0.15" height="' + altura.toFixed(2) + '" color="' + tronco + '" shadow="cast: true"></a-cylinder>' +
      '<a-sphere position="0 ' + (altura + 0.3).toFixed(2) + ' 0" radius="1.2" color="' + folha + '"></a-sphere>' +
      '<a-sphere position="0.7 ' + (altura - 0.1).toFixed(2) + ' 0.3" radius="0.85" color="' + folha + '"></a-sphere>' +
      '<a-sphere position="-0.6 ' + (altura + 0.2).toFixed(2) + ' -0.4" radius="0.8" color="' + folha + '"></a-sphere>' +
      '</a-entity>';
  }

  function gerarArbusto(x, z) {
    const cor = pick(['#7A8A4A', '#8A7A3A', '#6A7A42']);
    let galhos = '';
    for (let i = 0; i < randInt(5, 8); i++) {
      const a = rand(0, Math.PI * 2);
      const h = rand(0.4, 0.9);
      galhos += '<a-cylinder position="' + (Math.cos(a)*0.15).toFixed(2) + ' ' + (h/2).toFixed(2) + ' ' + (Math.sin(a)*0.15).toFixed(2) + '" radius="0.02" height="' + h.toFixed(2) + '" color="' + cor + '" rotation="' + rand(-25,25).toFixed(1) + ' ' + (a*180/Math.PI).toFixed(1) + ' ' + rand(-25,25).toFixed(1) + '" sway-dry="ampl: 8"></a-cylinder>';
    }
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">' + galhos + '</a-entity>';
  }

  function gerarCupinzeiro(x, z, tam) {
    const t = tam || 1;
    const h = 0.7 * t + Math.random() * 0.4;
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">' +
      '<a-cone position="0 ' + (h/2).toFixed(2) + ' 0" radius-bottom="' + (0.4*t).toFixed(2) + '" radius-top="0.08" height="' + h.toFixed(2) + '" color="#7A5A3A"></a-cone>' +
      '<a-sphere position="0 ' + (h*0.4).toFixed(2) + ' 0" radius="' + (0.22*t).toFixed(2) + '" color="#8A6A48"></a-sphere>' +
      '</a-entity>';
  }

  function gerarPedra(x, z, t) {
    const r = (t || 1) * rand(0.3, 0.7);
    return '<a-dodecahedron position="' + x.toFixed(2) + ' ' + (r*0.4).toFixed(2) + ' ' + z.toFixed(2) + '" radius="' + r.toFixed(2) + '" color="#8A7A5A" rotation="0 ' + rand(0,360).toFixed(1) + ' 0" scale="1.2 ' + rand(0.3,0.5).toFixed(2) + ' 1.2"></a-dodecahedron>';
  }

  function gerarRioSeco() {
    let html = '';
    let x = -14, z = -6;
    for (let i = 0; i < 16; i++) {
      const t = i / 16;
      x += rand(0.8, 1.4) + Math.sin(t * 2) * 0.4;
      z += 1.2;
      const w = rand(0.9, 1.6);
      html += '<a-circle position="' + x.toFixed(2) + ' 0.008 ' + z.toFixed(2) + '" rotation="-90 0 0" radius="' + w.toFixed(2) + '" color="#B8A888" opacity="0.7" transparent="true"></a-circle>';
      for (let j = 0; j < 2; j++) {
        const rx = x + rand(-w, w) * 0.7;
        const rz = z + rand(-w, w) * 0.7;
        const rr = rand(0.08, 0.18);
        html += '<a-dodecahedron position="' + rx.toFixed(2) + ' ' + (rr*0.4).toFixed(2) + ' ' + rz.toFixed(2) + '" radius="' + rr.toFixed(2) + '" color="#9A8A6A" rotation="0 ' + rand(0,360).toFixed(1) + ' 0"></a-dodecahedron>';
      }
    }
    return html;
  }

  function gerarBromelia(x, z) {
    const cor1 = pick(['#A03828', '#C8382A', '#8A3820']);
    const cor2 = '#6A2818';
    return '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '" rotation="0 ' + rand(0,360).toFixed(1) + ' 0">' +
      '<a-cone position="0 0.1 0" radius-bottom="0.24" radius-top="0.14" height="0.14" color="' + cor2 + '"></a-cone>' +
      '<a-cone position="0 0.24 0" radius-bottom="0.20" radius-top="0.04" height="0.18" color="' + cor1 + '"></a-cone>' +
      '<a-cone position="0 0.38 0" radius-bottom="0.09" radius-top="0" height="0.14" color="' + cor1 + '"></a-cone>' +
      '</a-entity>';
  }

  function gerarCapimSeco(x, z) {
    const cor = pick(['#C8B888', '#B8A878', '#D8C898']);
    let html = '<a-entity position="' + x.toFixed(2) + ' 0 ' + z.toFixed(2) + '">';
    for (let i = 0; i < randInt(3, 6); i++) {
      const a = rand(0, Math.PI * 2);
      const dx = Math.cos(a) * 0.04;
      const dz = Math.sin(a) * 0.04;
      const h = rand(0.2, 0.4);
      html += '<a-cone position="' + dx.toFixed(3) + ' ' + (h/2).toFixed(3) + ' ' + dz.toFixed(3) + '" radius-bottom="0.02" radius-top="0.002" height="' + h.toFixed(3) + '" color="' + cor + '" rotation="' + rand(-20,20).toFixed(1) + ' 0 ' + rand(-20,20).toFixed(1) + '"></a-cone>';
    }
    html += '</a-entity>';
    return html;
  }

  function gerarGaloPousado(x, y, z) {
    const cinza = '#7A7A7A', vermelho = '#C82A2A', branco = '#E8E8E0', preto = '#1A1A1A';
    return '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '">' +
      '<a-cylinder position="0 -0.16 0" rotation="0 0 90" radius="0.02" height="0.5" color="#4A3520"></a-cylinder>' +
      '<a-sphere radius="0.12" color="' + cinza + '" scale="1.4 1 1"></a-sphere>' +
      '<a-sphere position="0 -0.02 0.08" radius="0.08" color="' + branco + '" scale="1.15 1 1"></a-sphere>' +
      '<a-sphere position="0.14 0.12 0" radius="0.09" color="' + vermelho + '"></a-sphere>' +
      '<a-cone position="0.14 0.24 0" radius-bottom="0.06" radius-top="0.005" height="0.14" color="' + vermelho + '" rotation="0 0 -10"></a-cone>' +
      '<a-cone position="0.26 0.12 0" rotation="0 0 -90" radius-bottom="0.03" radius-top="0.005" height="0.07" color="' + branco + '"></a-cone>' +
      '<a-sphere position="0.20 0.14 0.05" radius="0.013" color="' + preto + '"></a-sphere>' +
      '<a-sphere position="-0.03 0.02 0.10" radius="0.08" color="' + cinza + '" scale="1.4 0.4 1" rotation="0 0 20"></a-sphere>' +
      '<a-sphere position="-0.03 0.02 -0.10" radius="0.08" color="' + cinza + '" scale="1.4 0.4 1" rotation="0 0 20"></a-sphere>' +
      '<a-cone position="-0.18 0 0" rotation="0 0 90" radius-bottom="0.05" radius-top="0.02" height="0.16" color="' + cinza + '"></a-cone>' +
      '<a-cone position="0 -0.08 0" radius-bottom="0.05" radius-top="0" height="0.06" color="' + preto + '"></a-cone>' +
      '</a-entity>';
  }

  function gerarGaloVoando(x, y, z) {
    const cinza = '#7A7A7A', vermelho = '#C82A2A', branco = '#E8E8E0';
    const r = rand(2, 4);
    const dur = randInt(8000, 12000);
    return '<a-entity position="' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + '" flutter-bird="raio: ' + r.toFixed(2) + '; alt: ' + y.toFixed(2) + '; dur: ' + dur + '">' +
      '<a-sphere radius="0.08" color="' + cinza + '" scale="1.5 0.9 0.7"></a-sphere>' +
      '<a-sphere position="0.10 0.04 0" radius="0.055" color="' + vermelho + '"></a-sphere>' +
      '<a-cone position="0.18 0.04 0" rotation="0 0 -90" radius-bottom="0.02" radius-top="0" height="0.05" color="' + branco + '"></a-cone>' +
      '<a-plane position="-0.06 0.06 0.10" width="0.15" height="0.08" color="' + cinza + '" material="shader: flat; side: double" rotation="0 30 -20"></a-plane>' +
      '<a-plane position="-0.06 0.06 -0.10" width="0.15" height="0.08" color="' + cinza + '" material="shader: flat; side: double" rotation="0 -30 -20"></a-plane>' +
      '</a-entity>';
  }

  function montarBiomaCaatingaGalo(animal, opts) {
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

    for (let i = 0; i < (denso ? 25 : 15); i++) {
      const p = pos(2, 40);
      const r = rand(1.5, 4.5);
      html += '<a-circle position="' + p.x.toFixed(2) + ' 0.005 ' + p.z.toFixed(2) + '" rotation="-90 0 0" radius="' + r.toFixed(2) + '" color="' + chaoVar + '" opacity="0.55" transparent="true"></a-circle>';
    }

    /* Rio seco (procedural) */
    html += gerarRioSeco();

    /* ============================================================
       GLBs — Cacimbas (poços de água)
       ============================================================ */
    html += glb('caatinga_cacimba.glb', -8, 4, rand(0,360), 1.0);
    html += glb('caatinga_cacimba.glb', 9, -6, rand(0,360), 1.0);

    /* ============================================================
       GLBs — Juazeiros
       ============================================================ */
    const nJuaz = denso ? 10 : 6;
    for (let i = 0; i < nJuaz; i++) {
      const p = pos(8, 25);
      html += glb('caatinga_juazeiro.glb', p.x, p.z, rand(0,360), 1.0);
    }

    /* ============================================================
       GLBs — Xique-xique (rasteiros)
       ============================================================ */
    const nXique = denso ? 12 : 7;
    for (let i = 0; i < nXique; i++) {
      const p = pos(3, 20);
      html += glb('caatinga_xiquexique.glb', p.x, p.z, rand(0,360), 1.0);
    }

    /* ============================================================
       GLBs — Mandacarus (cactos colunares)
       ============================================================ */
    const nMand = denso ? 16 : 10;
    for (let i = 0; i < nMand; i++) {
      const p = pos(3, 24);
      html += glb('caatinga_mandacaru.glb', p.x, p.z, rand(0,360), 1.0);
    }

    /* ============================================================
       Procedurais de volume
       ============================================================ */
    for (let i = 0; i < (denso ? 8 : 5); i++) {
      const p = pos(5, 22);
      html += gerarFacheiro(p.x, p.z, rand(2.5, 4.5));
    }
    for (let i = 0; i < (denso ? 6 : 4); i++) {
      const p = pos(10, 28);
      html += gerarAroeira(p.x, p.z);
    }
    for (let i = 0; i < (denso ? 30 : 18); i++) {
      const p = pos(1.5, 25);
      html += gerarArbusto(p.x, p.z);
    }
    for (let i = 0; i < (denso ? 8 : 4); i++) {
      const p = pos(5, 20);
      html += gerarCupinzeiro(p.x, p.z, rand(0.8, 1.4));
    }
    for (let i = 0; i < (denso ? 20 : 12); i++) {
      const p = pos(2, 25);
      html += gerarPedra(p.x, p.z, rand(0.6, 1.3));
    }
    for (let i = 0; i < (denso ? 80 : 45); i++) {
      const p = pos(1, 22);
      html += gerarCapimSeco(p.x, p.z);
    }
    for (let i = 0; i < (denso ? 12 : 7); i++) {
      const p = pos(2, 18);
      html += gerarBromelia(p.x, p.z);
    }

    /* Galos pousados */
    html += gerarGaloPousado(-2.0, 1.0, -2.5);
    html += gerarGaloPousado(2.5, 1.3, -3.2);
    html += gerarGaloPousado(-3.8, 0.9, 2.2);
    if (denso) {
      html += gerarGaloPousado(4.0, 1.2, 1.8);
      html += gerarGaloPousado(0.5, 1.6, -5.0);
    }
    for (let i = 0; i < (denso ? 5 : 3); i++) {
      const p = pos(3, 12);
      html += gerarGaloVoando(p.x, rand(2.5, 4.5), p.z);
    }

    /* Hotspots */
        /* ============================================================
       HOTSPOTS — v2 (categoria + descrição detalhada + imagem)
       ============================================================ */
    html += '<a-entity position="0 2.2 2.5" info-hotspot="' +
      'titulo: Galo-de-campina; ' +
      'categoria: Ave; ' +
      'imagem: assets/hotspots/caatinga_galo_ave.jpg; ' +
      'descricao: Paroaria dominicana. Endemico do Nordeste brasileiro. Cabeça e garganta vermelho-vivo, corpo cinza e branco. Mede cerca de 17 cm e pesa 20 a 30 g. Vive em pares ou pequenos grupos, alimenta-se de sementes, frutos e insetos. É uma das aves canoras mais visadas pelo trafico ilegal em Pernambuco.; ' +
      'cor: #C82A2A"></a-entity>';

    html += '<a-entity position="-4 1.0 -3" info-hotspot="' +
      'titulo: Mandacaru; ' +
      'categoria: Planta; ' +
      'imagem: assets/hotspots/caatinga_galo_mandacaru.jpg; ' +
      'descricao: Cereus jamacaru. Cacto colunar simbolo da Caatinga, pode chegar a 5 metros de altura. Armazena agua no caule e floresce a noite. Seus frutos alimentam aves, insetos e pequenos mamiferos durante a estacao seca.; ' +
      'cor: #3E7A3E"></a-entity>';

    html += '<a-entity position="3 1.2 -4" info-hotspot="' +
      'titulo: Juazeiro; ' +
      'categoria: Planta; ' +
      'imagem: assets/hotspots/caatinga_galo_juazeiro.jpg; ' +
      'descricao: Ziziphus joazeiro. Arvore espinhosa da mata baixa, sempre verde mesmo na seca. Oferece sombra, abrigo e frutos amarelos muito procurados pelo galo-de-campina. Sua casca e usada como sabao tradicional no Sertao.; ' +
      'cor: #5A8A3A"></a-entity>';

    html += '<a-entity position="-8 0.8 4" info-hotspot="' +
      'titulo: Cacimba; ' +
      'categoria: Habitat; ' +
      'imagem: assets/hotspots/caatinga_galo_cacimba.jpg; ' +
      'descricao: Poco natural cavado no leito de rios secos. Mantem agua mesmo na estiagem e vira ponto de encontro de aves, mamiferos e insetos. Fonte de vida essencial para o galo-de-campina no Sertao.; ' +
      'cor: #4A8090"></a-entity>';

    html += '<a-entity position="-4 0.6 -5" info-hotspot="' +
      'titulo: Rio seco; ' +
      'categoria: Habitat; ' +
      'imagem: assets/hotspots/caatinga_galo_rioseco.jpg; ' +
      'descricao: Leito pedregoso que so enche na estacao das chuvas. Entre dezembro e abril vira corredor ecologico conectando fragmentos de Caatinga. Fora desse periodo, suas pedras e areia servem de abrigo para repteis e insetos.; ' +
      'cor: #B8A888"></a-entity>';

    html += '<a-entity position="5 1.0 -6" info-hotspot="' +
      'titulo: Cupinzeiro; ' +
      'categoria: Ecologia; ' +
      'imagem: assets/hotspots/caatinga_galo_cupinzeiro.jpg; ' +
      'descricao: Construcao de cupins que regula a umidade e os nutrientes do solo. Serve de alimento para tamanduas, tatus e lagartos. Suas cavidades viram abrigo para outras especies depois de abandonado.; ' +
      'cor: #7A5A3A"></a-entity>';

    html += '<a-entity position="-3 0.6 4" info-hotspot="' +
      'titulo: Bromelia; ' +
      'categoria: Planta; ' +
      'imagem: assets/hotspots/caatinga_galo_bromelia.jpg; ' +
      'descricao: Bromeliacea terrestre da Caatinga. Acumula agua entre as folhas formando um micro-reservatorio que abriga sapos, insetos e micro-organismos durante a seca. Verdadeiro oásis em miniatura.; ' +
      'cor: #A03828"></a-entity>';

    html += '<a-entity position="0 3.0 -10" info-hotspot="' +
      'titulo: Caatinga; ' +
      'categoria: Bioma; ' +
      'imagem: assets/hotspots/caatinga_galo_bioma.jpg; ' +
      'descricao: Unico bioma exclusivamente brasileiro. Ocupa cerca de 11 porcento do territorio nacional. Vegetacao caducifolia que perde as folhas na seca e renasce nas chuvas. Abriga mais de 2 mil especies de plantas e animais adaptados ao semi-arido.; ' +
      'cor: #D8C090"></a-entity>';

    /* Iluminação */
    html += '<a-entity light="type: ambient; color: #FFF0D8; intensity: 0.85"></a-entity>' +
            '<a-entity position="8 14 4" light="type: directional; color: #FFE8A8; intensity: 1.3; castShadow: true; shadowMapWidth: 2048; shadowMapHeight: 2048"></a-entity>' +
            '<a-entity position="-6 6 -3" light="type: point; color: #FFE0A0; intensity: 0.4; distance: 15"></a-entity>';

    return { html, bioma: { nome: 'Caatinga', skyTopo, skyBase, fog: '#E8D0A0', fogDensity: 0.012 } };
  }

  if (!window.MewBiomas) { console.warn('[bioma_caatinga_galo] biomas_fauna.js ausente.'); return; }

  const _detectar = window.MewBiomas.detectarBioma;
  window.MewBiomas.detectarBioma = function (animal) {
    const nome = (animal.nome_popular || '').toLowerCase();
    if (nome.indexOf('galo-de-campina') !== -1 || nome.indexOf('galo de campina') !== -1 || nome.indexOf('cardeal') !== -1) {
      return 'caatingaGalo';
    }
    return _detectar.call(this, animal);
  };

  const _montar = window.MewBiomas.montarCena3D;
  window.MewBiomas.montarCena3D = function (animal, opts) {
    const chave = window.MewBiomas.detectarBioma(animal);
    if (chave === 'caatingaGalo') return montarBiomaCaatingaGalo(animal, opts);
    return _montar.call(this, animal, opts);
  };

  window.MewBiomas.montarBiomaCaatingaGalo = montarBiomaCaatingaGalo;
  console.log('[bioma_caatinga_galo] v2 — Caatinga (Galo-de-campina) com GLBs registrado.');
})();