'use client';

import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';

/* ------------------------------------------------------------------ */
/* Breakaway: an isometric pixel-art 1v1 against the keeper, plus      */
/* free kicks.                                                         */
/* Everything is drawn pixel by pixel into a 328x180 buffer, then      */
/* scaled up. No assets, no dependencies.                              */
/* ------------------------------------------------------------------ */

const LW = 328;
const LH = 180;
const OX = 134;
const OY = 18;

// Field, in world units. x runs along the goal line, y runs away from goal.
const FW = 160;
const FD = 112;
const MX = 8;
const MTOP = 16;
const MBOT = 8;
const GL = 58;
const GR = 102;
const GH = 19;
const GDEP = 9;
const GCX = 80;

const STRIKER_SPEED = 47.6;

type Buf = Uint32Array;
type Vec = { x: number; y: number };
type GameState = 'idle' | 'play' | 'shot' | 'goal' | 'fail';

interface Mover {
  x: number;
  y: number;
  fx: number;
  fy: number;
  phase: number;
  moving: boolean;
}

interface Kit {
  shirt: number;
  shade: number;
  shorts: number;
  sock: number;
  boot: number;
  skin: number;
  hair: number;
  glove: number;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  c: number;
}

/* ---------------------------- colour ------------------------------ */

const col = (hex: number): number =>
  (0xff000000 | ((hex & 0xff) << 16) | (hex & 0xff00) | ((hex >> 16) & 0xff)) >>> 0;

const C = {
  grassA: col(0x4f9a3f),
  grassB: col(0x468c38),
  grassLiA: col(0x5caa48),
  grassLiB: col(0x529a41),
  grassDkA: col(0x438636),
  grassDkB: col(0x3c7a31),
  tuft: col(0x356e2c),
  line: col(0xeef0e2),
  lineDull: col(0xd3dac4),
  lip: col(0x2f6328),
  soilL: col(0x8a6642),
  soilL2: col(0x7a5839),
  soilR: col(0x6b4c30),
  soilR2: col(0x5c4029),
  post: col(0xf4f4ee),
  postShade: col(0xbfc4c0),
  netBack: col(0xb9c8c0),
  netFront: col(0xe6ece8),
  bar: col(0x9aa3a0),
  boardBg: col(0x1b212c),
  boardEdge: col(0x3b4556),
  boardLabel: col(0x8f9bad),
  boardNow: col(0xffc83a),
  boardBest: col(0xf1f3f5),
  boardPost: col(0x2a303b),
  ball: col(0xfafafa),
  ballShade: col(0xc4c8cc),
  ballDark: col(0x23272e),
  flag: col(0xd9412f),
  flagDk: col(0xa93022),
  pole: col(0xe2e2dc),
  shadow: col(0x12240f),
  text: col(0xffffff),
  textGold: col(0xffc83a),
  outline: col(0x141a22),
  barBg: col(0x3a4352),
  ghost: col(0x6f7b8c),
  barSweet: col(0x8a6f24),
  barOver: col(0x7a2a22),
};

const KIT_STRIKER: Kit = {
  shirt: col(0xd9412f),
  shade: col(0xa93022),
  shorts: col(0xf0f0ea),
  sock: col(0xd9412f),
  boot: col(0x1c1c1c),
  skin: col(0xe0a878),
  hair: col(0x2c1d14),
  glove: col(0xe0a878),
};
const KIT_DEFENDER: Kit = {
  shirt: col(0x2f62b8),
  shade: col(0x23498a),
  shorts: col(0x1a2b52),
  sock: col(0x2f62b8),
  boot: col(0x1c1c1c),
  skin: col(0x93603f),
  hair: col(0x141010),
  glove: col(0x93603f),
};
const KIT_KEEPER: Kit = {
  shirt: col(0xf2c230),
  shade: col(0xc8991d),
  shorts: col(0x23272e),
  sock: col(0xf2c230),
  boot: col(0x1c1c1c),
  skin: col(0xd69a6a),
  hair: col(0x5a3a1e),
  glove: col(0xffffff),
};

/* ---------------------------- helpers ----------------------------- */

function hash(x: number, y: number): number {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const clamp = (v: number, a: number, b: number): number => (v < a ? a : v > b ? b : v);
const sxOf = (x: number, y: number): number => OX + x - y;
const syOf = (x: number, y: number, z: number): number => OY + (x + y) / 2 - z;

function put(buf: Buf, x: number, y: number, c: number): void {
  x = Math.round(x);
  y = Math.round(y);
  if (x < 0 || y < 0 || x >= LW || y >= LH) return;
  buf[y * LW + x] = c;
}

/** Blend c over whatever is there, but only where the island exists. */
function mix(buf: Buf, x: number, y: number, c: number, a: number): void {
  x = Math.round(x);
  y = Math.round(y);
  if (x < 0 || y < 0 || x >= LW || y >= LH) return;
  const i = y * LW + x;
  const d = buf[i]!;
  if (d >>> 24 === 0) return;
  const r = (d & 255) + ((c & 255) - (d & 255)) * a;
  const g = ((d >> 8) & 255) + (((c >> 8) & 255) - ((d >> 8) & 255)) * a;
  const b = ((d >> 16) & 255) + (((c >> 16) & 255) - ((d >> 16) & 255)) * a;
  buf[i] = (0xff000000 | (b << 16) | (g << 8) | r) >>> 0;
}

function line3(
  buf: Buf,
  x0: number,
  y0: number,
  z0: number,
  x1: number,
  y1: number,
  z1: number,
  c: number,
  thick = 1,
): void {
  const ax = sxOf(x0, y0);
  const ay = syOf(x0, y0, z0);
  const bx = sxOf(x1, y1);
  const by = syOf(x1, y1, z1);
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(bx - ax), Math.abs(by - ay))));
  for (let i = 0; i <= n; i++) {
    const px = Math.round(ax + ((bx - ax) * i) / n);
    const py = Math.floor(ay + ((by - ay) * i) / n);
    for (let k = 0; k < thick; k++) put(buf, px, py + k, c);
  }
}

function netPlane(
  buf: Buf,
  ax: number,
  ay: number,
  az: number,
  ux: number,
  uy: number,
  uz: number,
  ulen: number,
  vx: number,
  vy: number,
  vz: number,
  vlen: number,
  c: number,
  sparse: boolean,
): void {
  for (let i = 0; i <= ulen; i += 0.5) {
    for (let j = 0; j <= vlen; j += 0.5) {
      const x = ax + ux * i + vx * j;
      const y = ay + uy * i + vy * j;
      const z = az + uz * i + vz * j;
      const px = Math.round(sxOf(x, y));
      const py = Math.round(syOf(x, y, z));
      const on = sparse ? (px + py * 2) % 4 === 0 : ((px + py) & 1) === 0;
      if (on) put(buf, px, py, c);
    }
  }
}

/* ------------------------------ font ------------------------------ */

const FONT: Record<string, number[]> = {
  A: [2, 5, 7, 5, 5], B: [6, 5, 6, 5, 6], C: [3, 4, 4, 4, 3], D: [6, 5, 5, 5, 6],
  E: [7, 4, 6, 4, 7], F: [7, 4, 6, 4, 4], G: [3, 4, 5, 5, 3], H: [5, 5, 7, 5, 5],
  I: [7, 2, 2, 2, 7], J: [1, 1, 1, 5, 2], K: [5, 5, 6, 5, 5], L: [4, 4, 4, 4, 7],
  M: [5, 7, 5, 5, 5], N: [6, 5, 5, 5, 5], O: [2, 5, 5, 5, 2], P: [6, 5, 6, 4, 4],
  Q: [2, 5, 5, 6, 3], R: [6, 5, 6, 5, 5], S: [3, 4, 2, 1, 6], T: [7, 2, 2, 2, 2],
  U: [5, 5, 5, 5, 7], V: [5, 5, 5, 5, 2], W: [5, 5, 5, 7, 5], X: [5, 5, 2, 5, 5],
  Y: [5, 5, 2, 2, 2], Z: [7, 1, 2, 4, 7],
  '0': [7, 5, 5, 5, 7], '1': [2, 6, 2, 2, 7], '2': [7, 1, 7, 4, 7], '3': [7, 1, 7, 1, 7],
  '4': [5, 5, 7, 1, 1], '5': [7, 4, 7, 1, 7], '6': [7, 4, 7, 5, 7], '7': [7, 1, 1, 1, 1],
  '8': [7, 5, 7, 5, 7], '9': [7, 5, 7, 1, 7],
  '!': [2, 2, 2, 0, 2], ':': [0, 2, 0, 2, 0], '/': [1, 1, 2, 4, 4], '+': [0, 2, 7, 2, 0],
  '.': [0, 0, 0, 0, 2], '-': [0, 0, 7, 0, 0], ' ': [0, 0, 0, 0, 0],
};

/* --------------------------- background --------------------------- */

const near = (d: number): boolean => d >= -1 && d < 1;

function isLine(x: number, y: number): boolean {
  if (near(y) && x >= -1 && x < FW + 1) return true; // goal line
  if (y >= 0 && (near(x) || near(x - FW))) return true; // touchlines, run off the crop
  if (y >= 0 && y < 51 && (near(x - 23) || near(x - 137))) return true; // box sides
  if (near(y - 50) && x >= 23 && x < 138) return true; // box top
  if (y >= 0 && y < 19 && (near(x - 45) || near(x - 115))) return true; // six yard
  if (near(y - 18) && x >= 45 && x < 116) return true;
  const ds = Math.hypot(x - GCX, y - 35);
  if (ds < 1.5) return true; // spot
  if (y > 50.5 && Math.abs(ds - 28) < 0.9) return true; // the D
  if (x > 0 && y > 0 && Math.abs(Math.hypot(x, y) - 4.5) < 0.8) return true;
  if (x < FW && y > 0 && Math.abs(Math.hypot(x - FW, y) - 4.5) < 0.8) return true;
  return false;
}

