import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BenefitType, GameResult } from '../types';
import {
  BENEFIT_DEFS, GRID_COLS, GRID_ROWS, GREEN, MINE_COUNT,
  MINE_DEF, MINE_PENALTY, ORANGE, POINTS_PER_CELL, WIN_BONUS,
} from '../constants';
import HowToPlayPopup from './HowToPlayPopup';

// ── Audio ────────────────────────────────────────────────────────────────────
let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(audioCtx.destination);
  }
  return audioCtx;
}

function playSFX(type: 'reveal' | 'flag' | 'mine' | 'win' | 'btn'): void {
  try {
    const ctx = getCtx();
    if (!masterGain) return;
    const t = ctx.currentTime;
    const note = (freq: number, delay: number, dur: number, wave: OscillatorType, vol: number) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g); g.connect(masterGain!);
      osc.type = wave; osc.frequency.value = freq;
      g.gain.setValueAtTime(0, t + delay);
      g.gain.setValueAtTime(vol, t + delay + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + dur);
      osc.start(t + delay); osc.stop(t + delay + dur);
    };
    if (type === 'reveal') note(880, 0, 0.1, 'sine', 0.25);
    if (type === 'flag')   { note(660, 0, 0.07, 'sine', 0.2); note(440, 0.08, 0.07, 'sine', 0.15); }
    if (type === 'mine')   [200, 150, 100].forEach((f, i) => note(f, i * 0.12, 0.3, 'sawtooth', 0.35));
    if (type === 'win')    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => note(f, i * 0.15, 0.25, 'sine', 0.35));
    if (type === 'btn')    note(880, 0, 0.07, 'sine', 0.18);
  } catch (_) { /* ignore */ }
}

// ── Grid types ───────────────────────────────────────────────────────────────
type CellState = 'hidden' | 'revealed' | 'flagged' | 'exploded';

interface Cell {
  row: number;
  col: number;
  isMine: boolean;
  adjacentMines: number;
  state: CellState;
  benefitType: BenefitType;
}

const BENEFIT_KEYS = Object.keys(BENEFIT_DEFS) as BenefitType[];
const ADJ_COLORS = ['', '#60A5FA', '#4ADE80', '#FCD34D', '#F87171', '#C084FC', '#22D3EE', '#FB923C', '#F472B6'];

function makeEmptyGrid(): Cell[][] {
  return Array.from({ length: GRID_ROWS }, (_, r) =>
    Array.from({ length: GRID_COLS }, (_, c) => ({
      row: r, col: c,
      isMine: false, adjacentMines: 0,
      state: 'hidden' as CellState,
      benefitType: BENEFIT_KEYS[Math.floor(Math.random() * BENEFIT_KEYS.length)],
    }))
  );
}

function buildMines(base: Cell[][], fr: number, fc: number): Cell[][] {
  const grid = base.map(row => row.map(cell => ({ ...cell })));
  const safe = new Set<number>();
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      const r = fr + dr, c = fc + dc;
      if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS) safe.add(r * GRID_COLS + c);
    }
  const pool = Array.from({ length: GRID_ROWS * GRID_COLS }, (_, i) => i).filter(i => !safe.has(i));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const count = Math.min(MINE_COUNT, pool.length);
  for (let i = 0; i < count; i++) {
    const r = Math.floor(pool[i] / GRID_COLS), c = pool[i] % GRID_COLS;
    grid[r][c].isMine = true;
  }
  for (let r = 0; r < GRID_ROWS; r++)
    for (let c = 0; c < GRID_COLS; c++)
      if (!grid[r][c].isMine) {
        let n = 0;
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS && grid[nr][nc].isMine) n++;
          }
        grid[r][c].adjacentMines = n;
      }
  return grid;
}

