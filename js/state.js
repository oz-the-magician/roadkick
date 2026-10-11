// Roadkick — Race state, reset and HUD
'use strict';

/* ================= game state ================= */
const player = { dist: 0, x: 0, speed: 0, mode: 'ride', crashT: 0, kickT: 0, kickSide: -1, kickCd: 0, lean: 0, wobble: 0, finishRank: 0,
  drone: 'none', droneT: 0, shotCd: 0, sunkT: 0, sunkSide: 1,
  nitro: 'none', nitroT: 0, trickRot: 0, trickActive: false };
const DRONE_TIME = 15, DRONE_RESPAWN = 25, N_PICKUPS = 8;
const NITRO_TIME = 5, NITRO_RESPAWN = 22, NITRO_MULT = 1.35, TRICK_RATE = 7.5, TAU = Math.PI * 2;
let pickups = [], shots = [], fx = [];
let weather = null, brakeCd = 0, weatherT = 0, weatherAge = 0, weatherLvl = 0, weatherNext = 0;
let copHit = false;
// game feel: slow motion, camera roll/zoom, combo scoring
let timeScale = 1, slowT = 0, camRoll = 0, camZoom = 1, nitroFx = 0;
// all visual randomness is rolled once per physics step, so a 120/144 Hz screen doesn't redraw new noise every frame
const jit = { sx: 0, sy: 0, bounce: 0, seed: 1, n: 0 };
function rollJitter() {
  jit.n++;
  jit.sx = Math.round((Math.random() - 0.5) * 8 * shake / 0.5);
  jit.sy = Math.round((Math.random() - 0.5) * 6 * shake / 0.5);
  if (jit.n % 4 === 0) jit.seed = (Math.random() * 1e9) | 0;   // speed lines / flame flicker at ~15 Hz
  const pct = player.speed / MAXSPEED, rough = Math.abs(player.x) > 1 ? 2 : (LEVEL.cobble ? 2.2 : 0.6);
  if (jit.n % 3 === 0) jit.bounce = player.mode === 'ride' ? Math.round(Math.random() * pct * rough) : 0;
}
let score = 0, comboPts = 0, comboN = 0, comboT = 0, comboLabel = '', lastPops = [];
const COMBO_WINDOW = 3;
let droneQueued = false, nitroQueued = false;
let traffic = [], rivals = [], cops = [];
let state = 'menu', raceTime = 0, countdown = 0, heat = 0, copCooldown = 0, bustT = 0;
const SPEED_LIMIT = 130 / KMH;
const BUST_TIME = 3.2, CALM_TIME = 20;          // fraction of top speed
const HEAT_RATE = 14, HEAT_DECAY = 10;  // units per second, 100 units = one bar
// dispatch slots: which unit joins the chase at which violation level
const SLOTS = [{ type: 'car', lvl: 1 }, { type: 'moto', lvl: 2 }, { type: 'moto', lvl: 3 }];
const LVL_TEXT = ['', 'На радаре', 'Хвост растёт', 'Ты — главная цель'];
const CHASE_TEXT = ['', 'Мигалка на хвосте', 'Берут в клещи', 'Весь участок за тобой'];
let slotState = SLOTS.map(() => ({ unit: null, cd: 0 }));
let chaseLost = false, calmT = 0;   // calmT: seconds of chase without any contact
let nt = 0, nightTarget = 0;
let shake = 0, lastLap = 1;
const keys = { left: false, right: false, up: false, down: false, kick: false };
let kickQueued = false;

const bikeZ = () => player.dist + PLAYERZ;
const FINISH = () => PLAYERZ + LAPS * trackLength;
const PW = 20 * RIDER_PPU / ROADW;

