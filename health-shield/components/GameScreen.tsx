import React, { useEffect, useRef, useState } from 'react';
import { GameResult } from '../types';
import {
  BASE_SPEED,
  BRICK_DEFS,
  COLS,
  GAME_SECS,
  INTRO_TITLE,
  MAX_LIVES,
  ROWS,
  TOTAL_BRICKS,
} from '../constants';

interface Brick {
  label: string;
  row: number;
  col: number;
  x: number;
  y: number;
  w: number;
  h: number;
  hitsLeft: number;
  maxHits: number;
  color: string;
  glow: string;
  icon: string;
  pts: number;
  powerup: string;
  padMultiplier: number;
  speedMultiplier: number;
  defIndex: number;
  active: boolean;
  flashT: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  life: number;
}

interface GS {
  W: number;
  H: number;
  PAD_W: number;
  PAD_H: number;
  BALL_R: number;
  BH: number;
  BW: number;
  GAP: number;
  paddle: { x: number; y: number; w: number; h: number };
  ball: { x: number; y: number; vx: number; vy: number; r: number };
  bricks: Brick[];
  baseSpeed: number;
  speedMul: number;
  basePadW: number;
  padWMul: number;
  lives: number;
  score: number;
  bricksCleared: number;
  positiveBricksHit: number;
  negativeBricksHit: number;
  gainPts: number;
  drainPts: number;
  ballsLost: number;
  launched: boolean;
  started: boolean;
  over: boolean;
  won: boolean;
  startT: number;
  particles: Particle[];
}