function buildBackground(): Buf {
  const bg = new Uint32Array(LW * LH);
  const apexX = OX + (FW + MX) - (FD + MBOT);
  for (let py = 0; py < LH; py++) {
    for (let px = 0; px < LW; px++) {
      const u = px - OX;
      const v = py - OY;
      const x = u / 2 + v;
      const y = v - u / 2;
      const d = Math.min(x + MX, FW + MX - x, y + MTOP, FD + MBOT - y);
      const r = hash(px, py);
      if (!(d > 1.6 || (d > 0 && r < 0.72) || (d > -1.6 && r < 0.26))) continue;
      const n = hash(px + 71, py + 13);
      const band = Math.floor((y + 140) / 14) & 1;
      let c: number;
      if (d > 0.5 && isLine(x, y)) c = n > 0.9 ? C.lineDull : C.line;
      else if (d < 2.4 && n < 0.6) c = C.tuft;
      else if (n < 0.1) c = band ? C.grassLiA : C.grassLiB;
      else if (n > 0.86) c = band ? C.grassDkA : C.grassDkB;
      else c = band ? C.grassA : C.grassB;
      bg[py * LW + px] = c;
    }
  }
  // the slab: a dark grass lip, then soil with a ragged bottom
  for (let px = 0; px < LW; px++) {
    let low = -1;
    for (let py = LH - 1; py >= 0; py--) {
      if (bg[py * LW + px] !== 0) {
        low = py;
        break;
      }
    }
    if (low < 0) continue;
    const depth = 9 + Math.floor(hash(px, 999) * 3);
    const left = px < apexX;
    for (let k = 1; k <= depth; k++) {
      const py = low + k;
      if (py >= LH) break;
      const n = hash(px + 5, py + 77);
      if (k === depth && n < 0.5) continue;
      let c: number;
      if (k <= 2) c = n < 0.25 ? C.tuft : C.lip;
      else if (left) c = n < 0.3 ? C.soilL2 : C.soilL;
      else c = n < 0.3 ? C.soilR2 : C.soilR;
      bg[py * LW + px] = c;
    }
  }
  return bg;
}

/* ----------------------------- sprites ---------------------------- */

function drawShadow(buf: Buf, x: number, y: number, r: number): void {
  const bx = Math.round(sxOf(x, y));
  const by = Math.round(syOf(x, y, 0));
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (Math.abs(dx) + Math.abs(dy) * 2 > r) continue;
      mix(buf, bx + dx, by + dy, C.shadow, 0.42);
    }
  }
}

/** Striker only: `wind` is the leg drawn back while charging, `kick` runs 0..1 through the swing, `s` is the screen side the shot goes. */
interface Pose {
  wind: boolean;
  kick: number;
  s: number;
  up: boolean;
}

function drawPlayer(buf: Buf, p: Mover, z: number, kit: Kit, pose?: Pose): void {
  drawShadow(buf, p.x, p.y, 4);
  const bx = Math.round(sxOf(p.x, p.y));
  const by = Math.round(syOf(p.x, p.y, z));
  const away = p.fx + p.fy < -0.05;
  const f = p.moving ? Math.floor(p.phase) & 1 : -1;
  if (pose && (pose.wind || pose.kick >= 0)) {
    // one leg planted, the other drawn back, swinging through, or up in the follow-through
    const s = pose.s;
    const plant = pose.wind ? bx + s : bx - s;
    for (let r = 0; r < 4; r++) put(buf, plant, by - r, r === 0 ? kit.boot : r === 1 ? kit.sock : kit.skin);
    if (pose.wind) {
      put(buf, bx - s, by - 3, kit.skin);
      put(buf, bx - 2 * s, by - 2, kit.sock);
      put(buf, bx - 3 * s, by - 2, kit.boot);
    } else if (pose.kick < 0.4) {
      put(buf, bx + s, by - 2, kit.skin);
      put(buf, bx + 2 * s, by - 1, kit.sock);
      put(buf, bx + 3 * s, by - 1, kit.boot);
    } else {
      put(buf, bx + s, by - 3, kit.skin);
      put(buf, bx + 2 * s, by - 3, kit.sock);
      put(buf, bx + 3 * s, by - 4, kit.boot);
    }
  } else {
    for (let r = 0; r < 4; r++) {
      const c = r === 0 ? kit.boot : r === 1 ? kit.sock : kit.skin;
      if (!(f === 0 && r === 0)) put(buf, bx - 1, by - r, c);
      if (!(f === 1 && r === 0)) put(buf, bx + 1, by - r, c);
    }
    if (f === 0) put(buf, bx - 2, by - 1, kit.boot);
    if (f === 1) put(buf, bx + 2, by - 1, kit.boot);
  }
  for (let r = 4; r <= 5; r++) for (let k = -1; k <= 1; k++) put(buf, bx + k, by - r, kit.shorts);
  for (let r = 6; r <= 9; r++) {
    put(buf, bx - 1, by - r, kit.shirt);
    put(buf, bx, by - r, kit.shirt);
    put(buf, bx + 1, by - r, kit.shade);
  }
  const swing = f === 0 ? 1 : 0;
  put(buf, bx - 2, by - 9, kit.shirt);
  put(buf, bx + 2, by - 9, kit.shade);
  if (pose && pose.up) {
    // arms thrown up after a sweet strike
    for (const k of [-2, 2]) {
      put(buf, bx + k, by - 10, kit.skin);
      put(buf, bx + k, by - 11, kit.skin);
    }
  } else {
    put(buf, bx - 2, by - 8, kit.skin);
    put(buf, bx + 2, by - 8, kit.skin);
    put(buf, bx - 2, by - 7 + swing, kit.glove);
    put(buf, bx + 2, by - 7 + (f === 1 ? 1 : 0), kit.glove);
  }
  for (let r = 10; r <= 12; r++) {
    for (let k = -1; k <= 1; k++) {
      const hairRow = r === 12 || (away && r === 11);
      put(buf, bx + k, by - r, hairRow ? kit.hair : kit.skin);
    }
  }
  if (!away) put(buf, bx - 1, by - 11, kit.hair);
}

/** A keeper at full stretch: the body is laid out along the dive direction. */
function drawDive(buf: Buf, p: Mover, z: number, dsx: number, dsy: number, kit: Kit): void {
  drawShadow(buf, p.x, p.y, 5);
  const bx = Math.round(sxOf(p.x, p.y));
  const by = Math.round(syOf(p.x, p.y, z)) - 2;
  for (let i = -6; i <= 7; i++) {
    const px = bx + Math.round(dsx * i);
    const py = by + Math.round(dsy * i);
    let c: number;
    let thick = 3;
    if (i <= -5) {
      c = kit.boot;
      thick = 2;
    } else if (i <= -3) {
      c = kit.sock;
      thick = 2;
    } else if (i <= -1) c = kit.shorts;
    else if (i <= 3) c = kit.shirt;
    else if (i <= 5) c = i === 5 ? kit.hair : kit.skin;
    else {
      c = kit.glove;
      thick = 2;
    }
    for (let k = 0; k < thick; k++) put(buf, px, py - k, k === 0 && i >= 0 && i <= 3 ? kit.shade : c);
  }
}

function drawBall(buf: Buf, x: number, y: number, z: number, spin: number): void {
  drawShadow(buf, x, y, z > 2 ? 1 : 2);
  const bx = Math.round(sxOf(x, y));
  const by = Math.round(syOf(x, y, z));
  for (let dy = -2; dy <= 0; dy++)
    for (let dx = -1; dx <= 1; dx++) put(buf, bx + dx, by + dy, dy === 0 ? C.ballShade : C.ball);
  const s = Math.floor(spin) & 3;
  const sx = s === 0 || s === 3 ? -1 : 1;
  const sy = s < 2 ? -2 : -1;
  put(buf, bx + sx, by + sy, C.ballDark);
  put(buf, bx, by - 1, s & 1 ? C.ball : C.ballShade);
}

function drawFlag(buf: Buf, x: number, y: number, t: number): void {
  drawShadow(buf, x, y, 1);
  const bx = Math.round(sxOf(x, y));
  const by = Math.round(syOf(x, y, 0));
  for (let k = 0; k <= 11; k++) put(buf, bx, by - k, C.pole);
  const w = Math.floor(t * 3 + x) & 1;
  for (let r = 0; r < 3; r++)
    for (let k = 1; k <= 4; k++)
      put(buf, bx + k, by - 11 + r + (k > 2 ? w : 0), r === 2 ? C.flagDk : C.flag);
}

function drawGoalBack(buf: Buf): void {
  netPlane(buf, GL, -GDEP, 0, 1, 0, 0, GR - GL, 0, 0, 1, GH, C.netBack, false);
  netPlane(buf, GL, -GDEP, 0, 0, 1, 0, GDEP, 0, 0, 1, GH, C.netBack, false);
  line3(buf, GL, -GDEP, 0, GL, -GDEP, GH, C.bar);
  line3(buf, GR, -GDEP, 0, GR, -GDEP, GH, C.bar);
  line3(buf, GL, -GDEP, GH, GR, -GDEP, GH, C.bar);
}

function drawGoalFront(buf: Buf): void {
  netPlane(buf, GL, -GDEP, GH, 1, 0, 0, GR - GL, 0, 1, 0, GDEP, C.netFront, true);
  netPlane(buf, GR, -GDEP, 0, 0, 1, 0, GDEP, 0, 0, 1, GH, C.netFront, true);
  line3(buf, GL, 0, GH, GL, -GDEP, GH, C.bar);
  line3(buf, GR, 0, GH, GR, -GDEP, GH, C.bar);
  for (const gx of [GL, GR]) {
    const px = Math.round(sxOf(gx, 0));
    const py = Math.round(syOf(gx, 0, 0));
    for (let k = 0; k <= GH; k++) {
      put(buf, px, py - k, C.post);
      put(buf, px + 1, py - k, C.postShade);
    }
  }
  line3(buf, GL, 0, GH + 1, GR, 0, GH + 1, C.post, 1);
  line3(buf, GL, 0, GH, GR, 0, GH, C.postShade, 1);
}

