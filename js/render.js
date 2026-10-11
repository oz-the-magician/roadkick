// Roadkick — Pseudo-3D renderer, effects and weather
'use strict';

/* ================= render ================= */
function project(p, camX, camY, camZ) {
  p.camera.x = p.world.x - camX;
  p.camera.y = p.world.y - camY;
  p.camera.z = p.world.z - camZ;
  p.screen.scale = CAMD / p.camera.z;
  p.screen.x = Math.round(W / 2 + p.screen.scale * p.camera.x * W / 2);
  p.screen.y = Math.round(H / 2 - p.screen.scale * p.camera.y * H / 2);
  p.screen.w = Math.round(p.screen.scale * ROADW * W / 2);
}
function poly(x1, y1, x2, y2, x3, y3, x4, y4, color) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.lineTo(x4, y4); ctx.closePath(); ctx.fill();
}
const fcBase = (c, f) => css(mixc(COL.fog, c, f));

function drawSegment(seg) {
  const { x: x1, y: y1, w: w1 } = seg.p1.screen, { x: x2, y: y2, w: w2 } = seg.p2.screen;
  const f = seg.fog, L = seg.light;
  const r1 = w1 / 6, r2 = w2 / 6;
  const lamp = seg.lamp * nt;
  const fc = lamp > 0 ? (c, ff) => fcBase(mixc(c, LAMP, lamp * 0.2), ff) : fcBase;
  if (seg.gap) {
    // nothing to ride on: a chasm or a river across the whole width
    ctx.fillStyle = fc(seg.water ? (seg.index % 2 ? COL.waterL : COL.waterD) : (seg.index % 2 ? COL.chasmL : COL.chasmD), f);
    ctx.fillRect(0, y2, W, y1 - y2);
    if (seg.water && seg.index % 4 === 0 && w1 > 12) {
      ctx.fillStyle = fc(COL.rumbleL, f * 0.5);
      for (let k = -4; k <= 4; k++) ctx.fillRect(x1 + w1 * k * 0.55, y1 - 1, Math.max(1, w1 / 10), 1);
    }
    return;
  }
  if (seg.water) {
    ctx.fillStyle = fc(seg.index % 2 ? COL.waterL : COL.waterD, f);
    ctx.fillRect(0, y2, W, y1 - y2);
    if (seg.index % 5 === 0 && w1 > 20) {        // ripples
      ctx.fillStyle = fc(COL.rumbleL, f * 0.5);
      for (let k = 0; k < 6; k++) { const xx = (x1 - w1 * (1.6 + k * 0.9)); ctx.fillRect(xx, y1 - 1, Math.max(1, w1 / 12), 1); ctx.fillRect(2 * x1 - xx, y1 - 1, Math.max(1, w1 / 12), 1); }
    }
  } else {
    ctx.fillStyle = fc(L ? COL.grassL : COL.grassD, f);
    ctx.fillRect(0, y2, W, y1 - y2);
  }
  const rc = fc(L ? COL.rumbleL : COL.rumbleD, f);
  poly(x1 - w1 - r1, y1, x1 - w1, y1, x2 - w2, y2, x2 - w2 - r2, y2, rc);
  poly(x1 + w1 + r1, y1, x1 + w1, y1, x2 + w2, y2, x2 + w2 + r2, y2, rc);
  if (seg.start) {
    const cells = 10;
    for (let k = 0; k < cells; k++) {
      const a1 = x1 - w1 + (2 * w1 * k) / cells, b1 = x1 - w1 + (2 * w1 * (k + 1)) / cells;
      const a2 = x2 - w2 + (2 * w2 * k) / cells, b2 = x2 - w2 + (2 * w2 * (k + 1)) / cells;
      poly(a1, y1, b1, y1, b2, y2, a2, y2, (k + seg.index) % 2 ? fc(COL.start, f) : 'rgb(20,18,24)');
    }
    return;
  }
  if (seg.ramp) {
    poly(x1 - w1, y1, x1 + w1, y1, x2 + w2, y2, x2 - w2, y2, fc(seg.index % 2 ? COL.rampA : COL.rampB, f));
    return;
  }
  poly(x1 - w1, y1, x1 + w1, y1, x2 + w2, y2, x2 - w2, y2, fc(L ? COL.roadL : COL.roadD, f));
  if (LEVEL.cobble && w1 > 36 && y1 - y2 >= 1) {
    // staggered cobblestone rows
    const cells = 14, cc = fc(COL.cobble, f), shift = seg.index % 2 ? 0.5 : 0;
    for (let k = 0; k < cells; k++) {
      if ((k + seg.index) % 2) continue;
      const t1 = (k + shift) / cells, t2 = (k + shift + 0.45) / cells;
      if (t2 > 1) continue;
      const a1 = x1 - w1 + 2 * w1 * t1, b1 = x1 - w1 + 2 * w1 * t2;
      const a2 = x2 - w2 + 2 * w2 * t1, b2 = x2 - w2 + 2 * w2 * t2;
      poly(a1, y1, b1, y1, b2, y2, a2, y2, cc);
    }
  }
  if (seg.kickLane && L) {
    const [xa, xb] = laneX(seg.kickLane.a, seg.kickLane.b);
    const kc = fc(COL.rampA, f), m1 = Math.max(0.8, w1 / 50), m2 = Math.max(0.8, w2 / 50);
    for (const o of [xa + 0.03, xb - 0.03]) poly(x1 + w1 * o - m1, y1, x1 + w1 * o + m1, y1, x2 + w2 * o + m2, y2, x2 + w2 * o - m2, y2, kc);
  }
  if (LEVEL.rails) {
    const rc2 = fc(COL.rail, f), rw1 = Math.max(0.6, w1 / 90), rw2 = Math.max(0.6, w2 / 90);
    for (const o of [-0.11, 0.11]) poly(x1 + w1 * o - rw1, y1, x1 + w1 * o + rw1, y1, x2 + w2 * o + rw2, y2, x2 + w2 * o - rw2, y2, rc2);
  }
  if (L) {
    const l1 = w1 / 32, l2 = w2 / 32, lw1 = 2 * w1 / LANES, lw2 = 2 * w2 / LANES;
    const lc = fc(COL.lane, f);
    let lx1 = x1 - w1 + lw1, lx2 = x2 - w2 + lw2;
    for (let n = 1; n < LANES; n++, lx1 += lw1, lx2 += lw2) poly(lx1 - l1 / 2, y1, lx1 + l1 / 2, y1, lx2 + l2 / 2, y2, lx2 - l2 / 2, y2, lc);
  }
}

