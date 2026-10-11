// Roadkick — Per-step simulation: bike physics, jumps, pickups, rivals, finish
'use strict';

/* ================= update ================= */
/* ---------- jumps: the bike leaves the road when a crest drops away faster than gravity ---------- */
const GRAVITY = 9000;
function groundY(z, x = player.x) {
  const sg = findSegment(z), p = (U.wrap(z, trackLength) % SEG) / SEG;
  let y = U.lerp(sg.p1.world.y, sg.p2.world.y, p);
  const k = sg.kicker;
  if (k) {
    const [xa, xb] = laneX(k.a, k.b);
    if (x >= xa - PW * 0.3 && x <= xb + PW * 0.3) y += k.h * U.lerp(k.t1, k.t2, p);
  }
  return y;
}
function updateAir(dt, racing) {
  const z = bikeZ();
  const gy = groundY(z);
  // smoothed slope of the road itself (kickers are handled as edges, not as crests)
  const slope = (groundY(z + 300, 99) - groundY(z - 300, 99)) / 600;
  const gvy = slope * player.speed;
  if (player.airborne) {
    player.airT += dt;
    player.vy -= GRAVITY * dt;
    player.y += player.vy * dt;
    // stunts: high enough off the ground, up/down spin the bike into flips
    // hold ↓ in the air to backflip; you must complete whole flips to land it
    if ((player.y - gy) > 120 && racing && player.mode === 'ride' && keys.down) {
      player.trickRot += TRICK_RATE * dt;
      player.trickActive = true;
    }
    if (player.y <= gy) {
      const impact = gvy - player.vy;
      player.airborne = false; player.y = gy;
      // settle on touchdown: forget the take-off state so the bike doesn't bounce off again
      player.agF = 0; player.gvyS = (groundY(z) - groundY(z - 100)) / 100 * player.speed; player.vy = 0; player.landCd = 0.35;
      // evaluate the trick: you must be upright (near a whole number of flips) when you touch down
      let trickCrash = false;
      if (player.trickActive) {
        const norm = ((player.trickRot % TAU) + TAU) % TAU;
        const off = Math.min(norm, TAU - norm);
        const flips = Math.round(Math.abs(player.trickRot) / TAU);
        if (off > 0.6) trickCrash = true;
        else if (flips >= 1 && racing && player.mode === 'ride') {
          player.speed = Math.min(MAXSPEED * NITRO_MULT, player.speed + MAXSPEED * 0.1 * flips);
          if (player.nitro === 'none') player.nitro = 'held';
          const names = ['', 'Сальто!', 'Двойное сальто!', 'Тройное сальто!'];
          say((names[Math.min(3, flips)] || `${flips}× сальто!`) + ' +нитро', 1.1, 'cool');
          SND.trick();
          addCombo(flips > 1 ? `Сальто ×${flips}` : 'Сальто', 500 * flips);
          slowmo(0.4, 0.3);
        }
      }
      player.trickRot = 0; player.trickActive = false;
      if (trickCrash) { crashPlayer(); say('Не докрутил!', 1.1, 'bad'); }
      else {
        if (impact > 2500) {
          shake = Math.max(shake, Math.min(0.35, impact / 14000));
          player.wobble = Math.max(player.wobble, 0.35);
          player.speed *= impact > 7000 ? 0.85 : 0.97;
          SND.land(impact);
        }
        if (player.airT > 0.9 && racing && player.mode === 'ride') { say('Полёт!', 0.8, 'cool'); addCombo('Полёт', 300); }
      }
    }
  } else {
    // how fast the road's vertical speed is dropping (speed held fixed so braking/bumps don't count)
    const ag = (slope - player.slopePrev) / dt * player.speed;
    player.agF += (ag - player.agF) * Math.min(1, dt * 15);
    // player.y still holds last frame's ground height; a step the road's current slope can't explain is an edge
    const drop = player.y - gy - (-player.gvyS * dt);
    if (Math.abs(gy - player.y) < 150 && drop <= 25) player.gvyS += ((gy - player.y) / dt - player.gvyS) * Math.min(1, dt * 20);
    const edge = drop > 120 && player.y - gy > 150;    // a real discontinuity, e.g. the end of a kicker
    player.landCd = Math.max(0, (player.landCd || 0) - dt);
    if (((player.agF < -GRAVITY && player.landCd <= 0) || edge) && player.speed > MAXSPEED * 0.45 && player.mode === 'ride') {
      // take off with the slope of the lip you just left (the smoothed slope lags behind)
      const lip = (groundY(z - 40) - groundY(z - 240)) / 200;
      player.airborne = true; player.airT = 0;
      player.vy = Math.max(player.slopePrev * player.speed, lip * player.speed, player.gvyS);
      if (!edge) player.y = gy;                       // off a kicker edge: keep the lip height
      SND.whiff();
    } else player.y = gy;
  }
  player.slopePrev = slope;
  player.air = Math.max(0, player.y - groundY(bikeZ()));
}

