// Roadkick — Game feel: slow motion, combo scoring, pass detection
'use strict';

/* ================= game feel ================= */
let overSide = new Map();   // remembers which side of the bike each rival/car was on, to detect passes
function slowmo(scale, dur) {
  if (reducedMotion) return;
  timeScale = Math.min(timeScale, scale); slowT = Math.max(slowT, dur);
}
function addCombo(label, pts) {
  if (state !== 'race') return;
  comboN++; comboT = COMBO_WINDOW;
  const mul = comboMul();
  comboPts += pts * mul;
  comboLabel = label;
  const el = $('combo'); el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
  SND.tone(600 + Math.min(8, mul) * 70, 0.06, 0.15);
}
const comboMul = () => Math.min(8, 1 + Math.floor((comboN - 1) / 2));
function bankCombo() {
  if (comboPts > 0) { score += Math.round(comboPts); SND.tone(1200, 0.08, 0.18); setTimeout(() => SND.tone(1600, 0.1, 0.18), 70); }
  comboPts = 0; comboN = 0; comboT = 0;
}
function loseCombo() {
  if (comboPts > 0) say('Комбо сгорело', 0.9, 'bad');
  comboPts = 0; comboN = 0; comboT = 0;
}
function updateFeel(rdt, racing) {
  // slow motion recovers in real time
  if (slowT > 0) slowT -= rdt; else timeScale = Math.min(1, timeScale + rdt * 2.5);
  if (!racing) return;
  if (comboT > 0) { comboT -= rdt; if (comboT <= 0) bankCombo(); }
}
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
