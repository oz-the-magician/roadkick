// Roadkick — Procedural pixel-art sprites (riders, vehicles, scenery)
'use strict';

/* ================= sprite factory ================= */
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function fromMap(rows, pal, glow = {}) {
  const w = Math.max(...rows.map(r => r.length)), h = rows.length;
  const c = mk(w, h), g = c.getContext('2d');
  c.glow = [];
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (!pal[ch]) continue;
      g.fillStyle = pal[ch]; g.fillRect(x, y, 1, 1);
      if (glow[ch]) c.glow.push([x, y, glow[ch]]);
    }
  });
  return c;
}
function tint(src, rgba = 'rgba(6,8,28,0.66)') {
  const c = mk(src.width, src.height), g = c.getContext('2d');
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = rgba; g.fillRect(0, 0, c.width, c.height);
  g.globalCompositeOperation = 'source-over';
  for (const p of (src.glow || [])) { g.fillStyle = p[2]; g.fillRect(p[0], p[1], 1, 1); }
  return c;
}
function flip(src) {
  const c = mk(src.width, src.height), g = c.getContext('2d');
  g.translate(c.width, 0); g.scale(-1, 1); g.drawImage(src, 0, 0);
  c.glow = (src.glow || []).map(p => [src.width - 1 - p[0], p[1], p[2]]);
  return c;
}
function rot90(src) {
  const c = mk(src.height, src.width), g = c.getContext('2d');
  g.translate(c.width, 0); g.rotate(Math.PI / 2); g.drawImage(src, 0, 0);
  c.glow = [];
  return c;
}
const pair = (c, ppu, ax = -0.5) => ({ d: c, n: tint(c), ppu, ax });

const RIDER = [
  "........KKKK........",
  "......KKHHHHKK......",
  ".....KHHHHWWHHK.....",
  ".....KHHHHHWHHK.....",
  ".....KHHHHHHHHK.....",
  ".....KKHHHHHHKK.....",
  "......KKjjjjKK......",
  "....KKJJJJJJJJKK....",
  "...KJJJJJJJJJJJJK...",
  "..KJJJjJJJJJJjJJJK..",
  "..KJJKjJJJJJJjKJJK..",
  ".KSKKKjJJJJJJjKKKSK.",
  "KCSK.KjJJJJJJjK.KSCK",
  "KCK..KjJJJJJJjK..KCK",
  "......KPPPPPPK......",
  ".....KPPmMMmPPK.....",
  "....KPPmMMMMmPPK....",
  "....KPKmMLLMmKPK....",
  "....KPKmMLLMmKPK....",
  "....KBKKmMMmKKBK....",
  "....KBBKKTTKKBBK....",
  ".....KKETTTTEKK.....",
  "......KETttTEK......",
  "......KKTTTTKK......",
  ".......KTttTK.......",
  ".......KTTTTK.......",
  ".......KTttTK.......",
  "........KKKK........",
];

function riderSet(jacket, helmet, bike, police = false) {
  const pal = { K:'#140e18', H:helmet, W:'#ffffff', J:jacket, j:darken(jacket, 0.62), S:'#2c2528', C:'#dde2ea',
    P:'#262a40', B:'#121212', M:bike, m:darken(bike, 0.6), T:'#18181c', t:'#40404a', E:'#a8aeb6', L:'#ff2a2a' };
  const frames = police ? [0, 1] : [0];
  return frames.map(fr => {
    const base = fromMap(RIDER, pal, { L:'#ff5050' });
    if (police) {
      const g = base.getContext('2d');
      const a = fr ? '#3a7bff' : '#ff3030', b = fr ? '#ff3030' : '#3a7bff';
      g.fillStyle = a; g.fillRect(3, 15, 2, 2);
      g.fillStyle = b; g.fillRect(15, 15, 2, 2);
      base.glow.push([3,15,a],[4,15,a],[3,16,a],[4,16,a],[15,15,b],[16,15,b],[15,16,b],[16,16,b]);
    }
    // kick to the left: wider canvas with an extended leg
    const off = 8;
    const kl = mk(base.width + off, base.height), g = kl.getContext('2d');
    g.drawImage(base, off, 0);
    g.fillStyle = '#140e18'; g.fillRect(3, 14, 10, 1); g.fillRect(3, 17, 10, 1);
    g.fillStyle = pal.P; g.fillRect(3, 15, 10, 2);
    g.fillStyle = '#140e18'; g.fillRect(0, 13, 4, 6);
    g.fillStyle = pal.B; g.fillRect(1, 14, 2, 4);
    kl.glow = base.glow.map(p => [p[0] + off, p[1], p[2]]);
    const kr = flip(kl);
    const center = off + base.width / 2;
    return {
      base: pair(base, RIDER_PPU),
      kl: pair(kl, RIDER_PPU, -center / kl.width),
      kr: pair(kr, RIDER_PPU, -(kl.width - center) / kl.width),
      down: pair(rot90(base), RIDER_PPU),
    };
  });
}

