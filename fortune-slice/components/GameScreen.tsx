import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GameResult, ItemType } from '../types';
import {
  GAME_SECS,
  GREEN,
  ITEM_DEFS,
  MIN_SPAWN_MS,
  RAMP_INTERVAL_SECS,
  SPAWN_INTERVAL_MS,
  TARGET_PORTFOLIO,
} from '../constants';
import HowToPlayPopup from './HowToPlayPopup';

// ─── Audio ────────────────────────────────────────────────────────────────────
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
    musicGain.gain.value = 0.1;
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
  gain.gain.setValueAtTime(0.6, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
  osc.start();
  osc.stop(ctx.currentTime + 0.18);
  beat++;
  if (beat % 4 === 0) {
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bass.connect(bassGain);
    bassGain.connect(musicGain!);
    bass.type = 'sine';
    bass.frequency.value = freq / 2;
    bassGain.gain.setValueAtTime(0.45, ctx.currentTime);
    bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    bass.start();
    bass.stop(ctx.currentTime + 0.3);
  }
  musicTimer = setTimeout(beatTick, 260);
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

function playSFX(type: 'slice' | 'bonus' | 'bad' | 'gameover' | 'btn') {
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
  if (type === 'slice')    noteAt(1047, 0, 0.12, 'sine', 0.35);
  if (type === 'bonus')    { noteAt(659, 0, 0.12, 'sine', 0.4); noteAt(880, 0.1, 0.12, 'sine', 0.4); noteAt(1318, 0.2, 0.18, 'sine', 0.45); }
  if (type === 'bad')      noteAt(90, 0, 0.22, 'sawtooth', 0.3);
  if (type === 'gameover') [523.25, 440, 349.23, 261.63].forEach((f, i) => noteAt(f, i * 0.22, 0.26, 'sine', 0.28));
  if (type === 'btn')      noteAt(880, 0, 0.07, 'sine', 0.18);
}

// ─── Physics ─────────────────────────────────────────────────────────────────
const GRAVITY = 420; // px/s²
const ITEM_RADIUS = 36; // px
const TRAIL_MAX = 14;
const MIN_SWIPE_DIST = 4; // minimum px movement to test for slices

/** Returns true if the segment (x1,y1)→(x2,y2) passes through circle at (cx,cy) with radius r. */
function segmentHitsCircle(
  x1: number, y1: number,
  x2: number, y2: number,
  cx: number, cy: number,
  r: number,
): boolean {
  const dx = x2 - x1, dy = y2 - y1;
  const fx = x1 - cx, fy = y1 - cy;
  const a = dx * dx + dy * dy;
  // Zero-length segment — fall back to point-in-circle
  if (a < 0.001) return fx * fx + fy * fy <= r * r;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - r * r;
  const disc = b * b - 4 * a * c;
  if (disc < 0) return false;
  const sq = Math.sqrt(disc);
  const t1 = (-b - sq) / (2 * a);
  const t2 = (-b + sq) / (2 * a);
  return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1) || (t1 < 0 && t2 > 1);
}

function pickItemType(): ItemType {
  const total = Object.values(ITEM_DEFS).reduce((s, d) => s + d.weight, 0);
  let rand = Math.random() * total;
  for (const [type, def] of Object.entries(ITEM_DEFS) as [ItemType, (typeof ITEM_DEFS)[ItemType]][]) {
    rand -= def.weight;
    if (rand <= 0) return type;
  }
  return 'lifecover';
}

interface FlyingItem {
  id: number;
  type: ItemType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  angularVel: number;
  sliced: boolean;
  slicedAt: number;
  missed: boolean;
}

