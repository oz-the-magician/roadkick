// Roadkick — Rival personalities, speech bubbles and Road Rash style weapons
'use strict';

/* ================= rivals ================= */
// one entry per rival sprite (same order as SPR.rivals): name, temperament, starting weapon
const ROSTER = [
  { name: 'Бешеный Макс', type: 'aggro',   weapon: null    },
  { name: 'Лиса',         type: 'leader',  weapon: null    },
  { name: 'Бульдог',      type: 'avenger', weapon: null    },
  { name: 'Шустрик',      type: 'coward',  weapon: null    },
  { name: 'Вдова',        type: 'dirty',   weapon: null    },
  { name: 'Профи',        type: 'leader',  weapon: null    },
  { name: 'Дед',          type: 'rookie',  weapon: null    },
];

// how each temperament races and fights
const TEMPER = {
  aggro:   { pace: 1.00, kick: 0.75, cd: 1.1, seek: true  },
  avenger: { pace: 1.00, kick: 0.30, cd: 1.8, seek: false },
  leader:  { pace: 1.06, kick: 0.15, cd: 2.5, seek: false },
  coward:  { pace: 1.01, kick: 0.00, cd: 9.0, seek: false, flee: true },
  dirty:   { pace: 1.00, kick: 0.55, cd: 1.4, seek: false, backstab: true },
  rookie:  { pace: 0.95, kick: 0.25, cd: 2.0, seek: false, wobbly: true },
};

const LINES = {
  start: {
    aggro: ['Сейчас полетишь!', 'Это моя дорога!'], leader: ['Удачи, новичок.', 'Не отставай.'],
    avenger: ['Только тронь меня.'], coward: ['Я просто прокатиться…'], dirty: ['Оглядывайся почаще.'], rookie: ['Где тут газ?'],
  },
  passed: {
    aggro: ['Ещё увидимся!', 'Ты труп!'], leader: ['Неплохо.', 'Посмотрим на финише.'],
    avenger: ['Догоню!'], coward: ['Проезжай, проезжай…'], dirty: ['Ну-ну.'], rookie: ['Эй, подожди!'],
  },
  kicked: {
    aggro: ['Ах ты!', 'Ну всё!'], leader: ['Грязно играешь.'], avenger: ['Ну всё, держись!', 'Ты это зря.'],
    coward: ['За что?!', 'Мама!'], dirty: ['Запомнила тебя.'], rookie: ['Ой-ой-ой!'],
  },
  hit: {
    aggro: ['Получай!', 'Сиди дома!'], leader: ['Прости, бизнес.'], avenger: ['Это тебе за пинок!'],
    coward: ['Ой, случайно.'], dirty: ['Сюрприз!'], rookie: ['Я не хотел!'],
  },
  robbed: { chain: ['Отдай цепь!', 'Это моя цепь!'], club: ['Верни дубинку!', 'Эй, дубинка моя!'] },
};
const WEAPONS = {
  chain: { name: 'цепь', reach: 0.68, uses: 6, knock: 3.4, slow: 0.58 },
  club:  { name: 'дубинка', reach: 0.6, uses: 8, knock: 3.0, slow: 0.62 },
};
let talkCd = 0;

function setupRivals() {
  talkCd = 0;
  for (const el of bubbleEls.values()) el.remove();
  bubbleEls.clear();
  rivals.forEach((e, i) => {
    const r = ROSTER[i % ROSTER.length];
    e.name = r.name; e.type = r.type; e.weapon = r.weapon; e.t = TEMPER[r.type];
    e.base *= e.t.pace;
    e.angry = 0; e.bubble = null; e.passedOnce = false;
  });
  // one or two riders mouth off before the start
  const loud = rivals.filter(e => e.type !== 'coward').sort(() => Math.random() - 0.5).slice(0, 2);
  loud.forEach((e, k) => setTimeout(() => talk(e, 'start', true), 600 + k * 1100));
}

function talk(e, kind, force) {
  if (!e || (e.state === 'down' && kind !== 'kicked' && kind !== 'robbed')) return;
  if (!force && talkCd > 0) return;
  const pool = kind === 'robbed' ? LINES.robbed[e.robbedOf] : LINES[kind][e.type];
  if (!pool || !pool.length) return;
  e.bubble = { text: pool[Math.floor(Math.random() * pool.length)], t: 2.2 };
  talkCd = 1.2;
}

// called every step from updateRider while the rival is riding
function rivalBrain(e, dt, b) {
  if (e.bubble) { e.bubble.t -= dt; if (e.bubble.t <= 0) e.bubble = null; }
  if (e.angry > 0) e.angry -= dt;
  const gap = e.dist - b, dx = e.offset - player.x;
  const near = Math.abs(gap) < SEG * 8;
  // lateral intent: aggressors and angry avengers hunt the bike, cowards drift away from it
  if (state === 'race' && near && player.mode === 'ride') {
    if (e.t.seek || e.angry > 0) e.lane = U.clamp(player.x + Math.sign(dx || 1) * 0.18, -0.85, 0.85);
    else if (e.t.flee && Math.abs(dx) < 0.6) e.lane = U.clamp(e.offset + Math.sign(dx || 1) * 0.6, -0.85, 0.85);
  }
  if (e.t.wobbly && R() < dt * 0.6) e.lane = rr(-0.75, 0.75);
  // overtaken by the player
  const ahead = gap > 0;
  if (e.wasAhead && !ahead && state === 'race' && R() < 0.5) talk(e, 'passed');
  e.wasAhead = ahead;
}
// pace multiplier on top of the normal rubber-banding
const rivalPace = e => (e.angry > 0 ? 1.07 : 1);

