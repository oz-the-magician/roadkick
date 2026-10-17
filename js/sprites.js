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
  B:["##.","#.#","##.","#.#","##."], H:["#.#","#.#","###","#.#","#.#"], L:["#..","#..","#..","#..","###"],
  N:["##.","#.#","#.#","#.#","#.#"], Z:["###","..#",".#.","#..","###"], Y:["#.#","#.#",".#.",".#.",".#."],
  2:["###","..#","###","#..","###"], 4:["#.#","#.#","###","..#","..#"], 7:["###","..#",".#.",".#.",".#."],
  "/":["..#","..#",".#.","#..","#.."],
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
  const px = (x, y, col, ww = 1, hh = 1, glow) => {
    g.fillStyle = col; g.fillRect(x, y, ww, hh);
    if (glow) for (let yy = 0; yy < hh; yy++) for (let xx = 0; xx < ww; xx++) c.glow.push([x + xx, y + yy, col]);
  };
  const shop = h - 11;                         // the ground floor is a shop front
  g.fillStyle = '#07060e'; g.fillRect(0, 0, w, h);
  g.fillStyle = face; g.fillRect(1, 2, w - 2, h - 2);
  g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(1, 2, 2, h - 2);
  // cornice line and a darker band every few floors so facades differ
  const band = 3 + (seed % 3) * 2;
  for (let y = 8 + band; y < shop - 4; y += band * 5) { g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(1, y, w - 2, 1); }
  const lights = ['#ffd98a', '#ffe7b0', '#9fd8ff', '#ffb870', '#ffd98a'];
  const wStep = seed % 2 ? 4 : 5;
  for (let y = 6; y < shop - 3; y += 5) {
    const rowLit = r() < 0.85;
    for (let x = 4; x < w - 4; x += wStep) {
      const lit = rowLit && r() < 0.45;
      px(x, y, lit ? lights[Math.floor(r() * lights.length)] : '#14111f', 2, 3, lit);
      if (!lit && r() < 0.12) px(x, y + 3, '#8a8e98', 3, 2);            // air conditioner under a dark window
    }
  }
  // fire escape down one side: landings with zig-zag ladders
  if (seed % 3 !== 1 && w > 28) {
    const fx = seed % 2 ? 2 : w - 11;
    for (let y = 10; y < shop - 4; y += 10) {
      px(fx, y, '#8a8698', 9, 1); px(fx, y - 3, '#6a6678', 1, 3); px(fx + 8, y - 3, '#6a6678', 1, 3); px(fx, y - 3, '#8a8698', 9, 1);
      for (let k = 0; k < 9; k++) px(fx + (((y / 10) | 0) % 2 ? k : 8 - k), y + 1 + k, '#7a7688');
    }
  }
  // shop front: awning, glowing window, door
  const aw = ['#e8413c', '#3a7bff', '#39a86b', '#ffae2b', '#b46bff'][seed % 5];
  for (let x = 1; x < w - 1; x++) px(x, shop, (x >> 1) % 2 ? aw : '#f3e6c4', 1, 2);
  px(1, shop + 2, '#07060e', w - 2, 1);
  const glass = ['#ffe7b0', '#9fd8ff', '#ffd0f0'][seed % 3];
  px(3, shop + 4, glass, w - 13, 5, true);
  for (let x = 3 + 6; x < w - 10; x += 7) px(x, shop + 4, '#2a2434', 1, 5);
  px(w - 9, shop + 3, '#0d0b14', 6, 8); px(w - 8, shop + 4, '#ffd98a', 4, 1, true);
  if (neon) {
    const nc = ['#ff3fa4', '#3ff0ff', '#b46bff'][seed % 3];
    for (let x = 2; x < w - 2; x++) px(x, 3, nc, 1, 1, true);
  }
  // vertical neon blade sign on some buildings
  if (seed % 4 === 2) {
    const nc = ['#ff3fa4', '#3ff0ff', '#8aff5a', '#ffae2b'][seed % 4];
    px(w - 4, 12, '#0d0a16', 3, 18);
    for (let y = 13; y < 29; y += 2) px(w - 3, y, nc, 1, 1, true);
  }
  const ax = 3 + Math.floor(r() * (w - 6));
  px(ax, 0, '#ff2a2a', 1, 1, true);
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