function crashPlayer() {
  if (player.mode === 'crash') return;
  player.mode = 'crash'; player.crashT = 1.6; shake = 0.5;
  player.airborne = false; player.trickRot = 0; player.trickActive = false;
  SND.crash(); say('Авария!', 1.2, 'bad');
  loseCombo(); slowmo(0.3, 0.45);
  player.weapon = null;   // you drop whatever you were holding
}

function tryKick() {
  if (player.mode !== 'ride' || player.kickCd > 0) return;
  player.kickCd = 0.45; player.kickT = 0.28;
  const b = bikeZ();
  const pw = player.weapon ? WEAPONS[player.weapon.type] : null;
  const reachX = pw ? pw.reach : 0.5, reachZ = pw ? SEG * 2 : SEG * 1.6;
  let target = null, best = 1e9;
  const cands = rivals.slice();
  for (const c of cops) if (c.state === 'ride' && c.sub === 'moto') cands.push(c);
  for (const e of cands) {
    if (e.state !== 'ride') continue;
    const dz = e.dist - b, dx = e.offset - player.x;
    if (Math.abs(dz) < reachZ && Math.abs(dx) < reachX && Math.abs(dx) > 0.02) {
      const score = Math.abs(dz) + Math.abs(dx) * 400;
      if (score < best) { best = score; target = e; }
    }
  }
  if (target) {
    const side = Math.sign(target.offset - player.x) || 1;
    player.kickSide = side;
    target.state = 'down'; target.downT = pw ? pw.knock : 2.6; target.offset += side * (pw ? 0.5 : 0.35);
    if (pw) SND.clang(player.weapon.type); else SND.kick();
    shake = pw ? 0.18 : 0.12;
    if (target.kind === 'police') { say('Копа — в кювет!', 1, 'cool'); addCombo('Коп в кювете', 500); }
    else if (pw) { say(player.weapon.type === 'chain' ? 'Хлесь!' : 'Бамс!', 0.7); addCombo(player.weapon.type === 'chain' ? 'Удар цепью' : 'Удар дубинкой', 350); }
    else { say('Бац!', 0.7); addCombo('Пинок', 250); }
    if (pw) useWeaponCharge();
    onRivalHit(target, !!pw);
  } else {
    player.kickSide = keys.left ? -1 : keys.right ? 1 : (player.kickSide || 1);
    SND.whiff();
  }
}

