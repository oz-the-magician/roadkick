// Roadkick — Road geometry, scenery placement and the five track definitions
'use strict';

/* ================= track ================= */
let segments = [], trackLength = 0, startIndex = 0;
const lastY = () => segments.length ? segments[segments.length - 1].p2.world.y : 0;
function addSegment(curve, y) {
  const n = segments.length;
  segments.push({
    index: n, curve, sprites: [], clip: 0, fog: 1, looped: false,
    light: Math.floor(n / RUMBLE) % 2 === 1, start: false, lamp: 0,
    p1: { world: { x: 0, y: lastY(), z: n * SEG }, camera: {}, screen: {} },
    p2: { world: { x: 0, y, z: (n + 1) * SEG }, camera: {}, screen: {} },
  });
}
function addRoad(enter, hold, leave, curve, y) {
  const sy = lastY(), ey = sy + Math.round(y) * SEG, total = enter + hold + leave;
  for (let n = 0; n < enter; n++) addSegment(U.easeIn(0, curve, n / enter), U.easeInOut(sy, ey, n / total));
  for (let n = 0; n < hold; n++) addSegment(curve, U.easeInOut(sy, ey, (enter + n) / total));
  for (let n = 0; n < leave; n++) addSegment(U.easeInOut(curve, 0, n / leave), U.easeInOut(sy, ey, (enter + hold + n) / total));
}
const LEN = { S: 25, M: 50, L: 100 }, CRV = { E: 2, M: 4, H: 6 }, HILL = { L: 20, M: 40, H: 60 };
function mountainGeometry() {
  addRoad(LEN.M, LEN.M, LEN.M, 0, 0);
  addRoad(LEN.M, LEN.M, LEN.M, CRV.M, HILL.L);
  addRoad(LEN.S, LEN.S, LEN.S, 0, 0);
  addRoad(LEN.M, LEN.M, LEN.M, 0, HILL.M);
  addRoad(LEN.M, LEN.M, LEN.M, -CRV.E, 0);
  addRoad(LEN.M, LEN.M, LEN.M, CRV.M, HILL.M);
  addRoad(LEN.M, LEN.M, LEN.M, CRV.E, -HILL.L);
  addRoad(LEN.M, LEN.M, LEN.M, -CRV.E, HILL.M);
  addRoad(LEN.M, LEN.M, LEN.M, -CRV.M, -HILL.M);
  for (const b of [5, -2, -5, 8, 5, -7, 5, -2]) addRoad(10, 10, 10, 0, b);
  addRoad(LEN.L, LEN.M, LEN.M, -CRV.H, HILL.L);
  addRoad(LEN.S, LEN.S, LEN.S, 0, -HILL.M);
  addRoad(LEN.M, LEN.L, LEN.M, CRV.H, 0);
  addRoad(LEN.M, LEN.M, LEN.M, 0, HILL.H);
  addRoad(LEN.M, LEN.M, LEN.M, -CRV.M, -HILL.L);
  addRoad(LEN.M, LEN.M, LEN.M, CRV.M, HILL.M);
  addRoad(LEN.L, LEN.L, LEN.L, 0, 0);
  addRoad(LEN.M, LEN.M, LEN.M, CRV.E, -HILL.M);
  addRoad(LEN.M, LEN.S, LEN.M, -CRV.H, 0);
  addRoad(LEN.M, LEN.M, LEN.M, CRV.M, HILL.L);
  addRoad(200, 200, 200, -CRV.E, -lastY() / SEG);
}
function mountainScenery(addSprite) {
  for (let i = 30; i < segments.length - 10; i++) {
    const seg = segments[i];
    const coastal = Math.floor(i / 450) % 2 === 1;
    if (Math.abs(seg.curve) >= 3 && i % 10 === 0) {
      addSprite(i, seg.curve > 0 ? SPR.chevR : SPR.chevL, seg.curve > 0 ? -1.15 : 1.15);
      continue;
    }
    if (i % 170 === 0) { addSprite(i, pick(SPR.boards), (R() < 0.5 ? -1 : 1) * 1.25); continue; }
    if (R() < 0.3) {
      const side = R() < 0.5 ? -1 : 1;
      const tree = coastal ? (R() < 0.75 ? SPR.palm : SPR.bush) : (R() < 0.8 ? SPR.pine : SPR.rock);
      addSprite(i, tree, side * rr(1.25, 3.2));
    }
    if (R() < 0.12) addSprite(i, R() < 0.5 ? SPR.bush : SPR.rock, (R() < 0.5 ? -1 : 1) * rr(1.1, 1.5));
  }
}
function cityGeometry() {
  addRoad(LEN.M, LEN.M, LEN.M, 0, 0);
  addRoad(LEN.S, LEN.S, LEN.S, CRV.H, 0);
  addRoad(LEN.L, LEN.M, LEN.S, 0, 0);
  addRoad(LEN.M, LEN.M, LEN.M, 0, HILL.L);
  addRoad(LEN.M, LEN.S, LEN.M, 0, -HILL.L);
  addRoad(LEN.S, LEN.S, LEN.S, -CRV.H, 0);
  addRoad(LEN.M, LEN.L, LEN.M, 0, 0);
  addRoad(LEN.S, LEN.S, LEN.S, -CRV.H, 0);
  addRoad(LEN.L, LEN.S, LEN.S, 0, HILL.M);
  addRoad(LEN.S, LEN.S, LEN.S, CRV.M, 0);
  addRoad(LEN.M, LEN.M, LEN.M, 0, -HILL.M);
  for (const b of [3, -3, 3, -3]) addRoad(10, 10, 10, 0, b);
  addRoad(LEN.S, LEN.S, LEN.S, CRV.H, 0);
  addRoad(LEN.L, LEN.L, LEN.M, 0, 0);
  addRoad(LEN.M, LEN.M, LEN.M, -CRV.E, HILL.L);
  addRoad(LEN.S, LEN.S, LEN.S, CRV.H, 0);
  addRoad(LEN.M, LEN.L, LEN.M, 0, 0);
  addRoad(LEN.S, LEN.S, LEN.S, -CRV.H, -HILL.L);
  addRoad(LEN.L, LEN.L, LEN.L, 0, -lastY() / SEG);
}
function cityScenery(addSprite) {
  let nextL = 4, nextR = 8;
  const light = (i, side) => {
    for (let d = -2; d <= 3; d++) {
      const sg = segments[i + d]; if (!sg) continue;
      sg.lamp = Math.max(sg.lamp || 0, Math.pow(1 - Math.abs(d - 0.5) / 3, 1.5));
    }
  };
  for (let i = 4; i < segments.length - 6; i++) {
    const seg = segments[i];
    if (i >= nextL) { addSprite(i, pick(SPR.buildings), -rr(1.5, 1.75)); nextL = i + 6 + Math.floor(R() * 4); }
    if (i >= nextR) { addSprite(i, pick(SPR.buildings), rr(1.5, 1.75)); nextR = i + 6 + Math.floor(R() * 4); }
    if (i % 18 === 0) { addSprite(i, SPR.lampL, -1.1); light(i); }
    if (i % 18 === 9) { addSprite(i, SPR.lampR, 1.1); light(i); }
    if (i % 120 === 60) { addSprite(i, pick(SPR.neons), (R() < 0.5 ? -1 : 1) * 1.28); continue; }
    if (Math.abs(seg.curve) >= 3 && i % 10 === 5) {
      addSprite(i, seg.curve > 0 ? SPR.chevR : SPR.chevL, seg.curve > 0 ? -1.2 : 1.2);
      continue;
    }
    if (R() < 0.035) addSprite(i, R() < 0.6 ? SPR.cone : SPR.bin, (R() < 0.5 ? -1 : 1) * rr(1.06, 1.3));
  }
}
function desertGeometry() {
  addRoad(LEN.L, LEN.L, LEN.L, 0, 0);
  addRoad(LEN.L, LEN.M, LEN.L, CRV.E, HILL.M);
  addRoad(LEN.M, LEN.L, LEN.M, 0, -HILL.L);
  addRoad(LEN.L, LEN.M, LEN.L, -CRV.M, 0);
  for (const h of [HILL.M, -HILL.M, HILL.H, -HILL.H]) addRoad(LEN.M, LEN.S, LEN.M, 0, h);
  addRoad(LEN.L, LEN.L, LEN.L, 0, 0);
  addRoad(LEN.M, LEN.M, LEN.M, CRV.H, HILL.L);
  addRoad(LEN.M, LEN.M, LEN.M, -CRV.H, -HILL.L);
  addRoad(LEN.L, LEN.L, LEN.L, CRV.E, HILL.M);
  for (const b of [4, -4, 6, -6]) addRoad(10, 10, 10, 0, b);
  addRoad(LEN.L, LEN.M, LEN.L, -CRV.E, 0);
  addRoad(LEN.L, LEN.L, LEN.L, 0, -lastY() / SEG);
}
function desertScenery(addSprite) {
  for (let i = 20; i < segments.length - 10; i++) {
    const seg = segments[i];
    if (i % 24 === 0) addSprite(i, SPR.pole, -1.6);
    if (Math.abs(seg.curve) >= 3 && i % 10 === 0) {
      addSprite(i, seg.curve > 0 ? SPR.chevR : SPR.chevL, seg.curve > 0 ? -1.15 : 1.15);
      continue;
    }
    if (i % 230 === 115) { addSprite(i, pick(SPR.boards), 1.3); continue; }
    if (i % 400 === 300) { addSprite(i, SPR.diner, 1.35); continue; }
    if (R() < 0.1) addSprite(i, pick(SPR.cacti), (R() < 0.5 ? -1 : 1) * rr(1.3, 4));
    if (R() < 0.05) addSprite(i, SPR.tumble, (R() < 0.5 ? -1 : 1) * rr(1.1, 2.2));
    if (R() < 0.04) addSprite(i, SPR.redRock, (R() < 0.5 ? -1 : 1) * rr(1.3, 3.5));
    if (R() < 0.015) addSprite(i, SPR.mesa, (R() < 0.5 ? -1 : 1) * rr(4, 7));
  }
}
function pragueGeometry() {
  addRoad(LEN.M, LEN.M, LEN.M, 0, 0);
  addRoad(LEN.M, LEN.M, LEN.M, CRV.M, 0);
  addRoad(LEN.S, LEN.M, LEN.S, 0, HILL.L);
  addRoad(LEN.M, LEN.S, LEN.M, -CRV.M, -HILL.L);
  for (const b of [2, -2, 3, -3, 2, -2]) addRoad(8, 8, 8, 0, b);
  addRoad(LEN.S, LEN.S, LEN.S, CRV.H, 0);
  // Charles-bridge-like stretch over the river
  const b0 = segments.length;
  addRoad(LEN.M, LEN.L, LEN.M, 0, HILL.L * 0.5);
  addRoad(LEN.M, LEN.M, LEN.M, 0, -HILL.L * 0.5);
  pragueBridge = [b0, segments.length];
  addRoad(LEN.S, LEN.S, LEN.S, -CRV.H, 0);
  addRoad(LEN.M, LEN.M, LEN.M, CRV.E, HILL.M);
  addRoad(LEN.M, LEN.S, LEN.M, -CRV.M, 0);
  addRoad(LEN.M, LEN.M, LEN.M, CRV.M, -HILL.M);
  addRoad(LEN.L, LEN.M, LEN.M, 0, 0);
  addRoad(LEN.S, LEN.S, LEN.S, -CRV.H, HILL.L);
  addRoad(LEN.M, LEN.M, LEN.M, CRV.E, 0);
  addRoad(LEN.M, LEN.M, LEN.M, CRV.H, -HILL.L);
  addRoad(LEN.L, LEN.L, LEN.L, 0, -lastY() / SEG);
}
let pragueBridge = [0, 0];
function pragueScenery(addSprite) {
  const [bA, bB] = pragueBridge;
  for (let i = bA; i < bB; i++) segments[i].water = true;
  let nextL = 4, nextR = 7, park = false;
  const light = i => {
    for (let d = -2; d <= 3; d++) {
      const sg = segments[i + d]; if (!sg) continue;
      sg.lamp = Math.max(sg.lamp || 0, Math.pow(1 - Math.abs(d - 0.5) / 3, 1.5));
    }
  };
  for (let i = 4; i < segments.length - 6; i++) {
    const seg = segments[i];
    const onBridge = i >= bA && i < bB;
    // bridge towers at both ends
    if (i === bA - 2 || i === bB + 1) { addSprite(i, SPR.gothic, -1.45); addSprite(i, SPR.gothic, 1.45); nextL = nextR = i + 4; continue; }
    if (onBridge) {
      if ((i - bA) % 14 === 0) { addSprite(i, SPR.statue, -1.2); addSprite(i + 7, SPR.statue, 1.2); }
      if ((i - bA) % 14 === 3) { addSprite(i, SPR.gasLampL, -1.12); addSprite(i, SPR.gasLampR, 1.12); light(i); }
      continue;
    }
    park = Math.floor(i / 260) % 4 === 3;       // occasional park strip with lindens
    if (i >= nextL) {
      if (park) { addSprite(i, SPR.linden, -rr(1.3, 1.6)); nextL = i + 5; }
      else { addSprite(i, pick(SPR.pHouses), -1.5); nextL = i + 6 + Math.floor(R() * 3); }
    }
    if (i >= nextR) { addSprite(i, pick(SPR.pHouses), 1.5); nextR = i + 6 + Math.floor(R() * 3); }
    if (i % 16 === 0) { addSprite(i, SPR.gasLampL, -1.12); light(i); }
    if (i % 16 === 8) { addSprite(i, SPR.gasLampR, 1.12); light(i); }
    if (i % 150 === 75) { addSprite(i, SPR.pivo, 1.28); continue; }
    if (i % 330 === 200) { addSprite(i, SPR.gothic, -1.5); nextL = i + 6; continue; }
    if (Math.abs(seg.curve) >= 3 && i % 10 === 5) {
      addSprite(i, seg.curve > 0 ? SPR.chevR : SPR.chevL, seg.curve > 0 ? -1.2 : 1.2);
      continue;
    }
    if (R() < 0.02) addSprite(i, SPR.bin, (R() < 0.5 ? -1 : 1) * rr(1.08, 1.3));
  }
}
function addLinear(n, dy, flags) {
  for (let i = 0; i < n; i++) { addSegment(0, lastY() + dy); if (flags) Object.assign(segments[segments.length - 1], flags); }
}
const ramp = (len, slope) => addLinear(len, slope * SEG, { ramp: true });
// a kicker covers only some lanes (a..b of 0..2); the road itself stays flat under it
function kicker(len, slope, a, b) {
  const h = len * SEG * slope;
  const s0 = segments.length;
  for (let i = 0; i < len; i++) { addSegment(0, lastY()); segments[segments.length - 1].kicker = { a, b, t1: i / len, t2: (i + 1) / len, h }; }
  for (let i = Math.max(0, s0 - 22); i < s0; i++) segments[i].kickLane = { a, b };
}
const laneX = (a, b) => [-1 + 2 * a / 3, -1 + 2 * (b + 1) / 3];
const gapRun = (len, water) => addLinear(len, 0, { gap: true, water: !!water });
function extremeGeometry() {
  addRoad(LEN.M, LEN.M, LEN.M, 0, 0);
  addRoad(LEN.M, LEN.M, LEN.M, CRV.M, 0);
  addLinear(24, 0);
  ramp(8, 0.5); gapRun(24); addLinear(30, 0);                      // chasm #1
  addRoad(LEN.M, LEN.S, LEN.M, 0, -Math.round(lastY() / SEG));
  addRoad(LEN.M, LEN.M, LEN.M, -CRV.M, HILL.M);
  addLinear(16, 0);
  addLinear(14, -1.1 * SEG, { drop: true });                         // cliff drop
  addRoad(LEN.S, LEN.S, LEN.M, 0, 0);
  addRoad(LEN.M, LEN.M, LEN.M, CRV.E, 0);
  addLinear(24, 0);
  kicker(8, 0.5, 1, 2); gapRun(24, true); addLinear(30, 0);         // river #1: two right lanes
  for (const b of [6, -6, 6, -6, 6, -6]) addRoad(6, 6, 6, 0, b);   // whoops
  addLinear(30, 0);
  kicker(8, 0.5, 0, 0); gapRun(22); addLinear(30, 0);               // chasm #2: left lane only
  addRoad(LEN.M, LEN.M, LEN.M, CRV.H, 0);
  addRoad(LEN.M, LEN.M, LEN.M, -CRV.H, HILL.L);
  addLinear(28, 0);
  ramp(10, 0.6); gapRun(32); addLinear(10, 0); addLinear(30, -0.25 * SEG);   // big canyon jump
  addRoad(LEN.M, LEN.M, LEN.M, CRV.M, 0);
  addLinear(24, 0);
  kicker(8, 0.5, 2, 2); gapRun(22, true); addLinear(30, 0);         // river #2: right lane only
  addLinear(20, 0);
  kicker(9, 0.55, 0, 1); gapRun(24); addLinear(30, 0);              // chasm #3: two left lanes
  addRoad(LEN.L, LEN.L, LEN.L, -CRV.E, -Math.round(lastY() / SEG));
  // annotate gap runs so riders can be drawn arcing over them
  for (let i = 0; i < segments.length; i++) {
    if (!segments[i].gap || (i > 0 && segments[i - 1].gap)) continue;
    let j = i; while (j < segments.length && segments[j].gap) j++;
    for (let k = i; k < j; k++) { segments[k].gapT = (k - i + 0.5) / (j - i); segments[k].gapLen = j - i; }
  }
}
function extremeScenery(addSprite) {
  const starts = [];
  for (let i = 1; i < segments.length; i++) {
    if (segments[i].ramp && !segments[i - 1].ramp) starts.push([i, true, true]);
    const k = segments[i].kicker;
    if (k && !segments[i - 1].kicker) starts.push([i, k.a === 0 || (k.a === 1 && k.b === 1), k.b === 2 || (k.a === 1 && k.b === 1)]);
  }
  for (const [st, left, right] of starts) {
    if (left) addSprite(st - 16, SPR.jump, -1.3);
    if (right) addSprite(st - 16, SPR.jump, 1.3);
    for (const d of [-12, -8, -4]) {
      addSprite(st + d, SPR.warn, left ? -1.12 : 1.12);
      if (left && right) addSprite(st + d, SPR.warn, 1.12);
    }
  }
  for (let i = 12; i < segments.length - 6; i++) {
    const seg = segments[i], prev = segments[i - 1], next = segments[i + 1];
    if (seg.gap) continue;
    if (seg.ramp) { addSprite(i, SPR.tires, -1.08); addSprite(i, SPR.tires, 1.08); continue; }
    if (next && next.gap && !seg.gap) { addSprite(i, pick(SPR.pennants), -1.1); addSprite(i, pick(SPR.pennants), 1.1); continue; }
    if (prev && prev.gap) { addSprite(i, pick(SPR.pennants), -1.1); addSprite(i, pick(SPR.pennants), 1.1); addSprite(i + 1, SPR.tires, -1.2); addSprite(i + 1, SPR.tires, 1.2); continue; }
    if (seg.drop && !prev.drop) { addSprite(i - 6, SPR.warn, -1.12); addSprite(i - 6, SPR.warn, 1.12); }
    if (Math.abs(seg.curve) >= 3 && i % 10 === 0) { addSprite(i, seg.curve > 0 ? SPR.chevR : SPR.chevL, seg.curve > 0 ? -1.15 : 1.15); continue; }
    if (i % 40 === 0) addSprite(i, pick(SPR.pennants), (i % 80 ? -1 : 1) * 1.2);
    if (R() < 0.1) addSprite(i, SPR.redRock, (R() < 0.5 ? -1 : 1) * rr(1.3, 3.2));
    if (R() < 0.04) addSprite(i, SPR.tires, (R() < 0.5 ? -1 : 1) * rr(1.15, 1.4));
    if (R() < 0.04) addSprite(i, pick(SPR.cacti), (R() < 0.5 ? -1 : 1) * rr(1.5, 4));
    if (R() < 0.02) addSprite(i, SPR.mesa, (R() < 0.5 ? -1 : 1) * rr(4, 7));
  }
}
function buildTrack() {
  segments = [];
  LEVEL.geometry();
  trackLength = segments.length * SEG;
  startIndex = Math.floor(PLAYERZ / SEG) + 1;
  segments[startIndex].start = segments[startIndex + 1].start = true;
  const addSprite = (i, spr, offset) => { if (segments[i]) segments[i].sprites.push({ spr, offset }); };
  addSprite(startIndex, SPR.flag, -1.15); addSprite(startIndex, SPR.flag, 1.15);
  LEVEL.scenery(addSprite);
}

