// audio.js — procedural WebAudio sounds. No audio files, no network.
let ctx = null;
let muted = false;

export function isMuted() { return muted; }

export function toggleMute() {
  muted = !muted;
  return muted;
}

function ensureCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur, type, vol, when) {
  if (muted) return;
  const ac = ensureCtx();
  if (!ac) return;
  const t = ac.currentTime + (when || 0);
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(vol || 0.12, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export function playClick() { tone(660, 0.07, 'square', 0.05); }
export function playDeal() { tone(440, 0.08, 'triangle', 0.08); tone(660, 0.08, 'triangle', 0.06, 0.07); }
export function playCard() { tone(520, 0.1, 'triangle', 0.1); tone(780, 0.12, 'sine', 0.08, 0.06); }
export function playHit() { tone(180, 0.18, 'sawtooth', 0.12); tone(120, 0.22, 'sawtooth', 0.1, 0.08); }
export function playShield() { tone(880, 0.12, 'sine', 0.09); tone(1174, 0.16, 'sine', 0.07, 0.08); }
export function playWin() {
  [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, 'triangle', 0.11, i * 0.12));
}
export function playLose() {
  [392, 330, 262, 196].forEach((f, i) => tone(f, 0.24, 'sawtooth', 0.07, i * 0.14));
}
