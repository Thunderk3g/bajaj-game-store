import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GameResult, ItemType } from '../types';
import {
  GAME_SECS,
  GREEN,
  ITEM_DEFS,
  TARGET_PORTFOLIO,
  HERO_IMAGE,
  SHIELD_IMAGE,
  MISSILE_IMAGE,
  ZAPPER_IMAGE,
  COIN_IMAGE,
  SKYLINE_IMAGE,
} from '../constants';
import HowToPlayPopup from './HowToPlayPopup';

// ─── Audio Synthesizer (Web Audio API) ────────────────────────────────────────
let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let musicTimer: ReturnType<typeof setTimeout> | null = null;
let beat = 0;

const MUSIC_NOTES = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33];
const MUSIC_PATTERN = [0, 2, 4, 2, 1, 3, 5, 3, 0, 4, 2, 5, 1, 3, 4, 2];

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(audioCtx.destination);
    musicGain = audioCtx.createGain();
    musicGain.gain.value = 0.08;
    musicGain.connect(masterGain);
  }
  return audioCtx;
}

function beatTick() {
  const ctx = getCtx();
  const freq = MUSIC_NOTES[MUSIC_PATTERN[beat % MUSIC_PATTERN.length]];
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(musicGain!);
  osc.type = 'triangle';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.5, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
  osc.start();
  osc.stop(ctx.currentTime + 0.22);
  beat++;
  if (beat % 4 === 0) {
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bass.connect(bassGain);
    bassGain.connect(musicGain!);
    bass.type = 'sine';
    bass.frequency.value = freq / 2;
    bassGain.gain.setValueAtTime(0.4, ctx.currentTime);
    bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    bass.start();
    bass.stop(ctx.currentTime + 0.35);
  }
  musicTimer = setTimeout(beatTick, 280);
}

function startMusic() {
  if (musicTimer) return;
  getCtx(); beat = 0; beatTick();
}

function stopMusic() {
  if (musicTimer) { clearTimeout(musicTimer); musicTimer = null; }
}

function setAudioMuted(muted: boolean) {
  const ctx = getCtx();
  if (masterGain) masterGain.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.05);
}

function playSFX(type: 'collect' | 'shield' | 'bad' | 'gameover' | 'btn' | 'thrust') {
  const ctx = getCtx();
  if (!masterGain) return;
  const t = ctx.currentTime;
  const noteAt = (freq: number, delay: number, dur: number, wave: OscillatorType, vol: number) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g); g.connect(masterGain!);
    osc.type = wave; osc.frequency.value = freq;
    g.gain.setValueAtTime(0, t + delay);
    g.gain.setValueAtTime(vol, t + delay + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, t + delay + dur);
    osc.start(t + delay); osc.stop(t + delay + dur);
  };
  if (type === 'collect')  noteAt(880, 0, 0.1, 'sine', 0.25);
  if (type === 'shield')   { noteAt(523.25, 0, 0.1, 'sine', 0.3); noteAt(659.25, 0.08, 0.15, 'sine', 0.3); noteAt(783.99, 0.16, 0.2, 'sine', 0.35); }
  if (type === 'bad')      noteAt(120, 0, 0.25, 'sawtooth', 0.25);
  if (type === 'gameover') [440, 392, 349.23, 261.63].forEach((f, i) => noteAt(f, i * 0.18, 0.22, 'sine', 0.25));
  if (type === 'btn')      noteAt(660, 0, 0.06, 'sine', 0.15);
  if (type === 'thrust')   noteAt(180, 0, 0.08, 'triangle', 0.08);
}

// ─── Game Objects ────────────────────────────────────────────────────────────
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface Obstacle {
  id: number;
  type: 'zapper' | 'missile';
  x: number;
  y: number;
  w: number;
  h: number;
  active: boolean;
  warningTime: number; // For missiles, warns player before entering
  speed: number;
  itemType?: ItemType;
}

interface Collectible {
  id: number;
  type: ItemType | 'shield';
  x: number;
  y: number;
  w: number;
  h: number;
  collected: boolean;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  timer: number;
}

interface Props {
  onGameEnd: (result: GameResult) => void;
}