function drawKicker(seg, alpha) {
  const k = seg.kicker, p1 = seg.p1.screen, p2 = seg.p2.screen;
  const [xa, xb] = laneX(k.a, k.b);
  const e = 0.035;
  const lx1 = p1.x + p1.w * (xa + e), rx1 = p1.x + p1.w * (xb - e);
  const lx2 = p2.x + p2.w * (xa + e), rx2 = p2.x + p2.w * (xb - e);
  const ty1 = p1.y - p1.scale * k.h * k.t1 * H / 2, ty2 = p2.y - p2.scale * k.h * k.t2 * H / 2;
  const f = seg.fog;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath(); ctx.rect(0, 0, W, seg.clip); ctx.clip();
  const wall = fcBase(mixc(COL.rampB, [0, 0, 0], 0.2), f);
  poly(lx1, p1.y, lx1, ty1, lx2, ty2, lx2, p2.y, wall);
  poly(rx1, p1.y, rx1, ty1, rx2, ty2, rx2, p2.y, wall);
  if (k.t2 === 1) {                                 // back face of the lip, seen over the gap
    poly(lx2, ty2, rx2, ty2, rx2, p2.y, lx2, p2.y, fcBase(COL.rampB, f));
  }
  poly(lx1, ty1, rx1, ty1, rx2, ty2, lx2, ty2, fcBase(seg.index % 2 ? COL.rampA : COL.rampB, f));
  ctx.restore();
}
function drawPair(pr, scale, x, y, ax, clipY, alpha) {
  if (!(scale > 0) || !isFinite(scale)) return;
  const img = pr.d, k = pr.ppu * scale * W / 2;
  const dw = Math.round(img.width * k), dh = Math.round(img.height * k);
  if (dw < 1 || dh < 1 || dw > W * 4) return;
  const dx = Math.round(x + dw * ax), dy = Math.round(y - dh);
  const clipH = clipY ? Math.max(0, dy + dh - clipY) : 0;
  if (clipH >= dh) return;
  const sh = img.height * (dh - clipH) / dh;
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, 0, 0, img.width, sh, dx, dy, dw, dh - clipH);
  if (nt > 0.01) { ctx.globalAlpha = alpha * nt; ctx.drawImage(pr.n, 0, 0, img.width, sh, dx, dy, dw, dh - clipH); }
  ctx.globalAlpha = 1;
}

