import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameResult } from '../types';
import HowToPlayPopup from './HowToPlayPopup';
import imgPlayerSrc    from '../src/assets/player_ship.png';
import imgAccidentSrc from '../src/assets/enemy_accident.png';
import imgIllnessSrc  from '../src/assets/enemy_illness.png';
import imgDebtSrc     from '../src/assets/enemy_debt.png';
import imgBossSrc     from '../src/assets/enemy_boss.png';
import imgShieldSrc   from '../src/assets/powerup_shield.png';

// ── Audio ───────────────────────────────────────────────────────────────
let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicTimer: ReturnType<typeof setTimeout> | null = null;
let musicSeqIdx = 0;

function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(audioCtx.destination);
  }
  return audioCtx;
}

function playNote(freq: number, type: OscillatorType, vol: number, dur: number, delay = 0) {
  const ctx = getAudioCtx();
  if (!masterGain) return;
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(masterGain);
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.start(t);
  osc.stop(t + dur + 0.01);
}

function playSFX(type: 'shoot' | 'hit' | 'explode' | 'playerHit' | 'gameover' | 'wave' | 'powerup') {
  try {
    if (type === 'shoot')     playNote(1320, 'square', 0.08, 0.05);
    if (type === 'hit')       { playNote(440, 'sawtooth', 0.18, 0.08); playNote(330, 'sawtooth', 0.12, 0.08, 0.04); }
    if (type === 'explode')   { [200, 140, 90].forEach((f, i) => playNote(f, 'sawtooth', 0.25, 0.18, i * 0.05)); }
    if (type === 'playerHit') { [280, 180, 120].forEach((f, i) => playNote(f, 'sawtooth', 0.35, 0.22, i * 0.06)); }
    if (type === 'gameover')  { [523, 440, 349, 262].forEach((f, i) => playNote(f, 'sine', 0.28, 0.3, i * 0.22)); }
    if (type === 'wave')      { [523, 659, 784, 1047].forEach((f, i) => playNote(f, 'sine', 0.25, 0.18, i * 0.12)); }
    if (type === 'powerup')   { [523, 659, 784, 1047, 1319].forEach((f, i) => playNote(f, 'sine', 0.2, 0.16, i * 0.08)); }
  } catch { /* ignore audio errors */ }
}

const MUSIC_NOTES = [261, 0, 330, 0, 392, 330, 0, 261, 0, 523, 0, 392, 0, 440, 392, 0];
function startBgMusic() {
  if (musicTimer) return;
  function tick() {
    const freq = MUSIC_NOTES[musicSeqIdx % MUSIC_NOTES.length];
    if (freq) playNote(freq, 'triangle', 0.055, 0.22);
    musicSeqIdx++;
    musicTimer = setTimeout(tick, 270);
  }
  tick();
}
function stopBgMusic() {
  if (musicTimer) { clearTimeout(musicTimer); musicTimer = null; }
}

// ── Game types ──────────────────────────────────────────────────────────
type EnemyType = 'accident' | 'illness' | 'debt' | 'boss';
type EnemyState = 'entry' | 'formation' | 'diving' | 'returning';

interface Star { x: number; y: number; r: number; speed: number; alpha: number }
interface Bullet { x: number; y: number; active: boolean }
interface EnemyBullet { x: number; y: number; active: boolean; speed: number }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; r: number; color: string }
interface PowerUp { x: number; y: number; vy: number; active: boolean }

interface Enemy {
  id: number; type: EnemyType; formRow: number; formCol: number;
  x: number; y: number; hp: number; maxHp: number;
  state: EnemyState; diveT: number;
  diveStartX: number; diveStartY: number; diveTargetX: number; diveTargetY: number;
  points: number; hitFlash: number;
}

interface Player {
  x: number; y: number; w: number; h: number;
  lives: number; shield: number; invincible: number;
}

// ── Config ──────────────────────────────────────────────────────────────
const BULLET_SPEED    = 500;
const ENEMY_B_SPEED   = 110;
const FIRE_INTERVAL   = 0.28;
const DIVE_DURATION   = 3.0;
const INVINCIBLE_DUR  = 2.2;
const SHIELD_DUR      = 4.0;
const FORM_ROWS       = 3;
const FORM_COLS       = 5;