function floodReveal(base: Cell[][], sr: number, sc: number): Cell[][] {
  const grid = base.map(row => row.map(cell => ({ ...cell })));
  const queue: [number, number][] = [[sr, sc]];
  const seen = new Set<string>();
  while (queue.length) {
    const [r, c] = queue.shift()!;
    const k = `${r},${c}`;
    if (seen.has(k)) continue;
    seen.add(k);
    if (grid[r][c].state !== 'hidden' || grid[r][c].isMine) continue;
    grid[r][c].state = 'revealed';
    if (grid[r][c].adjacentMines === 0)
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS) queue.push([nr, nc]);
        }
  }
  return grid;
}

function allSafeRevealed(grid: Cell[][]): boolean {
  return grid.every(row => row.every(cell => cell.isMine || cell.state === 'revealed'));
}

function countRevealed(grid: Cell[][]): number {
  return grid.flat().filter(c => !c.isMine && c.state === 'revealed').length;
}

function countCorrectFlags(grid: Cell[][]): number {
  return grid.flat().filter(c => c.isMine && c.state === 'flagged').length;
}

function revealAllMines(grid: Cell[][]): Cell[][] {
  return grid.map(row =>
    row.map(cell => cell.isMine && cell.state !== 'flagged' ? { ...cell, state: 'revealed' as CellState } : { ...cell })
  );
}

// ── Component ────────────────────────────────────────────────────────────────
interface Props { onGameEnd: (result: GameResult) => void; }

