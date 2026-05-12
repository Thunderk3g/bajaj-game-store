import React, { useEffect, useRef, useState } from 'react';
import { GameResult, MoleType } from '../types';
import {
  GAME_SECS,
  GREEN,
  GRID_SIZE,
  MIN_MOLE_VISIBLE_MS,
  MIN_SPAWN_MS,
  MOLE_DEFS,
  MOLE_VISIBLE_MS,
  RAMP_INTERVAL_SECS,
  SPAWN_INTERVAL_MS,
  TARGET_PORTFOLIO,
} from '../constants';
import HowToPlayPopup from './HowToPlayPopup';

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
    musicGain.gain.value = 0.12;
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
  gain.gain.setValueAtTime(0.7, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
  beat++;

  if (beat % 4 === 0) {
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bass.connect(bassGain);
    bassGain.connect(musicGain!);
    bass.type = 'sine';
    bass.frequency.value = freq / 2;
    bassGain.gain.setValueAtTime(0.5, ctx.currentTime);
    bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    bass.start();
    bass.stop(ctx.currentTime + 0.35);
  }

  musicTimer = setTimeout(beatTick, 270);
}

function startMusic() {
  if (musicTimer) return;
  getCtx();
  beat = 0;
  beatTick();
}

function stopMusic() {
  if (musicTimer) {
    clearTimeout(musicTimer);
    musicTimer = null;
  }
}

function setAudioMuted(muted: boolean) {
  const ctx = getCtx();
  if (masterGain) masterGain.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.05);
}

function playSFX(type: 'good' | 'bullrun' | 'bad' | 'gameover' | 'btn') {
  const ctx = getCtx();
  if (!masterGain) return;
  const t = ctx.currentTime;

  const noteAt = (freq: number, delay: number, dur: number, waveType: OscillatorType, vol: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(masterGain!);
    osc.type = waveType;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, t + delay);
    gain.gain.setValueAtTime(vol, t + delay + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, t + delay + dur);
    osc.start(t + delay);
    osc.stop(t + delay + dur);
  };

  if (type === 'good') noteAt(1047, 0, 0.14, 'sine', 0.35);
  if (type === 'bullrun') {
    noteAt(659, 0, 0.14, 'sine', 0.4);
    noteAt(784, 0.12, 0.14, 'sine', 0.4);
    noteAt(1047, 0.24, 0.18, 'sine', 0.45);
  }
  if (type === 'bad') noteAt(90, 0, 0.25, 'sawtooth', 0.3);
  if (type === 'gameover') [523.25, 440, 349.23, 261.63].forEach((f, i) => noteAt(f, i * 0.22, 0.28, 'sine', 0.3));
  if (type === 'btn') noteAt(880, 0, 0.07, 'sine', 0.18);
}

function pickMoleType(): MoleType {
  const total = Object.values(MOLE_DEFS).reduce((sum, def) => sum + def.weight, 0);
  let rand = Math.random() * total;
  for (const [type, def] of Object.entries(MOLE_DEFS) as [MoleType, (typeof MOLE_DEFS)[MoleType]][]) {
    rand -= def.weight;
    if (rand <= 0) return type;
  }
  return 'investment';
}

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

interface Props {
  onGameEnd: (result: GameResult) => void;
}

