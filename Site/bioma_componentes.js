/* =========================================================
   bioma_componentes.js
   Componentes A-Frame compartilhados por TODOS os biomas.
   DEVE ser carregado ANTES de qualquer bioma_*.js
   ========================================================= */
(function () {
  'use strict';

  if (AFRAME.components['billboard-y']) {
    console.log('[bioma_componentes] já registrados, pulando.');
    return;
  }

  /* ---------- billboard-y ---------- */
  AFRAME.registerComponent('billboard-y', {
    tick: function () {
      const cam = this.el.sceneEl && this.el.sceneEl.camera;
      if (!cam) return;
      const c = new THREE.Vector3(); cam.getWorldPosition(c);
      const o = new THREE.Vector3(); this.el.object3D.getWorldPosition(o);
      this.el.object3D.rotation.y = Math.atan2(c.x - o.x, c.z - o.z);
    }
  });

  /* ---------- info-hotspot ---------- */
  AFRAME.registerComponent('info-hotspot', {
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

  console.log('[bioma_componentes] Componentes compartilhados registrados.');
})();