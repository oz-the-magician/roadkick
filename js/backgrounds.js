// Roadkick — Parallax sky and horizon layers for every track
'use strict';

/* ================= background layers ================= */
function makeSky(night) {
  const c = mk(W * 2, H + 60), g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 200);
  if (night) { gr.addColorStop(0, '#03040c'); gr.addColorStop(0.6, '#0e1236'); gr.addColorStop(1, '#2c2254'); }
  else { gr.addColorStop(0, '#3f97d8'); gr.addColorStop(0.55, '#8ccaee'); gr.addColorStop(1, '#f7d8a6'); }
  g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
  const r = rng(night ? 7 : 3);
  if (night) {
    for (let i = 0; i < 260; i++) {
      const b = 120 + r() * 135 | 0; g.fillStyle = `rgb(${b},${b},${Math.min(255, b + 20)})`;
      g.fillRect(r() * c.width | 0, r() * 150 | 0, 1, 1);
    }
    disc(g, 150, 42, 11, '#f4efd8', '#c9c3aa', -0.4);
    disc(g, 150 + 480, 42, 11, '#f4efd8', '#c9c3aa', -0.4);
  } else {
    disc(g, 300, 64, 18, '#fff4c8', '#ffe39a', 0);
    disc(g, 780, 64, 18, '#fff4c8', '#ffe39a', 0);
    for (let i = 0; i < 9; i++) cloud(g, r() * c.width, 20 + r() * 70, 18 + r() * 30, c.width, r);
  }
  return c;
}
function disc(g, cx, cy, rad, col, shade, sh) {
  for (let y = -rad; y <= rad; y++) for (let x = -rad; x <= rad; x++) {
    if (x * x + y * y > rad * rad) continue;
    g.fillStyle = (sh && (x / rad + y / rad * 0.3) < sh) ? shade : col;
    g.fillRect(cx + x, cy + y, 1, 1);
  }
}
function cloud(g, cx, cy, size, wrapW, r) {
  const puffs = 4 + (r() * 3 | 0);
  for (let p = 0; p < puffs; p++) {
    const px = cx + (p - puffs / 2) * size * 0.45, py = cy + (r() - 0.5) * size * 0.25, rad = size * (0.3 + r() * 0.25);
    for (let y = -rad; y <= rad * 0.6; y++) for (let x = -rad; x <= rad; x++) {
      if (x * x + y * y * 2.2 > rad * rad) continue;
      g.fillStyle = y > rad * 0.2 ? '#dbe7f0' : '#ffffff';
      g.fillRect(Math.floor(U.wrap(px + x, wrapW)), Math.floor(py + y), 1, 1);
    }
  }
}
function makeRidge(night, far) {
  const iw = W * 2, c = mk(iw, H + 60), g = c.getContext('2d');
  const r = rng(far ? 11 : 17);
  const waves = far ? [[2, 26, 1], [5, 14, 2], [11, 7, 3], [23, 3, 4]] : [[3, 10, 5], [7, 6, 1], [13, 3, 2]];
  const base = far ? 150 : 162;
  const tops = [];
  for (let x = 0; x < iw; x++) {
    let h = 0;
    for (const [k, amp, ph] of waves) h += amp * (1 + Math.sin(x * k * 2 * Math.PI / iw + ph));
    tops.push(Math.round(base - h - (far ? 20 : 8)));
  }
  for (let x = 0; x < iw; x++) {
    const t = tops[x];
    if (far) {
      const slope = tops[(x + 4) % iw] - tops[(x - 4 + iw) % iw];
      g.fillStyle = night ? (slope > 0 ? '#1c2444' : '#161c38') : (slope > 0 ? '#8aa8c4' : '#7593b0');
      g.fillRect(x, t, 1, c.height - t);
      if (t < 72) { g.fillStyle = night ? '#4a5270' : '#f1f5f8'; g.fillRect(x, t, 1, Math.round((72 - t) * 0.6) + 1); }
    } else {
      g.fillStyle = night ? '#101d18' : '#5b9a45'; g.fillRect(x, t, 1, c.height - t);
      g.fillStyle = night ? '#0c1612' : '#4c8a3a'; g.fillRect(x, t + 8 + ((x >> 3) % 3), 1, c.height);
    }
  }
  if (!far) {
    for (let i = 0; i < 140; i++) {
      const x = r() * iw | 0, t = tops[x], hgt = 5 + (r() * 7 | 0);
      g.fillStyle = night ? '#08110d' : '#2f6a33';
      for (let y = 0; y < hgt; y++) {
        const half = Math.round((y / hgt) * 2.5);
        for (let dx = -half; dx <= half; dx++) g.fillRect(U.wrap(x + dx, iw), t - hgt + y + 2, 1, 1);
      }
    }
  }
  return c;
}
function makeCitySky() {
  const c = mk(W * 2, H + 60), g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 190);
  gr.addColorStop(0, '#05041a'); gr.addColorStop(0.55, '#170f3a'); gr.addColorStop(1, '#4a1f55');
  g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
  const r = rng(31);
  for (let i = 0; i < 90; i++) { const b = 90 + r() * 90 | 0; g.fillStyle = `rgb(${b},${b},${b + 30})`; g.fillRect(r() * c.width | 0, r() * 90 | 0, 1, 1); }
  disc(g, 380, 38, 9, '#f1e6d0', '#c8bca8', -0.3);
  disc(g, 860, 38, 9, '#f1e6d0', '#c8bca8', -0.3);
  return c;
}
function makeSkyline(far) {
  const iw = W * 2, c = mk(iw, H + 60), g = c.getContext('2d'), r = rng(far ? 41 : 43);
  const base = far ? 168 : 178;
  // city glow haze near the horizon
  if (far) { const hz = g.createLinearGradient(0, 110, 0, 175); hz.addColorStop(0, 'rgba(255,90,160,0)'); hz.addColorStop(1, 'rgba(255,90,160,0.18)'); g.fillStyle = hz; g.fillRect(0, 110, iw, 65); }
  let x = 0;
  while (x < iw) {
    let bw = Math.round(far ? 10 + r() * 18 : 16 + r() * 28);
    if (x + bw > iw) bw = iw - x;
    const bh = Math.round(far ? 30 + r() * 70 : 30 + r() * 75);
    const top = base - bh;
    g.fillStyle = far ? '#1a1434' : '#0c0a1c';
    g.fillRect(x, top, bw, c.height - top);
    const wins = far ? ['#8a7650', '#5a7090', '#a07a60'] : ['#ffd98a', '#9fd8ff', '#ff9ad8', '#ffe7b0'];
    const step = far ? 3 : 4;
    for (let wy = top + 3; wy < base + 10; wy += step) for (let wx = x + 2; wx < x + bw - 2; wx += step) {
      if (r() < (far ? 0.16 : 0.22)) { g.fillStyle = wins[Math.floor(r() * wins.length)]; g.fillRect(wx, wy, far ? 1 : 2, far ? 1 : 2); }
    }
    if (r() < 0.35) { g.fillStyle = '#ff2a2a'; g.fillRect(x + (bw >> 1), top - 4, 1, 1); g.fillStyle = far ? '#1a1434' : '#0c0a1c'; g.fillRect(x + (bw >> 1), top - 3, 1, 3); }
    if (!far && r() < 0.3) { g.fillStyle = pick(['#ff3fa4', '#3ff0ff', '#b46bff']); g.fillRect(x + 1, top + 1, bw - 2, 1); }
    x += bw + (r() < 0.25 ? 2 : 0);
  }
  return c;
}
function makeDesertSky(night) {
  const c = mk(W * 2, H + 60), g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 200);
  if (night) { gr.addColorStop(0, '#04030e'); gr.addColorStop(0.6, '#141236'); gr.addColorStop(1, '#3a2448'); }
  else { gr.addColorStop(0, '#3e8fd0'); gr.addColorStop(0.5, '#9ccbe6'); gr.addColorStop(1, '#fbd9a0'); }
  g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
  const r = rng(night ? 61 : 63);
  if (night) {
    for (let i = 0; i < 420; i++) {
      const b = 110 + r() * 145 | 0; g.fillStyle = `rgb(${b},${b},${Math.min(255, b + 15)})`;
      g.fillRect(r() * c.width | 0, r() * 160 | 0, 1, 1);
    }
    disc(g, 700, 50, 12, '#f6f0da', '#cbc4aa', -0.5);
    disc(g, 220, 50, 12, '#f6f0da', '#cbc4aa', -0.5);
  } else {
    for (const cx of [260, 740]) { disc(g, cx, 88, 28, '#fff2c8', '#fff2c8', 0); disc(g, cx, 88, 22, '#fffbe8', '#fffbe8', 0); }
    for (let i = 0; i < 4; i++) cloud(g, r() * c.width, 24 + r() * 30, 14 + r() * 14, c.width, r);
  }
  return c;
}
function makeMesas(night) {
  const iw = W * 2, c = mk(iw, H + 60), g = c.getContext('2d'), r = rng(71);
  const base = 158, tops = new Array(iw).fill(base);
  let x = 0;
  while (x < iw) {
    x += 18 + (r() * 70 | 0);
    const w = 24 + (r() * 90 | 0), h = 18 + (r() * 46 | 0), sl = 4 + (r() * 7 | 0);
    for (let i = 0; i < w + 2 * sl; i++) {
      const hh = i < sl ? h * i / sl : i >= w + sl ? h * (w + 2 * sl - i) / sl : h;
      const xx = (x + i) % iw;
      tops[xx] = Math.min(tops[xx], Math.round(base - hh));
    }
    x += w + 2 * sl;
  }
  const bands = night ? ['#2c2440', '#282038', '#322a48'] : ['#cf8f66', '#c27c56', '#d99f78'];
  for (let xx = 0; xx < iw; xx++) {
    const t = tops[xx];
    for (let y = t; y < base; y++) { g.fillStyle = bands[Math.floor(y / 5) % 3]; g.fillRect(xx, y, 1, 1); }
    if (t < base) { g.fillStyle = night ? '#443a5c' : '#eab48c'; g.fillRect(xx, t, 1, 1); }
    g.fillStyle = night ? '#241e36' : '#e4bf94'; g.fillRect(xx, base, 1, c.height - base);
  }
  return c;
}
function makeDunes(night) {
  const iw = W * 2, c = mk(iw, H + 60), g = c.getContext('2d'), r = rng(73);
  const tops = [];
  for (let x = 0; x < iw; x++) {
    const h = 7 * (1 + Math.sin(x * 3 * 2 * Math.PI / iw + 1)) + 4 * (1 + Math.sin(x * 7 * 2 * Math.PI / iw + 2)) + 2 * (1 + Math.sin(x * 17 * 2 * Math.PI / iw));
    tops.push(Math.round(176 - h));
  }
  for (let x = 0; x < iw; x++) {
    const t = tops[x], slope = tops[(x + 3) % iw] - tops[(x - 3 + iw) % iw];
    g.fillStyle = night ? (slope > 0 ? '#3a3048' : '#2e263c') : (slope > 0 ? '#f0cc98' : '#dcb07a');
    g.fillRect(x, t, 1, c.height - t);
    g.fillStyle = night ? '#282034' : '#c89a64';
    for (let y = t + 4; y < t + 30; y += 4) if (((x >> 2) + (y >> 2)) % 3 === 0) g.fillRect(x, y, 1, 1);
  }
  for (let i = 0; i < 45; i++) {
    const x = r() * iw | 0, t = tops[x], hgt = 4 + (r() * 5 | 0);
    g.fillStyle = night ? '#1a1826' : '#5f8a48';
    g.fillRect(x, t - hgt + 1, 1, hgt);
    if (hgt > 5) { g.fillRect(x - 2, t - hgt + 3, 1, 2); g.fillRect(x - 1, t - hgt + 4, 1, 1); g.fillRect(x + 2, t - hgt + 2, 1, 2); g.fillRect(x + 1, t - hgt + 3, 1, 1); }
  }
  return c;
}
function makePragueSky(night) {
  const c = mk(W * 2, H + 60), g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 190);
  if (night) { gr.addColorStop(0, '#06061a'); gr.addColorStop(0.6, '#171a40'); gr.addColorStop(1, '#3a2a50'); }
  else { gr.addColorStop(0, '#5a9ad8'); gr.addColorStop(0.55, '#a8c8e4'); gr.addColorStop(1, '#f8cfa0'); }
  g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
  const r = rng(night ? 81 : 83);
  if (night) {
    for (let i = 0; i < 160; i++) { const b = 100 + r() * 120 | 0; g.fillStyle = `rgb(${b},${b},${b + 20})`; g.fillRect(r() * c.width | 0, r() * 120 | 0, 1, 1); }
    disc(g, 560, 40, 10, '#f4efd8', '#c9c3aa', -0.4);
  } else {
    disc(g, 820, 96, 16, '#fff0c0', '#fff0c0', 0);
    for (let i = 0; i < 7; i++) cloud(g, r() * c.width, 22 + r() * 60, 16 + r() * 22, c.width, r);
  }
  return c;
}
function makeHradcany(night) {
  const iw = W * 2, c = mk(iw, H + 60), g = c.getContext('2d'), r = rng(91);
  const base = 162;
  const hill = x => {
    const b = (cx, wdt, ht) => { const d = (x - cx) / wdt; return Math.abs(d) < 1 ? ht * (0.5 + 0.5 * Math.cos(d * Math.PI)) : 0; };
    return b(230, 200, 24) + b(640, 150, 30) + b(960, 60, 6) + b(0, 60, 6);
  };
  const hillCol = night ? '#151a28' : '#86a08a', treeCol = night ? '#10141f' : '#6f8c74';
  for (let x = 0; x < iw; x++) {
    const t = Math.round(base - hill(x));
    g.fillStyle = hillCol; g.fillRect(x, t, 1, c.height - t);
    if (r() < 0.5) { g.fillStyle = treeCol; g.fillRect(x, t + (r() * 6 | 0), 1, 2); }
  }
  const stone = night ? '#6a5242' : '#b4b0ae', dark = night ? '#4a3a30' : '#9a9696';
  const win = night ? '#ffd98a' : '#86828a';
  const top = Math.round(base - hill(230));
  // castle: long palace block along the hill
  g.fillStyle = stone; g.fillRect(120, top - 12, 220, 14);
  g.fillStyle = dark; g.fillRect(120, top - 13, 220, 1);
  for (let x = 123; x < 338; x += 3) for (const y of [top - 10, top - 6]) { g.fillStyle = win; g.fillRect(x, y, 1, 2); }
  // St. Vitus cathedral: nave, two western spires, the main tower
  g.fillStyle = stone; g.fillRect(222, top - 30, 48, 18);
  g.fillStyle = dark; for (let i = 0; i < 12; i++) g.fillRect(222 + i * 4, top - 32 - (i % 2), 2, 3);
  const spire = (sx, h, w) => { for (let y = 0; y < h; y++) { const half = Math.max(0, Math.round(w * y / h)); g.fillStyle = y < h * 0.45 ? dark : stone; g.fillRect(sx - half, top - 30 - h + y, half * 2 + 1, 1); } };
  g.fillStyle = stone; g.fillRect(222, top - 44, 5, 14); g.fillRect(232, top - 44, 5, 14);
  spire(224, 20, 3); spire(234, 20, 3);
  g.fillStyle = stone; g.fillRect(254, top - 52, 9, 22);
  g.fillStyle = dark; g.fillRect(255, top - 58, 7, 6); g.fillRect(257, top - 62, 3, 4);
  g.fillStyle = night ? '#ffe070' : '#d8b040'; g.fillRect(258, top - 64, 1, 2); g.fillRect(224, top - 65, 1, 2); g.fillRect(234, top - 65, 1, 2);
  for (const wx of [240, 246, 262]) { g.fillStyle = win; g.fillRect(wx, top - 26, 2, 6); }
  // Petřín lookout tower
  const pt = Math.round(base - hill(640));
  g.fillStyle = night ? '#7a6048' : '#6a6a72';
  for (let y = 0; y < 34; y++) { const half = Math.round(4 - y * 0.1); g.fillRect(640 - half, pt - y, 1, 1); g.fillRect(640 + half, pt - y, 1, 1); if (y % 6 === 0) g.fillRect(640 - half, pt - y, half * 2 + 1, 1); }
  g.fillRect(638, pt - 38, 5, 4);
  g.fillStyle = '#ff3030'; g.fillRect(640, pt - 40, 1, 1);
  return c;
}
function makeOldTown(night) {
  const iw = W * 2, c = mk(iw, H + 60), g = c.getContext('2d'), r = rng(93);
  const base = 184;
  const roofCols = night ? ['#1c1826', '#201a2a', '#18161f'] : ['#b8583e', '#a44c34', '#c06448'];
  const faceCols = night ? ['#221e2e', '#262236', '#1e1a28'] : ['#e6cfa0', '#e8b8a8', '#c8d8c0', '#efe2c8', '#d8c8e0'];
  const win = night ? ['#ffd98a', '#ffe7b0', '#ffc070'] : ['#6a7080'];
  let x = 0;
  const landmarks = [[460, 'tyn'], [800, 'dome'], [120, 'tower']];
  while (x < iw) {
    let bw = 14 + (r() * 18 | 0);
    if (x + bw > iw) bw = iw - x;
    const fh = 12 + (r() * 14 | 0), rh = 6 + (r() * 8 | 0);
    const ftop = base - fh;
    g.fillStyle = pick(faceCols); g.fillRect(x, ftop, bw, c.height - ftop);
    for (let wy = ftop + 3; wy < base - 2; wy += 5) for (let wx = x + 2; wx < x + bw - 2; wx += 4) {
      if (!night || r() < 0.45) { g.fillStyle = pick(win); g.fillRect(wx, wy, 1, 2); }
    }
    const rc = pick(roofCols);
    for (let y = 0; y < rh; y++) { const half = Math.round((y + 1) / rh * bw / 2); g.fillStyle = rc; g.fillRect(x + (bw >> 1) - half, ftop - rh + y, half * 2, 1); }
    if (r() < 0.2) { g.fillStyle = night ? '#141018' : '#7a4a3a'; g.fillRect(x + 2, ftop - rh - 2, 2, rh); }
    x += bw;
  }
  for (const [lx, kind] of landmarks) {
    const col = night ? '#2a2430' : '#4a4652', gold = night ? '#ffe070' : '#d8b040';
    if (kind === 'tyn') {
      g.fillStyle = col; g.fillRect(lx - 14, base - 40, 28, 40);
      for (const sx of [lx - 9, lx + 9]) {
        g.fillRect(sx - 4, base - 56, 8, 16);
        for (let y = 0; y < 22; y++) { const half = Math.round(4 * y / 22); g.fillRect(sx - half, base - 78 + y, half * 2 + 1, 1); }
        for (const px of [-4, 4]) for (let y = 0; y < 8; y++) g.fillRect(sx + px, base - 62 + y, 1, 1);
        g.fillStyle = gold; g.fillRect(sx, base - 80, 1, 2); g.fillStyle = col;
      }
      if (night) { g.fillStyle = '#ffcf80'; g.fillRect(lx - 1, base - 30, 2, 8); }
    } else if (kind === 'dome') {
      const dc = night ? '#1e3030' : '#5a9a88';
      g.fillStyle = col; g.fillRect(lx - 16, base - 26, 32, 26);
      g.fillStyle = dc;
      for (let y = 0; y < 14; y++) { const half = Math.round(Math.sqrt(1 - ((13 - y) / 14) ** 2) * 12); g.fillRect(lx - half, base - 40 + y, half * 2 + 1, 1); }
      g.fillRect(lx - 1, base - 46, 3, 6);
      g.fillStyle = gold; g.fillRect(lx, base - 49, 1, 3);
      g.fillStyle = dc; g.fillRect(lx + 20, base - 44, 6, 44);
      for (let y = 0; y < 8; y++) { const half = Math.round(3 * y / 8); g.fillRect(lx + 23 - half, base - 52 + y, half * 2 + 1, 1); }
    } else {
      g.fillStyle = col; g.fillRect(lx - 5, base - 50, 10, 50);
      for (let y = 0; y < 16; y++) { const half = Math.round(5 * y / 16); g.fillRect(lx - half, base - 66 + y, half * 2 + 1, 1); }
      for (const px of [-6, 5]) g.fillRect(lx + px, base - 56, 1, 6);
      g.fillStyle = gold; g.fillRect(lx, base - 68, 1, 2);
      if (night) { g.fillStyle = '#ffcf80'; g.fillRect(lx - 2, base - 40, 4, 4); }
    }
  }
  return c;
}
function makeSunsetSky(night) {
  if (night) return makeDesertSky(true);
  const c = mk(W * 2, H + 60), g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 190);
  gr.addColorStop(0, '#2e2a6a'); gr.addColorStop(0.45, '#8a4a8a'); gr.addColorStop(0.8, '#f07048'); gr.addColorStop(1, '#ffc070');
  g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
  for (const cx of [300, 780]) { disc(g, cx, 128, 30, '#ffd88a', '#ffd88a', 0); disc(g, cx, 128, 24, '#fff0c0', '#fff0c0', 0); }
  const r = rng(101);
  for (let i = 0; i < 8; i++) {
    const cx = r() * c.width, cy = 30 + r() * 70, len = 30 + r() * 70;
    g.fillStyle = r() < 0.5 ? '#c8608a' : '#e88070';
    g.fillRect(Math.floor(cx), Math.floor(cy), Math.floor(len), 2);
    g.fillRect(Math.floor(cx + 8), Math.floor(cy - 2), Math.floor(len * 0.6), 2);
  }
  return c;
}
function makeCliffs(night) {
  const iw = W * 2, c = mk(iw, H + 60), g = c.getContext('2d'), r = rng(111);
  const base = 180, tops = [];
  let h = 30;
  for (let x = 0; x < iw; x++) {
    h += (r() - 0.5) * 6;
    h = U.clamp(h, 8, 60);
    const smooth = 12 * (1 + Math.sin(x * 4 * 2 * Math.PI / iw)) + 8 * (1 + Math.sin(x * 9 * 2 * Math.PI / iw + 1));
    tops.push(Math.round(base - smooth - h * 0.6));
  }
  // make it tile: blend the last stretch into the start
  for (let x = iw - 40; x < iw; x++) { const k = (x - (iw - 40)) / 40; tops[x] = Math.round(tops[x] * (1 - k) + tops[0] * k); }
  const bands = night ? ['#221a2e', '#1e1628', '#281e34'] : ['#a8482a', '#b8583a', '#963f26'];
  for (let x = 0; x < iw; x++) {
    const t = tops[x];
    for (let y = t; y < c.height; y++) { g.fillStyle = bands[Math.floor(y / 4) % 3]; g.fillRect(x, y, 1, 1); }
    g.fillStyle = night ? '#3a2e48' : '#d8784a'; g.fillRect(x, t, 1, 2);
    if (tops[(x + 1) % iw] > t + 2) { g.fillStyle = night ? '#140e1c' : '#6a2a18'; g.fillRect(x, t + 2, 1, 10); }
  }
  return c;
}
function extremeBG() {
  return [
    { d: makeSunsetSky(false), n: makeSunsetSky(true), sx: 0.001, sy: 0.05, off: 0 },
    { d: makeMesas(false), n: makeMesas(true), sx: 0.002, sy: 0.15, off: 0 },
    { d: makeCliffs(false), n: makeCliffs(true), sx: 0.003, sy: 0.3, off: 0 },
  ];
}
function pragueBG() {
  return [
    { d: makePragueSky(false), n: makePragueSky(true), sx: 0.001, sy: 0.05, off: 0 },
    { d: makeHradcany(false), n: makeHradcany(true), sx: 0.002, sy: 0.15, off: 0 },
    { d: makeOldTown(false), n: makeOldTown(true), sx: 0.003, sy: 0.3, off: 0 },
  ];
}
function desertBG() {
  return [
    { d: makeDesertSky(false), n: makeDesertSky(true), sx: 0.001, sy: 0.05, off: 0 },
    { d: makeMesas(false), n: makeMesas(true), sx: 0.002, sy: 0.15, off: 0 },
    { d: makeDunes(false), n: makeDunes(true), sx: 0.003, sy: 0.3, off: 0 },
  ];
}
let BG = [];
function mountainBG() {
  return [
    { d: makeSky(false), n: makeSky(true), sx: 0.001, sy: 0.05, off: 0 },
    { d: makeRidge(false, true), n: makeRidge(true, true), sx: 0.002, sy: 0.15, off: 0 },
    { d: makeRidge(false, false), n: makeRidge(true, false), sx: 0.003, sy: 0.3, off: 0 },
  ];
}
function cityBG() {
  const a = makeCitySky(), b = makeSkyline(true), c = makeSkyline(false);
  return [
    { d: a, n: a, sx: 0.001, sy: 0.05, off: 0 },
    { d: b, n: b, sx: 0.002, sy: 0.15, off: 0 },
    { d: c, n: c, sx: 0.003, sy: 0.3, off: 0 },
  ];
}