const CAR = [
  "......KKKKKKKKKKKKKKKK......",
  ".....KBBBBBBBBBBBBBBBBK.....",
  "....KBGGGGGGGGGGGGGGGGBK....",
  "....KBGgGGGGGGGGGGGGGGBK....",
  "...KBBGGGGGGGGGGGGGGGGBBK...",
  "..KBBBBBBBBBBBBBBBBBBBBBBK..",
  ".KBBBBBBBBBBBBBBBBBBBBBBBBK.",
  "KBLLLLBBBBBBBBBBBBBBBBLLLLBK",
  "KBLLLLBBBBBBBBBBBBBBBBLLLLBK",
  "KbbbbbbbbbPPPPPPPPbbbbbbbbbK",
  "KbbbbbbbbbPPPPPPPPbbbbbbbbbK",
  "KCCCCCCCCCCCCCCCCCCCCCCCCCCK",
  "KbbbbbbbbbbbbbbbbbbbbbbbbbbK",
  "KTTTTKKKKKKKKKKKKKKKKKKTTTTK",
  ".KTTTK................KTTTK.",
  ".KTTTK................KTTTK.",
  ".KKKKK................KKKKK.",
];
function truckRows() {
  const door = "KXxXXXXXXXXXKKXXXXXXXXXxXK", handle = "KXxXXXXXXXXCKKCXXXXXXXXxXK";
  const rows = ["KKKKKKKKKKKKKKKKKKKKKKKKKK", "KXXXXXXXXXXXXXXXXXXXXXXXXK"];
  for (let i = 2; i < 18; i++) rows.push(i === 9 ? handle : door);
  rows.push("KKKKKKKKKKKKKKKKKKKKKKKKKK", "KbbbbbbbbbbbbbbbbbbbbbbbbK",
    "KbLLLbbbbbPPPPPPbbbbbLLLbK", "KbLLLbbbbbPPPPPPbbbbbLLLbK",
    "KCCCCCCCCCCCCCCCCCCCCCCCCK", "KTTTTTKKKKKKKKKKKKKKTTTTTK",
    ".KTTTK..............KTTTK.", ".KTTTK..............KTTTK.", ".KKKKK..............KKKKK.");
  return rows;
}
function vehicle(rows, color, ppu, extra = {}) {
  const pal = Object.assign({ K:'#140e18', B:color, b:darken(color, 0.62), G:'#2a3748', g:'#8fb2cf', L:'#ff2a2a',
    P:'#ece5cc', T:'#18181c', C:'#c8ccd4', X:color, x:darken(color, 0.8) }, extra);
  return pair(fromMap(rows, pal, { L:'#ff5a4a' }), ppu);
}

