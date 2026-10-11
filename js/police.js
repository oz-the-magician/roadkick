// Roadkick — Police dispatch and pursuit AI
'use strict';

/* ================= police ================= */
function heatLevel() { return Math.min(3, Math.floor(heat / 100)); }

function spawnCop(type, idx) {
  const b = bikeZ();
  const car = type === 'car';
  const unit = {
    kind: 'police', sub: type, state: 'ride', frames: car ? SPR.copCar : SPR.police,
    dist: b - SEG * (18 + idx * 6), speed: player.speed,
    offset: car ? U.clamp(player.x, -0.6, 0.6) : (idx % 2 ? -0.9 : 0.9),
    flank: car ? 0.5 : (idx % 2 ? -0.35 : 0.35),
    // the patrol car is slower than a bike at full throttle (outrun it); motorcycles are faster (kick them)
    cap: MAXSPEED * (car ? 0.9 : 1.05), retreat: false, downT: 0, kickT: 0, z: 0,
    w: car ? CAR[0].length * 30 / ROADW : 20 * RIDER_PPU / ROADW,
  };
  unit.z = U.wrap(unit.dist, trackLength);
  cops.push(unit);
  return unit;
}

function dispatch(dt) {
  const lvl = heatLevel();
  let joined = [];
  SLOTS.forEach((slot, i) => {
    const st = slotState[i];
    if (st.unit && !cops.includes(st.unit)) st.unit = null;
    if (st.cd > 0) st.cd -= dt;
    if (st.unit) st.unit.retreat = lvl < slot.lvl;    // heat dropped below this unit's level → it backs off
    if (!st.unit && lvl >= slot.lvl && st.cd <= 0 && copCooldown <= 0) {
      st.unit = spawnCop(slot.type, i);
      joined.push(slot.type);
    }
  });
  if (joined.length) {
    bustT = bustT || 0;
    say(joined.includes('car') && cops.length === 1 ? 'Копы на хвосте!' : 'Подкрепление!', 1.2, 'bad');
  }
}

function copDodge(c) {
  // look for traffic ahead in the cop's path and pick a side to pass it, like the rivals do
  let dir = 0, near = 1e9;
  for (const t of traffic) {
    const dz = U.wrapSigned(t.z - c.z, trackLength);
    if (dz > 0 && dz < SEG * 8 && dz < near && U.overlap(c.offset, c.w, t.offset, t.w, 1.25)) {
      near = dz;
      dir = c.offset >= t.offset ? 1 : -1;
      if (Math.abs(t.offset) > 0.5 && Math.sign(t.offset) === dir) dir = -dir;   // don't squeeze toward the kerb
    }
  }
  return { dir, near };
}

function removeCop(c, lost) {
  const i = cops.indexOf(c);
  if (i >= 0) cops.splice(i, 1);
  const si = slotState.findIndex(st => st.unit === c);
  if (si >= 0) { slotState[si].unit = null; slotState[si].cd = lost ? 8 : 6; }
  if (lost) chaseLost = true;
}

function updateCop(c, dt, b, racing) {
  const dz = c.dist - b;
  const car = c.sub === 'car';
  if (c.state === 'down') {
    c.speed = Math.max(0, c.speed - MAXSPEED * 1.3 * dt);
    c.downT -= dt;
    if (c.downT <= 0) { removeCop(c, false); return; }
  } else {
    // --- speed: chase hard from behind, then hold position right next to the bike (dz ≈ 0)
    let target;
    if (c.retreat) target = player.speed * 0.6;
    else if (dz < -SEG * 3) target = Math.min(c.cap, player.speed + MAXSPEED * 0.35);
    else target = U.clamp(player.speed - (dz - 70) * 3, 0, c.cap);   // settle just level with the bike
    c.speed = U.toward(c.speed, target, c.speed < target ? ACCEL * 1.8 : MAXSPEED * 1.2, dt);

    // --- steering: flank on approach, close onto the bike when level with it, dodge traffic
    const lim = car ? 0.8 : 1.3;
    const av = copDodge(c);
    // level with the bike: ride shoulder-to-shoulder, touching but beside it, so the rider stays visible
    const touch = (PW + c.w) * 0.45;
    // pick a side once when closing in and stick to it (no flip-flopping across the bike)
    if (Math.abs(dz) > SEG * 6) c.pinSide = 0;
    else if (!c.pinSide) c.pinSide = Math.sign(c.offset - player.x) || Math.sign(c.flank) || 1;
    const side = c.pinSide || Math.sign(c.flank) || 1;
    let aim = Math.abs(dz) < SEG * 4 ? player.x + side * touch * 0.8 : player.x + (car ? side * 0.3 : c.flank);
    if (av.dir) aim = c.offset + av.dir * 0.7;
    if (c.retreat) aim = c.offset;
    c.offset += U.clamp(aim - c.offset, -1, 1) * dt * (car ? 1.5 : 2.3);
    c.offset = U.clamp(c.offset, -lim, lim);

    if (racing && !c.retreat) {
      // contact = the patrol is level with the bike and their bodies touch
      const contact = player.mode !== 'sunk' && player.air < 60 &&
        Math.abs(dz) < SEG * 1.1 && Math.abs(c.offset - player.x) < touch * 1.25;
      if (contact) {
        copHit = true;
        // it leans on you: a push sideways and a little drag
        const side = Math.sign(player.x - c.offset) || 1;
        player.x += side * (car ? 0.35 : 0.22) * dt;
        player.speed = Math.max(0, player.speed - MAXSPEED * (car ? 0.18 : 0.1) * dt);
        // riding into the back of a patrol car at speed is a crash
        if (car && player.mode === 'ride' && dz > SEG * 0.3 && player.speed > c.speed + MAXSPEED * 0.15) {
          crashPlayer(); player.speed = c.speed * 0.5;
        }
      }
    }
    // left far behind, or retreated out of sight → gone
    if (dz < -SEG * 45 || (c.retreat && dz < -SEG * 25)) { removeCop(c, true); return; }
  }
  c.dist += dt * c.speed;
  c.z = U.wrap(c.dist, trackLength);
}