function riderSprite(e) {
  if (e.kind === 'police' && e.sub === 'car') return e.frames[Math.floor(raceTime * 6) % 2];
  const set = e.kind === 'police' ? e.frames[Math.floor(raceTime * 6) % 2] : e.set;
  if (e.state === 'down') return set.down;
  if (e.kickT > 0) return e.kickSide < 0 ? set.kl : set.kr;
  return set.base;
}
function drawEntity(e, seg) {
  const z = U.wrap(e.z, trackLength);
  const pct = (z % SEG) / SEG;
  const p1 = seg.p1.screen, p2 = seg.p2.screen;
  const scale = U.lerp(p1.scale, p2.scale, pct);
  const x = U.lerp(p1.x, p2.x, pct) + scale * e.offset * ROADW * W / 2;
  const y = U.lerp(p1.y, p2.y, pct);
  let spr, lift = seg.gap ? Math.sin(Math.PI * seg.gapT) * seg.gapLen * SEG * 0.2 : 0, alphaK = 1;
  if (e.kind === 'traffic') spr = e.spr;
  else if (e.kind === 'pickup') { if (!e.active) return; spr = e.type === 'nitro' ? SPR.nitroPickup : SPR.dronePickup[Math.floor(raceTime * 20) % 2]; lift = 25 + Math.sin(raceTime * 4 + e.z) * 25; }
  else if (e.kind === 'shot') { spr = SPR.shot; lift = e.h; }
  else if (e.kind === 'fx') {
    if (e.fxType === 'smoke' || e.fxType === 'sand') { spr = e.fxType === 'sand' ? SPR.dustSand : SPR.dustSmoke; lift = e.h; alphaK = U.clamp(e.life / (e.life0 || 0.7), 0, 1) * 0.5; }
    else { spr = SPR.splat; lift = e.h; alphaK = U.clamp(e.life / 0.4, 0, 1); }
  }
  else spr = riderSprite(e);
  const ly = y - scale * lift * H / 2;
  // things passing right by the camera (behind the bike) fade out instead of filling the screen
  const camDist = U.lerp(seg.p1.camera.z, seg.p2.camera.z, pct);
  if (camDist < 650) return;
  const near = U.clamp((camDist - 650) / (PLAYERZ - 800), 0, 1);
  const alpha = alphaK * U.clamp(seg.fog * 2, 0, 1) * (0.4 + 0.6 * near);
  drawPair(spr, scale, x, ly, spr.ax, seg.clip, alpha);
  if (e.kind === 'rival' && ly < seg.clip + 40) drawRivalExtras(e, spr, scale, x, ly, alpha);
}

function drawBackground(playerY) {
  for (const l of BG) {
    const iw = l.d.width;
    const dx = -Math.round(l.off * iw);
    const dy = Math.round(U.clamp(playerY / SEG * l.sy, -30, 30)) - 30;
    ctx.drawImage(l.d, dx, dy); ctx.drawImage(l.d, dx + iw, dy);
    if (nt > 0.01) { ctx.globalAlpha = nt; ctx.drawImage(l.n, dx, dy); ctx.drawImage(l.n, dx + iw, dy); ctx.globalAlpha = 1; }
  }
}

let BEAM = null;
function buildBeam() {
  // soft light cone, precomputed once: brightness fades along the beam and falls off
  // smoothly to the sides (gaussian), so there are no hard edges
  const k = SPR.player.base.ppu * PSCALE * W / 2;
  const riderH = SPR.player.base.d.height * k;
  const oy = Math.round(PLAYER_Y - riderH * 0.5);
  const fy = Math.round(H * 0.5);
  const top = fy - 12, bottom = oy + 14;
  const c = mk(W, bottom - top), g = c.getContext('2d');
  const img = g.createImageData(c.width, c.height), d = img.data;
  const len = oy - fy;
  for (let y = top; y < bottom; y++) {
    const t = (oy - y) / len;                       // 0 at the wheel, 1 far ahead
    for (let x = 0; x < W; x++) {
      const dx = x - W / 2;
      let v = 0;
      if (t > -0.3) {
        const tt = Math.max(0, t);
        const half = 14 + 150 * Math.pow(tt, 0.85);   // cone widens with distance
        const along = Math.min(1, (t + 0.3) / 0.45) * Math.pow(Math.max(0, 1 - tt / 1.2), 1.6);
        v = along * Math.exp(-2.2 * (dx / half) * (dx / half));
      }
      // warm pool on the asphalt right in front of the wheel
      const px = dx / 60, py = (y - (oy - 24)) / 14;
      v += 0.4 * Math.exp(-(px * px + py * py) * 1.6);
      v = Math.min(1, v);
      const o = ((y - top) * W + x) * 4;
      d[o] = 255; d[o + 1] = 205 + 25 * v; d[o + 2] = 130 + 40 * v; d[o + 3] = Math.round(v * 175);
    }
  }
  g.putImageData(img, 0, 0);
  return { c, top };
}
function drawHeadlight() {
  if (nt < 0.02) return;
  if (!BEAM) BEAM = buildBeam();
  // fixed beam: always straight ahead from the front of the bike
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = nt;
  ctx.drawImage(BEAM.c, 0, BEAM.top);
  ctx.restore();
}