function pine() {
  const w = 18, h = 38, c = mk(w, h), g = c.getContext('2d');
  g.fillStyle = '#4a2e1c'; g.fillRect(8, 30, 2, 8);
  const tiers = [[0, 10, 4], [7, 18, 6], [14, 26, 8], [20, 32, 9]];
  for (const [top, bot, hw] of tiers) {
    for (let y = top; y < bot; y++) {
      const p = (y - top) / (bot - top), half = Math.max(1, Math.round(hw * p));
      for (let x = 9 - half; x < 9 + half; x++) {
        g.fillStyle = x === 9 - half || x === 9 + half - 1 || y === bot - 1 ? '#173a24' : (x < 9 ? '#3f8a4c' : '#2c6b3b');
        g.fillRect(x, y, 1, 1);
      }
    }
  }
  return c;
}
function palm() {
  const w = 26, h = 40, c = mk(w, h), g = c.getContext('2d');
  for (let y = 12; y < h; y++) {
    const x = Math.round(13 + Math.sin((y - 12) / 9) * 2.5);
    g.fillStyle = y % 3 ? '#8a6038' : '#6a4526'; g.fillRect(x, y, 2, 1);
  }
  const cx = 14, cy = 12;
  const fronds = [-2.9, -2.4, -1.9, -1.2, -0.7, -0.25, 3.35];
  for (const a of fronds) {
    for (let t = 0; t < 12; t++) {
      const x = Math.round(cx + Math.cos(a) * t), y = Math.round(cy + Math.sin(a) * t * 0.7 + t * t * 0.06);
      g.fillStyle = t > 8 ? '#2e7a3a' : '#44a04c'; g.fillRect(x, y, 2, 1);
      if (t > 2 && t % 2 === 0) { g.fillStyle = '#2e7a3a'; g.fillRect(x, y + 1, 1, 1); }
    }
  }
  g.fillStyle = '#5a3a1a'; g.fillRect(13, 12, 3, 2);
  return c;
}
function blob(w, h, light, dark, edge, speckle) {
  const c = mk(w, h), g = c.getContext('2d');
  const r = rng(w * 31 + h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const nx = (x - w / 2 + 0.5) / (w / 2), ny = (y - h + 0.5) / h;
    const d = nx * nx + ny * ny;
    if (d > 1) continue;
    let col = (nx + ny * 0.6) < -0.2 ? light : dark;
    if (d > 0.82) col = edge;
    if (speckle && r() < 0.08) col = speckle;
    g.fillStyle = col; g.fillRect(x, y, 1, 1);
  }
  return c;
}
function chevron(right) {
  const rows = [
    "KKKKKKKKKKKK", "KYYYYYYYYYYK", "KYYKKYYYYYYK", "KYYYKKYYYYYK", "KYYYYKKYYYYK", "KYYYYYKKYYYK",
    "KYYYYKKYYYYK", "KYYYKKYYYYYK", "KYYKKYYYYYYK", "KYYYYYYYYYYK", "KKKKKKKKKKKK",
    ".....KK.....", ".....KK.....", ".....KK.....", ".....KK.....",
  ];
  const c = fromMap(rows, { K:'#1a1420', Y:'#ffc21a' });
  return right ? c : flip(c);
}
const GLYPH = {
  A:[".#.","#.#","###","#.#","#.#"], C:["###","#..","#..","#..","###"], D:["##.","#.#","#.#","#.#","##."],
  E:["###","#..","##.","#..","###"], F:["###","#..","##.","#..","#.."], G:["###","#..","#.#","#.#","###"],
  I:["###",".#.",".#.",".#.","###"], K:["#.#","##.","#..","##.","#.#"], O:["###","#.#","#.#","#.#","###"],
  R:["##.","#.#","##.","#.#","#.#"], S:["###","#..","###","..#","###"], T:["###",".#.",".#.",".#.",".#."],
  P:["##.","#.#","##.","#..","#.."], J:["..#","..#","..#","#.#","###"], U:["#.#","#.#","#.#","#.#","###"], M:["#.#","###","###","#.#","#.#"], V:["#.#","#.#","#.#","#.#",".#."],
  " ":["...","...","...","...","..."],
};
function billboard(text, bg, fg) {
  const tw = text.length * 4 - 1, w = tw * 2 + 8, h = 26;
  const c = mk(w, h), g = c.getContext('2d');
  g.fillStyle = '#3a2a22'; g.fillRect(4, 14, 2, 12); g.fillRect(w - 6, 14, 2, 12);
  g.fillStyle = '#140e18'; g.fillRect(0, 0, w, 16);
  g.fillStyle = bg; g.fillRect(1, 1, w - 2, 14);
  g.fillStyle = fg;
  [...text].forEach((ch, i) => {
    const gl = GLYPH[ch] || GLYPH[' '];
    gl.forEach((row, y) => [...row].forEach((p, x) => { if (p === '#') g.fillRect(4 + (i * 4 + x) * 2, 3 + y * 2, 2, 2); }));
  });
  return c;
}
function building(w, h, face, seed, neon) {
  const c = mk(w, h), g = c.getContext('2d'), r = rng(seed);
  c.glow = [];
  g.fillStyle = '#07060e'; g.fillRect(0, 0, w, h);
  g.fillStyle = face; g.fillRect(1, 2, w - 2, h - 2);
  g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(1, 2, 2, h - 2);
  const lights = ['#ffd98a', '#ffe7b0', '#9fd8ff', '#ffb870', '#ffd98a'];
  for (let y = 6; y < h - 8; y += 5) {
    const rowLit = r() < 0.85;
    for (let x = 4; x < w - 4; x += 4) {
      const lit = rowLit && r() < 0.45;
      const col = lit ? lights[Math.floor(r() * lights.length)] : '#14111f';
      g.fillStyle = col; g.fillRect(x, y, 2, 3);
      if (lit) for (let yy = 0; yy < 3; yy++) for (let xx = 0; xx < 2; xx++) c.glow.push([x + xx, y + yy, col]);
    }
  }
  g.fillStyle = '#0d0b14'; g.fillRect(Math.floor(w / 2) - 3, h - 7, 6, 7);          // entrance
  g.fillStyle = '#ffd98a'; g.fillRect(Math.floor(w / 2) - 2, h - 6, 4, 1);
  c.glow.push([Math.floor(w / 2) - 2, h - 6, '#ffd98a'], [Math.floor(w / 2) - 1, h - 6, '#ffd98a'], [Math.floor(w / 2), h - 6, '#ffd98a'], [Math.floor(w / 2) + 1, h - 6, '#ffd98a']);
  if (neon) {
    const nc = ['#ff3fa4', '#3ff0ff', '#b46bff'][seed % 3];
    for (let x = 2; x < w - 2; x++) { g.fillStyle = nc; g.fillRect(x, 3, 1, 1); c.glow.push([x, 3, nc]); }
  }
  // rooftop antenna with a red light
  const ax = 3 + Math.floor(r() * (w - 6));
  g.fillStyle = '#ff2a2a'; g.fillRect(ax, 0, 1, 1); c.glow.push([ax, 0, '#ff3a3a']);
  return c;
}
function streetLamp() {
  const c = mk(16, 46), g = c.getContext('2d');
  g.fillStyle = '#3e3e4a'; g.fillRect(2, 4, 2, 42);
  g.fillStyle = '#2a2a33'; g.fillRect(1, 44, 4, 2);
  g.fillStyle = '#3e3e4a'; g.fillRect(2, 3, 11, 1);
  g.fillStyle = '#1c1c22'; g.fillRect(10, 2, 5, 3);
  g.fillStyle = '#fff0c0'; g.fillRect(11, 5, 3, 1);
  c.glow = [[11, 5, '#fff0c0'], [12, 5, '#fff0c0'], [13, 5, '#fff0c0']];
  return c;
}
function neonSign(text, col) {
  const tw = text.length * 4 - 1, w = tw * 2 + 8, h = 26;
  const c = mk(w, h), g = c.getContext('2d');
  c.glow = [];
  g.fillStyle = '#2a2a32'; g.fillRect(4, 15, 2, 11); g.fillRect(w - 6, 15, 2, 11);
  g.fillStyle = '#0d0a16'; g.fillRect(0, 0, w, 16);
  g.fillStyle = col;
  const dot = (x, y) => { g.fillRect(x, y, 1, 1); c.glow.push([x, y, col]); };
  for (let x = 1; x < w - 1; x++) { dot(x, 1); dot(x, 14); }
  for (let y = 1; y < 15; y++) { dot(1, y); dot(w - 2, y); }
  [...text].forEach((ch, i) => {
    const gl = GLYPH[ch] || GLYPH[' '];
    gl.forEach((row, y) => [...row].forEach((p, x) => {
      if (p !== '#') return;
      const px = 4 + (i * 4 + x) * 2, py = 3 + y * 2;
      dot(px, py); dot(px + 1, py); dot(px, py + 1); dot(px + 1, py + 1);
    }));
  });
  return c;
}
function shaded(w, h, inside, light, dark, edge, spot) {
  // fills a mask, shades left/right halves of each run and outlines it
  const c = mk(w, h), g = c.getContext('2d');
  const m = (x, y) => x >= 0 && y >= 0 && x < w && y < h && inside(x, y);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!m(x, y)) continue;
    let col;
    if (!m(x - 1, y) || !m(x + 1, y) || !m(x, y - 1) || !m(x, y + 1)) col = edge;
    else {
      let l = x; while (m(l - 1, y)) l--;
      let r = x; while (m(r + 1, y)) r++;
      col = (x - l) <= (r - l) / 2 ? light : dark;
      if (spot && (x * 7 + y * 3) % 11 === 0) col = spot;
    }
    g.fillStyle = col; g.fillRect(x, y, 1, 1);
  }
  return c;
}
function cactus(variant) {
  const arms = variant === 0
    ? [[2, 6, 5, 17, 2, 15, 7, 17], [11, 10, 14, 21, 9, 19, 14, 21]]
    : [[11, 4, 14, 14, 9, 12, 14, 14]];
  return shaded(16, 36, (x, y) => {
    if (x >= 6 && x <= 9 && y >= 2 && y < 36 && !(y === 2 && (x === 6 || x === 9))) return true;
    for (const [ax1, ay1, ax2, ay2, hx1, hy1, hx2, hy2] of arms) {
      if (x >= ax1 && x <= ax1 + 2 && y >= ay1 && y <= ay2 && !(y === ay1 && (x === ax1 || x === ax1 + 2))) return true;
      if (x >= Math.min(hx1, ax1) && x <= Math.max(hx2, ax1 + 2) && y >= hy1 && y <= hy2) return true;
    }
    return false;
  }, '#4f9a52', '#357440', '#1b4128', '#8cc870');
}
function mesaRock() {
  return shaded(60, 30, (x, y) => {
    const slope = Math.min(x, 59 - x);
    return y >= 4 && y >= 30 - slope * 2.2 - 0 || (y >= 4 && slope > 11);
  }, '#d4885a', '#b86a42', '#6a3420', '#e4a070');
}
function telegraphPole() {
  const c = mk(12, 44), g = c.getContext('2d');
  g.fillStyle = '#5a3e26'; g.fillRect(5, 2, 2, 42);
  g.fillStyle = '#4a321e'; g.fillRect(0, 5, 12, 2);
  g.fillStyle = '#d8dde6'; g.fillRect(1, 4, 1, 1); g.fillRect(10, 4, 1, 1); g.fillRect(3, 4, 1, 1); g.fillRect(8, 4, 1, 1);
  return c;
}
function pragueHouse(w, h, face, roof, seed) {
  const c = mk(w, h), g = c.getContext('2d'), r = rng(seed);
  c.glow = [];
  const roofH = 10 + (seed % 3) * 3;
  // steep tiled roof
  for (let y = 0; y < roofH; y++) {
    const half = Math.round((y + 1) / roofH * (w / 2));
    for (let x = Math.floor(w / 2) - half; x < Math.ceil(w / 2) + half; x++) {
      const edge = x === Math.floor(w / 2) - half || x === Math.ceil(w / 2) + half - 1;
      g.fillStyle = edge ? '#3a1a12' : ((y % 3 === 2) ? darken(roof, 0.75) : roof);
      g.fillRect(x, y, 1, 1);
    }
  }
  // dormer
  const dx = Math.floor(w / 2) - 2, dy = roofH - 6;
  g.fillStyle = '#efe6cf'; g.fillRect(dx, dy, 4, 4);
  g.fillStyle = '#34404e'; g.fillRect(dx + 1, dy + 1, 2, 3);
  if (r() < 0.5) c.glow.push([dx + 1, dy + 1, '#ffd98a'], [dx + 2, dy + 1, '#ffd98a'], [dx + 1, dy + 2, '#ffd98a'], [dx + 2, dy + 2, '#ffd98a']);
  // facade
  g.fillStyle = '#2a2024'; g.fillRect(0, roofH, w, h - roofH);
  g.fillStyle = face; g.fillRect(1, roofH, w - 2, h - roofH);
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(1, roofH, w - 2, 1); g.fillRect(1, roofH + 1 + Math.floor((h - roofH) * 0.72), w - 2, 1);
  const lights = ['#ffd98a', '#ffe7b0', '#ffc070'];
  for (let y = roofH + 4; y < h - 14; y += 7) {
    for (let x = 3; x + 3 < w - 1; x += 5) {
      g.fillStyle = '#f3ecdc'; g.fillRect(x - 1, y - 1, 4, 6);
      g.fillStyle = '#34404e'; g.fillRect(x, y, 2, 4);
      if (r() < 0.45) { const col = lights[Math.floor(r() * lights.length)]; for (let yy = 0; yy < 4; yy++) for (let xx = 0; xx < 2; xx++) c.glow.push([x + xx, y + yy, col]); }
    }
  }
  // ground floor: arched door and a shop window
  const gy = h - 10;
  g.fillStyle = darken(face, 0.8); g.fillRect(1, gy - 1, w - 2, 11);
  g.fillStyle = '#3a2418'; g.fillRect(3, gy + 2, 5, 8); g.fillRect(4, gy + 1, 3, 1);
  g.fillStyle = '#34404e'; g.fillRect(w - 12, gy + 2, 8, 5);
  for (let x = w - 12; x < w - 4; x++) for (let y = gy + 2; y < gy + 7; y++) c.glow.push([x, y, '#ffcf80']);
  return c;
}
function gothicTower() {
  const c = shaded(26, 72, (x, y) => {
    if (x >= 4 && x <= 21 && y >= 24) return true;                       // tower body
    const sp = Math.abs(x - 12.5);
    if (y >= 3 && y < 26 && sp <= (y - 3) * 0.38 + 0.5) return true;        // main spire
    for (const px of [5, 20]) if (y >= 14 && y < 26 && Math.abs(x - px) <= (y - 14) * 0.25 + 0.5) return true;
    return false;
  }, '#5c5864', '#46424e', '#1c1a22');
  const g = c.getContext('2d');
  c.glow = [];
  g.fillStyle = '#e8c040'; g.fillRect(12, 0, 2, 3); c.glow.push([12, 0, '#ffe070'], [13, 0, '#ffe070'], [12, 1, '#ffe070'], [13, 1, '#ffe070']);
  for (const [wx, wy] of [[8, 32], [16, 32], [8, 46], [16, 46], [12, 58]]) {
    g.fillStyle = '#16141c'; g.fillRect(wx, wy + 1, 3, 7); g.fillRect(wx + 1, wy, 1, 1);
    for (let yy = wy + 2; yy < wy + 7; yy++) c.glow.push([wx + 1, yy, '#ffcf80']);
  }
  g.fillStyle = '#2a2024'; g.fillRect(10, 64, 6, 8);                      // gate arch
  g.fillStyle = '#16141c'; g.fillRect(11, 65, 4, 7);
  return c;
}
function gasLamp() {
  const c = mk(10, 44), g = c.getContext('2d');
  g.fillStyle = '#1e1e24'; g.fillRect(4, 10, 2, 32); g.fillRect(2, 41, 6, 3); g.fillRect(3, 38, 4, 3);
  g.fillStyle = '#1e1e24'; g.fillRect(2, 2, 6, 1); g.fillRect(1, 9, 8, 1); g.fillRect(4, 0, 2, 2);
  g.fillRect(2, 3, 1, 6); g.fillRect(7, 3, 1, 6);
  g.fillStyle = '#fff0c0'; g.fillRect(3, 3, 4, 6);
  c.glow = [];
  for (let y = 3; y < 9; y++) for (let x = 3; x < 7; x++) c.glow.push([x, y, '#fff0c0']);
  return c;
}
function statue() {
  return shaded(12, 30, (x, y) => {
    if (x >= 2 && x <= 9 && y >= 21) return true;                        // pedestal
    if ((x - 6) ** 2 + (y - 3) ** 2 <= 4) return true;                     // head
    if (x >= 4 && x <= 8 && y >= 5 && y <= 20) return true;                // robe
    if (x >= 3 && x <= 9 && y >= 12 && y <= 20) return true;
    if (x >= 8 && x <= 10 && y >= 2 && y <= 7) return true;                // raised arm with cross
    return false;
  }, '#4a4a44', '#34342f', '#141410');
}
function linden() {
  return shaded(22, 34, (x, y) => {
    if (x >= 10 && x <= 11 && y >= 18) return true;
    return ((x - 10.5) / 10) ** 2 + ((y - 10) / 10) ** 2 <= 1;
  }, '#5a9a44', '#3f7a34', '#1f4020', '#7cbc58');
}
function tramSprite() {
  const w = 26, h = 36, c = mk(w, h), g = c.getContext('2d');
  c.glow = [];
  g.fillStyle = '#2a2a2e';                                   // pantograph
  for (let i = 0; i < 5; i++) { g.fillRect(9 + i, 4 - i, 1, 1); g.fillRect(16 - i, 4 - i, 1, 1); }
  g.fillRect(8, 0, 10, 1); g.fillRect(10, 5, 6, 1);
  g.fillStyle = '#140e18'; g.fillRect(0, 6, w, h - 8);
  g.fillStyle = '#efe6cf'; g.fillRect(1, 7, w - 2, 13);      // cream upper body
  g.fillStyle = '#1a1a1a'; g.fillRect(6, 8, 14, 3);          // route display
  g.fillStyle = '#ffae2b'; g.fillRect(9, 9, 2, 1); g.fillRect(12, 9, 1, 1); g.fillRect(15, 9, 2, 1);
  c.glow.push([9, 9, '#ffae2b'], [10, 9, '#ffae2b'], [12, 9, '#ffae2b'], [15, 9, '#ffae2b'], [16, 9, '#ffae2b']);
  g.fillStyle = '#2a3748'; g.fillRect(3, 12, w - 6, 7);      // rear window
  g.fillStyle = '#8fb2cf'; g.fillRect(4, 13, 3, 1);
  for (let x = 3; x < w - 3; x++) for (let y = 12; y < 19; y++) if ((x + y) % 3 === 0) c.glow.push([x, y, '#d8c890']);
  g.fillStyle = '#c8302c'; g.fillRect(1, 20, w - 2, 11);     // red lower body
  g.fillStyle = '#efe6cf'; g.fillRect(1, 24, w - 2, 1);
  g.fillStyle = '#ff2a2a'; g.fillRect(2, 27, 3, 2); g.fillRect(w - 5, 27, 3, 2);
  for (const x of [2, 3, 4, w - 5, w - 4, w - 3]) for (const y of [27, 28]) c.glow.push([x, y, '#ff5a4a']);
  g.fillStyle = '#3a3a40'; g.fillRect(1, 31, w - 2, 2);
  g.fillStyle = '#18181c'; g.fillRect(3, 33, 6, 3); g.fillRect(w - 9, 33, 6, 3);
  return c;
}
function tireStack() {
  const c = mk(14, 16), g = c.getContext('2d');
  for (let k = 0; k < 3; k++) {
    const y0 = 11 - k * 5;
    g.fillStyle = '#0e0e10'; g.fillRect(1, y0, 12, 5); g.fillRect(0, y0 + 1, 14, 3);
    g.fillStyle = '#2a2a30'; g.fillRect(2, y0 + 1, 10, 3);
    g.fillStyle = k === 2 ? '#e8413c' : '#3a3a42'; g.fillRect(3, y0 + 1, 8, 1);
    g.fillStyle = '#0e0e10'; g.fillRect(5, y0 + 2, 4, 1);
  }
  return c;
}
function pennant(col) {
  const c = mk(12, 34), g = c.getContext('2d');
  g.fillStyle = '#c8ccd4'; g.fillRect(1, 0, 2, 34);
  for (let y = 0; y < 9; y++) { const len = Math.round(9 * (1 - Math.abs(y - 4) / 5)); g.fillStyle = y === 0 || y === 8 ? darken(col, 0.6) : col; g.fillRect(3, 1 + y, len, 1); }
  return c;
}
function warnSign() {
  return fromMap([
    ".....KK.....", "....KYYK....", "....KYYK....", "...KYYYYK...", "...KYKKYK...", "..KYYKKYYK..",
    "..KYYKKYYK..", ".KYYYKKYYYK.", ".KYYYYYYYYK.", "KYYYYKKYYYYK", "KYYYYYYYYYYK", "KKKKKKKKKKKK",
    ".....KK.....", ".....KK.....", ".....KK.....", ".....KK.....",
  ], { K:'#1a1420', Y:'#ffc21a' });
}
function flagPost() {
  const c = mk(12, 30), g = c.getContext('2d');
  g.fillStyle = '#d8dde6'; g.fillRect(1, 0, 2, 30);
  for (let y = 0; y < 8; y++) for (let x = 0; x < 9; x++) {
    g.fillStyle = ((x >> 1) + (y >> 1)) % 2 ? '#141414' : '#f3ecdc'; g.fillRect(3 + x, 1 + y, 1, 1);
  }
  return c;
}