function removeCheckerboardAndWhite(img: HTMLImageElement): HTMLCanvasElement {
  const offCanvas = document.createElement('canvas');
  const w = img.naturalWidth || img.width || 128;
  const h = img.naturalHeight || img.height || 128;
  offCanvas.width = w;
  offCanvas.height = h;
  const offCtx = offCanvas.getContext('2d');
  if (!offCtx) return offCanvas;
  
  offCtx.drawImage(img, 0, 0);
  try {
    const imgData = offCtx.getImageData(0, 0, w, h);
    const data = imgData.data;
    
    // Pass 1: Global key-out for pure white background values (> 242)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r > 242 && g > 242 && b > 242) {
        data[i + 3] = 0;
      }
    }

    // Helper to check if a pixel is background-like (off-white or grey checkerboard)
    const isBg = (r: number, g: number, b: number) => {
      // 1. Off-white background pixels
      if (r > 215 && g > 215 && b > 215) return true;
      // 2. Grey checkerboard pixels (typically r==g==b in light grey range)
      if (Math.abs(r - g) < 8 && Math.abs(g - b) < 8 && r > 170 && r < 235) return true;
      return false;
    };

    // Pass 2: BFS Flood Fill from the borders to key out connected light backgrounds
    const visited = new Uint8Array(w * h);
    const queue: number[] = [];
    
    // Push all border pixels
    for (let x = 0; x < w; x++) {
      queue.push(x, 0);       // Top border
      queue.push(x, h - 1);   // Bottom border
      visited[x] = 1;
      visited[x + (h - 1) * w] = 1;
    }
    for (let y = 1; y < h - 1; y++) {
      queue.push(0, y);       // Left border
      queue.push(w - 1, y);   // Right border
      visited[y * w] = 1;
      visited[w - 1 + y * w] = 1;
    }
    
    let head = 0;
    while (head < queue.length) {
      const cx = queue[head++];
      const cy = queue[head++];
      const idx = (cx + cy * w) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      if (data[idx + 3] === 0 || isBg(r, g, b)) {
        data[idx + 3] = 0; // set transparent
        
        const neighbors = [
          [cx + 1, cy],
          [cx - 1, cy],
          [cx, cy + 1],
          [cx, cy - 1]
        ];
        
        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            const nidx = nx + ny * w;
            if (!visited[nidx]) {
              visited[nidx] = 1;
              queue.push(nx, ny);
            }
          }
        }
      }
    }
    
    // Pass 3: Edge Halo Smoothing (look for solid pixels next to transparent ones that are near-white/checkerboard)
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (x + y * w) * 4;
        if (data[idx + 3] > 0) { // Not transparent
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          
          if (r > 195 && g > 195 && b > 195) {
            const hasTransparentNeighbor = 
              data[(x + 1 + y * w) * 4 + 3] === 0 ||
              data[(x - 1 + y * w) * 4 + 3] === 0 ||
              data[(x + (y + 1) * w) * 4 + 3] === 0 ||
              data[(x + (y - 1) * w) * 4 + 3] === 0;
              
            if (hasTransparentNeighbor) {
              data[idx + 3] = 0;
            }
          }
        }
      }
    }
    
    offCtx.putImageData(imgData, 0, 0);
  } catch (e) {
    console.error('Failed to process image data', e);
  }
  return offCanvas;
}

