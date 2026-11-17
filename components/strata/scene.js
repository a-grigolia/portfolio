// Strata: the whole three.js scene, with no React in it.
// createStrata(canvas) builds the scene on a canvas and returns a small API.
// Numbers marked (mb) were read straight out of the original Maya file, final2.0.mb.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { DEFAULTS, LOOK } from './config.js';

export function createStrata(canvas, initial = {}) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const startParams = () => ({ ...DEFAULTS, ...LOOK, drift: !reduced, ...initial });
  const P = startParams();

  // ---------- renderer ----------
  // Throws if WebGL is unavailable. The component catches that and shows the fallback.
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  const DPR = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(DPR);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 24, 78);

  // (mb) camera1: 35mm lens at (0, 3.38, 31.63), pitched 3 degrees up
  const CENTER_Y = 4.8;
  const TARGET = new THREE.Vector3(0, 5.04, 0);
  const camera = new THREE.PerspectiveCamera(32, 1, 4, 200);
  camera.position.set(0, 3.38, 31.63);

  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(TARGET);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.rotateSpeed = 0.5;
  controls.minPolarAngle = THREE.MathUtils.degToRad(85);
  controls.maxPolarAngle = THREE.MathUtils.degToRad(97);
  controls.update();
  // OrbitControls turns off all touch gestures on the canvas. Give vertical swipes back to the
  // page so a full-height piece does not trap scrolling on phones; sideways drags still turn it.
  canvas.style.touchAction = 'pan-y';
  const onDown = () => canvas.classList.add('is-dragging');
  const onUp = () => canvas.classList.remove('is-dragging');
  canvas.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);

  // ---------- lathe helper ----------
  // strips: arrays of [x, y, nx, ny] in the profile plane, revolved around Y.
  function lathe(strips, seg) {
    const pos = [], nor = [], idx = [];
    for (const s of strips) {
      const base = pos.length / 3, n = s.length;
      for (let j = 0; j <= seg; j++) {
        const a = (j / seg) * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
        for (const p of s) {
          pos.push(p[0] * c, p[1], p[0] * sn);
          nor.push(p[2] * c, p[3], p[2] * sn);
        }
      }
      let facing = 0;
      for (let k = 0; k < n - 1; k++) {
        const dx = s[k + 1][0] - s[k][0], dy = s[k + 1][1] - s[k][1];
        facing += dy * (s[k][2] + s[k + 1][2]) - dx * (s[k][3] + s[k + 1][3]);
      }
      const flip = facing < 0;
      for (let j = 0; j < seg; j++) {
        for (let k = 0; k < n - 1; k++) {
          const a = base + j * n + k, b = a + 1, c = a + n, d = c + 1;
          if (flip) idx.push(a, c, b, b, c, d); else idx.push(a, b, c, b, d, c);
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setIndex(idx);
    return g;
  }
  const flat = (x1, y1, x2, y2, nx, ny) => [[x1, y1, nx, ny], [x2, y2, nx, ny]];

  // ---------- the shell ----------
  // (mb) pSphere1: unit sphere, top half deleted, faces extruded, pole rows deleted,
  // inner and outer walls bridged. Here: a thick half-sphere band with bevelled lips.
  const R_IN = 1;
  function shellGeometry(cutDeg, wall) {
    const R_OUT = R_IN + wall;
    const th0 = THREE.MathUtils.degToRad(Math.max(cutDeg, 1.5));
    const rb = (R_OUT - R_IN) * 0.22;              // bevel radius on the lips
    const ARC = 36, BEV = 5;
    const pts = [];
    const place = (r, t, u, v, n) => [
      r[0] * u + t[0] * (v - rb), r[1] * u + t[1] * (v - rb),
      r[0] * n[0] + t[0] * n[1], r[1] * n[0] + t[1] * n[1],
    ];
    // local frame at an end of the band: r = radial direction, t = direction the lip faces
    const lip = (r, t, fromOuter) => {
      const a = fromOuter ? R_OUT : R_IN, b = fromOuter ? R_IN : R_OUT, sg = fromOuter ? 1 : -1;
      for (let i = 1; i <= BEV; i++) {
        const q = (Math.PI / 2) * (i / BEV), n = [sg * Math.cos(q), Math.sin(q)];
        pts.push(place(r, t, a - sg * rb + rb * n[0], rb * n[1], n));
      }
      for (let i = 0; i < BEV; i++) {
        const q = (Math.PI / 2) * (i / BEV), n = [-sg * Math.sin(q), Math.cos(q)];
        pts.push(place(r, t, b + sg * rb + rb * n[0], rb * n[1], n));
      }
    };
    const ang = (t) => [Math.sin(t), -Math.cos(t)];
    const dA = rb / R_IN;
    const tEq = Math.PI / 2 - dA, tCut = th0 + dA;
    for (let i = 0; i <= ARC; i++) {              // outer wall, cut to opening
      const d = ang(tCut + (tEq - tCut) * (i / ARC));
      pts.push([R_OUT * d[0], R_OUT * d[1], d[0], d[1]]);
    }
    { const r = ang(tEq); lip(r, [-r[1], r[0]], true); }          // lip at the opening
    for (let i = 0; i <= ARC; i++) {              // inner wall, opening back to cut
      const d = ang(tEq - (tEq - tCut) * (i / ARC));
      pts.push([R_IN * d[0], R_IN * d[1], -d[0], -d[1]]);
    }
    { const r = ang(tCut); lip(r, [r[1], -r[0]], false); }        // lip around the cut-out
    pts.push(pts[0]);
    return lathe([pts], 104);
  }

  // Lacquer: a colored base under a clear, mirror-smooth coat. The coat is what carries the
  // reflections, so even black reads as a shape.
  const shellMat = new THREE.MeshPhysicalMaterial({
    color: 0x121216, roughness: 0.38, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05,
  });
  const sculpture = new THREE.Group();   // floats over the pedestal
  sculpture.position.set(0, CENTER_Y, 0);
  const spinner = new THREE.Group();     // (mb) MASH1_Transform rotationAmount Y, cycling
  const cradle = new THREE.Group();      // (mb) rotationAmount X = 90: the opening faces out, not up
  cradle.rotation.x = Math.PI / 2;
  sculpture.add(spinner); spinner.add(cradle); scene.add(sculpture);

    let shellGeo = shellGeometry(P.cut, P.wall);
  let shells = [];
  function buildShells() {
    for (const m of shells) cradle.remove(m);
    shells = [];
    for (let i = 0; i < P.shells; i++) {
      const m = new THREE.Mesh(shellGeo, shellMat);
      const f = P.shells > 1 ? i / (P.shells - 1) : 0;
      // (mb) scaleAmount 3, Distribute scale -0.75: 3x down to 0.75x
      m.scale.setScalar(3 * (1 - 0.75 * f));
      m.rotation.order = 'ZYX';
      m.castShadow = true; m.receiveShadow = true;
      m.userData.f = f;
      cradle.add(m); shells.push(m);
    }
  }
  buildShells();

  // ---------- pedestal and floor ----------
  // (mb) pCylinder4 r 3.42, top at 0.76, standing in a round well in the floor (r 4.2)
  const Y_FLOOR = -0.48, Y_TOP = 0.76, Y_MOAT = -3.2;
  const bevel = [];
  for (let i = 0; i <= 6; i++) {
    const b = (Math.PI / 2) * (i / 6);
    bevel.push([3.42 - 0.07 + 0.07 * Math.sin(b), Y_TOP - 0.07 + 0.07 * Math.cos(b), Math.sin(b), Math.cos(b)]);
  }
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x8f8b86, roughness: 0.9, metalness: 0 });
  const stone = new THREE.Mesh(lathe([
    flat(0, Y_TOP, 3.35, Y_TOP, 0, 1),
    bevel,
    flat(3.42, Y_TOP - 0.07, 3.42, Y_MOAT, 1, 0),
    flat(3.42, Y_MOAT, 4.2, Y_MOAT, 0, 1),
    flat(4.2, Y_MOAT, 4.2, Y_FLOOR, -1, 0),
    flat(4.2, Y_FLOOR, 120, Y_FLOOR, 0, 1),
  ], 128), stoneMat);
  stone.receiveShadow = true;
  scene.add(stone);

  // (mb) Roof: slab centred at y 11.7, underside at 8.5, with the lit opening over the piece
  const ROOF_Y = 8.5;
  const roofMat = new THREE.MeshBasicMaterial({ color: 0xe6e8ee, fog: false });
  const roof = new THREE.Mesh(new THREE.CircleGeometry(12, 128), roofMat);
  roof.rotation.x = Math.PI / 2; roof.position.y = ROOF_Y - 0.02;
  scene.add(roof);
  const ceilMat = new THREE.MeshBasicMaterial({ color: 0x4a4a4e });
  const ceiling = new THREE.Mesh(new THREE.CircleGeometry(130, 64), ceilMat);
  ceiling.rotation.x = Math.PI / 2; ceiling.position.y = ROOF_Y;
  scene.add(ceiling);

  // ---------- lights ----------
  // One big warm light overhead, built from several small lights spread over a disc. Each casts
  // its own shadow, so the edges blur the way an area light's do. A hemisphere light stands in
  // for the bounce Arnold computed: cool from above, warm off the floor, so nothing falls to black.
  const AIM = new THREE.Vector3(0, 3.2, 0);
  const KEY_DIST = 21, KEY_N = coarse ? 4 : 7;
  const keys = [];
  for (let i = 0; i < KEY_N; i++) {
    const l = new THREE.SpotLight(0xeef2ff, 1, 0, 0.6, 1, 2);
    l.target.position.copy(AIM);
    l.castShadow = true;
    l.shadow.mapSize.set(1024, 1024);
    l.shadow.camera.near = 8; l.shadow.camera.far = 34;
    l.shadow.bias = -0.0007; l.shadow.normalBias = 0.05;
    scene.add(l, l.target);
    keys.push(l);
  }
  const hemi = new THREE.HemisphereLight(0xe8ecf8, 0x8a8a90, 1);
  scene.add(hemi);
  // two lights low behind the piece: they do little on matte, but on gloss they draw the edges
  const rims = [-1, 1].map((sx) => {
    const l = new THREE.SpotLight(0xffffff, 900, 0, 0.5, 1, 2);
    l.position.set(sx * 13, CENTER_Y + 1.5, -15);
    l.target.position.set(0, CENTER_Y, 0);
    scene.add(l, l.target);
    return l;
  });

  const dir = new THREE.Vector3(), side = new THREE.Vector3(), up = new THREE.Vector3();
  function placeLights() {
    const az = THREE.MathUtils.degToRad(P.angle), el = THREE.MathUtils.degToRad(P.height);
    dir.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
    side.set(Math.cos(az), 0, -Math.sin(az));
    up.crossVectors(dir, side);
    keys.forEach((l, i) => {
      l.position.copy(AIM).addScaledVector(dir, KEY_DIST);
      if (i > 0) {
        const a = (i / (KEY_N - 1)) * Math.PI * 2 + 0.4;
        l.position.addScaledVector(side, Math.cos(a) * P.soft).addScaledVector(up, Math.sin(a) * P.soft);
      }
    });
  }

  // ---------- look ----------
  const KEY_POWER = 2100, FILL_POWER = 2.1;
  const pmrem = new THREE.PMREMGenerator(renderer);
  let envTexture = null;
  function applyLightLevels() {
    for (const l of keys) l.intensity = (KEY_POWER * P.key) / KEY_N;
    hemi.intensity = P.fill * FILL_POWER;
  }
  scene.background = new THREE.Color(0x000000);
  {
    // a tiny room to reflect: dark walls and the lit opening overhead
    const env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16),
      new THREE.MeshBasicMaterial({ color: 0x0c0c0e, side: THREE.BackSide })));
    const disc = new THREE.Mesh(new THREE.CircleGeometry(14, 48),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 3.7, 3.3) }));
    disc.rotation.x = Math.PI / 2; disc.position.y = 16;
    env.add(disc);
    // studio softboxes: tall strips either side and a wide low card in front. Polished shells
    // show these as long highlights that slide across the form as it turns.
    const box = (w, h, x, y, z, v) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(v, v, v * 1.04), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 4, 0);
      env.add(m);
    };
    box(7, 30, -30, 8, 14, 5); box(7, 30, 30, 8, 14, 5);
    box(5, 26, -22, 8, -26, 3); box(5, 26, 22, 8, -26, 3);
    box(40, 6, 0, -6, 34, 1.2);
    // the lit floor, so the underside of the piece picks up a glow instead of vanishing into the dark
    const glow = new THREE.Mesh(new THREE.CircleGeometry(26, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.55, 0.55, 0.6) }));
    glow.rotation.x = -Math.PI / 2; glow.position.y = -10;
    env.add(glow);
    envTexture = pmrem.fromScene(env, 0.02).texture;
    scene.environment = envTexture;
    // Since three r163, envMapIntensity is ignored for maps inherited from scene.environment,
    // so the two lit materials take the map directly to keep their own intensities.
    shellMat.envMap = envTexture;
    stoneMat.envMap = envTexture;
    shellMat.envMapIntensity = 0.15;
    shellMat.envMapIntensity = 1.5;
    stoneMat.envMapIntensity = 0.12;
  }

  // ---------- post: contact shading, tone mapping, a little grain ----------
  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(4, 4, {
    type: THREE.HalfFloatType, samples: coarse ? 2 : 4,
  }));
  composer.setPixelRatio(DPR);
  composer.addPass(new RenderPass(scene, camera));
  const gtao = new GTAOPass(scene, camera, 4, 4);
  gtao.updateGtaoMaterial({ radius: 0.9, distanceExponent: 1.4, thickness: 1.2, scale: 1.25, samples: coarse ? 8 : 16, distanceFallOff: 1 });
  gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: coarse ? 8 : 16 });
  composer.addPass(gtao);
  composer.addPass(new OutputPass());
  const finish = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, time: { value: 0 }, grain: { value: 0.04 }, vignette: { value: 0.38 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `
      uniform sampler2D tDiffuse; uniform float time, grain, vignette; varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){
        vec4 c = texture2D(tDiffuse, vUv);
        float r = length((vUv - 0.5) * vec2(1.15, 1.0));
        c.rgb *= 1.0 - vignette * smoothstep(0.3, 0.8, r);
        c.rgb += (hash(gl_FragCoord.xy + fract(time) * 61.0) - 0.5) * grain;
        gl_FragColor = c;
      }`,
  });
  composer.addPass(finish);

  placeLights();
  applyLightLevels();
  shellMat.color.set(P.color); shellMat.metalness = P.metal; shellMat.roughness = P.rough;

  // ---------- frame ----------
  let phase = 2.4, spinAngle = 1.35, last = performance.now(), raf = 0;
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    controls.update();
    if (P.drift) {
      phase += (dt / P.loop) * Math.PI * 2;
      spinAngle += dt * (P.spin / 60) * Math.PI * 2;
      finish.uniforms.time.value = now / 1000;
    }
    spinner.rotation.y = spinAngle;
    const amp = THREE.MathUtils.degToRad(P.tilt);
    for (const m of shells) {
      const ph = phase - m.userData.f * P.stagger * Math.PI * 2;
      // (mb) rotateX keys 30, -30, 30 and rotateZ keys 0, 30, -30, 0: a cosine and a sine
      m.rotation.x = amp * Math.cos(ph);
      m.rotation.z = amp * Math.sin(ph);
    }
    gtao.blendIntensity = P.ao;
    composer.render();
    raf = requestAnimationFrame(frame);
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    // keep the pedestal and the lit opening in frame on narrow screens
    const v = 32, minH = 36;
    const hFov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(v / 2)) * camera.aspect);
    camera.fov = hFov < THREE.MathUtils.degToRad(minH)
      ? THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(minH / 2)) / camera.aspect))
      : v;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // Only render while the piece is on screen. It is heavy, so this matters on a long page.
  const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };
  const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
  io.observe(canvas);

  // ---------- API ----------
  function rebuildGeometry() {
    const old = shellGeo;
    shellGeo = shellGeometry(P.cut, P.wall);
    for (const m of shells) m.geometry = shellGeo;
    old.dispose();
  }
  return {
    /** Current values of the adjustable parameters. */
    get params() {
      const out = {};
      for (const k of Object.keys(DEFAULTS)) out[k] = P[k];
      return out;
    },
    /** Change one parameter: shells, cut, tilt, stagger, loop, spin or drift. */
    set(key, value) {
      P[key] = value;
      if (key === 'cut') rebuildGeometry();
      if (key === 'shells') buildShells();
    },
    /** Change the finish: a hex color, metal 0 or 1, and roughness 0 to 1. */
    setFinish({ color, metal, rough }) {
      Object.assign(P, { color, metal, rough });
      shellMat.color.set(color); shellMat.metalness = metal; shellMat.roughness = rough;
    },
    /** Back to the defaults. Returns the new params. */
    reset() {
      Object.assign(P, startParams());
      rebuildGeometry(); buildShells();
      shellMat.color.set(P.color); shellMat.metalness = P.metal; shellMat.roughness = P.rough;
      return this.params;
    },
    /** Stop rendering and free every GPU resource. Call on unmount. */
    dispose() {
      stop(); io.disconnect(); ro.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      controls.dispose();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) o.material.dispose();
      });
      for (const l of keys) l.shadow.map?.dispose();
      envTexture?.dispose(); pmrem.dispose();
      composer.dispose?.(); gtao.dispose?.();
      renderer.dispose();
    },
  };
}
