'use client';

/**
 * FilmGallery
 *
 * A side-by-side row of photos, each drawn as a scanned 35mm frame (sprocket holes, amber edge
 * print, dust, scratches, the odd light leak), driven by a tick-ruler dial. The row follows a
 * drag or trackpad swipe 1:1, glides with its momentum and settles softly on a photo. Drag the
 * dial, scroll it, scroll sideways anywhere, click a photo, or use the arrow keys.
 *
 * Usage:
 *   <div style={{ height: '100vh' }}>
 *     <FilmGallery photos={['/film/01.jpg', '/film/02.jpg']} />
 *   </div>
 *
 * It fills its parent, so give the parent a height. Needs `three` (npm i three @types/three).
 * Portrait photos get an upright frame, landscape photos get the same frame on its side.
 * Photos are cropped to fill a 2:3 window. Images from another domain need CORS headers.
 */

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import * as THREE from 'three';

/* ================================================================== */
/* The frame painter                                                   */
/* ================================================================== */

/**
 * Draws one 35mm frame as a scanned chip of film: black rebate, eight sprocket holes per side,
 * amber edge print, dust, scratches and the odd light leak. Everything is procedural and seeded
 * by the frame index, so each frame is dirty in its own way but looks the same on every load.
 *
 * Proportions follow real 35mm stock: film is 35mm wide, the image is 24 x 36mm, perforations
 * are 2.8 x 2mm on a 4.75mm pitch. The strip runs vertically, so photos are portrait 2:3.
 */

const MM = 24; // canvas px per millimetre
const FILM_W_MM = 35;
const FILM_H_MM = 39; // 36mm image plus the gaps to the neighbouring frames
const W = FILM_W_MM * MM;
const H = FILM_H_MM * MM;

const FILM_ASPECT = FILM_W_MM / FILM_H_MM;

const EDGE_INK = '#f28c28';

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

let grainTile: HTMLCanvasElement | null = null;
function getGrain() {
  if (grainTile) return grainTile;
  const size = 160;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const data = g.createImageData(size, size);
  const r = mulberry32(1234);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = r() > 0.5 ? 255 : 0;
    data.data[i] = data.data[i + 1] = data.data[i + 2] = v;
    data.data[i + 3] = r() * 60;
  }
  g.putImageData(data, 0, 0);
  grainTile = c;
  return c;
}

interface FilmFrame {
  canvas: HTMLCanvasElement;
  /**
   * Redraw the frame. Pass the loaded photo, or nothing for a gray placeholder.
   * landscape turns the whole chip 90 degrees (holes top and bottom, 3:2 window) and resizes the canvas.
   * dark drops the backlight bloom and lifts the base a little so the film still reads on a dark page.
   */
  draw: (img?: HTMLImageElement, opts?: { landscape?: boolean; dark?: boolean }) => void;
}