function drawSinking() {
  const t = player.sunkT, set = SPR.player, pr = set.base;
  const k = pr.ppu * PSCALE * W / 2;
  const dw = Math.round(pr.d.width * k), dh = Math.round(pr.d.height * k);
  const cx = Math.round(W / 2), wy = PLAYER_Y;
  // rider tips over and sinks below the waterline
  if (player.sinkKind === 'chasm') {
    // tumble down into the void, getting smaller
    if (t < 1.6) {
      const sc = Math.max(0.05, 1 - t * 0.7);
      ctx.save();
      ctx.translate(cx + player.sunkSide * t * 20, wy + t * t * 70);
      ctx.rotate(player.sunkSide * t * 5);
      ctx.globalAlpha = Math.max(0, 1 - t / 1.6);
      ctx.drawImage(pr.d, Math.round(-dw * sc / 2), Math.round(-dh * sc), Math.round(dw * sc), Math.round(dh * sc));
      ctx.restore();
    }
    return;
  }
  if (t < 1.2) {
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, wy - 2); ctx.clip();
    ctx.translate(cx, wy + Math.min(dh, t * t * dh * 1.6));
    ctx.rotate(player.sunkSide * Math.min(0.9, t * 2));
    ctx.drawImage(pr.d, Math.round(dw * pr.ax), -dh, dw, dh);
    if (nt > 0.01) { ctx.globalAlpha = nt * 0.7; ctx.drawImage(pr.n, Math.round(dw * pr.ax), -dh, dw, dh); }
    ctx.restore();
  }
  // splash column
  if (t < 1.4) {
    const sc = 3 + Math.min(1, t * 3) * 2;
    const sw = SPR.splash.width * sc, sh = SPR.splash.height * sc * Math.min(1, t * 4);
    ctx.globalAlpha = t < 0.9 ? 1 : Math.max(0, 1 - (t - 0.9) / 0.5);
    ctx.drawImage(SPR.splash, Math.round(cx - sw / 2), Math.round(wy - sh + 4), Math.round(sw), Math.round(sh));
    ctx.globalAlpha = 1;
  }
  // ripples spreading on the surface
  for (let i = 0; i < 3; i++) {
    const rt = t - i * 0.25;
    if (rt <= 0) continue;
    const rw = 20 + rt * 70, rh = 3 + rt * 6;
    ctx.globalAlpha = Math.max(0, 0.7 - rt * 0.35);
    ctx.strokeStyle = '#d8f0ff'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(cx, wy - 2, rw, rh, 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // bubbles
  if (t > 0.6 && t < 2.6) {
    ctx.fillStyle = '#e8f6ff';
    for (let i = 0; i < 5; i++) {
      const bt = (t * 1.3 + i * 0.37) % 1;
      ctx.fillRect(Math.round(cx - 10 + i * 5 + Math.sin(t * 5 + i) * 2), Math.round(wy - 3 - bt * 6), 1, 1);
    }
  }
}
function drawPlayer() {
  if (player.mode === 'sunk') { drawSinking(); return; }
  const set = SPR.player;
  const pr = player.mode === 'crash' ? set.down : player.kickT > 0 ? (player.kickSide < 0 ? set.kl : set.kr) : set.base;
  const k = pr.ppu * PSCALE * W / 2;
  const dw = Math.round(pr.d.width * k), dh = Math.round(pr.d.height * k);
  const pct = player.speed / MAXSPEED;
  const rough = Math.abs(player.x) > 1 ? 2 : (LEVEL.cobble ? 2.2 : 0.6);
  const bounce = jit.bounce;
  if (player.air > 5) {
    // shadow on the road under the flying bike
    const sy = Math.round(PLAYER_Y + PSCALE * 0.6 * player.air * H / 2);
    const sk = Math.max(0.35, 1 - player.air / 3000);
    ctx.fillStyle = `rgba(0,0,0,${0.35 * sk})`;
    ctx.beginPath(); ctx.ellipse(W / 2, sy - 1, dw * 0.45 * sk, 3 * sk + 1, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.save();
  ctx.translate(Math.round(W / 2), PLAYER_Y + (player.air > 5 ? -airPx() : bounce));
  ctx.rotate(player.mode === 'crash' ? 0 : player.lean + (player.airborne ? player.trickRot : 0));
  const x = Math.round(dw * pr.ax);
  ctx.drawImage(pr.d, x, -dh, dw, dh);
  if (nt > 0.01) { ctx.globalAlpha = nt * 0.7; ctx.drawImage(pr.n, x, -dh, dw, dh); }
  ctx.globalAlpha = 1;
  if (player.weapon && player.mode === 'ride') drawWeapon(player.weapon.type, 0, -dh + 12 * k, k, player.kickT > 0 ? player.kickSide : 1, player.kickT > 0);
  ctx.restore();
  if (player.nitro === 'active' && player.mode === 'ride') drawNitroFlame();
  drawDrone();
}
function drawNitroFlame() {
  // soft additive blue flame, like the headlight cone: gradients, no hard edges
  const y0 = PLAYER_Y - (player.air > 5 ? airPx() : 0) - 2;
  const fx = W / 2;
  const flick = 0.82 + Math.sin(performance.now() / 40) * 0.1 + ((jit.seed % 97) / 97) * 0.12;
  const len = 26 * flick, wob = Math.sin(performance.now() / 70) * 1.5;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  // outer haze
  let g = ctx.createRadialGradient(fx, y0 + len * 0.35, 1, fx, y0 + len * 0.35, len);
  g.addColorStop(0, 'rgba(120,220,255,0.55)');
  g.addColorStop(0.5, 'rgba(60,160,255,0.28)');
  g.addColorStop(1, 'rgba(30,90,220,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(fx, y0 + len * 0.4, 7 * flick, len * 0.8, 0, 0, Math.PI * 2); ctx.fill();
  // bright tongue
  g = ctx.createLinearGradient(fx, y0 - 4, fx, y0 + len);
  g.addColorStop(0, 'rgba(255,255,255,0.95)');
  g.addColorStop(0.35, 'rgba(150,225,255,0.85)');
  g.addColorStop(0.7, 'rgba(70,150,255,0.5)');
  g.addColorStop(1, 'rgba(50,110,230,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(fx - 4.5, y0 - 4);
  ctx.quadraticCurveTo(fx - 5.5 * flick, y0 + len * 0.5, fx + wob, y0 + len);
  ctx.quadraticCurveTo(fx + 5.5 * flick, y0 + len * 0.5, fx + 4.5, y0 - 4);
  ctx.closePath(); ctx.fill();
  // white-hot core near the exhaust
  g = ctx.createRadialGradient(fx, y0 + 2, 0, fx, y0 + 2, 8);
  g.addColorStop(0, 'rgba(255,255,255,0.95)');
  g.addColorStop(1, 'rgba(150,220,255,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(fx, y0 + 2, 8, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function drawDrone() {
  if (player.drone !== 'active') return;
  const t = player.droneT;
  if (t < 3 && Math.floor(t * 8) % 2) return;            // blink before it leaves
  const fr = SPR.drone[Math.floor(performance.now() / 50) % 2];
  const dw = fr.d.width * 2, dh = fr.d.height * 2;
  const bob = Math.round(Math.sin(performance.now() / 260) * 2);
  const x = Math.round(W / 2 - dw / 2 + Math.sin(performance.now() / 700) * 3);
  const y = Math.round(droneScreenY() - airPx() - dh / 2 + bob);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(x + 6, y + dh + 4, dw - 12, 2);
  ctx.drawImage(fr.d, x, y, dw, dh);
  if (nt > 0.01) { ctx.globalAlpha = nt * 0.6; ctx.drawImage(fr.n, x, y, dw, dh); ctx.globalAlpha = 1; }
  // timer bar under the drone
  const w = dw - 8, fill = Math.round(w * t / DRONE_TIME);
  ctx.fillStyle = 'rgba(20,12,28,0.7)'; ctx.fillRect(x + 4, y - 5, w, 3);
  ctx.fillStyle = '#ff3fa4'; ctx.fillRect(x + 4, y - 5, fill, 3);
}

function drawProgress() {
  const x0 = Math.round(W * 0.3), w = Math.round(W * 0.4), y = 10, total = LAPS * trackLength;
  ctx.fillStyle = 'rgba(20,12,28,0.6)'; ctx.fillRect(x0 - 2, y - 3, w + 4, 7);
  ctx.fillStyle = '#f3e6c4'; ctx.fillRect(x0, y, w, 1);
  ctx.fillRect(x0 + w / 2, y - 2, 1, 5);
  const dot = (d, col, s) => {
    const px = x0 + Math.round(U.clamp((d - PLAYERZ) / total, 0, 1) * w);
    ctx.fillStyle = col; ctx.fillRect(px - (s >> 1), y - (s >> 1), s, s);
  };
  for (const e of rivals) dot(e.dist, '#9a8fae', 3);
  for (const c of cops) if (c.state === 'ride') dot(c.dist, (raceTime * 4 | 0) % 2 ? '#3a7bff' : '#ff3030', c.sub === 'car' ? 4 : 3);
  dot(bikeZ(), '#ffae2b', 5);
}

function render() {
  computePalette(nt);
  const position = U.wrap(player.dist, trackLength);
  const base = findSegment(position);
  const basePct = (position % SEG) / SEG;
  const pSeg = findSegment(position + PLAYERZ);
  const pPct = (U.wrap(position + PLAYERZ, trackLength) % SEG) / SEG;
  const playerY = U.lerp(pSeg.p1.world.y, pSeg.p2.world.y, pPct);

  ctx.save();
  if (shake > 0 && !paused) ctx.translate(jit.sx, jit.sy);
  // camera leans into corners and pulls back with speed (a slight scale keeps the edges covered)
  const spd = player.speed / MAXSPEED;
  const steerIn = (keys.left ? -1 : 0) + (keys.right ? 1 : 0);
  const rollTarget = reducedMotion ? 0 : U.clamp(-pSeg.curve * spd * 0.011 + steerIn * spd * 0.02, -0.07, 0.07);
  if (!paused) camRoll += (rollTarget - camRoll) * 0.08;
  const zoomTarget = reducedMotion ? 1.03 : 1.1 - 0.06 * U.clamp(spd, 0, 1.3);
  if (!paused) camZoom += (zoomTarget - camZoom) * 0.06;
  nitroFx += ((player.nitro === 'active' && player.mode === 'ride' ? 1 : 0) - nitroFx) * 0.08;
  // the lean/zoom is applied to the finished frame by the compositor (CSS), not to the low-res pixels,
  // so pixel art never gets resampled frame to frame (that's what caused shimmer/flicker)
  const qr = Math.round(camRoll * 500) / 500, qz = Math.round(camZoom * 400) / 400;
  const tf = state === 'menu' ? 'none' : `rotate(${qr}rad) scale(${qz})`;
  if (canvas.style.transform !== tf) { canvas.style.transform = tf; talkLayer.style.transform = tf; }
  bubblesFrame.length = 0;

  drawBackground(playerY);

  let maxy = H, x = 0, dx = -(base.curve * basePct);
  const vis = weather ? U.lerp(1, weather.vis, weatherLvl) : 1;   // fog/sand cut it to 0.5 = half the horizon
  const fogDen = FOGD / (vis * vis);
  const camX = player.x * ROADW, camY = playerY + CAMH + player.air * 0.6;
  for (let n = 0; n < DRAW; n++) {
    const seg = segments[(base.index + n) % segments.length];
    seg.looped = seg.index < base.index;
    seg.fog = U.fog(n / DRAW, fogDen);
    seg.clip = maxy;
    const camZ = position - (seg.looped ? trackLength : 0);
    project(seg.p1, camX - x, camY, camZ);
    project(seg.p2, camX - x - dx, camY, camZ);
    x += dx; dx += seg.curve;
    if (seg.p1.camera.z <= CAMD || seg.p2.screen.y >= seg.p1.screen.y || seg.p2.screen.y >= maxy) continue;
    drawSegment(seg);
    maxy = seg.p1.screen.y;
  }

  drawHeadlight();

  // bucket moving things by segment
  const bucket = new Map();
  const add = e => {
    const i = Math.floor(U.wrap(e.z, trackLength) / SEG);
    let arr = bucket.get(i); if (!arr) bucket.set(i, arr = []); arr.push(e);
  };
  traffic.forEach(add); rivals.forEach(add); cops.forEach(add); pickups.forEach(add); shots.forEach(add); fx.forEach(add);

  const bz = U.wrap(position + PLAYERZ, trackLength);
  for (let n = DRAW - 1; n > 0; n--) {
    const seg = segments[(base.index + n) % segments.length];
    if (seg.p1.camera.z <= CAMD) continue;
    const alpha = U.clamp(seg.fog * 2, 0, 1);
    // roadside objects between the camera and the bike fade out so they never hide the rider
    const cz = seg.p1.camera.z;
    const nearK = cz >= PLAYERZ - 150 ? 1 : cz < 650 ? 0 : 0.15 + 0.85 * (cz - 650) / (PLAYERZ - 800);
    if (seg.kicker && nearK > 0) drawKicker(seg, nearK);
    if (nearK > 0) for (const s of seg.sprites) {
      const scale = seg.p1.screen.scale;
      const sx = seg.p1.screen.x + scale * s.offset * ROADW * W / 2;
      drawPair(s.spr, scale, sx, seg.p1.screen.y, s.offset < 0 ? -1 : 0, seg.clip, alpha * nearK);
    }
    const list = bucket.get(seg.index);
    if (seg === pSeg) {
      const rel = e => U.wrapSigned(U.wrap(e.z, trackLength) - bz, trackLength);
      const ahead = list ? list.filter(e => rel(e) >= 0).sort((a, b) => rel(b) - rel(a)) : [];
      const behind = list ? list.filter(e => rel(e) < 0).sort((a, b) => rel(b) - rel(a)) : [];
      ahead.forEach(e => drawEntity(e, seg));
      drawPlayer();
      behind.forEach(e => drawEntity(e, seg));
    } else if (list) {
      list.sort((a, b) => U.wrap(b.z, trackLength) - U.wrap(a.z, trackLength));
      list.forEach(e => drawEntity(e, seg));
    }
  }

  if (weather && weatherLvl > 0.01) drawWeather();
  if (nitroFx > 0.02) drawNitroTunnel();
  if (state === 'race') drawPoliceUI();
  // speed lines
  const pct = player.speed / MAXSPEED;
  if ((pct > 0.85 || player.nitro === 'active') && player.mode === 'ride') {
    ctx.fillStyle = `rgba(255,255,255,${(pct - 0.85) * 1.6})`;
    for (let i = 0; i < 6; i++) {
      const r = rng(jit.seed + i * 7919);
      const side = i % 2 ? 1 : -1, yy = 150 + r() * 110, xx = W / 2 + side * (150 + r() * 90);
      ctx.fillRect(Math.round(xx), Math.round(yy), 1, 8 + (r() * 10 | 0));
    }
  }
  ctx.restore();
  if (state !== 'menu') drawProgress();
  syncBubbles();
}

function drawNitroTunnel() {
  // radial streaks rushing out from the vanishing point plus a cool vignette
  const cx = W / 2, cy = H * 0.5, t = performance.now();
  ctx.save();
  ctx.globalAlpha = nitroFx;
  const v = ctx.createRadialGradient(cx, cy, H * 0.25, cx, cy, W * 0.62);
  v.addColorStop(0, 'rgba(10,40,70,0)'); v.addColorStop(1, 'rgba(10,40,80,0.55)');
  ctx.fillStyle = v; ctx.fillRect(-20, -20, W + 40, H + 40);
  ctx.strokeStyle = 'rgba(200,245,255,0.55)'; ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < 36; i++) {
    const a = i * 2.39996 + (i % 3);
    const r0 = 60 + ((t * 0.6 + i * 53) % 220);
    const r1 = r0 + 14 + (i % 4) * 6;
    ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0 * 0.62);
    ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1 * 0.62);
  }
  ctx.stroke();
  ctx.restore();
}
function drawPoliceUI() {
  const t = performance.now();
  const flash = Math.floor(t / 160) % 2;
  // ring over the rider: how close the patrol is to arresting you
  if (bustT > 0.03) {
    const k = SPR.player.base.ppu * PSCALE * W / 2;
    const riderH = SPR.player.base.d.height * k;
    const cx = W / 2, cy = Math.round(PLAYER_Y - riderH - 12 - airPx());
    const p = U.clamp(bustT / BUST_TIME, 0, 1);
    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(20,12,28,0.75)';
    ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = p > 0.66 ? (flash ? '#ff3030' : '#ffffff') : '#ff3030';
    ctx.beginPath(); ctx.arc(cx, cy, 9, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); ctx.stroke();
    ctx.fillStyle = flash ? '#3a7bff' : '#ff3030';
    ctx.fillRect(cx - 2, cy - 2, 4, 4);
    ctx.restore();
  }
  // chevrons along the bottom edge for patrols that are still behind the camera
  const b = bikeZ();
  for (const c of cops) {
    if (c.state !== 'ride' || c.retreat) continue;
    const dz = c.dist - b;
    if (dz > -PLAYERZ * 0.85) continue;          // already visible on screen
    const x = Math.round(U.clamp(W / 2 + (c.offset - player.x) * W * 0.28, 14, W - 14));
    const near = U.clamp(1 - (-dz - PLAYERZ) / (SEG * 30), 0, 1);
    const y = H - 6 - Math.round(near * 6);
    ctx.fillStyle = (Math.floor(t / 200) + (c.sub === 'car' ? 0 : 1)) % 2 ? '#ff3030' : '#3a7bff';
    for (let r = 0; r < 5; r++) ctx.fillRect(x - r, y + r - 4, r * 2 + 1, 1);   // ▲
    ctx.fillStyle = '#140e18'; ctx.fillRect(x - 1, y + 2, 3, 1);
  }
}
function drawWeather() {
  const w = weather, t = performance.now();
  ctx.save(); ctx.globalAlpha = weatherLvl;
  // colour wash for the whole scene
  ctx.fillStyle = w.overlay;
  ctx.fillRect(0, 0, W, H);
  // fog and sandstorm add a dense haze band over the horizon so the distance is clearly lost
  if (w.kind === 'fog' || w.kind === 'sand') {
    const rgb = w.kind === 'fog' ? '210,214,222' : '212,158,92';
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0.00, `rgba(${rgb},0.55)`);
    g.addColorStop(0.44, `rgba(${rgb},0.95)`);   // horizon: fully socked in
    g.addColorStop(0.72, `rgba(${rgb},0.45)`);
    g.addColorStop(1.00, `rgba(${rgb},0.0)`);    // clear right in front of the bike
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  if (w.kind === 'rain') {
    // wet-road sheen: a cool bright band low on the screen
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(0, H * 0.55, 0, H);
    g.addColorStop(0, 'rgba(90,120,180,0)'); g.addColorStop(1, 'rgba(120,150,210,0.18)');
    ctx.fillStyle = g; ctx.fillRect(0, H * 0.55, W, H * 0.45);
    ctx.restore();
    // slanted rain streaks
    ctx.strokeStyle = 'rgba(190,210,255,0.5)'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 80; i++) {
      const x = (i * 149 + t * 0.9) % (W + 40) - 20;
      const y = (i * 97 + t * 2.2) % (H + 40) - 20;
      ctx.moveTo(x, y); ctx.lineTo(x - 5, y + 16);
    }
    ctx.stroke();
    // fine drizzle specks flitting across the screen
    ctx.fillStyle = 'rgba(210,225,255,0.7)';
    for (let i = 0; i < 150; i++) {
      const x = (i * 71 - t * 1.1) % (W + 20) - 10 + Math.sin(i) * 2;
      const y = (i * 113 + t * 3.4) % (H + 20) - 10;
      ctx.fillRect(x, y, 1, 2);
    }
  } else if (w.kind === 'sand') {
    // fast horizontal sand streaks
    ctx.strokeStyle = 'rgba(232,196,138,0.5)'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 70; i++) {
      const y = (i * 71 + t * 0.4) % H;
      const x = (i * 233 - t * 3.2) % (W + 60) - 30;
      const len = 10 + (i % 5) * 6;
      ctx.moveTo(x, y); ctx.lineTo(x + len, y + 1);
    }
    ctx.stroke();
    // drifting haze blobs
    ctx.fillStyle = 'rgba(210,150,70,0.10)';
    for (let i = 0; i < 4; i++) {
      const x = ((i * 320 - t * 0.6) % (W + 200)) - 100;
      ctx.beginPath(); ctx.ellipse(x, H * 0.5 + i * 30, 120, 40, 0, 0, Math.PI * 2); ctx.fill();
    }
    // fine blowing sand grains
    for (let i = 0; i < 170; i++) {
      const y = (i * 53 + Math.sin(i) * 6 + t * 0.05) % H;
      const x = (i * 197 - t * 4.5) % (W + 20) - 10;
      ctx.fillStyle = i % 3 ? 'rgba(238,206,150,0.7)' : 'rgba(200,150,90,0.6)';
      ctx.fillRect(x, y, 2, 1);
    }
  } else {
    // fog: drifting mist bands
    ctx.fillStyle = 'rgba(210,214,222,0.10)';
    for (let i = 0; i < 4; i++) {
      const x = ((i * 300 - t * 0.5) % (W + 240)) - 120;
      const y = H * 0.35 + i * 45;
      ctx.beginPath(); ctx.ellipse(x, y, 160, 34, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}