/* ---------- mountain extras ---------- */
function guardRail() {
  // wooden barrier: two planks on short posts, seen side-on
  return fromMap([
    "K.......K.......K.......",
    "KKKKKKKKKKKKKKKKKKKKKKKK",
    "WwWwwWwWWwwWwWwwWwWWwwWK",
    "KKKKKKKKKKKKKKKKKKKKKKKK",
    "KpK.....KpK.....KpK.....",
    "KKKKKKKKKKKKKKKKKKKKKKKK",
    "wWwWWwwWwWWwWwWWwwWwWwWK",
    "KKKKKKKKKKKKKKKKKKKKKKKK",
    "KpK.....KpK.....KpK.....",
    "KpK.....KpK.....KpK.....",
  ], { K:'#2a1a10', W:'#a8743e', w:'#8a5a2e', p:'#6a4424' });
}
function kmPost() {
  return fromMap([
    "KKKK", "KRRK", "KRRK", "KWWK", "KWKK", "KWWK", "KWKK", "KWWK", "KWWK", "KWWK", "KWWK", "KWWK", "KKKK",
  ], { K:'#1a1420', R:'#e8413c', W:'#eee8dc' });
}
function cabin() {
  const w = 42, h = 34, c = mk(w, h), g = c.getContext('2d');
  const px = (x, y, col, ww = 1, hh = 1) => { g.fillStyle = col; g.fillRect(x, y, ww, hh); };
  // smoke and chimney
  [[33, 0], [31, 2], [34, 3], [32, 5]].forEach(([x, y], i) => px(x, y, i % 2 ? '#c8ccd2' : '#e4e7ea', 3, 2));
  px(31, 6, '#2a1a10', 5, 8); px(32, 7, '#7a6a5e', 3, 7);
  // roof
  for (let y = 0; y < 12; y++) {
    const half = 5 + y * 1.6 | 0;
    px(21 - half, 8 + y, '#2a1a10', half * 2 + 1, 1);
    if (y > 0) px(22 - half, 8 + y, y % 3 ? '#8a3a2a' : '#6a2a20', half * 2 - 1, 1);
  }
  // log walls
  for (let y = 20; y < 33; y++) px(3, y, (y % 2) ? '#9a6436' : '#7a4a26', 36, 1);
  for (let y = 20; y < 33; y += 2) { px(2, y, '#c08a50', 2, 1); px(38, y, '#c08a50', 2, 1); }
  px(3, 33, '#2a1a10', 36, 1);
  // door and lit window
  px(8, 23, '#2a1a10', 7, 10); px(9, 24, '#5a3418', 5, 9); px(13, 28, '#e8c040');
  px(23, 23, '#2a1a10', 10, 7); px(24, 24, '#ffd870', 8, 5); px(27, 24, '#2a1a10', 1, 5); px(24, 26, '#2a1a10', 8, 1);
  c.glow = [];
  for (let x = 24; x < 32; x++) for (let y = 24; y < 29; y++) if (x !== 27 && y !== 26) c.glow.push([x, y, '#ffd870']);
  return c;
}
function woodpile() {
  const c = mk(22, 12), g = c.getContext('2d');
  for (let row = 0; row < 3; row++) for (let i = 0; i < 6 - row; i++) {
    const x = 1 + row * 2 + i * 3.4 | 0, y = 8 - row * 3;
    g.fillStyle = '#3a2414'; g.fillRect(x, y, 4, 4);
    g.fillStyle = '#c89a62'; g.fillRect(x + 1, y + 1, 2, 2);
    g.fillStyle = '#8a5a30'; g.fillRect(x + 1, y + 1, 1, 1);
  }
  return c;
}
function birch() {
  const w = 18, h = 40, c = mk(w, h), g = c.getContext('2d');
  for (let y = 10; y < h; y++) {
    g.fillStyle = '#2a2a2a'; g.fillRect(8, y, 1, 1); g.fillRect(11, y, 1, 1);
    g.fillStyle = (y * 7) % 9 < 2 ? '#2a2a2a' : '#eeeae0'; g.fillRect(9, y, 2, 1);
  }
  const r = rng(77);
  // solid oval crown with a dark rim, light left side and a few loose leaves around the edge
  for (let y = 1; y < 24; y++) for (let x = 1; x < 17; x++) {
    const d = ((x - 9) / 7.5) ** 2 + ((y - 12) / 11) ** 2;
    if (d > 1) continue;
    g.fillStyle = d > 0.8 ? '#3f7a2c' : (x < 9 - (y % 3) ? '#9ad05a' : '#6aaa3c');
    if (d <= 0.8 && r() < 0.12) g.fillStyle = '#c4e47a';
    g.fillRect(x, y, 1, 1);
  }
  for (let i = 0; i < 14; i++) { g.fillStyle = '#6aaa3c'; g.fillRect(r() * 18 | 0, 2 + r() * 22 | 0, 1, 1); }
  g.fillStyle = '#eeeae0'; g.fillRect(9, 18, 2, 6);
  return c;
}
function stump() {
  return fromMap([
    ".KKKKKK.", "KccCCccK", "KcCccCcK", "KbbbbbbK", "KbBbbBbK", "KbbbBbbK", "KKbbbbKK", "KKKKKKKK",
  ], { K:'#2a1a10', c:'#d8b07a', C:'#a8784a', b:'#7a4e2a', B:'#5a3618' });
}