function createFilmFrame(index: number, stock = 'KODAK GOLD 400'): FilmFrame {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const draw = (img?: HTMLImageElement, opts: { landscape?: boolean; dark?: boolean } = {}) => {
    const { landscape = false, dark = false } = opts;
    const r = mulberry32(index * 9973 + 17);
    const between = (lo: number, hi: number) => lo + r() * (hi - lo);

    // Setting the size also clears the canvas and resets its state.
    canvas.width = landscape ? H : W;
    canvas.height = landscape ? W : H;
    // Everything below is drawn as a portrait chip. For landscape the whole drawing is turned a
    // quarter turn clockwise, which puts the left margin's print along the top, reading left to right.
    if (landscape) {
      ctx.translate(H, 0);
      ctx.rotate(Math.PI / 2);
    }

    /* ---- film base, cut slightly out of square at both ends ---- */
    ctx.save();
    const cut: [number, number, number, number] = [between(0, 5), between(0, 5), between(0, 5), between(0, 5)];
    ctx.beginPath();
    ctx.moveTo(4, cut[0]);
    ctx.lineTo(W - 4, cut[1]);
    ctx.quadraticCurveTo(W, cut[1], W, cut[1] + 4);
    ctx.lineTo(W, H - cut[2] - 4);
    ctx.quadraticCurveTo(W, H - cut[2], W - 4, H - cut[2]);
    ctx.lineTo(4, H - cut[3]);
    ctx.quadraticCurveTo(0, H - cut[3], 0, H - cut[3] - 4);
    ctx.lineTo(0, cut[0] + 4);
    ctx.quadraticCurveTo(0, cut[0], 4, cut[0]);
    ctx.closePath();
    ctx.clip();

    const base = ctx.createLinearGradient(0, 0, W, H);
    base.addColorStop(0, dark ? '#1a1612' : '#0c0a08');
    base.addColorStop(0.5, dark ? '#221c16' : '#120e0a');
    base.addColorStop(1, dark ? '#171310' : '#090807');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);

    // uneven density in the rebate: warm brown clouds
    for (let i = 0; i < 4; i++) {
      const x = between(0, W);
      const y = between(0, H);
      const rad = between(120, 360);
      const cloud = ctx.createRadialGradient(x, y, 0, x, y, rad);
      cloud.addColorStop(0, `rgba(150, 78, 26, ${between(0.06, 0.2)})`);
      cloud.addColorStop(1, 'rgba(150, 78, 26, 0)');
      ctx.fillStyle = cloud;
      ctx.fillRect(0, 0, W, H);
    }

    /* ---- the photo, sitting a hair off-centre and off-level like a real gate ---- */
    const pw = 24.5 * MM;
    const ph = 36 * MM;
    const cx = W / 2 + between(-0.25, 0.25) * MM;
    const cy = H / 2 + between(-0.3, 0.3) * MM;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(between(-0.004, 0.004));
    roundRect(ctx, -pw / 2, -ph / 2, pw, ph, 5);
    ctx.clip();
    if (img && img.naturalWidth) {
      // in a landscape chip the photo is turned back so it ends up upright
      if (landscape) ctx.rotate(-Math.PI / 2);
      const boxW = landscape ? ph : pw;
      const boxH = landscape ? pw : ph;
      const scale = Math.max(boxW / img.naturalWidth, boxH / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
      if (landscape) ctx.rotate(Math.PI / 2);
    } else {
      const g = 150 + Math.round(40 * Math.sin(index * 2.4));
      const ph0 = ctx.createLinearGradient(0, -ph / 2, 0, ph / 2);
      ph0.addColorStop(0, `rgb(${g + 16}, ${g + 14}, ${g + 10})`);
      ph0.addColorStop(1, `rgb(${g - 14}, ${g - 15}, ${g - 16})`);
      ctx.fillStyle = ph0;
      ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
    }
    // soft falloff where the gate edge shades the image
    ctx.lineWidth = 10;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 14;
    roundRect(ctx, -pw / 2 - 5, -ph / 2 - 5, pw + 10, ph + 10, 8);
    ctx.stroke();
    ctx.restore();

    /* ---- light leak on some frames: orange burn coming in from one edge ---- */
    if (r() < 0.4) {
      const fromLeft = r() < 0.5;
      const reach = between(0.18, 0.42) * W;
      const leak = ctx.createLinearGradient(fromLeft ? 0 : W, 0, fromLeft ? reach : W - reach, 0);
      leak.addColorStop(0, `rgba(255, 96, 20, ${between(0.35, 0.6)})`);
      leak.addColorStop(0.5, 'rgba(255, 150, 40, 0.14)');
      leak.addColorStop(1, 'rgba(255, 150, 40, 0)');
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = leak;
      const y0 = between(0, H * 0.5);
      ctx.fillRect(0, y0, W, between(H * 0.3, H * 0.6));
      ctx.globalCompositeOperation = 'source-over';
    }

    /* ---- edge print ---- */
    const num = index + 1;
    ctx.save();
    ctx.fillStyle = EDGE_INK;
    ctx.shadowColor = 'rgba(255, 110, 20, 0.9)';
    ctx.shadowBlur = 5;
    ctx.globalAlpha = between(0.78, 0.95);
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${Math.round(0.95 * MM)}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
    try {
      (ctx as unknown as { letterSpacing: string }).letterSpacing = '3px';
    } catch {
      /* older browsers: no letter spacing */
    }
    // left margin, reads bottom to top: frame number, then the stock name
    ctx.save();
    ctx.translate(1.02 * MM, H * between(0.9, 0.97));
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(String(num), 0, 0);
    ctx.fillText(stock, between(5, 9) * MM, 0);
    ctx.restore();
    // right margin, same reading direction: arrow, half-frame number, then the barcode
    ctx.save();
    ctx.translate(W - 1.02 * MM, H * between(0.88, 0.95));
    ctx.rotate(-Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, -0.38 * MM);
    ctx.lineTo(0.9 * MM, 0);
    ctx.lineTo(0, 0.38 * MM);
    ctx.closePath();
    ctx.fill();
    ctx.fillText(`${num}A`, 1.3 * MM, 0);
    let bx = between(8, 12) * MM;
    for (let i = 0; i < 16; i++) {
      const bw = (r() < 0.45 ? 0.5 : 0.22) * MM;
      const tall = r() < 0.6;
      if (r() < 0.82) ctx.fillRect(bx, tall ? -0.5 * MM : -0.1 * MM, bw, tall ? MM : 0.6 * MM);
      bx += bw + 0.16 * MM;
    }
    ctx.restore();
    ctx.restore();

    /* ---- scratches run along the length of the strip ---- */
    const scratches = 2 + Math.floor(r() * 4);
    for (let i = 0; i < scratches; i++) {
      let x = between(0, W);
      const y0 = r() < 0.5 ? 0 : between(0, H * 0.5);
      const y1 = r() < 0.5 ? H : between(H * 0.5, H);
      ctx.beginPath();
      ctx.moveTo(x, y0);
      for (let y = y0; y < y1; y += 60) {
        x += between(-1.2, 1.2);
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(255, 244, 230, ${between(0.05, 0.22)})`;
      ctx.lineWidth = between(0.5, 1.4);
      ctx.stroke();
    }

    /* ---- dust and hairs picked up in the scanner ---- */
    for (let i = 0; i < 70; i++) {
      ctx.beginPath();
      ctx.arc(between(0, W), between(0, H), between(0.4, r() < 0.1 ? 3 : 1.4), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 250, 240, ${between(0.2, 0.75)})`;
      ctx.fill();
    }
    for (let i = 0; i < 4; i++) {
      const x = between(0, W);
      const y = between(0, H);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(
        x + between(-30, 30),
        y + between(-30, 30),
        x + between(-50, 50),
        y + between(-50, 50),
        x + between(-70, 70),
        y + between(-70, 70),
      );
      ctx.strokeStyle = `rgba(255, 250, 240, ${between(0.25, 0.55)})`;
      ctx.lineWidth = between(0.6, 1.2);
      ctx.stroke();
    }
    // scuffing along the two long edges
    for (let i = 0; i < 26; i++) {
      const left = r() < 0.5;
      const x = left ? between(0, 14) : W - between(0, 14);
      const y = between(0, H);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + between(-5, 5), y + between(8, 46));
      ctx.strokeStyle = `rgba(210, 160, 110, ${between(0.08, 0.3)})`;
      ctx.lineWidth = between(0.6, 2.2);
      ctx.stroke();
    }

    /* ---- grain over everything ---- */
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = ctx.createPattern(getGrain(), 'repeat')!;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;

    /* ---- sprocket holes: backlight blooms around them, then they are punched clean through ---- */
    const holeW = 2.8 * MM;
    const holeH = 1.98 * MM;
    const pitch = 4.75 * MM;
    const first = (H - 7 * pitch) / 2 + between(-0.3, 0.3) * MM;
    const holes: [number, number][] = [];
    for (let i = 0; i < 8; i++) {
      const y = first + i * pitch - holeH / 2;
      holes.push([2 * MM, y], [W - 2 * MM - holeW, y]);
    }
    if (!dark) {
      ctx.fillStyle = 'rgba(255, 240, 220, 1)';
      ctx.shadowColor = 'rgba(255, 226, 190, 0.85)';
      ctx.shadowBlur = 20;
      for (const [x, y] of holes) {
        roundRect(ctx, x, y, holeW, holeH, 0.5 * MM);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }
    ctx.restore(); // drop the base clip

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000';
    for (const [x, y] of holes) {
      roundRect(ctx, x, y, holeW, holeH, 0.5 * MM);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  };

  return { canvas, draw };
}

/* ================================================================== */
/* The gallery                                                         */
/* ================================================================== */

export interface FilmGalleryProps {
  /** Image URLs, in roll order. */
  photos?: string[];
  /** Number of gray placeholder frames when no photos are passed. */
  count?: number;
  /** Film stock name printed on the frame edges. */
  stock?: string;
  /** 'auto' follows the system setting. Light is a white lightbox, dark is near black. */
  theme?: 'auto' | 'light' | 'dark';
  /** Overrides the theme's page background. */
  background?: string;
  /** Space between frames, as a fraction of a frame's height. */
  gap?: number;
  /** false (default) = the roll has a first and last frame. true = it wraps around forever. */
  loop?: boolean;
  /** true = vertical scrolling anywhere on the gallery moves the row too. Leave off when the
   * gallery sits in a page that needs to scroll; vertical scroll then only works over the dial. */
  verticalScroll?: boolean;
  /** Called when the active photo changes. */
  onChange?: (index: number) => void;
  className?: string;
  style?: CSSProperties;
}

// World units. A frame is FRAME_LONG tall when portrait and FRAME_LONG wide when landscape.
const FRAME_LONG = 1.25;
const FRAME_SHORT = FRAME_LONG * FILM_ASPECT;
const ACTIVE_SCALE = 1.32; // the center frame. Everything else is 1.
const CAMERA_Z = 6.6; // bigger = the whole row reads smaller
const LIFT = 0.08; // nudges the row up to leave room for the dial

// Dial: one tick per photo. The photo's tick grows into the tall dark one as it reaches the middle.
const TICK_W = 2;
const TICK_PX = TICK_W + 16; // tick pitch: 2px tick, 16px gap
const TICK_HEIGHTS = [48, 32, 22, 18, 14, 12, 10, 8, 7, 6, 5, 4, 4]; // by distance from the middle, in photos
const TICK_REACH = TICK_HEIGHTS.length - 1; // ticks shown either side of the middle
const CARD_PX = TICK_PX; // px of dial drag per photo

// Motion
const SETTLE = 11; // stiffness of the spring that settles onto a photo. Lower = softer and slower
const PROJECT = 0.15; // seconds of momentum a release carries forward when picking where to land
const INTENT = 0.2; // photos a swipe or drag must travel to count as "go to the next one"
const EDGE_MAX = 0.35; // photos the row can be pushed past either end, approached but never reached
const EDGE_BOUNCE = 0.1; // photos a glide may carry past an end before it springs back
const SLOW = 3; // photos/s below which a coasting trackpad swipe hands over to the settle
const IDLE_MS = 90; // no scroll events for this long means the fingers have stopped

const mod = (a: number, n: number) => ((a % n) + n) % n;
const sat = (v: number) => Math.min(1, Math.max(0, v));
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const pad = (n: number) => String(n).padStart(2, '0');

export default function FilmGallery({
  photos,
  count = 12,
  stock = 'KODAK GOLD 400',
  theme = 'auto',
  background,
  gap = 0.12,
  loop = false,
  verticalScroll = false,
  onChange,
  className,
  style,
}: FilmGalleryProps) {
  const n = photos && photos.length > 0 ? photos.length : count;

  const [systemDark, setSystemDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDark(mq.matches);
    const onScheme = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onScheme);
    return () => mq.removeEventListener('change', onScheme);
  }, []);
  const dark = theme === 'dark' || (theme === 'auto' && systemDark);
  const bg = background ?? (dark ? '#0a0a0a' : '#ffffff');
  // Dark mode uses the site's dark foreground.
  const ink = dark ? '231, 231, 231' : '0, 0, 0'; // counter
  const tickInk = dark ? '231, 231, 231' : '39, 39, 39';

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);
  const dialCanvasRef = useRef<HTMLCanvasElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [index, setIndex] = useState(0);

  // Everything the render loop reads lives in a ref, so the loop never restarts on input.
  const sim = useRef({
    pos: 0, // where the row is, in photos. Fractional while moving; unbounded when looping
    vel: 0, // photos per second
    target: 0 as number | null, // the photo it is settling on. null while a finger or swipe drives it
    pxPerPhoto: 270, // screen px per photo, so a swipe moves the row 1:1 with the fingers
    shown: 0, // the photo the counter shows
  });

  /** Move the row directly by d photos, with growing resistance past either end. Returns the move. */
  const drive = (d: number) => {
    const s = sim.current;
    s.target = null;
    const before = s.pos;
    if (!loop) {
      const over = s.pos < 0 ? -s.pos : s.pos > n - 1 ? s.pos - (n - 1) : 0;
      const outward = (s.pos <= 0 && d < 0) || (s.pos >= n - 1 && d > 0);
      if (outward) d *= (1 - Math.min(over / EDGE_MAX, 1)) ** 2;
      s.pos = clamp(s.pos + d, -EDGE_MAX, n - 1 + EDGE_MAX);
    } else {
      s.pos += d;
    }
    return s.pos - before;
  };

  /** Settle onto photo t from wherever the row is, keeping its velocity so a release glides in. */
  const settleTo = (t: number) => {
    const s = sim.current;
    const target = loop ? t : clamp(t, 0, n - 1);
    const x = s.pos - target;
    const speed = Math.abs(s.vel);
    // A critically damped spring only overshoots if it already heads for the target faster than this.
    if (s.vel * x < 0) s.vel = Math.sign(s.vel) * Math.min(speed, SETTLE * Math.abs(x));
    // Heading away from the target, as when a glide runs out past an end: it may carry
    // EDGE_BOUNCE at most before it turns back.
    else if (!loop && s.vel * x > 0) s.vel = Math.sign(s.vel) * Math.min(speed, EDGE_BOUNCE * SETTLE * Math.E);
    s.target = target;
  };

  /* ------------------------------ the scene ------------------------------ */
  useEffect(() => {
    const stage = stageRef.current!;
    const dialCanvas = dialCanvasRef.current!;
    const ctx = dialCanvas.getContext('2d')!;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const s = sim.current;
    let alive = true;

    if (!loop) {
      // the photo count may have shrunk under the dial
      s.pos = clamp(Math.round(s.pos), 0, n - 1);
      s.vel = 0;
      s.target = s.pos;
      s.shown = s.pos;
      setIndex(s.pos);
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(bg);
    renderer.domElement.style.display = 'block';
    stage.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    const geometry = new THREE.PlaneGeometry(1, 1);

    /* ---- row layout: frames can be two different widths, so positions are a running total ---- */
    const widths: number[] = new Array(n).fill(FRAME_SHORT);
    const sizes: [number, number][] = widths.map(() => [FRAME_SHORT, FRAME_LONG]);
    let centers: number[] = [];
    let loopLength = 0;
    const layOut = () => {
      centers = [0];
      for (let k = 1; k < n; k++) centers[k] = centers[k - 1]! + widths[k - 1]! / 2 + gap + widths[k]! / 2;
      loopLength = widths.reduce((sum, w) => sum + w, 0) + n * gap;
    };
    layOut();

    /** x of frame i when it is d frames from the center, before any scaling. */
    const rowX = (d: number, i: number) => {
      const p = i - d; // where the dial is
      if (!loop) {
        if (n < 2) return d * (FRAME_SHORT + gap);
        // Past either end (while rubber-banding) the last segment is extended.
        const j = clamp(Math.floor(p), 0, n - 2);
        return centers[i]! - (centers[j]! + (centers[j + 1]! - centers[j]!) * (p - j));
      }
      const at = (k: number) => centers[mod(k, n)]! + Math.floor(k / n) * loopLength;
      const pm = mod(p, n);
      const j = Math.floor(pm);
      return at(Math.round(pm + d)) - (at(j) + (at(j + 1) - at(j)) * (pm - j));
    };

    /* ---- one mesh per frame. The whole frame, photo included, is a canvas texture ---- */
    const makeTexture = (canvas: HTMLCanvasElement) => {
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return tex;
    };
    const materials: THREE.MeshBasicMaterial[] = [];
    const cards: THREE.Mesh[] = [];
    for (let i = 0; i < n; i++) {
      const frame = createFilmFrame(i, stock);
      frame.draw(undefined, { dark });
      const material = new THREE.MeshBasicMaterial({
        map: makeTexture(frame.canvas),
        transparent: true,
        alphaTest: 0.02, // so the sprocket holes are real holes
      });
      const url = photos?.[i];
      if (url) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (!alive) return;
          // A wide photo gets a landscape frame: the same film, turned on its side.
          const landscape = img.naturalWidth > img.naturalHeight * 1.05;
          frame.draw(img, { landscape, dark });
          material.map?.dispose(); // the canvas may have changed size, so start a fresh texture
          material.map = makeTexture(frame.canvas);
          material.needsUpdate = true;
          if (landscape) {
            sizes[i] = [FRAME_LONG, FRAME_SHORT];
            widths[i] = FRAME_LONG;
            layOut();
          }
        };
        img.src = url;
      }
      const mesh = new THREE.Mesh(geometry, material);
      materials.push(material);
      cards.push(mesh);
      scene.add(mesh);
    }

    /* ---- sizing ---- */
    let fit = 1; // pulls the camera back on narrow screens
    let stageH = 1;
    const resize = () => {
      const w = stage.clientWidth || 1;
      const h = stage.clientHeight || 1;
      stageH = h;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      fit = Math.max(1, 0.8 / camera.aspect);
      const dpr = Math.min(window.devicePixelRatio, 2);
      dialCanvas.width = Math.round(dialCanvas.clientWidth * dpr);
      dialCanvas.height = Math.round(dialCanvas.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    ro.observe(dialCanvas);
    resize();

    /* ---- the dial: one tick per photo, sized and shaded by its distance from the middle ---- */
    const drawDial = (pos: number) => {
      const w = dialCanvas.clientWidth;
      const h = dialCanvas.clientHeight;
      const cx = w / 2;
      ctx.clearRect(0, 0, w, h);
      for (let k = Math.ceil(pos - TICK_REACH - 1); k <= pos + TICK_REACH + 1; k++) {
        if (!loop && (k < 0 || k > n - 1)) continue; // the ruler ends with the roll
        const d = Math.abs(k - pos);
        const j = Math.min(Math.floor(d), TICK_REACH);
        const tickH = TICK_HEIGHTS[j]! + (TICK_HEIGHTS[Math.min(j + 1, TICK_REACH)]! - TICK_HEIGHTS[j]!) * (d - j);
        // Full ink at the middle, 20% elsewhere. The outermost tick fades in and out as it slides
        // past TICK_REACH, so ticks never pop.
        const alpha = (0.2 + 0.8 * sat(1 - d)) * sat(TICK_REACH + 1 - d);
        if (alpha <= 0) continue;
        ctx.fillStyle = `rgba(${tickInk}, ${alpha})`;
        ctx.beginPath();
        ctx.roundRect(cx + (k - pos) * TICK_PX - TICK_W / 2, h - tickH, TICK_W, tickH, TICK_W / 2);
        ctx.fill();
      }
    };

    /* ---- render loop ---- */
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // Settling: a critically damped spring, solved exactly so it feels the same at any frame rate.
      // While a finger or swipe drives the row, input moves pos directly instead.
      if (s.target !== null) {
        const x0 = s.pos - s.target;
        if (reduceMotion) {
          s.pos = s.target;
          s.vel = 0;
        } else {
          const decay = Math.exp(-SETTLE * dt);
          const c = s.vel + SETTLE * x0;
          s.pos = s.target + (x0 + c * dt) * decay;
          s.vel = (s.vel - SETTLE * c * dt) * decay;
        }
        if (Math.abs(s.pos - s.target) < 0.0005 && Math.abs(s.vel) < 0.01) {
          s.pos = s.target;
          s.vel = 0;
        }
      }
      const shown = loop ? mod(Math.round(s.pos), n) : clamp(Math.round(s.pos), 0, n - 1);
      if (shown !== s.shown) {
        s.shown = shown;
        setIndex(shown);
        onChangeRef.current?.(shown);
      }

      const pitch = loopLength / n; // average distance between frame centers
      for (let i = 0; i < n; i++) {
        const d = loop ? mod(i - s.pos + n / 2, n) - n / 2 : i - s.pos;
        const raw = rowX(d, i);
        const a = Math.abs(raw) / pitch; // distance from center, in frames
        // The center frame is ACTIVE_SCALE, easing down to 1 by the time a frame is one step away.
        // Positions are the running total of those sizes, so the bigger center pushes its neighbours out.
        const scale = a < 1 ? ACTIVE_SCALE - (ACTIVE_SCALE - 1) * a : 1;
        const travelled =
          a <= 1 ? ACTIVE_SCALE * a - ((ACTIVE_SCALE - 1) / 2) * a * a : (ACTIVE_SCALE + 1) / 2 + (a - 1);
        let opacity = sat((6.5 - Math.abs(d)) / 1.5);
        if (loop) opacity *= sat((n / 2 - Math.abs(d)) / 0.75); // hide the seam where the loop wraps
        const card = cards[i]!;
        const [w, h] = sizes[i]!;
        card.position.set(Math.sign(raw) * pitch * travelled, LIFT, 0);
        card.scale.set(scale * w, scale * h, 1);
        card.visible = opacity > 0.003;
        materials[i]!.opacity = opacity;
      }

      camera.position.z = CAMERA_Z * fit;
      const viewH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      s.pxPerPhoto = (pitch * stageH) / viewH;
      renderer.render(scene, camera);
      drawDial(s.pos);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    /* ---- click a frame to go to it ---- */
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const frameAt = (e: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(cards.filter((card) => card.visible), false)[0];
      return hit ? cards.indexOf(hit.object as THREE.Mesh) : -1;
    };
    let pressed: [number, number] | null = null;
    const press = (e: PointerEvent) => {
      pressed = [e.clientX, e.clientY];
    };
    const click = (e: PointerEvent) => {
      const from = pressed;
      pressed = null;
      if (!from || Math.hypot(e.clientX - from[0], e.clientY - from[1]) > 6) return;
      const i = frameAt(e);
      if (i < 0) return;
      // On a looping roll, go the short way round.
      settleTo(loop ? Math.round(s.pos + mod(i - s.pos + n / 2, n) - n / 2) : i);
    };
    const hover = (e: PointerEvent) => {
      const i = frameAt(e);
      stage.style.cursor = i >= 0 && i !== s.shown ? 'pointer' : '';
    };
    stage.addEventListener('pointerdown', press);
    stage.addEventListener('pointerup', click);
    stage.addEventListener('pointermove', hover);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      stage.removeEventListener('pointerdown', press);
      stage.removeEventListener('pointerup', click);
      stage.removeEventListener('pointermove', hover);
      ro.disconnect();
      geometry.dispose();
      materials.forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, bg, dark, gap, loop, stock, photos?.join('|')]);

  /* -------------------------------- input -------------------------------- */
  useEffect(() => {
    const root = rootRef.current!;
    const stage = stageRef.current!;
    const dial = dialRef.current!;
    const s = sim.current;

    // One gesture (a drag or a swipe): where it started, and its recent moves for the release speed.
    let from = 0;
    let samples: [number, number][] = []; // [time ms, photos moved]
    const begin = () => {
      from = s.target ?? Math.round(s.pos);
      samples = [];
      drive(0); // catch the row where it is, even mid-settle
    };
    const velocity = () => {
      const now = performance.now();
      samples = samples.filter(([t]) => now - t < 100);
      if (!samples.length) return 0;
      const span = Math.max(now - samples[0]![0], 16);
      return (samples.reduce((sum, [, d]) => sum + d, 0) / span) * 1000;
    };
    // Land where the momentum would carry it. A small deliberate move still goes one photo over.
    const release = () => {
      s.vel = velocity();
      let to = Math.round(s.pos + s.vel * PROJECT);
      if (to === from && Math.abs(s.pos - from) >= INTENT) to = from + Math.sign(s.pos - from);
      settleTo(to);
    };

    // Drag the dial: the ticks follow your finger, then the row glides and settles on release.
    // A press that barely moves is a tap instead, and goes to the tick under it.
    let dragging = false;
    let lastX = 0;
    let startX = 0;
    let travel = 0; // furthest the pointer got from where it went down, in px
    const down = (e: PointerEvent) => {
      dragging = true;
      lastX = startX = e.clientX;
      travel = 0;
      begin();
      dial.setPointerCapture(e.pointerId);
      dial.style.cursor = 'grabbing';
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      samples.push([performance.now(), drive(-(e.clientX - lastX) / CARD_PX)]);
      lastX = e.clientX;
      travel = Math.max(travel, Math.abs(e.clientX - startX));
    };
    const up = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      dial.style.cursor = 'grab';
      if (e.type === 'pointerup' && travel < 5) {
        const rect = dial.getBoundingClientRect();
        const k = Math.round(s.pos + (e.clientX - (rect.left + rect.width / 2)) / TICK_PX);
        const onRuler = Math.abs(k - s.pos) <= TICK_REACH && (loop || (k >= 0 && k <= n - 1));
        if (onRuler) {
          s.vel = 0;
          settleTo(k);
          return;
        }
      }
      release();
    };

    // Swipe the photos with a finger or pen: the row follows 1:1, then glides and settles on
    // release. A mouse clicks frames instead. A tap is left to the scene's click-to-frame;
    // if that didn't land on a frame, the row settles where the touch caught it.
    let swiping: number | null = null; // pointer id
    let swipeX = 0;
    let swipeStart = 0;
    let swipeTravel = 0;
    const swipeDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' || swiping !== null) return;
      swiping = e.pointerId;
      swipeX = swipeStart = e.clientX;
      swipeTravel = 0;
      begin();
      stage.setPointerCapture(e.pointerId);
    };
    const swipeMove = (e: PointerEvent) => {
      if (e.pointerId !== swiping) return;
      samples.push([performance.now(), drive(-(e.clientX - swipeX) / s.pxPerPhoto)]);
      swipeX = e.clientX;
      swipeTravel = Math.max(swipeTravel, Math.abs(e.clientX - swipeStart));
    };
    const swipeUp = (e: PointerEvent) => {
      if (e.pointerId !== swiping) return;
      swiping = null;
      if (e.type === 'pointerup' && swipeTravel < 6) {
        // After every pointerup listener, whatever order they were added in.
        setTimeout(() => {
          if (s.target === null && swiping === null) release();
        });
        return;
      }
      release();
    };

    // Scroll: horizontal anywhere on the gallery; vertical too with verticalScroll, otherwise only
    // over the dial. Scrolling down or right goes to the next photo.
    // The row follows the fingers 1:1 and rides the trackpad's own coasting, then settles once the
    // coast slows. Past an end it springs back as soon as the coasting starts.
    let lastWheel = 0;
    let lastMag = 0;
    let decaying = 0; // events in a row smaller than the one before: the trackpad coasting
    let coasting = false; // already settled; ignore the rest of this coast
    let idle = 0;
    const wheel = (e: WheelEvent) => {
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (!horizontal && !verticalScroll && !dial.contains(e.target as Node)) return; // let the page scroll
      e.preventDefault();
      const px = (horizontal ? e.deltaX : e.deltaY) * (e.deltaMode === 1 ? 16 : 1);
      if (!px) return;
      const now = performance.now();
      const mag = Math.abs(px);
      // A coast sends an event every frame, so a gap this long starts a new gesture. Matching
      // IDLE_MS keeps a mouse wheel's evenly spaced notches from being mistaken for a coast.
      const fresh = now - lastWheel > IDLE_MS;
      const grew = mag > lastMag + 1; // fingers pushing again, not a coast
      decaying = fresh || grew ? 0 : mag < lastMag ? decaying + 1 : decaying;
      lastWheel = now;
      lastMag = mag;
      if (coasting && !fresh && !grew) return;
      if (coasting || fresh) begin();
      coasting = false;

      samples.push([now, drive(px / s.pxPerPhoto)]);
      clearTimeout(idle);
      const past = !loop && (s.pos < 0 || s.pos > n - 1);
      if (decaying >= 2 && (past || Math.abs(velocity()) < SLOW)) {
        coasting = true;
        release();
        return;
      }
      idle = window.setTimeout(() => {
        coasting = true; // a straggling event from this swipe must not pull the row off its photo
        release();
      }, IDLE_MS);
    };

    const key = (e: KeyboardEvent) => {
      const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      const at = s.target ?? Math.round(s.pos);
      if (!loop && (at + dir < 0 || at + dir > n - 1)) {
        s.vel = dir * 2; // a small push against the end, which springs straight back
        settleTo(at);
        return;
      }
      settleTo(at + dir);
    };

    dial.addEventListener('pointerdown', down);
    dial.addEventListener('pointermove', move);
    dial.addEventListener('pointerup', up);
    dial.addEventListener('pointercancel', up);
    stage.addEventListener('pointerdown', swipeDown);
    stage.addEventListener('pointermove', swipeMove);
    stage.addEventListener('pointerup', swipeUp);
    stage.addEventListener('pointercancel', swipeUp);
    root.addEventListener('wheel', wheel, { passive: false });
    root.addEventListener('keydown', key);
    return () => {
      clearTimeout(idle);
      dial.removeEventListener('pointerdown', down);
      dial.removeEventListener('pointermove', move);
      dial.removeEventListener('pointerup', up);
      dial.removeEventListener('pointercancel', up);
      stage.removeEventListener('pointerdown', swipeDown);
      stage.removeEventListener('pointermove', swipeMove);
      stage.removeEventListener('pointerup', swipeUp);
      stage.removeEventListener('pointercancel', swipeUp);
      root.removeEventListener('wheel', wheel);
      root.removeEventListener('keydown', key);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, loop, verticalScroll]);

  /* -------------------------------- markup ------------------------------- */
  const counterCell: CSSProperties = {
    width: 20,
    padding: '10px 0',
    textAlign: 'center',
    fontFamily: 'var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)',
    fontSize: 12,
    lineHeight: 'normal',
    fontVariantNumeric: 'tabular-nums', // digits keep one width, so the counter doesn't jitter
  };

  return (
    <div
      ref={rootRef}
      className={className}
      tabIndex={-1}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: bg,
        outline: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        ...style,
      }}
    >
      {/* touch-action: none, or the browser takes the swipe to scroll or zoom the page. */}
      <div ref={stageRef} style={{ position: 'absolute', inset: 0, touchAction: 'none' }} />

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          ref={dialRef}
          role="slider"
          tabIndex={0}
          aria-label="Photo"
          aria-valuemin={1}
          aria-valuemax={n}
          aria-valuenow={index + 1}
          aria-valuetext={`Photo ${index + 1} of ${n}`}
          style={{
            width: `min(${TICK_REACH * 2 * TICK_PX + TICK_W}px, 92vw)`,
            height: TICK_HEIGHTS[0],
            cursor: 'grab',
            touchAction: 'none',
            outline: 'none',
          }}
        >
          <canvas ref={dialCanvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>
        <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center' }}>
          {[pad(index + 1), '/', pad(n)].map((text, i) => (
            <span key={i} style={{ ...counterCell, color: `rgba(${ink}, ${i === 0 ? 1 : 0.3})` }}>
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