const BOARD_X = 114;
const BOARD_Y = -10;
const BOARD_W = 40;
const BOARD_H = 19;
const BOARD_Z = 10;

function boardPut(buf: Buf, c: number, r: number, color: number): void {
  const x = BOARD_X + c;
  put(buf, OX + x - BOARD_Y, OY + ((x + BOARD_Y) >> 1) - (BOARD_Z + BOARD_H - 1) + r, color);
}

function boardText(buf: Buf, str: string, c0: number, r0: number, w: number, h: number, color: number): void {
  let cc = c0;
  for (const ch of str) {
    const g = FONT[ch] || FONT[' ']!;
    for (let r = 0; r < 5; r++)
      for (let k = 0; k < 3; k++)
        if (g[r]! & (4 >> k))
          for (let oy = 0; oy < h; oy++)
            for (let ox = 0; ox < w; ox++) boardPut(buf, cc + k * w + ox, r0 + r * h + oy, color);
    cc += 3 * w + 1;
  }
}

function drawBoard(buf: Buf, now: number, best: number): void {
  for (const bx of [BOARD_X + 5, BOARD_X + BOARD_W - 6]) {
    line3(buf, bx, BOARD_Y, 0, bx, BOARD_Y, BOARD_Z, C.boardPost);
    line3(buf, bx + 1, BOARD_Y, 0, bx + 1, BOARD_Y, BOARD_Z, C.boardPost);
  }
  for (let c = 0; c < BOARD_W; c++) {
    for (let r = 0; r < BOARD_H; r++) {
      const edge = c === 0 || r === 0 || c === BOARD_W - 1 || r === BOARD_H - 1;
      boardPut(buf, c, r, edge ? C.boardEdge : C.boardBg);
    }
  }
  const two = (n: number): string => String(Math.min(99, n)).padStart(2, '0');
  boardText(buf, 'NOW', 5, 2, 1, 1, C.boardLabel);
  boardText(buf, 'BEST', 22, 2, 1, 1, C.boardLabel);
  boardText(buf, two(now), 4, 8, 2, 2, C.boardNow);
  boardText(buf, two(best), 23, 8, 2, 2, C.boardBest);
  for (let r = 8; r < 17; r += 2) boardPut(buf, 19, r, C.boardEdge);
}

/* ------------------------- goal lettering ------------------------- */

const BIG: Record<string, number[]> = {
  G: [14, 17, 16, 23, 17, 17, 14],
  O: [14, 17, 17, 17, 17, 17, 14],
  A: [14, 17, 17, 31, 17, 17, 17],
  L: [16, 16, 16, 16, 16, 16, 31],
};
const GOLD = {
  hi: col(0xfff1a8),
  mid: col(0xffc83a),
  lo: col(0xf09a1e),
  side: col(0xa8610f),
  shine: col(0xffffff),
};

/** Chunky gold GOAL that bounces in over the pitch, letter by letter, with a shine sweeping across. */
function drawGoalText(buf: Buf, age: number): void {
  if (age > 1.38) return;
  const S = 3;
  const word = 'GOAL';
  const letterW = 5 * S + 3;
  const x0 = Math.round(sxOf(GCX, 52)) - Math.floor((word.length * letterW - 3) / 2);
  const yBase = Math.round(syOf(GCX, 52, 0)) - 40;
  const sweep = x0 - 14 + (age - 0.3) * 190;
  const cells: { x: number; y: number; band: number }[] = [];
  for (let i = 0; i < word.length; i++) {
    const tl = age - i * 0.07;
    if (tl < 0) continue;
    // drop in, overshoot, settle
    const drop = tl < 0.5 ? Math.round(-22 * Math.exp(-tl * 9) * Math.cos(tl * 16)) : 0;
    const g = BIG[word[i]!]!;
    for (let r = 0; r < 7; r++)
      for (let k = 0; k < 5; k++)
        if (g[r]! & (16 >> k))
          for (let oy = 0; oy < S; oy++)
            for (let ox = 0; ox < S; ox++)
              cells.push({ x: x0 + i * letterW + k * S + ox, y: yBase + drop + r * S + oy, band: (r * S + oy) / (7 * S) });
  }
  for (const c of cells) for (let dy = -1; dy <= 4; dy++) for (let dx = -1; dx <= 1; dx++) put(buf, c.x + dx, c.y + dy, C.outline);
  for (const c of cells) for (let dy = 1; dy <= 3; dy++) put(buf, c.x, c.y + dy, GOLD.side);
  for (const c of cells) {
    const d = c.x - c.y * 0.6 - sweep;
    const lit = d >= 0 && d < 5;
    put(buf, c.x, c.y, lit ? GOLD.shine : c.band < 0.3 ? GOLD.hi : c.band < 0.72 ? GOLD.mid : GOLD.lo);
  }
}

/* ------------------------------ fire ------------------------------ */

// one ramp per tier, hottest first: orange, green, blue, purple, then back to orange
type Ramp = [number, number, number, number];
const FIRE: Ramp[] = (
  [
    [0xfff3b0, 0xffc233, 0xff7a1a, 0xc9340f],
    [0xf1ffc0, 0xa8f04a, 0x3fc93f, 0x1f7f3a],
    [0xe6fbff, 0x7fd8ff, 0x2f8dff, 0x2447c9],
    [0xfbe6ff, 0xe09bff, 0xa44dff, 0x5e22b8],
  ] as Ramp[]
).map((r) => r.map(col) as Ramp);

/** Flames along a goal bar. `level` runs from about 0.3 (embers) to 1 (full burst). */
function drawFire(buf: Buf, y: number, level: number, tier: number, t: number): void {
  const ramp = FIRE[tier % FIRE.length]!;
  const tick = Math.floor(t * 14);
  for (let x = GL; x <= GR; x++) {
    const px = Math.round(sxOf(x, y));
    const base = Math.round(syOf(x, y, GH + 1)) - 1;
    const wave = (0.5 + 0.5 * Math.sin(x * 0.9 + t * 13)) * (0.5 + 0.5 * Math.sin(x * 0.37 - t * 7));
    const hgt = Math.round(level * (3 + 12 * wave + 4 * hash(x, tick)));
    for (let k = 0; k < hgt; k++) {
      const f = k / hgt;
      if (f > 0.7 && hash(px + k * 7, tick) > 0.55) continue; // ragged tips
      put(buf, px, base - k, f < 0.22 ? ramp[0] : f < 0.5 ? ramp[1] : f < 0.8 ? ramp[2] : ramp[3]);
    }
  }
}

/** Flames clinging to a front post, licking up and outward on both sides. Used only for the big tier burst. */
function drawPostFire(buf: Buf, gx: number, level: number, tier: number, t: number): void {
  const ramp = FIRE[tier % FIRE.length]!;
  const tick = Math.floor(t * 14);
  const px = Math.round(sxOf(gx, 0));
  const foot = Math.round(syOf(gx, 0, 0));
  for (let k = 1; k <= GH; k++) {
    for (const dir of [-1, 1]) {
      const wave = 0.5 + 0.5 * Math.sin(k * 1.1 + t * 12 + dir * 2);
      const len = Math.round(level * (1 + 4 * wave + 2 * hash(k * 3 + dir, tick)));
      for (let j = 0; j < len; j++) {
        const f = j / len;
        if (f > 0.6 && hash(k + j * 5 + dir, tick) > 0.6) continue;
        put(buf, px + (dir > 0 ? 2 : -1) + dir * j, foot - k - j, f < 0.25 ? ramp[0] : f < 0.5 ? ramp[1] : f < 0.8 ? ramp[2] : ramp[3]);
      }
    }
  }
}

/* --------------------------- difficulty --------------------------- */

function params(s: number) {
  // ramps over the first 12 goals (steeper early), then holds
  const L = Math.pow(Math.min(s, 12) / 12, 0.7);
  const lerp = (a: number, b: number): number => a + (b - a) * L;
  return {
    L,
    react: lerp(0.28, 0.1),
    diveSp: lerp(85, 130),
    diveMax: lerp(11, 19),
    shuffle: lerp(26, 38),
    offLine: lerp(5, 17),
    rushR: lerp(26, 40),
    rushSp: lerp(31, 41),
    stall: lerp(8, 5),
    defN: s >= 11 ? 3 : s >= 6 ? 2 : s >= 2 ? 1 : 0,
    defSp: STRIKER_SPEED * lerp(0.52, 0.7),
    spread: lerp(8, 62),
    sweetW: lerp(0.13, 0.075),
    chargeT: lerp(1.15, 0.9), // seconds for the bar to fill
    wallN: s >= 8 ? 4 : s >= 3 ? 3 : 2,
  };
}

/* ------------------------- shot shaping --------------------------- */

const SWEET_LO = 0.76; // where the sweet spot starts on the bar
const AIR = 0.35;
const AIM_SHIFT = (GR - GL) / 8; // a full drag nudges the landing spot this far along the goal line
const GRAVITY = 80;

type Quality = 'soft' | 'driven' | 'sweet' | 'over';
interface Shot {
  v: number; // pace
  hT: number; // height when it reaches the goal line
  quality: Quality;
}

/** One bar sets pace and height: roller, driven, sweet spot, skied. */
function shotFromPower(p: number, sweetW: number): Shot {
  const hi = SWEET_LO + sweetW;
  if (p >= hi) return { v: 205, hT: GH * (1.3 + (0.9 * (p - hi)) / (1 - hi)), quality: 'over' };
  if (p >= SWEET_LO) return { v: 200, hT: GH * 0.84, quality: 'sweet' };
  if (p < 0.35) return { v: 70 + (p / 0.35) * 50, hT: 0, quality: 'soft' };
  const d = (p - 0.35) / (SWEET_LO - 0.35);
  return { v: 120 + d * 70, hT: 1 + d * GH * 0.34, quality: 'driven' };
}