/* ================= levels ================= */
const LEVELS = [
  {
    id: 'mountain', bestKey: 'roadkick-best', name: 'Горный серпантин',
    blurb: 'хвойный лес, виражи',
    desc: 'Солнце, хвойный лес и крутые виражи с перепадами высот. Днём или ночью — решаешь сам.',
    night: false, traffic: 36, truckShare: 0.3, weather: ['fog'],
    cars: () => SPR.cars, trucks: () => SPR.trucks,
    pal: {
      day:   { grassL:'#74b047', grassD:'#65a03c', roadL:'#6e6a72', roadD:'#67636b', rumbleL:'#f3ecdc', rumbleD:'#d0413a', lane:'#efe6cc', fog:'#cfdcc6', start:'#f3ecdc' },
      night: { grassL:'#1d2f25', grassD:'#18281f', roadL:'#2a2a33', roadD:'#26262e', rumbleL:'#5d5a66', rumbleD:'#4d2126', lane:'#6d6857', fog:'#0c0f22', start:'#8a8578' },
    },
    geometry: mountainGeometry, scenery: mountainScenery, bg: mountainBG,
  },
  {
    id: 'city', bestKey: 'roadkick-best-city', name: 'Ночной город',
    blurb: 'неон, фонари, пробки',
    desc: 'Неон, фонари и плотный трафик с такси и автобусами. Длинные проспекты, эстакады и резкие повороты на перекрёстках. Здесь всегда ночь.',
    night: true, traffic: 46, truckShare: 0.18, wall: 1.38, weather: ['rain'],
    cars: () => SPR.cityCars, trucks: () => SPR.buses,
    pal: (() => { const p = { grassL:'#2c2935', grassD:'#27242f', roadL:'#2b2b33', roadD:'#27272e', rumbleL:'#8e8e9a', rumbleD:'#5e5e6a', lane:'#e0d6ae', fog:'#1c1034', start:'#e0d6ae' }; return { day: p, night: p }; })(),
    geometry: cityGeometry, scenery: cityScenery, bg: cityBG,
  },
  {
    id: 'desert', bestKey: 'roadkick-best-desert', name: 'Пустыня',
    blurb: 'дюны, кактусы, фуры',
    desc: 'Раскалённое шоссе среди дюн и красных столовых гор. Длинные прямые, где легко разогнаться — и так же легко нарваться на полицию. Днём или ночью — решаешь сам.',
    night: false, traffic: 30, truckShare: 0.45, dirt: true, weather: ['sand'],
    cars: () => SPR.cars, trucks: () => SPR.trucks,
    pal: {
      day:   { grassL:'#e4ba7a', grassD:'#dbaf6d', roadL:'#6c6468', roadD:'#655d61', rumbleL:'#f3ecdc', rumbleD:'#c8702e', lane:'#f2e2b0', fog:'#f0dcb4', start:'#f3ecdc' },
      night: { grassL:'#3a3044', grassD:'#342a3e', roadL:'#2a2830', roadD:'#26242c', rumbleL:'#6a6068', rumbleD:'#5a3424', lane:'#6d6557', fog:'#120e24', start:'#8a8578' },
    },
    geometry: desertGeometry, scenery: desertScenery, bg: desertBG,
  },
  {
    id: 'prague', bestKey: 'roadkick-best-prague', name: 'Прага',
    blurb: 'брусчатка, трамваи, мосты',
    desc: 'Старый город под Пражским градом: брусчатка трясёт байк, по центру ходят трамваи, газовые фонари и мост со статуями над рекой. Днём или ночью — решаешь сам.',
    night: false, traffic: 34, truckShare: 0, tramShare: 0.3, sideLanes: true, cobble: true, rails: true, wall: 1.38, weather: ['rain', 'fog'],
    cars: () => SPR.pCars, trucks: () => SPR.pCars,
    pal: {
      day:   { grassL:'#bcae9a', grassD:'#b3a590', roadL:'#7c726c', roadD:'#746a64', rumbleL:'#e2dac8', rumbleD:'#a89c8a', lane:'#e8e0cc', fog:'#ead6bc', start:'#e8e0cc', cobble:'#6a615c', rail:'#c8c4bc', waterL:'#4f82a0', waterD:'#477a98' },
      night: { grassL:'#34303c', grassD:'#2f2b36', roadL:'#2e2a30', roadD:'#2a262c', rumbleL:'#6a6470', rumbleD:'#4e4854', lane:'#6d6757', fog:'#141028', start:'#8a8578', cobble:'#242026', rail:'#7a7670', waterL:'#141c32', waterD:'#11182c' },
    },
    geometry: pragueGeometry, scenery: pragueScenery, bg: pragueBG,
  },
  {
    id: 'extreme', bestKey: 'roadkick-best-extreme', name: 'Трюковой каньон',
    blurb: 'трамплины, обрывы, реки',
    desc: 'Экстрим-маршрут через каньон: трамплины, пропасти и реки, которые нужно перелетать, плюс обрыв и серия кочек. Разгоняйся перед трамплином: медленно не перепрыгнуть, а упасть — значит проиграть.',
    night: false, traffic: 0, truckShare: 0, dirt: true, weather: ['sand', 'fog'],
    cars: () => SPR.cars, trucks: () => SPR.trucks,
    pal: {
      day:   { grassL:'#c8784a', grassD:'#bc6e42', roadL:'#5e5458', roadD:'#574d52', rumbleL:'#f3ecdc', rumbleD:'#d0413a', lane:'#efe6cc', fog:'#f0b890', start:'#f3ecdc', rampA:'#f2c230', rampB:'#2a2226', chasmL:'#2a1418', chasmD:'#24111a', waterL:'#3a8ab8', waterD:'#3482b0' },
      night: { grassL:'#34263a', grassD:'#2e2234', roadL:'#28242c', roadD:'#242028', rumbleL:'#6a6068', rumbleD:'#4d2126', lane:'#6d6757', fog:'#120e24', start:'#8a8578', rampA:'#8a7020', rampB:'#141016', chasmL:'#07050a', chasmD:'#050408', waterL:'#101a30', waterD:'#0e162a' },
    },
    geometry: extremeGeometry, scenery: extremeScenery, bg: extremeBG,
  },
];
let LEVEL = LEVELS[0], levelIndex = 0;
function loadLevel(i) {
  levelIndex = i; LEVEL = LEVELS[i];
  if (!LEVEL.palRGB) LEVEL.palRGB = toRGB(LEVEL.pal);
  PAL = LEVEL.palRGB;
  if (!LEVEL.bgCache) LEVEL.bgCache = LEVEL.bg();
  BG = LEVEL.bgCache;
  buildTrack();
  nightTarget = LEVEL.night ? 1 : 0; nt = nightTarget;
  const nk = $('kNight');
  nk.classList.toggle('off', LEVEL.night);
  $('kNightCap').textContent = T(LEVEL.night ? 'всегда' : 'ночь');
  resetRace();
}
const findSegment = z => segments[Math.floor(U.wrap(z, trackLength) / SEG) % segments.length];
