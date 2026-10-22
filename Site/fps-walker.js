/* =========================================================
   fps-walker.js v8 — D-pad estável (yaw via Euler) + Gaze Walk
   ========================================================= */
(function () {
  'use strict';

  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  function injetarCSS() {
    if (document.getElementById('fps-walker-styles')) return;
    const css = document.createElement('style');
    css.id = 'fps-walker-styles';
    css.textContent = `
      .fps-dpad {
        position: fixed; bottom: 26px; left: 50%;
        transform: translateX(-50%);
        width: 220px; height: 220px; z-index: 220;
        display: none;
        grid-template-columns: repeat(3, 68px);
        grid-template-rows: repeat(3, 68px);
        gap: 8px; touch-action: none; user-select: none;
        -webkit-user-select: none; -webkit-tap-highlight-color: transparent;
        pointer-events: none;
      }
      .fps-dpad.visivel { display: grid; }
      .fps-dpad-btn {
        pointer-events: auto; width: 68px; height: 68px;
        border-radius: 50%; background: rgba(5, 30, 15, 0.55);
        border: 2px solid rgba(126, 232, 152, 0.65);
        color: #7ee898; font-size: 1.6rem; font-weight: bold;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        box-shadow: 0 0 14px rgba(63, 185, 80, 0.35);
        backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
        transition: transform 0.08s, background 0.1s, box-shadow 0.1s;
        -webkit-tap-highlight-color: transparent; -webkit-touch-callout: none;
        touch-action: none;
      }
      .fps-dpad-btn.pressionado {
        background: rgba(126, 232, 152, 0.55); color: #05140c;
        transform: scale(0.92); box-shadow: 0 0 22px rgba(126, 232, 152, 0.9);
      }
      .fps-dpad-up    { grid-column: 2; grid-row: 1; }
      .fps-dpad-left  { grid-column: 1; grid-row: 2; }
      .fps-dpad-right { grid-column: 3; grid-row: 2; }
      .fps-dpad-down  { grid-column: 2; grid-row: 3; }
      body.em-vr .fps-dpad { display: none !important; }
      body.modo-ar .fps-dpad { display: none !important; }
      .fps-gaze-indicator {
        position: fixed; bottom: 10%; left: 50%; transform: translateX(-50%);
        width: 140px; height: 40px; pointer-events: none; z-index: 490;
        opacity: 0; transition: opacity 0.2s ease-in-out; display: none;
      }
      .fps-gaze-indicator.ativo { opacity: 1; }
      body.em-vr .fps-gaze-indicator { display: block; }
      .fps-gaze-indicator::before {
        content: '▲ ANDANDO'; position: absolute; left: 50%; bottom: 0;
        transform: translateX(-50%); font-family: 'Courier New', monospace;
        font-size: 0.8rem; font-weight: bold; letter-spacing: 2px;
        color: #7ee898; text-shadow: 0 0 10px #3fb950, 0 0 20px rgba(63, 185, 80, 0.8);
        animation: fpsGazePulse 0.6s ease-in-out infinite alternate;
      }
      @keyframes fpsGazePulse {
        from { opacity: 0.6; transform: translateX(-50%) translateY(2px); }
        to   { opacity: 1; transform: translateX(-50%) translateY(-2px); }
      }
      #fps-hint {
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.85); border: 2px solid rgba(63, 185, 80, 0.6);
        border-radius: 12px; padding: 18px 26px; color: #7ee898;
        font-family: 'Courier New', monospace; font-size: 0.85rem; font-weight: bold;
        letter-spacing: 1px; text-transform: uppercase; text-align: center;
        z-index: 300; pointer-events: none; box-shadow: 0 0 30px rgba(63, 185, 80, 0.5);
      }
      #fps-toggle {
        position: fixed; bottom: 275px; right: 20px; z-index: 150;
        padding: 10px 18px; border-radius: 25px;
        background: linear-gradient(135deg, rgba(0,180,255,0.5), rgba(0,100,200,0.35));
        border: 2px solid #00e0ff; color: #fff;
        font-family: 'Courier New', monospace; font-size: 0.78rem; font-weight: bold;
        letter-spacing: 1.5px; text-transform: uppercase;
        cursor: pointer; box-shadow: 0 0 20px rgba(0,224,255,0.5);
        backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
        touch-action: manipulation; -webkit-tap-highlight-color: transparent;
        transition: all 0.25s;
      }
    `;
    document.head.appendChild(css);
  }

  injetarCSS();

  AFRAME.registerComponent('fps-walker', {
    schema: {
      speed:            { type: 'number', default: 3.5 },
      gazeMaxSpeed:     { type: 'number', default: 4.5 },
      eyeHeight:        { type: 'number', default: 1.6 },
      mouseSensitivity: { type: 'number', default: 0.0022 },
      touchSensitivity: { type: 'number', default: 0.0055 },
      maxPitch:         { type: 'number', default: 1.45 },
      gazeThreshold:    { type: 'number', default: -0.25 }
    },

    init: function () {
      this.keys = { forward: false, backward: false, left: false, right: false };
      this.dpadState = { up: false, down: false, left: false, right: false };
      this.yaw = 0; this.pitch = 0; this._touching = false;
      this._lastTouch = { x: 0, y: 0 }; this._gazeVelocity = 0;
      this._vForward = new THREE.Vector3();
      this._qCam = new THREE.Quaternion();
      this._euler = new THREE.Euler(0, 0, 0, 'YXZ');

      this.el.setAttribute('look-controls', 'enabled: false');
      this.el.setAttribute('wasd-controls', 'enabled: false');

      const threeCam = this.el.getObject3D('camera');
      if (threeCam) {
        threeCam.position.set(0, 0, 0);
        threeCam.rotation.set(0, 0, 0);
        threeCam.quaternion.set(0, 0, 0, 1);
      }

      this.el.object3D.position.set(0, this.data.eyeHeight, 5);
      this.el.object3D.rotation.order = 'YXZ';
      this.el.object3D.rotation.set(0, 0, 0);

      this._onKeyDown = (e) => this.onKey(e, true);
      this._onKeyUp   = (e) => this.onKey(e, false);
      window.addEventListener('keydown', this._onKeyDown);
      window.addEventListener('keyup',   this._onKeyUp);

      this._setupPointerLock();
      this._criarDpad();

      if (isMobile) this._setupTouchDrag();
      this._criarGazeIndicator();

      this._onEnterVR = () => { this.esconderDpad(); };
      this._onExitVR  = () => { if (isMobile) this.mostrarDpad(); };
      this.el.sceneEl.addEventListener('enter-vr', this._onEnterVR);
      this.el.sceneEl.addEventListener('exit-vr',  this._onExitVR);

      if (isMobile) this.mostrarDpad();
      this._mostrarInstrucoes();
    },

    onKey: function (e, pressed) {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp':    this.keys.forward  = pressed; break;
        case 'KeyS': case 'ArrowDown':  this.keys.backward = pressed; break;
        case 'KeyA': case 'ArrowLeft':  this.keys.left     = pressed; break;
        case 'KeyD': case 'ArrowRight': this.keys.right    = pressed; break;
      }
    },

    _setupPointerLock: function () {
      const canvas = this.el.sceneEl.canvas;
      if (!canvas) {
        this.el.sceneEl.addEventListener('loaded', () => this._setupPointerLock(), { once: true });
        return;
      }
      this._canvas = canvas;

      this._onCanvasClick = () => {
        if (document.pointerLockElement !== canvas) {
          try { canvas.requestPointerLock(); } catch (e) {}
        }
      };
      canvas.addEventListener('click', this._onCanvasClick);

      this._onMouseMove = (e) => {
        if (document.pointerLockElement !== canvas) return;
        const s = this.data.mouseSensitivity;
        this.yaw   -= e.movementX * s;
        this.pitch -= e.movementY * s;
        this.pitch = Math.max(-this.data.maxPitch, Math.min(this.data.maxPitch, this.pitch));
      };
      document.addEventListener('mousemove', this._onMouseMove);

      if (!isMobile) {
        const hint = document.createElement('div');
        hint.id = 'fps-hint';
        hint.innerHTML = '🖱️ Clique na tela para olhar<br><small style="font-size:0.65rem;opacity:0.7;text-transform:none;letter-spacing:0;">ESC para liberar o mouse</small>';
        document.body.appendChild(hint);
        this._hintEl = hint;
        this._onPointerLockChange = () => {
          if (this._hintEl) this._hintEl.style.display = document.pointerLockElement === canvas ? 'none' : 'block';
        };
        document.addEventListener('pointerlockchange', this._onPointerLockChange);
      }
    },

    _criarDpad: function () {
      if (document.getElementById('fps-dpad')) {
        this._dpadEl = document.getElementById('fps-dpad');
        return;
      }
      const dpad = document.createElement('div');
      dpad.id = 'fps-dpad';
      dpad.className = 'fps-dpad';

      const defs = [
        { dir: 'up', glyph: '▲' },
        { dir: 'left', glyph: '◀' },
        { dir: 'right', glyph: '▶' },
        { dir: 'down', glyph: '▼' }
      ];

      defs.forEach(({ dir, glyph }) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'fps-dpad-btn fps-dpad-' + dir;
        btn.dataset.dir = dir;
        btn.textContent = glyph;
        btn.setAttribute('aria-label', 'Mover ' + dir);

        const ativar = (e) => {
          if (e && e.cancelable) e.preventDefault();
          if (e && e.stopPropagation) e.stopPropagation();
          this.dpadState[dir] = true;
          btn.classList.add('pressionado');
          if (navigator.vibrate) navigator.vibrate(8);
        };
        const desativar = (e) => {
          if (e && e.cancelable) e.preventDefault();
          if (e && e.stopPropagation) e.stopPropagation();
          this.dpadState[dir] = false;
          btn.classList.remove('pressionado');
        };

        btn.addEventListener('pointerdown', ativar, { passive: false });
        btn.addEventListener('pointerup', desativar, { passive: false });
        btn.addEventListener('pointercancel', desativar, { passive: false });
        btn.addEventListener('pointerleave', desativar, { passive: false });
        btn.addEventListener('touchstart', ativar, { passive: false });
        btn.addEventListener('touchend', desativar, { passive: false });
        btn.addEventListener('touchcancel', desativar, { passive: false });
        btn.addEventListener('contextmenu', (e) => e.preventDefault());

        dpad.appendChild(btn);
      });

      document.body.appendChild(dpad);
      this._dpadEl = dpad;
    },

    mostrarDpad:  function () { if (this._dpadEl) this._dpadEl.classList.add('visivel'); },
    esconderDpad: function () { if (this._dpadEl) this._dpadEl.classList.remove('visivel'); },

    _setupTouchDrag: function () {
      const canvas = this.el.sceneEl.canvas;
      if (!canvas) {
        this.el.sceneEl.addEventListener('loaded', () => this._setupTouchDrag(), { once: true });
        return;
      }
      const start = (e) => {
        if (e.touches.length !== 1) return;
        if (this._dpadEl) {
          const t = e.touches[0];
          const r = this._dpadEl.getBoundingClientRect();
          if (t.clientX >= r.left && t.clientX <= r.right && t.clientY >= r.top && t.clientY <= r.bottom) return;
        }
        this._touching = true;
        this._lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      };
      const move = (e) => {
        if (!this._touching || e.touches.length !== 1) return;
        const t = e.touches[0];
        const dx = t.clientX - this._lastTouch.x;
        const dy = t.clientY - this._lastTouch.y;
        this._lastTouch = { x: t.clientX, y: t.clientY };
        const s = this.data.touchSensitivity;
        this.yaw   -= dx * s;
        this.pitch -= dy * s;
        this.pitch = Math.max(-this.data.maxPitch, Math.min(this.data.maxPitch, this.pitch));
        if (e.cancelable) e.preventDefault();
      };
      const end = () => { this._touching = false; };
      canvas.addEventListener('touchstart', start, { passive: true });
      canvas.addEventListener('touchmove',  move,  { passive: false });
      canvas.addEventListener('touchend',   end);
      canvas.addEventListener('touchcancel', end);
    },

    _criarGazeIndicator: function () {
      if (document.getElementById('fps-gaze-indicator')) {
        this._gazeInd = document.getElementById('fps-gaze-indicator');
        return;
      }
      const ind = document.createElement('div');
      ind.id = 'fps-gaze-indicator';
      ind.className = 'fps-gaze-indicator';
      document.body.appendChild(ind);
      this._gazeInd = ind;
    },

    _mostrarInstrucoes: function () {
      const el = document.getElementById('instrucoes');
      if (!el) return;
      if (isMobile) {
        el.innerHTML = '<span class="instr-mobile"><span>👆 Arraste</span> pra olhar · <span>▲▼◀▶</span> pra andar</span>';
      } else {
        el.innerHTML = '<span class="instr-desktop"><span>🖱️ Clique</span> pra travar o mouse · <span>WASD</span> pra andar</span>';
      }
      el.style.display = 'block';
    },

    tick: function (t, dt) {
      const dtSec = Math.min(dt || 16, 100) / 1000;
      const speed = this.data.speed * dtSec;
      const emVR = this.el.sceneEl && this.el.sceneEl.is('vr-mode');

      if (!emVR) this.el.object3D.rotation.set(this.pitch, this.yaw, 0);

      let fx = 0, fz = 0, rx = 0, rz = 0;
      const cam = this.el.getObject3D('camera');
      if (cam) {
        cam.getWorldQuaternion(this._qCam);
        this._euler.setFromQuaternion(this._qCam, 'YXZ');
        const yaw = this._euler.y;
        fx = -Math.sin(yaw);
        fz = -Math.cos(yaw);
        rx =  Math.cos(yaw);
        rz = -Math.sin(yaw);
      }

      let dx = 0, dz = 0;
      if (this.keys.forward)  { dx += fx; dz += fz; }
      if (this.keys.backward) { dx -= fx; dz -= fz; }
      if (this.keys.left)     { dx -= rx; dz -= rz; }
      if (this.keys.right)    { dx += rx; dz += rz; }
      if (this.dpadState.up)    { dx += fx; dz += fz; }
      if (this.dpadState.down)  { dx -= fx; dz -= fz; }
      if (this.dpadState.left)  { dx -= rx; dz -= rz; }
      if (this.dpadState.right) { dx += rx; dz += rz; }

      if (dx !== 0 || dz !== 0) {
        const len = Math.hypot(dx, dz);
        if (len > 1) { dx /= len; dz /= len; }
        const p = this.el.object3D.position;
        p.x += dx * speed;
        p.z += dz * speed;
        p.y = this.data.eyeHeight;
      }

      if (emVR && cam) {
        cam.getWorldQuaternion(this._qCam);
        this._euler.setFromQuaternion(this._qCam, 'YXZ');
        const yaw = this._euler.y;
        const horizX = -Math.sin(yaw);
        const horizZ = -Math.cos(yaw);

        this._vForward.set(0, 0, -1).applyQuaternion(this._qCam);
        const y = this._vForward.y;
        const olhandoPraBaixo = y < this.data.gazeThreshold;

        if (olhandoPraBaixo) {
          this._gazeVelocity = Math.min(this._gazeVelocity + dtSec * 4, 1.0);
          if (this._gazeInd) this._gazeInd.classList.add('ativo');
        } else {
          this._gazeVelocity = Math.max(this._gazeVelocity - dtSec * 6, 0);
          if (this._gazeInd) this._gazeInd.classList.remove('ativo');
        }

        if (this._gazeVelocity > 0.01) {
          const intensidade = Math.min(1, Math.abs(y));
          const moveDist = this.data.gazeMaxSpeed * this._gazeVelocity * intensidade * dtSec;
          const p = this.el.object3D.position;
          p.x += horizX * moveDist;
          p.z += horizZ * moveDist;
          p.y = this.data.eyeHeight;
        }
      } else {
        if (this._gazeInd) this._gazeInd.classList.remove('ativo');
        this._gazeVelocity = 0;
      }
    },

    remove: function () {
      window.removeEventListener('keydown', this._onKeyDown);
      window.removeEventListener('keyup',   this._onKeyUp);
      if (this._canvas) this._canvas.removeEventListener('click', this._onCanvasClick);
      if (this._onMouseMove) document.removeEventListener('mousemove', this._onMouseMove);
      if (this._onPointerLockChange) document.removeEventListener('pointerlockchange', this._onPointerLockChange);
      if (document.pointerLockElement) document.exitPointerLock();
      if (this._hintEl && this._hintEl.parentNode) this._hintEl.parentNode.removeChild(this._hintEl);
      if (this._dpadEl && this._dpadEl.parentNode) this._dpadEl.parentNode.removeChild(this._dpadEl);
      if (this._gazeInd && this._gazeInd.parentNode) this._gazeInd.parentNode.removeChild(this._gazeInd);
      if (this.el.sceneEl) {
        this.el.sceneEl.removeEventListener('enter-vr', this._onEnterVR);
        this.el.sceneEl.removeEventListener('exit-vr',  this._onExitVR);
      }
    }
  });

  function criarBotaoDesktop() {
    if (isMobile) return;
    if (document.getElementById('fps-toggle')) return;
    const btn = document.createElement('button');
    btn.id = 'fps-toggle';
    btn.textContent = '🚶 Explorar';
    btn.addEventListener('click', toggle);
    document.body.appendChild(btn);
  }

  function toggle() {
    if (isMobile) return;
    const camEl = document.querySelector('#camera, [camera]');
    if (!camEl) return;
    const sceneEl = camEl.sceneEl;
    if (sceneEl && sceneEl.is('vr-mode')) return;

    const btn = document.getElementById('fps-toggle');
    const controles = document.getElementById('controles');
    const isWalk = camEl.hasAttribute('fps-walker');

    if (isWalk) {
      camEl.removeAttribute('fps-walker');
      if (document.pointerLockElement) document.exitPointerLock();
      const threeCam = camEl.getObject3D('camera');
      if (threeCam) { threeCam.position.set(0, 0, 0); threeCam.rotation.set(0, 0, 0); }
      camEl.object3D.position.set(0, 0, 0);
      camEl.object3D.rotation.set(0, 0, 0);
      camEl.setAttribute('look-controls', 'enabled: false');
      camEl.setAttribute('wasd-controls', 'enabled: false');
      camEl.setAttribute('orbit-camera', 'distance: 5.0; minDistance: 0.8; maxDistance: 35; targetY: 0.0; moveSpeed: 5.0;');
      if (btn) { btn.textContent = '🚶 Explorar'; btn.style.borderColor = '#00e0ff'; }
      if (controles) controles.style.display = 'flex';
    } else {
      camEl.removeAttribute('orbit-camera');
      camEl.setAttribute('fps-walker', 'speed: 3.5; gazeMaxSpeed: 4.5; eyeHeight: 1.6;');
      if (btn) { btn.textContent = '🔄 Órbita'; btn.style.borderColor = '#ffcb05'; }
      if (controles) controles.style.display = 'none';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(criarBotaoDesktop, 800));
  } else {
    setTimeout(criarBotaoDesktop, 800);
  }
})();