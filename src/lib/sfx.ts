// Efectos de sonido sintetizados con Web Audio (sin archivos): inflar, explotar, juguete, tic de ruleta.
// El navegador solo deja sonar audio después de un toque: llamar unlockAudio() en el primer toque.

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(value: boolean) { muted = value; }
export function isMuted() { return muted; }

export function unlockAudio() {
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx ??= new Ctor();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function noiseBuffer(c: AudioContext, seconds: number) {
  const buf = c.createBuffer(1, Math.ceil(seconds * c.sampleRate), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

function env(c: AudioContext, gain: number, attack: number, decay: number, at = c.currentTime) {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(gain, at + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, at + attack + decay);
  g.connect(c.destination);
  return g;
}

/** "Puff": aire que infla un globo (ruido filtrado que sube). */
export function puff(delay = 0) {
  const c = unlockAudio(); if (!c || muted) return;
  const at = c.currentTime + delay;
  const src = c.createBufferSource(); src.buffer = noiseBuffer(c, 0.35);
  const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2;
  f.frequency.setValueAtTime(300, at); f.frequency.exponentialRampToValueAtTime(1400, at + 0.3);
  src.connect(f).connect(env(c, 0.35, 0.06, 0.28, at));
  src.start(at); src.stop(at + 0.4);
}

/** "Pop": globo que explota (golpe corto + ruido brillante). */
export function pop(delay = 0) {
  const c = unlockAudio(); if (!c || muted) return;
  const at = c.currentTime + delay;
  const src = c.createBufferSource(); src.buffer = noiseBuffer(c, 0.12);
  const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 900;
  src.connect(f).connect(env(c, 0.7, 0.002, 0.09, at));
  src.start(at); src.stop(at + 0.15);
  const o = c.createOscillator(); o.type = 'sine';
  o.frequency.setValueAtTime(180, at); o.frequency.exponentialRampToValueAtTime(60, at + 0.12);
  o.connect(env(c, 0.5, 0.002, 0.12, at)); o.start(at); o.stop(at + 0.15);
}

/** Juguete de goma que chilla. */
export function squeak(delay = 0) {
  const c = unlockAudio(); if (!c || muted) return;
  const at = c.currentTime + delay;
  const o = c.createOscillator(); o.type = 'triangle';
  o.frequency.setValueAtTime(900, at); o.frequency.exponentialRampToValueAtTime(1700, at + 0.08);
  o.frequency.exponentialRampToValueAtTime(1100, at + 0.2);
  o.connect(env(c, 0.18, 0.01, 0.2, at)); o.start(at); o.stop(at + 0.25);
}

/** Tic de la ruleta al pasar cada carta. */
export function tick() {
  const c = unlockAudio(); if (!c || muted) return;
  const o = c.createOscillator(); o.type = 'square'; o.frequency.value = 1800;
  o.connect(env(c, 0.06, 0.001, 0.03)); o.start(); o.stop(c.currentTime + 0.05);
}

/** Pequeña fanfarria al ganar. */
export function tada() {
  const c = unlockAudio(); if (!c || muted) return;
  [523, 659, 784, 1047].forEach((freq, i) => {
    const at = c.currentTime + i * 0.09;
    const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = freq;
    o.connect(env(c, 0.15, 0.01, 0.35, at)); o.start(at); o.stop(at + 0.4);
  });
}