const GameScreen: React.FC<Props> = ({ onGameEnd }) => {
  const totalSafe = GRID_ROWS * GRID_COLS - MINE_COUNT;

  const [grid, setGrid]             = useState<Cell[][]>(() => makeEmptyGrid());
  const [phase, setPhase]           = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [flagMode, setFlagMode]     = useState(false);
  const [seconds, setSeconds]       = useState(0);
  const [minesLeft, setMinesLeft]   = useState(MINE_COUNT);
  const [showHowTo, setShowHowTo]   = useState(true);
  const [winOverlay, setWinOverlay] = useState(false);
  const [shakeCellKey, setShake]    = useState('');
  const [revealed, setRevealed]     = useState(0);

  const gridRef      = useRef<Cell[][]>(grid);
  const phaseRef     = useRef<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const secsRef      = useRef(0);
  const minesLeftRef = useRef(MINE_COUNT);
  const longRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flagRef      = useRef(false);

  // keep flagRef in sync with state (avoid stale closure in handlers)
  useEffect(() => { flagRef.current = flagMode; }, [flagMode]);

  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => { secsRef.current += 1; setSeconds(secsRef.current); }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const endGame = useCallback((won: boolean, finalGrid: Cell[][]) => {
    phaseRef.current = won ? 'won' : 'lost';
    setPhase(won ? 'won' : 'lost');
    if (timerRef.current) clearInterval(timerRef.current);
    const rev  = countRevealed(finalGrid);
    const corr = countCorrectFlags(finalGrid);
    if (won) {
      playSFX('win');
      setWinOverlay(true);
      setTimeout(() => {
        setWinOverlay(false);
        onGameEnd({ score: 100, cellsRevealed: rev, totalSafe, minesFound: corr, totalMines: MINE_COUNT, timeSeconds: secsRef.current, won: true, gains: rev * POINTS_PER_CELL + WIN_BONUS, losses: 0 });
      }, 1600);
    } else {
      playSFX('mine');
      const score = Math.round((rev / totalSafe) * 100);
      setTimeout(() => {
        onGameEnd({ score, cellsRevealed: rev, totalSafe, minesFound: corr, totalMines: MINE_COUNT, timeSeconds: secsRef.current, won: false, gains: rev * POINTS_PER_CELL, losses: MINE_PENALTY });
      }, 1800);
    }
  }, [onGameEnd, totalSafe]);

  const handleTap = useCallback((r: number, c: number) => {
    if (phaseRef.current === 'won' || phaseRef.current === 'lost') return;
    const cell = gridRef.current[r][c];
    if (flagRef.current) {
      if (cell.state === 'revealed') return;
      const ng = gridRef.current.map(row => row.map(cl => ({ ...cl })));
      if (cell.state === 'hidden')  { ng[r][c].state = 'flagged'; minesLeftRef.current = Math.max(0, minesLeftRef.current - 1); }
      else if (cell.state === 'flagged') { ng[r][c].state = 'hidden'; minesLeftRef.current++; }
      setMinesLeft(minesLeftRef.current);
      gridRef.current = ng; setGrid(ng);
      playSFX('flag');
      // Win if all mines are now correctly flagged
      if (phaseRef.current === 'playing' && countCorrectFlags(ng) === MINE_COUNT) {
        const completed = ng.map(row => row.map(cl =>
          (!cl.isMine && cl.state !== 'revealed') ? { ...cl, state: 'revealed' as CellState } : { ...cl }
        ));
        gridRef.current = completed; setGrid(completed);
        setRevealed(countRevealed(completed));
        endGame(true, completed);
      }
      return;
    }
    if (cell.state !== 'hidden') return;
    let cur = gridRef.current;
    if (phaseRef.current === 'idle') {
      cur = buildMines(cur, r, c);
      phaseRef.current = 'playing'; setPhase('playing');
    }
    if (cur[r][c].isMine) {
      const eg = cur.map(row => row.map(cl => ({ ...cl })));
      eg[r][c].state = 'exploded';
      const mg = revealAllMines(eg);
      gridRef.current = mg; setGrid(mg);
      setShake(`${r},${c}`); setTimeout(() => setShake(''), 600);
      endGame(false, mg); return;
    }
    playSFX('reveal');
    const ng = floodReveal(cur, r, c);
    gridRef.current = ng; setGrid(ng);
    const rev = countRevealed(ng); setRevealed(rev);
    if (allSafeRevealed(ng)) endGame(true, ng);
  }, [endGame]);

  const handleLongPress = useCallback((r: number, c: number) => {
    if (phaseRef.current === 'won' || phaseRef.current === 'lost') return;
    const cell = gridRef.current[r][c];
    if (cell.state === 'revealed') return;
    const ng = gridRef.current.map(row => row.map(cl => ({ ...cl })));
    if (cell.state === 'hidden')   { ng[r][c].state = 'flagged'; minesLeftRef.current = Math.max(0, minesLeftRef.current - 1); }
    else if (cell.state === 'flagged') { ng[r][c].state = 'hidden'; minesLeftRef.current++; }
    setMinesLeft(minesLeftRef.current);
    gridRef.current = ng; setGrid(ng); playSFX('flag');
    // Win if all mines are now correctly flagged
    if (phaseRef.current === 'playing' && countCorrectFlags(ng) === MINE_COUNT) {
      const completed = ng.map(row => row.map(cl =>
        (!cl.isMine && cl.state !== 'revealed') ? { ...cl, state: 'revealed' as CellState } : { ...cl }
      ));
      gridRef.current = completed; setGrid(completed);
      setRevealed(countRevealed(completed));
      endGame(true, completed);
    }
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const progress = totalSafe > 0 ? (revealed / totalSafe) * 100 : 0;

  // compute dynamic cell size
  const cellSize = Math.max(40, Math.floor((Math.min(480, typeof window !== 'undefined' ? window.innerWidth : 480) - 40) / GRID_COLS));

  function renderCell(cell: Cell) {
    const key = `${cell.row},${cell.col}`;
    let bg = 'rgba(30,58,95,0.9)';
    let border = '1px solid rgba(255,255,255,0.08)';
    let content: React.ReactNode = null;

    if (cell.state === 'flagged') {
      content = <span style={{ fontSize: cellSize * 0.42 }}>🚩</span>;
    } else if (cell.state === 'exploded') {
      bg = '#7f1d1d'; border = '2px solid #EF4444';
      content = <img src={MINE_DEF.icon} alt="risk" style={{ width: cellSize * 0.62, height: cellSize * 0.62, objectFit: 'contain' }} />;
    } else if (cell.state === 'revealed') {
      if (cell.isMine) {
        bg = 'rgba(127,29,29,0.6)'; border = '1px solid #EF444450';
        content = <img src={MINE_DEF.icon} alt="risk" style={{ width: cellSize * 0.62, height: cellSize * 0.62, objectFit: 'contain' }} />;
      } else if (cell.adjacentMines > 0) {
        bg = 'rgba(255,255,255,0.05)'; border = '1px solid rgba(255,255,255,0.06)';
        content = <span style={{ fontSize: cellSize * 0.46, fontWeight: 900, color: ADJ_COLORS[cell.adjacentMines] || '#fff', textShadow: `0 0 6px ${ADJ_COLORS[cell.adjacentMines]}80` }}>{cell.adjacentMines}</span>;
      } else {
        const def = BENEFIT_DEFS[cell.benefitType];
        bg = `${def.color}18`; border = `1px solid ${def.color}35`;
        content = <img src={def.icon} alt={def.label} style={{ width: cellSize * 0.65, height: cellSize * 0.65, objectFit: 'contain' }} />;
      }
    }

    return (
      <div
        key={key}
        onPointerDown={e => {
          e.preventDefault();
          longRef.current = setTimeout(() => { longRef.current = null; handleLongPress(cell.row, cell.col); }, 450);
        }}
        onPointerUp={e => {
          e.preventDefault();
          if (longRef.current !== null) { clearTimeout(longRef.current); longRef.current = null; handleTap(cell.row, cell.col); }
        }}
        onPointerCancel={() => { if (longRef.current !== null) { clearTimeout(longRef.current); longRef.current = null; } }}
        style={{
          width: cellSize, height: cellSize,
          background: bg, border, borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0, userSelect: 'none',
          animation: shakeCellKey === key ? 'shake 0.35s ease-in-out' : undefined,
          transition: 'background 0.12s',
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col" style={{ background: 'linear-gradient(170deg,#0f1f3d 0%,#1a2f5a 55%,#0a1828 100%)' }}>
      {showHowTo && <HowToPlayPopup onStart={() => { playSFX('btn'); setShowHowTo(false); }} />}

      {/* Win overlay */}
      {winOverlay && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/65">
          <div className="text-center pop">
            <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🏆</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: ORANGE }}>FULLY COVERED!</div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.25rem' }}>All benefits unlocked!</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between px-[4vw] pb-[1vh]" style={{ paddingTop: 'max(2vh, calc(env(safe-area-inset-top) + 0.5rem))' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#93C5FD' }}>Risks Left</span>
          <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#F87171' }}>💣 {minesLeft}</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#93C5FD' }}>Time</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{mm}:{ss}</div>
        </div>
        <button
          onClick={() => { playSFX('btn'); setFlagMode(f => !f); }}
          className="btn-press"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 10, padding: '0.3rem 0.7rem', fontSize: '0.72rem', fontWeight: 800, background: flagMode ? ORANGE : 'rgba(255,255,255,0.12)', border: `1px solid ${flagMode ? ORANGE : 'rgba(255,255,255,0.2)'}`, color: flagMode ? '#000' : '#fff', cursor: 'pointer' }}
        >
          <span>🚩</span>
          <span>{flagMode ? 'FLAG ON' : 'Flag'}</span>
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ margin: '0 1rem 0.4rem', height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.1)', flexShrink: 0, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 4, width: `${progress}%`, background: 'linear-gradient(90deg,#22C55E,#86EFAC)', transition: 'width 0.3s' }} />
      </div>

      {/* Grid */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 1rem', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_COLS}, ${cellSize}px)`, gap: 3 }}>
          {grid.flatMap(row => row.map(cell => renderCell(cell)))}
        </div>
      </div>

      {/* Status */}
      <div style={{ flexShrink: 0, padding: '0.4rem 1rem', textAlign: 'center', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {phase === 'idle'    && 'Tap any cell to begin your coverage sweep'}
          {phase === 'playing' && `${revealed} / ${totalSafe} benefits uncovered`}
          {phase === 'won'     && '✅ Complete coverage achieved!'}
          {phase === 'lost'    && '⚠️ Uncovered risk hit — coverage ended'}
        </p>
      </div>
    </div>
  );
};

export default GameScreen;