interface HudState {
  lives: number;
  timeLeft: number;
  score: number;
  launched: boolean;
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

const brickSpriteCache = new Map<string, HTMLImageElement>();

function getBrickSprite(src: string): HTMLImageElement {
  let image = brickSpriteCache.get(src);
  if (!image) {
    image = new Image();
    image.src = src;
    brickSpriteCache.set(src, image);
  }
  return image;
}

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
    } catch {
      return null;
    }
  }

  function play(fn: (c: AudioContext, out: GainNode) => void) {
    const result = getCtx();
    if (result) {
      try {
        fn(result.ctx, result.out);
      } catch {
        // ignore audio failures
      }
    }
  }

  function stopMusic() {
    bgOscillators.forEach((oscillator) => {
      try {
        oscillator.stop();
      } catch {
        // ignore
      }
    });
    bgOscillators = [];
    if (arpTimeoutId !== null) clearTimeout(arpTimeoutId);
    arpTimeoutId = null;
  }

  function startMusic() {
    stopMusic();
    play((c, out) => {
      const bass = c.createOscillator();
      const bassGain = c.createGain();
      bass.type = 'sine';
      bass.frequency.value = 55;
      bassGain.gain.value = 0.28;

      const lfo = c.createOscillator();
      const lfoGain = c.createGain();
      lfo.frequency.value = 1;
      lfoGain.gain.value = 0.13;
      lfo.connect(lfoGain);
      lfoGain.connect(bassGain.gain);
      bass.connect(bassGain);
      bassGain.connect(out);

      const mid = c.createOscillator();
      const midGain = c.createGain();
      mid.type = 'triangle';
      mid.frequency.value = 110;
      midGain.gain.value = 0.07;
      mid.connect(midGain);
      midGain.connect(out);

      const shimmer = c.createOscillator();
      const shimmerGain = c.createGain();
      shimmer.type = 'sine';
      shimmer.frequency.value = 440;
      shimmerGain.gain.value = 0.025;
      shimmer.connect(shimmerGain);
      shimmerGain.connect(out);

      bass.start();
      lfo.start();
      mid.start();
      shimmer.start();
      bgOscillators = [bass, lfo, mid, shimmer];

      const arpNotes = [165, 196, 247, 330, 247, 196];
      let idx = 0;

      function scheduleArp() {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = arpNotes[idx % arpNotes.length];
        idx += 1;

        const t = ctx.currentTime;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.045, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
        osc.connect(gain);
        gain.connect(out);
        osc.start(t);
        osc.stop(t + 0.34);
        arpTimeoutId = setTimeout(scheduleArp, 380);
      }

      scheduleArp();
    });
  }

  function buttonTap() {
    play((c, out) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(540, c.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, c.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.11);
      osc.connect(gain);
      gain.connect(out);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + 0.12);
    });
  }

  function paddleHit() {
    play((c, out) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, c.currentTime);
      osc.frequency.exponentialRampToValueAtTime(480, c.currentTime + 0.06);
      gain.gain.setValueAtTime(0.14, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(out);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + 0.09);
    });
  }

  function brickHit() {
    play((c, out) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(340, c.currentTime);
      osc.frequency.exponentialRampToValueAtTime(190, c.currentTime + 0.09);
      gain.gain.setValueAtTime(0.1, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.11);
      osc.connect(gain);
      gain.connect(out);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + 0.12);
    });
  }

  function brickDestroy() {
    play((c, out) => {
      [300, 480, 720].forEach((freq, index) => {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const t = c.currentTime + index * 0.07;
        gain.gain.setValueAtTime(0.16, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        osc.connect(gain);
        gain.connect(out);
        osc.start(t);
        osc.stop(t + 0.24);
      });
    });
  }

  function lifeLost() {
    play((c, out) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(360, c.currentTime);
      osc.frequency.exponentialRampToValueAtTime(75, c.currentTime + 0.52);
      gain.gain.setValueAtTime(0.18, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.56);
      osc.connect(gain);
      gain.connect(out);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + 0.58);
    });
  }

  function gameOver() {
    stopMusic();
    play((c, out) => {
      [220, 175, 130, 87].forEach((freq, index) => {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        const t = c.currentTime + index * 0.2;
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
        osc.connect(gain);
        gain.connect(out);
        osc.start(t);
        osc.stop(t + 0.42);
      });
    });
  }

  function gameWon() {
    stopMusic();
    play((c, out) => {
      [330, 415, 494, 622, 830, 1047].forEach((freq, index) => {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const t = c.currentTime + index * 0.11;
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
        osc.connect(gain);
        gain.connect(out);
        osc.start(t);
        osc.stop(t + 0.32);
      });
    });
  }

  function setMuted(next: boolean) {
    muted = next;
    if (masterGain) masterGain.gain.value = next ? 0 : 0.55;
  }

  function destroy() {
    stopMusic();
    try {
      ctx?.close();
    } catch {
      // ignore
    }
  }

  return { startMusic, stopMusic, buttonTap, paddleHit, brickHit, brickDestroy, lifeLost, gameOver, gameWon, setMuted, destroy };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.arcTo(x + w, y, x + w, y + radius, radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
  ctx.lineTo(x + radius, y + h);
  ctx.arcTo(x, y + h, x, y + h - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

function buildState(W: number, H: number): GS {
  const PAD_W = Math.round(W * 0.22);
  const PAD_H = 12;
  const BALL_R = Math.max(6, Math.round(W * 0.015));
  const GAP = 5;
  const TOP = 70;
  const BW = Math.floor((W - GAP * (COLS + 1)) / COLS);
  const GRID_MAX_H = H * 0.5 - TOP;
  const BH_FROM_RATIO = Math.round(BW * 0.58);
  const BH_FROM_HEIGHT = Math.floor((GRID_MAX_H - GAP * (ROWS + 1)) / ROWS);
  const BH = Math.max(BH_FROM_HEIGHT, Math.min(BH_FROM_RATIO, 52));

  const total = ROWS * COLS;
  const numTypes = BRICK_DEFS.length;
  const pool: number[] = [];
  // Guarantee every brick type appears at least once
  for (let t = 0; t < numTypes; t += 1) pool.push(t);
  // Fill remaining slots by cycling through types
  for (let index = numTypes; index < total; index += 1) pool.push(index % numTypes);
  // Shuffle
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[other]] = [pool[other], pool[index]];
  }

  const bricks: Brick[] = [];
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const defIndex = pool[row * COLS + col];
      const def = BRICK_DEFS[defIndex];
      bricks.push({
        label: def.label,
        row,
        col,
        x: GAP + col * (BW + GAP),
        y: TOP + GAP + row * (BH + GAP),
        w: BW,
        h: BH,
        hitsLeft: def.hits,
        maxHits: def.hits,
        color: def.color,
        glow: def.glow,
        icon: def.icon,
        pts: def.pts,
        powerup: def.powerup,
        padMultiplier: def.padMultiplier,
        speedMultiplier: def.speedMultiplier,
        defIndex,
        active: true,
        flashT: 0,
      });
    }
  }

  const baseSpeed = W * BASE_SPEED * 60; // px/second
  return {
    W,
    H,
    PAD_W,
    PAD_H,
    BALL_R,
    BH,
    BW,
    GAP,
    paddle: { x: (W - PAD_W) / 2, y: H - 55, w: PAD_W, h: PAD_H },
    ball: { x: W / 2, y: H - 80, vx: baseSpeed * 0.65, vy: -baseSpeed, r: BALL_R },
    bricks,
    baseSpeed,
    speedMul: 1,
    basePadW: PAD_W,
    padWMul: 1,
    lives: MAX_LIVES,
    score: 0,
    bricksCleared: 0,
    positiveBricksHit: 0,
    negativeBricksHit: 0,
    gainPts: 0,
    drainPts: 0,
    ballsLost: 0,
    launched: false,
    started: false,
    over: false,
    won: false,
    startT: 0,
    particles: [],
  };
}

