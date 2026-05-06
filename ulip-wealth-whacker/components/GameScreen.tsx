import React, { useEffect, useRef, useState } from 'react';
import { GameResult, MoleType } from '../types';
import {
  GAME_SECS, SPAWN_INTERVAL_MS, MOLE_VISIBLE_MS,
  MIN_SPAWN_MS, MIN_MOLE_VISIBLE_MS, RAMP_INTERVAL_SECS,
  MOLE_DEFS, TARGET_PORTFOLIO, GREEN,
} from '../constants';

// ── Audio engine (module-level singletons) ────────────────────────────────────
let _ctx: AudioContext | null = null;
let _master: GainNode | null = null;
let _musicGain: GainNode | null = null;
let _musicTid: ReturnType<typeof setTimeout> | null = null;
let _beat = 0;

const MUSIC_NOTES   = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33];
const MUSIC_PATTERN = [0, 2, 4, 2, 1, 3, 5, 3, 0, 4, 2, 5, 1, 3, 4, 2];

function getCtx(): AudioContext {
  if (!_ctx) {
    _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    _master = _ctx.createGain();
    _master.gain.value = 1;
    _master.connect(_ctx.destination);
    _musicGain = _ctx.createGain();
    _musicGain.gain.value = 0.12;
    _musicGain.connect(_master);
  }
  return _ctx;
}

function beatTick() {
  const ctx = getCtx();
  const freq = MUSIC_NOTES[MUSIC_PATTERN[_beat % MUSIC_PATTERN.length]];
  const osc = ctx.createOscillator();
  const g   = ctx.createGain();
  osc.connect(g);
  g.connect(_musicGain!);
  osc.type = 'triangle';
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.7, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
  _beat++;

  // Add bass note every 4 beats
  if (_beat % 4 === 0) {
    const bass = ctx.createOscillator();
    const bg   = ctx.createGain();
    bass.connect(bg);
    bg.connect(_musicGain!);
    bass.type = 'sine';
    bass.frequency.value = freq / 2;
    bg.gain.setValueAtTime(0.5, ctx.currentTime);
    bg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    bass.start();
    bass.stop(ctx.currentTime + 0.35);
  }

  _musicTid = setTimeout(beatTick, 270);
}

function startMusic() {
  if (_musicTid) return;
  getCtx();
  _beat = 0;
  beatTick();
}

function stopMusic() {
  if (_musicTid) { clearTimeout(_musicTid); _musicTid = null; }
}

function setAudioMuted(muted: boolean) {
  getCtx();
  if (_master) _master.gain.setTargetAtTime(muted ? 0 : 1, _ctx!.currentTime, 0.05);
}

function playSFX(type: 'good' | 'bullrun' | 'bad' | 'gameover' | 'btn') {
  const ctx = getCtx();
  if (!_master) return;
  const t = ctx.currentTime;

  const note = (freq: number, dur: number, waveType: OscillatorType, vol: number, startFreq?: number) => {
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.connect(g);
    g.connect(_master!);
    osc.type = waveType;
    if (startFreq) {
      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(freq, t + dur * 0.8);
    } else {
      osc.frequency.value = freq;
    }
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.start(t);
    osc.stop(t + dur);
  };

  const noteAt = (freq: number, delay: number, dur: number, waveType: OscillatorType, vol: number) => {
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.connect(g);
    g.connect(_master!);
    osc.type = waveType;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, t + delay);
    g.gain.setValueAtTime(vol, t + delay + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, t + delay + dur);
    osc.start(t + delay);
    osc.stop(t + delay + dur);
  };

  if (type === 'good') {
    note(1047, 0.14, 'sine', 0.35, 523);
  } else if (type === 'bullrun') {
    noteAt(659,  0,    0.14, 'sine', 0.4);
    noteAt(784,  0.12, 0.14, 'sine', 0.4);
    noteAt(1047, 0.24, 0.18, 'sine', 0.45);
  } else if (type === 'bad') {
    note(80, 0.25, 'sawtooth', 0.3, 220);
  } else if (type === 'gameover') {
    [523.25, 440, 349.23, 261.63].forEach((f, i) => {
      noteAt(f, i * 0.22, 0.28, 'sine', 0.3);
    });
  } else if (type === 'btn') {
    note(880, 0.07, 'sine', 0.18);
  }
}