// decides whether this rival lands a hit on the player now; returns true if it attacked
function rivalAttack(e, dz, dx) {
  let p = e.t.kick;
  if (e.angry > 0) p = Math.max(p, 0.85);
  if (e.t.backstab && dz > 0) p *= 0.4;          // the dirty one only strikes when you're past her
  if (R() >= p) return false;
  const w = e.weapon ? WEAPONS[e.weapon] : null;
  if (Math.abs(dx) > (w ? w.reach : 0.45)) return false;
  const s = Math.sign(player.x - e.offset) || 1;
  e.kickT = 0.3; e.kickSide = s;
  if (w) {
    player.speed *= w.slow; player.x += s * 0.32; player.wobble = 0.9; shake = 0.22;
    SND.clang(e.weapon); say(e.weapon === 'chain' ? 'Цепью!' : 'Дубинкой!', 0.7, 'bad');
  } else {
    player.speed *= 0.72; player.x += s * 0.25; player.wobble = 0.6; shake = 0.15;
    SND.kick(); say('Ай!', 0.6, 'bad');
  }
  talk(e, 'hit');
  return true;
}

// player's strike landed on a rival (kick or weapon)
function onRivalHit(target, withWeapon) {
  if (target.kind !== 'rival') return;
  if (target.type === 'avenger' || target.type === 'aggro') target.angry = 25;
  // knocking a rider off their bike makes them drop their weapon — grab it if your hands are free
  if (target.weapon) {
    const w = target.weapon;
    target.weapon = null; target.robbedOf = w;
    if (!player.weapon) {
      player.weapon = { type: w, uses: WEAPONS[w].uses };
      say(w === 'chain' ? 'Цепь твоя!' : 'Дубинка твоя!', 1, 'cool');
      addCombo('Трофей', 300);
      talk(target, 'robbed', true);
      return;
    }
  }
  talk(target, 'kicked', true);
}

function useWeaponCharge() {
  if (!player.weapon) return;
  if (--player.weapon.uses <= 0) {
    say(player.weapon.type === 'chain' ? 'Цепь порвалась' : 'Дубинка сломалась', 0.9, 'bad');
    player.weapon = null;
  }
}

/* ---------- drawing ---------- */
// weapon in the hand: px is the size of one sprite pixel on screen
function drawWeapon(type, cx, handY, px, side, swinging) {
  const sq = (x, y, c, s = px) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(s)), Math.max(1, Math.round(s))); };
  const hx = cx + side * 9 * px;
  if (type === 'club') {
    const n = 9;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const x = swinging ? hx + side * (2 + t * 11) * px : hx + side * (1 + t * 3) * px;
      const y = swinging ? handY - t * 2 * px : handY - (2 + t * 9) * px;
      sq(x - px * 0.6, y - px * 0.6, '#1a0f0a', px * 2.2);
      sq(x - px * 0.2, y - px * 0.2, i > n - 4 ? '#8a5530' : '#a8703c', px * 1.4);
    }
  } else {
    const n = 8;
    for (let i = 0; i < n; i++) {
      const t = (i + 1) / n;
      const x = swinging ? hx + side * t * 13 * px : hx + side * Math.sin(t * 1.2) * 2 * px;
      const y = swinging ? handY - Math.sin(t * Math.PI) * 3 * px : handY + t * 8 * px;
      sq(x - px * 0.7, y - px * 0.7, '#14141a', px * 1.9);
      sq(x - px * 0.3, y - px * 0.3, i % 2 ? '#c8ccd4' : '#8e94a0', px * 1.1);
    }
  }
}

// bubbles collected during the frame, then laid out as DOM elements in canvas coordinates
const bubblesFrame = [];
const talkLayer = document.getElementById('talk');
const bubbleEls = new Map();
function syncBubbles() {
  const seen = new Set();
  for (const b of bubblesFrame) {
    let el = bubbleEls.get(b.e);
    if (!el) {
      el = document.createElement('div'); el.className = 'bubble';
      talkLayer.append(el); bubbleEls.set(b.e, el);
    }
    const html = `<b>${T(b.e.name)}:</b> ${T(b.e.bubble.text)}`;
    if (el.innerHTML !== html) el.innerHTML = html;
    el.style.left = `${U.clamp(b.x / W * 100, 14, 86).toFixed(2)}%`;   // keep the bubble on screen near the kerbs
    el.style.top = `${U.clamp(b.y / H * 100, 12, 95).toFixed(2)}%`;
    el.hidden = false;
    seen.add(b.e);
  }
  for (const [e, el] of bubbleEls) if (!seen.has(e)) el.hidden = true;
}

// overlay for a rival drawn by drawEntity: weapon, name tag and speech
function drawRivalExtras(e, spr, scale, x, ly, alpha) {
  if (e.state === 'down' || alpha < 0.5) return;
  const px = spr.ppu * scale * W / 2;
  if (px < 0.7) return;
  const top = ly - spr.d.height * px;   // every rider frame is anchored so the body centre sits on x
  if (e.weapon) {
    const side = e.kickT > 0 ? e.kickSide : (e.offset < player.x ? 1 : -1);
    drawWeapon(e.weapon, x, top + 12 * px, px, side, e.kickT > 0);
  }
  if (e.bubble && px > 1.1) bubblesFrame.push({ e, x, y: top });
}