const GameScreen: React.FC<Props> = ({ onGameEnd }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [portfolio, setPortfolio] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECS);
  const [distance, setDistance] = useState(0);
  const [hasShield, setHasShield] = useState(false);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);
  const [gains, setGains] = useState(0);
  const [losses, setLosses] = useState(0);

  // Gameplay configuration refs
  const gameplayActiveRef = useRef(false);
  const timeLeftRef = useRef(GAME_SECS);
  const portfolioRef = useRef(0);
  const distanceRef = useRef(0);

  // Physics stats tracking
  const statsRef = useRef({
    coinsCollected: 0,
    goodCollected: 0,
    badHit: 0,
    gains: 0,
    losses: 0,
  });

  // Player physics
  const playerRef = useRef({
    x: 75,
    y: 200,
    vy: 0,
    width: 48,
    height: 48,
    gravity: 0.35,
    thrust: -0.85,
    maxFallSpeed: 7,
    maxRiseSpeed: -6,
    shield: false,
    invincibleTimer: 0,
  });

  const isThrustingRef = useRef(false);

  // Lists of active entities
  const obstaclesRef = useRef<Obstacle[]>([]);
  const collectiblesRef = useRef<Collectible[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);

  // Spawning logic parameters
  const gameSpeedRef = useRef(4.0);
  const spawnTimerRef = useRef(0);
  const nextEntityIdRef = useRef(0);

  // Parallax background scroll offset
  const skylineScrollRef = useRef(0);

  // Preloaded Images Cache
  const imagesCache = useRef<Record<string, HTMLImageElement | HTMLCanvasElement>>({});

  useEffect(() => {
    // Preload image assets
    const assets = {
      hero: HERO_IMAGE,
      shield: SHIELD_IMAGE,
      missile: MISSILE_IMAGE,
      zapper: ZAPPER_IMAGE,
      coin: COIN_IMAGE,
      skyline: SKYLINE_IMAGE,
    };

    const processedCache: Record<string, HTMLImageElement | HTMLCanvasElement> = {};
    imagesCache.current = processedCache;

    Object.entries(assets).forEach(([key, src]) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        if (key !== 'skyline') {
          try {
            processedCache[key] = removeCheckerboardAndWhite(img);
          } catch (e) {
            console.error('Failed to process image', e);
            processedCache[key] = img;
          }
        } else {
          processedCache[key] = img;
        }
      };
      // Fallback initially
      processedCache[key] = img;
    });

    // Dynamically load & process all 8 custom item icons in ITEM_DEFS
    (Object.keys(ITEM_DEFS) as ItemType[]).forEach((key) => {
      const img = new Image();
      img.src = ITEM_DEFS[key].icon;
      img.onload = () => {
        try {
          processedCache[key] = removeCheckerboardAndWhite(img);
        } catch (e) {
          console.error(`Failed to process item icon for ${key}`, e);
          processedCache[key] = img;
        }
      };
      // Fallback initially
      processedCache[key] = img;
    });
  }, []);

  // Web Audio Context Muting
  function handleMuteToggle() {
    const next = !muted;
    setMuted(next);
    setAudioMuted(next);
    if (!next) playSFX('btn');
  }

  function handleStart() {
    playSFX('btn');
    setStarted(true);
  }

  // ─── Particle Thruster Exhaust System ───────────────────────────────────────
  function addThrustParticles(x: number, y: number, count = 3) {
    for (let i = 0; i < count; i++) {
      const angle = Math.PI / 2 + (Math.random() - 0.5) * 0.4; // Aim downwards with slight spread
      const speed = 2 + Math.random() * 4;
      const size = 3 + Math.random() * 6;
      particlesRef.current.push({
        x: x - 5, // Offset slightly to line up with jetpack back
        y: y + 25,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 1.5 - gameSpeedRef.current * 0.5,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 20 + Math.random() * 20,
        color: Math.random() > 0.4 ? 'rgba(242, 101, 34, 0.95)' : 'rgba(253, 224, 71, 0.95)', // Orange and golden sparks
        size,
      });
    }
  }

  function addHitParticles(x: number, y: number, color: string, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 15 + Math.random() * 15,
        color,
        size: 2 + Math.random() * 4,
      });
    }
  }

  // ─── Spawning Generator ───────────────────────────────────────────────────
  function spawnEntities(canvasWidth: number, canvasHeight: number) {
    spawnTimerRef.current++;
    if (spawnTimerRef.current < 65) return; // Wait intervals
    spawnTimerRef.current = 0;

    const randomChoice = Math.random();

    if (randomChoice < 0.42) {
      // Spawn standard Coin Curves (deposits, savings, salary, retirement)
      const coinTypes: (ItemType | 'shield')[] = ['deposits', 'savings', 'salary', 'retirement'];
      const activeType = coinTypes[Math.floor(Math.random() * coinTypes.length)];
      
      const count = 4 + Math.floor(Math.random() * 5); // 4-8 coins
      const patternType = Math.random() > 0.5 ? 'wave' : 'line';
      const startY = 100 + Math.random() * (canvasHeight - 200);

      for (let i = 0; i < count; i++) {
        let y = startY;
        if (patternType === 'wave') {
          y = startY + Math.sin(i * 0.8) * 45;
        }
        collectiblesRef.current.push({
          id: nextEntityIdRef.current++,
          type: activeType,
          x: canvasWidth + i * 36,
          y: Math.max(80, Math.min(canvasHeight - 80, y)),
          w: 24,
          h: 24,
          collected: false,
        });
      }
    } else if (randomChoice < 0.52) {
      // Spawn premium Life Shield power-up!
      collectiblesRef.current.push({
        id: nextEntityIdRef.current++,
        type: 'shield',
        x: canvasWidth,
        y: 120 + Math.random() * (canvasHeight - 240),
        w: 32,
        h: 32,
        collected: false,
      });
    } else if (randomChoice < 0.82) {
      // Spawn red laser static zapper
      const zapperHeight = 70 + Math.random() * 70;
      obstaclesRef.current.push({
        id: nextEntityIdRef.current++,
        type: 'zapper',
        x: canvasWidth,
        y: 60 + Math.random() * (canvasHeight - zapperHeight - 120),
        w: 18,
        h: zapperHeight,
        active: true,
        warningTime: 0,
        speed: 0,
        itemType: Math.random() > 0.5 ? 'hospitalization' : 'disability',
      });
    } else {
      // Spawn fast homing rocket missile with flash warnings!
      obstaclesRef.current.push({
        id: nextEntityIdRef.current++,
        type: 'missile',
        x: canvasWidth + 150, // Spawn offscreen
        y: 100 + Math.random() * (canvasHeight - 220),
        w: 42,
        h: 24,
        active: true,
        warningTime: 85, // Warns player for 85 frames
        speed: 8.5,
        itemType: Math.random() > 0.5 ? 'cancer' : 'accident',
      });
    }
  }

  // ─── Main Render Loop ───────────────────────────────────────────────────────
  const runGameFrame = useCallback(() => {
    if (!gameplayActiveRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // 1. CLEAR & BACKGROUND SCROLL (Parallax Skyline)
    ctx.fillStyle = '#00081a';
    ctx.fillRect(0, 0, w, h);

    // Parallax scrolling skyline vector art
    skylineScrollRef.current = (skylineScrollRef.current - gameSpeedRef.current * 0.15) % w;
    const imgSkyline = imagesCache.current.skyline;
    if (imgSkyline && imgSkyline.complete) {
      ctx.drawImage(imgSkyline, skylineScrollRef.current, h - 230, w, 180);
      ctx.drawImage(imgSkyline, skylineScrollRef.current + w, h - 230, w, 180);
    } else {
      // Fallback skyline shapes
      ctx.fillStyle = '#001438';
      for (let i = 0; i < 6; i++) {
        const xOffset = ((i * 120 + skylineScrollRef.current) % (w + 120)) - 120;
        ctx.fillRect(xOffset, h - 140, 80, 140);
      }
    }

    // Floor and Ceiling bounds
    ctx.fillStyle = '#061633';
    ctx.fillRect(0, 0, w, 32); // Ceiling
    ctx.fillRect(0, h - 45, w, 45); // Floor

    ctx.fillStyle = '#f26522';
    ctx.fillRect(0, 30, w, 2); // Ceiling line
    ctx.fillStyle = '#003da6';
    ctx.fillRect(0, h - 45, w, 4); // Floor line

    // 2. HERO / PLAYER PHYSICS
    const p = playerRef.current;

    // Apply thrust or gravity
    if (isThrustingRef.current) {
      p.vy += p.thrust;
      if (p.vy < p.maxRiseSpeed) p.vy = p.maxRiseSpeed;
      addThrustParticles(p.x, p.y, 2);
      if (Math.random() < 0.2) playSFX('thrust');
    } else {
      p.vy += p.gravity;
      if (p.vy > p.maxFallSpeed) p.vy = p.maxFallSpeed;
    }

    // Update position
    p.y += p.vy;

    // Ceiling & Floor collisions
    if (p.y < 34) {
      p.y = 34;
      p.vy = 0;
    }
    const floorLimit = h - 45 - p.height;
    if (p.y > floorLimit) {
      p.y = floorLimit;
      p.vy = 0;
    }

    // Shield status synchronization
    if (p.shield !== hasShield) {
      setHasShield(p.shield);
    }

    // Invincible flashing timer decay
    if (p.invincibleTimer > 0) p.invincibleTimer--;

    // GROUND RUNNING STATE & DUST PUFFS
    const groundRunning = p.y >= floorLimit;
    let runBob = 0;
    if (groundRunning) {
      // Bobble up and down slightly to simulate running steps
      runBob = Math.sin(distanceRef.current * 0.4) * 2;
      
      // Emit grey dust particles from player's feet
      if (distanceRef.current % 4 === 0) {
        const dustSpeedX = -gameSpeedRef.current * 0.7 - Math.random() * 2;
        const dustSpeedY = -0.5 - Math.random() * 1.5;
        particlesRef.current.push({
          x: p.x + 8,
          y: h - 47,
          vx: dustSpeedX,
          vy: dustSpeedY,
          life: 0,
          maxLife: 15 + Math.random() * 10,
          color: 'rgba(100, 116, 139, 0.7)', // Slate grey `#64748b`
          size: 2 + Math.random() * 4,
        });
      }
    }

    // CHARACTER ROTATION/TILT BASED ON VELOCITY
    // Running bobble tilt, flying climb/fall tilt
    let rotationDeg = 0;
    if (groundRunning) {
      rotationDeg = Math.sin(distanceRef.current * 0.4) * 3; // slight run sway
    } else {
      rotationDeg = Math.min(12, Math.max(-8, p.vy * (p.vy < 0 ? 2 : 1.5)));
    }
    const rotationRad = (rotationDeg * Math.PI) / 180;

    // DRAW HERO SPRITE
    ctx.save();
    ctx.translate(p.x + p.width / 2, p.y + p.height / 2 + runBob);
    ctx.rotate(rotationRad);

    const heroImg = imagesCache.current.hero;
    
    // Flashing if invincible/hurt
    if (p.invincibleTimer === 0 || Math.floor(p.invincibleTimer / 4) % 2 === 0) {
      if (heroImg) {
        ctx.drawImage(heroImg as any, -p.width / 2, -p.height / 2, p.width, p.height);
      } else {
        // Fallback Nano Banana vector
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(0, 0, p.width/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(5, -9, 12, 8); // cyber goggles
      }
    }

    // Draw active shield bubble
    if (p.shield) {
      ctx.beginPath();
      // Shield is drawn relative to translated center
      ctx.arc(0, 0, p.width * 0.72, 0, Math.PI * 2);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    ctx.restore();

    // 3. COLLIDABLES / COLLECTIBLES (Gains)
    collectiblesRef.current.forEach(c => {
      c.x -= gameSpeedRef.current; // Scroll left

      // Collision test (Bounding box overlap)
      const buffer = 4;
      const isColliding = (
        p.x + buffer < c.x + c.w &&
        p.x + p.width - buffer > c.x &&
        p.y + buffer < c.y + c.h &&
        p.y + p.height - buffer > c.y
      );

      if (isColliding && !c.collected) {
        c.collected = true;

        if (c.type === 'shield') {
          // Gained Life Shield!
          p.shield = true;
          setHasShield(true);
          playSFX('shield');
          addHitParticles(c.x + c.w/2, c.y + c.h/2, '#06b6d4', 15);
        } else {
          // Collected normal coin!
          const def = ITEM_DEFS[c.type as ItemType];
          portfolioRef.current += def.value;
          setPortfolio(portfolioRef.current);

          statsRef.current.coinsCollected++;
          statsRef.current.goodCollected++;
          statsRef.current.gains += def.value;
          setGains(statsRef.current.gains);

          playSFX('collect');
          addHitParticles(c.x + c.w/2, c.y + c.h/2, '#eab308', 6);

          // Add floating text
          const textId = nextEntityIdRef.current++;
          floatingTextsRef.current.push({
            id: textId,
            x: c.x,
            y: c.y - 10,
            text: `+${def.value}`,
            color: '#86efac',
            alpha: 1.0,
            timer: 40,
          });
        }
      }

      // Draw Collectible
      if (!c.collected && c.x > -50) {
        const itemImg = imagesCache.current[c.type];
        const shieldImg = imagesCache.current.shield;

        if (c.type === 'shield') {
          if (shieldImg) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(c.x + c.w/2, c.y + c.h/2, c.w/2 - 1, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(shieldImg as any, c.x, c.y, c.w, c.h);
            ctx.restore();
          } else {
            ctx.fillStyle = '#06b6d4';
            ctx.beginPath();
            ctx.arc(c.x + c.w/2, c.y + c.h/2, c.w/2, 0, Math.PI*2);
            ctx.fill();
          }
        } else {
          if (itemImg) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(c.x + c.w/2, c.y + c.h/2, c.w/2 - 1, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(itemImg as any, c.x, c.y, c.w, c.h);
            ctx.restore();
          } else {
            ctx.fillStyle = '#eab308';
            ctx.beginPath();
            ctx.arc(c.x + c.w/2, c.y + c.h/2, c.w/2, 0, Math.PI*2);
            ctx.fill();
          }
        }
      }
    });

    // Filter offscreen or collected coins
    collectiblesRef.current = collectiblesRef.current.filter(c => !c.collected && c.x > -50);

    // 4. OBSTACLES (Risks)
    obstaclesRef.current.forEach(o => {
      if (o.type === 'missile') {
        if (o.warningTime > 0) {
          o.warningTime--;
          
          // Draw pulsating warning laser beam across screen
          ctx.save();
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.lineWidth = 1 + Math.sin(o.warningTime * 0.3) * 0.8;
          ctx.setLineDash([8, 4]); // Dashed line
          ctx.beginPath();
          ctx.moveTo(0, o.y + o.h/2);
          ctx.lineTo(w, o.y + o.h/2);
          ctx.stroke();
          ctx.restore();

          // Render warning flash indicator on right edge
          if (Math.floor(o.warningTime / 6) % 2 === 0) {
            ctx.save();
            ctx.fillStyle = '#ef4444';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(w - 22, o.y + 12, 10, 0, Math.PI*2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Plus Jakarta Sans';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('!', w - 22, o.y + 12);
            ctx.restore();
          }
          return; // Don't move missile across yet
        }
        o.x -= (gameSpeedRef.current + o.speed);
      } else {
        o.x -= gameSpeedRef.current; // Standard zapper scrolling
      }

      // Collision test (Bounding box overlap)
      const buffer = 8;
      const isColliding = (
        p.x + buffer < o.x + o.w &&
        p.x + p.width - buffer > o.x &&
        p.y + buffer < o.y + o.h &&
        p.y + p.height - buffer > o.y
      );

      if (isColliding && o.active && p.invincibleTimer === 0) {
        o.active = false; // Disable to avoid repeating hit
        statsRef.current.badHit++;

        // Select the pre-assigned specific financial risk
        const chosenRisk = o.itemType || 'hospitalization';
        const def = ITEM_DEFS[chosenRisk];

        if (p.shield) {
          // SHIELD ABSORBS COLLISION IMPACT!
          p.shield = false;
          setHasShield(false);
          p.invincibleTimer = 45; // Grants temporary invulnerability frames
          playSFX('shield'); // play high shield decay sound
          addHitParticles(p.x + p.width/2, p.y + p.height/2, '#06b6d4', 25);

          // Add shield block float text
          const textId = nextEntityIdRef.current++;
          floatingTextsRef.current.push({
            id: textId,
            x: p.x,
            y: p.y - 20,
            text: 'SHIELD BLOCKED!',
            color: '#38bdf8',
            alpha: 1.0,
            timer: 50,
          });
        } else {
          // UNPROTECTED COLLISION - DRIP PORTFOLIO!
          portfolioRef.current += def.value; // Drains balance (value is negative)
          if (portfolioRef.current < 0) portfolioRef.current = 0; // Floor at zero
          setPortfolio(portfolioRef.current);

          statsRef.current.losses += Math.abs(def.value);
          setLosses(statsRef.current.losses);

          p.invincibleTimer = 65; // Hurt frames
          playSFX('bad');
          addHitParticles(o.x + o.w/2, o.y + o.h/2, '#ef4444', 30);

          // Add drain floating text
          const textId = nextEntityIdRef.current++;
          floatingTextsRef.current.push({
            id: textId,
            x: o.x,
            y: o.y - 10,
            text: `${def.value}`,
            color: '#fca5a5',
            alpha: 1.0,
            timer: 45,
          });
        }
      }

      // DRAW OBSTACLE
      if (o.active && o.x > -100 && o.x < w + 200) {
        const riskImg = o.itemType ? imagesCache.current[o.itemType] : null;

        if (o.type === 'zapper') {
          // Draw electrical glowing frame
          ctx.save();
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#ef4444';
          
          // Top & Bottom caps
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = '#f87171';
          ctx.lineWidth = 1.5;
          
          ctx.fillRect(o.x, o.y, o.w, 10);
          ctx.strokeRect(o.x, o.y, o.w, 10);
          
          ctx.fillRect(o.x, o.y + o.h - 10, o.w, 10);
          ctx.strokeRect(o.x, o.y + o.h - 10, o.w, 10);
          
          // Laser beam
          ctx.strokeStyle = Math.random() > 0.5 ? '#ef4444' : '#fee2e2';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(o.x + o.w/2, o.y + 10);
          ctx.lineTo(o.x + o.w/2, o.y + o.h - 10);
          ctx.stroke();
          ctx.restore();

          // Draw custom risk icon in the center of the zapper
          if (riskImg) {
            const size = 32;
            const rx = o.x + o.w/2 - size/2;
            const ry = o.y + o.h/2 - size/2;
            
            ctx.save();
            ctx.beginPath();
            ctx.arc(rx + size/2, ry + size/2, size/2 + 2, 0, Math.PI*2);
            ctx.fillStyle = '#0f172a';
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 1.5;
            ctx.fill();
            ctx.stroke();
            
            ctx.drawImage(riskImg as any, rx, ry, size, size);
            ctx.restore();
          }
        } else {
          // Draw warned high speed rocket missile with risk icon badge
          ctx.save();
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#ef4444';
          
          // Rocket body shape facing left
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = '#f87171';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(o.x + o.w, o.y + 4); // Tail top
          ctx.lineTo(o.x + 12, o.y + 4); // Body top
          ctx.quadraticCurveTo(o.x, o.y + o.h/2, o.x + 12, o.y + o.h - 4); // Nose cone
          ctx.lineTo(o.x + o.w, o.y + o.h - 4); // Body bottom
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          
          // Fire exhaust sparks
          const fireY = o.y + o.h/2;
          const fireX = o.x + o.w;
          const gradient = ctx.createLinearGradient(fireX, fireY, fireX + 15, fireY);
          gradient.addColorStop(0, '#f97316');
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(fireX, o.y + 6);
          ctx.lineTo(fireX + 12 + Math.random()*6, fireY);
          ctx.lineTo(fireX, o.y + o.h - 6);
          ctx.closePath();
          ctx.fill();
          
          // Draw risk icon badge in the middle of the rocket
          if (riskImg) {
            const size = 20;
            const rx = o.x + o.w/2 - size/2;
            const ry = o.y + o.h/2 - size/2;
            
            ctx.beginPath();
            ctx.arc(rx + size/2, ry + size/2, size/2 + 1, 0, Math.PI*2);
            ctx.fillStyle = '#1e293b';
            ctx.fill();
            
            ctx.drawImage(riskImg as any, rx, ry, size, size);
          }
          ctx.restore();
        }
      }
    });

    // Filter out inactive or offscreen obstacles
    obstaclesRef.current = obstaclesRef.current.filter(o => o.active && o.x > -100);

    // 5. DRAW SPARKS / EXHAUST PARTICLES
    particlesRef.current.forEach(pt => {
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life++;

      // Floor Exhaust Bounce!
      const floorBoundary = h - 45;
      if (pt.y >= floorBoundary) {
        pt.y = floorBoundary - 1;
        pt.vy = -Math.abs(pt.vy) * 0.45;
        pt.vx += (Math.random() - 0.5) * 2;
      }

      const pct = (pt.maxLife - pt.life) / pt.maxLife;
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, pct));
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(0, pt.size * pct), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;
    particlesRef.current = particlesRef.current.filter(pt => pt.life < pt.maxLife);

    // 6. DRAW FLOATING POPUP TEXTS
    floatingTextsRef.current.forEach(ft => {
      ft.y -= 0.6; // rise upwards
      ft.timer--;
      if (ft.timer < 15) {
        ft.alpha = ft.timer / 15;
      }
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 13px Plus Jakarta Sans';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
    floatingTextsRef.current = floatingTextsRef.current.filter(ft => ft.timer > 0);

    // 7. INCREMENT SCORE & DISTANCE OVER TIME
    distanceRef.current += 1;
    if (distanceRef.current % 10 === 0) {
      setDistance(Math.floor(distanceRef.current / 10));
    }

    // Slowly increase background speed
    gameSpeedRef.current += 0.0007;

    // SPAWN NEW COLLECTIBLES/OBSTACLES
    spawnEntities(w, h);

    // Loop
    if (gameplayActiveRef.current) {
      requestAnimationFrame(runGameFrame);
    }
  }, [hasShield, muted]);

  // Handle Touch/Mouse Click thrust triggers
  const triggerThrustStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!started || !gameplayActiveRef.current) return;
    isThrustingRef.current = true;
  }, [started]);

  const triggerThrustEnd = useCallback(() => {
    isThrustingRef.current = false;
  }, []);

  // Setup/TearDown Game loops & canvas sizes
  useEffect(() => {
    if (!started) return;
    gameplayActiveRef.current = true;
    startMusic();

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.parentElement?.clientWidth || 380;
      canvas.height = canvas.parentElement?.clientHeight || 600;
    }

    let gameTimer: ReturnType<typeof setInterval>;

    // 45 seconds game session countdown
    gameTimer = setInterval(() => {
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);

      if (timeLeftRef.current <= 0) {
        clearInterval(gameTimer);
        gameplayActiveRef.current = false;
        stopMusic();
        playSFX('gameover');

        const { coinsCollected, goodCollected, badHit, gains, losses } = statsRef.current;
        onGameEnd({
          portfolio: portfolioRef.current,
          distance: Math.floor(distanceRef.current / 10),
          coinsCollected,
          goodCollected,
          badHit,
          gains,
          losses,
          timeSeconds: GAME_SECS,
          rawScore: Math.min(100, Math.max(0, Math.round((portfolioRef.current / TARGET_PORTFOLIO) * 100))),
        });
      }
    }, 1000);

    // Kickoff frame loop
    requestAnimationFrame(runGameFrame);

    return () => {
      clearInterval(gameTimer);
      gameplayActiveRef.current = false;
      stopMusic();
    };
  }, [started, onGameEnd, runGameFrame]);

  const displayTime = `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`;
  const totalWealth = gains + losses || 1;
  const gainPct = Math.round((gains / totalWealth) * 100);
  const lossPct = 100 - gainPct;

  return (
    <div
      className="relative flex h-full min-h-0 flex-col overflow-hidden"
      style={{ background: 'linear-gradient(165deg, #00091A 0%, #001535 40%, #000C22 70%, #00071A 100%)' }}
    >
      {/* HUD Header */}
      <div
        className="flex flex-shrink-0 items-center justify-between px-[4vw] pb-[0.8vh]"
        style={{ paddingTop: 'max(1.5vh, calc(env(safe-area-inset-top) + 0.3rem))' }}
      >
        <button
          onClick={handleMuteToggle}
          className="btn-press flex h-[2.6rem] min-w-[4rem] flex-shrink-0 items-center justify-center rounded-full px-[0.6rem] text-[0.7rem] font-extrabold uppercase text-white"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)' }}
        >
          {muted ? 'Muted' : 'Sound'}
        </button>

        <div className="text-center">
          <div
            className="font-extrabold tabular-nums transition-colors"
            style={{
              color: timeLeft <= 10 ? '#EF4444' : 'white',
              fontSize: 'clamp(1.75rem, 8vw, 2.15rem)',
              textShadow: timeLeft <= 10 ? '0 0 12px rgba(239,68,68,0.6)' : 'none',
            }}
          >
            {displayTime}
          </div>
          <div className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-blue-300">Time Remaining</div>
        </div>

        {/* Live Active Shield indicator */}
        <div className="flex h-[2.6rem] min-w-[4rem] flex-shrink-0 items-center justify-center rounded-full">
          {hasShield && (
            <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-[0.58rem] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
              🛡 Shield On
            </span>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden select-none cursor-pointer"
        onTouchStart={triggerThrustStart}
        onTouchEnd={triggerThrustEnd}
        onMouseDown={triggerThrustStart}
        onMouseUp={triggerThrustEnd}
        onMouseLeave={triggerThrustEnd}
        style={{ touchAction: 'none' }}
      >
        <canvas ref={canvasRef} className="block w-full h-full" />

        {started && timeLeft > 40 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-white/30 animate-pulse">
              Press & Hold screen to activate Jetpack!
            </p>
          </div>
        )}
      </div>

      {/* Wealth Portfolio Tracker (Footer HUD) */}
      <div className="mx-[4vw] mb-[0.4vh] flex-shrink-0 mt-1">
        <div className="mb-[0.2rem] flex justify-between items-end">
          <span className="text-[0.58rem] font-bold uppercase text-slate-400">Total Distance: {distance}m</span>
          <span className="text-xl font-black text-emerald-400">
            ₹{portfolio.toLocaleString('en-IN')}
          </span>
        </div>
        
        {/* Compound growth / risk drained slider */}
        <div className="flex h-[0.55rem] overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${gainPct || 100}%`, background: `linear-gradient(90deg, ${GREEN}, #34D399)`, borderRadius: gainPct > 0 ? '9999px 0 0 9999px' : undefined }}
          />
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${lossPct || 0}%`, background: 'linear-gradient(90deg, #F87171, #EF4444)', borderRadius: lossPct > 0 && gainPct === 0 ? '9999px' : undefined }}
          />
        </div>
        <div className="mt-[0.2rem] flex justify-between text-[0.52rem] font-bold">
          <span className="text-emerald-400">{gains > 0 ? `${gainPct}%` : '0%'} Compounded</span>
          <span className="text-red-400">{losses > 0 ? `${lossPct}%` : '0%'} Risk-Drained</span>
        </div>
      </div>

      {/* Avoidable Risks Legend Footer */}
      <div
        className="flex-shrink-0 px-[4vw]"
        style={{ paddingBottom: 'max(1.5vh, calc(env(safe-area-inset-bottom) + 0.4rem))' }}
      >
        <div className="rounded-[0.9rem] border border-white/10 bg-white/5 px-[0.7rem] py-[0.45rem]">
          <p className="mb-[0.2rem] text-[0.52rem] font-extrabold uppercase tracking-[0.08em] text-red-300">Dodged Financial Risks</p>
          <div className="flex justify-between items-center w-full gap-[0.2rem]">
            {(Object.entries(ITEM_DEFS) as [ItemType, (typeof ITEM_DEFS)[ItemType]][])
              .filter(([, d]) => d.bad)
              .slice(0, 4)
              .map(([type, def]) => (
                <div key={type} className="flex items-center gap-[0.25rem]">
                  <span
                    className="flex h-[1.5rem] w-[1.5rem] flex-shrink-0 items-center justify-center rounded-full"
                    style={{ background: def.color + '22', border: `1px solid ${def.color}55` }}
                  >
                    <img src={def.icon} alt={def.label} className="h-[1.1rem] w-[1.1rem] object-contain" />
                  </span>
                  <div>
                    <p className="text-[0.5rem] font-black leading-tight text-red-300">-{Math.abs(def.value).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {!started && <HowToPlayPopup onStart={handleStart} />}
    </div>
  );
};

export default GameScreen;