// ── Mole type picker (weighted) ───────────────────────────────────────────────
function pickMoleType(): MoleType {
  const total = Object.values(MOLE_DEFS).reduce((s, d) => s + d.weight, 0);
  let rand = Math.random() * total;
  for (const [type, def] of Object.entries(MOLE_DEFS) as [MoleType, (typeof MOLE_DEFS)[MoleType]][]) {
    rand -= def.weight;
    if (rand <= 0) return type;
  }
  return 'equity';
}

// ── Mole state ────────────────────────────────────────────────────────────────
interface MoleState {
  id: number;
  type: MoleType;
  whacked: boolean;
  hiding: boolean;
}

interface Popup {
  id: number;
  holeIdx: number;
  text: string;
  color: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  onGameEnd: (result: GameResult) => void;
}

const GameScreen: React.FC<Props> = ({ onGameEnd }) => {
  const [holes,     setHoles]     = useState<(MoleState | null)[]>(Array(9).fill(null));
  const [portfolio, setPortfolio] = useState(0);
  const [timeLeft,  setTimeLeft]  = useState(GAME_SECS);
  const [muted,     setMuted]     = useState(false);
  const [popups,    setPopups]    = useState<Popup[]>([]);
  const [shake,     setShake]     = useState(false);

  const holesRef     = useRef<(MoleState | null)[]>(Array(9).fill(null));
  const portfolioRef = useRef(0);
  const timeLeftRef  = useRef(GAME_SECS);
  const activeRef    = useRef(true);
  const nextIdRef    = useRef(0);
  const popupIdRef   = useRef(0);
  const statsRef     = useRef({ molesSeen: 0, molesWhacked: 0, goodWhacks: 0, badWhacks: 0 });

  // ── Game loop ──────────────────────────────────────────────────────────────
  useEffect(() => {
    startMusic();
    activeRef.current = true;

    function getDiff() {
      const elapsed = GAME_SECS - timeLeftRef.current;
      const ramps = Math.min(3, Math.floor(elapsed / RAMP_INTERVAL_SECS));
      return {
        spawnMs:   Math.max(MIN_SPAWN_MS,        SPAWN_INTERVAL_MS   - ramps * 160),
        visibleMs: Math.max(MIN_MOLE_VISIBLE_MS,  MOLE_VISIBLE_MS    - ramps * 200),
      };
    }

    function spawnMole() {
      if (!activeRef.current) return;
      const empty = holesRef.current.map((m, i) => (m === null ? i : -1)).filter(i => i >= 0);
      if (empty.length === 0) return;

      const holeIdx = empty[Math.floor(Math.random() * empty.length)];
      const type    = pickMoleType();
      const id      = nextIdRef.current++;
      const { visibleMs } = getDiff();

      const mole: MoleState = { id, type, whacked: false, hiding: false };
      const h = [...holesRef.current];
      h[holeIdx] = mole;
      holesRef.current = h;
      setHoles([...h]);
      statsRef.current.molesSeen++;

      // Auto-hide after visibleMs
      setTimeout(() => {
        if (!activeRef.current) return;
        const cur = holesRef.current[holeIdx];
        if (!cur || cur.id !== id || cur.whacked) return;
        const h2 = [...holesRef.current];
        h2[holeIdx] = { ...cur, hiding: true };
        holesRef.current = h2;
        setHoles([...h2]);

        setTimeout(() => {
          if (!activeRef.current) return;
          const c = holesRef.current[holeIdx];
          if (!c || c.id !== id) return;
          const h3 = [...holesRef.current];
          h3[holeIdx] = null;
          holesRef.current = h3;
          setHoles([...h3]);
        }, 240);
      }, visibleMs);
    }

    let spawnTid: ReturnType<typeof setTimeout>;
    function scheduleSpawn() {
      if (!activeRef.current) return;
      spawnMole();
      const { spawnMs } = getDiff();
      spawnTid = setTimeout(scheduleSpawn, spawnMs);
    }

    spawnTid = setTimeout(scheduleSpawn, 400);

    const timer = setInterval(() => {
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        clearInterval(timer);
        clearTimeout(spawnTid);
        activeRef.current = false;
        stopMusic();
        playSFX('gameover');
        const { molesSeen, molesWhacked, goodWhacks, badWhacks } = statsRef.current;
        onGameEnd({
          portfolio:    Math.max(0, portfolioRef.current),
          molesSeen,
          molesWhacked,
          goodWhacks,
          badWhacks,
          timeSeconds:  GAME_SECS,
          rawScore:     Math.min(100, Math.max(0, Math.round((portfolioRef.current / TARGET_PORTFOLIO) * 100))),
        });
      }
    }, 1000);

    return () => {
      activeRef.current = false;
      clearInterval(timer);
      clearTimeout(spawnTid);
      stopMusic();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Whack handler ──────────────────────────────────────────────────────────
  function handleWhack(holeIdx: number) {
    if (!activeRef.current) return;
    const mole = holesRef.current[holeIdx];
    if (!mole || mole.whacked || mole.hiding) return;

    const def   = MOLE_DEFS[mole.type];
    const delta = def.value;

    // Mark whacked
    const h = [...holesRef.current];
    h[holeIdx] = { ...mole, whacked: true };
    holesRef.current = h;
    setHoles([...h]);

    // Update portfolio
    portfolioRef.current += delta;
    setPortfolio(portfolioRef.current);

    // Stats
    statsRef.current.molesWhacked++;
    if (!def.bad) statsRef.current.goodWhacks++;
    else { statsRef.current.badWhacks++; setShake(true); setTimeout(() => setShake(false), 360); }

    // Audio
    if (mole.type === 'bullrun') playSFX('bullrun');
    else if (def.bad) playSFX('bad');
    else playSFX('good');

    // Popup
    const pid  = popupIdRef.current++;
    const text = delta > 0 ? `+₹${delta.toLocaleString('en-IN')}` : `-₹${Math.abs(delta).toLocaleString('en-IN')}`;
    setPopups(prev => [...prev, { id: pid, holeIdx, text, color: def.bad ? '#FCA5A5' : '#86EFAC' }]);
    setTimeout(() => setPopups(prev => prev.filter(p => p.id !== pid)), 800);

    // Remove after whack animation
    setTimeout(() => {
      if (!activeRef.current) return;
      const c = holesRef.current[holeIdx];
      if (!c || c.id !== mole.id) return;
      const h2 = [...holesRef.current];
      h2[holeIdx] = null;
      holesRef.current = h2;
      setHoles([...h2]);
    }, 290);
  }

  function handleMuteToggle() {
    const next = !muted;
    setMuted(next);
    setAudioMuted(next);
    if (!next) playSFX('btn');
  }

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  const displayPortfolio = Math.max(0, portfolio);
  const pct = Math.min(100, Math.round((displayPortfolio / TARGET_PORTFOLIO) * 100));
  const timerCritical = timeLeft <= 10;

  return (
    <div
      className="flex flex-col h-screen"
      style={{ background: 'linear-gradient(170deg, #001230 0%, #002060 55%, #001a30 100%)' }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
        <button
          onClick={handleMuteToggle}
          className="w-10 h-10 rounded-full flex items-center justify-center btn-press flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          <span className="text-lg">{muted ? '🔇' : '🔊'}</span>
        </button>

        <div className="text-center">
          <div
            className="font-extrabold text-3xl tabular-nums transition-colors"
            style={{ color: timerCritical ? '#EF4444' : 'white', textShadow: timerCritical ? '0 0 12px rgba(239,68,68,0.6)' : 'none' }}
          >
            {mm}:{ss}
          </div>
          <div className="text-blue-400 text-[9px] font-bold uppercase tracking-widest">Time Left</div>
        </div>

        <div className={`text-right ${shake ? 'shake' : ''}`}>
          <div className="font-extrabold text-xl" style={{ color: GREEN }}>
            ₹{displayPortfolio.toLocaleString('en-IN')}
          </div>
          <div className="text-blue-400 text-[9px] font-bold uppercase tracking-widest">Portfolio</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mx-4 mb-1 flex-shrink-0">
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${GREEN}, #34D399)` }}
          />
        </div>
        <div className="flex justify-between mt-0.5">
          <span className="text-blue-500 text-[9px] font-bold">₹0</span>
          <span className="text-blue-500 text-[9px] font-bold">Target ₹{TARGET_PORTFOLIO.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Mole grid */}
      <div className="flex-1 flex items-center justify-center px-4 py-2">
        <div className="grid grid-cols-3 gap-3 w-full" style={{ maxWidth: 340 }}>
          {holes.map((mole, idx) => (
            <div
              key={idx}
              className="relative flex items-center justify-center"
              style={{ aspectRatio: '1' }}
            >
              {/* Hole */}
              <div
                className="w-full h-full rounded-full flex items-center justify-center cursor-pointer btn-press relative overflow-hidden"
                style={{
                  background: 'radial-gradient(circle at 40% 35%, #2a1408, #0d0502)',
                  border: '3px solid #5D3A1A',
                  boxShadow: 'inset 0 4px 14px rgba(0,0,0,0.9), 0 2px 10px rgba(0,0,0,0.6)',
                }}
                onClick={() => handleWhack(idx)}
              >
                {/* Mole */}
                {mole && (
                  <div
                    key={mole.id}
                    className={mole.whacked ? 'mole-whack' : mole.hiding ? 'mole-hide' : 'mole-up'}
                    style={{
                      position: 'absolute',
                      inset: '5px',
                      borderRadius: '50%',
                      background: `radial-gradient(circle at 38% 32%, ${MOLE_DEFS[mole.type].color}dd, ${MOLE_DEFS[mole.type].color})`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 0 18px ${MOLE_DEFS[mole.type].color}80`,
                      gap: 1,
                    }}
                  >
                    <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{MOLE_DEFS[mole.type].emoji}</span>
                    <span style={{ fontSize: '8px', fontWeight: 800, color: 'white', lineHeight: 1.1, textAlign: 'center', padding: '0 3px' }}>
                      {MOLE_DEFS[mole.type].label}
                    </span>
                    <span style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
                      {MOLE_DEFS[mole.type].value > 0
                        ? `+₹${MOLE_DEFS[mole.type].value}`
                        : `-₹${Math.abs(MOLE_DEFS[mole.type].value)}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Popup score */}
              {popups
                .filter(p => p.holeIdx === idx)
                .map(popup => (
                  <div
                    key={popup.id}
                    className="popup-float absolute inset-0 flex items-center justify-center z-20"
                  >
                    <span
                      className="font-extrabold text-sm"
                      style={{ color: popup.color, textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}
                    >
                      {popup.text}
                    </span>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend strip */}
      <div className="px-4 pb-4 flex-shrink-0">
        <div
          className="rounded-xl px-3 py-2.5"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="grid grid-cols-3 gap-x-2 gap-y-1.5">
            {(Object.entries(MOLE_DEFS) as [MoleType, (typeof MOLE_DEFS)[MoleType]][]).map(([type, def]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div
                  className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                  style={{ background: def.color }}
                />
                <div className="min-w-0">
                  <p className="text-white text-[9px] font-semibold truncate leading-tight">{def.label}</p>
                  <p
                    className="text-[9px] font-bold leading-tight"
                    style={{ color: def.bad ? '#FCA5A5' : '#86EFAC' }}
                  >
                    {def.value > 0 ? `+₹${def.value}` : `-₹${Math.abs(def.value)}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
