'use client';

/**
 * ProximityField
 * A grid of shaded blocks that rise (and optionally lean/twist) away from the cursor,
 * with orbit-on-drag, idle drift and auto-rotate.
 *
 * Usage (field only, no tuner or corner note; see ProximityHero.jsx for the full setup):
 *   <div style={{ height: '80vh' }}>
 *     <ProximityField />
 *   </div>
 *
 * Extra props:
 *   onCursor(cell)   called with { col, row }, 'drift', or null when it changes
 *   ref              exposes resetView()
 *
 * The component fills its parent, so the parent needs a height.
 * Any setting below can be overridden with a prop, e.g. <ProximityField height={7} gap={0.4} />.
 * Settings update live without rebuilding the scene (except cols/rows).
 *
 * Requires: npm install three
 */

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const PROXIMITY_DEFAULTS = {
  cols: 48,
  rows: 32,
  height: 5,          // 0.1 to 10. Mapped to a rise of ~5 to ~15 block units
  tilt: 0,            // lean away from cursor, radians
  twist: 0,           // yaw at peak, radians
  radius: 6.7,        // falloff width (gaussian sigma), block units
  rise: 0.25,         // how fast blocks grow (per-frame approach at 60fps)
  decay: 0.07,        // how fast blocks ease back down
  jitter: 0,          // per-block height variance, 0 to 1
  gap: 0.57,          // space between blocks, block units
  drift: true,        // phantom cursor wanders when idle
  autoRotate: true,
  autoRotateSpeed: 0.6,
  tint: false,        // color the peaks with the accent
  accent: '#2ee05a',
  lightBg: '#ffffff',
  darkBg: '#0a0a0a',
  lightBlock: '#1d1e22',
  darkBlock: '#c4c7ce',
  orbitOnTouch: false, // on phones, drag-to-orbit would block page scrolling, so it's off by default
  distance: 2.1,      // camera distance multiplier, read when the camera is placed or reset
};

const SIZE = 1;
const BASE_H = 0.32;
const DRIFT_STRENGTH = 0.6;
const IDLE_MS = 2200;
const HOME = new THREE.Vector3(37, 44, 55);

// slider 0.1 -> 5 units of rise, 5 -> 10 units, 10 -> ~15 units
const riseFor = (s) => 5 + (Math.max(0.1, s) - 0.1) * (5 / 4.9);
const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const approach = (k, dt) => 1 - Math.pow(1 - k, dt * 60);

// The portfolio theme is the `dark` class on <html>, which follows the system
// setting until the visitor picks a theme. The class is the source of truth.
function isDark() {
  return document.documentElement.classList.contains('dark');
}