/** A curled shot is a circular arc that still ends on the target. */
interface Arc {
  x0: number;
  y0: number;
  h0: number;
  k: number;
  len: number;
}

function makeArc(bx: number, by: number, tx: number, ty: number, curl: number): Arc {
  const d = Math.hypot(tx - bx, ty - by) || 1;
  const chord = Math.atan2(ty - by, tx - bx);
  const th = curl * 0.6;
  if (Math.abs(th) < 1e-3) return { x0: bx, y0: by, h0: chord, k: 0, len: d };
  return { x0: bx, y0: by, h0: chord - th, k: (2 * Math.sin(th)) / d, len: (d * th) / Math.sin(th) };
}

function arcAt(a: Arc, s: number): Vec {
  if (a.k === 0) return { x: a.x0 + Math.cos(a.h0) * s, y: a.y0 + Math.sin(a.h0) * s };
  const h = a.h0 + a.k * s;
  return { x: a.x0 + (Math.sin(h) - Math.sin(a.h0)) / a.k, y: a.y0 - (Math.cos(h) - Math.cos(a.h0)) / a.k };
}

/** Arc length at which the path crosses the goal line, or the target if it never does. */
function arcToLine(a: Arc): number {
  const max = a.len * 1.5 + 20;
  for (let s = 1; s < max; s += 1) if (arcAt(a, s).y <= 0) return s;
  return a.len;
}

const flightTime = (s: number, v: number): number => -Math.log(Math.max(0.05, 1 - (AIR * s) / v)) / AIR;

/* ----------------------------- engine ----------------------------- */

export type Mode = 'run' | 'fk';

export interface Hud {
  head: string;
  sub: string;
  hints: string[];
}

export interface Engine {
  step(dt: number): void;
  render(buf: Buf): void;
  setKeys(dx: number, dy: number): void;
  setStick(u: number, v: number): void;
  press(aim: Vec | null): void;
  setCurl(c: number): void;
  setTouch(on: boolean): void;
  release(): void;
  setMode(m: Mode): void;
  hud(touch: boolean): Hud;
  aimFromScreen(lx: number, ly: number): Vec;
  readonly mode: Mode;
  readonly state: GameState;
  readonly streak: number;
  readonly charging: boolean;
  readonly power: number;
}

export const LOGICAL_WIDTH = LW;
export const LOGICAL_HEIGHT = LH;