function drawBrickSprite(ctx: CanvasRenderingContext2D, brick: Brick) {
  if (!brick.icon) return false;
  const image = getBrickSprite(brick.icon);
  if (!image.complete || !image.naturalWidth) return false;

  const paddingX = Math.max(4, brick.w * 0.08);
  const paddingY = Math.max(3, brick.h * 0.12);
  ctx.drawImage(image, brick.x + paddingX, brick.y + paddingY, brick.w - paddingX * 2, brick.h - paddingY * 2);
  return true;
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
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  gs.bricks.forEach((brick) => {
    if (!brick.active) return;
    const alpha = brick.flashT > 0 ? 1 : 0.45 + 0.55 * (brick.hitsLeft / brick.maxHits);
    ctx.save();
    ctx.globalAlpha = alpha;

    if (brick.hitsLeft === brick.maxHits) {
      ctx.shadowBlur = 8;
      ctx.shadowColor = brick.glow;
    }
    roundRect(ctx, brick.x, brick.y, brick.w, brick.h, 5);
    ctx.fillStyle = brick.flashT > 0 ? '#ffffff' : brick.color;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 0.8;
    roundRect(ctx, brick.x, brick.y, brick.w, brick.h, 5);
    ctx.stroke();

    ctx.globalAlpha = Math.max(0.78, alpha);
    ctx.shadowBlur = brick.flashT > 0 ? 0 : 12;
    ctx.shadowColor = brick.glow;
    const painted = drawBrickSprite(ctx, brick);
    if (!painted) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${Math.max(10, Math.min(Math.floor(brick.h * 0.42), Math.floor(brick.w * 0.2), 16))}px Plus Jakarta Sans, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(brick.label, brick.x + brick.w / 2, brick.y + brick.h / 2 + 1, brick.w - 8);
    }
    ctx.shadowBlur = 0;
    ctx.restore();
  });

  gs.particles.forEach((particle) => {
    ctx.save();
    ctx.globalAlpha = particle.life;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.r * particle.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  const paddleGradient = ctx.createLinearGradient(gs.paddle.x, gs.paddle.y, gs.paddle.x, gs.paddle.y + gs.PAD_H);
  paddleGradient.addColorStop(0, '#ff6bb3');
  paddleGradient.addColorStop(1, '#ff2d78');
  ctx.save();
  ctx.shadowBlur = 16;
  ctx.shadowColor = 'rgba(255,45,120,0.75)';
  roundRect(ctx, gs.paddle.x, gs.paddle.y, gs.paddle.w, gs.PAD_H, 7);
  ctx.fillStyle = paddleGradient;
  ctx.fill();
  ctx.shadowBlur = 0;
  roundRect(ctx, gs.paddle.x + 5, gs.paddle.y + 2, gs.paddle.w - 10, gs.PAD_H * 0.38, 4);
  ctx.fillStyle = 'rgba(255,255,255,0.32)';
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#00e5ff';
  const ballGradient = ctx.createRadialGradient(
    gs.ball.x - gs.ball.r * 0.3,
    gs.ball.y - gs.ball.r * 0.35,
    gs.ball.r * 0.05,
    gs.ball.x,
    gs.ball.y,
    gs.ball.r,
  );
  ballGradient.addColorStop(0, '#ffffff');
  ballGradient.addColorStop(0.4, '#80f2ff');
  ballGradient.addColorStop(1, '#00e5ff');
  ctx.beginPath();
  ctx.arc(gs.ball.x, gs.ball.y, gs.ball.r, 0, Math.PI * 2);
  ctx.fillStyle = ballGradient;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  if (!gs.launched && gs.started) {
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = '11px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Tap or click to relaunch', W / 2, H - 22);
    ctx.textAlign = 'left';
  }
}