const ProximityField = forwardRef(function ProximityField({ className, style, onCursor, ...settings }, ref) {
  const mountRef = useRef(null);
  const apiRef = useRef(null);
  const onCursorRef = useRef(onCursor);
  const paramsRef = useRef({ ...PROXIMITY_DEFAULTS, ...settings });

  // lets a parent call fieldRef.current.resetView()
  useImperativeHandle(ref, () => ({ resetView: () => apiRef.current?.resetView() }), []);

  // keep live settings in sync without rebuilding the scene
  useEffect(() => {
    paramsRef.current = { ...PROXIMITY_DEFAULTS, ...settings };
    onCursorRef.current = onCursor;
  });

  const cols = settings.cols ?? PROXIMITY_DEFAULTS.cols;
  const rows = settings.rows ?? PROXIMITY_DEFAULTS.rows;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const P = () => paramsRef.current;
    const COLS = cols, ROWS = rows, COUNT = COLS * ROWS;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;

    // ---- renderer ----
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      return; // no WebGL, render nothing
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    const canvas = renderer.domElement;
    Object.assign(canvas.style, { display: 'block', width: '100%', height: '100%', cursor: 'crosshair' });
    mount.appendChild(canvas);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 110, 230);
    const camera = new THREE.PerspectiveCamera(30, 1, 1, 400);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.rotateSpeed = 0.55;
    controls.minPolarAngle = 0.15;
    controls.maxPolarAngle = Math.PI * 0.46;
    if (coarse && !P().orbitOnTouch) {
      controls.enableRotate = false;
      canvas.style.touchAction = 'pan-y'; // let the page scroll over the canvas on phones
    }

    // ---- lights ----
    const hemi = new THREE.HemisphereLight(0xffffff, 0x8a8d94, 1.1);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 2.6);
    key.position.set(-28, 48, 22);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -56, right: 56, top: 56, bottom: -56, near: 10, far: 170 });
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.03;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 0.7);
    rim.position.set(30, 18, -34);
    scene.add(rim);

    const groundGeo = new THREE.PlaneGeometry(600, 600);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.24 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // ---- blocks: one instanced mesh, pivot at the base so they grow upward ----
    const geo = new THREE.BoxGeometry(SIZE, 1, SIZE);
    geo.translate(0, 0.5, 0);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.42, metalness: 0.15 });
    const mesh = new THREE.InstancedMesh(geo, mat, COUNT);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(mesh);

    const px = new Float32Array(COUNT);
    const pz = new Float32Array(COUNT);
    const seed = new Float32Array(COUNT);
    const inf = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
      seed[i] = s - Math.floor(s);
    }

    let PITCH = 0, W = 0, D = 0, layoutGap = null;
    function layout() {
      layoutGap = P().gap;
      PITCH = SIZE + layoutGap;
      W = COLS * PITCH;
      D = ROWS * PITCH;
      for (let r = 0, i = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++, i++) {
          px[i] = (c - (COLS - 1) / 2) * PITCH;
          pz[i] = (r - (ROWS - 1) / 2) * PITCH;
        }
      }
    }
    layout();

    // ---- color + theme ----
    const blockColor = new THREE.Color();
    const accentColor = new THREE.Color(P().accent);
    const tmpColor = new THREE.Color();
    let lastAccent = P().accent;
    let lastTint = P().tint;

    function paintAll() {
      for (let i = 0; i < COUNT; i++) mesh.setColorAt(i, blockColor);
      mesh.instanceColor.needsUpdate = true;
    }
    function applyTheme() {
      const p = P();
      const dark = isDark();
      const bg = dark ? p.darkBg : p.lightBg;
      blockColor.set(dark ? p.darkBlock : p.lightBlock);
      renderer.setClearColor(bg);
      scene.fog.color.set(bg);
      groundMat.opacity = dark ? 0.55 : 0.24;
      hemi.groundColor.set(dark ? 0x1a1b20 : 0x8a8d94);
      paintAll();
    }
    applyTheme();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', applyTheme);
    const themeObserver = new MutationObserver(applyTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });

    // ---- pointer ----
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();
    const cursor = new THREE.Vector3();
    const target = new THREE.Vector3();
    let pointerOn = false;
    let lastInteract = -1e9;
    let strength = 0;

    const inBounds = (p) =>
      Math.abs(p.x) < W / 2 + P().radius && Math.abs(p.z) < D / 2 + P().radius;

    function onPointer(e) {
      const r = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      pointerOn = !!ray.ray.intersectPlane(floor, hit) && inBounds(hit);
      lastInteract = performance.now();
      if (pointerOn) {
        const col = Math.min(COLS - 1, Math.max(0, Math.round(hit.x / PITCH + (COLS - 1) / 2)));
        const row = Math.min(ROWS - 1, Math.max(0, Math.round(hit.z / PITCH + (ROWS - 1) / 2)));
        report({ col: col + 1, row: row + 1 });
      } else {
        report(null);
      }
    }
    function release() {
      pointerOn = false;
      lastInteract = performance.now();
      report(null);
    }

    // tells the parent which cell is under the cursor: { col, row }, 'drift', or null.
    // Only fires when the value changes, so it doesn't re-render React every frame.
    let lastCell = '';
    function report(cell) {
      const k = cell && typeof cell === 'object' ? `${cell.col},${cell.row}` : String(cell);
      if (k === lastCell) return;
      lastCell = k;
      onCursorRef.current?.(cell);
    }
    function onUp(e) {
      if (e.pointerType !== 'mouse') release();
    }
    canvas.addEventListener('pointermove', onPointer);
    canvas.addEventListener('pointerdown', onPointer);
    canvas.addEventListener('pointerleave', release);
    canvas.addEventListener('pointercancel', release);
    canvas.addEventListener('pointerup', onUp);

    // ---- idle drift: a phantom cursor so the field is alive at rest ----
    let driftT = 0;
    const driftPoint = (t, out) =>
      out.set(
        Math.sin(t * 0.21) * W * 0.3 + Math.sin(t * 0.53) * 3,
        0,
        Math.cos(t * 0.16) * D * 0.28 + Math.cos(t * 0.47) * 2
      );

    // seed the first frame with the hill already raised
    driftPoint(0, cursor);
    target.copy(cursor);
    strength = DRIFT_STRENGTH;
    {
      const inv = 1 / (2 * P().radius * P().radius);
      for (let i = 0; i < COUNT; i++) {
        const dx = px[i] - cursor.x, dz = pz[i] - cursor.z;
        inf[i] = strength * Math.exp(-(dx * dx + dz * dz) * inv);
      }
    }

    // ---- sizing ----
    // fog and the far plane move back with the camera so the far edge fades the same at any distance
    const viewScale = (aspect) => (aspect < 1 ? 1.75 : aspect < 1.4 ? 1.25 : 1) * P().distance;
    function placeCamera() {
      const k = viewScale(camera.aspect);
      camera.position.copy(HOME).multiplyScalar(k * (PITCH / 1.32));
      camera.far = 400 * k;
      camera.updateProjectionMatrix();
      scene.fog.near = 110 * k;
      scene.fog.far = 230 * k;
      controls.target.set(0, 0, 0);
      controls.update();
    }
    let placed = false;
    function resize() {
      const w = mount.clientWidth || 1, h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (!placed) {
        placeCamera();
        placed = true;
      }
    }
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    apiRef.current = { resetView: placeCamera };
    // ---- frame ----
    const clock = new THREE.Clock();
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const qy = new THREE.Quaternion();
    const pos = new THREE.Vector3();
    const scl = new THREE.Vector3();
    const axis = new THREE.Vector3();
    const UP = new THREE.Vector3(0, 1, 0);

    let raf = 0;
    function frame() {
      const p = P();
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      const now = performance.now();

      if (p.gap !== layoutGap) layout();
      if (p.accent !== lastAccent) { accentColor.set(p.accent); lastAccent = p.accent; }
      if (lastTint && !p.tint) paintAll();
      lastTint = p.tint;

      const drift = p.drift && !reduced;
      const drifting = !pointerOn && drift && now - lastInteract > IDLE_MS;

      if (pointerOn) {
        ray.setFromCamera(ndc, camera); // keeps tracking while the camera orbits under a still mouse
        if (ray.ray.intersectPlane(floor, hit)) target.copy(hit);
      } else if (drifting) {
        driftT += dt;
        driftPoint(driftT, target);
        report('drift');
      }

      cursor.lerp(target, approach(pointerOn ? 0.22 : 0.05, dt));
      const goal = pointerOn ? 1 : drifting ? DRIFT_STRENGTH : 0;
      strength += (goal - strength) * approach(0.06, dt);

      const kr = approach(p.rise, dt);
      const kd = approach(p.decay, dt);
      const inv = 1 / (2 * p.radius * p.radius);
      const maxRise = riseFor(p.height);
      const tint = p.tint;

      for (let i = 0; i < COUNT; i++) {
        const dx = px[i] - cursor.x, dz = pz[i] - cursor.z;
        const d2 = dx * dx + dz * dz;
        const f = strength * Math.exp(-d2 * inv);
        inf[i] += (f - inf[i]) * (f > inf[i] ? kr : kd);
        const v = inf[i];

        const breathe = reduced
          ? 0
          : 0.05 * (0.5 + 0.5 * Math.sin(px[i] * 0.31 + t * 0.7) * Math.sin(pz[i] * 0.37 - t * 0.5));
        const h = BASE_H + breathe + v * maxRise * (1 + p.jitter * (seed[i] - 0.5) * 1.6);

        // lean the top away from the cursor; fade out at the center so it never flips
        const d = Math.sqrt(d2) || 1e-4;
        axis.set(dz / d, 0, -dx / d);
        q.setFromAxisAngle(axis, v * p.tilt * smooth(0, 2.5, d));
        qy.setFromAxisAngle(UP, v * p.twist * (0.85 + 0.3 * seed[i]));
        q.multiply(qy);

        pos.set(px[i], 0, pz[i]);
        scl.set(SIZE, h, SIZE);
        m.compose(pos, q, scl);
        mesh.setMatrixAt(i, m);

        if (tint) {
          tmpColor.copy(blockColor).lerp(accentColor, smooth(0.12, 0.75, v));
          mesh.setColorAt(i, tmpColor);
        }
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (tint) mesh.instanceColor.needsUpdate = true;

      // OrbitControls steps per call unless given time, which speeds up and
      // stutters on 120Hz screens; both rotation and damping go by dt here.
      controls.autoRotate = p.autoRotate && !reduced;
      controls.autoRotateSpeed = p.autoRotateSpeed;
      controls.dampingFactor = approach(0.07, dt);
      controls.update(dt);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }

    // only animate while on screen and the tab is visible
    let onScreen = true;
    const start = () => {
      if (!raf && onScreen && !document.hidden) {
        clock.getDelta();
        raf = requestAnimationFrame(frame);
      }
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      onScreen ? start() : stop();
    });
    io.observe(mount);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);
    start();

    // ---- cleanup (also keeps React strict mode's double-mount clean in dev) ----
    return () => {
      apiRef.current = null;
      stop();
      io.disconnect();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      mq.removeEventListener('change', applyTheme);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('pointermove', onPointer);
      canvas.removeEventListener('pointerdown', onPointer);
      canvas.removeEventListener('pointerleave', release);
      canvas.removeEventListener('pointercancel', release);
      canvas.removeEventListener('pointerup', onUp);
      controls.dispose();
      geo.dispose();
      mat.dispose();
      mesh.dispose();
      groundGeo.dispose();
      groundMat.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, [cols, rows]);

  return (
    <div
      ref={mountRef}
      className={className}
      style={{ position: 'relative', width: '100%', height: '100%', ...style }}
      role="img"
      aria-label="Interactive grid of blocks that rise around the cursor"
    />
  );
});

export default ProximityField;