export function createEngine(
  initialBest: Record<Mode, number> = { run: 0, fk: 0 },
  onBest?: (mode: Mode, n: number) => void,
): Engine {
  const bg = buildBackground();

  let mode: Mode = 'run';
  let state: GameState = 'idle';
  let streak = 0;
  const best: Record<Mode, number> = { run: initialBest.run, fk: initialBest.fk };
  let ended = 0;
  let t = 0;
  let stateT = 0;
  let playT = 0;
  let armed = false;
  let fk = false;
  let failMsg = '';
  let lastQuality: Quality = 'driven';
  let kickT = -1; // seconds since the ball was struck, -1 when there is no kick to show
  let trailT = 0;
  let fireBurst = 0; // seconds of burst left; it eases down to embers over the last 0.6s
  let fireBig = false; // the tier goals (5, 10, 15...) get the bigger burst that wraps the posts
  let sparkT = 0;
  let kdx = 0;
  let kdy = 0;
  let su = 0;
  let sv = 0;

  let charging = false;
  let power = 0;
  let curl = 0;
  let aim: Vec = { x: GCX, y: 0 };
  // where the shot starts aimed: a clicked point, along the striker's run, or the free kick marker
  let aimMode: 'point' | 'facing' | 'marker' = 'point';
  let fkAimX = GCX;
  let touchUi = false;

  const striker: Mover = { x: GCX, y: 100, fx: 0, fy: -1, phase: 0, moving: false };
  const keeper = {
    x: GCX, y: 2, fx: 0, fy: 1, phase: 0, moving: false,
    react: 0, reacted: true, diveLeft: 0, diveTotal: 0, dvx: 0, dvy: 0, dsx: 1, dsy: 0.5,
  };
  let defenders: Mover[] = [];
  const ball = {
    x: GCX, y: 96, z: 0, vx: 0, vy: 0, vz: 0, k: 0, g: GRAVITY, spin: 0, inNet: false, visible: true,
  };
  let particles: Particle[] = [];

  const rnd = (a: number, b: number): number => a + Math.random() * (b - a);

  function resetKeeper(x: number): void {
    keeper.x = x;
    keeper.y = 2;
    keeper.fx = 0;
    keeper.fy = 1;
    keeper.moving = false;
    keeper.reacted = true;
    keeper.diveLeft = 0;
    keeper.diveTotal = 0;
  }

  function setupBreakaway(): void {
    const P = params(streak);
    striker.x = clamp(GCX + rnd(-P.spread, P.spread), 8, FW - 8);
    striker.y = rnd(96, 106);
    const toGoal = Math.hypot(GCX - striker.x, striker.y);
    striker.fx = (GCX - striker.x) / toGoal;
    striker.fy = -striker.y / toGoal;
    resetKeeper(GCX);
    defenders = [];
    const side = striker.x < GCX ? 1 : -1;
    const spots = [
      { f: 0.5, off: rnd(-12, 12) },
      { f: 0.66, off: side * rnd(16, 26) },
      { f: 0.36, off: -side * rnd(14, 24) },
    ];
    for (let i = 0; i < P.defN; i++) {
      const s = spots[i]!;
      defenders.push({
        x: clamp(striker.x + (GCX - striker.x) * s.f + s.off, 6, FW - 6),
        y: striker.y * (1 - s.f),
        fx: 0, fy: 1, phase: 0, moving: false,
      });
    }
    ball.x = striker.x + striker.fx * 4.5;
    ball.y = striker.y + striker.fy * 4.5;
  }

  function setupFreeKick(): void {
    const P = params(streak);
    const side = Math.random() < 0.5 ? -1 : 1;
    ball.x = clamp(GCX + side * rnd(4, 12 + P.spread * 0.75), 22, FW - 22);
    ball.y = rnd(58, 66 + P.L * 18);
    const dg = Math.hypot(GCX - ball.x, ball.y);
    striker.fx = (GCX - ball.x) / dg;
    striker.fy = -ball.y / dg;
    striker.x = ball.x - striker.fx * 4.5;
    striker.y = ball.y - striker.fy * 4.5;
    // the wall guards the near post, the keeper takes the far side
    const nearPost = ball.x < GCX ? GL : GR;
    const wx = nearPost + (GCX - nearPost) * 0.3 - ball.x;
    const wy = -ball.y;
    const wl = Math.hypot(wx, wy);
    const ux = wx / wl;
    const uy = wy / wl;
    defenders = [];
    for (let i = 0; i < P.wallN; i++) {
      const o = (i - (P.wallN - 1) / 2) * 4.2;
      defenders.push({
        x: ball.x + ux * 22 - uy * o,
        y: ball.y + uy * 22 + ux * o,
        fx: -ux, fy: -uy, phase: 0, moving: false,
      });
    }
    resetKeeper(GCX + (nearPost === GL ? 4 : -4));
  }

  function newRound(): void {
    fk = mode === 'fk' || streak % 4 === 3;
    if (fk) setupFreeKick();
    else setupBreakaway();
    striker.moving = false;
    ball.z = 0;
    ball.vx = ball.vy = ball.vz = 0;
    ball.k = 0;
    ball.g = GRAVITY;
    ball.inNet = false;
    ball.visible = true;
    playT = 0;
    armed = false;
    stateT = 0;
    charging = false;
    power = 0;
    curl = 0;
    fkAimX = GCX;
    kickT = -1;
  }

  function moveTo(m: Mover, tx: number, ty: number, speed: number, h: number): void {
    const dx = tx - m.x;
    const dy = ty - m.y;
    const d = Math.hypot(dx, dy);
    if (d < 0.6) {
      m.moving = false;
      return;
    }
    const stepLen = Math.min(d, speed * h);
    m.x += (dx / d) * stepLen;
    m.y += (dy / d) * stepLen;
    m.fx = dx / d;
    m.fy = dy / d;
    m.moving = true;
    m.phase += h * 8;
  }

  function fail(msg: string): void {
    if (state === 'fail' || state === 'goal') return;
    state = 'fail';
    stateT = 0;
    failMsg = msg;
    ended = streak;
    striker.moving = false;
    charging = false;
  }

  function goal(): void {
    if (state === 'fail' || state === 'goal') return;
    state = 'goal';
    stateT = 0;
    streak++;
    charging = false;
    ball.inNet = true;
    ball.k = 0;
    ball.g = GRAVITY;
    if (streak >= 5) {
      // every goal while lit flares up again; the tier goals are the really big ones
      fireBig = streak % 5 === 0;
      fireBurst = fireBig ? 2.4 : 1.5;
    }
    if (streak > best[mode]) {
      best[mode] = streak;
      if (onBest) onBest(mode, streak);
    }
    const tints = [C.textGold, C.text, C.flag, C.netFront];
    for (let i = 0; i < 26; i++) {
      particles.push({
        x: rnd(GL, GR), y: rnd(-GDEP, 0), z: rnd(GH, GH + 4),
        vx: rnd(-22, 22), vy: rnd(-6, 26), vz: rnd(18, 46),
        life: rnd(0.7, 1.3), c: tints[i & 3]!,
      });
    }
  }

  function keyDir(dx: number, dy: number): Vec {
    // single keys move straight on screen, diagonals lock to the pitch axes
    if (dx && dy) {
      if (dx > 0 && dy < 0) return { x: 0, y: -1 };
      if (dx < 0 && dy < 0) return { x: -1, y: 0 };
      if (dx > 0 && dy > 0) return { x: 1, y: 0 };
      return { x: 0, y: 1 };
    }
    const k = Math.SQRT1_2;
    if (dx) return { x: dx * k, y: -dx * k };
    return { x: dy * k, y: dy * k };
  }

  /** Everything the shot needs, shared by the preview line and the real kick. */
  function planShot(): { arc: Arc; shot: Shot; L: number; T: number; b: number; base: Vec } {
    const P = params(streak);
    let tx = aim.x;
    let ty = aim.y;
    if (aimMode === 'marker') {
      tx = fkAimX;
      ty = 0;
    } else if (aimMode === 'facing') {
      // along the run, steered inside the posts
      tx = striker.fy < -0.1 ? clamp(ball.x + (striker.fx / -striker.fy) * ball.y, GL + 4, GR - 4) : GCX;
      ty = 0;
    } else if (Math.hypot(tx - ball.x, ty - ball.y) < 5) {
      tx = GCX;
      ty = 0;
    }
    const base = { x: tx, y: ty };
    // the drag bends the shot and nudges its landing spot the way the ball finishes
    tx += curl * AIM_SHIFT;
    const arc = makeArc(ball.x, ball.y, tx, ty, curl);
    const shot = shotFromPower(power, P.sweetW);
    const L = arcToLine(arc);
    const T = flightTime(L, shot.v);
    const b = shot.hT > 0 ? shot.hT / (0.3 * T * T) : 0;
    return { arc, shot, L, T, b, base };
  }

  function shoot(): void {
    const P = params(streak);
    const { arc, shot, T, b } = planShot();
    const h = arc.h0 + rnd(-1, 1) * (shot.quality === 'over' ? 0.04 : 0.008);
    ball.vx = Math.cos(h) * shot.v;
    ball.vy = Math.sin(h) * shot.v;
    ball.k = arc.k;
    if (b > 0) {
      // rises early then dips: up and over a wall, back down under the bar
      ball.vz = 1.3 * b * T;
      ball.g = 2 * b;
    } else {
      ball.vz = 0;
      ball.g = GRAVITY;
    }
    lastQuality = shot.quality;
    kickT = 0;
    if (shot.quality === 'sweet') {
      // a little burst off the boot
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        particles.push({
          x: ball.x, y: ball.y, z: 2,
          vx: Math.cos(a) * 26, vy: Math.sin(a) * 26, vz: rnd(14, 30),
          life: rnd(0.25, 0.45), c: i & 1 ? C.textGold : C.text,
        });
      }
    }
    state = 'shot';
    stateT = 0;
    armed = true;
    charging = false;
    striker.moving = false;
    striker.fx = Math.cos(h);
    striker.fy = Math.sin(h);
    keeper.react = P.react * rnd(0.75, 1.25);
    keeper.reacted = false;
    keeper.moving = false;
  }

  function keeperDive(h: number): void {
    const P = params(streak);
    if (!keeper.reacted) {
      keeper.react -= h;
      if (keeper.react <= 0) {
        keeper.reacted = true;
        const sp = Math.hypot(ball.vx, ball.vy);
        if (sp > 20 && !ball.inNet) {
          // he reads the flight, but only part of the curl
          const read: Arc = { x0: ball.x, y0: ball.y, h0: Math.atan2(ball.vy, ball.vx), k: ball.k * 0.6, len: 0 };
          let bx = ball.x;
          let by = ball.y;
          let bd = 1e9;
          for (let s = 0; s < 170; s += 1.5) {
            const p = arcAt(read, s);
            if (p.y < -1) break;
            const dd = Math.hypot(p.x - keeper.x, p.y - keeper.y);
            if (dd < bd) {
              bd = dd;
              bx = p.x;
              by = p.y;
            }
          }
          const dx = bx - keeper.x;
          const dy = by - keeper.y;
          const dd = Math.hypot(dx, dy);
          if (dd > 1.2) {
            keeper.dvx = dx / dd;
            keeper.dvy = dy / dd;
            keeper.diveLeft = Math.min(dd, P.diveMax);
            keeper.diveTotal = keeper.diveLeft;
            const sdx = keeper.dvx - keeper.dvy;
            const sdy = (keeper.dvx + keeper.dvy) / 2;
            const sl = Math.hypot(sdx, sdy) || 1;
            keeper.dsx = sdx / sl;
            keeper.dsy = sdy / sl;
          }
        }
      }
    }
    if (keeper.diveLeft > 0) {
      const stepLen = Math.min(keeper.diveLeft, P.diveSp * h);
      keeper.x += keeper.dvx * stepLen;
      keeper.y = Math.max(0.5, keeper.y + keeper.dvy * stepLen);
      keeper.diveLeft -= stepLen;
    }
  }

  function deaden(): void {
    ball.k = 0;
    ball.g = GRAVITY;
  }

  function ballPhysics(h: number): void {
    const px = ball.x;
    const py = ball.y;
    const pz = ball.z;
    let sp = Math.hypot(ball.vx, ball.vy);
    if (ball.k !== 0 && sp > 1) {
      const a = ball.k * sp * h;
      const c = Math.cos(a);
      const s = Math.sin(a);
      const vx = ball.vx * c - ball.vy * s;
      ball.vy = ball.vx * s + ball.vy * c;
      ball.vx = vx;
    }
    ball.x += ball.vx * h;
    ball.y += ball.vy * h;
    ball.z += ball.vz * h - 0.5 * ball.g * h * h;
    ball.vz -= ball.g * h;
    if (ball.z <= 0) {
      ball.z = 0;
      if (ball.vz < 0) {
        ball.vz = ball.vz < -14 ? Math.min(30, -ball.vz * 0.4) : 0;
        ball.g = GRAVITY;
        ball.k *= 0.3;
      }
    }
    const drag = Math.exp(-(ball.z > 0 ? AIR : 1.3) * h);
    ball.vx *= drag;
    ball.vy *= drag;
    sp = Math.hypot(ball.vx, ball.vy);
    ball.spin += sp * h * 0.25;

    if (ball.inNet) {
      if (ball.x < GL + 1.5 || ball.x > GR - 1.5) {
        ball.x = clamp(ball.x, GL + 1.5, GR - 1.5);
        ball.vx *= -0.15;
        ball.vy *= 0.3;
      }
      if (ball.y < -GDEP + 1.5) {
        ball.y = -GDEP + 1.5;
        ball.vy *= -0.12;
        ball.vx *= 0.3;
      }
      if (ball.y > -1) {
        ball.y = -1;
        ball.vy = 0;
      }
      if (ball.z > GH - 2) {
        ball.z = GH - 2;
        ball.vz = -Math.abs(ball.vz) * 0.2;
      }
    } else if (state === 'shot') {
      for (const d of defenders) {
        if (ball.z < 10 && Math.hypot(d.x - ball.x, d.y - ball.y) < 3.2) {
          ball.vx = -ball.vx * 0.3 + rnd(-20, 20);
          ball.vy = -ball.vy * 0.3 + rnd(-20, 20);
          deaden();
          fail('Blocked');
          return;
        }
      }
      const diving = keeper.diveTotal > 0;
      const reach = diving ? 5.4 : 4.2;
      // at full stretch he covers less height, so a clean high strike beats the dive
      const high = 16.5 - 0.45 * Math.max(0, keeper.diveTotal - keeper.diveLeft - 5);
      if (ball.z < high && Math.hypot(keeper.x - ball.x, keeper.y - ball.y) < reach) {
        ball.vx = -ball.vx * 0.25 + rnd(-30, 30);
        ball.vy = Math.abs(ball.vy) * 0.3 + 10;
        ball.vz = 20;
        deaden();
        fail('Saved');
        return;
      }
      if (py > 0 && ball.y <= 0) {
        const f = py / (py - ball.y);
        const cx = px + (ball.x - px) * f;
        const cz = pz + (ball.z - pz) * f;
        const between = cx > GL + 1 && cx < GR - 1;
        if (between && cz > GH + 0.9) {
          fail('Over the bar');
        } else if (between && cz >= GH - 0.9) {
          ball.y = 0.3;
          ball.vy = -ball.vy * 0.4;
          ball.vz = -20;
          deaden();
          fail('Off the bar');
        } else if (between) {
          goal();
        } else if (cz < GH + 1 && (Math.abs(cx - GL) <= 1.2 || Math.abs(cx - GR) <= 1.2)) {
          ball.y = 0.3;
          ball.vy = -ball.vy * 0.45;
          ball.vx = ball.vx * 0.5 + rnd(-25, 25);
          deaden();
          fail('Off the post');
        } else {
          fail('Wide');
        }
        return;
      }
      if (ball.x < -4 || ball.x > FW + 4 || ball.y > FD + 6) {
        fail('Wide');
        return;
      }
      if (stateT > 0.4 && sp < 10 && ball.z === 0) fail('No goal');
    } else if (py > 0 && ball.y <= 0 && ball.z < GH && ball.x > GL - 1.5 && ball.x < GR + 1.5) {
      // loose balls after a save do not sneak in
      ball.y = 0.3;
      ball.vy = Math.abs(ball.vy) * 0.3;
    }
    ball.visible =
      ball.x > -MX + 1 && ball.x < FW + MX - 1 && ball.y > -MTOP + 1 && ball.y < FD + MBOT - 1;
  }

  function playStep(h: number): void {
    const P = params(streak);
    if (charging) {
      power += h / P.chargeT;
      if (power >= 1) {
        power = 1;
        shoot();
        return;
      }
    }
    if (fk) {
      // dead ball: nobody moves. On touch the stick slides the aim marker along the goal line.
      if (su || sv) fkAimX = clamp(fkAimX + ((su * 2 + sv) / Math.sqrt(5)) * 34 * h, GL + 2, GR - 2);
      return;
    }

    let mvx = 0;
    let mvy = 0;
    let mag = 1;
    if (kdx || kdy) {
      const k = keyDir(kdx, kdy);
      mvx = k.x;
      mvy = k.y;
    } else if (su || sv) {
      const wx = su / 2 + sv;
      const wy = sv - su / 2;
      const wl = Math.hypot(wx, wy) || 1;
      mvx = wx / wl;
      mvy = wy / wl;
      mag = Math.min(1, Math.hypot(su, sv));
    }
    striker.moving = mvx !== 0 || mvy !== 0;
    if (striker.moving) {
      striker.fx = mvx;
      striker.fy = mvy;
      striker.x = clamp(striker.x + mvx * STRIKER_SPEED * mag * h, 1.5, FW - 1.5);
      striker.y = clamp(striker.y + mvy * STRIKER_SPEED * mag * h, 1.5, FD + 3);
      striker.phase += h * 9 * mag;
      ball.spin += h * 10 * mag;
      armed = true;
    }
    if (charging) armed = true;
    if (!armed && stateT > 1.5) armed = true;

    const a = Math.min(1, h * 16);
    ball.x += (striker.x + striker.fx * 4.5 - ball.x) * a;
    ball.y += (striker.y + striker.fy * 4.5 - ball.y) * a;
    ball.x = clamp(ball.x, 0.5, FW - 0.5);
    if (ball.y < 0) {
      if (ball.x > GL + 1.2 && ball.x < GR - 1.2) {
        // walked it in
        ball.vx = striker.fx * 30;
        ball.vy = -40;
        goal();
        return;
      }
      ball.y = 0.3;
    }
    if (!armed) return;
    playT += h;

    const d = Math.hypot(ball.x - GCX, ball.y) || 1;
    if (d < P.rushR || playT > P.stall) {
      moveTo(keeper, ball.x, ball.y, P.rushSp, h);
    } else {
      const off = Math.min(P.offLine, d * 0.4);
      const tx = clamp(GCX + ((ball.x - GCX) / d) * off, GL + 2, GR - 2);
      const ty = Math.max(1.5, (ball.y / d) * off);
      moveTo(keeper, tx, ty, P.shuffle, h);
      if (!keeper.moving) {
        keeper.fx = 0;
        keeper.fy = 1;
      }
    }
    if (Math.hypot(keeper.x - ball.x, keeper.y - ball.y) < 4.2) {
      fail('Smothered');
      return;
    }

    for (let i = 0; i < defenders.length; i++) {
      const m = defenders[i]!;
      const db = Math.hypot(ball.x - m.x, ball.y - m.y);
      const lead = Math.min(18, db * 0.55);
      let tx = ball.x + ((GCX - ball.x) / d) * lead;
      let ty = ball.y + (-ball.y / d) * lead;
      for (let j = 0; j < defenders.length; j++) {
        if (j === i) continue;
        const o = defenders[j]!;
        const sep = Math.hypot(m.x - o.x, m.y - o.y);
        if (sep < 9 && sep > 0.01) {
          tx += ((m.x - o.x) / sep) * (9 - sep) * 2;
          ty += ((m.y - o.y) / sep) * (9 - sep) * 2;
        }
      }
      moveTo(m, tx, ty, P.defSp, h);
      if (Math.hypot(m.x - ball.x, m.y - ball.y) < 3.2) {
        fail('Tackled');
        return;
      }
    }
  }

  function sub(h: number): void {
    stateT += h;
    if (kickT >= 0) kickT += h;
    if (fireBurst > 0) {
      fireBurst -= h;
      sparkT += h;
      if (sparkT > (fireBig ? 0.014 : 0.03) && fireBurst > 0.5) {
        sparkT = 0;
        const ramp = FIRE[(Math.floor(streak / 5) + 3) % 4]!;
        particles.push({
          x: rnd(GL, GR), y: rnd(-GDEP, 0), z: GH + rnd(4, fireBig ? 20 : 10),
          vx: rnd(-8, 8), vy: rnd(-8, 8), vz: rnd(40, fireBig ? 95 : 75),
          life: rnd(0.3, 0.6), c: ramp[1 + (particles.length & 1)]!,
        });
      }
    }
    if (state === 'shot' && lastQuality === 'sweet' && ball.visible) {
      // sweet strikes leave a short gold trail
      trailT += h;
      if (trailT > 0.018) {
        trailT = 0;
        particles.push({ x: ball.x, y: ball.y, z: ball.z + 1, vx: 0, vy: 0, vz: 6, life: 0.22, c: C.textGold });
      }
    }
    for (const p of particles) {
      p.life -= h;
      p.vz -= 70 * h;
      p.x += p.vx * h;
      p.y += p.vy * h;
      p.z += p.vz * h;
      if (p.z < 0) {
        p.z = 0;
        p.vz = 0;
        p.vx *= 0.8;
        p.vy *= 0.8;
      }
    }
    if (particles.length) particles = particles.filter((p) => p.life > 0);

    if (state === 'play') {
      playStep(h);
    } else if (state === 'shot') {
      keeperDive(h);
      ballPhysics(h);
    } else if (state === 'goal') {
      keeperDive(h);
      ballPhysics(h);
      if (stateT > 1.5) {
        newRound();
        state = 'play';
      }
    } else if (state === 'fail') {
      keeperDive(h);
      ballPhysics(h);
    }
  }

  /** Dotted flight path and landing marker, drawn while the bar is charging. */
  function drawPreview(buf: Buf): void {
    const { arc, shot, L, T, b, base } = planShot();
    const zAt = (s: number): number => {
      if (b === 0) return 0;
      const tt = flightTime(s, shot.v);
      return Math.max(0, b * (1.3 * T * tt - tt * tt));
    };
    for (let s = 6; s < L - 2; s += 3.5) {
      const p = arcAt(arc, s);
      const z = zAt(s);
      const px = Math.round(sxOf(p.x, p.y));
      const py = Math.round(syOf(p.x, p.y, z));
      if (z > 1) mix(buf, px, syOf(p.x, p.y, 0), C.shadow, 0.5);
      put(buf, px, py + 1, C.outline);
      put(buf, px, py, C.text);
      put(buf, px + 1, py, C.text);
    }
    const endZ = zAt(L);
    if (Math.abs(curl) > 0.04) {
      // ghost of the original aim, so the bend reads as a bend and not a new target
      const gx = Math.round(sxOf(base.x, base.y));
      const gy = Math.round(syOf(base.x, base.y, base.y === 0 ? endZ : 0));
      for (const i of [-2, -1, 1, 2]) {
        put(buf, gx + i, gy, C.ghost);
        put(buf, gx, gy + i, C.ghost);
      }
    }
    const e = arcAt(arc, L);
    const ex = Math.round(sxOf(e.x, e.y));
    const ey = Math.round(syOf(e.x, e.y, endZ));
    const mc = shot.quality === 'sweet' ? C.textGold : shot.quality === 'over' ? C.flag : C.text;
    for (let i = -2; i <= 2; i++) {
      if (i === 0) continue;
      put(buf, ex + i, ey, mc);
      put(buf, ex, ey + i, mc);
    }
  }

  function drawPowerBar(buf: Buf): void {
    const P = params(streak);
    const bx = Math.round(sxOf(striker.x, striker.y)) + 7;
    const by = Math.round(syOf(striker.x, striker.y, 0)) - 1;
    const H = 18;
    const hi = SWEET_LO + P.sweetW;
    const q = shotFromPower(power, P.sweetW).quality;
    for (let r = -1; r <= H; r++)
      for (let k = -1; k <= 3; k++) put(buf, bx + k, by - r, C.outline);
    for (let r = 0; r < H; r++) {
      const f = (r + 0.5) / H;
      const zone = f >= hi ? C.barOver : f >= SWEET_LO ? C.barSweet : C.barBg;
      const lit = f <= power;
      const c = !lit ? zone : q === 'sweet' ? C.textGold : q === 'over' ? C.flag : C.text;
      for (let k = 0; k < 3; k++) put(buf, bx + k, by - r, c);
    }
  }

  function render(buf: Buf): void {
    buf.set(bg);
    // the 5th goal lights it. Every goal after flares up then settles to embers; every 5th is bigger and changes colour
    const lit = streak >= 5 && state !== 'fail' && state !== 'idle';
    const tier = (Math.floor(streak / 5) + 3) % 4;
    const flare = clamp(fireBurst / 0.6, 0, 1);
    const fire = 0.3 + ((fireBig ? 1.5 : 1) - 0.3) * flare;
    drawGoalBack(buf);
    if (lit && fire > 0.45) drawFire(buf, -GDEP, fire * 0.8, tier, t + 3);
    drawBoard(buf, state === 'fail' ? ended : streak, best[mode]);
    if (ball.y < 0 && ball.visible) drawBall(buf, ball.x, ball.y, ball.z, ball.spin);
    drawGoalFront(buf);
    if (lit) drawFire(buf, 0, fire, tier, t);
    if (lit && fireBig && flare > 0.05) {
      drawPostFire(buf, GL, flare, tier, t);
      drawPostFire(buf, GR, flare, tier, t + 5);
    }

    const items: { d: number; draw: () => void }[] = [];
    items.push({ d: 0, draw: () => drawFlag(buf, 0, 0, t) });
    items.push({ d: FW, draw: () => drawFlag(buf, FW, 0, t) });
    const hop = state === 'goal' ? Math.abs(Math.sin(stateT * 9)) * 4 * Math.max(0, 1 - stateT / 1.3) : 0;
    const side = striker.fx - striker.fy >= 0 ? 1 : -1;
    const pose: Pose = {
      wind: state === 'play' && charging && !striker.moving,
      kick: kickT >= 0 && kickT < 0.4 ? kickT / 0.4 : -1,
      s: side,
      up: state === 'shot' && lastQuality === 'sweet' && kickT > 0.25,
    };
    items.push({ d: striker.x + striker.y, draw: () => drawPlayer(buf, striker, hop, KIT_STRIKER, pose) });
    for (const m of defenders) items.push({ d: m.x + m.y, draw: () => drawPlayer(buf, m, 0, KIT_DEFENDER) });
    items.push({
      d: keeper.x + keeper.y,
      draw: () => {
        if (keeper.diveTotal > 0) {
          const prog = 1 - keeper.diveLeft / keeper.diveTotal;
          drawDive(buf, keeper, Math.sin(Math.PI * prog) * 4, keeper.dsx, keeper.dsy, KIT_KEEPER);
        } else drawPlayer(buf, keeper, 0, KIT_KEEPER);
      },
    });
    if (ball.y >= 0 && ball.visible)
      items.push({ d: ball.x + ball.y + 0.5, draw: () => drawBall(buf, ball.x, ball.y, ball.z, ball.spin) });
    items.sort((a, b) => a.d - b.d);
    for (const it of items) it.draw();

    for (const p of particles) put(buf, sxOf(p.x, p.y), syOf(p.x, p.y, p.z), p.c);

    if (state === 'goal') drawGoalText(buf, stateT);

    if (state === 'play' && charging) {
      drawPreview(buf);
      drawPowerBar(buf);
    } else if (state === 'play' && fk && touchUi) {
      const mx = Math.round(sxOf(fkAimX, 0));
      const my = Math.round(syOf(fkAimX, 0, 5));
      for (let i = -3; i <= 3; i++) {
        if (i === 0) continue;
        put(buf, mx + i, my + 1, C.outline);
        put(buf, mx + i, my, C.text);
        put(buf, mx, my + i, C.text);
      }
    }
  }

  function hud(touch: boolean): Hud {
    const tap = touch ? 'Tap' : 'Click';
    if (state === 'idle') {
      const hints = touch
        ? []
        : mode === 'fk'
          ? ['Hold click to charge, release to shoot', 'Drag sideways while holding to curl']
          : ['WASD to move, cursor to aim', 'Hold click to charge, release to shoot', 'Drag sideways while holding to curl'];
      return { head: '', sub: tap + ' to start', hints };
    }
    if (state === 'fail')
      return {
        head: failMsg,
        sub: 'Streak ' + ended + (stateT > 0.5 ? ' / ' + tap.toLowerCase() + ' to retry' : ''),
        hints: [],
      };
    if (state === 'play' && fk && stateT < 2.2 && !charging)
      return { head: 'Free kick', sub: touch ? 'Stick to aim, hold shoot' : '', hints: [] };
    // a goal has no text: the pixel GOAL lettering in the scene does that job
    return { head: '', sub: '', hints: [] };
  }

  newRound();

  return {
    step(dt: number): void {
      dt = Math.min(dt, 1 / 20);
      t += dt;
      const n = Math.max(1, Math.ceil(dt * 240));
      for (let i = 0; i < n; i++) sub(dt / n);
    },
    render,
    hud,
    setKeys(dx: number, dy: number): void {
      kdx = dx;
      kdy = dy;
    },
    /** Analog stick in screen space, each axis -1..1. */
    setStick(u: number, v: number): void {
      su = u;
      sv = v;
    },
    /** Pointer or button down: starts or retries, or begins charging a shot at `aim`. */
    press(a: Vec | null): void {
      if (state === 'idle') {
        state = 'play';
        stateT = 0;
      } else if (state === 'fail') {
        if (stateT > 0.5) {
          streak = 0;
          newRound();
          state = 'play';
        }
      } else if (state === 'play' && !charging) {
        charging = true;
        power = 0;
        curl = 0;
        aim = a || { x: GCX, y: 0 };
        aimMode = a ? 'point' : fk ? 'marker' : 'facing';
      }
    },
    /** -1..1, positive bends toward the near post. Also nudges the landing spot the way the ball finishes. */
    setCurl(c: number): void {
      if (charging) curl = clamp(c, -1, 1);
    },
    /** Touch controls are showing: aim comes from the stick instead of a click. */
    setTouch(on: boolean): void {
      touchUi = on;
    },
    release(): void {
      if (state === 'play' && charging) shoot();
    },
    setMode(m: Mode): void {
      if (m === mode) return;
      mode = m;
      streak = 0;
      particles = [];
      state = 'idle';
      newRound();
    },
    /** A press on the goal mouth aims at that spot on the line, otherwise along the ground. */
    aimFromScreen(lx: number, ly: number): Vec {
      const gx = lx - OX;
      const gz = OY + gx / 2 - ly;
      if (gx > GL - 2 && gx < GR + 2 && gz >= -1 && gz <= GH + 3) return { x: gx, y: 0 };
      const u = lx - OX;
      const v = ly - OY;
      return { x: u / 2 + v, y: v - u / 2 };
    },
    get mode() { return mode; },
    get state() { return state; },
    get streak() { return streak; },
    get charging() { return charging; },
    get power() { return power; },
  };
}

