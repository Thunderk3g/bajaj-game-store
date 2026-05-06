import React, { useEffect, useRef, useState } from 'react';
import { GameResult, EnemyType } from '../types';
import {
  GAME_SECS, PLAYER_SPEED, BULLET_SPEED, FIRE_RATE_MS,
  PLAYER_MAX_HP, ENEMY_SPAWN_INTERVAL, MIN_ENEMY_SPAWN_INTERVAL,
  RAMP_INTERVAL_SECS, KILL_TARGET, ENEMY_DEFS, PLAYER_RADIUS, BULLET_RADIUS,
  POWER_UP_SPAWN_INTERVAL_MS, POWER_UP_DURATION_MS, FIRE_RATE_BOOST_MULTIPLIER,
  DIAGONAL_FIRE_ANGLE_DEGREES,
} from '../constants';

// ── Audio engine ──────────────────────────────────────────────────────────────
let _ctx: AudioContext | null = null;
let _master: GainNode | null = null;
let _musicGain: GainNode | null = null;
let _musicTid: ReturnType<typeof setTimeout> | null = null;
let _beat = 0;

const NOTES = [220.00, 246.94, 261.63, 293.66, 329.63, 369.99, 415.30, 440.00];
const MELODY = [0, 4, 2, 5, 1, 4, 0, 3, 2, 5, 4, 1, 3, 0, 5, 2];
const BASS   = [0, 0, 2, 2, 4, 4, 3, 3];

function getCtx(): AudioContext {
  if (!_ctx) {
    _ctx    = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    _master = _ctx.createGain();
    _master.gain.value = 1;
    _master.connect(_ctx.destination);
    _musicGain = _ctx.createGain();
    _musicGain.gain.value = 0.10;
    _musicGain.connect(_master);
  }
  return _ctx;
}

function beatTick() {
  const ctx = getCtx();
  const t   = ctx.currentTime;
  const mi  = _beat % MELODY.length;
  const bi  = _beat % BASS.length;

  // Melody
  const osc = ctx.createOscillator();
  const g   = ctx.createGain();
  osc.connect(g); g.connect(_musicGain!);
  osc.type = 'square';
  osc.frequency.value = NOTES[MELODY[mi]] * 2;
  g.gain.setValueAtTime(0.25, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  osc.start(t); osc.stop(t + 0.18);

  // Bass every 2 beats
  if (_beat % 2 === 0) {
    const b  = ctx.createOscillator();
    const bg = ctx.createGain();
    b.connect(bg); bg.connect(_musicGain!);
    b.type = 'sawtooth';
    b.frequency.value = NOTES[BASS[bi]] / 2;
    bg.gain.setValueAtTime(0.35, t);
    bg.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    b.start(t); b.stop(t + 0.28);
  }

  // Kick every 4 beats
  if (_beat % 4 === 0) {
    const k  = ctx.createOscillator();
    const kg = ctx.createGain();
    k.connect(kg); kg.connect(_musicGain!);
    k.type = 'sine';
    k.frequency.setValueAtTime(180, t);
    k.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    kg.gain.setValueAtTime(0.6, t);
    kg.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    k.start(t); k.stop(t + 0.2);
  }

  _beat++;
  _musicTid = setTimeout(beatTick, 215);
}

function startMusic() { if (_musicTid) return; getCtx(); _beat = 0; beatTick(); }
function stopMusic()  { if (_musicTid) { clearTimeout(_musicTid); _musicTid = null; } }
function setAudioMuted(m: boolean) { getCtx(); if (_master) _master.gain.setTargetAtTime(m ? 0 : 1, _ctx!.currentTime, 0.05); }

function playSFX(type: 'shoot' | 'hit' | 'kill' | 'hurt' | 'gameover' | 'btn' | 'powerup') {
  const ctx = getCtx();
  if (!_master) return;
  const t = ctx.currentTime;

  const note = (f: number, dur: number, wave: OscillatorType, vol: number, f2?: number) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(_master!);
    o.type = wave;
    if (f2) { o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f2, t + dur * 0.7); }
    else     { o.frequency.value = f; }
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.start(t); o.stop(t + dur);
  };

  const noteAt = (f: number, delay: number, dur: number, wave: OscillatorType, vol: number) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(_master!);
    o.type = wave; o.frequency.value = f;
    g.gain.setValueAtTime(0, t + delay);
    g.gain.setValueAtTime(vol, t + delay + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, t + delay + dur);
    o.start(t + delay); o.stop(t + delay + dur + 0.01);
  };

  if      (type === 'shoot')    { note(1200, 0.06, 'square', 0.15, 600); }
  else if (type === 'hit')      { note(120,  0.10, 'sawtooth', 0.25, 60); }
  else if (type === 'kill')     { noteAt(880, 0, 0.08, 'sine', 0.3); noteAt(1047, 0.07, 0.10, 'sine', 0.35); }
  else if (type === 'hurt')     { note(80, 0.3, 'sawtooth', 0.4, 40); }
  else if (type === 'btn')      { note(660, 0.06, 'sine', 0.15); }
  else if (type === 'powerup')  { noteAt(659, 0, 0.07, 'triangle', 0.28); noteAt(880, 0.08, 0.08, 'triangle', 0.32); noteAt(1175, 0.17, 0.1, 'triangle', 0.35); }
  else if (type === 'gameover') {
    [523.25, 440, 369.99, 293.66, 261.63].forEach((f, i) => noteAt(f, i * 0.18, 0.22, 'sine', 0.28));
  }
}