const GameScreen: React.FC<Props> = ({ onGameEnd }) => {
  const [holes, setHoles] = useState<(MoleState | null)[]>(Array(GRID_SIZE).fill(null));
  const [portfolio, setPortfolio] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECS);
  const [muted, setMuted] = useState(false);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [shake, setShake] = useState(false);
  const [started, setStarted] = useState(false);
  const [gains, setGains] = useState(0);
  const [losses, setLosses] = useState(0);

  const holesRef = useRef<(MoleState | null)[]>(Array(GRID_SIZE).fill(null));
  const portfolioRef = useRef(0);
  const timeLeftRef = useRef(GAME_SECS);
  const activeRef = useRef(false);
  const nextIdRef = useRef(0);
  const popupIdRef = useRef(0);
  const statsRef = useRef({ molesSeen: 0, molesWhacked: 0, goodWhacks: 0, badWhacks: 0, gains: 0, losses: 0 });

  useEffect(() => {
    if (!started) return;

    startMusic();
    activeRef.current = true;

    function getDiff() {
      const elapsed = GAME_SECS - timeLeftRef.current;
      const ramps = Math.min(3, Math.floor(elapsed / RAMP_INTERVAL_SECS));
      return {
        spawnMs: Math.max(MIN_SPAWN_MS, SPAWN_INTERVAL_MS - ramps * 160),
        visibleMs: Math.max(MIN_MOLE_VISIBLE_MS, MOLE_VISIBLE_MS - ramps * 200),
      };
    }

    function spawnMole() {
      if (!activeRef.current) return;
      const empty = holesRef.current.map((m, i) => (m === null ? i : -1)).filter(i => i >= 0);
      if (empty.length === 0) return;

      const holeIdx = empty[Math.floor(Math.random() * empty.length)];
      const type = pickMoleType();
      const id = nextIdRef.current++;
      const { visibleMs } = getDiff();
      const mole: MoleState = { id, type, whacked: false, hiding: false };

      const next = [...holesRef.current];
      next[holeIdx] = mole;
      holesRef.current = next;
      setHoles(next);
      statsRef.current.molesSeen++;

      setTimeout(() => {
        if (!activeRef.current) return;
        const cur = holesRef.current[holeIdx];
        if (!cur || cur.id !== id || cur.whacked) return;
        const hiding = [...holesRef.current];
        hiding[holeIdx] = { ...cur, hiding: true };
        holesRef.current = hiding;
        setHoles(hiding);

        setTimeout(() => {
          if (!activeRef.current) return;
          const current = holesRef.current[holeIdx];
          if (!current || current.id !== id) return;
          const cleared = [...holesRef.current];
          cleared[holeIdx] = null;
          holesRef.current = cleared;
          setHoles(cleared);
        }, 240);
      }, visibleMs);
    }

    let spawnTimer: ReturnType<typeof setTimeout>;
    function scheduleSpawn() {
      if (!activeRef.current) return;
      spawnMole();
      spawnTimer = setTimeout(scheduleSpawn, getDiff().spawnMs);
    }

    spawnTimer = setTimeout(scheduleSpawn, 400);

    const timer = setInterval(() => {
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        clearInterval(timer);
        clearTimeout(spawnTimer);
        activeRef.current = false;
        stopMusic();
        playSFX('gameover');
        const { molesSeen, molesWhacked, goodWhacks, badWhacks, gains, losses } = statsRef.current;
        onGameEnd({
          portfolio: portfolioRef.current,
          molesSeen,
          molesWhacked,
          goodWhacks,
          badWhacks,
          gains,
          losses,
          timeSeconds: GAME_SECS,
          rawScore: Math.round((portfolioRef.current / TARGET_PORTFOLIO) * 100),
        });
      }
    }, 1000);

    return () => {
      activeRef.current = false;
      clearInterval(timer);
      clearTimeout(spawnTimer);
      stopMusic();
    };
  }, [started, onGameEnd]);

  function handleWhack(holeIdx: number) {
    if (!started || !activeRef.current) return;
    const mole = holesRef.current[holeIdx];
    if (!mole || mole.whacked || mole.hiding) return;

    const def = MOLE_DEFS[mole.type];
    const delta = def.value;

    const next = [...holesRef.current];
    next[holeIdx] = { ...mole, whacked: true };
    holesRef.current = next;
    setHoles(next);

    portfolioRef.current += delta;
    setPortfolio(portfolioRef.current);

    statsRef.current.molesWhacked++;
    if (def.bad) {
      statsRef.current.badWhacks++;
      statsRef.current.losses += Math.abs(delta);
      setLosses(statsRef.current.losses);
      setShake(true);
      setTimeout(() => setShake(false), 360);
    } else {
      statsRef.current.goodWhacks++;
      statsRef.current.gains += delta;
      setGains(statsRef.current.gains);
    }

    if (mole.type === 'bullrun') playSFX('bullrun');
    else if (def.bad) playSFX('bad');
    else playSFX('good');

    const popupId = popupIdRef.current++;
    const text = delta > 0 ? `+${delta.toLocaleString('en-IN')}` : `-${Math.abs(delta).toLocaleString('en-IN')}`;
    setPopups(prev => [...prev, { id: popupId, holeIdx, text, color: def.bad ? '#FCA5A5' : '#86EFAC' }]);
    setTimeout(() => setPopups(prev => prev.filter(p => p.id !== popupId)), 800);

    setTimeout(() => {
      if (!activeRef.current) return;
      const cur = holesRef.current[holeIdx];
      if (!cur || cur.id !== mole.id) return;
      const cleared = [...holesRef.current];
      cleared[holeIdx] = null;
      holesRef.current = cleared;
      setHoles(cleared);
    }, 290);
  }

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

  return (
    <div
      className="relative flex h-full min-h-0 flex-col"
      style={{ background: 'linear-gradient(170deg, #001230 0%, #002060 55%, #001a30 100%)' }}
    >
      <div
        className="flex flex-shrink-0 items-center justify-between px-[4vw] pb-[1vh]"
        style={{ paddingTop: 'max(2vh, calc(env(safe-area-inset-top) + 0.5rem))' }}
      >
        <button
          onClick={handleMuteToggle}
          className="btn-press flex h-[2.7rem] min-w-[4.1rem] flex-shrink-0 items-center justify-center rounded-full px-[0.6rem] text-[0.72rem] font-extrabold uppercase text-white"
          style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
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

      <div className="flex flex-1 items-center justify-center px-[4vw] py-[1vh]">
        <div className="grid w-full max-w-[21rem] grid-cols-3 gap-[0.75rem]">
          {holes.map((mole, idx) => (
            <div key={idx} className="relative flex aspect-square items-center justify-center">
              <button
                type="button"
                className="btn-press relative flex h-full w-full cursor-pointer items-center justify-center overflow-hidden rounded-full"
                style={{
                  background: 'radial-gradient(circle at 40% 35%, #2a1408, #0d0502)',
                  border: '0.18rem solid #5D3A1A',
                  boxShadow: 'inset 0 0.3rem 0.9rem rgba(0,0,0,0.9), 0 0.15rem 0.65rem rgba(0,0,0,0.6)',
                }}
                onClick={() => handleWhack(idx)}
                aria-label="Whack hole"
              >
                {mole && (
                  <div
                    key={mole.id}
                    className={mole.whacked ? 'mole-whack' : mole.hiding ? 'mole-hide' : 'mole-up'}
                    style={{
                      position: 'absolute',
                      inset: '0.35rem',
                      borderRadius: '50%',
                      background: `radial-gradient(circle at 38% 32%, ${MOLE_DEFS[mole.type].color}dd, ${MOLE_DEFS[mole.type].color})`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 0 1rem ${MOLE_DEFS[mole.type].color}80`,
                    }}
                  >
                    <img
                      src={MOLE_DEFS[mole.type].icon}
                      alt={MOLE_DEFS[mole.type].label}
                      style={{ width: '70%', height: '70%', objectFit: 'contain' }}
                    />
                    <span className="text-[0.48rem] font-bold text-white/85">
                      {MOLE_DEFS[mole.type].value > 0 ? `+${MOLE_DEFS[mole.type].value}` : `-${Math.abs(MOLE_DEFS[mole.type].value)}`}
                    </span>
                  </div>
                )}
              </button>

              {popups
                .filter(p => p.holeIdx === idx)
                .map(popup => (
                  <div key={popup.id} className="popup-float absolute inset-0 z-20 flex items-center justify-center">
                    <span className="text-[0.88rem] font-extrabold" style={{ color: popup.color, textShadow: '0 0.1rem 0.4rem rgba(0,0,0,0.9)' }}>
                      {popup.text}
                    </span>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-[4vw] mb-[0.5vh] flex-shrink-0">
        <div className={`mb-[0.3rem] text-center ${shake ? 'shake' : ''}`}>
          <span className="text-[clamp(1rem,4.6vw,1.25rem)] font-extrabold" style={{ color: GREEN }}>
            {displayPortfolio.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="h-[0.65rem] overflow-hidden rounded-full bg-white/10 flex">
          <div className="h-full transition-all duration-300" style={{ width: `${gainPct}%`, background: `linear-gradient(90deg, ${GREEN}, #34D399)`, borderRadius: gainPct > 0 ? '9999px 0 0 9999px' : undefined }} />
          <div className="h-full transition-all duration-300" style={{ width: `${lossPct}%`, background: 'linear-gradient(90deg, #F87171, #EF4444)', borderRadius: lossPct > 0 && gainPct === 0 ? '9999px 0 0 9999px' : undefined }} />
        </div>
        <div className="mt-[0.3rem] flex justify-between">
          <span className="text-[0.58rem] font-bold" style={{ color: GREEN }}>
            {gains > 0 ? `${Math.round(gainPct)}%` : '0%'} gained
          </span>
          <span className="text-[0.58rem] font-bold text-red-400">
            {losses > 0 ? `${Math.round(lossPct)}%` : '0%'} drained
          </span>
        </div>
      </div>

      <div
        className="flex-shrink-0 px-[4vw]"
        style={{ paddingBottom: 'max(2vh, calc(env(safe-area-inset-bottom) + 0.5rem))' }}
      >
        <div className="rounded-[0.9rem] border border-white/10 bg-white/8 px-[0.7rem] py-[0.55rem]">
          <p className="mb-[0.4rem] text-[0.56rem] font-extrabold uppercase tracking-[0.08em] text-red-300">Wealth Drainers</p>
          <div className="grid grid-cols-3 gap-x-[0.5rem] gap-y-[0.4rem]">
            {(Object.entries(MOLE_DEFS) as [MoleType, (typeof MOLE_DEFS)[MoleType]][])
              .filter(([, d]) => d.bad)
              .map(([type, def]) => (
                <div key={type} className="flex min-w-0 items-center gap-[0.4rem]">
                  <img src={def.icon} alt={def.label} className="h-[2.8rem] w-[2.8rem] flex-shrink-0 rounded-full object-cover" style={{ background: def.color }} />
                  <div className="min-w-0">
                    <p className="truncate text-[0.56rem] font-semibold leading-tight text-white">{def.label}</p>
                    <p className="text-[0.56rem] font-bold leading-tight text-red-300">
                      {`-${Math.abs(def.value)}`}
                    </p>
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