/* ---------- paintball drone ---------- */
const DRONE_LIFT = 14;                                    // screen px above the rider's helmet
const airPx = () => Math.round(player.air * 0.4 * PSCALE * H / 2);
function droneScreenY() {
  const riderH = SPR.player.base.d.height * SPR.player.base.ppu * PSCALE * W / 2;
  return PLAYER_Y - riderH - DRONE_LIFT;
}
function useDrone() {
  if (player.drone === 'held') {
    player.drone = 'active'; player.droneT = DRONE_TIME; player.shotCd = 0.3;
    say('Дрон в воздухе', 1, 'cool'); SND.tone(520, 0.1); setTimeout(() => SND.tone(780, 0.15), 90);
  } else if (player.drone === 'active' && player.shotCd <= 0 && player.mode === 'ride') {
    player.shotCd = 0.35;
    // the ball leaves the drone and flies straight down the lane, dropping to rider height
    const h0 = (PLAYER_Y - droneScreenY() + 6) / (PSCALE * H / 2) + player.air;
    shots.push({ kind: 'shot', dist: bikeZ() + 60, z: 0, offset: player.x, h0, h: h0, travel: 0,
      speed: player.speed + MAXSPEED * 1.2 });
    SND.pop();
  }
}
function updateDrone(dt, racing) {
  player.shotCd = Math.max(0, player.shotCd - dt);
  if (player.drone === 'active' && racing) {
    player.droneT -= dt;
    if (player.droneT <= 0) { player.drone = 'none'; player.droneT = 0; say('Дрон улетел', 0.9); }
  }
  SND.drone(player.drone === 'active');

  // pickups
  const b = bikeZ();
  for (const p of pickups) {
    if (!p.active) { p.respawn -= dt; if (p.respawn <= 0) p.active = true; continue; }
    if (!racing || player.mode !== 'ride') continue;
    const busy = p.type === 'nitro' ? player.nitro !== 'none' : player.drone !== 'none';
    if (busy) continue;
    const dz = U.wrapSigned(p.z - b, trackLength);
    if (Math.abs(dz) < SEG * 0.9 && Math.abs(p.offset - player.x) < 0.28) {
      p.active = false;
      if (p.type === 'nitro') { p.respawn = NITRO_RESPAWN; player.nitro = 'held'; say('Нитро! Жми C', 1.2, 'cool'); }
      else { p.respawn = DRONE_RESPAWN; player.drone = 'held'; say('Дрон! Жми F', 1.2, 'cool'); }
      SND.pickup();
    }
  }

  // shots
  for (let i = shots.length - 1; i >= 0; i--) {
    const s = shots[i];
    const prev = s.dist;
    s.dist += s.speed * dt; s.travel += s.speed * dt;
    s.h = U.lerp(s.h0, 330, U.clamp(s.travel / (SEG * 12), 0, 1));
    s.z = U.wrap(s.dist, trackLength);
    let hit = null;
    for (const e of rivals) {
      if (e.state !== 'ride') continue;
      if (e.dist >= prev - 80 && e.dist <= s.dist + 80 && Math.abs(e.offset - s.offset) < 0.22) { hit = e; break; }
    }
    if (hit) {
      hit.state = 'down'; hit.downT = 2.4; hit.offset += (hit.offset >= s.offset ? 1 : -1) * 0.2;
      fx.push({ kind: 'fx', dist: hit.dist, z: U.wrap(hit.dist, trackLength), offset: hit.offset, h: 200, life: 0.7, speed: hit.speed * 0.5 });
      SND.splat(); say('Попал!', 0.6, 'cool'); addCombo('Пейнтбол', 200);
      shots.splice(i, 1);
    } else if (s.travel > SEG * 45) shots.splice(i, 1);
  }
  for (let i = fx.length - 1; i >= 0; i--) {
    const e = fx[i];
    e.life -= dt; e.dist += e.speed * dt; e.z = U.wrap(e.dist, trackLength);
    if (e.vh) e.h += e.vh * dt;
    if (e.life <= 0) fx.splice(i, 1);
  }
}
function useNitro() {
  if (player.nitro === 'held') { player.nitro = 'active'; player.nitroT = NITRO_TIME; say('Нитро!', 0.9, 'cool'); SND.nitroHit(); }
}
function updateNitro(dt, racing) {
  if (player.nitro === 'active') {
    if (racing) player.nitroT -= dt;
    if (player.nitroT <= 0) { player.nitro = 'none'; player.nitroT = 0; }
  }
  SND.nitroLoop(player.nitro === 'active');
}
function nitroKeyState() {
  if (state !== 'race') return ['off', 'нет нитро'];
  if (player.nitro === 'held') return ['ready', 'буст'];
  if (player.nitro === 'active') return ['boost', `буст ${Math.ceil(player.nitroT)}`];
  return ['off', 'нет нитро'];
}
function droneKeyState() {
  if (state !== 'race') return ['off', 'нет дрона'];
  if (player.drone === 'held') return ['ready', 'запуск'];
  if (player.drone === 'active') return ['live', `огонь ${Math.ceil(player.droneT)}`];
  return ['off', 'нет дрона'];
}