// ── Game state types ──────────────────────────────────────────────────────────
interface Player {
  x: number; y: number;
  tx: number; ty: number;
  moving: boolean;
  lastShotMs: number;
  invincibleUntil: number;
}

interface Enemy {
  id: number;
  type: EnemyType;
  x: number; y: number;
  hp: number; maxHp: number;
  speed: number;
  hitFlashUntil: number;
}

interface Bullet {
  id: number;
  x: number; y: number;
  vx: number; vy: number;
  boosted: boolean;
}

type PowerUpType = 'fire_rate' | 'diagonal_fire';

interface PowerUp {
  id: number;
  type: PowerUpType;
  x: number; y: number;
  spawnMs: number;
  radius: number;
}

interface Particle {
  id: number;
  x: number; y: number;
  vx: number; vy: number;
  color: string;
  r: number;
  life: number;
}

interface FloatText {
  id: number;
  x: number; y: number;
  text: string;
  color: string;
  vy: number;
  life: number;
}

interface GameState {
  W: number; H: number;
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  powerUps: PowerUp[];
  particles: Particle[];
  floatTexts: FloatText[];
  playerHp: number;
  score: number;
  killCount: number;
  lastSpawnMs: number;
  lastPowerUpSpawnMs: number;
  spawnInterval: number;
  wave: number;
  fireRateBoostUntil: number;
  diagonalFireUntil: number;
  screenFlashUntil: number;
  nextId: number;
}

interface PowerUpHud {
  fireRateMsLeft: number;
  diagonalMsLeft: number;
}

// ── Pure helpers ──────────────────────────────────────────────────────────────
function dist2(ax: number, ay: number, bx: number, by: number) {
  return (ax - bx) ** 2 + (ay - by) ** 2;
}

function pickEnemyType(wave: number): EnemyType {
  const all: EnemyType[] = ['emi', 'credit_card', 'tax_notice', 'market_crash', 'loan_shark', 'coverage_gap'];
  const available = all.filter(t => ENEMY_DEFS[t].minWave <= wave);
  const total = available.reduce((s, t) => s + ENEMY_DEFS[t].weight, 0);
  let rand = Math.random() * total;
  for (const t of available) {
    rand -= ENEMY_DEFS[t].weight;
    if (rand <= 0) return t;
  }
  return available[0];
}