/* ------------------------------ mount ----------------------------- */

const STORE_KEY = 'breakaway-best';
const TABS: { mode: Mode; label: string }[] = [
  { mode: 'run', label: 'Breakaway' },
  { mode: 'fk', label: 'Free kicks' },
];
const CURSOR =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='26' height='26' shape-rendering='crispEdges'%3E" +
  "%3Ccircle cx='13' cy='13' r='8' fill='none' stroke='%23141a22' stroke-width='4'/%3E" +
  "%3Ccircle cx='13' cy='13' r='8' fill='none' stroke='%23fff' stroke-width='2'/%3E" +
  "%3Cpath d='M13 1v7M13 18v7M1 13h7M18 13h7' stroke='%23141a22' stroke-width='4'/%3E" +
  "%3Cpath d='M13 2v5M13 19v5M2 13h5M19 13h5' stroke='%23fff' stroke-width='2'/%3E" +
  "%3Crect x='11' y='11' width='4' height='4' fill='%23141a22'/%3E%3Crect x='12' y='12' width='2' height='2' fill='%23fff'/%3E" +
  '%3C/svg%3E") 13 13, crosshair';

/**
 * Build the game inside `root`: the canvas, plus a joystick and shoot button on touch devices.
 * Text uses the root's computed font-family and color. Returns a cleanup function.
 */