/* ---------- city extras ---------- */
function busStop() {
  const c = mk(34, 28), g = c.getContext('2d'); c.glow = [];
  const px = (x, y, col, ww = 1, hh = 1, glow) => { g.fillStyle = col; g.fillRect(x, y, ww, hh); if (glow) for (let yy = 0; yy < hh; yy++) for (let xx = 0; xx < ww; xx++) c.glow.push([x + xx, y + yy, col]); };
  px(2, 4, '#1a1820', 26, 2); px(3, 6, '#3a3a46', 1, 22); px(26, 6, '#3a3a46', 1, 22);
  px(4, 7, 'rgba(160,200,230,0.28)', 22, 16);
  px(5, 8, '#ff9ad8', 9, 13, true); px(6, 10, '#ffffff', 7, 2, true); px(7, 14, '#3ff0ff', 5, 5, true);   // lit poster
  px(15, 20, '#5a4a3a', 10, 2); px(16, 22, '#2a2430', 1, 5); px(23, 22, '#2a2430', 1, 5);               // bench
  px(30, 0, '#3a3a46', 1, 28); px(28, 0, '#f3e6c4', 6, 5); px(29, 1, '#3a7bff', 4, 3);                  // stop sign
  return c;
}
function kiosk(text, col) {
  const sign = neonSign(text, col);
  const w = Math.max(30, sign.width), c = mk(w, 44), g = c.getContext('2d'); c.glow = [];
  const ox = (w - sign.width) >> 1;
  g.drawImage(sign, ox, 0, sign.width, 16, ox, 0, sign.width, 16);
  for (const p of sign.glow) if (p[1] < 16) c.glow.push([p[0] + ox, p[1], p[2]]);
  const bx = (w - 28) >> 1;
  g.fillStyle = '#07060e'; g.fillRect(bx, 16, 28, 28);
  g.fillStyle = '#3a3048'; g.fillRect(bx + 1, 17, 26, 27);
  g.fillStyle = '#ffe7b0'; g.fillRect(bx + 3, 20, 22, 11);
  // goods on the counter stay visible: only the empty glass glows
  const goods = [[6, 26, 4, 5, '#c86a3a'], [13, 24, 3, 7, '#e8413c'], [19, 27, 4, 4, '#4aa060']];
  for (let y = 20; y < 31; y++) for (let x = bx + 3; x < bx + 25; x++) {
    const it = goods.find(([gx, gy, gw, gh]) => x >= bx + gx && x < bx + gx + gw && y >= gy && y < gy + gh);
    c.glow.push([x, y, it ? it[4] : '#ffe7b0']);
  }
  for (const [gx, gy, gw, gh, col] of goods) { g.fillStyle = col; g.fillRect(bx + gx, gy, gw, gh); }
  g.fillStyle = '#5a4a3a'; g.fillRect(bx + 2, 31, 24, 2);
  g.fillStyle = '#2a2430'; g.fillRect(bx + 1, 33, 26, 11);
  return c;
}
function trafficLight(on) {
  const c = mk(10, 46), g = c.getContext('2d'); c.glow = [];
  g.fillStyle = '#2e2e38'; g.fillRect(4, 10, 2, 36); g.fillStyle = '#1e1e26'; g.fillRect(3, 44, 4, 2);
  g.fillStyle = '#0d0d12'; g.fillRect(1, 0, 8, 22);
  for (const [y, col] of [[2, '#3a1414'], [9, on ? '#ffb020' : '#3a2a10'], [16, '#10301a']]) {
    g.fillStyle = col; g.fillRect(3, y, 4, 4);
    if (col === '#ffb020') for (let yy = 0; yy < 4; yy++) for (let xx = 0; xx < 4; xx++) c.glow.push([3 + xx, y + yy, col]);
  }
  return c;
}