function update(dt) {
  const racing = state === 'race';
  const moving = racing || state === 'finished' || state === 'busted' || state === 'sunk';
  nt = U.toward(nt, nightTarget, 1.2, dt);

  if (state === 'countdown') {
    const before = Math.ceil(countdown);
    countdown -= dt;
    const after = Math.ceil(countdown);
    if (after !== before) {
      if (after > 0) { say(String(after), 0.9); SND.tone(440, 0.15); }
      else { say('Вперёд!', 0.9); SND.tone(880, 0.35); state = 'race'; }
    }
  }
  if (msgTimer > 0) { msgTimer -= dt; if (msgTimer <= 0) $('msg').className = 't'; }
  if (shake > 0) shake = Math.max(0, shake - dt);
  if (state === 'menu') {
    // attract mode: the camera cruises the selected track behind the menu (shown in the preview)
    const sp = MAXSPEED * 0.5, seg = findSegment(bikeZ());
    raceTime += dt;
    player.dist += dt * sp;
    for (const l of BG) l.off = U.wrap(l.off + l.sx * seg.curve * (dt * sp) / SEG, 1);
    for (const t of traffic) t.z = U.wrap(t.z + dt * t.speed, trackLength);
  }
  if (!moving) { SND.engine(0, false, state === 'countdown'); SND.siren(0, 0); return; }
  if (racing) raceTime += dt;

  const pSeg = findSegment(bikeZ());
  const pct = player.speed / MAXSPEED;
  const dx = dt * 2 * pct;
  const control = racing && player.mode === 'ride';
  const steer = control ? (keys.left ? -1 : 0) + (keys.right ? 1 : 0) : 0;
  const throttle = control && keys.up, brake = control && keys.down;
  const nitroOn = player.nitro === 'active';

  player.dist += dt * player.speed;
  const inAir = player.airborne && player.air > 30;
  const grip = weather ? 1 - (1 - weather.grip) * weatherLvl : 1;
  player.x += steer * dx * (inAir ? 0.35 : grip * 1.25);              // a bit more bite so hard corners are holdable
  if (!inAir) player.x -= dx * pct * pSeg.curve * CENTRIFUGAL * (2 - grip);   // slick roads push you wider
  updateAir(dt, racing);

  if (player.mode === 'sunk') {
    player.sunkT += dt;
    player.speed = Math.max(0, player.speed + BRAKING * 2.5 * dt);
    if (player.sunkT < 0.35) player.x += player.sunkSide * dt * 0.8;
  } else if (player.mode === 'crash') {
    player.speed = Math.max(0, player.speed + BRAKING * 1.6 * dt);
    player.crashT -= dt;
    if (player.crashT <= 0) {
      player.mode = 'ride';
      if (Math.abs(player.x) > 1) player.x = Math.sign(player.x) * 0.8;
    }
  } else if (!racing) {
    player.speed = Math.max(0, player.speed + BRAKING * 0.4 * dt);
  } else if (inAir) player.speed += DECEL * 0.15 * dt;
  else if (nitroOn) player.speed += ACCEL * 1.8 * dt;   // nitro auto-throttles past the normal top speed
  else if (throttle) player.speed += ACCEL * dt;
  else if (brake) player.speed += BRAKING * grip * dt;
  else player.speed += DECEL * dt;

  player.kickT = Math.max(0, player.kickT - dt);
  player.kickCd = Math.max(0, player.kickCd - dt);
  player.wobble = Math.max(0, player.wobble - dt);
  if (kickQueued) { kickQueued = false; if (racing) tryKick(); }
  if (droneQueued) { droneQueued = false; if (racing) useDrone(); }
  if (nitroQueued) { nitroQueued = false; if (racing) useNitro(); }
  updateDrone(dt, racing);
  updateNitro(dt, racing);
  if (racing) updateWeather(dt);

  // dust / tyre smoke behind the rear wheel: braking, or sliding on a slick corner
  brakeCd = Math.max(0, brakeCd - dt);
  if (racing && player.mode === 'ride' && player.air < 10) {
    const grip2 = grip;
    const sliding = Math.abs(steer) > 0.1 && grip2 < 0.85 && player.speed > MAXSPEED * 0.55;
    if ((brake && player.speed > MAXSPEED * 0.28) || sliding) {
      if (brakeCd <= 0) {
        brakeCd = 0.05;
        const sand = !!LEVEL.dirt;
        fx.push({ kind: 'fx', fxType: sand ? 'sand' : 'smoke', dist: bikeZ() - SEG * 0.5,
          z: U.wrap(bikeZ() - SEG * 0.5, trackLength), offset: player.x + rr(-0.05, 0.05),
          h: 0, vh: rr(25, 55), life: rr(0.3, 0.5), life0: 0.5, speed: 0 });
        if (fx.length > 90) fx.shift();
      }
    }
  }

  // bridge: past the parapet there is only the river
  if (racing && pSeg.water && !pSeg.gap && Math.abs(player.x) > 1.22 && player.mode !== 'sunk' && player.air < 60) { sink('vltava'); }
  if (racing && pSeg.gap && player.mode !== 'sunk' && player.air < 30) { sink(pSeg.water ? 'river' : 'chasm'); }
  // off-road
  if (Math.abs(player.x) > 1) {
    // the kerb/shoulder just past the edge only slows you a little; real grass slows hard
    if (player.speed > OFFROAD_LIMIT) player.speed += OFFROAD_DECEL * (Math.abs(player.x) < 1.2 ? 0.35 : 1) * dt;
    if (player.mode === 'ride' && !pSeg.water && player.air < 400) {   // on the bridge you fly over the parapet instead
      for (const s of pSeg.sprites) {
        const sw = s.spr.d.width * s.spr.ppu / ROADW;
        const cx = s.offset + (sw / 2) * (s.offset > 0 ? 1 : -1);
        if (U.overlap(player.x, PW, cx, sw * 0.6)) {
          // a solid hit at speed is a crash; a glancing touch just bounces you back toward the road
          const deep = Math.abs(player.x - cx) < sw * 0.2;
          if (deep && player.speed > MAXSPEED * 0.55) {
            crashPlayer();
            player.speed = Math.min(player.speed, MAXSPEED / 6);
            player.dist -= (U.wrap(bikeZ(), SEG)) + 1;
          } else {
            SND.bump(); shake = Math.max(shake, 0.12); player.wobble = 0.3;
            player.speed *= 0.8;
            player.x -= Math.sign(player.x) * 0.12;
          }
          break;
        }
      }
    }
  }
  if (LEVEL.wall && Math.abs(player.x) > LEVEL.wall && player.mode !== 'sunk') {
    // city: buildings form a wall behind the sidewalk
    player.x = Math.sign(player.x) * LEVEL.wall;
    if (player.speed > MAXSPEED * 0.35 && player.mode === 'ride') { player.speed *= 0.6; player.wobble = 0.4; shake = 0.15; SND.bump(); }
  }
  player.x = U.clamp(player.x, -3, 3);
  player.speed = U.clamp(player.speed, 0, MAXSPEED * (nitroOn ? NITRO_MULT : 1));
  const targetLean = (steer * 0.3 + (player.wobble > 0 ? Math.sin(player.wobble * 30) * 0.15 : 0)) * Math.min(1, pct * 1.5);
  player.lean = U.toward(player.lean, targetLean, 2.2, dt);

  // background parallax
  for (const l of BG) l.off = U.wrap(l.off + l.sx * pSeg.curve * (dt * player.speed) / SEG, 1);

  // traffic
  const b = bikeZ();
  for (const t of traffic) {
    t.z = U.wrap(t.z + dt * t.speed, trackLength);
    if (player.mode !== 'ride') continue;
    const dz = U.wrapSigned(t.z - b, trackLength);
    if (player.air < t.spr.d.height * t.spr.ppu * 0.85 && dz > -SEG * 0.5 && dz < SEG * 0.9 && player.speed > t.speed && U.overlap(player.x, PW, t.offset, t.w, 0.8)) {
      if (player.speed > MAXSPEED * 0.55) crashPlayer();
      else { SND.bump(); shake = 0.15; }
      player.speed = t.speed * 0.6;
      player.dist += dz - SEG * 0.9;
    }
  }

  // rivals
  const bNow = bikeZ();
  for (const e of rivals) updateRider(e, dt, bNow);
  talkCd = Math.max(0, talkCd - dt);
  // passes: a rival or car that was ahead of the bike and is now behind it
  if (racing && player.mode === 'ride') {
    const fast = player.speed > MAXSPEED * 0.55;
    for (const e of rivals) {
      const ahead = e.dist > bNow;
      if (overSide.get(e) === true && !ahead && e.state === 'ride') addCombo('Обгон', 150);
      overSide.set(e, ahead);
    }
    for (const t of traffic) {
      const dz = U.wrapSigned(t.z - bNow, trackLength);
      if (Math.abs(dz) > SEG * 4) { overSide.delete(t); continue; }
      const ahead = dz > 0;
      if (overSide.get(t) === true && !ahead && fast && player.air < 60) {
        const gap = Math.abs(t.offset - player.x) - (t.w + PW) / 2;
        if (gap < 0.12) addCombo('На волоске', 200);
      }
      overSide.set(t, ahead);
    }
  }

  // speeding & police
  if (racing) {
    if (player.speed / MAXSPEED > SPEED_LIMIT && player.mode === 'ride') {
      const excess = (player.speed / MAXSPEED - SPEED_LIMIT) / (1 - SPEED_LIMIT);
      heat = Math.min(300, heat + HEAT_RATE * (0.4 + excess) * dt);
    } else heat = Math.max(0, heat - HEAT_DECAY * dt);
    if (copCooldown > 0) copCooldown -= dt;
    dispatch(dt);
  }
  copHit = false;
  for (const c of cops.slice()) { if (state !== 'race' && racing) break; updateCop(c, dt, bNow, racing); }
  if (racing) {
    if (copHit) {
      bustT += dt; calmT = 0;
      if (bustT > 1.3 && bustT - dt <= 1.3) say('Прижимают!', 0.8, 'bad');
      if (bustT >= BUST_TIME) busted();
    } else {
      bustT = Math.max(0, bustT - dt * 2);       // break contact and the ring drains fast
      // 20 s of chase without contact → wanted level drops one step
      if (cops.some(c => c.state === 'ride' && !c.retreat)) {
        calmT += dt;
        if (calmT >= CALM_TIME) {
          calmT = 0;
          heat = Math.max(0, (heatLevel() - 1) * 100 + 40);
          say(heatLevel() > 0 ? 'Розыск ниже' : 'Сбросил хвост', 1.1, 'cool'); SND.tone(880, 0.15);
        }
      } else calmT = 0;
    }
  }
  if (racing && cops.length === 0 && chaseLost) {
    chaseLost = false; heat = 0; copCooldown = 4;
    slotState.forEach(st => { st.unit = null; st.cd = 0; });
    say('Ушёл от погони', 1.2, 'cool'); SND.tone(990, 0.2);
  }
  const ridingCops = cops.filter(c => c.state === 'ride');
  const nearestCop = ridingCops.length ? Math.min(...ridingCops.map(c => Math.abs(c.dist - bNow))) : Infinity;
  SND.siren(ridingCops.length ? U.clamp(1 - nearestCop / (SEG * 30), 0.15, 1) : 0, raceTime);
  MUSIC.chase = racing && ridingCops.some(c => !c.retreat) ? 1 : 0;
  SND.engine(pct, throttle, true);

  // laps & finish
  if (state === 'race') {
    const lap = Math.floor(player.dist / trackLength) + 1;
    if (lap > lastLap && lap <= LAPS) { lastLap = lap; say('Последний круг', 1.3, 'cool'); SND.tone(660, 0.3); }
    if (bNow >= FINISH()) finishRace();
  }
}