function spawnBrickParticles(gs: GS, x: number, y: number, color: string, count: number) {
  for (let particleIndex = 0; particleIndex < count; particleIndex += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 2.8;
    gs.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: 2 + Math.random() * 2.4,
      color,
      life: 1,
    });
  }
}

function applyBrickSpeed(ball: GS['ball'], gs: GS, speedMultiplier: number) {
  if (speedMultiplier === 0) return;
  gs.speedMul = Math.min(2.5, gs.speedMul + speedMultiplier);
  const current = Math.hypot(ball.vx, ball.vy);
  if (current <= 0) return;
  const target = gs.baseSpeed * gs.speedMul;
  ball.vx = (ball.vx / current) * target;
  ball.vy = (ball.vy / current) * target;
}

function applyPaddleSize(gs: GS, padMultiplier: number) {
  if (padMultiplier === 0) return;
  gs.padWMul = Math.min(2, Math.max(0.5, gs.padWMul + padMultiplier));
  gs.paddle.w = Math.round(gs.basePadW * gs.padWMul);
  gs.paddle.x = Math.max(0, Math.min(gs.W - gs.paddle.w, gs.paddle.x));
}

function destroyBrick(
  gs: GS,
  brick: Brick,
  ball: GS['ball'],
  snd: SoundEvents,
  options: { applyEffects: boolean; triggerBomb: boolean },
) {
  if (!brick.active) return;

  brick.active = false;
  brick.hitsLeft = 0;
  brick.flashT = 1;
  gs.bricksCleared += 1;
  gs.score += brick.pts;
  if (brick.pts > 0) gs.gainPts += brick.pts;
  else if (brick.pts < 0) gs.drainPts += Math.abs(brick.pts);
  spawnBrickParticles(gs, brick.x + brick.w / 2, brick.y + brick.h / 2, brick.color, options.triggerBomb ? 14 : 8);
  snd.brickDestroy();

  if (options.applyEffects) {
    if (brick.powerup !== 'bomb') 
      {
      applyBrickSpeed(ball, gs, brick.speedMultiplier);
      applyPaddleSize(gs, brick.padMultiplier);
    }

    if (brick.powerup === 'paddle_grow' || brick.powerup === 'bomb') 
    {
      gs.positiveBricksHit += 1;
    }
    else if (brick.powerup === 'speed_up' || brick.powerup === 'paddle_shrink') 
    {
      gs.negativeBricksHit += 1;
    }
  }

  if (options.triggerBomb && brick.powerup === 'bomb') {
    gs.bricks.forEach((other) => {
      if (!other.active || other === brick) return;
      if (Math.abs(other.row - brick.row) <= 1 && Math.abs(other.col - brick.col) <= 1) {
        destroyBrick(gs, other, ball, snd, { applyEffects: false, triggerBomb: other.powerup === 'bomb' });
      }
    });
  }
}