/* ---------- desert extras ---------- */
function gasStation() {
  const w = 64, h = 44, c = mk(w, h), g = c.getContext('2d'); c.glow = [];
  const px = (x, y, col, ww = 1, hh = 1) => { g.fillStyle = col; g.fillRect(x, y, ww, hh); };
  // tall price sign on a pole
  px(4, 0, '#1a1420', 14, 13); px(5, 1, '#e8413c', 12, 7); px(5, 9, '#f3e6c4', 12, 3);
  [...'GAS'].forEach((ch, i) => GLYPH[ch].forEach((row, yy) => [...row].forEach((p, xx) => p === '#' && px(6 + i * 4 + xx, 2 + yy, '#f3e6c4'))));
  for (let x = 6; x < 16; x += 3) px(x, 10, '#2a2430', 2, 1);
  px(10, 12, '#4a4652', 2, 32);
  // canopy with faded stripe
  px(18, 10, '#1a1420', 44, 2); px(19, 12, '#e8e0d0', 42, 3); px(19, 13, '#c8503a', 42, 1);
  px(22, 15, '#6a6670', 2, 29); px(56, 15, '#6a6670', 2, 29);
  // two pumps, one with its hose hanging
  for (const x of [27, 37]) { px(x, 30, '#1a1420', 7, 14); px(x + 1, 31, '#c8503a', 5, 12); px(x + 2, 33, '#e8e0d0', 3, 3); }
  px(33, 34, '#1a1420', 1, 6); px(32, 39, '#1a1420', 2, 1);
  // shuttered kiosk at the back, boarded window, cracked slab
  px(46, 22, '#1a1420', 16, 22); px(47, 23, '#b8a07a', 14, 21); px(49, 27, '#5a4028', 9, 6); px(49, 29, '#8a6a40', 9, 1); px(49, 31, '#8a6a40', 9, 1);
  px(18, 43, '#8a8070', 46, 1);
  return c;
}
function motelSign(lit) {
  // MOTEL with a dead "T" that flickers: lit=false turns two letters off
  const col = '#ff3fa4', sign = neonSign('MOTEL', col);
  const c = mk(sign.width, sign.height + 18), g = c.getContext('2d');
  g.drawImage(sign, 0, 0);
  c.glow = sign.glow.filter(p => lit || !(p[0] >= 4 + 8 * 2 && p[0] < 4 + 8 * 4 && p[1] > 2 && p[1] < 14));
  if (!lit) { g.fillStyle = '#3a1428'; for (const [x, y] of sign.glow) if (x >= 20 && x < 36 && y > 2 && y < 14) g.fillRect(x, y, 1, 1); }
  g.fillStyle = '#2a2a32'; g.fillRect(4, 26, 2, 18); g.fillRect(c.width - 6, 26, 2, 18);
  g.fillStyle = '#ffae2b'; g.fillRect(8, 17, c.width - 16, 6);
  g.fillStyle = '#2a1830'; for (let x = 10; x < c.width - 10; x += 3) g.fillRect(x, 19, 2, 2);
  return c;
}
function cowSkull() {
  return fromMap([
    "W..........W", "WW........WW", ".WWWWWWWWWW.", "..WWwWWwWW..", "..WKKWWKKW..", "...WWWWWW...", "....WWWW....", "....WkkW....", ".....WW.....",
  ], { W:'#eee6d4', w:'#c8bca4', K:'#1a1420', k:'#5a4a3a' });
}
function rustyCar() {
  return fromMap([
    "......KKKKKKKK..........",
    ".....KrrRRRRrrK.........",
    "....KrR.....RrrK........",
    "..KKKRRRRRRRRRRRKKKKK...",
    ".KRRrRRRrRRRRRrRRRRRRK..",
    "KRRoRRRRRRoooRRRRRrRRRK.",
    "KrrrrrrrrrrrrrrrrrrrrrrK",
    "KKKK..KKKKKKKKKKK..KKKKK",
    "...KttK.........KttK....",
    "....KK...........KK.....",
  ], { K:'#2a1810', R:'#9a4a2a', r:'#6a3018', o:'#c8803a', t:'#3a3030' });
}
function windmill(phase) {
  const w = 26, h = 50, c = mk(w, h), g = c.getContext('2d');
  // lattice tower
  for (let y = 16; y < h; y++) {
    const half = Math.round(2 + (y - 16) * 0.16);
    g.fillStyle = '#4a4040'; g.fillRect(13 - half, y, 1, 1); g.fillRect(13 + half, y, 1, 1);
    if (y % 6 === 0) g.fillRect(13 - half, y, half * 2 + 1, 1);
  }
  g.fillStyle = '#6a5a50'; g.fillRect(14, 12, 8, 2); g.fillRect(20, 10, 3, 6);    // tail vane
  // rotor: 8 blades, phase rotates them
  for (let b = 0; b < 8; b++) {
    const a = phase + b * Math.PI / 4;
    for (let t = 2; t < 11; t++) {
      g.fillStyle = t > 8 ? '#c8c0b0' : '#9a9088';
      const bx = 12 + Math.cos(a) * t, by = 12 + Math.sin(a) * t;
      g.fillRect(Math.round(bx), Math.round(by), 1, 1);
      if (t > 4) g.fillRect(Math.round(bx - Math.sin(a)), Math.round(by + Math.cos(a)), 1, 1);   // blade width
    }
  }
  g.fillStyle = '#2a2424'; g.fillRect(11, 11, 3, 3);
  return c;
}

