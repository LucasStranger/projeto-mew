/* =========================================================
   bioma_componentes.js — MASTER
   TODOS os componentes A-Frame usados pelos biomas.
   DEVE vir ANTES de qualquer bioma_*.js no HTML.
   ========================================================= */
(function () {
  'use strict';

  const R = (nome, def) => {
    if (!AFRAME.components[nome]) AFRAME.registerComponent(nome, def);
  };

  /* ---------- billboard-y ---------- */
  R('billboard-y', {
    tick: function () {
      const cam = this.el.sceneEl && this.el.sceneEl.camera;
      if (!cam) return;
      const c = new THREE.Vector3(); cam.getWorldPosition(c);
      const o = new THREE.Vector3(); this.el.object3D.getWorldPosition(o);
      this.el.object3D.rotation.y = Math.atan2(c.x - o.x, c.z - o.z);
    }
  });

  /* ---------- info-hotspot ---------- */
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

      const marc = document.createElement('a-sphere');
      marc.setAttribute('radius', (0.10 * t).toFixed(3));
      marc.setAttribute('color', cor);
      marc.setAttribute('material',
        'shader: standard; emissive: ' + cor + '; emissiveIntensity: 1; opacity: 0.95; transparent: true');
      marc.setAttribute('animation',
        'property: scale; from: 1 1 1; to: 1.4 1.4 1.4; dur: 900; dir: alternate; loop: true; easing: easeInOutSine');
      this.el.appendChild(marc);

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

      const luz = document.createElement('a-entity');
      luz.setAttribute('light', 'type: point; color: ' + cor + '; intensity: 0.4; distance: 2.8');
      this.el.appendChild(luz);

      const tag = document.createElement('a-entity');
      tag.setAttribute('visible', 'false');
      tag.setAttribute('position', '0 ' + (0.55 * t).toFixed(2) + ' 0');
      tag.setAttribute('billboard-y', '');
      tag.innerHTML =
        '<a-plane width="2.5" height="0.76" color="#0A1408" ' +
        'material="shader: flat; opacity: 0.95; transparent: true; side: double"></a-plane>' +
        '<a-plane width="2.52" height="0.78" color="' + cor + '" ' +
        'material="shader: flat; opacity: 0.35; transparent: true; side: double" ' +
        'position="0 0 -0.002"></a-plane>' +
        '<a-text value="' + this.data.titulo.replace(/"/g, '&quot;') + '" ' +
        'align="center" position="0 0.2 0.005" ' +
        'color="' + cor + '" width="2.9" font="mozillavr"></a-text>' +
        '<a-text value="' + this.data.descricao.replace(/"/g, '&quot;') + '" ' +
        'align="center" position="0 -0.09 0.005" ' +
        'color="#d5ffdd" width="1.95" wrap-count="42" font="mozillavr"></a-text>';
      this.el.appendChild(tag);
      this.tag = tag;
      this.aberto = false;

      this.el.addEventListener('click', (e) => { e.stopPropagation(); this.toggle(); });
      this.el.addEventListener('mouseenter', () => this.el.setAttribute('scale', '1.15 1.15 1.15'));
      this.el.addEventListener('mouseleave', () => this.el.setAttribute('scale', '1 1 1'));

      window.ensureCursorBioma(this.el.sceneEl);
    },
    toggle: function () {
      this.aberto = !this.aberto;
      this.tag.setAttribute('visible', this.aberto);
      clearTimeout(this._t);
      if (this.aberto) {
        this._t = setTimeout(() => {
          this.aberto = false;
          if (this.tag) this.tag.setAttribute('visible', false);
        }, 7000);
      }
    },
    remove: function () { clearTimeout(this._t); }
  });

  /* ---------- sway-grass (capim marinho / caatinga) ---------- */
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

  /* ---------- sway-capim (Cerrado) ---------- */
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

  /* ---------- sway-dry (galhos secos / Caatinga) ---------- */
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

  /* ---------- sway-leaf (folhagem) ---------- */
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

  /* ---------- bobber (flutuação — boias, barcos) ---------- */
  R('bobber', {
    schema: { amp: { default: 0.12 }, dur: { default: 2600 } },
    init: function () {
      const y = this.el.object3D.position.y;
      this.el.setAttribute('animation',
        'property: position; from: 0 ' + y + ' 0; to: 0 ' + (y + this.data.amp) + ' 0; dur: ' +
        this.data.dur + '; dir: alternate; loop: true; easing: easeInOutSine');
    }
  });

  /* ---------- flutter-by (borboletas / voo suave) ---------- */
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

  /* ---------- flutter-bird (pássaros voando em círculo) ---------- */
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

  /* ---------- ghost-fade (memorial do limpa-folha) ---------- */
  R('ghost-fade', {
    schema: { dur: { default: 6000 } },
    init: function () {
      this.el.setAttribute('animation',
        'property: material.opacity; from: 0.15; to: 0.55; dur: ' + this.data.dur +
        '; dir: alternate; loop: true; easing: easeInOutSine');
    }
  });

  /* ---------- ensureCursorBioma (helper global) ---------- */
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

  console.log('[bioma_componentes] TODOS os componentes registrados.');
})();