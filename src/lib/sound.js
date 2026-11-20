// Tiny UI sounds, synthesised with WebAudio (no audio files, nothing to license).
// Off by default; the choice persists. Only direct actions make sound — the site works fully without it.
const KEY = "sound";
let on = false;
try {
  on = localStorage.getItem(KEY) === "on";
} catch {
  /* storage blocked: stays off */
}

let ctx = null;
let idle = 0;
const listeners = new Set();

export const soundOn = () => on;
export const onSoundChange = (fn) => (listeners.add(fn), () => listeners.delete(fn));

export function setSound(v) {
  on = v;
  try {
    localStorage.setItem(KEY, v ? "on" : "off");
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l(v));
  if (v) play("tick");
}

function audio() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  // Suspend after a quiet spell so the context never keeps the CPU awake.
  clearTimeout(idle);
  idle = setTimeout(() => ctx?.suspend(), 2500);
  return ctx;
}

function tone(a, { f0, f1 = f0, dur, type = "sine", vol = 0.25, at = 0 }) {
  const t = a.currentTime + at;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function thud(a, { dur = 0.16, vol = 0.45, cutoff = 900 } = {}) {
  const len = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
  const src = a.createBufferSource();
  const lp = a.createBiquadFilter();
  const g = a.createGain();
  lp.type = "lowpass";
  lp.frequency.value = cutoff;
  g.gain.value = vol;
  src.buffer = buf;
  src.connect(lp).connect(g).connect(a.destination);
  src.start();
}

const SOUNDS = {
  tick: (a) => tone(a, { f0: 1800, f1: 1200, dur: 0.04, type: "triangle", vol: 0.12 }),
  pop: (a) => tone(a, { f0: 420 + Math.random() * 120, f1: 880, dur: 0.09, vol: 0.2 }),
  flip: (a) => {
    tone(a, { f0: 300, f1: 620, dur: 0.12, type: "triangle", vol: 0.14 });
    thud(a, { dur: 0.08, vol: 0.12, cutoff: 3000 });
  },
  stamp: (a) => {
    thud(a, { dur: 0.22, vol: 0.55, cutoff: 700 });
    tone(a, { f0: 110, f1: 60, dur: 0.18, vol: 0.3 });
  },
  sent: (a) => {
    tone(a, { f0: 660, dur: 0.1, vol: 0.16 });
    tone(a, { f0: 990, dur: 0.16, vol: 0.16, at: 0.09 });
  },
};

/** Play a named sound if the visitor turned sound on. Never throws. */
export function play(name) {
  if (!on) return;
  try {
    SOUNDS[name]?.(audio());
  } catch {
    /* audio unavailable */
  }
}
