// Roadkick — Main loop, input, menus and boot
'use strict';

/* ================= loop ================= */
let last = performance.now(), acc = 0, paused = false;
const pctx = $('preview').getContext('2d');
pctx.imageSmoothingEnabled = false;
function frame(now) {
  const elapsed = Math.min(0.25, (now - last) / 1000);
  last = now;
  if (!paused) {
    updateFeel(elapsed, state === 'race');
    acc += elapsed * timeScale;
    let steps = 0;
    while (acc >= STEP && steps < 6) { update(STEP); rollJitter(); acc -= STEP; steps++; }
    if (steps === 6) acc = 0;
  }
  render();
  if (state === 'menu') pctx.drawImage(canvas, 0, 0);
  syncPad(elapsed);
  if (state !== 'menu') updateHud();
  requestAnimationFrame(frame);
}

/* ================= input & ui ================= */
const KEYMAP = { ArrowLeft:'left', KeyA:'left', ArrowRight:'right', KeyD:'right', ArrowUp:'up', KeyW:'up', ArrowDown:'down', KeyS:'down' };
addEventListener('keydown', e => {
  const k = KEYMAP[e.code];
  if (k) { keys[k] = true; e.preventDefault(); }
  if (e.code === 'Space') { if (!e.repeat) { kickQueued = true; pressed.kick = 0.18; } e.preventDefault(); }
  if (e.repeat) return;
  if (e.code === 'KeyN') { toggleNight(); pressed.night = 0.18; }
  if (e.code === 'KeyF') { if (player.drone !== 'none' && state === 'race') { droneQueued = true; pressed.drone = 0.18; } }
  if (e.code === 'KeyC') { if (player.nitro !== 'none' && state === 'race') { nitroQueued = true; pressed.nitro = 0.18; } }
  if (e.code === 'KeyM') toggleSound();
  if (e.code === 'KeyB') { SND.init(); toggleMusic(); }
  if (e.code === 'KeyP' || e.code === 'Escape') togglePause();
  if (state === 'menu' && (e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'KeyW' || e.code === 'KeyS')) {
    const up = e.code === 'ArrowUp' || e.code === 'KeyW';
    selectLevel((levelIndex + (up ? -1 : 1) + LEVELS.length) % LEVELS.length, true);
  }
  if (e.code === 'Enter') {
    if (state === 'menu') startRace();
    else if (!$('result').hidden) startRace();
  }
});
addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (k) keys[k] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
document.addEventListener('visibilitychange', () => { if (document.hidden && (state === 'race' || state === 'countdown') && !paused) togglePause(); });

const pressed = { kick: 0, night: 0, drone: 0, nitro: 0 };
function bindKey(id, key) {
  const el = $(id);
  const on = e => {
    e.preventDefault();
    el.setPointerCapture?.(e.pointerId);
    SND.init();
    if (key === 'kick') { kickQueued = true; pressed.kick = 0.18; }
    else if (key === 'night') { toggleNight(); pressed.night = 0.18; }
    else if (key === 'drone') { if (player.drone !== 'none' && state === 'race') { droneQueued = true; pressed.drone = 0.18; } }
    else if (key === 'nitro') { if (player.nitro !== 'none' && state === 'race') { nitroQueued = true; pressed.nitro = 0.18; } }
    else keys[key] = true;
  };
  const off = () => { if (key in keys) keys[key] = false; };
  el.addEventListener('pointerdown', on);
  el.addEventListener('pointerup', off);
  el.addEventListener('pointercancel', off);
  el.addEventListener('lostpointercapture', off);
  el.addEventListener('contextmenu', e => e.preventDefault());
}
[['kLeft', 'left'], ['kRight', 'right'], ['kUp', 'up'], ['kDown', 'down'], ['kKick', 'kick'], ['kNight', 'night'], ['kDrone', 'drone'], ['kNitro', 'nitro']].forEach(a => bindKey(...a));
const PADKEYS = [['kLeft', () => keys.left], ['kRight', () => keys.right], ['kUp', () => keys.up], ['kDown', () => keys.down],
  ['kKick', () => pressed.kick > 0], ['kNight', () => pressed.night > 0], ['kDrone', () => pressed.drone > 0], ['kNitro', () => pressed.nitro > 0]].map(([id, f]) => ({ el: $(id), f, on: false }));