/* ---------- Prague landmarks ---------- */
function pxr(c) { const g = c.getContext('2d'); c.glow = c.glow || []; return (x, y, col, w = 1, h = 1, glow) => { g.fillStyle = col; g.fillRect(x, y, w, h); if (glow) for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) c.glow.push([x + xx, y + yy, col]); }; }
function bridgeTower(powder) {
  // Old Town Bridge Tower / Powder Tower: square gothic body, steep slate roof with four corner pinnacles
  const w = 36, h = 84, body = powder ? '#4a4248' : '#8a7e70', bodyD = powder ? '#3a3238' : '#726658';
  const c = shaded(w, h, (x, y) => {
    if (x >= 5 && x <= 30 && y >= 30) return true;
    if (y >= 8 && y < 31 && Math.abs(x - 17.5) <= (y - 8) * 0.55 + 1) return true;        // roof
    for (const px of [5, 30]) if (y >= 16 && y < 31 && Math.abs(x - px) <= (y - 16) * 0.2 + 0.5) return true;
    for (const px of [11, 24]) if (y >= 20 && y < 31 && Math.abs(x - px) <= (y - 20) * 0.18 + 0.5) return true;
    return false;
  }, body, bodyD, '#1a1418');
  const px = pxr(c);
  // slate roof colour over the shaded mask
  for (let y = 9; y < 30; y++) { const half = Math.round((y - 8) * 0.55); px(18 - half, y, y % 3 ? '#2e3440' : '#3a4250', half * 2, 1); }
  px(17, 4, '#e8c040', 2, 5, true);
  // gallery and blind tracery bands
  px(5, 31, '#1a1418', 26, 2); px(5, 44, '#1a1418', 26, 1);
  for (let x = 7; x < 30; x += 4) { px(x, 34, '#2a2228', 2, 8); px(x, 34, '#3a3238'); }
  // coats of arms row (old town tower)
  if (!powder) for (const [x, col] of [[9, '#c83a3a'], [14, '#e8c040'], [20, '#3a6ab8'], [25, '#c83a3a']]) px(x, 47, col, 3, 4);
  // statues niches, windows
  for (const x of [10, 23]) { px(x, 54, '#1a1418', 3, 6); px(x + 1, 55, '#ffcf80', 1, 4, true); }
  // gate arch
  px(11, 66, '#1a1418', 14, 18); px(12, 64, '#1a1418', 12, 2); px(14, 62, '#1a1418', 8, 2);
  px(12, 67, '#2a2024', 12, 17);
  return c;
}
function orloj(phase) {
  const w = 42, h = 88, c = mk(w, h), px = pxr(c);
  // gothic town hall tower on the right, lower hall wing on the left
  px(18, 18, '#1a1418', 20, 70); px(19, 19, '#a89a88', 18, 69); px(19, 19, '#bcae9a', 6, 69);
  for (let y = 4; y < 19; y++) { const half = Math.round(4 + (y - 4) * 0.45); px(28 - half, y, '#2e3440', half * 2, 1); }
  for (const x of [18, 36]) { px(x, 10, '#2e3440', 3, 9); px(x + 1, 7, '#2e3440', 1, 3); }
  px(27, 1, '#e8c040', 2, 4, true);
  for (let y = 24; y < 44; y += 9) for (const x of [22, 30]) { px(x, y, '#1a1418', 3, 6); px(x + 1, y + 1, '#ffcf80', 1, 4, true); }
  px(0, 46, '#1a1418', 19, 42); px(1, 47, '#d8c8a8', 17, 41);
  for (let x = 3; x < 17; x += 5) { px(x, 52, '#34404e', 3, 7); px(x, 64, '#34404e', 3, 7); }
  // the astronomical clock: blue dial in a gold ring, zodiac ring, apostle windows above
  const cx = 28, cy = 60;
  for (let y = -8; y <= 8; y++) for (let x = -8; x <= 8; x++) {
    const d = Math.sqrt(x * x + y * y);
    if (d > 8.4) continue;
    px(cx + x, cy + y, d > 7.4 ? '#e8c040' : d > 5.2 ? '#2a4a8a' : y < 0 ? '#5a8ad8' : '#1e3060', 1, 1, d > 7.4);
  }
  px(cx - 1, cy - 1, '#e8c040', 2, 2, true);
  for (let t = 1; t < 7; t++) px(Math.round(cx + Math.cos(phase) * t), Math.round(cy + Math.sin(phase) * t), '#ffe070', 1, 1, true);
  px(24, 48, '#1a1418', 9, 4); px(25, 49, '#ffcf80', 2, 2, true); px(29, 49, '#ffcf80', 2, 2, true);
  px(23, 72, '#1a1418', 11, 6); px(24, 73, '#8a7a5a', 9, 4);     // calendar plate below
  px(20, 80, '#1a1418', 6, 8);
  return c;
}
function tynChurch() {
  const w = 52, h = 96, c = mk(w, h), px = pxr(c);
  const spire = (sx, top) => {
    px(sx - 5, top + 30, '#1a1418', 11, 40); px(sx - 4, top + 31, '#5a5458', 9, 39);
    for (let y = 0; y < 30; y++) { const half = Math.round(y / 30 * 5.5); px(sx - half, top + y, y % 4 ? '#262a34' : '#343a46', half * 2 + 1, 1); }
    for (const dx of [-5, -2, 2, 5]) for (let y = 0; y < 9; y++) px(sx + dx, top + 20 + y - (Math.abs(dx) > 3 ? 0 : 3), '#262a34', 1, 1);
    for (const dx of [-5, 5]) { px(sx + dx, top + 18, '#e8c040', 1, 2, true); }
    px(sx, top - 3, '#e8c040', 1, 3, true);
    for (let y = top + 36; y < top + 66; y += 9) { px(sx - 1, y, '#1a1418', 3, 6); px(sx, y + 1, '#ffcf80', 1, 4, true); }
  };
  spire(14, 6); spire(37, 4);
  // nave gable between the spires, then the Týn school arcade house in front
  for (let y = 0; y < 16; y++) { const half = Math.round(y * 0.6); px(26 - half, 38 + y, '#262a34', half * 2 + 1, 1); }
  px(18, 54, '#5a5458', 16, 20);
  px(4, 70, '#1a1418', 44, 26); px(5, 71, '#e8d0a0', 42, 25);
  for (let y = 0; y < 6; y++) { const half = Math.round(10 - y * 1.3); px(26 - half, 64 + y, '#c06448', half * 2, 1); }
  for (let x = 7; x < 45; x += 6) { px(x, 76, '#34404e', 3, 5); }
  for (let x = 6; x < 46; x += 8) { px(x, 87, '#3a2418', 6, 9); px(x + 1, 86, '#3a2418', 4, 1); }
  return c;
}
function dancingHouse() {
  const w = 46, h = 64, c = mk(w, h), px = pxr(c);
  // Fred: wavy rows of windows, metal "Medusa" dome on top
  px(20, 10, '#1a1418', 26, 54); px(21, 11, '#d8ccb4', 24, 53);
  for (let r = 0; r < 8; r++) for (let x = 23; x < 44; x += 4) {
    const y = 14 + r * 6 + Math.round(Math.sin(x * 0.4 + r) * 1.5);
    px(x, y, '#34404e', 2, 3); if ((x + r) % 3 === 0) px(x, y, '#ffd98a', 2, 3, true);
  }
  for (let y = 0; y < 10; y++) { const half = Math.round(Math.sqrt(1 - ((10 - y) / 10) ** 2) * 8); px(38 - half, y + 1, (y + half) % 2 ? '#8a8e98' : '#5a5e68', half * 2, 1); }
  // Ginger: glass tower pinched at the waist, leaning on Fred
  for (let y = 6; y < 64; y++) {
    const pinch = Math.sin(Math.PI * (y - 6) / 58), half = Math.round(10 - pinch * 4), cx = 12 + Math.round(pinch * 3);
    px(cx - half, y, '#1a1418', half * 2 + 1, 1);
    px(cx - half + 1, y, (y % 4 === 0) ? '#5a7a90' : (y % 2 ? '#8ab0c8' : '#a8cce0'), half * 2 - 1, 1);
  }
  for (let x = 3; x < 22; x += 3) px(x, 40, '#4a6070', 1, 24);
  px(0, 62, '#4a4250', 46, 2);
  return c;
}
function nationalTheatre() {
  const w = 50, h = 52, c = mk(w, h), px = pxr(c);
  px(0, 22, '#1a1418', 50, 30); px(1, 23, '#d8c8a0', 48, 29);
  // dark-blue roof with golden ridge and the crown on top
  for (let y = 0; y < 14; y++) { const half = Math.round(10 + y * 1.3); px(25 - half, 8 + y, y % 3 ? '#1e2e5a' : '#2a3e70', half * 2, 1); }
  for (let x = 6; x < 45; x += 3) px(x, 12 + Math.round(Math.abs(x - 25) * 0.25), '#e8c040', 1, 1, true);
  px(23, 1, '#e8c040', 5, 6, true); px(22, 3, '#e8c040', 7, 2, true);
  for (const x of [3, 45]) { px(x, 10, '#2a3e70', 3, 12); px(x, 8, '#e8c040', 3, 2, true); }
  for (let x = 4; x < 46; x += 6) { px(x, 27, '#34404e', 3, 6); px(x, 26, '#34404e', 3, 1); px(x, 38, '#34404e', 3, 7); }
  for (let x = 4; x < 46; x += 6) if (x % 12 === 4) { px(x, 28, '#ffd98a', 3, 4, true); }
  px(1, 47, '#a89a78', 48, 5);
  return c;
}
function slaviaStadium() {
  const w = 80, h = 46, c = mk(w, h), px = pxr(c);
  // floodlight masts
  for (const x of [4, 74]) { px(x, 2, '#3a3a46', 2, 44); px(x - 3, 0, '#1a1a22', 8, 4); for (let k = 0; k < 4; k++) px(x - 2 + k * 2, 1, '#fff6d0', 1, 2, true); }
  // red-white curved stand
  px(8, 14, '#1a1418', 64, 32);
  for (let x = 9; x < 71; x++) px(x, 15, (x >> 2) % 2 ? '#e83a3a' : '#f3f0ea', 1, 8);
  px(9, 23, '#c82a2a', 62, 10);
  [...'SLAVIA'].forEach((ch, i) => GLYPH[ch].forEach((row, yy) => [...row].forEach((p, xx) => p === '#' && px(22 + i * 6 + xx * 1, 25 + yy, '#ffffff'))));
  // the red star of Slavia on white
  px(59, 24, '#f3f0ea', 9, 9);
  ["....R....", "...RRR...", "RRRRRRRRR", ".RRRRRRR.", "..RRRRR..", "..RR.RR..", ".RR...RR."].forEach((row, yy) => [...row].forEach((p, xx) => p === 'R' && px(59 + xx, 25 + yy, '#e83a3a')));
  px(9, 33, '#2a2430', 62, 13);
  for (let x = 12; x < 70; x += 8) px(x, 36, '#ffe7b0', 4, 6, true);
  px(9, 33, '#e8e0d0', 62, 1);
  return c;
}
function controlTower() {
  const w = 22, h = 76, c = mk(w, h), px = pxr(c);
  px(8, 20, '#1a1418', 6, 56); px(9, 20, '#d8d8e0', 4, 56);
  px(3, 8, '#1a1418', 16, 12); px(4, 9, '#5a8ab8', 14, 6); for (let x = 5; x < 17; x += 3) px(x, 9, '#2a3a58', 1, 6);
  px(4, 15, '#e8e8f0', 14, 4); px(2, 7, '#3a3a46', 18, 2);
  px(10, 0, '#3a3a46', 2, 7); px(10, 0, '#ff3030', 2, 1, true);
  px(4, 10, '#9fd8ff', 14, 4, true);
  return c;
}
function terminal() {
  const w = 72, h = 26, c = mk(w, h), px = pxr(c);
  px(0, 4, '#1a1418', 72, 22); px(1, 5, '#5a7a98', 70, 14);
  for (let x = 2; x < 70; x += 4) px(x, 5, '#3a5068', 1, 14);
  for (let x = 3; x < 69; x += 4) if ((x * 7) % 5 < 2) px(x, 7, '#ffe7b0', 2, 10, true);
  px(0, 2, '#e8e8f0', 72, 3); px(1, 19, '#c8c8d0', 70, 7);
  [...'PRG'].forEach((ch, i) => GLYPH[ch] && GLYPH[ch].forEach((row, yy) => [...row].forEach((p, xx) => p === '#' && px(30 + i * 4 + xx, 20 + yy, '#3a7bff'))));
  return c;
}
function planeSprite() {
  return fromMap([
    "...........KK.....",
    "..........KWK.....",
    "KK.......KWWK.....",
    "KRK.....KWWWK.....",
    "KRRKKKKKKWWWKKKKK.",
    "KWWWWWWWWWWWWWWWBK",
    ".KKKKKKKKWWWKKKKK.",
    ".........KWWK.....",
    "..........KWK.....",
    "...........KK.....",
  ], { K:'#2a2a36', W:'#f0f2f6', R:'#e8413c', B:'#3a5a8a' });
}