function spawnEnemy(state: GameState) {
  const { W, H, wave } = state;
  const type = pickEnemyType(wave);
  const def  = ENEMY_DEFS[type];
  const buf  = def.radius + 10;
  const edge = Math.floor(Math.random() * 4);
  let x: number, y: number;
  if      (edge === 0) { x = buf + Math.random() * (W - 2 * buf); y = -buf; }
  else if (edge === 1) { x = W + buf; y = buf + Math.random() * (H - 2 * buf); }
  else if (edge === 2) { x = buf + Math.random() * (W - 2 * buf); y = H + buf; }
  else                 { x = -buf;    y = buf + Math.random() * (H - 2 * buf); }

  const speedMult = 1 + (wave - 1) * 0.12;
  state.enemies.push({
    id: state.nextId++, type, x, y,
    hp: def.hp, maxHp: def.hp,
    speed: def.baseSpeed * speedMult,
    hitFlashUntil: 0,
  });
}

function spawnPowerUp(state: GameState, now: number) {
  const margin = 44;
  const type: PowerUpType = Math.random() < 0.52 ? 'fire_rate' : 'diagonal_fire';
  state.powerUps.push({
    id: state.nextId++,
    type,
    x: margin + Math.random() * Math.max(1, state.W - margin * 2),
    y: margin + Math.random() * Math.max(1, state.H - margin * 2),
    spawnMs: now,
    radius: 17,
  });
}

function spawnParticles(state: GameState, x: number, y: number, color: string, count: number) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const speed = 60 + Math.random() * 100;
    state.particles.push({
      id: state.nextId++, x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color, r: 3 + Math.random() * 4,
      life: 1.0,
    });
  }
}

function addFloatText(state: GameState, text: string, x: number, y: number, color: string) {
  state.floatTexts.push({ id: state.nextId++, text, x, y, color, vy: -55, life: 1.0 });
}

function addBullet(state: GameState, x: number, y: number, nx: number, ny: number, boosted: boolean) {
  state.bullets.push({
    id: state.nextId++,
    x,
    y,
    vx: nx * BULLET_SPEED,
    vy: ny * BULLET_SPEED,
    boosted,
  });
}

function rotateVector(x: number, y: number, radians: number) {
  const c = Math.cos(radians);
  const s = Math.sin(radians);
  return { x: x * c - y * s, y: x * s + y * c };
}

