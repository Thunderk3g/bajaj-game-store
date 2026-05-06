let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicGain: GainNode | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let muted = false;
let beat = 0;

const notes = [261.63, 329.63, 392, 493.88, 523.25, 659.25];
const pattern = [0, 2, 4, 2, 1, 3, 5, 3, 0, 4, 2, 5];

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 1;
    master.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.11;
    musicGain.connect(master);
  }
  return ctx;
}

function tone(freq: number, duration: number, type: OscillatorType, volume: number, delay = 0): void {
  const audio = getCtx();
  if (!master) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.connect(gain);
  gain.connect(master);
  osc.type = type;
  osc.frequency.value = freq;
  const start = audio.currentTime + delay;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.start(start);
  osc.stop(start + duration + 0.03);
}

function tick(): void {
  const audio = getCtx();
  if (!musicGain) return;
  const freq = notes[pattern[beat % pattern.length]];
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.connect(gain);
  gain.connect(musicGain);
  osc.type = 'triangle';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.001, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.55, audio.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.18);
  osc.start();
  osc.stop(audio.currentTime + 0.2);
  if (beat % 4 === 0) tone(freq / 2, 0.28, 'sine', 0.12);
  beat += 1;
  timer = setTimeout(tick, 285);
}

export function startMusic(): void {
  if (timer) return;
  beat = 0;
  void getCtx().resume();
  tick();
}

export function stopMusic(): void {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

export function setMuted(next: boolean): void {
  muted = next;
  const audio = getCtx();
  master?.gain.setTargetAtTime(next ? 0 : 1, audio.currentTime, 0.05);
}

export function playSfx(type: 'button' | 'swap' | 'match' | 'mistake' | 'win' | 'end'): void {
  if (type === 'button') tone(820, 0.07, 'sine', 0.18);
  if (type === 'swap') {
    tone(420, 0.08, 'square', 0.11);
    tone(620, 0.08, 'square', 0.1, 0.065);
  }
  if (type === 'match') tone(1046.5, 0.12, 'sine', 0.22);
  if (type === 'mistake') tone(130, 0.2, 'sawtooth', 0.16);
  if (type === 'win') {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.16, 'sine', 0.22, i * 0.09));
  }
  if (type === 'end') {
    [392, 329.63, 261.63].forEach((f, i) => tone(f, 0.2, 'triangle', 0.16, i * 0.12));
  }
}