function syncPad(dt) {
  pressed.kick = Math.max(0, pressed.kick - dt);
  pressed.night = Math.max(0, pressed.night - dt);
  pressed.drone = Math.max(0, pressed.drone - dt);
  pressed.nitro = Math.max(0, pressed.nitro - dt);
  const setKey = (id, capId, st) => {
    const [mode, cap] = st();
    const el = $(id);
    if (el.dataset.mode !== mode) { el.dataset.mode = mode; el.classList.remove('off', 'ready', 'live', 'boost'); el.classList.add(mode); el.setAttribute('aria-disabled', String(mode === 'off')); }
    const c = $(capId), tc = T(cap); if (c.textContent !== tc) c.textContent = tc;
  };
  setKey('kDrone', 'kDroneCap', droneKeyState);
  setKey('kNitro', 'kNitroCap', nitroKeyState);
  const kc = player.weapon && state === 'race' ? `${WEAPONS[player.weapon.type].name} ×${player.weapon.uses}` : T('пинок');
  const kce = $('kKickCap'); if (kce.textContent !== kc) kce.textContent = kc;
  for (const k of PADKEYS) {
    const v = !!k.f();
    if (v !== k.on) { k.on = v; k.el.classList.toggle('on', v); }
  }
}
const isTouch = matchMedia('(pointer:coarse)').matches;
if (isTouch) {
  // on phones: left thumb steers, right thumb handles gas, brake and kick
  $('stage').classList.add('touch');
  $('padR').append($('kDown'), $('kUp'));
}

function toggleNight() {
  if (LEVEL.night) return;
  nightTarget = nightTarget ? 0 : 1;
  $('kNightCap').textContent = T(nightTarget ? 'день' : 'ночь');
}
function toggleMusic() {
  MUSIC.setOn(!MUSIC.on);
  $('bMusic').setAttribute('aria-pressed', String(MUSIC.on));
}
function toggleSound() {
  SND.setOn(!SND.on);
  $('bSound').setAttribute('aria-pressed', String(SND.on));
}
function togglePause() {
  if (state !== 'race' && state !== 'countdown') return;
  paused = !paused;
  $('paused').hidden = !paused;
  if (paused) { SND.engine(0, false, false); SND.siren(0, 0); $('bResume').focus(); }
}
const WEATHER = {
  rain: { kind: 'rain', name: 'Дождь', overlay: 'rgba(26,36,66,0.26)', vis: 1, grip: 0.72 },
  fog:  { kind: 'fog',  name: 'Туман', overlay: 'rgba(200,206,216,0.30)', vis: 0.32, grip: 0.86 },
  sand: { kind: 'sand', name: 'Песчаная буря', overlay: 'rgba(206,132,52,0.34)', vis: 0.32, grip: 0.76 },
};
const WEATHER_DUR = 25;   // an event lasts 25s including a short fade in and out
function updateWeather(dt) {
  const opts = LEVEL.weather;
  if (weather) {
    weatherAge += dt; weatherT -= dt;
    weatherLvl = Math.min(U.clamp(weatherAge / 2.5, 0, 1), U.clamp(weatherT / 2.5, 0, 1));
    if (weatherT <= 0) { weather = null; weatherLvl = 0; weatherNext = 20 + Math.random() * 22; }
  } else if (opts) {
    weatherNext -= dt;
    if (weatherNext <= 0) {
      weather = WEATHER[opts[Math.floor(Math.random() * opts.length)]];
      weatherT = WEATHER_DUR; weatherAge = 0; weatherLvl = 0;
      say(weather.name, 1.6, 'bad');
    }
  }
}
function startRace() {
  SND.init();
  resetRace();
  MUSIC.chase = 0; MUSIC.play(LEVEL.id);
  $('menu').hidden = true; $('result').hidden = true; $('paused').hidden = true;
  $('hud').hidden = false; $('pad').hidden = false;
  paused = false;
  state = 'countdown'; countdown = 3.2;
  canvas.focus?.();
}
$('bStart').addEventListener('click', startRace);
$('bAgain').addEventListener('click', startRace);
$('bResume').addEventListener('click', togglePause);
$('bSound').addEventListener('click', e => { SND.init(); toggleSound(); e.currentTarget.blur(); });
$('bMusic').addEventListener('click', e => { SND.init(); toggleMusic(); e.currentTarget.blur(); });
$('bMusic').setAttribute('aria-pressed', String(MUSIC.on));
$('bPause').addEventListener('click', e => { togglePause(); e.currentTarget.blur(); });