function update(gs: GS, endGame: (won: boolean) => void, snd: SoundEvents, dt: number) {
  if (gs.over || !gs.launched) return;

  const { ball, paddle } = gs;

  gs.particles = gs.particles
    .map((particle) => ({ ...particle, x: particle.x + particle.vx * dt * 60, y: particle.y + particle.vy * dt * 60, life: particle.life - 0.04 * dt * 60 }))
    .filter((particle) => particle.life > 0);

  gs.bricks.forEach((brick) => {
    if (brick.flashT > 0) brick.flashT = Math.max(0, brick.flashT - 0.15 * dt * 60);
  });

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  if (ball.x - ball.r < 0) {
    ball.x = ball.r;
    ball.vx = Math.abs(ball.vx);
  }
  if (ball.x + ball.r > gs.W) {
    ball.x = gs.W - ball.r;
    ball.vx = -Math.abs(ball.vx);
  }
  if (ball.y - ball.r < 0) {
    ball.y = ball.r;
    ball.vy = Math.abs(ball.vy);
  }

  if (
    ball.vy > 0 &&
    ball.y + ball.r >= paddle.y &&
    ball.y + ball.r <= paddle.y + paddle.h + Math.abs(ball.vy) * dt + 2 &&
    ball.x + ball.r >= paddle.x &&
    ball.x - ball.r <= paddle.x + paddle.w
  ) {
    const hit = (ball.x - paddle.x) / paddle.w;
    const angle = (hit - 0.5) * Math.PI * 0.75;
    const speed = Math.hypot(ball.vx, ball.vy);
    ball.vx = Math.sin(angle) * speed;
    ball.vy = -Math.abs(Math.cos(angle) * speed);
    ball.y = paddle.y - ball.r - 0.5;
    snd.paddleHit();
  }

  if (ball.y - ball.r > gs.H) {
    gs.lives -= 1;
    gs.ballsLost += 1;
    snd.lifeLost();
    if (gs.lives <= 0) {
      endGame(false);
      return;
    }
    ball.x = paddle.x + paddle.w / 2;
    ball.y = paddle.y - ball.r - 5;
    gs.speedMul = 1;
    const speed = gs.baseSpeed;
    ball.vx = speed * 0.65 * (Math.random() > 0.5 ? 1 : -1);
    ball.vy = -speed;
    gs.launched = false;
  }

  for (let index = 0; index < gs.bricks.length; index += 1) {
    const brick = gs.bricks[index];
    if (!brick.active) continue;

    const cx = Math.max(brick.x, Math.min(ball.x, brick.x + brick.w));
    const cy = Math.max(brick.y, Math.min(ball.y, brick.y + brick.h));
    const dx = ball.x - cx;
    const dy = ball.y - cy;
    if (dx * dx + dy * dy >= ball.r * ball.r) continue;

    brick.hitsLeft -= 1;
    brick.flashT = 1;
    spawnBrickParticles(gs, cx, cy, brick.color, 5);

    if (brick.hitsLeft <= 0) {
      destroyBrick(gs, brick, ball, snd, { applyEffects: true, triggerBomb: true });
    } else {
      snd.brickHit();
    }

    const overlapLeft = ball.x + ball.r - brick.x;
    const overlapRight = brick.x + brick.w - (ball.x - ball.r);
    const overlapTop = ball.y + ball.r - brick.y;
    const overlapBottom = brick.y + brick.h - (ball.y - ball.r);
    if (Math.min(overlapLeft, overlapRight) < Math.min(overlapTop, overlapBottom)) ball.vx = -ball.vx;
    else ball.vy = -ball.vy;
    break;
  }

  if (gs.bricksCleared >= TOTAL_BRICKS) endGame(true);
}

interface HowToPlayOverlayProps {
  onStart: () => void;
}