interface BurstParticle {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface Props {
  onGameEnd: (result: GameResult) => void;
}

const GameScreen: React.FC<Props> = ({ onGameEnd }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<FlyingItem[]>([]);
  const [bursts, setBursts] = useState<BurstParticle[]>([]);
  const [portfolio, setPortfolio] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECS);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);
  const [gains, setGains] = useState(0);
  const [losses, setLosses] = useState(0);
  const [shake, setShake] = useState(false);
  const [scorePopups, setScorePopups] = useState<{ id: number; x: number; y: number; text: string; color: string }[]>([]);
  // Swipe trail — array of {x,y} capped to TRAIL_MAX
  const [trailPoints, setTrailPoints] = useState<{ x: number; y: number }[]>([]);
  const [trailFading, setTrailFading] = useState(false);

  const itemsRef = useRef<FlyingItem[]>([]);
  const portfolioRef = useRef(0);
  const timeLeftRef = useRef(GAME_SECS);
  const activeRef = useRef(false);
  const nextIdRef = useRef(0);
  const statsRef = useRef({ molesSeen: 0, molesWhacked: 0, goodWhacks: 0, badWhacks: 0, gains: 0, losses: 0 });
  const lastFrameRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const burstIdRef = useRef(0);
  const popupIdRef = useRef(0);
  const containerDims = useRef({ w: 380, h: 600 });

  // Swipe tracking refs (no re-render on change)
  const isPointerDownRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const trailFadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      containerDims.current = { w: width, h: height };
    });
    obs.observe(el);
    const r = el.getBoundingClientRect();
    containerDims.current = { w: r.width, h: r.height };
    return () => obs.disconnect();
  }, []);

  function spawnItem(count = 1) {
    if (!activeRef.current) return;
    const { w, h } = containerDims.current;
    const newItems: FlyingItem[] = [];
    for (let i = 0; i < count; i++) {
      const margin = ITEM_RADIUS + 10;
      const x = margin + Math.random() * (w - margin * 2);
      const vy = -(580 + Math.random() * 200);
      const vx = (Math.random() - 0.5) * 140;
      const angularVel = (Math.random() - 0.5) * 180;
      const type = pickItemType();
      newItems.push({
        id: nextIdRef.current++,
        type, x, y: h + ITEM_RADIUS + 5,
        vx, vy,
        rotation: Math.random() * 360,
        angularVel,
        sliced: false, slicedAt: 0, missed: false,
      });
      statsRef.current.molesSeen++;
    }
    itemsRef.current = [...itemsRef.current, ...newItems];
    setItems([...itemsRef.current]);
  }

  // Physics loop
  useEffect(() => {
    if (!started) return;
    lastFrameRef.current = performance.now();
    function tick(now: number) {
      const dt = Math.min((now - lastFrameRef.current) / 1000, 0.05);
      lastFrameRef.current = now;
      const { h } = containerDims.current;
      const cutoff = h + ITEM_RADIUS * 4;
      let changed = false;
      const updated = itemsRef.current
        .map(item => {
          if (item.sliced) return item;
          const vy = item.vy + GRAVITY * dt;
          const y = item.y + vy * dt;
          const x = item.x + item.vx * dt;
          const rotation = item.rotation + item.angularVel * dt;
          if (y > cutoff) { changed = true; return { ...item, y, x, vy, rotation, missed: true }; }
          return { ...item, y, x, vy, rotation };
        })
        .filter(item => {
          if (item.missed) { changed = true; return false; }
          if (item.sliced && now - item.slicedAt > 400) { changed = true; return false; }
          return true;
        });
      if (changed || updated.some((item, i) => item !== itemsRef.current[i])) {
        itemsRef.current = updated;
        setItems([...updated]);
      }
      if (activeRef.current) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [started]);

  // Spawn + timer loop
  useEffect(() => {
    if (!started) return;
    startMusic();
    activeRef.current = true;

    let spawnTimer: ReturnType<typeof setTimeout>;
    function scheduleSpawn() {
      if (!activeRef.current) return;
      const elapsed = GAME_SECS - timeLeftRef.current;
      const ramps = Math.min(3, Math.floor(elapsed / RAMP_INTERVAL_SECS));
      const count = ramps >= 2 && Math.random() < 0.35 ? 2 : 1;
      spawnItem(count);
      const delay = Math.max(MIN_SPAWN_MS, SPAWN_INTERVAL_MS - ramps * 180);
      spawnTimer = setTimeout(scheduleSpawn, delay);
    }
    spawnTimer = setTimeout(scheduleSpawn, 500);

    const countdownTimer = setInterval(() => {
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        clearInterval(countdownTimer);
        clearTimeout(spawnTimer);
        activeRef.current = false;
        stopMusic();
        playSFX('gameover');
        const { molesSeen, molesWhacked, goodWhacks, badWhacks, gains, losses } = statsRef.current;
        onGameEnd({
          portfolio: portfolioRef.current,
          molesSeen, molesWhacked, goodWhacks, badWhacks,
          gains, losses,
          timeSeconds: GAME_SECS,
          rawScore: Math.min(100, Math.max(0, Math.round((portfolioRef.current / TARGET_PORTFOLIO) * 100))),
        });
      }
    }, 1000);

    return () => {
      activeRef.current = false;
      clearInterval(countdownTimer);
      clearTimeout(spawnTimer);
      stopMusic();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, onGameEnd]);

  // ─── Slice logic — shared between tap and swipe ───────────────────────────
  function trySlice(x1: number, y1: number, x2: number, y2: number) {
    let anyHit = false;
    const updated = itemsRef.current.map(item => {
      if (item.sliced || item.missed) return item;
      const hitRadius = (item.type === 'loyaltybonus' ? ITEM_RADIUS + 6 : ITEM_RADIUS) * 1.25;
      if (!segmentHitsCircle(x1, y1, x2, y2, item.x, item.y, hitRadius)) return item;

      anyHit = true;
      const def = ITEM_DEFS[item.type];
      const delta = def.value;

      portfolioRef.current += delta;
      setPortfolio(portfolioRef.current);
      statsRef.current.molesWhacked++;

      if (def.bad) {
        statsRef.current.badWhacks++;
        statsRef.current.losses += Math.abs(delta);
        setLosses(statsRef.current.losses);
        setShake(true);
        setTimeout(() => setShake(false), 360);
        playSFX('bad');
      } else {
        statsRef.current.goodWhacks++;
        statsRef.current.gains += delta;
        setGains(statsRef.current.gains);
        playSFX(item.type === 'loyaltybonus' ? 'bonus' : 'slice');
      }

      const pid = popupIdRef.current++;
      const text = delta > 0 ? `+${delta.toLocaleString('en-IN')}` : `-${Math.abs(delta).toLocaleString('en-IN')}`;
      setScorePopups(prev => [...prev, { id: pid, x: item.x, y: item.y, text, color: def.bad ? '#FCA5A5' : '#86EFAC' }]);
      setTimeout(() => setScorePopups(prev => prev.filter(p => p.id !== pid)), 900);

      const bid = burstIdRef.current++;
      setBursts(prev => [...prev, { id: bid, x: item.x, y: item.y, color: def.color }]);
      setTimeout(() => setBursts(prev => prev.filter(b => b.id !== bid)), 500);

      return { ...item, sliced: true, slicedAt: performance.now() };
    });

    if (anyHit) { itemsRef.current = updated; setItems([...updated]); }
  }

  // ─── Pointer handlers ─────────────────────────────────────────────────────
  const getArenaPos = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = containerRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!started || !activeRef.current) return;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    const pos = getArenaPos(e);
    isPointerDownRef.current = true;
    lastPosRef.current = pos;

    // Cancel any pending trail fade
    if (trailFadeTimerRef.current) { clearTimeout(trailFadeTimerRef.current); trailFadeTimerRef.current = null; }
    setTrailFading(false);
    setTrailPoints([pos]);

    // Also test the tap-down point itself (catches stationary taps on items)
    trySlice(pos.x, pos.y, pos.x, pos.y);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, getArenaPos]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current || !started || !activeRef.current) return;
    const pos = getArenaPos(e);
    const last = lastPosRef.current!;

    const dx = pos.x - last.x;
    const dy = pos.y - last.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Update visual trail unconditionally while dragging
    setTrailPoints(prev => {
      const next = [...prev, pos];
      return next.length > TRAIL_MAX ? next.slice(next.length - TRAIL_MAX) : next;
    });

    // Only test for slices when there's real movement
    if (dist >= MIN_SWIPE_DIST) {
      trySlice(last.x, last.y, pos.x, pos.y);
      lastPosRef.current = pos;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, getArenaPos]);

  const handlePointerUp = useCallback(() => {
    isPointerDownRef.current = false;
    lastPosRef.current = null;
    setTrailFading(true);
    trailFadeTimerRef.current = setTimeout(() => {
      setTrailPoints([]);
      setTrailFading(false);
      trailFadeTimerRef.current = null;
    }, 200);
  }, []);

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

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  const displayPortfolio = portfolio;
  const timerCritical = timeLeft <= 10;
  const totalWealth = gains + losses || 1;
  const gainPct = (gains / totalWealth) * 100;
  const lossPct = 100 - gainPct;

  // Build SVG polyline points string from trail
  const trailPolyline = trailPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div
      className="relative flex h-full min-h-0 flex-col"
      style={{ background: 'linear-gradient(165deg, #00091A 0%, #001535 40%, #000C22 70%, #00071A 100%)' }}
    >
      {/* Header */}
      <div
        className="flex flex-shrink-0 items-center justify-between px-[4vw] pb-[0.8vh]"
        style={{ paddingTop: 'max(2vh, calc(env(safe-area-inset-top) + 0.5rem))' }}
      >
        <button
          onClick={handleMuteToggle}
          className="btn-press flex h-[2.7rem] min-w-[4.1rem] flex-shrink-0 items-center justify-center rounded-full px-[0.6rem] text-[0.72rem] font-extrabold uppercase text-white"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)' }}
        >
          {muted ? 'Muted' : 'Sound'}
        </button>

        <div className="text-center">
          <div
            className="font-extrabold tabular-nums transition-colors"
            style={{
              color: timerCritical ? '#EF4444' : 'white',
              fontSize: 'clamp(1.75rem, 8vw, 2.15rem)',
              textShadow: timerCritical ? '0 0 12px rgba(239,68,68,0.6)' : 'none',
            }}
          >
            {mm}:{ss}
          </div>
          <div className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-blue-300">Time Left</div>
        </div>

        <div className="w-[4.1rem] flex-shrink-0" />
      </div>

      {/* Game arena */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: 'none', cursor: 'crosshair' }}
      >
        {/* Decorative background stars */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[...Array(18)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: i % 3 === 0 ? 2 : 1,
                height: i % 3 === 0 ? 2 : 1,
                top: `${(i * 17 + 5) % 90}%`,
                left: `${(i * 23 + 8) % 95}%`,
                opacity: 0.15 + (i % 4) * 0.08,
              }}
            />
          ))}
        </div>

        {/* SVG swipe trail overlay */}
        {trailPoints.length >= 2 && (
          <svg
            className="pointer-events-none absolute inset-0"
            width="100%" height="100%"
            style={{ opacity: trailFading ? 0 : 1, transition: trailFading ? 'opacity 0.18s ease-out' : 'none' }}
          >
            <defs>
              <linearGradient id="trailGrad" gradientUnits="userSpaceOnUse"
                x1={trailPoints[0]?.x ?? 0} y1={trailPoints[0]?.y ?? 0}
                x2={trailPoints[trailPoints.length - 1]?.x ?? 0} y2={trailPoints[trailPoints.length - 1]?.y ?? 0}>
                <stop offset="0%" stopColor="white" stopOpacity="0"/>
                <stop offset="60%" stopColor="#E0F0FF" stopOpacity="0.55"/>
                <stop offset="100%" stopColor="white" stopOpacity="0.9"/>
              </linearGradient>
            </defs>
            {/* Glow layer */}
            <polyline
              points={trailPolyline}
              fill="none"
              stroke="rgba(150,210,255,0.3)"
              strokeWidth="18"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Core blade line */}
            <polyline
              points={trailPolyline}
              fill="none"
              stroke="url(#trailGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Bright tip dot */}
            {trailPoints.length > 0 && (
              <circle
                cx={trailPoints[trailPoints.length - 1].x}
                cy={trailPoints[trailPoints.length - 1].y}
                r="5"
                fill="white"
                opacity="0.85"
              />
            )}
          </svg>
        )}

        {/* Burst particles on slice */}
        {bursts.map(b => (
          <div
            key={b.id}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: b.x - 30, top: b.y - 30,
              width: 60, height: 60,
              background: `radial-gradient(circle, ${b.color}bb 0%, transparent 70%)`,
              animation: 'slice-burst 0.45s ease-out forwards',
            }}
          />
        ))}

        {/* Flying items */}
        {items.map(item => {
          const def = ITEM_DEFS[item.type];
          const size = item.type === 'loyaltybonus' ? ITEM_RADIUS + 6 : ITEM_RADIUS;
          return (
            <div
              key={item.id}
              className="pointer-events-none absolute select-none"
              style={{
                left: item.x - size,
                top: item.y - size,
                width: size * 2,
                height: size * 2,
                transform: `rotate(${item.rotation}deg)`,
                animation: item.sliced ? 'item-slice 0.38s ease-out forwards' : undefined,
                willChange: 'transform, left, top',
              }}
            >
              <div
                className="flex h-full w-full flex-col items-center justify-center rounded-full"
                style={{
                  background: `radial-gradient(circle at 38% 32%, ${def.color}ee, ${def.color}aa)`,
                  boxShadow: item.type === 'loyaltybonus'
                    ? `0 0 1.4rem ${def.color}, 0 0 0.5rem ${def.color}80`
                    : `0 0 0.8rem ${def.color}60`,
                  border: `0.15rem solid ${def.color}88`,
                }}
              >
                <img src={def.icon} alt={def.label} style={{ width: size , height: size, objectFit: 'contain' }} />
              </div>
            </div>
          );
        })}

        {/* Score popups */}
        {scorePopups.map(popup => (
          <div
            key={popup.id}
            className="popup-float pointer-events-none absolute z-20 font-extrabold"
            style={{
              left: popup.x - 40, top: popup.y - 20,
              width: 80, textAlign: 'center',
              fontSize: '0.9rem', color: popup.color,
              textShadow: '0 0.1rem 0.4rem rgba(0,0,0,0.9)',
            }}
          >
            {popup.text}
          </div>
        ))}

        {started && items.length === 0 && timeLeft > 55 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="text-[0.75rem] font-bold uppercase tracking-[0.15em] text-white/30">Swipe to slice!</p>
          </div>
        )}
      </div>

      {/* Score bar */}
      <div className="mx-[4vw] mb-[0.4vh] flex-shrink-0">
        <div className={`mb-[0.3rem] text-center ${shake ? 'shake' : ''}`}>
          <span className="text-[clamp(1rem,4.6vw,1.25rem)] font-extrabold" style={{ color: displayPortfolio < 0 ? '#EF4444' : GREEN }}>
            {displayPortfolio < 0 ? `-${Math.abs(displayPortfolio).toLocaleString('en-IN')}` : displayPortfolio.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="flex h-[0.65rem] overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${gainPct}%`, background: `linear-gradient(90deg, ${GREEN}, #34D399)`, borderRadius: gainPct > 0 ? '9999px 0 0 9999px' : undefined }}
          />
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${lossPct}%`, background: 'linear-gradient(90deg, #F87171, #EF4444)', borderRadius: lossPct > 0 && gainPct === 0 ? '9999px' : undefined }}
          />
        </div>
        <div className="mt-[0.3rem] flex justify-between">
          <span className="text-[0.58rem] font-bold" style={{ color: GREEN }}>{gains > 0 ? `${Math.round(gainPct)}%` : '0%'} gained</span>
          <span className="text-[0.58rem] font-bold text-red-400">{losses > 0 ? `${Math.round(lossPct)}%` : '0%'} drained</span>
        </div>
      </div>

      {/* Risks legend */}
      <div
        className="flex-shrink-0 px-[4vw]"
        style={{ paddingBottom: 'max(1.5vh, calc(env(safe-area-inset-bottom) + 0.4rem))' }}
      >
        <div className="rounded-[0.9rem] border border-white/10 bg-white/5 px-[0.7rem] py-[0.45rem]">
          <p className="mb-[0.3rem] text-[0.52rem] font-extrabold uppercase tracking-[0.08em] text-red-300">Avoid Risk Tokens</p>
          <div className="flex justify-between items-center w-full gap-[0.2rem]">
            {(Object.entries(ITEM_DEFS) as [ItemType, (typeof ITEM_DEFS)[ItemType]][])
              .filter(([, d]) => d.bad)
              .map(([type, def]) => (
                <div key={type} className="flex items-center gap-[0.25rem]">
                  <span
                    className="flex h-[1.65rem] w-[1.65rem] flex-shrink-0 items-center justify-center rounded-full text-[0.8rem]"
                    style={{ background: def.color + '33', border: `1.5px solid ${def.color}66` }}
                  >
                    <img src={def.icon} alt={def.label} className="h-[1.1rem] w-[1.1rem] object-contain" />
                  </span>
                  <div>
                    {/* <p className="text-[0.52rem] font-semibold leading-tight text-white">{def.label}</p> */}
                    <p className="text-[0.52rem] font-bold leading-tight text-red-300">-{Math.abs(def.value).toLocaleString('en-IN')}</p>
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