function getBest(lv) {
  let best = null;
  try { best = parseFloat(localStorage.getItem(lv.bestKey)); } catch (e) {}
  return best > 0 ? best : null;
}
function renderLevelList() {
  const ol = $('levels');
  ol.innerHTML = '';
  LEVELS.forEach((lv, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.className = 'lvl-btn'; b.id = 'lvl-' + lv.id;
    b.setAttribute('role', 'option');
    b.setAttribute('aria-selected', String(i === levelIndex));
    const best = getBest(lv);
    b.innerHTML = `<span class="num">${i + 1}</span><span>${T(lv.name)}<small>${T(lv.blurb)}${best ? L(', рекорд ', ', record ', ', rekord ') + fmtTime(best) : ''}</small></span>`;
    b.addEventListener('click', () => selectLevel(i, false));
    b.addEventListener('dblclick', () => startRace());
    li.append(b); ol.append(li);
  });
}
function selectLevel(i, focus) {
  if (i !== levelIndex) loadLevel(i);
  document.querySelectorAll('.lvl-btn').forEach((b, k) => b.setAttribute('aria-selected', String(k === i)));
  $('lvlName').textContent = T(LEVEL.name);
  $('lvlDesc').textContent = T(LEVEL.desc);
  const best = getBest(LEVEL);
  $('bestv').textContent = best ? `${L('Рекорд', 'Record', 'Rekord')}: ${fmtTime(best)}` : T('Рекорда пока нет');
  if (focus) $('lvl-' + LEVEL.id).focus();
}
function showMenu() {
  state = 'menu'; paused = false;
  resetRace();
  $('result').hidden = true; $('paused').hidden = true;
  $('hud').hidden = true; $('pad').hidden = true; $('cop').hidden = true;
  $('msg').className = 't';
  SND.engine(0, false, false); SND.siren(0, 0);
  MUSIC.chase = 0; MUSIC.play('menu');
  $('menu').hidden = false;
  renderLevelList();
  selectLevel(levelIndex, true);
}
$('bMenu').addEventListener('click', showMenu);

/* ================= boot ================= */
buildSprites();
loadLevel(0);
function onLangChange() {
  if (state === 'menu') { renderLevelList(); selectLevel(levelIndex, false); }
  $('kNightCap').textContent = T(LEVEL.night ? 'всегда' : nightTarget ? 'день' : 'ночь');
}
showMenu();
requestAnimationFrame(frame);

window.__roadkick = { update, render, startRace, state: () => state, player, get rivals() { return rivals; }, keys, get cops() { return cops; }, kickers: () => segments.filter((s, i) => s.kicker && !segments[i - 1].kicker).map(s => [s.index, s.kicker.a, s.kicker.b]), get pickups() { return pickups; }, get shots() { return shots; }, useNitro, useDrone, get weather() { return weather; }, get weatherLvl() { return weatherLvl; }, setWeather: k => weather = k ? WEATHER[k] : null, triggerWeather: () => { weatherNext = 0; }, setHeat: v => heat = v };