export function mount(root: HTMLElement): () => void {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const off = document.createElement('canvas');
  off.width = LW;
  off.height = LH;
  const octx = off.getContext('2d');
  if (!ctx || !octx) return () => {};
  const img = octx.createImageData(LW, LH);
  const buf = new Uint32Array(img.data.buffer);

  const stored: Record<Mode, number> = { run: 0, fk: 0 };
  try {
    stored.run = parseInt(window.localStorage.getItem(STORE_KEY) || '0', 10) || 0;
    stored.fk = parseInt(window.localStorage.getItem(STORE_KEY + '-fk') || '0', 10) || 0;
  } catch {
    /* storage unavailable */
  }
  const eng = createEngine(stored, (m, n) => {
    try {
      window.localStorage.setItem(m === 'fk' ? STORE_KEY + '-fk' : STORE_KEY, String(n));
    } catch {
      /* storage unavailable */
    }
  });

  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'application');
  canvas.setAttribute('aria-label', 'Breakaway, a pixel art soccer game. WASD to move, hold the mouse to shoot.');
  Object.assign(canvas.style, {
    display: 'block',
    width: '100%',
    aspectRatio: LW + ' / ' + LH,
    outline: 'none',
    userSelect: 'none',
    webkitUserSelect: 'none',
    cursor: CURSOR,
    touchAction: 'manipulation',
  });
  root.appendChild(canvas);

  /* ---- touch controls: stick on the left, shoot on the right ---- */
  const pad = document.createElement('div');
  Object.assign(pad.style, {
    display: 'none',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 22px 6px',
    touchAction: 'none',
    userSelect: 'none',
    webkitUserSelect: 'none',
  });
  const ring = (size: number): HTMLDivElement => {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'relative',
      width: size + 'px',
      height: size + 'px',
      borderRadius: '50%',
      boxShadow: 'inset 0 0 0 1.5px currentColor',
      touchAction: 'none',
      flex: 'none',
    });
    return el;
  };
  const stick = ring(108);
  stick.style.opacity = '0.75';
  stick.setAttribute('aria-label', 'Move');
  const knob = document.createElement('div');
  Object.assign(knob.style, {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: '46px',
    height: '46px',
    margin: '-23px 0 0 -23px',
    borderRadius: '50%',
    background: 'currentColor',
    opacity: '0.85',
    pointerEvents: 'none',
  });
  stick.appendChild(knob);
  const btn = ring(92);
  btn.setAttribute('role', 'button');
  btn.setAttribute('aria-label', 'Shoot. Hold to charge, slide to swing the shot out that way.');
  Object.assign(btn.style, {
    display: 'grid',
    placeItems: 'center',
    fontSize: '13px',
    overflow: 'hidden',
  });
  const fill = document.createElement('div');
  Object.assign(fill.style, {
    position: 'absolute',
    left: '0',
    right: '0',
    bottom: '0',
    height: '0%',
    background: 'currentColor',
    opacity: '0.22',
    pointerEvents: 'none',
  });
  const btnLabel = document.createElement('span');
  btnLabel.textContent = 'Shoot';
  btnLabel.style.position = 'relative';
  btn.appendChild(fill);
  btn.appendChild(btnLabel);
  pad.appendChild(stick);
  pad.appendChild(btn);
  root.appendChild(pad);

  let touch = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
  const showPad = (): void => {
    touch = true;
    eng.setTouch(true);
    pad.style.display = 'flex';
  };
  if (touch) showPad();

  let stickId = -1;
  const stickMove = (e: PointerEvent): void => {
    const r = stick.getBoundingClientRect();
    let u = (e.clientX - (r.left + r.width / 2)) / 38;
    let v = (e.clientY - (r.top + r.height / 2)) / 38;
    const m = Math.hypot(u, v);
    if (m > 1) {
      u /= m;
      v /= m;
    }
    knob.style.transform = 'translate(' + u * 31 + 'px,' + v * 31 + 'px)';
    if (m < 0.18) eng.setStick(0, 0);
    else eng.setStick(u, v);
  };
  const stickDown = (e: PointerEvent): void => {
    stickId = e.pointerId;
    stick.setPointerCapture(e.pointerId);
    stickMove(e);
    e.preventDefault();
  };
  const stickDrag = (e: PointerEvent): void => {
    if (e.pointerId === stickId) stickMove(e);
  };
  const stickUp = (e: PointerEvent): void => {
    if (e.pointerId !== stickId) return;
    stickId = -1;
    knob.style.transform = '';
    eng.setStick(0, 0);
  };
  stick.addEventListener('pointerdown', stickDown);
  stick.addEventListener('pointermove', stickDrag);
  stick.addEventListener('pointerup', stickUp);
  stick.addEventListener('pointercancel', stickUp);

  let btnId = -1;
  let btnX = 0;
  let btnY = 0;
  const btnDown = (e: PointerEvent): void => {
    btnId = e.pointerId;
    btnX = e.clientX;
    btnY = e.clientY;
    btn.setPointerCapture(e.pointerId);
    eng.press(null);
    e.preventDefault();
  };
  const btnDrag = (e: PointerEvent): void => {
    // The slide is measured along the goal line (up-left is the far post, down-right the near post).
    // On touch the ball swings out toward the slide and cuts back, the opposite of the mouse drag.
    if (e.pointerId === btnId) eng.setCurl(-((e.clientX - btnX) * 2 + (e.clientY - btnY)) / Math.sqrt(5) / 70);
  };
  const btnUp = (e: PointerEvent): void => {
    if (e.pointerId !== btnId) return;
    btnId = -1;
    eng.release();
  };
  btn.addEventListener('pointerdown', btnDown);
  btn.addEventListener('pointermove', btnDrag);
  btn.addEventListener('pointerup', btnUp);
  btn.addEventListener('pointercancel', btnUp);

  /* ---- sizing ---- */
  let cssW = LW;
  const resize = (): void => {
    cssW = canvas.getBoundingClientRect().width || LW;
    const k = Math.max(1, Math.ceil((cssW * (window.devicePixelRatio || 1)) / LW));
    if (canvas.width !== LW * k) {
      canvas.width = LW * k;
      canvas.height = LH * k;
    }
  };
  resize();
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(canvas);

  let visible = true;
  const io =
    typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver((es) => {
          visible = es[es.length - 1]!.isIntersecting;
        })
      : null;
  if (io) io.observe(canvas);

  /* ---- keyboard: WASD or arrows, only while the canvas has focus ---- */
  const held = new Set<string>();
  const MOVE: Record<string, [number, number]> = {
    ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
    KeyA: [-1, 0], KeyD: [1, 0], KeyW: [0, -1], KeyS: [0, 1],
  };
  const syncKeys = (): void => {
    let dx = 0;
    let dy = 0;
    held.forEach((k) => {
      dx += MOVE[k]![0];
      dy += MOVE[k]![1];
    });
    eng.setKeys(Math.sign(dx), Math.sign(dy));
  };
  const onKeyDown = (e: KeyboardEvent): void => {
    if (!MOVE[e.code]) return;
    held.add(e.code);
    syncKeys();
    e.preventDefault();
  };
  const onKeyUp = (e: KeyboardEvent): void => {
    if (held.delete(e.code)) syncKeys();
  };
  const onBlur = (): void => {
    held.clear();
    syncKeys();
  };

  /* ---- pointer on the canvas ---- */
  let tabRects: { mode: Mode; x: number; y: number; w: number; h: number }[] = [];
  const tabAt = (e: PointerEvent): Mode | null => {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    for (const tr of tabRects) if (x >= tr.x && x <= tr.x + tr.w && y >= tr.y && y <= tr.y + tr.h) return tr.mode;
    return null;
  };
  const toLogical = (e: PointerEvent): [number, number] => {
    const r = canvas.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * LW, ((e.clientY - r.top) / r.height) * LH];
  };
  let dragId = -1;
  let dragX = 0;
  const onPointerDown = (e: PointerEvent): void => {
    const tab = tabAt(e);
    if (tab) {
      eng.setMode(tab);
      return;
    }
    if (e.pointerType === 'touch') {
      showPad();
      if (eng.state !== 'play') eng.press(null); // taps on the pitch only start or retry
      return;
    }
    canvas.focus({ preventScroll: true });
    const [lx, ly] = toLogical(e);
    eng.press(eng.aimFromScreen(lx, ly));
    dragId = e.pointerId;
    dragX = lx;
    canvas.setPointerCapture(e.pointerId);
    e.preventDefault();
  };
  const onPointerMove = (e: PointerEvent): void => {
    if (e.pointerId !== dragId) return;
    eng.setCurl((toLogical(e)[0] - dragX) / 45);
  };
  const onPointerUp = (e: PointerEvent): void => {
    if (e.pointerId !== dragId) return;
    dragId = -1;
    eng.release();
  };

  canvas.addEventListener('keydown', onKeyDown);
  canvas.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('blur', onBlur);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);

  /* ---- text: crisp, in the page's own mono font and colour ---- */
  let family = 'ui-monospace, monospace';
  let ink = '#111';
  let styleAge = 0;
  const readStyle = (): void => {
    const cs = window.getComputedStyle(root);
    family = cs.fontFamily || family;
    ink = cs.color || ink;
  };
  readStyle();
  try {
    if (document.fonts) void document.fonts.load('500 14px ' + family);
  } catch {
    /* font loading API unavailable */
  }

  const drawHud = (): void => {
    const r = canvas.width / cssW; // backing pixels per css pixel
    const s = cssW / LW;
    const small = clamp(5.2 * s, 11, 16);
    const big = clamp(11 * s, 18, 34);
    const x0 = Math.max(4, 5 * s);
    const font = (px: number, weight: number): void => {
      ctx.font = weight + ' ' + px * r + 'px ' + family;
    };
    ctx.fillStyle = ink;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    // mode tabs, top left. They stack when the canvas is narrow.
    const stacked = cssW < 520;
    font(small, 500);
    tabRects = [];
    let tx = x0;
    let ty = small * 1.35;
    for (const tab of TABS) {
      const w = ctx.measureText(tab.label).width / r;
      const on = eng.mode === tab.mode;
      ctx.globalAlpha = on ? 1 : 0.42;
      ctx.fillText(tab.label, tx * r, ty * r);
      if (on) ctx.fillRect(tx * r, (ty + small * 0.32) * r, w * r, Math.max(1, Math.round(1.5 * r)));
      tabRects.push({ mode: tab.mode, x: tx - 6, y: ty - small * 1.2, w: w + 12, h: small * 1.9 });
      if (stacked) ty += small * 1.9;
      else tx += w + small * 1.6;
    }
    ctx.globalAlpha = 1;
    if (!stacked) ty += small * 1.9;

    const h = eng.hud(touch);
    if (stacked) {
      // narrow screens: the top corner is too small, so messages sit in the bottom left corner
      const cssH = (cssW * LH) / LW;
      const subY = cssH - small * 0.5;
      if (h.head) {
        font(big, 600);
        ctx.fillText(h.head, x0 * r, (subY - small * 1.5) * r);
      }
      if (h.sub) {
        font(small, 500);
        ctx.globalAlpha = 0.7;
        ctx.fillText(h.sub, x0 * r, subY * r);
        ctx.globalAlpha = 1;
      }
      return;
    }
    if (h.head) {
      font(big, 600);
      ty += big * 0.95;
      ctx.fillText(h.head, x0 * r, ty * r);
      ty += small * 0.6;
    } else {
      ty += small * 0.4;
    }
    if (h.sub) {
      font(small, 500);
      ty += small * 1.15;
      ctx.globalAlpha = 0.7;
      ctx.fillText(h.sub, x0 * r, ty * r);
      ctx.globalAlpha = 1;
    }
    if (h.hints.length && cssW >= 620) {
      font(small, 400);
      ctx.globalAlpha = 0.6;
      const cssH = (cssW * LH) / LW;
      let hy = cssH - small * 0.6 - (h.hints.length - 1) * small * 1.5;
      for (const line of h.hints) {
        ctx.fillText(line, x0 * r, hy * r);
        hy += small * 1.5;
      }
      ctx.globalAlpha = 1;
    }
  };

  let raf = 0;
  let last = performance.now();
  const frame = (now: number): void => {
    raf = requestAnimationFrame(frame);
    const dt = (now - last) / 1000;
    last = now;
    if (!visible) return;
    if (++styleAge > 45) {
      styleAge = 0;
      readStyle();
    }
    eng.step(dt);
    eng.render(buf);
    octx.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
    drawHud();
    if (touch) fill.style.height = (eng.charging ? Math.round(eng.power * 100) : 0) + '%';
  };
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    if (ro) ro.disconnect();
    if (io) io.disconnect();
    canvas.remove();
    pad.remove();
  };
}

/* ---------------------------- component --------------------------- */

/**
 * Text is drawn in the wrapper's font-family and color, so it picks up Geist Mono
 * from `--font-geist-mono` (or a "Geist Mono" family) and follows the page theme.
 */
export default function SoccerBreakaway({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => (ref.current ? mount(ref.current) : undefined), []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        width: '100%',
        maxWidth: 984,
        fontFamily: 'var(--font-geist-mono), "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
        ...style,
      }}
    />
  );
}
