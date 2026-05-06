import React, { useState, useEffect, useRef } from 'react';
import { GameResult } from '../types';
import { ORANGE, MAX_LIVES, GAME_SECS, COLS, BRICK_DEFS, ROWS, TOTAL_BRICKS, BASE_SPEED } from '../constants';

interface Brick {
  x: number; y: number; w: number; h: number;
  hitsLeft: number; maxHits: number;
  color: string; glow: string; icon: string;
  pts: number; powerup: string; padMultiplier: number; speedMultiplier: number; defIndex: number;
  active: boolean; flashT: number;
}

interface Particle {
  x: number; y: number; vx: number; vy: number;
  r: number; color: string; life: number;
}

interface GS {
  W: number; H: number;
  PAD_W: number; PAD_H: number;
  BALL_R: number; BH: number; BW: number; GAP: number;
  paddle: { x: number; y: number; w: number; h: number };
  ball:   { x: number; y: number; vx: number; vy: number; r: number };
  bricks: Brick[];
  baseSpeed: number; speedMul: number;
  basePadW: number; padWMul: number;
  lives: number; score: number;
  bricksCleared: number; ballsLost: number;
  launched: boolean; over: boolean; won: boolean;
  startT: number;
  particles: Particle[];
}

interface HudState {
  lives: number; timeLeft: number; score: number; launched: boolean;
}

interface SoundEvents {
  paddleHit(): void;
  brickHit(): void;
  brickDestroy(): void;
  lifeLost(): void;
  gameOver(): void;
  gameWon(): void;
}

interface Props {
  onGameEnd: (result: GameResult) => void;
}

// ─── Audio Engine ────────────────────────────────────────────────────────────