const HowToPlayOverlay: React.FC<HowToPlayOverlayProps> = ({ onStart }) => {
  const gainers = BRICK_DEFS.filter((b) => b.pts > 0);
  const drainers = BRICK_DEFS.filter((b) => b.pts <= 0);

  const BrickItem = ({ brick }: { brick: typeof BRICK_DEFS[0] }) => (
    <div
      className="flex items-center gap-2 rounded-xl px-2 py-2"
      style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${brick.color}55` }}
    >
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black/20">
        <img src={brick.icon} alt={brick.label} className="h-full w-full object-cover" />
      </span>
      <span className="text-[11px] font-bold leading-tight" style={{ color: brick.color }}>
        {brick.label}
      </span>
    </div>
  );

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center px-4 py-6"
      style={{ background: 'rgba(5, 8, 24, 0.82)', backdropFilter: 'blur(8px)' }}
    >
      <style>{`
        @keyframes hs-ball-x {
          0% { transform: translate(0, 0); }
          20% { transform: translate(2.8rem, -2.4rem); }
          45% { transform: translate(5.8rem, -0.4rem); }
          68% { transform: translate(8.5rem, -2.7rem); }
          100% { transform: translate(11rem, 0); }
        }
        @keyframes hs-brick-flash {
          0%, 18% { opacity: 0.3; transform: scale(1); }
          22%, 40% { opacity: 1; transform: scale(1.08); }
          44%, 100% { opacity: 0.3; transform: scale(1); }
        }
        @keyframes hs-paddle-slide {
          0%, 100% { transform: translateX(-2.4rem); }
          50% { transform: translateX(2.4rem); }
        }
      `}</style>

      <div
        className="w-full max-w-sm rounded-[2rem] border px-5 py-5 shadow-2xl"
        style={{
          background: 'linear-gradient(180deg, rgba(17, 3, 44, 0.96) 0%, rgba(11, 2, 28, 0.98) 100%)',
          borderColor: 'rgba(255,255,255,0.16)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
        }}
      >
        <div className="mb-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em]" style={{ color: '#ffb2d1' }}>
            {INTRO_TITLE}
          </p>
          <h2 className="mt-2 text-[1.75rem] font-black uppercase leading-none text-white">
            How To Play
          </h2>
        </div>

        <div
          className="relative mb-5 overflow-hidden rounded-[1.5rem] border p-4"
          style={{
            minHeight: '11.5rem',
            background: 'linear-gradient(180deg, rgba(16,8,42,1) 0%, rgba(8,3,24,1) 100%)',
            borderColor: 'rgba(0,229,255,0.18)',
          }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '1.75rem 1.75rem',
            }}
          />
          <div className="relative z-10 h-full">
            <div className="mb-4 flex justify-center gap-2">
              {BRICK_DEFS.slice(0, 4).map((brick, index) => (
                <div
                  key={brick.label}
                  className="flex h-8 w-12 items-center justify-center overflow-hidden rounded-xl"
                  style={{
                    background: brick.color,
                    boxShadow: `0 0 18px ${brick.glow}`,
                    animation: `hs-brick-flash 2.8s ease-in-out ${index * 0.35}s infinite`,
                  }}
                >
                  <img src={brick.icon} alt={brick.label} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
            <div className="relative mx-auto mt-6 h-16 w-[12rem]">
              <div
                className="absolute bottom-0 left-1/2 h-3 w-20 -translate-x-1/2 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #ff2d78, #ff6bb3)',
                  boxShadow: '0 0 18px rgba(255,45,120,0.75)',
                  animation: 'hs-paddle-slide 2.8s ease-in-out infinite',
                }}
              />
              <div
                className="absolute bottom-3 left-1 h-4 w-4 rounded-full"
                style={{
                  background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #80f2ff 42%, #00e5ff 100%)',
                  boxShadow: '0 0 18px rgba(0,229,255,0.85)',
                  animation: 'hs-ball-x 2.8s linear infinite',
                }}
              />
            </div>
          </div>
        </div>

        {/* Brick legends — two vertical columns */}
        <div className="mb-5 flex gap-3">
          <div className="flex flex-1 flex-col gap-2">
            <p className="mb-1 text-center text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: '#23e76c' }}>
              Wealth Gainers
            </p>
            {gainers.map((brick) => <BrickItem key={brick.label} brick={brick} />)}
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <p className="mb-1 text-center text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: '#ff2d78' }}>
              Wealth Drainers
            </p>
            {drainers.map((brick) => <BrickItem key={brick.label} brick={brick} />)}
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full rounded-full py-4 text-base font-extrabold tracking-wide text-white btn-press"
          style={{
            background: 'linear-gradient(90deg, #ff2d78, #ff6bb3)',
            boxShadow: '0 0 18px rgba(255,45,120,0.7), 0 6px 24px rgba(255,45,120,0.4)',
          }}
        >
          START
        </button>
      </div>
    </div>
  );
};

const GameScreen: React.FC<Props> = ({ onGameEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gsRef = useRef<GS | null>(null);
  const rafRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sndRef = useRef<ReturnType<typeof createSoundEngine> | null>(null);
  const howToPlayOpenRef = useRef(true);

  const [hud, setHud] = useState<HudState>({ lives: MAX_LIVES, timeLeft: GAME_SECS, score: 0, launched: false });
  const [muted, setMuted] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(true);

  const toggleMute = () => {
    sndRef.current?.buttonTap();
    setMuted((current) => {
      const next = !current;
      sndRef.current?.setMuted(next);
      return next;
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    BRICK_DEFS.forEach((brick) => {
      if (brick.icon) getBrickSprite(brick.icon);
    });

    const W = Math.min(window.innerWidth, 480);
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const snd = createSoundEngine(false);
    sndRef.current = snd;

    const gs = buildState(W, H);
    gsRef.current = gs;

    function endGame(won: boolean) {
      const gameState = gsRef.current;
      if (!gameState || gameState.over) return;

      gameState.over = true;
      gameState.won = won;
      cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (won) snd.gameWon();
      else snd.gameOver();

      setTimeout(() => {
        onGameEnd({
          bricksCleared: gameState.bricksCleared,
          totalBricks: TOTAL_BRICKS,
          ballsLost: gameState.ballsLost,
          livesRemaining: gameState.lives,
          timeSeconds: gameState.startT ? Math.min(GAME_SECS, Math.round((Date.now() - gameState.startT) / 1000)) : 0,
          rawScore: gameState.score,
          won,
          positiveBricksHit: gameState.positiveBricksHit,
          negativeBricksHit: gameState.negativeBricksHit,
          gainPts: gameState.gainPts,
          drainPts: gameState.drainPts,
        });
      }, 300);
    }

    const soundEvents: SoundEvents = {
      paddleHit: () => snd.paddleHit(),
      brickHit: () => snd.brickHit(),
      brickDestroy: () => snd.brickDestroy(),
      lifeLost: () => snd.lifeLost(),
      gameOver: () => snd.gameOver(),
      gameWon: () => snd.gameWon(),
    };

    timerRef.current = setInterval(() => {
      const gameState = gsRef.current;
      if (!gameState || gameState.over || !gameState.started) return;
      const elapsed = Math.floor((Date.now() - gameState.startT) / 1000);
      const timeLeft = Math.max(0, GAME_SECS - elapsed);
      setHud({ lives: gameState.lives, timeLeft, score: gameState.score, launched: gameState.launched });
      if (timeLeft <= 0) endGame(false);
    }, 250);

    function movePaddle(clientX: number, rect: DOMRect) {
      const gameState = gsRef.current;
      if (!gameState || gameState.over || howToPlayOpenRef.current) return;
      const x = (clientX - rect.left) * (canvas.width / rect.width);
      gameState.paddle.x = Math.max(0, Math.min(gameState.W - gameState.paddle.w, x - gameState.paddle.w / 2));
      if (!gameState.launched) gameState.ball.x = gameState.paddle.x + gameState.paddle.w / 2;
    }

    function launchBall() {
      const gameState = gsRef.current;
      if (!gameState || gameState.over || howToPlayOpenRef.current || gameState.launched) return;
      gameState.launched = true;
      if (!gameState.started) {
        gameState.started = true;
        gameState.startT = Date.now();
        snd.startMusic();
      }
      setHud({
        lives: gameState.lives,
        timeLeft: Math.max(0, GAME_SECS - Math.floor((Date.now() - gameState.startT) / 1000)),
        score: gameState.score,
        launched: true,
      });
    }

    const onMouseMove = (event: MouseEvent) => movePaddle(event.clientX, canvas.getBoundingClientRect());
    const onClick = () => launchBall();
    const onTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      movePaddle(event.touches[0].clientX, canvas.getBoundingClientRect());
    };
    const onTouchStart = (event: TouchEvent) => {
      event.preventDefault();
      movePaddle(event.touches[0].clientX, canvas.getBoundingClientRect());
      launchBall();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const gameState = gsRef.current;
      if (!gameState || gameState.over || howToPlayOpenRef.current) return;

      const step = gameState.W * 0.04;
      if (event.key === 'ArrowLeft') {
        gameState.paddle.x = Math.max(0, gameState.paddle.x - step);
        if (!gameState.launched) gameState.ball.x = gameState.paddle.x + gameState.paddle.w / 2;
      }
      if (event.key === 'ArrowRight') {
        gameState.paddle.x = Math.min(gameState.W - gameState.paddle.w, gameState.paddle.x + step);
        if (!gameState.launched) gameState.ball.x = gameState.paddle.x + gameState.paddle.w / 2;
      }
      if (event.key === ' ') launchBall();
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('keydown', onKeyDown);

    let lastTime = 0;
    function loop(timestamp: number) {
      const gameState = gsRef.current;
      if (!gameState) return;
      const dt = lastTime > 0 ? Math.min((timestamp - lastTime) / 1000, 0.05) : 1 / 60;
      lastTime = timestamp;
      update(gameState, endGame, soundEvents, dt);
      draw(ctx, gameState);
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('keydown', onKeyDown);
      snd.destroy();
    };
  }, [onGameEnd]);

  const minutes = String(Math.floor(hud.timeLeft / 60)).padStart(2, '0');
  const seconds = String(hud.timeLeft % 60).padStart(2, '0');
  const urgent = hud.timeLeft <= 20;

  return (
    <div style={{ background: '#0d0024', width: '100%', height: '100%', minHeight: '100%', position: 'relative' }}>
      <div
        className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-4 py-2"
        style={{
          background: 'rgba(13,0,36,0.8)',
          backdropFilter: 'blur(6px)',
          borderBottom: '1px solid rgba(191,90,242,0.25)',
        }}
      >
        <div className="flex items-center gap-1">
          {Array.from({ length: MAX_LIVES }).map((_, index) => (
            <span key={index} className="text-base" style={{ opacity: index < hud.lives ? 1 : 0.18 }}>
              ❤️
            </span>
          ))}
        </div>

        <div className="text-sm font-extrabold" style={{ color: '#00e5ff', textShadow: '0 0 8px rgba(0,229,255,0.8)' }}>
          🛡️ {hud.score}
        </div>

        <div className="flex items-center gap-2">
          <div
            className="text-sm font-extrabold"
            style={
              urgent
                ? { color: '#ff2d78', textShadow: '0 0 8px rgba(255,45,120,0.9)', animation: 'pop 0.5s ease-out infinite alternate' }
                : { color: '#c084fc' }
            }
          >
            ⏱ {minutes}:{seconds}
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

      {showHowToPlay && (
        <HowToPlayOverlay
          onStart={() => {
            const gameState = gsRef.current;
            sndRef.current?.buttonTap();
            howToPlayOpenRef.current = false;
            setShowHowToPlay(false);
            if (!gameState || gameState.over) return;
            gameState.started = true;
            gameState.launched = true;
            gameState.startT = Date.now();
            sndRef.current?.startMusic();
            setHud({ lives: gameState.lives, timeLeft: GAME_SECS, score: gameState.score, launched: true });
          }}
        />
      )}

      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', cursor: 'none' }} />
    </div>
  );
};

export default GameScreen;