// ── Update ────────────────────────────────────────────────────────────────────
function update(
  state: GameState, dt: number, now: number,
  onHpChange: (hp: number) => void,
  onScoreChange: (s: number) => void,
  onPowerChange: (p: PowerUpHud) => void,
  onDead: () => void,
) {
  const { player } = state;

  // 1. Move player toward target
  const pdx = player.tx - player.x;
  const pdy = player.ty - player.y;
  const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
  if (pdist > 4) {
    player.moving = true;
    const step = PLAYER_SPEED * dt;
    if (pdist <= step) {
      player.x = player.tx; player.y = player.ty; player.moving = false;
    } else {
      player.x += (pdx / pdist) * step;
      player.y += (pdy / pdist) * step;
    }
  } else {
    player.moving = false;
  }

  // 2. Auto-shoot when standing still
  const fireRateActive = now < state.fireRateBoostUntil;
  const diagonalActive = now < state.diagonalFireUntil;
  const currentFireRate = Math.max(160, FIRE_RATE_MS * (fireRateActive ? FIRE_RATE_BOOST_MULTIPLIER : 1));

  if (!player.moving && now - player.lastShotMs >= currentFireRate && state.enemies.length > 0) {
    let nearest: Enemy | null = null;
    let minD = Infinity;
    for (const e of state.enemies) {
      const d = dist2(player.x, player.y, e.x, e.y);
      if (d < minD) { minD = d; nearest = e; }
    }
    if (nearest) {
      const bdx = nearest.x - player.x;
      const bdy = nearest.y - player.y;
      const bd  = Math.sqrt(bdx * bdx + bdy * bdy);
      const nx = bdx / bd;
      const ny = bdy / bd;
      addBullet(state, player.x, player.y, nx, ny, fireRateActive || diagonalActive);
      if (diagonalActive) {
        const angle = (DIAGONAL_FIRE_ANGLE_DEGREES * Math.PI) / 180;
        const left = rotateVector(nx, ny, -angle);
        const right = rotateVector(nx, ny, angle);
        addBullet(state, player.x, player.y, left.x, left.y, true);
        addBullet(state, player.x, player.y, right.x, right.y, true);
      }
      player.lastShotMs = now;
      playSFX('shoot');
    }
  }

  // 3. Move bullets + cull out-of-bounds
  state.bullets = state.bullets.filter(b => {
    b.x += b.vx * dt; b.y += b.vy * dt;
    return b.x > -20 && b.x < state.W + 20 && b.y > -20 && b.y < state.H + 20;
  });

  // 4a. Collect and expire power-ups
  state.powerUps = state.powerUps.filter(p => now - p.spawnMs < 8500);
  const collectedPowerUps = new Set<number>();
  for (const p of state.powerUps) {
    const hitRad = PLAYER_RADIUS + p.radius;
    if (dist2(player.x, player.y, p.x, p.y) < hitRad * hitRad) {
      collectedPowerUps.add(p.id);
      if (p.type === 'fire_rate') {
        state.fireRateBoostUntil = now + POWER_UP_DURATION_MS;
        addFloatText(state, 'RATE BOOST', p.x, p.y - 18, '#38BDF8');
      } else {
        state.diagonalFireUntil = now + POWER_UP_DURATION_MS;
        addFloatText(state, 'DIAGONAL FIRE', p.x, p.y - 18, '#FBBF24');
      }
      spawnParticles(state, p.x, p.y, p.type === 'fire_rate' ? '#38BDF8' : '#FBBF24', 10);
      playSFX('powerup');
    }
  }
  state.powerUps = state.powerUps.filter(p => !collectedPowerUps.has(p.id));

  // 4. Move enemies toward player
  for (const e of state.enemies) {
    const edx = player.x - e.x;
    const edy = player.y - e.y;
    const ed  = Math.sqrt(edx * edx + edy * edy);
    if (ed > 0) { e.x += (edx / ed) * e.speed * dt; e.y += (edy / ed) * e.speed * dt; }
  }

  // 5. Bullet-enemy collision
  const deadBullets = new Set<number>();
  const hitMap = new Map<number, number>(); // enemyId → damage
  for (const b of state.bullets) {
    for (const e of state.enemies) {
      if (deadBullets.has(b.id)) break;
      const def    = ENEMY_DEFS[e.type];
      const hitRad = BULLET_RADIUS + def.radius;
      if (dist2(b.x, b.y, e.x, e.y) < hitRad * hitRad) {
        deadBullets.add(b.id);
        hitMap.set(e.id, (hitMap.get(e.id) ?? 0) + 1);
      }
    }
  }
  state.bullets = state.bullets.filter(b => !deadBullets.has(b.id));

  const deadEnemies = new Set<number>();
  let scoreChanged = false;
  for (const [eid, dmg] of hitMap) {
    const e = state.enemies.find(en => en.id === eid);
    if (!e) continue;
    e.hp -= dmg;
    e.hitFlashUntil = now + 100;
    if (e.hp <= 0) {
      deadEnemies.add(eid);
      const def = ENEMY_DEFS[e.type];
      state.score += def.points;
      state.killCount++;
      spawnParticles(state, e.x, e.y, def.color, 8);
      addFloatText(state, `+${def.points}`, e.x, e.y - 10, '#FFD93D');
      playSFX('kill');
      scoreChanged = true;
    } else {
      playSFX('hit');
    }
  }
  if (scoreChanged) onScoreChange(state.score);
  state.enemies = state.enemies.filter(e => !deadEnemies.has(e.id));

  // 6. Enemy-player collision (with invincibility frames)
  if (now > player.invincibleUntil) {
    for (const e of state.enemies) {
      const def    = ENEMY_DEFS[e.type];
      const hitRad = PLAYER_RADIUS + def.radius - 6;
      if (dist2(player.x, player.y, e.x, e.y) < hitRad * hitRad) {
        state.playerHp  = Math.max(0, state.playerHp - def.damage);
        player.invincibleUntil = now + 1400;
        state.screenFlashUntil = now + 280;
        state.enemies = state.enemies.filter(en => en.id !== e.id);
        spawnParticles(state, player.x, player.y, '#FF4757', 6);
        addFloatText(state, `-${def.damage}HP`, player.x, player.y - 25, '#FF4757');
        playSFX('hurt');
        onHpChange(state.playerHp);
        if (state.playerHp <= 0) { onDead(); return; }
        break;
      }
    }
  }

  // 7. Spawn enemies
  if (now - state.lastSpawnMs > state.spawnInterval) {
    spawnEnemy(state);
    state.lastSpawnMs = now;
  }

  if (now - state.lastPowerUpSpawnMs > POWER_UP_SPAWN_INTERVAL_MS && state.powerUps.length < 2) {
    spawnPowerUp(state, now);
    state.lastPowerUpSpawnMs = now;
  }

  onPowerChange({
    fireRateMsLeft: Math.max(0, Math.ceil(state.fireRateBoostUntil - now)),
    diagonalMsLeft: Math.max(0, Math.ceil(state.diagonalFireUntil - now)),
  });

  // 8. Particles
  state.particles = state.particles.filter(p => {
    p.life -= 2.2 * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.vx *= 0.92; p.vy *= 0.92;
    return p.life > 0;
  });

  // 9. Float texts
  state.floatTexts = state.floatTexts.filter(ft => {
    ft.life -= 1.6 * dt;
    ft.y += ft.vy * dt;
    return ft.life > 0;
  });
}