function updateRider(e, dt, b) {
  if (e.state === 'down') {
    e.speed = Math.max(0, e.speed - MAXSPEED * 1.3 * dt);
    e.downT -= dt;
    if (e.downT <= 0) { e.state = 'ride'; e.offset = U.clamp(e.offset, -0.8, 0.8); }
  } else {
    rivalBrain(e, dt, b);
    const gap = e.dist - b;
    let target = e.base * rivalPace(e);
    if (gap > SEG * 25) target *= 0.93;
    else if (gap < -SEG * 25) target = Math.min(MAXSPEED * 0.99, target * 1.08);
    if (state !== 'race' && state !== 'finished') target *= 0.5;

    let dir = 0, nearest = 1e9;
    for (const t of traffic) {
      const dz = U.wrapSigned(t.z - e.z, trackLength);
      if (dz > 0 && dz < SEG * 18 && dz < nearest && U.overlap(e.offset, e.w, t.offset, t.w, 1.3)) {
        nearest = dz;
        dir = t.offset > 0.4 ? -1 : t.offset < -0.4 ? 1 : (e.offset >= t.offset ? 1 : -1);
        if (dz < SEG * 2) target = Math.min(target, t.speed);
      }
    }
    e.speed = U.toward(e.speed, target, e.speed < target ? ACCEL * 0.9 : MAXSPEED * 0.8, dt);
    if (dir) e.offset += dir * dt * 1.1;
    else e.offset += (e.lane - e.offset) * dt * 0.4;
    e.offset = U.clamp(e.offset, -0.9, 0.9);
    if (R() < dt * 0.15) e.lane = rr(-0.7, 0.7);

    // side contact & rival kicks
    const dz = gap, dx = e.offset - player.x;
    const adjacent = player.mode === 'ride' && player.air < 300 && Math.abs(dz) < SEG * 1.3 && Math.abs(dx) < 0.45;
    if (adjacent && Math.abs(dx) < PW * 0.9) {
      const s = Math.sign(dx) || 1;
      e.offset += s * 0.1; player.x -= s * 0.08; player.speed *= 0.97; SND.bump();
    }
    e.kickT = Math.max(0, e.kickT - dt);
    // a weapon reaches a little further than a boot
    const reach = e.weapon ? WEAPONS[e.weapon].reach : 0.45;
    const inRange = player.mode === 'ride' && player.air < 300 && Math.abs(dz) < SEG * 1.4 && Math.abs(dx) < reach;
    if (inRange && state === 'race') {
      e.kickCd -= dt;
      if (e.kickCd <= 0) e.kickCd = rivalAttack(e, dz, dx) ? e.t.cd + 1.2 : e.t.cd * 0.6;
    } else e.kickCd = Math.max(e.kickCd, 0.8);
  }
  e.dist += dt * e.speed;
  e.z = U.wrap(e.dist, trackLength);
  if (!e.finished && e.dist >= FINISH()) { e.finished = true; e.finishT = raceTime; }
}