function resetRace() {
  score = 0; comboPts = 0; comboN = 0; comboT = 0; comboLabel = ''; timeScale = 1; slowT = 0; camRoll = 0; camZoom = 1; nitroFx = 0;
  overSide = new Map();
  player.dist = 0; player.x = 0; player.speed = 0; player.mode = 'ride'; player.crashT = 0;
  player.kickT = 0; player.kickCd = 0; player.lean = 0; player.wobble = 0; player.finishRank = 0;
  raceTime = 0; heat = 0; copCooldown = 0; bustT = 0; cops = []; lastLap = 1;
  slotState = SLOTS.map(() => ({ unit: null, cd: 0 })); chaseLost = false; calmT = 0;
  player.drone = 'none'; player.droneT = 0; player.shotCd = 0; droneQueued = false; player.sunkT = 0;
  player.nitro = 'none'; player.nitroT = 0; nitroQueued = false; player.trickRot = 0; player.trickActive = false;
  weather = null; weatherT = 0; weatherAge = 0; weatherLvl = 0; weatherNext = 8 + Math.random() * 16;
  player.airborne = false; player.y = 0; player.vy = 0; player.air = 0; player.agF = 0; player.slopePrev = 0; player.airT = 0; player.gvyS = 0; player.landCd = 0; player.trickRot = 0; player.trickActive = false;
  shots = []; fx = [];
  pickups = [];
  for (let i = 0; i < N_PICKUPS; i++) {
    let seg = Math.floor(((i + 0.55) / N_PICKUPS) * segments.length);
    while (segments[seg % segments.length].gap || segments[seg % segments.length].ramp || segments[seg % segments.length].kicker || segments[seg % segments.length].kickLane) seg++;
    pickups.push({ kind: 'pickup', type: i % 2 ? 'nitro' : 'drone', z: seg * SEG + SEG / 2, offset: pick([-0.6, 0, 0.6]), active: true, respawn: 0 });
  }
  traffic = [];
  const nTraffic = LEVEL.traffic;
  for (let i = 0; i < nTraffic; i++) {
    const tram = LEVEL.tramShare && R() < LEVEL.tramShare;
    const truck = !tram && R() < LEVEL.truckShare;
    const spr = tram ? SPR.tram : truck ? pick(LEVEL.trucks()) : pick(LEVEL.cars());
    const lanes = LEVEL.sideLanes ? [-0.66, 0.66] : [-0.66, 0, 0.66];
    traffic.push({
      kind: 'traffic', spr,
      z: U.wrap(PLAYERZ + 3000 + (i / nTraffic) * (trackLength - 4000) + rr(-400, 400), trackLength),
      offset: tram ? 0 : pick(lanes) + rr(-0.08, 0.08),
      speed: MAXSPEED * (tram ? rr(0.22, 0.3) : truck ? rr(0.2, 0.32) : rr(0.28, 0.48)),
      w: spr.d.width * spr.ppu / ROADW,
    });
  }
  rivals = SPR.rivals.map((set, i) => ({
    kind: 'rival', set, state: 'ride', downT: 0, kickT: 0, kickSide: 1, kickCd: 1.5,
    dist: PLAYERZ + SEG * (3 + i * 3), offset: [-0.5, 0.5][i % 2] + rr(-0.1, 0.1),
    lane: rr(-0.7, 0.7), speed: 0, base: MAXSPEED * (0.8 + i * 0.018 + rr(0, 0.03)),
    finished: false, finishT: 0, z: 0, w: 20 * RIDER_PPU / ROADW,
  }));
  for (const r of rivals) r.z = U.wrap(r.dist, trackLength);
  setupRivals();
  player.weapon = null;
}

/* ================= messages & HUD ================= */
const $ = id => document.getElementById(id);
let msgTimer = 0;
function say(text, dur = 1, cls = '') {
  const m = $('msg'); m.textContent = text; m.className = 't on ' + cls; msgTimer = dur;
}
function fmtTime(t) {
  const m = Math.floor(t / 60), s = t - m * 60;
  return `${m}:${s < 10 ? '0' : ''}${s.toFixed(1)}`;
}
function rank() {
  const b = bikeZ();
  let r = 1;
  for (const e of rivals) if (e.dist > b) r++;
  return r;
}
let hudTick = 0;
function updateHud() {
  // combo readout updates every frame so the timer bar is smooth
  const cb = $('combo');
  const live = comboT > 0 && comboPts > 0;
  cb.classList.toggle('on', live);
  if (live) {
    $('comboMul').textContent = `x${comboMul()}`;
    $('comboTxt').textContent = `${comboLabel} · +${Math.round(comboPts)}`;
    $('comboBar').style.width = `${Math.round(comboT / COMBO_WINDOW * 100)}%`;
  }
  if (++hudTick % 4) return;
  $('scorev').textContent = score.toLocaleString('ru-RU');
  const lap = Math.min(LAPS, Math.floor(player.dist / trackLength) + 1);
  $('posv').textContent = `${player.finishRank || rank()}/${N_RIVALS + 1}`;
  $('lapv').textContent = `${lap}/${LAPS}`;
  $('timev').textContent = fmtTime(raceTime);
  $('spdv').textContent = Math.round(player.speed / MAXSPEED * KMH);
  const over = player.speed / MAXSPEED > SPEED_LIMIT;
  $('spd').classList.toggle('over', over);
  const bars = document.querySelectorAll('#heat i');
  bars.forEach((el, i) => {
    const fill = U.clamp(heat - i * 100, 0, 100);
    el.firstChild.style.width = `${Math.round(fill)}%`;
    el.classList.toggle('full', fill >= 100);
  });
  $('lvlv').textContent = LVL_TEXT[heatLevel()];
  const cop = $('cop');
  const active = cops.filter(c => c.state === 'ride');
  if (active.length) {
    const b = bikeZ();
    const nearest = Math.min(...active.map(c => Math.abs(c.dist - b)));
    cop.hidden = false;
    cop.textContent = nearest < SEG * 2 ? 'Дышат в спину!'
      : CHASE_TEXT[Math.min(3, active.length)];
  } else cop.hidden = true;
}