/* ---------- canyon extras ---------- */
function rockArch() {
  // natural sandstone arch wide enough to span the whole road
  const w = 124, h = 64;
  const inside = (x, y) => {
    const cx = (x - 61.5) / 44, cy = (y - 64) / 46;          // opening: half-ellipse under the span
    if (cx * cx + cy * cy < 1) return false;
    const top = 4 + Math.round(Math.abs(x - 62) * 0.05 + Math.sin(x * 0.3) * 1.5);
    if (y < top) return false;
    return x > 1 + Math.max(0, 8 - y * 0.4) && x < 122 - Math.max(0, 8 - y * 0.4);
  };
  const c = shaded(w, h, inside, '#c8683e', '#a8502e', '#4a1e10', '#d88050');
  const g = c.getContext('2d');
  for (let y = 6; y < h; y += 5) for (let x = 0; x < w; x++) if (inside(x, y) && inside(x, y - 1) && (x + y) % 7) { g.fillStyle = 'rgba(90,30,15,0.35)'; g.fillRect(x, y, 1, 1); }
  return c;
}
function spectators(frame) {
  const c = mk(30, 22), px = pxr(c);
  const people = [[3, '#e8413c', '#f0c8a0'], [12, '#3a7bff', '#c89070'], [21, '#ffae2b', '#f0d0b0']];
  people.forEach(([x, shirt, skin], i) => {
    const up = (frame + i) % 2 === 0;
    px(x, 4, skin, 4, 4); px(x, 3, '#2a1810', 4, 1);
    px(x - 1, 8, shirt, 6, 7); px(x, 15, '#2a3048', 2, 7); px(x + 2, 15, '#2a3048', 2, 7);
    if (up) { px(x - 2, 3, skin, 1, 5); px(x + 5, 3, skin, 1, 5); }
    else { px(x - 2, 9, skin, 1, 4); px(x + 5, 9, skin, 1, 4); }
  });
  // checkered flag waved by the middle fan
  const fx = 18, fy = frame ? 0 : 2;
  px(fx, fy, '#1a1418', 1, 8);
  for (let y = 0; y < 4; y++) for (let x = 0; x < 6; x++) px(fx + 1 + x, fy + y, (x + y) % 2 ? '#ffffff' : '#1a1418');
  return c;
}
function tent(col) {
  const c = mk(26, 16), px = pxr(c);
  for (let y = 0; y < 15; y++) { const half = Math.round(y * 0.85); px(13 - half, y, '#1a1418', half * 2 + 1, 1); if (half > 0) px(14 - half, y, y % 4 ? col : darken(col, 0.8), half * 2 - 1, 1); }
  for (let y = 5; y < 15; y++) { const half = Math.round((y - 5) * 0.35); px(13 - half, y, '#2a1810', half * 2 + 1, 1); }
  px(0, 15, '#5a3a20', 26, 1);
  return c;
}
function trailer() {
  const c = mk(40, 20), px = pxr(c);
  for (let y = 0; y < 16; y++) {
    const inset = Math.round(Math.max(0, 4 - y) * 1.2 + Math.max(0, y - 12) * 1.5);
    px(inset, y, '#2a2a34', 40 - inset * 2, 1);
    if (y > 0 && y < 15) px(inset + 1, y, y < 4 ? '#e8ecf2' : y % 4 ? '#c8ccd4' : '#a8aeb8', 38 - inset * 2, 1);
  }
  px(6, 5, '#2a3a58', 8, 4); px(6, 5, '#ffd98a', 8, 4, true); px(24, 6, '#2a3a58', 5, 9); px(31, 5, '#2a3a58', 5, 3);
  px(10, 15, '#1a1418', 5, 5); px(11, 16, '#5a5a66', 3, 3); px(38, 12, '#4a4652', 2, 3);
  return c;
}

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
  SPR.railR = pair(guardRail(), 30, -0.5); SPR.railR.soft = true;   // barrier only bumps you back, never crashes
  SPR.kmPost = pair(kmPost(), 30);
  SPR.cabin = pair(cabin(), 95);
  SPR.woodpile = pair(woodpile(), 40);
  SPR.birch = pair(birch(), 68);
  SPR.stump = pair(stump(), 34);
  SPR.chevR = pair(chevron(true), 34);
  SPR.chevL = pair(chevron(false), 34);
  SPR.boards = [billboard('RIDE', '#ffae2b', '#2a1830'), billboard('KICK', '#e8413c', '#f3e6c4'),
    billboard('GO FAST', '#3a7bff', '#f3e6c4'), billboard('DO IT', '#2a1830', '#ffae2b')].map(c => pair(c, 55));
  SPR.flag = pair(flagPost(), 40);
  // --- desert ---
  SPR.cacti = [pair(cactus(0), 55), pair(cactus(1), 55)];
  SPR.tumble = pair(blob(14, 12, '#b89058', '#8a6a3a', '#5a4428', '#d8b070'), 34);
  // rolling tumbleweed: a scraggly ball turned in four steps
  { const ball = shaded(13, 13, (x, y) => ((x - 6) ** 2 + (y - 6) ** 2 <= 36) && ((x * 5 + y * 3) % 4 !== 0 || (x - 6) ** 2 + (y - 6) ** 2 > 25), '#c8a068', '#9a7440', '#5a4428', '#e0c088');
    const frames = [ball, rot90(ball), rot90(rot90(ball)), rot90(rot90(rot90(ball)))].map(f => pair(f, 36));
    SPR.roller = frames[0]; SPR.roller.anim = frames; SPR.roller.animMs = 90; }
  SPR.gas = pair(gasStation(), 95);
  SPR.motel = pair(motelSign(true), 55); SPR.motel.anim = [SPR.motel, SPR.motel, SPR.motel, pair(motelSign(false), 55), SPR.motel, pair(motelSign(false), 55)]; SPR.motel.animMs = 160;
  SPR.skull = pair(cowSkull(), 26);
  SPR.rustCar = pair(rustyCar(), 40);
  { const f = [0, 1, 2].map(k => pair(windmill(k * Math.PI / 12), 70)); SPR.windmill = f[0]; SPR.windmill.anim = f; SPR.windmill.animMs = 120; }
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
  SPR.bridgeTower = pair(bridgeTower(false), 78);
  SPR.powderTower = pair(bridgeTower(true), 78);
  { const f = [0, 1, 2, 3].map(k => pair(orloj(-Math.PI / 2 + k * Math.PI / 2), 74)); SPR.orloj = f[0]; SPR.orloj.anim = f; SPR.orloj.animMs = 1500; }
  SPR.tyn = pair(tynChurch(), 74);
  SPR.dancing = pair(dancingHouse(), 82);
  SPR.theatre = pair(nationalTheatre(), 82);
  SPR.slavia = pair(slaviaStadium(), 72);
  SPR.ctower = pair(controlTower(), 80);
  SPR.terminal = pair(terminal(), 72);
  SPR.letiste = pair(billboard('LETISTE', '#3a7bff', '#ffffff'), 55);
  SPR.letna = pair(billboard('LETNA', '#39a86b', '#ffffff'), 55);
  SPR.plane = planeSprite();
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
  SPR.arch = pair(rockArch(), 46); SPR.arch.span = true; SPR.arch.nocol = true;
  { const f = [0, 1].map(k => pair(spectators(k), 34)); SPR.fans = f[0]; SPR.fans.anim = f; SPR.fans.animMs = 260; }
  SPR.tents = ['#e8413c', '#39a86b', '#3a7bff'].map(c => pair(tent(c), 40));
  SPR.trailer = pair(trailer(), 48);
  SPR.jump = pair(billboard('JUMP', '#ffae2b', '#2a1830'), 55);
  // --- night city ---
  const faces = ['#2a2440', '#1f2a3a', '#33283a', '#232c2c', '#2c2230', '#262a44'];
  SPR.buildings = [];
  for (let i = 0; i < 16; i++) {
    const w = 28 + (i * 7) % 20, h = 60 + (i * 13) % 50;
    SPR.buildings.push(pair(building(w, h, faces[i % faces.length], 100 + i, i % 3 === 0), 75));
  }
  const lamp = streetLamp();
  SPR.lampL = pair(lamp, 50);
  SPR.lampR = pair(flip(lamp), 50);
  SPR.neons = [['DISCO', '#ff3fa4'], ['CAFE', '#3ff0ff'], ['RIDE', '#ffae2b'], ['KICK', '#8aff5a'], ['HOTEL', '#ff3a3a'], ['BAR', '#b46bff'], ['PIZZA', '#ffae2b']].map(([t, c]) => pair(neonSign(t, c), 50));
  SPR.busStop = pair(busStop(), 60);
  SPR.busStopR = pair(flip(busStop()), 60);
  SPR.kiosks = [['KEBAB', '#ffae2b'], ['24/7', '#3ff0ff'], ['NOODLE', '#ff3fa4']].map(([t, c]) => pair(kiosk(t, c), 55));
  // traffic lights blink amber at night; render picks the frame by time
  SPR.tlightL = pair(trafficLight(true), 50); SPR.tlightL.anim = [SPR.tlightL, pair(trafficLight(false), 50)];
  SPR.tlightR = pair(flip(trafficLight(true)), 50); SPR.tlightR.anim = [SPR.tlightR, pair(flip(trafficLight(false)), 50)];
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