function finishRace() {
  state = 'finished';
  player.finishRank = rank();
  const t = raceTime;
  let best = null;
  best = getBest(LEVEL);
  const record = !(best > 0) || t < best;
  bankCombo();
  let bestScore = 0; try { bestScore = +localStorage.getItem(LEVEL.bestKey + '-score') || 0; } catch (e) {}
  const scoreRec = score > bestScore;
  if (scoreRec) { try { localStorage.setItem(LEVEL.bestKey + '-score', String(score)); } catch (e) {} }
  if (record) { try { localStorage.setItem(LEVEL.bestKey, String(t)); } catch (e) {} }
  say('Финиш!', 1.5, 'cool');
  MUSIC.jingle(player.finishRank === 1 ? 'win' : 'finish');
  setTimeout(() => {
    $('resTitle').textContent = player.finishRank === 1 ? 'Победа' : 'Финиш';
    $('resPlace').textContent = `${player.finishRank} место из ${N_RIVALS + 1}`;
    $('resInfo').textContent = `Время ${fmtTime(t)}` + (record ? ' — новый рекорд.' : `. Рекорд ${fmtTime(best)}.`) + ` Очки: ${score.toLocaleString('ru-RU')}${scoreRec ? ' — лучший счёт' : ''}.`;
    $('result').hidden = false; $('bAgain').focus();
  }, 1600);
}
const FALL_TEXT = {
  vltava: ['Бултых!', 'Байк на дне Влтавы', 'На мосту не выезжай за парапет: за ним сразу река. Держись дороги, особенно когда толкаются соседи.'],
  river: ['Бултых!', 'Байк унесло течением', 'Не долетел до берега. Перед трамплином держи газ до упора — нужно от 115 км/ч.'],
  chasm: ['Обрыв!', 'Байк улетел в пропасть', 'Не хватило скорости на трамплине. Разгоняйся заранее и держи газ до самого края.'],
};
function sink(kind = 'vltava') {
  state = 'sunk';
  player.mode = 'sunk'; player.sunkT = 0; player.sunkSide = Math.sign(player.x) || (Math.random() < 0.5 ? -1 : 1);
  player.sinkKind = kind; player.airborne = false; player.air = 0;
  player.kickT = 0; shake = 0.35;
  if (player.drone === 'active') player.drone = 'none';
  const [title, place, info] = FALL_TEXT[kind];
  if (kind === 'chasm') SND.fall(); else SND.splash();
  loseCombo(); slowmo(0.35, 0.4);
  MUSIC.jingle('fall');
  say(title, 1.6, kind === 'chasm' ? 'bad' : 'cool');
  setTimeout(() => {
    $('resTitle').textContent = title;
    $('resPlace').textContent = place;
    $('resInfo').textContent = info;
    $('result').hidden = false; $('bAgain').focus();
  }, 1800);
}
function busted() {
  state = 'busted';
  crashPlayer();
  MUSIC.jingle('bust');
  comboPts = 0; comboN = 0; comboT = 0;
  say('Попался', 1.5, 'bad');
  setTimeout(() => {
    $('resTitle').textContent = 'Попался';
    $('resPlace').textContent = 'Полиция забрала права';
    $('resInfo').textContent = 'Нарушения копятся выше 130 км/ч. Сбрось скорость, пока шкала не заполнилась, или уходи от погони: машину обгоняют на полном газу, мотоциклистов сбивают пинком.';
    $('result').hidden = false; $('bAgain').focus();
  }, 1600);
}
