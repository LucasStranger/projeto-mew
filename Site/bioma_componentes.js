/* =========================================================
   bioma_componentes.js — MASTER (v4 — popup HTML overlay)
   Popup em HTML/CSS sobreposto ao canvas → acentos perfeitos
   ========================================================= */
(function () {
  'use strict';

  const R = (nome, def) => {
    if (!AFRAME.components[nome]) AFRAME.registerComponent(nome, def);
  };

  /* --------------------------------------------------------
     CSS injetado para o popup HTML
     -------------------------------------------------------- */
  function injetarEstilosPopup() {
    if (document.getElementById('hotspot-popup-styles')) return;
    const style = document.createElement('style');
    style.id = 'hotspot-popup-styles';
    style.textContent = `
      .hotspot-popup {
        position: fixed;
        transform: translate(-50%, calc(-100% - 16px));
        background: rgba(8, 18, 6, 0.96);
        border: 2px solid #7ee898;
        border-radius: 12px;
        padding: 14px 22px;
        max-width: 380px;
        min-width: 220px;
        z-index: 99999;
        pointer-events: none;
        box-shadow:
          0 8px 28px rgba(0, 0, 0, 0.75),
          0 0 30px rgba(63, 185, 80, 0.35);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        animation: hotspotFadeIn 0.2s ease-out;
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
      .hotspot-popup-titulo {
        font-size: 1rem;
        font-weight: 800;
        margin: 0 0 8px 0;
        text-align: center;
        font-family: 'Courier New', monospace;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        text-shadow: 0 0 12px currentColor;
        line-height: 1.25;
      }
      .hotspot-popup-desc {
        font-size: 0.85rem;
        line-height: 1.5;
        color: #d5ffdd;
        margin: 0;
        text-align: center;
      }
      @keyframes hotspotFadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @media (max-width: 600px) {
        .hotspot-popup {
          max-width: calc(100vw - 30px);
          padding: 12px 16px;
        }
        .hotspot-popup-titulo { font-size: 0.85rem; }
        .hotspot-popup-desc { font-size: 0.75rem; }
      }
    `;
    document.head.appendChild(style);
  }

  injetarEstilosPopup();

  /* ---------- billboard-y (legado, mantido para compat.) ---------- */
  R('billboard-y', {
    tick: function () {
      const cam = this.el.sceneEl && this.el.sceneEl.camera;
      if (!cam) return;
      const c = new THREE.Vector3(); cam.getWorldPosition(c);
      const o = new THREE.Vector3(); this.el.object3D.getWorldPosition(o);
      this.el.object3D.rotation.y = Math.atan2(c.x - o.x, c.z - o.z);
    }
  });

  /* ---------- info-hotspot (v4 — popup HTML) ---------- */
  R('info-hotspot', {
    schema: {
      titulo:    { type: 'string', default: 'Elemento' },
      descricao: { type: 'string', default: '' },
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

      /* ============================================================
         POPUP HTML (overlay fora do 3D)
         ============================================================ */
      const popup = document.createElement('div');
      popup.className = 'hotspot-popup';
      popup.style.display = 'none';
      popup.style.borderColor = cor;
      popup.style.setProperty('--hotspot-cor', cor);

      const titulo = document.createElement('h4');
      titulo.className = 'hotspot-popup-titulo';
      titulo.style.color = cor;
      titulo.textContent = this.data.titulo;

      const desc = document.createElement('p');
      desc.className = 'hotspot-popup-desc';
      desc.textContent = this.data.descricao;

      popup.appendChild(titulo);
      popup.appendChild(desc);
      document.body.appendChild(popup);

      this.popup = popup;
      this.aberto = false;
      this._v = new THREE.Vector3();

      this.el.addEventListener('click', (e) => { e.stopPropagation(); this.toggle(); });
      this.el.addEventListener('mouseenter', () => this.el.setAttribute('scale', '1.15 1.15 1.15'));
      this.el.addEventListener('mouseleave', () => this.el.setAttribute('scale', '1 1 1'));

      window.ensureCursorBioma(this.el.sceneEl);
    },

    /* Atualiza a posição do popup HTML a cada frame */
    tick: function () {
      if (!this.aberto || !this.popup) return;

      const sceneEl = this.el.sceneEl;
      const cam = sceneEl && sceneEl.camera;
      if (!cam) return;

      /* Posição world do hotspot → NDC → pixels */
      this.el.object3D.getWorldPosition(this._v);
      this._v.project(cam);

      /* Se estiver atrás da câmera, esconde */
      if (this._v.z > 1) {
        this.popup.style.visibility = 'hidden';
        return;
      }

      this.popup.style.visibility = 'visible';

      const canvas = sceneEl.canvas;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();

      const x = rect.left + (this._v.x * 0.5 + 0.5) * rect.width;
      const y = rect.top  + (-this._v.y * 0.5 + 0.5) * rect.height;

      this.popup.style.left = x + 'px';
      this.popup.style.top  = y + 'px';
    },

    toggle: function () {
      this.aberto = !this.aberto;
      if (this.popup) {
        this.popup.style.display = this.aberto ? 'block' : 'none';
        if (this.aberto) {
          /* Força um tick imediato para posicionar antes de aparecer */
          this.tick();
        }
      }
      clearTimeout(this._t);
      if (this.aberto) {
        this._t = setTimeout(() => {
          this.aberto = false;
          if (this.popup) this.popup.style.display = 'none';
        }, 9000);
      }
    },

    remove: function () {
      clearTimeout(this._t);
      if (this.popup && this.popup.parentNode) {
        this.popup.parentNode.removeChild(this.popup);
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

  console.log('[bioma_componentes] v4 — popup HTML overlay registrado (acentos OK).');
})();