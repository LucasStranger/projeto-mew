/* =========================================================
   bioma_componentes.js — MASTER (v6 — VR-ready)
   Popup HTML (desktop) + Popup 3D (VR) simultâneos
   ========================================================= */
(function () {
  'use strict';

  const R = (nome, def) => {
    if (!AFRAME.components[nome]) AFRAME.registerComponent(nome, def);
  };

  /* --------------------------------------------------------
     CSS injetado para o popup HTML (desktop/celular)
     -------------------------------------------------------- */
  function injetarEstilosPopup() {
    if (document.getElementById('hotspot-popup-styles')) return;
    const style = document.createElement('style');
    style.id = 'hotspot-popup-styles';
    style.textContent = `
      .hotspot-popup {
        position: fixed;
        transform: translate(-50%, calc(-100% - 16px));
        background: rgba(8, 18, 6, 0.97);
        border: 2px solid #7ee898;
        border-radius: 14px;
        padding: 0;
        max-width: 380px;
        min-width: 240px;
        z-index: 99999;
        pointer-events: none;
        box-shadow:
          0 8px 28px rgba(0, 0, 0, 0.8),
          0 0 30px rgba(63, 185, 80, 0.4);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        animation: hotspotFadeIn 0.22s ease-out;
        overflow: hidden;
      }
      .hotspot-popup::after {
        content: '';
        position: absolute;
        bottom: -13px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 11px solid transparent;
        border-right: 11px solid transparent;
        border-top: 13px solid var(--hotspot-cor, #7ee898);
        filter: drop-shadow(0 3px 4px rgba(0,0,0,0.6));
      }
      .hotspot-popup-imagem-wrap {
        width: 100%;
        height: 180px;
        overflow: hidden;
        background: #0a1a0c;
        border-bottom: 2px solid var(--hotspot-cor, #7ee898);
        position: relative;
      }
      .hotspot-popup-imagem {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
        filter: brightness(0.95) saturate(1.05);
        background: linear-gradient(180deg, #0a1a0c 0%, #08120c 100%);
      }
      .hotspot-popup-imagem-wrap::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, transparent 65%, rgba(8, 18, 6, 0.6) 100%);
        pointer-events: none;
      }
      .hotspot-popup-conteudo {
        padding: 12px 18px 14px;
      }
      .hotspot-popup-categoria {
        display: inline-block;
        font-family: 'Courier New', monospace;
        font-size: 0.6rem;
        font-weight: bold;
        letter-spacing: 2px;
        text-transform: uppercase;
        padding: 3px 9px;
        border-radius: 10px;
        margin-bottom: 8px;
        background: rgba(126, 232, 152, 0.15);
        border: 1px solid var(--hotspot-cor, #7ee898);
        color: var(--hotspot-cor, #7ee898);
        text-shadow: 0 0 6px var(--hotspot-cor, #7ee898);
      }
      .hotspot-popup-titulo {
        font-size: 1.02rem;
        font-weight: 800;
        margin: 0 0 8px 0;
        text-align: left;
        font-family: 'Courier New', monospace;
        letter-spacing: 1.2px;
        text-transform: uppercase;
        text-shadow: 0 0 12px currentColor;
        line-height: 1.25;
        color: var(--hotspot-cor, #7ee898);
      }
      .hotspot-popup-desc {
        font-size: 0.83rem;
        line-height: 1.55;
        color: #d5ffdd;
        margin: 0;
        text-align: left;
      }
      @keyframes hotspotFadeIn {
        from { opacity: 0; transform: translate(-50%, calc(-100% - 8px)); }
        to   { opacity: 1; transform: translate(-50%, calc(-100% - 16px)); }
      }
      @media (max-width: 600px) {
        .hotspot-popup {
          max-width: calc(100vw - 30px);
          min-width: 200px;
        }
        .hotspot-popup-imagem-wrap { height: 140px; }
        .hotspot-popup-conteudo { padding: 10px 14px 12px; }
        .hotspot-popup-titulo { font-size: 0.9rem; }
        .hotspot-popup-desc { font-size: 0.74rem; }
        .hotspot-popup-categoria { font-size: 0.55rem; padding: 2px 7px; }
      }
    `;
    document.head.appendChild(style);
  }

  injetarEstilosPopup();

  /* ---------- billboard-y (legado) ---------- */
  R('billboard-y', {
    tick: function () {
      const cam = this.el.sceneEl && this.el.sceneEl.camera;
      if (!cam) return;
      const c = new THREE.Vector3(); cam.getWorldPosition(c);
      const o = new THREE.Vector3(); this.el.object3D.getWorldPosition(o);
      this.el.object3D.rotation.y = Math.atan2(c.x - o.x, c.z - o.z);
    }
  });

  /* ---------- info-hotspot (v6 — VR-ready) ---------- */
  R('info-hotspot', {
    schema: {
      titulo:    { type: 'string', default: 'Elemento' },
      categoria: { type: 'string', default: '' },
      descricao: { type: 'string', default: '' },
      imagem:    { type: 'string', default: '' },
      cor:       { type: 'color',  default: '#7ee898' },
      tamanho:   { type: 'number', default: 1.0 }
    },

    init: function () {
      const cor = this.data.cor;
      const t = this.data.tamanho;
      this.el.classList.add('clickable');

      /* Marcador esférico */
      const marc = document.createElement('a-sphere');
      marc.setAttribute('radius', (0.10 * t).toFixed(3));
      marc.setAttribute('color', cor);
      marc.setAttribute('material',
        'shader: standard; emissive: ' + cor + '; emissiveIntensity: 1; opacity: 0.95; transparent: true');
      marc.setAttribute('animation',
        'property: scale; from: 1 1 1; to: 1.4 1.4 1.4; dur: 900; dir: alternate; loop: true; easing: easeInOutSine');
      this.el.appendChild(marc);

      /* Anel pulsante */
      const anel = document.createElement('a-ring');
      anel.setAttribute('radius-inner', (0.14 * t).toFixed(3));
      anel.setAttribute('radius-outer', (0.21 * t).toFixed(3));
      anel.setAttribute('color', cor);
      anel.setAttribute('rotation', '-90 0 0');
      anel.setAttribute('material', 'shader: flat; opacity: 0.55; transparent: true; side: double');
      anel.setAttribute('animation',
        'property: scale; from: 1 1 1; to: 1.9 1.9 1.9; dur: 1400; dir: alternate; loop: true; easing: easeOutSine');
      anel.setAttribute('animation__op',
        'property: material.opacity; from: 0.65; to: 0.02; dur: 1400; dir: alternate; loop: true');
      this.el.appendChild(anel);

      /* Luz ambiente */
      const luz = document.createElement('a-entity');
      luz.setAttribute('light', 'type: point; color: ' + cor + '; intensity: 0.4; distance: 2.8');
      this.el.appendChild(luz);

      /* Painel 3D (VR) */
      this.painelVR = this._criarPainelVR(cor);
      this.painelVR.setAttribute('visible', 'false');
      this.el.appendChild(this.painelVR);

      /* Popup HTML (desktop) */
      this.popupHTML = this._criarPopupHTML(cor);
      document.body.appendChild(this.popupHTML);

      this.aberto = false;
      this._v = new THREE.Vector3();

      this.el.addEventListener('click', (e) => { e.stopPropagation(); this.toggle(); });
      this.el.addEventListener('mouseenter', () => this.el.setAttribute('scale', '1.15 1.15 1.15'));
      this.el.addEventListener('mouseleave', () => this.el.setAttribute('scale', '1 1 1'));

      window.ensureCursorBioma(this.el.sceneEl);
    },

    _criarPainelVR: function (cor) {
      const painel = document.createElement('a-entity');
      painel.setAttribute('position', '0 0 1.2');
      painel.setAttribute('look-at', '#camera');
      painel.setAttribute('scale', '1 1 1');

      const borda = document.createElement('a-plane');
      borda.setAttribute('width', '1.1');
      borda.setAttribute('height', '0.85');
      borda.setAttribute('color', cor);
      borda.setAttribute('material', 'shader: flat; opacity: 0.95; transparent: true; side: double');
      painel.appendChild(borda);

      const fundo = document.createElement('a-plane');
      fundo.setAttribute('width', '1.06');
      fundo.setAttribute('height', '0.81');
      fundo.setAttribute('position', '0 0 0.005');
      fundo.setAttribute('color', '#081206');
      fundo.setAttribute('material', 'shader: standard; opacity: 0.97; transparent: true; side: double');
      painel.appendChild(fundo);

      if (this.data.imagem && this.data.imagem.trim() !== '') {
        const img = document.createElement('a-image');
        img.setAttribute('src', this.data.imagem);
        img.setAttribute('width', '0.9');
        img.setAttribute('height', '0.3');
        img.setAttribute('position', '0 0.22 0.01');
        painel.appendChild(img);
      }

      if (this.data.categoria && this.data.categoria.trim() !== '') {
        const cat = document.createElement('a-text');
        cat.setAttribute('value', this.data.categoria.toUpperCase());
        cat.setAttribute('color', cor);
        cat.setAttribute('align', 'center');
        cat.setAttribute('width', '1.5');
        cat.setAttribute('position', '0 0.34 0.02');
        painel.appendChild(cat);
      }

      const titulo = document.createElement('a-text');
      titulo.setAttribute('value', this.data.titulo);
      titulo.setAttribute('color', cor);
      titulo.setAttribute('align', 'center');
      titulo.setAttribute('width', '2.0');
      titulo.setAttribute('position', '0 0.03 0.02');
      painel.appendChild(titulo);

      const desc = document.createElement('a-text');
      desc.setAttribute('value', this.data.descricao);
      desc.setAttribute('color', '#d5ffdd');
      desc.setAttribute('align', 'left');
      desc.setAttribute('width', '2.8');
      desc.setAttribute('wrap-count', '38');
      desc.setAttribute('position', '-0.5 -0.06 0.02');
      painel.appendChild(desc);

      return painel;
    },

    _criarPopupHTML: function (cor) {
      const popup = document.createElement('div');
      popup.className = 'hotspot-popup';
      popup.style.display = 'none';
      popup.style.borderColor = cor;
      popup.style.setProperty('--hotspot-cor', cor);

      if (this.data.imagem && this.data.imagem.trim() !== '') {
        const imgWrap = document.createElement('div');
        imgWrap.className = 'hotspot-popup-imagem-wrap';
        const img = document.createElement('img');
        img.className = 'hotspot-popup-imagem';
        img.src = this.data.imagem;
        img.alt = this.data.titulo;
        img.loading = 'lazy';
        img.onerror = function () { imgWrap.style.display = 'none'; };
        imgWrap.appendChild(img);
        popup.appendChild(imgWrap);
      }

      const conteudo = document.createElement('div');
      conteudo.className = 'hotspot-popup-conteudo';

      if (this.data.categoria && this.data.categoria.trim() !== '') {
        const cat = document.createElement('span');
        cat.className = 'hotspot-popup-categoria';
        cat.textContent = this.data.categoria;
        conteudo.appendChild(cat);
      }

      const titulo = document.createElement('h4');
      titulo.className = 'hotspot-popup-titulo';
      titulo.textContent = this.data.titulo;
      conteudo.appendChild(titulo);

      const desc = document.createElement('p');
      desc.className = 'hotspot-popup-desc';
      desc.textContent = this.data.descricao;
      conteudo.appendChild(desc);

      popup.appendChild(conteudo);
      return popup;
    },

    tick: function () {
      if (!this.aberto) return;

      const sceneEl = this.el.sceneEl;
      const cam = sceneEl && sceneEl.camera;
      if (!cam) return;

      const emVR = sceneEl.is('vr-mode');

      if (emVR) {
        if (this.painelVR) this.painelVR.setAttribute('visible', 'true');
        if (this.popupHTML) this.popupHTML.style.display = 'none';
        return;
      }

      if (this.painelVR) this.painelVR.setAttribute('visible', 'false');
      if (!this.popupHTML) return;

      this.el.object3D.getWorldPosition(this._v);
      this._v.project(cam);

      if (this._v.z > 1) {
        this.popupHTML.style.visibility = 'hidden';
        return;
      }

      this.popupHTML.style.visibility = 'visible';
      const canvas = sceneEl.canvas;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = rect.left + (this._v.x * 0.5 + 0.5) * rect.width;
      const y = rect.top  + (-this._v.y * 0.5 + 0.5) * rect.height;
      this.popupHTML.style.left = x + 'px';
      this.popupHTML.style.top  = y + 'px';
    },

    toggle: function () {
      this.aberto = !this.aberto;
      if (this.popupHTML) {
        this.popupHTML.style.display = this.aberto ? 'block' : 'none';
        if (this.aberto) this.tick();
      }
      if (this.painelVR) {
        this.painelVR.setAttribute('visible', this.aberto ? 'true' : 'false');
      }
      clearTimeout(this._t);
      if (this.aberto) {
        this._t = setTimeout(() => {
          this.aberto = false;
          if (this.popupHTML) this.popupHTML.style.display = 'none';
          if (this.painelVR) this.painelVR.setAttribute('visible', 'false');
        }, 11000);
      }
    },

    remove: function () {
      clearTimeout(this._t);
      if (this.popupHTML && this.popupHTML.parentNode) {
        this.popupHTML.parentNode.removeChild(this.popupHTML);
      }
    }
  });

  /* ---------- sway-grass ---------- */
  R('sway-grass', {
    schema: { ampl: { default: 8 } },
    init: function () {
      const a = this.data.ampl;
      const dur = 2400 + Math.random() * 1800;
      this.el.setAttribute('animation__swx',
        'property: rotation; from: 0 0 0; to: ' + a + ' 0 0; dur: ' + dur +
        '; dir: alternate; loop: true; easing: easeInOutSine');
      this.el.setAttribute('animation__swz',
        'property: rotation; from: 0 0 0; to: 0 0 ' + (-a * 0.7) + '; dur: ' + (dur + 400) +
        '; dir: alternate; loop: true; easing: easeInOutSine');
    }
  });

  /* ---------- sway-capim ---------- */
  R('sway-capim', {
    schema: { ampl: { default: 10 } },
    init: function () {
      const a = this.data.ampl;
      const d = 2400 + Math.random() * 1600;
      this.el.setAttribute('animation__cx',
        'property: rotation; from: 0 0 0; to: ' + a + ' 0 0; dur: ' + d +
        '; dir: alternate; loop: true; easing: easeInOutSine');
      this.el.setAttribute('animation__cz',
        'property: rotation; from: 0 0 0; to: 0 0 ' + (-a * 0.6) + '; dur: ' + (d + 400) +
        '; dir: alternate; loop: true; easing: easeInOutSine');
    }
  });

  /* ---------- sway-dry ---------- */
  R('sway-dry', {
    schema: { ampl: { default: 6 } },
    init: function () {
      const a = this.data.ampl;
      const d = 2800 + Math.random() * 1600;
      this.el.setAttribute('animation__dx',
        'property: rotation; from: 0 0 0; to: ' + a + ' 0 0; dur: ' + d +
        '; dir: alternate; loop: true; easing: easeInOutSine');
      this.el.setAttribute('animation__dz',
        'property: rotation; from: 0 0 0; to: 0 0 ' + (-a * 0.7) + '; dur: ' + (d + 400) +
        '; dir: alternate; loop: true; easing: easeInOutSine');
    }
  });

  /* ---------- sway-leaf ---------- */
  R('sway-leaf', {
    schema: { ampl: { default: 5 }, dur: { default: 3000 } },
    init: function () {
      const a = this.data.ampl;
      const d = this.data.dur + Math.random() * 1200;
      this.el.setAttribute('animation__lx',
        'property: rotation; from: 0 0 0; to: ' + a + ' 0 0; dur: ' + d +
        '; dir: alternate; loop: true; easing: easeInOutSine');
      this.el.setAttribute('animation__lz',
        'property: rotation; from: 0 0 0; to: 0 0 ' + (-a * 0.6) + '; dur: ' + (d + 500) +
        '; dir: alternate; loop: true; easing: easeInOutSine');
    }
  });

  /* ---------- sway-bamboo ---------- */
  R('sway-bamboo', {
    schema: { ampl: { default: 12 } },
    init: function () {
      const a = this.data.ampl;
      const d = 2200 + Math.random() * 1600;
      this.el.setAttribute('animation',
        'property: rotation; from: 0 0 ' + (-a) + ' 0 0 ' + a +
        '; dur: ' + d + '; dir: alternate; loop: true; easing: easeInOutSine');
    }
  });

  /* ---------- bobber ---------- */
  R('bobber', {
    schema: { amp: { default: 0.12 }, dur: { default: 2600 } },
    init: function () {
      const y = this.el.object3D.position.y;
      this.el.setAttribute('animation',
        'property: position; from: 0 ' + y + ' 0; to: 0 ' + (y + this.data.amp) + ' 0; dur: ' +
        this.data.dur + '; dir: alternate; loop: true; easing: easeInOutSine');
    }
  });

  /* ---------- flutter-by ---------- */
  R('flutter-by', {
    schema: { raio: { default: 1.5 }, alt: { default: 1.2 }, dur: { default: 8000 } },
    init: function () {
      const d = this.data.dur + Math.random() * 3000;
      this.el.setAttribute('animation__y',
        'property: position; from: 0 ' + this.data.alt + ' 0; to: 0 ' + (this.data.alt + 0.4) +
        ' 0; dur: 1400; dir: alternate; loop: true; easing: easeInOutSine');
      const raio = this.data.raio;
      let i = 0;
      const pontos = 6;
      const step = () => {
        const a = (i % pontos) / pontos * Math.PI * 2;
        const nx = Math.cos(a) * raio;
        const nz = Math.sin(a) * raio;
        this.el.setAttribute('animation__p',
          'property: position; to: ' + nx.toFixed(2) + ' ' +
          (this.data.alt + (Math.random() * 0.3)).toFixed(2) + ' ' + nz.toFixed(2) +
          '; dur: ' + (d / pontos) + '; easing: easeInOutSine');
        i++;
      };
      step();
      this._int = setInterval(step, d / pontos);
    },
    remove: function () { clearInterval(this._int); }
  });

  /* ---------- flutter-bird ---------- */
  R('flutter-bird', {
    schema: { raio: { default: 3 }, alt: { default: 2 }, dur: { default: 9000 } },
    init: function () {
      const d = this.data.dur + Math.random() * 3000;
      const raio = this.data.raio;
      let i = 0;
      const pontos = 6;
      const step = () => {
        const a = (i % pontos) / pontos * Math.PI * 2;
        const nx = Math.cos(a) * raio;
        const nz = Math.sin(a) * raio;
        this.el.setAttribute('animation__p',
          'property: position; to: ' + nx.toFixed(2) + ' ' +
          (this.data.alt + (Math.random() * 0.4)).toFixed(2) + ' ' + nz.toFixed(2) +
          '; dur: ' + (d / pontos) + '; easing: easeInOutSine');
        i++;
      };
      step();
      this._int = setInterval(step, d / pontos);
    },
    remove: function () { clearInterval(this._int); }
  });

  /* ---------- ghost-fade ---------- */
  R('ghost-fade', {
    schema: { dur: { default: 6000 } },
    init: function () {
      this.el.setAttribute('animation',
        'property: material.opacity; from: 0.15; to: 0.55; dur: ' + this.data.dur +
        '; dir: alternate; loop: true; easing: easeInOutSine');
    }
  });

  /* ---------- ensureCursorBioma ---------- */
  window.ensureCursorBioma = function (sceneEl) {
    if (!sceneEl || sceneEl.dataset.cursorOk === '1') return;
    sceneEl.dataset.cursorOk = '1';
    const add = () => {
      /* Em VR não precisa de cursor de mouse */
      if (sceneEl.is('vr-mode')) return;

      const cam = sceneEl.querySelector('a-camera, [camera]');
      if (!cam || cam.querySelector('[cursor]')) return;
      const c = document.createElement('a-entity');
      c.setAttribute('cursor', 'rayOrigin: mouse; fuse: false');
      c.setAttribute('raycaster', 'objects: .clickable; far: 100; interval: 80');
      cam.appendChild(c);
    };
    if (sceneEl.hasLoaded) add();
    else sceneEl.addEventListener('loaded', add, { once: true });
  };

  console.log('[bioma_componentes] v6 — VR-ready (popup HTML + painel 3D).');
})();