const ECFG: Record<EnemyType, { hp: number; pts: number; color: string; accent: string; fireRate: number }> = {
  accident: { hp: 1, pts: 100,  color: '#FF4444', accent: '#FF8800', fireRate: 0.007 },
  illness:  { hp: 2, pts: 200,  color: '#33DD44', accent: '#AAFF00', fireRate: 0.011 },
  debt:     { hp: 2, pts: 250,  color: '#AA33FF', accent: '#FF44FF', fireRate: 0.013 },
  boss:     { hp: 8, pts: 1000, color: '#FF1111', accent: '#FF6600', fireRate: 0.032 },
};

type WaveDef = { grid: EnemyType[][]; formSpeed: number; diveInterval: number };
const WAVES: WaveDef[] = [
  {
    grid: [
      ['accident','accident','accident','accident','accident'],
      ['accident','accident','accident','accident','accident'],
      ['accident','accident','accident','accident','accident'],
    ],
    formSpeed: 38, diveInterval: 5.5,
  },
  {
    grid: [
      ['illness','illness','illness','illness','illness'],
      ['debt','debt','debt','debt','debt'],
      ['illness','debt','illness','debt','illness'],
    ],
    formSpeed: 54, diveInterval: 4.2,
  },
  {
    grid: [
      ['debt','illness','boss','illness','debt'],
      ['illness','debt','illness','debt','illness'],
      ['accident','accident','accident','accident','accident'],
    ],
    formSpeed: 68, diveInterval: 3.2,
  },
];

// ── Component ────────────────────────────────────────────────────────────
interface Props { onGameEnd: (result: GameResult) => void }