function createSoundEngine(initialMuted: boolean) {
  let ctx: AudioContext | null = null;
  let masterGain: GainNode | null = null;
  let bgOscillators: OscillatorNode[] = [];
  let arpTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let muted = initialMuted;

  function getCtx(): { ctx: AudioContext; out: GainNode } | null {
    try {
      if (!ctx) {
        ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        masterGain = ctx.createGain();
        masterGain.gain.value = muted ? 0 : 0.55;
        masterGain.connect(ctx.destination);
      }
      if (ctx.state === 'suspended') ctx.resume();
      return { ctx, out: masterGain! };
    } catch { return null; }
  }

  function play(fn: (c: AudioContext, out: GainNode) => void) {
    const r = getCtx();
    if (r) try { fn(r.ctx, r.out); } catch { /* ignore */ }
  }

  function stopMusic() {
    bgOscillators.forEach(o => { try { o.stop(); } catch { /* ignore */ } });
    bgOscillators = [];
    if (arpTimeoutId !== null) clearTimeout(arpTimeoutId);
    arpTimeoutId = null;
  }

  function startMusic() {
    stopMusic();
    play((c, out) => {
      // Bass pulse (sine, 55 Hz) with 1 Hz tremolo LFO
      const bass = c.createOscillator();
      const bassGain = c.createGain();
      bass.type = 'sine';
      bass.frequency.value = 55;
      bassGain.gain.value = 0.28;
      const lfo = c.createOscillator();
      const lfoGain = c.createGain();
      lfo.frequency.value = 1.0;
      lfoGain.gain.value = 0.13;
      lfo.connect(lfoGain);
      lfoGain.connect(bassGain.gain);
      bass.connect(bassGain);
      bassGain.connect(out);

      // Mid drone (triangle, 110 Hz)
      const mid = c.createOscillator();
      const midGain = c.createGain();
      mid.type = 'triangle';
      mid.frequency.value = 110;
      midGain.gain.value = 0.07;
      mid.connect(midGain);
      midGain.connect(out);

      // Shimmer (sine, 440 Hz, very quiet)
      const shim = c.createOscillator();
      const shimGain = c.createGain();
      shim.type = 'sine';
      shim.frequency.value = 440;
      shimGain.gain.value = 0.025;
      shim.connect(shimGain);
      shimGain.connect(out);

      bass.start(); lfo.start(); mid.start(); shim.start();
      bgOscillators = [bass, lfo, mid, shim];

      // Arpeggio (E-minor flavour: E3-G3-B3-E4-B3-G3)
      const arpNotes = [165, 196, 247, 330, 247, 196];
      let idx = 0;
      function scheduleArp() {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = arpNotes[idx % arpNotes.length];
        idx++;
        const t = ctx.currentTime;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.045, t + 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
        osc.connect(g);
        g.connect(out);
        osc.start(t);
        osc.stop(t + 0.34);
        arpTimeoutId = setTimeout(scheduleArp, 380);
      }
      scheduleArp();
    });
  }

  function paddleHit() {
    play((c, out) => {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, c.currentTime);
      osc.frequency.exponentialRampToValueAtTime(480, c.currentTime + 0.06);
      g.gain.setValueAtTime(0.14, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
      osc.connect(g); g.connect(out);
      osc.start(c.currentTime); osc.stop(c.currentTime + 0.09);
    });
  }

  function brickHit() {
    play((c, out) => {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(340, c.currentTime);
      osc.frequency.exponentialRampToValueAtTime(190, c.currentTime + 0.09);
      g.gain.setValueAtTime(0.10, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.11);
      osc.connect(g); g.connect(out);
      osc.start(c.currentTime); osc.stop(c.currentTime + 0.12);
    });
  }

  function brickDestroy() {
    play((c, out) => {
      // Rising 3-note chime — coverage gained!
      [300, 480, 720].forEach((freq, i) => {
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const t = c.currentTime + i * 0.07;
        g.gain.setValueAtTime(0.16, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        osc.connect(g); g.connect(out);
        osc.start(t); osc.stop(t + 0.24);
      });
    });
  }

  function lifeLost() {
    play((c, out) => {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(360, c.currentTime);
      osc.frequency.exponentialRampToValueAtTime(75, c.currentTime + 0.52);
      g.gain.setValueAtTime(0.18, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.56);
      osc.connect(g); g.connect(out);
      osc.start(c.currentTime); osc.stop(c.currentTime + 0.58);
    });
  }

  function gameOver() {
    stopMusic();
    play((c, out) => {
      [220, 175, 130, 87].forEach((freq, i) => {
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        const t = c.currentTime + i * 0.2;
        g.gain.setValueAtTime(0.20, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
        osc.connect(g); g.connect(out);
        osc.start(t); osc.stop(t + 0.42);
      });
    });
  }

  function gameWon() {
    stopMusic();
    play((c, out) => {
      // Triumphant E-major ascent
      [330, 415, 494, 622, 830, 1047].forEach((freq, i) => {
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const t = c.currentTime + i * 0.11;
        g.gain.setValueAtTime(0.18, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
        osc.connect(g); g.connect(out);
        osc.start(t); osc.stop(t + 0.32);
      });
    });
  }

  function setMuted(m: boolean) {
    muted = m;
    if (masterGain) masterGain.gain.value = m ? 0 : 0.55;
  }

  function destroy() {
    stopMusic();
    try { ctx?.close(); } catch { /* ignore */ }
  }

  return { startMusic, stopMusic, paddleHit, brickHit, brickDestroy, lifeLost, gameOver, gameWon, setMuted, destroy };
}

// ─── Canvas helpers ───────────────────────────────────────────────────────────

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function buildState(W: number, H: number): GS {
  const PAD_W  = Math.round(W * 0.22);
  const PAD_H  = 12;
  const BALL_R = Math.max(6, Math.round(W * 0.015));
  const GAP    = 5;
  const TOP    = 70;
  const BH     = Math.floor((H * 0.47 - GAP * (ROWS + 1)) / ROWS);
  const BW     = Math.floor((W - GAP * (COLS + 1)) / COLS);

  // Build a shuffled pool — equal count of each brick type across the grid
  const total = ROWS * COLS;
  const pool: number[] = [];
  for (let i = 0; i < total; i++) pool.push(i % ROWS);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const bricks: Brick[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const di  = pool[r * COLS + c];
      const def = BRICK_DEFS[di];
      bricks.push({
        x: GAP + c * (BW + GAP), y: TOP + GAP + r * (BH + GAP),
        w: BW, h: BH,
        hitsLeft: def.hits, maxHits: def.hits,
        color: def.color, glow: def.glow, icon: def.icon,
        pts: def.pts, powerup: def.powerup,
        padMultiplier: def.padMultiplier, speedMultiplier: def.speedMultiplier,
        defIndex: di,
        active: true, flashT: 0,
      });
    }
  }

  const baseSpeed = W * BASE_SPEED;
  return {
    W, H, PAD_W, PAD_H, BALL_R, BH, BW, GAP,
    paddle:  { x: (W - PAD_W) / 2, y: H - 55, w: PAD_W, h: PAD_H },
    ball:    { x: W / 2, y: H - 80, vx: baseSpeed * 0.65, vy: -baseSpeed, r: BALL_R },
    bricks,
    baseSpeed, speedMul: 1,
    basePadW: PAD_W, padWMul: 1,
    lives: MAX_LIVES, score: 0,
    bricksCleared: 0, ballsLost: 0,
    launched: false, over: false, won: false,
    startT: Date.now(),
    particles: [],
  };
}

function draw(ctx: CanvasRenderingContext2D, gs: GS) {
  const { W, H } = gs;

  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0d0024');
  bg.addColorStop(0.5, '#1a0040');
  bg.addColorStop(1, '#0d0024');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(191,90,242,0.07)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  gs.bricks.forEach(b => {
    if (!b.active) return;
    const alpha = b.flashT > 0 ? 1 : 0.45 + 0.55 * (b.hitsLeft / b.maxHits);
    ctx.save();
    ctx.globalAlpha = alpha;

    // Brick body
    if (b.hitsLeft === b.maxHits) { ctx.shadowBlur = 8; ctx.shadowColor = b.glow; }
    roundRect(ctx, b.x, b.y, b.w, b.h, 5);
    ctx.fillStyle = b.flashT > 0 ? '#ffffff' : b.color;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Edge highlight
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 0.8;
    roundRect(ctx, b.x, b.y, b.w, b.h, 5);
    ctx.stroke();

    // Neon icon — glow matches brick colour, contrast flips on flash
    ctx.globalAlpha = Math.max(0.7, alpha);
    const iSize = Math.max(10, Math.min(Math.floor(b.h * 0.55), Math.floor(b.w * 0.5), 20));
    ctx.font = `${iSize}px 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = b.flashT > 0 ? 0 : 12;
    ctx.shadowColor = b.glow;
    ctx.fillStyle = b.flashT > 0 ? b.color : '#ffffff';
    ctx.fillText(b.icon, b.x + b.w / 2, b.y + b.h / 2 + 1);
    ctx.shadowBlur = 0;

    ctx.restore();
  });

  gs.particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  const pg = ctx.createLinearGradient(gs.paddle.x, gs.paddle.y, gs.paddle.x, gs.paddle.y + gs.PAD_H);
  pg.addColorStop(0, '#ff6bb3');
  pg.addColorStop(1, '#ff2d78');
  ctx.save();
  ctx.shadowBlur = 16;
  ctx.shadowColor = 'rgba(255,45,120,0.75)';
  roundRect(ctx, gs.paddle.x, gs.paddle.y, gs.paddle.w, gs.PAD_H, 7);
  ctx.fillStyle = pg;
  ctx.fill();
  ctx.shadowBlur = 0;
  roundRect(ctx, gs.paddle.x + 5, gs.paddle.y + 2, gs.paddle.w - 10, gs.PAD_H * 0.38, 4);
  ctx.fillStyle = 'rgba(255,255,255,0.32)';
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#00e5ff';
  const ballG = ctx.createRadialGradient(
    gs.ball.x - gs.ball.r * 0.3, gs.ball.y - gs.ball.r * 0.35, gs.ball.r * 0.05,
    gs.ball.x, gs.ball.y, gs.ball.r
  );
  ballG.addColorStop(0, '#ffffff');
  ballG.addColorStop(0.4, '#80f2ff');
  ballG.addColorStop(1, '#00e5ff');
  ctx.beginPath();
  ctx.arc(gs.ball.x, gs.ball.y, gs.ball.r, 0, Math.PI * 2);
  ctx.fillStyle = ballG;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  if (!gs.launched) {
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = '11px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Tap or click to launch ▸', W / 2, H - 22);
    ctx.textAlign = 'left';
  }
}

function update(gs: GS, endGame: (won: boolean) => void, snd: SoundEvents) {
  if (gs.over || !gs.launched) return;

  const { ball, paddle } = gs;

  gs.particles = gs.particles
    .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 0.04 }))
    .filter(p => p.life > 0);

  gs.bricks.forEach(b => { if (b.flashT > 0) b.flashT = Math.max(0, b.flashT - 0.15); });

  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.x - ball.r < 0)    { ball.x = ball.r;        ball.vx =  Math.abs(ball.vx); }
  if (ball.x + ball.r > gs.W) { ball.x = gs.W - ball.r; ball.vx = -Math.abs(ball.vx); }
  if (ball.y - ball.r < 0)    { ball.y = ball.r;         ball.vy =  Math.abs(ball.vy); }

  if (
    ball.vy > 0 &&
    ball.y + ball.r >= paddle.y &&
    ball.y + ball.r <= paddle.y + paddle.h + Math.abs(ball.vy) + 2 &&
    ball.x + ball.r >= paddle.x &&
    ball.x - ball.r <= paddle.x + paddle.w
  ) {
    const hit = (ball.x - paddle.x) / paddle.w;
    const ang = (hit - 0.5) * Math.PI * 0.75;
    const spd = Math.hypot(ball.vx, ball.vy);
    ball.vx = Math.sin(ang) * spd;
    ball.vy = -Math.abs(Math.cos(ang) * spd);
    ball.y  = paddle.y - ball.r - 0.5;
    snd.paddleHit();
  }

  if (ball.y - ball.r > gs.H) {
    gs.lives--;
    gs.ballsLost++;
    snd.lifeLost();
    if (gs.lives <= 0) { endGame(false); return; }
    ball.x = paddle.x + paddle.w / 2;
    ball.y = paddle.y - ball.r - 5;
    const sp = gs.baseSpeed * gs.speedMul;
    ball.vx = sp * 0.65 * (Math.random() > 0.5 ? 1 : -1);
    ball.vy = -sp;
    gs.launched = false;
  }

  for (let i = 0; i < gs.bricks.length; i++) {
    const b = gs.bricks[i];
    if (!b.active) continue;
    const cx = Math.max(b.x, Math.min(ball.x, b.x + b.w));
    const cy = Math.max(b.y, Math.min(ball.y, b.y + b.h));
    const dx = ball.x - cx, dy = ball.y - cy;
    if (dx * dx + dy * dy >= ball.r * ball.r) continue;

    b.hitsLeft--;
    b.flashT = 1;
    for (let p = 0; p < 5; p++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 1.5 + Math.random() * 2;
      gs.particles.push({ x: cx, y: cy, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, r: 2 + Math.random() * 2, color: b.color, life: 1 });
    }
    if (b.hitsLeft <= 0) {
      b.active = false;
      gs.bricksCleared++;
      gs.score += b.pts;
      snd.brickDestroy();

      // Per-brick powerup effects — magnitudes driven by config
      if (b.speedMultiplier !== 0) {
        gs.speedMul = Math.min(2.5, gs.speedMul + b.speedMultiplier);
        const cur = Math.hypot(ball.vx, ball.vy);
        if (cur > 0) {
          const target = gs.baseSpeed * gs.speedMul;
          ball.vx = (ball.vx / cur) * target;
          ball.vy = (ball.vy / cur) * target;
        }
      }
      if (b.padMultiplier !== 0) {
        gs.padWMul = Math.min(2.0, Math.max(0.4, gs.padWMul + b.padMultiplier));
        gs.paddle.w = Math.round(gs.basePadW * gs.padWMul);
        gs.paddle.x = Math.max(0, Math.min(gs.W - gs.paddle.w, gs.paddle.x));
      }
    } else {
      snd.brickHit();
    }
    const overlapLeft  = (ball.x + ball.r) - b.x;
    const overlapRight = (b.x + b.w) - (ball.x - ball.r);
    const overlapTop   = (ball.y + ball.r) - b.y;
    const overlapBot   = (b.y + b.h) - (ball.y - ball.r);
    if (Math.min(overlapLeft, overlapRight) < Math.min(overlapTop, overlapBot)) ball.vx = -ball.vx;
    else ball.vy = -ball.vy;
    break;
  }

  if (gs.bricksCleared >= TOTAL_BRICKS) endGame(true);
}

// ─── Component ────────────────────────────────────────────────────────────────

const GameScreen: React.FC<Props> = ({ onGameEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gsRef     = useRef<GS | null>(null);
  const rafRef    = useRef<number>(0);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const sndRef    = useRef<ReturnType<typeof createSoundEngine> | null>(null);

  const [hud, setHud]     = useState<HudState>({ lives: MAX_LIVES, timeLeft: GAME_SECS, score: 0, launched: false });
  const [muted, setMuted] = useState(false);

  const toggleMute = () => {
    setMuted(m => {
      const next = !m;
      sndRef.current?.setMuted(next);
      return next;
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = Math.min(window.innerWidth, 480);
    const H = window.innerHeight;
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    const snd = createSoundEngine(false);
    sndRef.current = snd;

    const gs = buildState(W, H);
    gsRef.current = gs;

    function endGame(won: boolean) {
      const g = gsRef.current;
      if (!g || g.over) return;
      g.over = true;
      g.won  = won;
      cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (won) snd.gameWon(); else snd.gameOver();
      setTimeout(() => onGameEnd({
        bricksCleared:  g.bricksCleared,
        totalBricks:    TOTAL_BRICKS,
        ballsLost:      g.ballsLost,
        livesRemaining: g.lives,
        timeSeconds:    Math.min(GAME_SECS, Math.round((Date.now() - g.startT) / 1000)),
        rawScore:       g.score,
        won,
      }), 800);
    }

    const soundEvents: SoundEvents = {
      paddleHit:    () => snd.paddleHit(),
      brickHit:     () => snd.brickHit(),
      brickDestroy: () => snd.brickDestroy(),
      lifeLost:     () => snd.lifeLost(),
      gameOver:     () => snd.gameOver(),
      gameWon:      () => snd.gameWon(),
    };

    timerRef.current = setInterval(() => {
      const g = gsRef.current;
      if (!g || g.over) return;
      const elapsed = Math.floor((Date.now() - g.startT) / 1000);
      const left    = Math.max(0, GAME_SECS - elapsed);
      setHud(h => ({ ...h, timeLeft: left, score: g.score, lives: g.lives, launched: g.launched }));
      if (left <= 0) endGame(false);
    }, 250);

    function movePaddle(clientX: number, rect: DOMRect) {
      const g = gsRef.current;
      if (!g || g.over) return;
      const x = (clientX - rect.left) * (canvas!.width / rect.width);
      g.paddle.x = Math.max(0, Math.min(g.W - g.paddle.w, x - g.paddle.w / 2));
      if (!g.launched) g.ball.x = g.paddle.x + g.paddle.w / 2;
    }

    const onMouseMove  = (e: MouseEvent)  => movePaddle(e.clientX, canvas.getBoundingClientRect());
    const onClick      = ()               => {
      const g = gsRef.current;
      if (g && !g.launched && !g.over) {
        g.launched = true;
        // Start music on first launch (satisfies browser autoplay policy)
        if (!g.launched) snd.startMusic();
        snd.startMusic();
      }
    };
    const onTouchMove  = (e: TouchEvent)  => { e.preventDefault(); movePaddle(e.touches[0].clientX, canvas.getBoundingClientRect()); };
    const onTouchStart = (e: TouchEvent)  => {
      e.preventDefault();
      movePaddle(e.touches[0].clientX, canvas.getBoundingClientRect());
      const g = gsRef.current;
      if (g && !g.launched && !g.over) {
        g.launched = true;
        snd.startMusic();
      }
    };
    const onKeyDown    = (e: KeyboardEvent) => {
      const g = gsRef.current;
      if (!g || g.over) return;
      const step = g.W * 0.04;
      if (e.key === 'ArrowLeft')  { g.paddle.x = Math.max(0, g.paddle.x - step); if (!g.launched) g.ball.x = g.paddle.x + g.paddle.w / 2; }
      if (e.key === 'ArrowRight') { g.paddle.x = Math.min(g.W - g.paddle.w, g.paddle.x + step); if (!g.launched) g.ball.x = g.paddle.x + g.paddle.w / 2; }
      if (e.key === ' ')          { if (!g.launched) { g.launched = true; snd.startMusic(); } }
    };

    canvas.addEventListener('mousemove',  onMouseMove);
    canvas.addEventListener('click',      onClick);
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('keydown',    onKeyDown);

    function loop() {
      const g = gsRef.current;
      if (!g) return;
      update(g, endGame, soundEvents);
      draw(ctx, g);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      canvas.removeEventListener('mousemove',  onMouseMove);
      canvas.removeEventListener('click',      onClick);
      canvas.removeEventListener('touchmove',  onTouchMove);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('keydown',    onKeyDown);
      snd.destroy();
    };
  }, []);

  const tl     = hud.timeLeft;
  const mm     = String(Math.floor(tl / 60)).padStart(2, '0');
  const ss     = String(tl % 60).padStart(2, '0');
  const urgent = tl <= 20;

  return (
    <div style={{ background: '#0d0024', width: '100%', height: '100vh', position: 'relative' }}>
      <div
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2"
        style={{
          background: 'rgba(13,0,36,0.8)',
          backdropFilter: 'blur(6px)',
          borderBottom: '1px solid rgba(191,90,242,0.25)',
        }}
      >
        {/* Lives */}
        <div className="flex items-center gap-1">
          {Array.from({ length: MAX_LIVES }).map((_, i) => (
            <span key={i} className="text-base" style={{ opacity: i < hud.lives ? 1 : 0.18 }}>❤️</span>
          ))}
        </div>

        {/* Score */}
        <div
          className="font-extrabold text-sm"
          style={{ color: '#00e5ff', textShadow: '0 0 8px rgba(0,229,255,0.8)' }}
        >
          🛡️ {hud.score}
        </div>

        {/* Timer + Mute */}
        <div className="flex items-center gap-2">
          <div
            className="font-extrabold text-sm"
            style={
              urgent
                ? { color: '#ff2d78', textShadow: '0 0 8px rgba(255,45,120,0.9)', animation: 'pop 0.5s ease-out infinite alternate' }
                : { color: '#c084fc' }
            }
          >
            ⏱ {mm}:{ss}
          </div>
          <button
            onClick={toggleMute}
            className="text-base leading-none"
            style={{
              background: 'rgba(124,58,237,0.2)',
              border: '1px solid rgba(191,90,242,0.4)',
              borderRadius: '6px',
              padding: '2px 5px',
              cursor: 'pointer',
              lineHeight: 1,
            }}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', cursor: 'none' }} />
    </div>
  );
};

export default GameScreen;