const SPR = {};
function buildSprites() {
  SPR.player = riderSet('#2f6d4a', '#ece0c0', '#e6d6b0')[0];
  const rivalCols = [
    ['#d8423a', '#f2f2f2', '#2d2d36'], ['#2f7fd8', '#ffd23a', '#c83030'], ['#f2a531', '#2a2a30', '#303a8a'],
    ['#39a86b', '#e84a8a', '#e8e8e8'], ['#8e4ad8', '#40e0d0', '#1d1d24'], ['#e8e8ea', '#e83a3a', '#e8a020'],
    ['#7a5230', '#b0b0b0', '#4a6a3a'],
  ];
  SPR.rivals = rivalCols.map(c => riderSet(c[0], c[1], c[2])[0]);
  SPR.police = riderSet('#1f3a78', '#ffffff', '#f0f0f0', true);
  const lightbar = ["..........RRRRUUUU..........", ".........KKKKKKKKKK........."];
  SPR.copCar = [0, 1].map(fr => pair(fromMap(lightbar.concat(CAR), {
    K:'#140e18', B:'#f2f2f2', b:'#1d2b50', G:'#2a3748', g:'#8fb2cf', L:'#ff2a2a', P:'#ece5cc', T:'#18181c', C:'#c8ccd4',
    R: fr ? '#3a7bff' : '#ff3030', U: fr ? '#ff3030' : '#3a7bff',
  }, { L:'#ff5a4a', R: fr ? '#6a9bff' : '#ff5050', U: fr ? '#ff5050' : '#6a9bff' }), 30));
  SPR.cars = ['#c83a3a', '#3a78c8', '#e8c040', '#e8e8e8', '#3a3a46', '#4aa060'].map(c => vehicle(CAR, c, 30));
  SPR.trucks = ['#d8783a', '#5a86a8', '#b8b0a0'].map(c => vehicle(truckRows(), c, 36));
  SPR.pine = pair(pine(), 70);
  SPR.palm = pair(palm(), 64);
  SPR.rock = pair(blob(16, 9, '#a09a92', '#77716b', '#3e3a38', '#5a5550'), 45);
  SPR.bush = pair(blob(18, 10, '#56a044', '#3d7e34', '#23502a', '#7cc05a'), 40);
  SPR.chevR = pair(chevron(true), 34);
  SPR.chevL = pair(chevron(false), 34);
  SPR.boards = [billboard('RIDE', '#ffae2b', '#2a1830'), billboard('KICK', '#e8413c', '#f3e6c4'),
    billboard('GO FAST', '#3a7bff', '#f3e6c4'), billboard('DO IT', '#2a1830', '#ffae2b')].map(c => pair(c, 55));
  SPR.flag = pair(flagPost(), 40);
  // --- desert ---
  SPR.cacti = [pair(cactus(0), 55), pair(cactus(1), 55)];
  SPR.tumble = pair(blob(14, 12, '#b89058', '#8a6a3a', '#5a4428', '#d8b070'), 34);
  SPR.redRock = pair(blob(20, 11, '#d0784a', '#a8583a', '#5a2a18', '#e09060'), 48);
  SPR.mesa = pair(mesaRock(), 140);
  SPR.pole = pair(telegraphPole(), 60);
  SPR.diner = pair(neonSign('CAFE', '#ff3fa4'), 50);
  // --- prague ---
  const pastel = ['#e8c878', '#e8a8a0', '#b8d8c0', '#efe0c0', '#c8b8e0', '#f0c090', '#d8e0a8'];
  const roofs = ['#b0503a', '#a04830', '#8a4a3a'];
  SPR.pHouses = [];
  for (let i = 0; i < 12; i++) {
    const w = 28 + (i * 5) % 14, h = 62 + (i * 11) % 22;
    SPR.pHouses.push(pair(pragueHouse(w, h, pastel[i % pastel.length], roofs[i % roofs.length], 200 + i), 72));
  }
  SPR.gothic = pair(gothicTower(), 72);
  SPR.gasLampL = pair(gasLamp(), 50);
  SPR.gasLampR = pair(flip(gasLamp()), 50);
  SPR.statue = pair(statue(), 55);
  SPR.linden = pair(linden(), 62);
  SPR.pivo = pair(billboard('PIVO', '#e8c040', '#5a2a18'), 55);
  SPR.tram = pair(tramSprite(), 40);
  SPR.pCars = ['#e8e8e8', '#2a5a9a', '#3a3a46', '#8a2a3a', '#4aa060', '#c8a040'].map(c => vehicle(CAR, c, 30));
  // --- stunt canyon ---
  SPR.tires = pair(tireStack(), 42);
  SPR.pennants = ['#e8413c', '#ffae2b', '#3a7bff', '#39a86b'].map(c => pair(pennant(c), 42));
  SPR.warn = pair(warnSign(), 36);
  SPR.jump = pair(billboard('JUMP', '#ffae2b', '#2a1830'), 55);
  // --- night city ---
  const faces = ['#2a2440', '#1f2a3a', '#33283a', '#232c2c', '#2c2230', '#262a44'];
  SPR.buildings = [];
  for (let i = 0; i < 10; i++) {
    const w = 26 + (i * 7) % 18, h = 60 + (i * 13) % 50;
    SPR.buildings.push(pair(building(w, h, faces[i % faces.length], 100 + i, i % 3 === 0), 75));
  }
  const lamp = streetLamp();
  SPR.lampL = pair(lamp, 50);
  SPR.lampR = pair(flip(lamp), 50);
  SPR.neons = [['DISCO', '#ff3fa4'], ['CAFE', '#3ff0ff'], ['RIDE', '#ffae2b'], ['KICK', '#8aff5a']].map(([t, c]) => pair(neonSign(t, c), 50));
  SPR.cone = pair(fromMap([
    "..KK..", "..OO..", ".KWWK.", ".OOOO.", ".WWWW.", "KOOOOK", "KKKKKK",
  ], { K:'#241a14', O:'#ff7a1a', W:'#f3ecdc' }), 30);
  SPR.bin = pair(blob(12, 14, '#5a6068', '#454a52', '#22252a', '#6a7078'), 34);
  SPR.cityCars = ['#f2c230', '#f2c230', '#e8e8e8', '#3a3a46', '#8a2a3a', '#2a5a9a'].map(c => vehicle(CAR, c, 30));
  SPR.buses = ['#c83a3a', '#2a8a6a'].map(c => vehicle(truckRows(), c, 38, { G:'#ffd98a' }));
  const dpal = { K:'#140e18', D:'#2d3440', d:'#5a6678', R:'#c8d0dc', G:'#ff3fa4', L:'#6dff8a' };
  const dglow = { L:'#6dff8a', G:'#ff3fa4' };
  const droneBody = [
    "...KK..........KK...",
    "...KKKKKKKKKKKKKK...",
    "....KddddddddddK....",
    "....KDDDDLLDDDDK....",
    ".....KDDDDDDDDK.....",
    "......KKKGGKKK......",
    ".........GG.........",
    "........KGGK........",
  ];
  const rotorA = "RRRRRR........RRRRRR", rotorB = "..RRRRRR....RRRRRR..";
  SPR.drone = [rotorA, rotorB].map(r => pair(fromMap([r].concat(droneBody), dpal, dglow), 1));
  // pickup: the drone hovering over a glowing pad
  SPR.dronePickup = [rotorA, rotorB].map(r => pair(fromMap([r].concat(droneBody, [
    "....................", "....................",
    "...YYYYYYYYYYYYYY...", "..YyyyyyyyyyyyyyyY..", "...YYYYYYYYYYYYYY...",
  ]), Object.assign({ Y:'#ffae2b', y:'#ffe08a' }, dpal), Object.assign({ Y:'#ffae2b', y:'#ffe08a' }, dglow)), 26));
  SPR.splash = fromMap([
    ".......W........",
    "..W...WLW...W...",
    "...W..WLW..W..W.",
    ".W.WL.LWL.LW.W..",
    "..WLLWLWLWLLW...",
    ".WLLBLWWWLBLLW..",
    "WLLBBLLWLLBBLLW.",
    "LLBBBBLLLBBBBLL.",
    "BBBBBBBBBBBBBBBB",
    ".BBDBBBBBBBDBB..",
    "..DDDBBBBBDDD...",
  ], { W:'#f4fbff', L:'#9fd4f0', B:'#4a8ab8', D:'#2e5f88' });
  const NITRO = [
    "...KKKK...", "..KCCCCK..", ".KCCCCCCK.", ".KCWWWWCK.", ".KCWZZWCK.",
    ".KCWZZWCK.", ".KCWZZWCK.", ".KCWWWWCK.", ".KCCCCCCK.", ".KCCCCCCK.",
    "..KCCCCK..", "...KKKK...",
  ];
  const npal = { K:'#0a2a3a', C:'#3fd0ff', W:'#eaffff', Z:'#0a6a9a' };
  const nglow = { C:'#6fe0ff', W:'#eaffff', Z:'#2a9ad0' };
  SPR.nitro = pair(fromMap(NITRO, npal, nglow), 1);
  SPR.nitroPickup = pair(fromMap(NITRO.concat([
    "..........", "..........",
    ".BBBBBBBB.", "BbbbbbbbbB", ".BBBBBBBB.",
  ]), Object.assign({ B:'#3fd0ff', b:'#c8f2ff' }, npal), Object.assign({ B:'#3fd0ff', b:'#c8f2ff' }, nglow)), 26);
  SPR.shot = pair(fromMap([".KK.", "KGgK", "KGGK", ".KK."], { K:'#7a1050', G:'#ff3fa4', g:'#ffc0e0' }, { G:'#ff3fa4', g:'#ffc0e0' }), 22);
  SPR.dustSmoke = pair(blob(10, 7, '#b6b6be', '#8e8e98', '#6a6a74', '#d0d0d8'), 13);
  SPR.dustSand = pair(blob(10, 7, '#e6c48a', '#cda868', '#a5824a', '#f2dca8'), 13);
  SPR.splat = pair(fromMap([
    "..G....G..G.",
    ".GGG..GGG...",
    "GGGGGGGGGG.G",
    ".GGGgGGGGGG.",
    "GGGGGGGgGGGG",
    ".GGGGGGGGG..",
    "..G.GGG..G..",
    "....G....G..",
  ], { G:'#ff3fa4', g:'#ffc0e0' }, { G:'#ff3fa4', g:'#ffc0e0' }), 40);
}