const GameScreen: React.FC<Props> = ({ onGameEnd }) => {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [showHTP, setShowHTP]   = useState(true);
  const [muted, setMuted]       = useState(false);
  const [hud, setHud]           = useState({ score: 0, lives: 3, wave: 1, shield: 0, state: 'idle' as string });

  const started     = useRef(false);
  const stateRef    = useRef<'playing'|'transition'|'over'|'victory'>('playing');
  const scoreRef    = useRef(0);
  const waveIdxRef  = useRef(0);
  const gainsRef    = useRef(0);
  const lossesRef   = useRef(0);
  const seenRef     = useRef(0);
  const killedRef   = useRef(0);
  const startTsRef  = useRef(0);
  const lastTsRef   = useRef(0);
  const rafRef      = useRef(0);
  const nextDiveRef = useRef(0);
  const fireTRef    = useRef(0);
  const transTimerRef = useRef(0);
  const frameRef    = useRef(0);
  const endCalledRef = useRef(false);

  const starsRef       = useRef<Star[]>([]);
  const playerRef      = useRef<Player>({ x: 180, y: 570, w: 38, h: 34, lives: 3, shield: 0, invincible: 0 });
  const bulletsRef     = useRef<Bullet[]>([]);
  const enemiesRef     = useRef<Enemy[]>([]);
  const eBulletsRef    = useRef<EnemyBullet[]>([]);
  const particlesRef   = useRef<Particle[]>([]);
  const powerUpsRef    = useRef<PowerUp[]>([]);

  const isDragging = useRef(false);
  const targetX    = useRef(180);
  const canvasW    = useRef(360);
  const canvasH    = useRef(640);

  // Pre-loaded sprite images
  const spritesRef = useRef<Record<string, HTMLImageElement>>({});
  useEffect(() => {
    const toLoad: [string, string][] = [
      ['player',   imgPlayerSrc],
      ['accident', imgAccidentSrc],
      ['illness',  imgIllnessSrc],
      ['debt',     imgDebtSrc],
      ['boss',     imgBossSrc],
      ['shield',   imgShieldSrc],
    ];
    toLoad.forEach(([key, src]) => {
      const img = new Image();
      img.src = src;
      spritesRef.current[key] = img;
    });
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────
  function initStars(W: number, H: number) {
    starsRef.current = Array.from({ length: 90 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 55 + 20,
      alpha: Math.random() * 0.7 + 0.3,
    }));
  }

  function initWave(wIdx: number, W: number) {
    const def = WAVES[wIdx];
    const cellW = Math.min(56, (W - 20) / FORM_COLS);
    const formLeft = (W - FORM_COLS * cellW) / 2;
    const enemies: Enemy[] = [];
    let id = 0;
    for (let row = 0; row < FORM_ROWS; row++) {
      for (let col = 0; col < FORM_COLS; col++) {
        const type = def.grid[row]?.[col] ?? 'accident';
        const cfg = ECFG[type];
        enemies.push({
          id: id++, type,
          formRow: row, formCol: col,
          x: formLeft + col * cellW + cellW / 2,
          y: -120 - row * 48,
          hp: cfg.hp, maxHp: cfg.hp,
          state: 'entry', diveT: 0,
          diveStartX: 0, diveStartY: 0,
          diveTargetX: 0, diveTargetY: 0,
          points: cfg.pts, hitFlash: 0,
        });
        seenRef.current++;
      }
    }
    enemiesRef.current = enemies;
    bulletsRef.current = [];
    eBulletsRef.current = [];
    nextDiveRef.current = def.diveInterval;
    fireTRef.current = FIRE_INTERVAL;
  }

  function spawnBurst(x: number, y: number, color: string, n = 12) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const sp = Math.random() * 130 + 40;
      particlesRef.current.push({
        x, y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: 0.55 + Math.random() * 0.4, maxLife: 1,
        r: Math.random() * 4 + 1.5, color,
      });
    }
  }

  // ── Draw helpers ────────────────────────────────────────────────────────
  function drawPlayer(ctx: CanvasRenderingContext2D, p: Player, ts: number) {
    if (p.invincible > 0 && Math.floor(ts / 110) % 2 === 0) return;
    ctx.save();
    ctx.translate(p.x, p.y);
    if (p.shield > 0) {
      // Translucent glowing shield dome around the ship
      const shieldGrd = ctx.createRadialGradient(0, 0, 18, 0, 0, 34);
      const alpha = 0.45 + 0.2 * Math.sin(ts / 80);
      shieldGrd.addColorStop(0, 'rgba(0, 223, 255, 0)');
      shieldGrd.addColorStop(0.85, `rgba(0, 223, 255, ${alpha * 0.4})`);
      shieldGrd.addColorStop(1, `rgba(255, 255, 255, ${alpha})`);

      ctx.beginPath();
      ctx.arc(0, 0, 34, 0, Math.PI * 2);
      ctx.fillStyle = shieldGrd;
      ctx.fill();

      // Glowing outer border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00DFFF';
      ctx.stroke();
      ctx.shadowBlur = 0; // reset shadow
    }
    const img = spritesRef.current['player'];
    if (img && img.complete && img.naturalWidth > 0) {
      const hw = 28, hh = 28;
      ctx.drawImage(img, -hw, -hh, hw * 2, hh * 2);
    } else {
      // Fallback procedural ship
      ctx.beginPath();
      ctx.moveTo(0, -17); ctx.lineTo(13, 2); ctx.lineTo(11, 12);
      ctx.lineTo(0, 7);   ctx.lineTo(-11, 12); ctx.lineTo(-13, 2);
      ctx.closePath();
      ctx.fillStyle = '#1A7FFF'; ctx.fill();
      ctx.strokeStyle = '#00DFFF'; ctx.lineWidth = 1.5; ctx.stroke();
    }
    ctx.restore();
  }

  function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy) {
    const cfg = ECFG[e.type];
    const isBoss = e.type === 'boss';
    const hw = isBoss ? 26 : 18;
    ctx.save();
    ctx.translate(e.x, e.y);

    if (e.hitFlash > 0) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }

    const spriteKey = e.type === 'accident' ? 'accident'
                    : e.type === 'illness'  ? 'illness'
                    : e.type === 'debt'     ? 'debt'
                    : 'boss';
    const img = spritesRef.current[spriteKey];

    if (img && img.complete && img.naturalWidth > 0) {
      if (e.hitFlash > 0) {
        // White flash overlay
        ctx.filter = 'brightness(10)';
      }
      ctx.drawImage(img, -hw, -hw, hw * 2, hw * 2);
      ctx.filter = 'none';
    } else {
      // Fallback procedural shapes
      const color  = e.hitFlash > 0 ? '#FFFFFF' : cfg.color;
      const accent = e.hitFlash > 0 ? '#FFFFFF' : cfg.accent;
      if (isBoss) {
        ctx.beginPath();
        ctx.moveTo(0, -23); ctx.lineTo(21, -8); ctx.lineTo(23, 10);
        ctx.lineTo(11, 23); ctx.lineTo(-11, 23); ctx.lineTo(-23, 10); ctx.lineTo(-21, -8);
        ctx.closePath();
        ctx.fillStyle = color; ctx.fill();
        ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.stroke();
      } else if (e.type === 'accident') {
        ctx.beginPath();
        ctx.moveTo(0, -15); ctx.lineTo(8, -4); ctx.lineTo(15, -9);
        ctx.lineTo(11, 4);  ctx.lineTo(15, 14); ctx.lineTo(0, 8);
        ctx.lineTo(-15, 14); ctx.lineTo(-11, 4); ctx.lineTo(-15, -9); ctx.lineTo(-8, -4);
        ctx.closePath();
        ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = accent; ctx.lineWidth = 1.5; ctx.stroke();
      } else if (e.type === 'illness') {
        ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = accent; ctx.lineWidth = 1.5; ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(0, -16); ctx.lineTo(7, -7); ctx.lineTo(16, -11);
        ctx.lineTo(12, 0);  ctx.lineTo(16, 12); ctx.lineTo(0, 7);
        ctx.lineTo(-16, 12); ctx.lineTo(-12, 0); ctx.lineTo(-16, -11); ctx.lineTo(-7, -7);
        ctx.closePath();
        ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = accent; ctx.lineWidth = 1.5; ctx.stroke();
      }
    }

    // Boss HP bar
    if (isBoss && e.hp < e.maxHp) {
      ctx.filter = 'none'; ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(-22, hw + 4, 44, 5);
      ctx.fillStyle = '#FF3333';
      ctx.fillRect(-22, hw + 4, 44 * (e.hp / e.maxHp), 5);
    }
    ctx.restore();
  }

  // ── Game loop ─────────────────────────────────────────────────────────
  function launchLoop() {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext('2d')!;
    const W = canvas.width, H = canvas.height;
    canvasW.current = W; canvasH.current = H;

    initStars(W, H);
    const p = playerRef.current;
    p.x = W / 2; p.y = H - 190;
    p.lives = 3; p.shield = 0; p.invincible = 0;
    targetX.current = W / 2;
    waveIdxRef.current = 0;
    scoreRef.current = 0; gainsRef.current = 0; lossesRef.current = 0;
    seenRef.current = 0; killedRef.current = 0;
    endCalledRef.current = false;
    particlesRef.current = []; powerUpsRef.current = [];
    stateRef.current = 'playing';
    initWave(0, W);
    startTsRef.current = performance.now();
    startBgMusic();

    function loop(ts: number) {
      const dt = Math.min((ts - lastTsRef.current) / 1000, 0.05);
      lastTsRef.current = ts;
      frameRef.current++;

      if (frameRef.current % 10 === 0) {
        setHud({ score: scoreRef.current, lives: p.lives, wave: waveIdxRef.current + 1, shield: p.shield, state: stateRef.current });
      }

      // -- Stars
      for (const s of starsRef.current) {
        s.y += s.speed * dt;
        if (s.y > H) { s.y = -2; s.x = Math.random() * W; }
      }

      const gst = stateRef.current;
      if (gst === 'playing') {
        const wdef = WAVES[waveIdxRef.current];

        // Player movement
        const dx = targetX.current - p.x;
        if (Math.abs(dx) > 2) p.x += Math.sign(dx) * Math.min(Math.abs(dx), 230 * dt);
        p.x = Math.max(22, Math.min(W - 22, p.x));

        // Timers
        if (p.shield > 0)     p.shield     -= dt;
        if (p.invincible > 0) p.invincible -= dt;

        // Auto-fire
        fireTRef.current -= dt;
        if (fireTRef.current <= 0) {
          bulletsRef.current.push({ x: p.x, y: p.y - 20, active: true });
          playSFX('shoot');
          fireTRef.current = FIRE_INTERVAL;
        }

        // Player bullets
        bulletsRef.current.forEach(b => { if (b.active) b.y -= BULLET_SPEED * dt; });
        bulletsRef.current = bulletsRef.current.filter(b => b.active && b.y > -15);

        // Enemy bullets
        eBulletsRef.current.forEach(eb => {
          if (!eb.active) return;
          eb.y += eb.speed * dt;
          if (eb.y > H + 15) { eb.active = false; return; }
          if (p.shield <= 0 && p.invincible <= 0) {
            if (Math.abs(eb.x - p.x) < 17 && Math.abs(eb.y - p.y) < 17) {
              eb.active = false;
              playerHit();
            }
          }
        });
        eBulletsRef.current = eBulletsRef.current.filter(eb => eb.active);

        // Formation oscillation
        const osc = Math.sin(ts / 1600) * W * 0.16;
        const cellW = Math.min(56, (W - 20) / FORM_COLS);
        const formLeft0 = (W - FORM_COLS * cellW) / 2;
        const formLeft  = formLeft0 + osc;
        const formTop   = 54;

        // Dive trigger
        nextDiveRef.current -= dt;
        if (nextDiveRef.current <= 0) {
          const pool = enemiesRef.current.filter(e => e.state === 'formation');
          if (pool.length > 0) {
            const e = pool[Math.floor(Math.random() * pool.length)];
            e.state = 'diving'; e.diveT = 0;
            e.diveStartX = e.x; e.diveStartY = e.y;
            e.diveTargetX = p.x + (Math.random() - 0.5) * 50;
            e.diveTargetY = H + 35;
          }
          nextDiveRef.current = wdef.diveInterval * (0.65 + Math.random() * 0.7);
        }

        // Enemies update
        for (const e of enemiesRef.current) {
          if (e.hitFlash > 0) e.hitFlash -= dt;

          if (e.state === 'entry') {
            const tx = formLeft + e.formCol * cellW + cellW / 2;
            const ty = formTop + e.formRow * 48;
            e.x += (tx - e.x) * Math.min(1, dt * 2.8);
            e.y += (ty - e.y) * Math.min(1, dt * 2.8);
            if (Math.abs(e.y - ty) < 3) e.state = 'formation';
          } else if (e.state === 'formation') {
            const tx = formLeft + e.formCol * cellW + cellW / 2;
            const ty = formTop + e.formRow * 48;
            e.x += (tx - e.x) * Math.min(1, dt * 4);
            e.y += (ty - e.y) * Math.min(1, dt * 4);
            if (Math.random() < ECFG[e.type].fireRate) {
              eBulletsRef.current.push({ x: e.x, y: e.y + 14, active: true, speed: ENEMY_B_SPEED + Math.random() * 60 });
            }
          } else if (e.state === 'diving') {
            e.diveT += dt;
            const t = e.diveT / DIVE_DURATION;
            if (t >= 1) { e.state = 'returning'; e.diveT = 0; e.diveStartX = e.x; e.diveStartY = e.y; }
            else {
              const cx1 = e.diveStartX + (e.diveTargetX - e.diveStartX) * 0.25, cy1 = e.diveStartY + 200;
              const cx2 = e.diveTargetX, cy2 = e.diveTargetY - 200;
              const mt = 1 - t;
              e.x = mt*mt*mt*e.diveStartX + 3*mt*mt*t*cx1 + 3*mt*t*t*cx2 + t*t*t*e.diveTargetX;
              e.y = mt*mt*mt*e.diveStartY + 3*mt*mt*t*cy1 + 3*mt*t*t*cy2 + t*t*t*e.diveTargetY;
              if (Math.random() < ECFG[e.type].fireRate * 2.5) {
                eBulletsRef.current.push({ x: e.x, y: e.y + 14, active: true, speed: ENEMY_B_SPEED + 90 });
              }
              if (p.invincible <= 0 && p.shield <= 0) {
                const d2 = Math.hypot(e.x - p.x, e.y - p.y);
                if (d2 < 28) {
                  spawnBurst(e.x, e.y, ECFG[e.type].color, 10);
                  e.hp = 0;
                  enemiesRef.current = enemiesRef.current.filter(x => x.id !== e.id);
                  playerHit();
                }
              }
            }
          } else if (e.state === 'returning') {
            const tx = formLeft + e.formCol * cellW + cellW / 2;
            const ty = formTop + e.formRow * 48;
            const dist = Math.hypot(tx - e.x, ty - e.y);
            if (dist < 5) { e.state = 'formation'; }
            else { const sp = 230; e.x += ((tx - e.x) / dist) * sp * dt; e.y += ((ty - e.y) / dist) * sp * dt; }
          }
        }

        // Bullet-enemy collision
        outer: for (const b of bulletsRef.current) {
          if (!b.active) continue;
          for (let ei = enemiesRef.current.length - 1; ei >= 0; ei--) {
            const e = enemiesRef.current[ei];
            const hs = e.type === 'boss' ? 26 : 18;
            if (Math.abs(b.x - e.x) < hs && Math.abs(b.y - e.y) < hs) {
              b.active = false;
              e.hp--; e.hitFlash = 0.12;
              playSFX('hit');
              if (e.hp <= 0) {
                const pts = e.points * (waveIdxRef.current + 1);
                scoreRef.current += pts; gainsRef.current += pts; killedRef.current++;
                spawnBurst(e.x, e.y, ECFG[e.type].color, e.type === 'boss' ? 24 : 12);
                playSFX('explode');
                if (Math.random() < 0.15) powerUpsRef.current.push({ x: e.x, y: e.y, vy: 75, active: true });
                enemiesRef.current.splice(ei, 1);
              }
              continue outer;
            }
          }
        }
        bulletsRef.current = bulletsRef.current.filter(b => b.active);

        // Power-ups
        powerUpsRef.current.forEach(pu => {
          if (!pu.active) return;
          pu.y += pu.vy * dt;
          if (pu.y > H + 20) { pu.active = false; return; }
          if (Math.hypot(pu.x - p.x, pu.y - p.y) < 28) {
            pu.active = false;
            p.shield = SHIELD_DUR;
            scoreRef.current += 200; gainsRef.current += 200;
            playSFX('powerup');
          }
        });
        powerUpsRef.current = powerUpsRef.current.filter(pu => pu.active);

        // Wave clear
        if (enemiesRef.current.length === 0) {
          const bonus = 600 * (waveIdxRef.current + 1);
          scoreRef.current += bonus; gainsRef.current += bonus;
          playSFX('wave');
          if (waveIdxRef.current >= WAVES.length - 1) {
            scoreRef.current += p.lives * 400; gainsRef.current += p.lives * 400;
            endGame(true);
          } else {
            stateRef.current = 'transition';
            transTimerRef.current = 2.8;
          }
        }
      } else if (gst === 'transition') {
        transTimerRef.current -= dt;
        if (transTimerRef.current <= 0) {
          waveIdxRef.current++;
          initWave(waveIdxRef.current, W);
          stateRef.current = 'playing';
        }
      }

      // Particles
      particlesRef.current.forEach(pt => { pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy += 55 * dt; pt.life -= dt; });
      particlesRef.current = particlesRef.current.filter(pt => pt.life > 0);

      // ─── DRAW ──────────────────────────────────────────────────────────
      ctx.fillStyle = '#04080F';
      ctx.fillRect(0, 0, W, H);

      // Stars
      for (const s of starsRef.current) {
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`; ctx.fill();
      }
      // Nebula
      const neb = ctx.createRadialGradient(W * 0.75, H * 0.25, 0, W * 0.75, H * 0.25, W * 0.65);
      neb.addColorStop(0, 'rgba(25,0,70,0.18)'); neb.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = neb; ctx.fillRect(0, 0, W, H);

      if (gst === 'playing' || gst === 'transition') {
        // Enemies
        for (const e of enemiesRef.current) drawEnemy(ctx, e);

        // Enemy bullets
        for (const eb of eBulletsRef.current) {
          ctx.beginPath(); ctx.rect(eb.x - 2, eb.y - 7, 4, 14);
          ctx.fillStyle = '#FF5533'; ctx.fill();
          const rg = ctx.createRadialGradient(eb.x, eb.y, 0, eb.x, eb.y, 9);
          rg.addColorStop(0, 'rgba(255,80,0,0.35)'); rg.addColorStop(1, 'rgba(255,80,0,0)');
          ctx.beginPath(); ctx.arc(eb.x, eb.y, 9, 0, Math.PI * 2);
          ctx.fillStyle = rg; ctx.fill();
        }

        // Player bullets
        for (const b of bulletsRef.current) {
          ctx.beginPath(); ctx.rect(b.x - 2, b.y - 11, 4, 22);
          ctx.fillStyle = '#00DFFF'; ctx.fill();
          const bg2 = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 8);
          bg2.addColorStop(0, 'rgba(0,220,255,0.5)'); bg2.addColorStop(1, 'rgba(0,220,255,0)');
          ctx.beginPath(); ctx.arc(b.x, b.y, 8, 0, Math.PI * 2);
          ctx.fillStyle = bg2; ctx.fill();
        }

        // Power-ups
        for (const pu of powerUpsRef.current) {
          ctx.save();
          ctx.translate(pu.x, pu.y);
          
          // Outer glowing pulse animation
          const pulse = 1 + 0.12 * Math.sin(ts / 120);
          ctx.scale(pulse, pulse);

          // Glowing energy halo
          const glowGrd = ctx.createRadialGradient(0, 0, 2, 0, 0, 16);
          glowGrd.addColorStop(0, 'rgba(0, 223, 255, 0.85)');
          glowGrd.addColorStop(0.5, 'rgba(0, 150, 255, 0.3)');
          glowGrd.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.beginPath();
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
          ctx.fillStyle = glowGrd;
          ctx.fill();

          // Draw the high-quality shield crest path
          ctx.beginPath();
          // Top curved edge
          ctx.moveTo(-10, -9);
          ctx.quadraticCurveTo(0, -13, 10, -9);
          // Right edge curving down to pointed bottom
          ctx.quadraticCurveTo(11, 2, 0, 13);
          // Left edge curving back up to top left
          ctx.quadraticCurveTo(-11, 2, -10, -9);
          ctx.closePath();

          // Metallic shield filling gradient
          const metalGrd = ctx.createLinearGradient(-10, -9, 10, 13);
          metalGrd.addColorStop(0, '#00DFFF');
          metalGrd.addColorStop(0.5, '#003DA6');
          metalGrd.addColorStop(1, '#001F60');
          ctx.fillStyle = metalGrd;
          ctx.fill();

          // Outer glowing border
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#00DFFF';
          ctx.stroke();
          ctx.shadowBlur = 0; // reset shadow

          // Inner emblem - protective white cross
          ctx.beginPath();
          ctx.moveTo(0, -5);
          ctx.lineTo(0, 5);
          ctx.moveTo(-4, 0);
          ctx.lineTo(4, 0);
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.8;
          ctx.stroke();

          ctx.restore();
        }

        // Control zone indicator (slide area below ship)
        {
          const zoneY = H - 130;
          ctx.save();
          const zg = ctx.createLinearGradient(0, zoneY, 0, H);
          zg.addColorStop(0, 'rgba(0,200,255,0)');
          zg.addColorStop(1, 'rgba(0,200,255,0.10)');
          ctx.fillStyle = zg;
          ctx.fillRect(0, zoneY, W, H - zoneY);
          ctx.beginPath(); ctx.moveTo(16, zoneY); ctx.lineTo(W - 16, zoneY);
          ctx.strokeStyle = 'rgba(0,220,255,0.30)'; ctx.lineWidth = 1;
          ctx.setLineDash([5, 5]); ctx.stroke(); ctx.setLineDash([]);
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.font = `bold ${Math.min(12, W * 0.034)}px sans-serif`;
          ctx.fillStyle = 'rgba(0,220,255,0.50)';
          ctx.fillText('\u25c4  slide to move  \u25ba', W / 2, zoneY + 34);
          ctx.restore();
        }

        // Player
        drawPlayer(ctx, playerRef.current, ts);

        // Level transition overlay
        if (gst === 'transition') {
          ctx.fillStyle = 'rgba(0,0,0,0.52)'; ctx.fillRect(0, 0, W, H);
          ctx.textAlign = 'center';
          ctx.font = `bold ${Math.min(30, W * 0.085)}px sans-serif`;
          ctx.fillStyle = '#00DFFF';
          ctx.fillText(`LEVEL ${waveIdxRef.current + 1} CLEARED!`, W / 2, H / 2 - 18);
          ctx.font = `bold ${Math.min(18, W * 0.05)}px sans-serif`;
          ctx.fillStyle = '#FFD700';
          ctx.fillText(`Level ${waveIdxRef.current + 2} approaching...`, W / 2, H / 2 + 18);
        }
      }

      // Particles
      for (const pt of particlesRef.current) {
        ctx.save(); ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
        ctx.fillStyle = pt.color; ctx.fill();
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    lastTsRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
  }

  function playerHit() {
    const p = playerRef.current;
    if (p.invincible > 0) return;
    p.lives--;
    lossesRef.current += 600;
    p.invincible = INVINCIBLE_DUR;
    playSFX('playerHit');
    if (p.lives <= 0) endGame(false);
  }

  function endGame(victory: boolean) {
    if (endCalledRef.current) return;
    endCalledRef.current = true;
    stopBgMusic();
    playSFX(victory ? 'wave' : 'gameover');
    cancelAnimationFrame(rafRef.current);
    const dur = (performance.now() - startTsRef.current) / 1000;
    const result: GameResult = {
      portfolio: Math.max(0, scoreRef.current),
      molesSeen: seenRef.current,
      molesWhacked: killedRef.current,
      goodWhacks: killedRef.current,
      badWhacks: 3 - Math.max(0, playerRef.current.lives),
      timeSeconds: Math.round(dur),
      rawScore: scoreRef.current,
      gains: gainsRef.current,
      losses: lossesRef.current,
    };
    setTimeout(() => onGameEnd(result), 1600);
  }

  // ── Resize ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current!;
    const canvas = canvasRef.current!;
    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      canvasW.current = canvas.width;
      canvasH.current = canvas.height;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // ── Keyboard ────────────────────────────────────────────────────────────
  useEffect(() => {
    const keys: Record<string, boolean> = {};
    const kd = (e: KeyboardEvent) => { keys[e.key] = true; };
    const ku = (e: KeyboardEvent) => { keys[e.key] = false; };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    const iv = setInterval(() => {
      if (stateRef.current !== 'playing') return;
      const W = canvasW.current;
      if (keys['ArrowLeft'] || keys['a'] || keys['A']) targetX.current = Math.max(22, targetX.current - 220 * 0.016);
      if (keys['ArrowRight'] || keys['d'] || keys['D']) targetX.current = Math.min(W - 22, targetX.current + 220 * 0.016);
    }, 16);
    return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); clearInterval(iv); };
  }, []);

  // ── Mute ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (audioCtx && masterGain) masterGain.gain.setTargetAtTime(muted ? 0 : 1, audioCtx.currentTime, 0.05);
  }, [muted]);

  // ── Cleanup ────────────────────────────────────────────────────────────
  useEffect(() => () => { cancelAnimationFrame(rafRef.current); stopBgMusic(); }, []);

  // ── Touch / Mouse ───────────────────────────────────────────────────────
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); isDragging.current = true;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    targetX.current = e.touches[0].clientX - rect.left;
  }, []);
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); if (!isDragging.current) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    targetX.current = e.touches[0].clientX - rect.left;
  }, []);
  const onTouchEnd = useCallback(() => { isDragging.current = false; }, []);
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (stateRef.current !== 'playing') return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    targetX.current = e.clientX - rect.left;
  }, []);

  const handleStart = useCallback(() => {
    setShowHTP(false);
    if (!started.current) { started.current = true; launchLoop(); }
  }, []);

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-[#04080F] select-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseMove={onMouseMove}
        style={{ touchAction: 'none' }}
      />

      {/* HUD */}
      {!showHTP && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4"
          style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))', paddingBottom: '0.4rem' }}>
          <div className="flex items-center gap-1">
            {[0, 1, 2].map(i => (
              <span key={i} className="text-[1.1rem]" style={{ opacity: i < hud.lives ? 1 : 0.2 }}>❤️</span>
            ))}
          </div>
          <div className="rounded-full bg-black/55 px-3 py-[0.2rem] text-center backdrop-blur">
            <span className="text-[0.6rem] font-bold uppercase tracking-wider" style={{ color: '#00CFFF' }}>Level  </span>
            <span className="text-[0.9rem] font-extrabold text-white">{hud.wave}</span>
            <span className="text-[0.6rem] font-bold" style={{ color: '#00CFFF' }}>/3</span>
          </div>
          <div className="text-right">
            <div className="text-[0.58rem] font-bold uppercase tracking-wider" style={{ color: '#00CFFF' }}>Score</div>
            <div className="text-[0.95rem] font-extrabold text-white">{hud.score.toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* Shield timer */}
      {!showHTP && hud.shield > 0 && (
        <div className="pointer-events-none absolute bottom-20 inset-x-0 z-10 flex justify-center">
          <div className="rounded-full bg-cyan-900/70 px-4 py-1 text-[0.73rem] font-bold text-cyan-300 backdrop-blur">
            🛡️ Shield active {hud.shield.toFixed(1)}s
          </div>
        </div>
      )}

      {/* Mute */}
      {!showHTP && (
        <button
          className="absolute bottom-4 right-4 z-10 rounded-full bg-black/50 p-2 text-lg"
          onClick={() => setMuted(m => !m)}
          style={{ pointerEvents: 'auto' }}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      )}

      {showHTP && <HowToPlayPopup onStart={handleStart} />}
    </div>
  );
};

export default GameScreen;