// ── Render helpers ────────────────────────────────────────────────────────────
function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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

function drawBackground(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#0E0B22');
  grad.addColorStop(1, '#1A1035');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = 'rgba(108,92,231,0.10)';
  ctx.lineWidth = 1;
  const gs = 44;
  for (let x = 0; x < W; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // Vignette
  const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
}

function drawTargetIndicator(ctx: CanvasRenderingContext2D, tx: number, ty: number, now: number) {
  const pulse = 0.4 + 0.3 * Math.sin(now * 0.009);
  ctx.globalAlpha = pulse;
  ctx.strokeStyle = '#4ECDC4';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.arc(tx, ty, 14, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
  // Cross-hair
  ctx.strokeStyle = 'rgba(78,205,196,0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(tx - 8, ty); ctx.lineTo(tx + 8, ty); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(tx, ty - 8); ctx.lineTo(tx, ty + 8); ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawPlayer(ctx: CanvasRenderingContext2D, p: Player, now: number) {
  const inv   = now < p.invincibleUntil;
  const flash = inv && Math.floor(now / 90) % 2 === 0;
  if (flash) return;

  ctx.save();
  ctx.translate(p.x, p.y);

  // Aura glow
  const aura = ctx.createRadialGradient(0, 0, 0, 0, 0, PLAYER_RADIUS * 2.2);
  aura.addColorStop(0, 'rgba(78,205,196,0.30)');
  aura.addColorStop(1, 'rgba(78,205,196,0)');
  ctx.fillStyle = aura;
  ctx.beginPath(); ctx.arc(0, 0, PLAYER_RADIUS * 2.2, 0, Math.PI * 2); ctx.fill();

  // Shadow
  ctx.shadowColor = '#4ECDC4';
  ctx.shadowBlur  = inv ? 24 : 14;

  // Body
  const body = ctx.createRadialGradient(-PLAYER_RADIUS * 0.3, -PLAYER_RADIUS * 0.3, 0, 0, 0, PLAYER_RADIUS);
  body.addColorStop(0, '#8EECEA');
  body.addColorStop(1, '#2AB7B0');
  ctx.fillStyle = body;
  ctx.beginPath(); ctx.arc(0, 0, PLAYER_RADIUS, 0, Math.PI * 2); ctx.fill();

  // Border
  ctx.strokeStyle = inv ? '#FFD93D' : '#A8DADC';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 0;
  ctx.stroke();

  // Icon
  ctx.font = `bold ${PLAYER_RADIUS * 0.72}px "Plus Jakarta Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#062B38';
  ctx.fillText('DD', 0, 1);

  ctx.restore();
}

function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy, now: number) {
  const def      = ENEMY_DEFS[e.type];
  const flashing = now < e.hitFlashUntil;

  ctx.save();
  ctx.translate(e.x, e.y);

  // Glow
  ctx.shadowColor = def.color;
  ctx.shadowBlur  = 14;

  // Body
  const body = ctx.createRadialGradient(-def.radius * 0.3, -def.radius * 0.3, 0, 0, 0, def.radius);
  body.addColorStop(0, flashing ? '#FFFFFF' : def.color + 'EE');
  body.addColorStop(1, flashing ? '#FFAAAA' : def.color + '88');
  ctx.fillStyle = body;
  ctx.beginPath(); ctx.arc(0, 0, def.radius, 0, Math.PI * 2); ctx.fill();

  ctx.shadowBlur = 0;

  // Threat label
  ctx.font = `bold ${Math.max(10, def.radius * 0.38)}px "Plus Jakarta Sans", sans-serif`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0,0,0,0.75)';
  ctx.shadowBlur = 4;
  ctx.fillText(def.icon, 0, 1);
  ctx.shadowBlur = 0;

  // HP bar (only for multi-HP enemies)
  if (def.hp > 1) {
    const bw = def.radius * 2.2;
    const bh = 4;
    const bx = -bw / 2;
    const by = -def.radius - 9;
    const pct = e.hp / e.maxHp;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    rrect(ctx, bx, by, bw, bh, 2); ctx.fill();
    ctx.fillStyle = pct > 0.5 ? '#2ECC71' : pct > 0.25 ? '#F39C12' : '#E74C3C';
    rrect(ctx, bx, by, bw * pct, bh, 2); ctx.fill();
  }

  ctx.restore();
}

function drawBullet(ctx: CanvasRenderingContext2D, b: Bullet) {
  ctx.save();
  ctx.shadowColor = b.boosted ? '#38BDF8' : '#FFD93D';
  ctx.shadowBlur  = b.boosted ? 14 : 10;
  ctx.fillStyle   = b.boosted ? '#A7F3D0' : '#FFD93D';
  ctx.beginPath(); ctx.arc(b.x, b.y, b.boosted ? BULLET_RADIUS + 1 : BULLET_RADIUS, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawPowerUp(ctx: CanvasRenderingContext2D, p: PowerUp, now: number) {
  const isRate = p.type === 'fire_rate';
  const color = isRate ? '#38BDF8' : '#FBBF24';
  const pulse = 1 + Math.sin(now * 0.008 + p.id) * 0.08;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(pulse, pulse);
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(0, 0, p.radius, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = isRate ? '#082F49' : '#3B2500';
  ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isRate ? 'RATE' : 'DIAG', 0, 1);
  ctx.restore();
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.globalAlpha = Math.max(0, p.life);
  ctx.fillStyle   = p.color;
  ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.5, p.r * p.life), 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
}

function drawFloatText(ctx: CanvasRenderingContext2D, ft: FloatText) {
  ctx.globalAlpha = Math.max(0, ft.life);
  ctx.font        = 'bold 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle   = ft.color;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor  = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur   = 5;
  ctx.fillText(ft.text, ft.x, ft.y);
  ctx.shadowBlur  = 0;
  ctx.globalAlpha = 1;
}

function render(ctx: CanvasRenderingContext2D, state: GameState, now: number) {
  const { W, H, player, enemies, bullets, powerUps, particles, floatTexts } = state;

  drawBackground(ctx, W, H);

  // Screen flash on player damage
  if (now < state.screenFlashUntil) {
    const alpha = 0.35 * ((state.screenFlashUntil - now) / 280);
    ctx.fillStyle = `rgba(255,71,87,${alpha})`;
    ctx.fillRect(0, 0, W, H);
  }

  // Target indicator
  if (player.moving) drawTargetIndicator(ctx, player.tx, player.ty, now);

  // Particles (behind entities)
  particles.forEach(p => drawParticle(ctx, p));

  powerUps.forEach(p => drawPowerUp(ctx, p, now));

  // Enemies
  enemies.forEach(e => drawEnemy(ctx, e, now));

  // Bullets
  bullets.forEach(b => drawBullet(ctx, b));

  // Player
  drawPlayer(ctx, player, now);

  // Float texts (top layer)
  floatTexts.forEach(ft => drawFloatText(ctx, ft));
}

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  onGameEnd: (result: GameResult) => void;
}

const GameScreen: React.FC<Props> = ({ onGameEnd }) => {
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const containerRef   = useRef<HTMLDivElement>(null);
  const stateRef       = useRef<GameState | null>(null);
  const activeRef      = useRef(true);
  const rafRef         = useRef(0);
  const onGameEndRef   = useRef(onGameEnd);
  const prevHpRef      = useRef(PLAYER_MAX_HP);
  const prevScoreRef   = useRef(0);
  const timeLeftRef    = useRef(GAME_SECS);
  onGameEndRef.current = onGameEnd;

  const [health,   setHealth]   = useState(PLAYER_MAX_HP);
  const [score,    setScore]    = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECS);
  const [muted,    setMuted]    = useState(false);
  const [wave,     setWave]     = useState(1);
  const [powerHud, setPowerHud] = useState<PowerUpHud>({ fireRateMsLeft: 0, diagonalMsLeft: 0 });

  useEffect(() => {
    const canvas    = canvasRef.current!;
    const container = containerRef.current!;
    const W = container.clientWidth;
    const H = container.clientHeight;
    canvas.width  = W;
    canvas.height = H;

    const state: GameState = {
      W, H,
      player: { x: W / 2, y: H * 0.62, tx: W / 2, ty: H * 0.62, moving: false, lastShotMs: 0, invincibleUntil: 0 },
      enemies: [], bullets: [], powerUps: [], particles: [], floatTexts: [],
      playerHp: PLAYER_MAX_HP, score: 0, killCount: 0,
      lastSpawnMs: -ENEMY_SPAWN_INTERVAL,
      lastPowerUpSpawnMs: performance.now() - POWER_UP_SPAWN_INTERVAL_MS + 2500,
      spawnInterval: ENEMY_SPAWN_INTERVAL,
      fireRateBoostUntil: 0,
      diagonalFireUntil: 0,
      wave: 1, screenFlashUntil: 0, nextId: 1,
    };
    stateRef.current = state;
    activeRef.current = true;
    startMusic();

    // 1-second timer
    const timerInt = setInterval(() => {
      if (!activeRef.current) return;
      timeLeftRef.current = Math.max(0, timeLeftRef.current - 1);
      setTimeLeft(timeLeftRef.current);

      // Difficulty ramp
      const elapsed = GAME_SECS - timeLeftRef.current;
      const ramps   = Math.min(5, Math.floor(elapsed / RAMP_INTERVAL_SECS));
      state.spawnInterval = Math.max(MIN_ENEMY_SPAWN_INTERVAL, ENEMY_SPAWN_INTERVAL - ramps * 220);
      state.wave = ramps + 1;
      setWave(ramps + 1);

      if (timeLeftRef.current <= 0) endGame(state);
    }, 1000);

    function endGame(s: GameState) {
      if (!activeRef.current) return;
      activeRef.current = false;
      cancelAnimationFrame(rafRef.current);
      clearInterval(timerInt);
      stopMusic();
      playSFX('gameover');
      const killScore   = Math.min(80, Math.round((s.killCount / KILL_TARGET) * 80));
      const healthScore = Math.round((s.playerHp / PLAYER_MAX_HP) * 20);
      onGameEndRef.current({
        score: s.score,
        killCount: s.killCount,
        healthRemaining: s.playerHp,
        maxHealth: PLAYER_MAX_HP,
        timeSurvivedSeconds: GAME_SECS - timeLeftRef.current,
        rawScore: Math.min(100, killScore + healthScore),
      });
    }

    // RAF game loop
    let lastTime = performance.now();
    function loop(now: number) {
      if (!activeRef.current) return;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      update(
        state, dt, now,
        (hp) => { if (hp !== prevHpRef.current) { prevHpRef.current = hp; setHealth(hp); } },
        (s)  => { if (s  !== prevScoreRef.current) { prevScoreRef.current = s; setScore(s); } },
        (p)  => setPowerHud((prev) => (
          Math.ceil(prev.fireRateMsLeft / 1000) === Math.ceil(p.fireRateMsLeft / 1000)
          && Math.ceil(prev.diagonalMsLeft / 1000) === Math.ceil(p.diagonalMsLeft / 1000)
            ? prev
            : p
        )),
        ()   => endGame(state),
      );

      const ctx = canvas.getContext('2d');
      if (ctx) render(ctx, state, now);

      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      activeRef.current = false;
      cancelAnimationFrame(rafRef.current);
      clearInterval(timerInt);
      stopMusic();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleInput(clientX: number, clientY: number) {
    const canvas = canvasRef.current!;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const s = stateRef.current;
    if (s) { s.player.tx = (clientX - rect.left) * scaleX; s.player.ty = (clientY - rect.top) * scaleY; }
  }

  function handleMute() {
    const next = !muted;
    setMuted(next);
    setAudioMuted(next);
    if (!next) playSFX('btn');
  }

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  const critical = timeLeft <= 10;
  const fireRateSecs = Math.ceil(powerHud.fireRateMsLeft / 1000);
  const diagonalSecs = Math.ceil(powerHud.diagonalMsLeft / 1000);

  return (
    <div className="flex flex-col h-screen" style={{ background: '#0E0B22' }}>

      {/* HUD */}
      <div
        className="flex items-center justify-between px-4 pt-3 pb-2 flex-shrink-0"
        style={{ background: 'rgba(14,11,34,0.97)', borderBottom: '1px solid rgba(108,92,231,0.3)' }}
      >
        {/* Health */}
        <div className="flex items-center gap-0.5">
          {Array.from({ length: PLAYER_MAX_HP }).map((_, i) => (
            <span key={i} className="inline-block w-3.5 h-3.5 rounded-sm" style={{ opacity: i < health ? 1 : 0.18, background: '#FF4757', boxShadow: i < health ? '0 0 8px rgba(255,71,87,0.7)' : 'none' }} />
          ))}
        </div>

        {/* Wave + Timer */}
        <div className="flex flex-col items-center">
          <div
            className="font-extrabold text-2xl tabular-nums"
            style={{ color: critical ? '#FF4757' : '#FFD93D', textShadow: critical ? '0 0 12px rgba(255,71,87,0.7)' : '0 0 8px rgba(255,217,61,0.4)' }}
          >
            {mm}:{ss}
          </div>
          <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#6C5CE7' }}>
            Wave {wave}
          </div>
          <div className="flex gap-1 mt-1 min-h-5">
            {fireRateSecs > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold" style={{ color: '#082F49', background: '#38BDF8' }}>
                RATE {fireRateSecs}s
              </span>
            )}
            {diagonalSecs > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold" style={{ color: '#3B2500', background: '#FBBF24' }}>
                DIAG {diagonalSecs}s
              </span>
            )}
          </div>
        </div>

        {/* Score + Mute */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="font-extrabold text-lg leading-none" style={{ color: '#FFD93D', textShadow: '0 0 8px rgba(255,217,61,0.4)' }}>
              {score}
            </div>
            <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#6C5CE7' }}>Score</div>
          </div>
          <button
            onClick={handleMute}
            className="w-9 h-9 rounded-full flex items-center justify-center btn-press flex-shrink-0"
            style={{ background: 'rgba(108,92,231,0.2)', border: '1px solid rgba(108,92,231,0.4)' }}
          >
            <span className="text-[10px] font-extrabold text-white">{muted ? 'OFF' : 'ON'}</span>
          </button>
        </div>
      </div>

      {/* Canvas arena */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none', cursor: 'crosshair' }}
          onClick={e => handleInput(e.clientX, e.clientY)}
          onTouchStart={e => { e.preventDefault(); const t = e.touches[0]; handleInput(t.clientX, t.clientY); }}
          onTouchMove={e => { e.preventDefault(); const t = e.touches[0]; handleInput(t.clientX, t.clientY); }}
        />
      </div>

      {/* Bottom hint */}
      <div
        className="text-center py-2 flex-shrink-0 text-[10px] font-bold uppercase tracking-widest"
        style={{ background: 'rgba(14,11,34,0.97)', color: '#6C5CE7', borderTop: '1px solid rgba(108,92,231,0.2)' }}
      >
        Collect RATE and DIAG boosts | Tap to move | Stand still to auto-shoot
      </div>
    </div>
  );
};

export default GameScreen;
