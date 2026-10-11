// Roadkick — Sound effects and the NES-style chiptune player
'use strict';

/* ================= audio ================= */
const SND = {
  on: true, ac: null,
  init() {
    if (this.ac) { if (this.ac.state === 'suspended') this.ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      const ac = this.ac = new AC();
      this.master = ac.createGain(); this.master.gain.value = 0.35; this.master.connect(ac.destination);
      this.filt = ac.createBiquadFilter(); this.filt.type = 'lowpass'; this.filt.frequency.value = 500; this.filt.connect(this.master);
      this.eg = ac.createGain(); this.eg.gain.value = 0; this.eg.connect(this.filt);
      this.o1 = ac.createOscillator(); this.o1.type = 'sawtooth';
      this.o2 = ac.createOscillator(); this.o2.type = 'square';
      const g2 = ac.createGain(); g2.gain.value = 0.45;
      this.o1.connect(this.eg); this.o2.connect(g2); g2.connect(this.eg);
      this.o1.start(); this.o2.start();
      this.so = ac.createOscillator(); this.so.type = 'triangle';
      this.sg = ac.createGain(); this.sg.gain.value = 0;
      this.so.connect(this.sg); this.sg.connect(this.master); this.so.start();
      const len = ac.sampleRate * 0.7 | 0, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.noise = buf;
    } catch (e) { this.ac = null; }
  },
  engine(pct, throttle, running) {
    if (!this.ac) return;
    const t = this.ac.currentTime, f = 42 + pct * 150 + (throttle ? 8 : 0);
    this.o1.frequency.setTargetAtTime(f, t, 0.05);
    this.o2.frequency.setTargetAtTime(f * 0.5, t, 0.05);
    this.filt.frequency.setTargetAtTime(350 + pct * 1300 + (throttle ? 300 : 0), t, 0.08);
    this.eg.gain.setTargetAtTime(running ? 0.16 + pct * 0.12 : 0, t, 0.1);
  },
  siren(level, time) {
    if (!this.ac) return;
    const t = this.ac.currentTime;
    this.so.frequency.setTargetAtTime(Math.sin(time * 5) > 0 ? 960 : 720, t, 0.02);
    this.sg.gain.setTargetAtTime(level * 0.07, t, 0.1);
  },
  burst(dur, freq, vol, q = 1) {
    if (!this.ac) return;
    const ac = this.ac, t = ac.currentTime;
    const src = ac.createBufferSource(); src.buffer = this.noise;
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = q;
    const g = ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(bp); bp.connect(g); g.connect(this.master); src.start(t); src.stop(t + dur);
  },
  tone(freq, dur, vol = 0.3, type = 'square') {
    if (!this.ac) return;
    const ac = this.ac, t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur);
  },
  crash() { this.burst(0.7, 300, 1.2, 0.6); this.tone(70, 0.4, 0.5, 'sine'); },
  kick() { this.burst(0.12, 1200, 0.7, 2); this.tone(110, 0.15, 0.5, 'sine'); },
  pop() { this.burst(0.06, 2200, 0.5, 3); this.tone(300, 0.06, 0.25, 'square'); },
  splat() { this.burst(0.2, 700, 0.8, 1.5); },
  clang(type) {   // metal chain rattle or a dull wooden thwack
    if (type === 'chain') { this.burst(0.18, 3200, 0.6, 6); [0, 40, 80].forEach(d => setTimeout(() => this.tone(1800 + Math.random() * 600, 0.05, 0.12, 'square'), d)); }
    else { this.burst(0.12, 500, 0.9, 2); this.tone(140, 0.12, 0.45, 'triangle'); }
  },
  fall() {
    if (!this.ac) return;
    const ac = this.ac, t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
    o.type = 'triangle'; o.frequency.setValueAtTime(1200, t); o.frequency.exponentialRampToValueAtTime(180, t + 1.1);
    g.gain.setValueAtTime(0.25, t); g.gain.linearRampToValueAtTime(0.001, t + 1.15);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 1.2);
    setTimeout(() => { this.burst(0.4, 180, 0.6, 0.7); this.tone(50, 0.3, 0.3, 'sine'); }, 1200);
  },
  trick() { [520, 700, 940].forEach((fq, i) => setTimeout(() => this.tone(fq, 0.1, 0.28, 'square'), i * 70)); },
  nitroHit() { if (!this.ac) return; const ac = this.ac, t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(200, t); o.frequency.exponentialRampToValueAtTime(1400, t + 0.4); g.gain.setValueAtTime(0.3, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.5); o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 0.5); },
  nitroLoop(on) {
    if (!this.ac) return;
    if (!this.nro) { const ac = this.ac; this.nro = ac.createOscillator(); this.nro.type = 'sawtooth'; this.nro.frequency.value = 320; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1600; f.Q.value = 1.2; this.nrg = ac.createGain(); this.nrg.gain.value = 0; this.nro.connect(f); f.connect(this.nrg); this.nrg.connect(this.master); this.nro.start(); }
    const t = this.ac.currentTime;
    this.nro.frequency.setTargetAtTime(300 + Math.random() * 120, t, 0.05);
    this.nrg.gain.setTargetAtTime(on ? 0.09 : 0, t, 0.1);
  },
  land(k) { const v = Math.min(1, k / 9000); this.burst(0.25, 250, 0.5 + v * 0.7, 0.8); this.tone(60, 0.2, 0.3 + v * 0.3, 'sine'); },
  splash() {
    this.burst(0.9, 450, 1.3, 0.5); this.tone(90, 0.35, 0.5, 'sine');
    [0.35, 0.55, 0.7, 0.9, 1.05].forEach((d, i) => setTimeout(() => this.tone(500 + i * 90 + Math.random() * 120, 0.06, 0.18, 'sine'), d * 1000));
  },
  pickup() { [660, 880, 1320].forEach((f, i) => setTimeout(() => this.tone(f, 0.1, 0.25), i * 70)); },
  drone(on) {
    if (!this.ac) return;
    if (!this.dro) {
      const ac = this.ac;
      this.dro = ac.createOscillator(); this.dro.type = 'sawtooth'; this.dro.frequency.value = 180;
      const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 2;
      this.drg = ac.createGain(); this.drg.gain.value = 0;
      this.dro.connect(f); f.connect(this.drg); this.drg.connect(this.master); this.dro.start();
    }
    const t = this.ac.currentTime;
    this.dro.frequency.setTargetAtTime(170 + Math.sin(t * 9) * 8, t, 0.05);
    this.drg.gain.setTargetAtTime(on ? 0.05 : 0, t, 0.15);
  },
  whiff() { this.burst(0.1, 2600, 0.25, 1); },
  bump() { this.burst(0.15, 600, 0.5, 1); },
  setOn(v) { this.on = v; if (this.master) this.master.gain.value = v ? 0.35 : 0; },
};
/* ================= chiptune music (NES-style: 2 pulse, triangle, noise) ================= */
const MIDI = m => 440 * Math.pow(2, (m - 69) / 12);
const SCALES = { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], phryg: [0, 1, 4, 5, 7, 8, 10] };
// lead motifs: 16 steps per bar, values are scale steps above the bar's chord root; null = rest, '-' = hold
const SONGS = {
  menu:     { bpm: 116, root: 57, scale: 'minor', prog: [0, 5, 3, 4], bass: 'pulse', drums: 'chill', arp: 'up',
    lead: [[4, '-', null, 2, '-', null, 0, '-', '-', '-', null, null, 1, 2, 4, '-'], [5, '-', 4, '-', 2, '-', null, 0, '-', '-', '-', null, null, null, null, null]] },
  mountain: { bpm: 152, root: 55, scale: 'major', prog: [0, 4, 5, 3], bass: 'drive', drums: 'rock', arp: 'none',
    lead: [[0, '-', 2, 4, '-', 2, 4, 7, '-', '-', 6, 4, '-', 2, '-', null], [7, '-', 6, 4, 2, '-', 4, '-', 2, 0, '-', '-', null, 2, 4, '-']] },
  city:     { bpm: 124, root: 52, scale: 'minor', prog: [0, 5, 2, 6], bass: 'pulse', drums: 'synth', arp: 'updown',
    lead: [[7, '-', '-', '-', 6, '-', 4, '-', '-', '-', null, null, 2, '-', 4, '-'], [4, '-', '-', '-', 2, '-', 0, '-', '-', '-', '-', '-', null, null, null, null]] },
  desert:   { bpm: 108, root: 50, scale: 'phryg', prog: [0, 0, 1, 0], bass: 'gallop', drums: 'western', arp: 'none',
    lead: [[0, '-', 1, '-', 2, '-', '-', 1, 0, '-', '-', '-', null, null, 4, '-'], [4, '-', 3, 2, 1, '-', 0, '-', '-', '-', -1, '-', 0, '-', '-', '-']] },
  prague:   { bpm: 138, root: 60, scale: 'major', prog: [0, 3, 4, 0], bass: 'polka', drums: 'polka', arp: 'none',
    lead: [[4, 2, 4, '-', 5, 4, 2, '-', 0, '-', 2, 4, 5, '-', 4, '-'], [7, '-', 5, 4, 2, '-', 4, 2, 0, '-', '-', '-', null, null, null, null]] },
  extreme:  { bpm: 168, root: 57, scale: 'minor', prog: [0, 5, 6, 4], bass: 'drive', drums: 'rock', arp: 'up',
    lead: [[0, 0, 2, 0, 3, '-', 2, 0, 4, '-', 3, 2, 0, '-', -1, '-'], [7, '-', 6, '-', 4, '-', 3, 2, 0, '-', 2, '-', 3, '-', 4, '-']] },
};
const DRUMS = {   // k kick, s snare, h closed hat, o open hat — 16 steps
  rock: 'k.h.s.h.k.kh.s.h', synth: 'k.h.sohhk.h.s.ho', chill: 'k...h.s.k.h.h.s.',
  western: 'k..hs..hk..hs.hh', polka: 'k.h.s.h.k.h.s.hh',
};
const MUSIC = {
  on: true, out: null, song: null, want: null, step: 0, bar: 0, next: 0, timer: 0, chase: 0,
  init() {
    const ac = SND.ac;
    if (!ac || this.out) return;
    this.out = ac.createGain(); this.out.gain.value = this.on ? 0.55 : 0; this.out.connect(SND.master);
    const pulse = d => {   // band-limited pulse wave with duty cycle d
      const n = 48, re = new Float32Array(n), im = new Float32Array(n);
      for (let k = 1; k < n; k++) im[k] = 2 / (k * Math.PI) * Math.sin(k * Math.PI * d);
      return ac.createPeriodicWave(re, im);
    };
    this.w25 = pulse(0.25); this.w12 = pulse(0.125);
  },
  play(id) {
    this.want = id;
    if (!SND.ac) return;
    this.init();
    if (this.timer && this.song === SONGS[id]) return;
    this.stop();
    this.song = SONGS[id]; this.step = 0; this.bar = 0;
    this.next = SND.ac.currentTime + 0.08;
    this.timer = setInterval(() => this.tick(), 25);
  },
  stop() { clearInterval(this.timer); this.timer = 0; this.song = null; },
  spb() { return 60 / (this.song.bpm * (1 + 0.1 * this.chase)) / 4; },
  tick() {
    const ac = SND.ac;
    if (!this.song || !ac) return;
    if (paused) { this.next = ac.currentTime + 0.05; return; }
    while (this.next < ac.currentTime + 0.12) {
      this.playStep(this.next);
      this.next += this.spb();
      if (++this.step === 16) { this.step = 0; this.bar++; }
    }
  },
  note(wave, midi, t, dur, vol) {
    const ac = SND.ac, o = ac.createOscillator(), g = ac.createGain();
    if (wave === 'tri') o.type = 'triangle'; else o.setPeriodicWave(wave);
    o.frequency.value = MIDI(midi);
    g.gain.setValueAtTime(vol, t); g.gain.setValueAtTime(vol, t + dur * 0.7);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.out); o.start(t); o.stop(t + dur + 0.02);
  },
  hit(kind, t) {
    const ac = SND.ac;
    if (kind === 'k') {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'triangle'; o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
      g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      o.connect(g); g.connect(this.out); o.start(t); o.stop(t + 0.16);
      return;
    }
    const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = SND.noise;
    const [type, freq, dur, vol] = kind === 's' ? ['bandpass', 1800, 0.12, 0.45]
      : kind === 'h' ? ['highpass', 7000, 0.03, 0.2] : ['highpass', 6000, 0.12, 0.16];
    f.type = type; f.frequency.value = freq;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f); f.connect(g); g.connect(this.out);
    src.start(t, Math.random() * 0.3); src.stop(t + dur + 0.01);
  },
  bassNote(style, st, ch) {
    switch (style) {
      case 'drive': return st % 2 ? null : (st % 8 === 6 ? ch[0] + 12 : ch[0]);
      case 'pulse': return [0, 3, 6, 8, 11, 14].includes(st) ? ch[0] : null;
      case 'gallop': return [0, 3, 4, 8, 11, 12].includes(st) ? (st >= 8 ? ch[2] - 12 : ch[0]) : null;
      case 'polka': return st % 4 === 0 ? (st % 8 === 0 ? ch[0] : ch[2] - 12) : null;
    }
    return null;
  },
  playStep(t) {
    const S = this.song, sc = SCALES[S.scale], st = this.step;
    const deg = S.prog[this.bar % S.prog.length];
    const dm = d => S.root + 12 * Math.floor(d / 7) + sc[((d % 7) + 7) % 7];
    const spb = this.spb();
    const chord = [dm(deg), dm(deg + 2), dm(deg + 4)];
    // noise channel
    const d = DRUMS[S.drums][st];
    if (d !== '.') this.hit(d, t);
    if (this.chase && st % 2 === 1) this.hit('h', t);
    // triangle bass, an octave down
    const bn = this.bassNote(S.bass, st, chord);
    if (bn != null) this.note('tri', bn - 12, t, spb * 1.7, 0.5);
    if (this.chase && st % 4 === 2) this.note('tri', chord[0], t, spb * 0.9, 0.32);
    // pulse 1: lead (motif A on even bars, B on odd bars)
    const line = S.lead[this.bar % 2], L = line[st];
    if (L !== null && L !== '-') {
      let len = 1; while (st + len < 16 && line[st + len] === '-') len++;
      this.note(this.w25, dm(deg + L) + 12, t, spb * len, 0.15);
    }
    // pulse 2: arpeggio or chord stabs
    if (S.arp === 'up' || S.arp === 'updown') {
      const i = (S.arp === 'up' ? [0, 1, 2, 1] : [0, 1, 2, 3])[st % 4];
      this.note(this.w12, (i === 3 ? chord[0] + 12 : chord[i]) + 12, t, spb * 0.9, 0.06);
    } else if (S.bass === 'polka' && st % 4 === 2) chord.forEach(n => this.note(this.w12, n + 12, t, spb * 1.2, 0.045));
    else if (S.drums === 'western' && st % 8 === 4) this.note(this.w12, chord[2] + 12, t, spb * 2, 0.06);
    else if (S.drums === 'rock' && st % 4 === 0) this.note(this.w12, chord[1] + 12, t, spb * 1.5, 0.04);
  },
  jingle(kind) {
    if (!SND.ac) return;
    this.init(); this.stop();
    const t0 = SND.ac.currentTime + 0.05;
    const J = {
      win: [[72, 0, 0.12], [76, 0.12, 0.12], [79, 0.24, 0.12], [84, 0.36, 0.7]],
      finish: [[67, 0, 0.15], [72, 0.15, 0.15], [76, 0.3, 0.5]],
      bust: [[67, 0, 0.2], [63, 0.22, 0.2], [60, 0.44, 0.2], [55, 0.66, 0.7]],
      fall: [[72, 0, 0.12], [67, 0.14, 0.12], [64, 0.28, 0.12], [55, 0.42, 0.6]],
    }[kind];
    for (const [m, dt, dur] of J) { this.note(this.w25, m, t0 + dt, dur, 0.2); this.note('tri', m - 24, t0 + dt, dur, 0.4); }
  },
  setOn(v) {
    this.on = v;
    if (this.out) this.out.gain.value = v ? 0.55 : 0;
    try { localStorage.setItem('roadkick-music', v ? '1' : '0'); } catch (e) {}
  },
};
try { if (localStorage.getItem('roadkick-music') === '0') MUSIC.on = false; } catch (e) {}
// browsers only allow audio after a user gesture: start whatever should be playing on the first one
['pointerdown', 'keydown'].forEach(ev => addEventListener(ev, () => { SND.init(); if (MUSIC.want && !MUSIC.timer) MUSIC.play(MUSIC.want); }, { capture: true }));
