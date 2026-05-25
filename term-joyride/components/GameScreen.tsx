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

function playSFX(type: 'collect' | 'shield' | 'bad' | 'gameover' | 'btn' | 'thrust' | 'siren') {
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
  if (type === 'siren')    noteAt(720, 0, 0.05, 'sawtooth', 0.12);
}

// ─── Bounding Line Distance Helper for fair hit detection ──────────────────
function distanceToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
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
  orientation?: 'vertical' | 'horizontal' | 'diagonal'; // Vertical, Horizontal or Diagonal
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

interface Scientist {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  panic: boolean;
  panicTimer: number;
  walkFrame: number;
  cowering?: boolean;
  bubbleText?: string;
  bubbleTimer?: number;
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
      if (r > 215 && g > 215 && b > 215) return true;
      if (Math.abs(r - g) < 8 && Math.abs(g - b) < 8 && r > 170 && r < 235) return true;
      return false;
    };

    // Pass 2: BFS Flood Fill from the borders to key out connected light backgrounds
    const visited = new Uint8Array(w * h);
    const queue: number[] = [];
    
    for (let x = 0; x < w; x++) {
      queue.push(x, 0);
      queue.push(x, h - 1);
      visited[x] = 1;
      visited[x + (h - 1) * w] = 1;
    }
    for (let y = 1; y < h - 1; y++) {
      queue.push(0, y);
      queue.push(w - 1, y);
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
        data[idx + 3] = 0;
        
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
    
    // Pass 3: Edge Halo Smoothing
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (x + y * w) * 4;
        if (data[idx + 3] > 0) {
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

  // Sound context trackings
  const isAudioMutedRef = useRef(false);

  // Screen shake amount
  const screenShakeRef = useRef(0);

  // Physics stats tracking
  const statsRef = useRef({
    coinsCollected: 0,
    goodCollected: 0,
    badHit: 0,
    gains: 0,
    losses: 0,
  });

  // Player physics (Tuned to be floatier and more controllable)
  const playerRef = useRef({
    x: 75,
    y: 200,
    vy: 0,
    width: 48,
    height: 48,
    gravity: 0.22,      // Floatier gravity (from 0.26)
    thrust: -0.58,       // Floatier thrust (from -0.65)
    maxFallSpeed: 5.0,   // Controlled fall speed (from 5.5)
    maxRiseSpeed: -4.0,  // Controlled rise speed (from -4.5)
    shield: false,
    invincibleTimer: 0,
  });

  const isThrustingRef = useRef(false);

  // Lists of active entities
  const obstaclesRef = useRef<Obstacle[]>([]);
  const collectiblesRef = useRef<Collectible[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const scientistsRef = useRef<Scientist[]>([]);

  // Spawning logic parameters
  const gameSpeedRef = useRef(2.0); // Slower starting speed (from 2.8)
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
      processedCache[key] = img;
    });

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
      processedCache[key] = img;
    });
  }, []);

  // Web Audio Context Muting
  function handleMuteToggle() {
    const next = !muted;
    setMuted(next);
    setAudioMuted(next);
    isAudioMutedRef.current = next;
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
        x: x - 5,
        y: y + 25,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 1.5 - gameSpeedRef.current * 0.5,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 20 + Math.random() * 20,
        color: Math.random() > 0.4 ? 'rgba(242, 101, 34, 0.95)' : 'rgba(253, 224, 71, 0.95)', // Orange and golden sparks
        size,
      });
    }

    // Spawn falling machine gun bullet/wealth pellets!
    if (Math.random() < 0.7) {
      particlesRef.current.push({
        x: x - 8,
        y: y + 30,
        vx: -gameSpeedRef.current + (Math.random() - 0.5) * 1.5,
        vy: 7 + Math.random() * 4, // falling fast downwards
        life: 0,
        maxLife: 50,
        color: 'rgba(234, 179, 8, 0.95)', // gold bullet pellet
        size: 3,
      });
    }

    // Spawn high-fidelity white-grey jetpack nozzle smoke cloud!
    if (Math.random() < 0.4) {
      particlesRef.current.push({
        x: x - 8,
        y: y + 25,
        vx: -gameSpeedRef.current * 0.8 - Math.random() * 1.5,
        vy: 1 + Math.random() * 2, // gently drifting downwards
        life: 0,
        maxLife: 30 + Math.random() * 20,
        color: 'rgba(226, 232, 240, 0.42)', // very soft white-grey
        size: 8 + Math.random() * 6, // larger smoke cloud
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

  // ─── Coin Formation Spawner (Jetpack Joyride Patterns) ─────────────────────
  function spawnCoinFormation(activeType: ItemType, canvasWidth: number, canvasHeight: number) {
    const patternChoice = Math.random();
    const startY = 100 + Math.random() * (canvasHeight - 240);
    
    if (patternChoice < 0.28) {
      // 1. SINE WAVE
      const count = 6 + Math.floor(Math.random() * 5); // 6-10 coins
      for (let i = 0; i < count; i++) {
        collectiblesRef.current.push({
          id: nextEntityIdRef.current++,
          type: activeType,
          x: canvasWidth + i * 36,
          y: Math.max(80, Math.min(canvasHeight - 110, startY + Math.sin(i * 0.8) * 50)),
          w: 24,
          h: 24,
          collected: false,
        });
      }
    } else if (patternChoice < 0.52) {
      // 2. CIRCLE RING (8 coins around a center)
      const centerX = canvasWidth + 80;
      const centerY = startY + 60;
      const radius = 50;
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        collectiblesRef.current.push({
          id: nextEntityIdRef.current++,
          type: activeType,
          x: centerX + Math.cos(angle) * radius - 12,
          y: Math.max(80, Math.min(canvasHeight - 110, centerY + Math.sin(angle) * radius - 12)),
          w: 24,
          h: 24,
          collected: false,
        });
      }
    } else if (patternChoice < 0.76) {
      // 3. DIAMOND (8 coins)
      const centerX = canvasWidth + 80;
      const centerY = startY + 60;
      const offsets = [
        [0, -45], [30, -22], [60, 0], [30, 22],
        [0, 45], [-30, 22], [-60, 0], [-30, -22]
      ];
      offsets.forEach(([ox, oy]) => {
        collectiblesRef.current.push({
          id: nextEntityIdRef.current++,
          type: activeType,
          x: centerX + ox - 12,
          y: Math.max(80, Math.min(canvasHeight - 110, centerY + oy - 12)),
          w: 24,
          h: 24,
          collected: false,
        });
      });
    } else {
      // 4. PARALLEL LANES (2 lines of 5 coins)
      const count = 5;
      for (let i = 0; i < count; i++) {
        collectiblesRef.current.push({
          id: nextEntityIdRef.current++,
          type: activeType,
          x: canvasWidth + i * 36,
          y: Math.max(80, Math.min(canvasHeight - 110, startY)),
          w: 24,
          h: 24,
          collected: false,
        });
        collectiblesRef.current.push({
          id: nextEntityIdRef.current++,
          type: activeType,
          x: canvasWidth + i * 36,
          y: Math.max(80, Math.min(canvasHeight - 110, startY + 40)),
          w: 24,
          h: 24,
          collected: false,
        });
      }
    }
  }

  // ─── Spawning Generator ───────────────────────────────────────────────────
  function spawnEntities(canvasWidth: number, canvasHeight: number) {
    spawnTimerRef.current++;
    if (spawnTimerRef.current < 65) return; // Wait intervals
    spawnTimerRef.current = 0;

    const randomChoice = Math.random();

    if (randomChoice < 0.45) {
      // Spawn structured coin curves (deposits, savings, salary, retirement)
      const coinTypes: (ItemType | 'shield')[] = ['deposits', 'savings', 'salary', 'retirement'];
      const activeType = coinTypes[Math.floor(Math.random() * coinTypes.length)] as ItemType;
      
      spawnCoinFormation(activeType, canvasWidth, canvasHeight);
    } else if (randomChoice < 0.54) {
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
      // Spawn lightning static / diagonal / horizontal zappers
      const zapperHeight = 80 + Math.random() * 80;
      const zapperWidth = 80 + Math.random() * 80;
      const orientRoll = Math.random();
      
      let orientation: 'vertical' | 'horizontal' | 'diagonal' = 'vertical';
      let w = 18;
      let h = zapperHeight;
      
      if (orientRoll < 0.35) {
        orientation = 'horizontal';
        w = zapperWidth;
        h = 18;
      } else if (orientRoll < 0.65) {
        orientation = 'diagonal';
        w = zapperWidth;
        h = zapperHeight;
      }

      obstaclesRef.current.push({
        id: nextEntityIdRef.current++,
        type: 'zapper',
        x: canvasWidth,
        y: 60 + Math.random() * (canvasHeight - h - 120),
        w,
        h,
        active: true,
        warningTime: 0,
        speed: 0,
        itemType: Math.random() > 0.5 ? 'hospitalization' : 'disability',
        orientation,
      });
    } else {
      // Spawn red homing warning alert rocket missile!
      obstaclesRef.current.push({
        id: nextEntityIdRef.current++,
        type: 'missile',
        x: canvasWidth + 200, // Offscreen starting lane
        y: playerRef.current.y, // Lock onto player Y initially
        w: 42,
        h: 24,
        active: true,
        warningTime: 110, // Slower warning time (from 85) for reaction
        speed: 5.5, // Slower missile speed (from 8.5)
        itemType: Math.random() > 0.5 ? 'cancer' : 'accident',
      });
    }

    // Spawn scared scientists/employees running on the ground
    if (Math.random() < 0.35 && scientistsRef.current.length < 4) {
      scientistsRef.current.push({
        id: nextEntityIdRef.current++,
        x: canvasWidth + 20,
        y: canvasHeight - 45 - 28,
        vx: -1.0 - Math.random() * 1.0,
        vy: 0,
        width: 16,
        height: 28,
        panic: false,
        panicTimer: 0,
        walkFrame: Math.random() * Math.PI * 2,
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

    // Apply Screen Shake if active
    ctx.save();
    if (screenShakeRef.current > 0) {
      const shakeVal = screenShakeRef.current;
      const dx = (Math.random() - 0.5) * shakeVal;
      const dy = (Math.random() - 0.5) * shakeVal;
      ctx.translate(dx, dy);
      screenShakeRef.current -= 0.8;
    }

    // 1. DYNAMIC LABORATORY SCENERY & WINDOW PARALLAX
    ctx.fillStyle = '#1e293b'; // Base steel grey panels
    ctx.fillRect(0, 0, w, h);

    // Parallax Window pane calculation
    const windowPeriod = 750;
    skylineScrollRef.current = (skylineScrollRef.current - gameSpeedRef.current * 0.15) % w;
    const windowScrollVal = (skylineScrollRef.current * 1.2) % windowPeriod;

    for (let xOffset = windowScrollVal - windowPeriod; xOffset < w + windowPeriod; xOffset += windowPeriod) {
      const windowWidth = 460;
      
      // Draw window viewport clipping mask
      ctx.save();
      ctx.fillStyle = '#020617'; // darker sky inside window
      ctx.fillRect(xOffset, 32, windowWidth, h - 77);

      ctx.beginPath();
      ctx.rect(xOffset, 32, windowWidth, h - 77);
      ctx.clip();

      const imgSkyline = imagesCache.current.skyline;
      if (imgSkyline && imgSkyline.complete) {
        ctx.drawImage(imgSkyline, skylineScrollRef.current, h - 230, w, 180);
        ctx.drawImage(imgSkyline, skylineScrollRef.current + w, h - 230, w, 180);
      } else {
        ctx.fillStyle = '#001438';
        for (let i = 0; i < 6; i++) {
          const xs = ((i * 120 + skylineScrollRef.current) % (w + 120)) - 120;
          ctx.fillRect(xs, h - 140, 80, 140);
        }
      }
      ctx.restore();

      // Window Glass Reflections/Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(xOffset + windowWidth / 3, 32);
      ctx.lineTo(xOffset + windowWidth / 3, h - 45);
      ctx.moveTo(xOffset + (2 * windowWidth) / 3, 32);
      ctx.lineTo(xOffset + (2 * windowWidth) / 3, h - 45);
      ctx.stroke();

      // Draw metallic solid lab panels where windows aren't present
      const wallWidth = windowPeriod - windowWidth;
      ctx.fillStyle = '#334155'; // darker laboratory panels
      ctx.fillRect(xOffset + windowWidth, 32, wallWidth, h - 77);

      // Panel joint lines
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3.5;
      ctx.strokeRect(xOffset + windowWidth, 32, wallWidth, h - 77);

      ctx.beginPath();
      ctx.moveTo(xOffset + windowWidth + wallWidth / 2, 32);
      ctx.lineTo(xOffset + windowWidth + wallWidth / 2, h - 45);
      ctx.stroke();

      // Blinking laboratory alarms
      const panelCenterX = xOffset + windowWidth + wallWidth / 2;
      const blinkOn = Math.floor(distanceRef.current / 22) % 2 === 0;
      
      ctx.beginPath();
      ctx.arc(panelCenterX, 95, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = blinkOn ? '#f97316' : '#7c2d12'; // amber siren
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(panelCenterX, 110, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = !blinkOn ? '#ef4444' : '#7f1d1d'; // red alert siren
      ctx.fill();
      ctx.stroke();
    }

    // High tech conduits / power pipes
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 32, w, 6);
    ctx.fillRect(0, h - 51, w, 6);

    ctx.strokeStyle = Math.random() > 0.4 ? '#38bdf8' : '#0284c7'; // buzzing cyan energy conduits
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, 35);
    ctx.lineTo(w, 35);
    ctx.moveTo(0, h - 48);
    ctx.lineTo(w, h - 48);
    ctx.stroke();

    // Floor and Ceiling bounds
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, 32); // Ceiling
    ctx.fillRect(0, h - 45, w, 45); // Floor

    ctx.fillStyle = '#f26522';
    ctx.fillRect(0, 30, w, 2); // Ceiling line
    ctx.fillStyle = '#003da6';
    ctx.fillRect(0, h - 45, w, 4); // Floor line

    // 2. HERO / PLAYER PHYSICS
    const p = playerRef.current;

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

    if (p.shield !== hasShield) {
      setHasShield(p.shield);
    }

    if (p.invincibleTimer > 0) p.invincibleTimer--;

    // Ground running particles
    const groundRunning = p.y >= floorLimit;
    let runBob = 0;
    if (groundRunning) {
      runBob = Math.sin(distanceRef.current * 0.4) * 2;
      
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
          color: 'rgba(100, 116, 139, 0.7)',
          size: 2 + Math.random() * 4,
        });
      }
    }

    let rotationDeg = 0;
    if (groundRunning) {
      rotationDeg = Math.sin(distanceRef.current * 0.4) * 3;
    } else {
      rotationDeg = Math.min(12, Math.max(-8, p.vy * (p.vy < 0 ? 2 : 1.5)));
    }
    const rotationRad = (rotationDeg * Math.PI) / 180;

    // Draw Hero Sprite
    ctx.save();
    ctx.translate(p.x + p.width / 2, p.y + p.height / 2 + runBob);
    ctx.rotate(rotationRad);

    const heroImg = imagesCache.current.hero;
    
    if (p.invincibleTimer === 0 || Math.floor(p.invincibleTimer / 4) % 2 === 0) {
      if (heroImg) {
        ctx.drawImage(heroImg as any, -p.width / 2, -p.height / 2, p.width, p.height);
      } else {
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(0, 0, p.width/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(5, -9, 12, 8);
      }
    }

    if (p.shield) {
      ctx.beginPath();
      ctx.arc(0, 0, p.width * 0.72, 0, Math.PI * 2);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    ctx.restore();

    // 3. COLLIDABLES / COLLECTIBLES (Gains)
    collectiblesRef.current.forEach(c => {
      c.x -= gameSpeedRef.current;

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
          p.shield = true;
          setHasShield(true);
          playSFX('shield');
          addHitParticles(c.x + c.w/2, c.y + c.h/2, '#06b6d4', 15);
        } else {
          const def = ITEM_DEFS[c.type as ItemType];
          portfolioRef.current += def.value;
          setPortfolio(portfolioRef.current);

          statsRef.current.coinsCollected++;
          statsRef.current.goodCollected++;
          statsRef.current.gains += def.value;
          setGains(statsRef.current.gains);

          playSFX('collect');
          addHitParticles(c.x + c.w/2, c.y + c.h/2, '#eab308', 6);

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

    collectiblesRef.current = collectiblesRef.current.filter(c => !c.collected && c.x > -50);

    // 4. OBSTACLES (Risks)
    obstaclesRef.current.forEach(o => {
      if (o.type === 'missile') {
        if (o.warningTime > 0) {
          o.warningTime--;
          
          // Homing Lock-on Phase: follows player Y coordinates smoothly
          const dy = (p.y + p.height/2 - o.h/2) - o.y;
          o.y += dy * 0.07; // smooth homing pull!

          // Alert Beep Synth
          if (o.warningTime % 18 === 0 && !isAudioMutedRef.current) {
            playSFX('siren');
          }

          // Pulsating warning tracking laser
          ctx.save();
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
          ctx.lineWidth = 1.5 + Math.sin(o.warningTime * 0.3) * 0.8;
          ctx.setLineDash([8, 4]);
          ctx.beginPath();
          ctx.moveTo(0, o.y + o.h/2);
          ctx.lineTo(w, o.y + o.h/2);
          ctx.stroke();
          ctx.restore();

          // Exclamation Warning flashing card on the screen edge
          if (Math.floor(o.warningTime / 5) % 2 === 0) {
            ctx.save();
            ctx.fillStyle = '#ef4444';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(w - 30, o.y + o.h/2 - 12);
            ctx.lineTo(w - 12, o.y + o.h/2);
            ctx.lineTo(w - 30, o.y + o.h/2 + 12);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'black 12px Plus Jakarta Sans';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('!', w - 24, o.y + o.h/2);
            ctx.restore();
          }
          return; // Don't slide in yet!
        }
        o.x -= (gameSpeedRef.current + o.speed);
      } else {
        o.x -= gameSpeedRef.current;
      }

      // High-precision segment collision check for zappers, box collision for missiles
      let isColliding = false;
      const buffer = 8;
      
      if (o.type === 'zapper') {
        const orientation = o.orientation || 'vertical';
        let x1 = o.x + o.w/2, y1 = o.y + 10;
        let x2 = o.x + o.w/2, y2 = o.y + o.h - 10;
        
        if (orientation === 'horizontal') {
          x1 = o.x + 10; y1 = o.y + o.h/2;
          x2 = o.x + o.w - 10; y2 = o.y + o.h/2;
        } else if (orientation === 'diagonal') {
          x1 = o.x + 10; y1 = o.y + 10;
          x2 = o.x + o.w - 10; y2 = o.y + o.h - 10;
        }
        
        const dist = distanceToSegment(p.x + p.width/2, p.y + p.height/2, x1, y1, x2, y2);
        isColliding = dist < 22; // 22px precision hit boundary
      } else {
        isColliding = (
          p.x + buffer < o.x + o.w &&
          p.x + p.width - buffer > o.x &&
          p.y + buffer < o.y + o.h &&
          p.y + p.height - buffer > o.y
        );
      }

      if (isColliding && o.active && p.invincibleTimer === 0) {
        o.active = false;
        statsRef.current.badHit++;
        screenShakeRef.current = 15; // Trigger Screen Shake!

        const chosenRisk = o.itemType || 'hospitalization';
        const def = ITEM_DEFS[chosenRisk];

        if (p.shield) {
          p.shield = false;
          setHasShield(false);
          p.invincibleTimer = 45;
          playSFX('shield');
          addHitParticles(p.x + p.width/2, p.y + p.height/2, '#06b6d4', 25);

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
          portfolioRef.current += def.value;
          if (portfolioRef.current < 0) portfolioRef.current = 0;
          setPortfolio(portfolioRef.current);

          statsRef.current.losses += Math.abs(def.value);
          setLosses(statsRef.current.losses);

          p.invincibleTimer = 65;
          playSFX('bad');
          addHitParticles(p.x + p.width/2, p.y + p.height/2, '#ef4444', 30);

          const textId = nextEntityIdRef.current++;
          floatingTextsRef.current.push({
            id: textId,
            x: p.x,
            y: p.y - 10,
            text: `${def.value}`,
            color: '#fca5a5',
            alpha: 1.0,
            timer: 45,
          });
        }
      }

      // Draw Obstacles
      if (o.active && o.x > -100 && o.x < w + 200) {
        const riskImg = o.itemType ? imagesCache.current[o.itemType] : null;

        if (o.type === 'zapper') {
          const orientation = o.orientation || 'vertical';
          ctx.save();
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#ef4444';
          
          let x1 = o.x + o.w/2, y1 = o.y + 10;
          let x2 = o.x + o.w/2, y2 = o.y + o.h - 10;
          
          if (orientation === 'horizontal') {
            x1 = o.x + 10; y1 = o.y + o.h/2;
            x2 = o.x + o.w - 10; y2 = o.y + o.h/2;
          } else if (orientation === 'diagonal') {
            x1 = o.x + 10; y1 = o.y + 10;
            x2 = o.x + o.w - 10; y2 = o.y + o.h - 10;
          }
          
          // Endpoint Metal Rod Caps
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = '#f87171';
          ctx.lineWidth = 1.5;
          
          if (orientation === 'vertical') {
            ctx.fillRect(o.x, o.y, o.w, 10);
            ctx.strokeRect(o.x, o.y, o.w, 10);
            ctx.fillRect(o.x, o.y + o.h - 10, o.w, 10);
            ctx.strokeRect(o.x, o.y + o.h - 10, o.w, 10);
          } else if (orientation === 'horizontal') {
            ctx.fillRect(o.x, o.y, 10, o.h);
            ctx.strokeRect(o.x, o.y, 10, o.h);
            ctx.fillRect(o.x + o.w - 10, o.y, 10, o.h);
            ctx.strokeRect(o.x + o.w - 10, o.y, 10, o.h);
          } else {
            ctx.beginPath(); ctx.arc(x1, y1, 8, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(x2, y2, 8, 0, Math.PI*2); ctx.fill(); ctx.stroke();
          }
          
          // Dual-Layer Electric Neon lightning bolt!
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 4.5 + Math.random() * 2.0;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          
          const segments = 6;
          const dx = x2 - x1;
          const dy = y2 - y1;
          for (let i = 1; i <= segments; i++) {
            const pct = i / segments;
            const nx = -dy;
            const ny = dx;
            const len = Math.sqrt(nx*nx + ny*ny) || 1;
            const offset = (Math.random() - 0.5) * 12;
            const bx = x1 + dx * pct + (nx / len) * offset;
            const by = y1 + dy * pct + (ny / len) * offset;
            ctx.lineTo(bx, by);
          }
          ctx.stroke();
          
          // Inner bright white electrical lightning core
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();

          // Spawning neon sparks at terminals
          if (Math.random() < 0.18) {
            particlesRef.current.push({
              x: x1 + (Math.random() - 0.5) * 6,
              y: y1 + (Math.random() - 0.5) * 6,
              vx: (Math.random() - 0.5) * 2 - gameSpeedRef.current * 0.2,
              vy: (Math.random() - 0.5) * 2,
              life: 0,
              maxLife: 12 + Math.random() * 10,
              color: '#facc15',
              size: 1.5 + Math.random() * 2,
            });
            particlesRef.current.push({
              x: x2 + (Math.random() - 0.5) * 6,
              y: y2 + (Math.random() - 0.5) * 6,
              vx: (Math.random() - 0.5) * 2 - gameSpeedRef.current * 0.2,
              vy: (Math.random() - 0.5) * 2,
              life: 0,
              maxLife: 12 + Math.random() * 10,
              color: '#facc15',
              size: 1.5 + Math.random() * 2,
            });
          }

          // Render Risk Badge in the center of the zapper line
          if (riskImg) {
            const cx = (x1 + x2) / 2;
            const cy = (y1 + y2) / 2;
            const size = 30;
            const rx = cx - size/2;
            const ry = cy - size/2;
            
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, size/2 + 2, 0, Math.PI*2);
            ctx.fillStyle = '#0f172a';
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 1.5;
            ctx.fill();
            ctx.stroke();
            
            ctx.drawImage(riskImg as any, rx, ry, size, size);
            ctx.restore();
          }
        } else {
          // Draw Homing Missile Rocket
          ctx.save();
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#ef4444';
          
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = '#f87171';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(o.x + o.w, o.y + 4);
          ctx.lineTo(o.x + 12, o.y + 4);
          ctx.quadraticCurveTo(o.x, o.y + o.h/2, o.x + 12, o.y + o.h - 4);
          ctx.lineTo(o.x + o.w, o.y + o.h - 4);
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
          
          // Spawn Billowing Smoke particles from missile
          if (o.warningTime === 0 && distanceRef.current % 2 === 0) {
            particlesRef.current.push({
              x: o.x + o.w - 5,
              y: o.y + o.h/2 + (Math.random() - 0.5) * 6,
              vx: 1.5 + Math.random() * 2.0,
              vy: (Math.random() - 0.5) * 1.0,
              life: 0,
              maxLife: 25 + Math.random() * 15,
              color: Math.random() > 0.4 ? 'rgba(120, 113, 108, 0.65)' : 'rgba(168, 162, 158, 0.45)',
              size: 4 + Math.random() * 5,
            });
          }
        }
      }
    });

    obstaclesRef.current = obstaclesRef.current.filter(o => o.active && o.x > -100);

    // 4.5 DRAW INTERACTIVE SCARED EMPLOYEES/SCIENTISTS RUNNING & COWERING
    scientistsRef.current.forEach(s => {
      s.x += s.vx;
      s.x -= gameSpeedRef.current;
      
      s.walkFrame = (s.walkFrame + 0.15) % (Math.PI * 2);
      
      const dx = Math.abs(p.x - s.x);
      if (dx < 180) {
        s.panic = true;
        s.panicTimer = 60;
        
        // Trigger scientist comic text bubbles!
        if (!s.bubbleText && Math.random() < 0.08) {
          const quotes = ['Aaaah!', 'Watch out!', 'Save me!', 'Cyborg Banana!', 'Look Up!', 'Help!', 'Run!'];
          s.bubbleText = quotes[Math.floor(Math.random() * quotes.length)];
          s.bubbleTimer = 65;
          
          // With 25% chance, panicked scientist cowers on the floor!
          if (Math.random() < 0.25) {
            s.cowering = true;
          }
        }
      }
      
      if (s.cowering) {
        s.vx = -0.5; // crawl slowly
      } else if (s.panic) {
        s.vx = -3.2 - Math.random() * 0.8; // run away fast!
      } else {
        s.vx = -1.2;
      }

      ctx.save();
      
      const legBob = s.cowering ? 0 : Math.sin(s.walkFrame) * 2.2;
      const sy = s.y + legBob;
      
      // Draw white scientist hazmat suit
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#003da6';
      ctx.lineWidth = 1;
      
      if (s.cowering) {
        // Cowering pose (huddled down)
        ctx.beginPath();
        ctx.arc(s.x + s.width/2, sy + 18, 5, 0, Math.PI*2);
        ctx.fill(); ctx.stroke();
        
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(s.x + s.width/2 - 2, sy + 16, 4, 3);
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(s.x + s.width/2 - 6, sy + 22, 12, 6);
        ctx.strokeRect(s.x + s.width/2 - 6, sy + 22, 12, 6);
      } else {
        // Head / helmet
        ctx.beginPath();
        ctx.arc(s.x + s.width/2, sy + 6, 5, 0, Math.PI*2);
        ctx.fill(); ctx.stroke();
        
        // visor
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(s.x + s.width/2 - 2, sy + 3, 5, 3);
        
        // Body
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(s.x + s.width/2 - 4, sy + 10, 8, 12);
        ctx.strokeRect(s.x + s.width/2 - 4, sy + 10, 8, 12);
        
        // Legs
        ctx.fillRect(s.x + s.width/2 - 4, sy + 22, 3, 6 + legBob);
        ctx.fillRect(s.x + s.width/2 + 1, sy + 22, 3, 6 - legBob);
      }
      
      // Arms (Waving in panic if panicked, cowering if cowered)
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      
      if (s.cowering) {
        // Cowering arms shielding the head
        ctx.moveTo(s.x + s.width/2 - 5, sy + 22);
        ctx.lineTo(s.x + s.width/2 - 2, sy + 14);
        ctx.moveTo(s.x + s.width/2 + 5, sy + 22);
        ctx.lineTo(s.x + s.width/2 + 2, sy + 14);
      } else if (s.panic) {
        // Arm waving in panic!
        const armWave = Math.sin(distanceRef.current * 0.6) * 4;
        ctx.moveTo(s.x + s.width/2 - 4, sy + 12);
        ctx.lineTo(s.x + s.width/2 - 9, sy + 2 + armWave);
        ctx.moveTo(s.x + s.width/2 + 4, sy + 12);
        ctx.lineTo(s.x + s.width/2 + 9, sy + 2 - armWave);
      } else {
        const armSwing = Math.cos(s.walkFrame) * 4;
        ctx.moveTo(s.x + s.width/2 - 4, sy + 12);
        ctx.lineTo(s.x + s.width/2 - 7, sy + 18 + armSwing);
        ctx.moveTo(s.x + s.width/2 + 4, sy + 12);
        ctx.lineTo(s.x + s.width/2 + 7, sy + 18 - armSwing);
      }
      ctx.stroke();
      ctx.restore();

      // Render Comic Speech Bubbles
      if (s.bubbleText && s.bubbleTimer && s.bubbleTimer > 0) {
        s.bubbleTimer--;
        ctx.save();
        ctx.font = 'bold 9px Plus Jakarta Sans';
        const tw = ctx.measureText(s.bubbleText).width;
        const bx = s.x + s.width/2 - tw/2 - 4;
        const by = sy - 22;
        
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#003da6';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(bx, by, tw + 8, 12, 4);
        ctx.fill();
        ctx.stroke();
        
        // arrow pointing down
        ctx.beginPath();
        ctx.moveTo(s.x + s.width/2 - 3, by + 12);
        ctx.lineTo(s.x + s.width/2, by + 15);
        ctx.lineTo(s.x + s.width/2 + 3, by + 12);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#003da6';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(s.bubbleText, s.x + s.width/2, by + 6);
        ctx.restore();
      }
    });
    
    scientistsRef.current = scientistsRef.current.filter(s => s.x > -50);

    // 5. DRAW SPARKS / EXHAUST PARTICLES
    particlesRef.current.forEach(pt => {
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life++;

      const floorBoundary = h - 45;
      if (pt.y >= floorBoundary) {
        if (pt.vy > 5 && pt.color.includes('234')) {
          pt.life = pt.maxLife; // terminate bullet
          for (let s = 0; s < 3; s++) {
            particlesRef.current.push({
              x: pt.x,
              y: floorBoundary - 2,
              vx: (Math.random() - 0.5) * 4 - gameSpeedRef.current * 0.4,
              vy: -2 - Math.random() * 3,
              life: 0,
              maxLife: 15 + Math.random() * 10,
              color: '#facc15',
              size: 1.5 + Math.random() * 2,
            });
          }
        } else {
          pt.y = floorBoundary - 1;
          pt.vy = -Math.abs(pt.vy) * 0.45;
          pt.vx += (Math.random() - 0.5) * 2;
        }
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
      ft.y -= 0.6;
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

    // Smoothly and slowly increase background speed over time
    gameSpeedRef.current += 0.0003;

    spawnEntities(w, h);

    if (gameplayActiveRef.current) {
      requestAnimationFrame(runGameFrame);
    }
    
    ctx.restore(); // Restore screen shake ctx states
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

    requestAnimationFrame(runGameFrame);

    return () => {
      clearInterval(gameTimer);
      gameplayActiveRef.current = false;
      stopMusic();
    };
  }, [started, onGameEnd, runGameFrame]);

  const displayTime = `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`;

  return (
    <div
      className="relative h-full w-full overflow-hidden select-none"
      style={{ background: '#00081a' }}
    >
      {/* Immersive Full Screen Canvas Area */}
      <div
        ref={containerRef}
        className="absolute inset-0 select-none cursor-pointer"
        onTouchStart={triggerThrustStart}
        onTouchEnd={triggerThrustEnd}
        onMouseDown={triggerThrustStart}
        onMouseUp={triggerThrustEnd}
        onMouseLeave={triggerThrustEnd}
        style={{ touchAction: 'none' }}
      >
        <canvas ref={canvasRef} className="block w-full h-full" />
      </div>

      {/* TOP-LEFT OVERLAY: Gold Currency Capsule (Jetpack Joyride Stash Style) */}
      <div className="absolute top-[max(1rem,env(safe-area-inset-top))] left-4 pointer-events-none flex flex-col gap-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-600/90 to-yellow-500/90 pl-1.5 pr-3.5 py-1.5 rounded-full border-2 border-yellow-300 shadow-[0_4px_12px_rgba(234,179,8,0.45)]">
          {/* Spinning gold coin wrapper */}
          <div className="flex h-[1.8rem] w-[1.8rem] items-center justify-center rounded-full bg-yellow-400 text-[1.15rem] font-black text-amber-950 shadow-[0_0_8px_#ffffff] border border-amber-300 animate-[spin_3s_linear_infinite]">
            ₹
          </div>
          <div className="flex flex-col">
            <span className="text-[0.52rem] font-black tracking-widest text-amber-100 uppercase leading-none mb-0.5">PORTFOLIO</span>
            <span className="text-[1.1rem] font-black tracking-tight text-white font-mono leading-none">
              {portfolio.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Shield Inventory Badge */}
        {hasShield && (
          <div className="flex h-7 items-center justify-center rounded-full bg-cyan-500 px-3 border-2 border-cyan-300 text-[0.58rem] font-black text-white uppercase tracking-widest shadow-[0_0_10px_rgba(6,182,212,0.6)] animate-pulse w-fit">
            🛡 SHIELD ACTIVE
          </div>
        )}
      </div>

      {/* TOP-CENTER OVERLAY: Sleek Sci-Fi Goal Progress Bar */}
      <div className="absolute top-[max(1rem,env(safe-area-inset-top))] left-1/2 -translate-x-1/2 pointer-events-none w-[34vw] max-w-[12rem] flex flex-col items-center drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)]">
        <div className="flex justify-between w-full text-[0.55rem] font-black text-emerald-300 uppercase tracking-widest mb-1">
          <span>GROWTH GOAL</span>
          <span className="text-emerald-400 font-mono font-black">{Math.round((portfolio / TARGET_PORTFOLIO) * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-slate-950/90 rounded-full overflow-hidden border-2 border-emerald-500/40 p-[1px] shadow-[0_0_8px_rgba(16,185,129,0.25)]">
          <div
            className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_6px_#10b981]"
            style={{
              width: `${Math.min(100, (portfolio / TARGET_PORTFOLIO) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* TOP-RIGHT OVERLAY: Retro Arcade Large Distance Meter (Jetpack Joyride Style) */}
      <div 
        className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 pointer-events-none text-[2.6rem] font-black italic tracking-tighter text-white select-none font-sans drop-shadow-[0_4px_6px_rgba(0,0,0,0.95)]"
        style={{
          WebkitTextStroke: '2px #000000',
          textShadow: '3px 3px 0px #000000',
        }}
      >
        {distance}<span className="text-[1.35rem] font-extrabold not-italic text-yellow-400 ml-1">M</span>
      </div>

      {/* BOTTOM-RIGHT CAPSULE: Digital Time & Sound Controls */}
      <div className="absolute bottom-16 right-4 flex items-center gap-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
        {/* Digital Time capsule */}
        <div 
          className="flex h-8 items-center gap-1.5 bg-black/65 px-3 rounded-full border border-white/20 backdrop-blur-xs font-mono"
          style={{
            borderColor: timeLeft <= 10 ? '#EF4444' : 'rgba(255,255,255,0.2)',
            boxShadow: timeLeft <= 10 ? '0 0 10px rgba(239,68,68,0.45)' : 'none'
          }}
        >
          <span className="text-[0.55rem] font-black text-slate-300 uppercase tracking-widest">TIME</span>
          <span 
            className="text-[0.85rem] font-black leading-none"
            style={{ color: timeLeft <= 10 ? '#EF4444' : 'white' }}
          >
            {displayTime}
          </span>
        </div>

        {/* Mute/Sound toggle speaker button */}
        <button
          onClick={handleMuteToggle}
          className="btn-press flex h-8 w-8 items-center justify-center rounded-full bg-black/65 border border-white/20 hover:bg-black/80 text-white backdrop-blur-xs shadow-md"
        >
          {muted ? (
            <span className="text-[0.75rem]">🔇</span>
          ) : (
            <span className="text-[0.75rem]">🔊</span>
          )}
        </button>
      </div>

      {/* Tap & Hold thrust hint at start */}
      {started && timeLeft > 40 && (
        <div className="pointer-events-none absolute bottom-12 inset-x-0 flex justify-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.2em] text-white/50 bg-black/35 px-4 py-1.5 rounded-full border border-white/5 backdrop-blur-xs animate-pulse">
            👆 Tap & Hold screen to activate Thruster!
          </p>
        </div>
      )}

      {!started && <HowToPlayPopup onStart={handleStart} />}
    </div>
  );
};

export default GameScreen;
