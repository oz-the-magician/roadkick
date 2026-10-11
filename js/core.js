// Roadkick — Constants, math helpers and colour palettes
'use strict';

/* ================= constants ================= */
const W = 480, H = 270;
const STEP = 1 / 60;
const SEG = 200, RUMBLE = 3, ROADW = 2000, LANES = 3, FOV = 100, CAMH = 1150, DRAW = 240, FOGD = 5;
const CAMD = 1 / Math.tan((FOV / 2) * Math.PI / 180);
// camera sits PLAYERZ units behind the bike (pulled back so pursuers are visible before they arrive)
const PLAYERZ = 1600;
const PSCALE = CAMD / PLAYERZ;                          // projection scale at the bike
const PLAYER_Y = Math.round(H / 2 + PSCALE * CAMH * H / 2); // screen y of the bike's wheel
const MAXSPEED = SEG / STEP;
const ACCEL = MAXSPEED / 5, BRAKING = -MAXSPEED, DECEL = -MAXSPEED / 5;
const OFFROAD_DECEL = -MAXSPEED / 2, OFFROAD_LIMIT = MAXSPEED / 4, CENTRIFUGAL = 0.2;
const LAPS = 2, N_RIVALS = 7, N_TRAFFIC = 36;
const RIDER_PPU = 2 / (PSCALE * W / 2); // rider sprites render at exactly 2x at the bike
const KMH = 190;

const canvas = document.getElementById('game');
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
canvas.style.transformOrigin = `50% ${(PLAYER_Y / H * 100).toFixed(1)}%`;   // lean around the bike
document.getElementById('talk').style.transformOrigin = canvas.style.transformOrigin;

/* ================= utils ================= */
const U = {
  clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
  lerp: (a, b, t) => a + (b - a) * t,
  easeIn: (a, b, p) => a + (b - a) * p * p,
  easeInOut: (a, b, p) => a + (b - a) * ((-Math.cos(p * Math.PI) / 2) + 0.5),
  wrap: (v, m) => ((v % m) + m) % m,
  wrapSigned: (d, m) => { d = ((d % m) + m) % m; return d > m / 2 ? d - m : d; },
  overlap: (x1, w1, x2, w2, pct = 1) => { const h = pct / 2; return !((x1 + w1 * h) < (x2 - w2 * h) || (x1 - w1 * h) > (x2 + w2 * h)); },
  accel: (v, a, dt) => v + a * dt,
  toward: (v, target, rate, dt) => v < target ? Math.min(target, v + rate * dt) : Math.max(target, v - rate * dt),
  fog: (d, den) => 1 / Math.pow(Math.E, d * d * den),
};
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const R = rng(20260917);
const rr = (a, b) => a + R() * (b - a);
const pick = arr => arr[Math.floor(R() * arr.length)];

const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const css = c => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
const darken = (h, k) => css(hex(h).map(v => v * k));

/* ================= palettes ================= */
const toRGB = p => { const o = {}; for (const k in p) { o[k] = {}; for (const c in p[k]) o[k][c] = hex(p[k][c]); } return o; };
const LAMP = [255, 196, 120];
let PAL = null;
const COL = {};
function computePalette(nt) { for (const c in PAL.day) COL[c] = mixc(PAL.day[c], PAL.night[c] || PAL.day[c], nt); }
