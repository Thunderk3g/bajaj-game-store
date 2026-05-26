import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameResult } from '../types';
import { GAME_SECS, GREEN } from '../constants';
import HowToPlayPopup from './HowToPlayPopup';

import puzzle1 from '../src/assets/puzzle-1.png';
import puzzle2 from '../src/assets/puzzle-2.png';
import puzzle3 from '../src/assets/puzzle-3.png';
import puzzle4 from '../src/assets/puzzle-4.png';
import bgmSrc from '../src/assets/bgm.ogg';

const PUZZLE_IMAGES = [puzzle1, puzzle2, puzzle3, puzzle4];
const GRID = 3;
const TOTAL_TILES = GRID * GRID;

// ---------------------------------------------------------------------------
// Audio — BGM via HTMLAudioElement, SFX via WebAudio
// ---------------------------------------------------------------------------
let bgmEl: HTMLAudioElement | null = null;
let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

function getSfxCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(audioCtx.destination);
  }
  return audioCtx;
}

function startMusic() {
  if (!bgmEl) {
    bgmEl = new Audio(bgmSrc);
    bgmEl.loop = true;
    bgmEl.volume = 0.55;
  }
  bgmEl.currentTime = 0;
  bgmEl.play().catch(() => {});
}

function stopMusic() {
  if (bgmEl) {
    bgmEl.pause();
    bgmEl.currentTime = 0;
  }
}

function setAudioMuted(muted: boolean) {
  if (bgmEl) bgmEl.volume = muted ? 0 : 0.55;
  const ctx = getSfxCtx();
  if (masterGain) masterGain.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.05);
}

function playSFX(type: 'swap' | 'solve' | 'gameover' | 'btn') {
  const ctx = getSfxCtx();
  if (!masterGain) return;
  const t = ctx.currentTime;
  const note = (freq: number, delay: number, dur: number, wave: OscillatorType, vol: number) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g);
    g.connect(masterGain!);
    osc.type = wave;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, t + delay);
    g.gain.setValueAtTime(vol, t + delay + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, t + delay + dur);
    osc.start(t + delay);
    osc.stop(t + delay + dur);
  };
  if (type === 'swap') note(660, 0, 0.08, 'sine', 0.25);
  if (type === 'solve') {
    note(523, 0, 0.12, 'sine', 0.35);
    note(659, 0.1, 0.12, 'sine', 0.35);
    note(784, 0.2, 0.12, 'sine', 0.35);
    note(1047, 0.32, 0.22, 'sine', 0.4);
  }
  if (type === 'gameover') [523.25, 440, 349.23, 261.63].forEach((f, i) => note(f, i * 0.22, 0.28, 'sine', 0.3));
  if (type === 'btn') note(880, 0, 0.07, 'sine', 0.18);
}

// ---------------------------------------------------------------------------
// Puzzle helpers
// ---------------------------------------------------------------------------
function shuffleTiles(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Ensure it is not already in solved order
  if (arr.every((v, i) => v === i)) {
    [arr[0], arr[1]] = [arr[1], arr[0]];
  }
  return arr;
}

function pickRandomPuzzle(exclude?: string): string {
  const available = exclude ? PUZZLE_IMAGES.filter(p => p !== exclude) : PUZZLE_IMAGES;
  return available[Math.floor(Math.random() * available.length)];
}

// ---------------------------------------------------------------------------
// Tile component — renders a cropped slice of the image via background-position
// ---------------------------------------------------------------------------
interface TileProps {
  pieceId: number;    // which image slice this tile shows (0-8)
  size: number;
  image: string;
  selected: boolean;
  correct: boolean;
  onClick: () => void;
}

const Tile: React.FC<TileProps> = ({ pieceId, size, image, selected, correct, onClick }) => {
  const col = pieceId % GRID;
  const row = Math.floor(pieceId / GRID);
  // For a 3×3 grid: col/row 0→0%, 1→50%, 2→100%
  const bgX = col * (100 / (GRID - 1));
  const bgY = row * (100 / (GRID - 1));

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Tile ${pieceId}`}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${image})`,
        backgroundSize: `${GRID * 100}% ${GRID * 100}%`,
        backgroundPosition: `${bgX}% ${bgY}%`,
        backgroundRepeat: 'no-repeat',
        border: selected
          ? '3px solid #FBBF24'
          : correct
          ? '2px solid #4ADE80'
          : '2px solid rgba(255,255,255,0.18)',
        borderRadius: '0.25rem',
        cursor: 'pointer',
        outline: 'none',
        transition: 'border-color 0.15s, transform 0.1s, box-shadow 0.15s',
        transform: selected ? 'scale(0.93)' : 'scale(1)',
        boxShadow: selected
          ? '0 0 0 3px rgba(251,191,36,0.45)'
          : correct
          ? '0 0 8px rgba(74,222,128,0.5)'
          : '0 1px 4px rgba(0,0,0,0.5)',
        padding: 0,
      }}
    />
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
interface Props {
  onGameEnd: (result: GameResult) => void;
}

const GameScreen: React.FC<Props> = ({ onGameEnd }) => {
  const [currentImage, setCurrentImage] = useState<string>(() => pickRandomPuzzle());
  // tiles[gridPosition] = pieceId (which image slice goes here)
  const [tiles, setTiles] = useState<number[]>(() => shuffleTiles(TOTAL_TILES));
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(GAME_SECS);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [score, setScore] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const [solved, setSolved] = useState(false);
  const [solveFlash, setSolveFlash] = useState(false);
  const [puzzlesSolved, setPuzzlesSolved] = useState(0);

  const scoreRef = useRef(0);
  const swapsRef = useRef(0);
  const puzzlesSolvedRef = useRef(0);
  const timeLeftRef = useRef(GAME_SECS);
  const activeRef = useRef(false);
  const currentImageRef = useRef(currentImage);

  const isSolved = useCallback((t: number[]) => t.every((v, i) => v === i), []);

  const loadNewPuzzle = useCallback(() => {
    const next = pickRandomPuzzle(currentImageRef.current);
    currentImageRef.current = next;
    setCurrentImage(next);
    setTiles(shuffleTiles(TOTAL_TILES));
    setSelected(null);
    setSolved(false);
  }, []);

  useEffect(() => {
    if (!started) return;
    startMusic();
    activeRef.current = true;

    const timer = setInterval(() => {
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        clearInterval(timer);
        activeRef.current = false;
        stopMusic();
        playSFX('gameover');
        const rawScore = Math.min(100, Math.max(0, Math.round((scoreRef.current / (5 * 500)) * 100)));
        onGameEnd({
          portfolio: scoreRef.current,
          molesSeen: swapsRef.current,
          molesWhacked: swapsRef.current,
          goodWhacks: puzzlesSolvedRef.current,
          badWhacks: 0,
          timeSeconds: GAME_SECS,
          rawScore,
          gains: scoreRef.current,
          losses: 0,
        });
      }
    }, 1000);

    return () => {
      activeRef.current = false;
      clearInterval(timer);
      stopMusic();
    };
  }, [started, onGameEnd]);

  function handleTileClick(gridIdx: number) {
    if (!started || !activeRef.current || solved) return;

    if (selected === null) {
      // Select this tile
      setSelected(gridIdx);
    } else {
      if (selected === gridIdx) {
        // Deselect
        setSelected(null);
        return;
      }
      // Swap the two tiles
      const next = [...tiles];
      [next[selected], next[gridIdx]] = [next[gridIdx], next[selected]];
      setTiles(next);
      setSelected(null);
      swapsRef.current++;
      setSwaps(swapsRef.current);
      playSFX('swap');

      if (isSolved(next)) {
        // Bonus: 500 base minus 10 per swap, minimum 100
        const bonus = Math.max(100, 500 - swapsRef.current * 10);
        scoreRef.current += bonus;
        setScore(scoreRef.current);
        puzzlesSolvedRef.current++;
        setPuzzlesSolved(puzzlesSolvedRef.current);
        setSolved(true);
        setSolveFlash(true);
        playSFX('solve');
        swapsRef.current = 0;
        setSwaps(0);
        setTimeout(() => {
          setSolveFlash(false);
          loadNewPuzzle();
        }, 1800);
      }
    }
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
  const timerCritical = timeLeft <= 10;
  const TILE_SIZE = 90;
  const GAP = 4;

  return (
    <div
      className="relative flex h-full min-h-0 flex-col"
      style={{ background: 'linear-gradient(170deg, #001230 0%, #002060 55%, #001a30 100%)' }}
    >
      {/* Header */}
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

        <div className="flex flex-col items-end gap-[0.1rem]">
          <span className="text-[0.72rem] font-extrabold tabular-nums" style={{ color: GREEN }}>{score} pts</span>
          <span className="text-[0.55rem] font-semibold text-blue-300">{puzzlesSolved} solved</span>
        </div>
      </div>

      {/* Puzzle grid */}
      <div className="flex flex-1 flex-col items-center justify-center px-[4vw] py-[0.5vh]">

        {/* Solve flash */}
        {solveFlash && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none">
            <div
              className="rounded-2xl px-8 py-5 text-center"
              style={{ background: 'rgba(0,0,0,0.78)', border: '2px solid #4ADE80' }}
            >
              <p className="text-2xl font-extrabold" style={{ color: '#4ADE80' }}>Puzzle Solved!</p>
              <p className="text-sm text-white/70 mt-1">Next puzzle loading…</p>
            </div>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID}, ${TILE_SIZE}px)`,
            gridTemplateRows: `repeat(${GRID}, ${TILE_SIZE}px)`,
            gap: GAP,
          }}
        >
          {tiles.map((pieceId, gridIdx) => (
            <Tile
              key={gridIdx}
              pieceId={pieceId}
              size={TILE_SIZE}
              image={currentImage}
              selected={selected === gridIdx}
              correct={pieceId === gridIdx}
              onClick={() => handleTileClick(gridIdx)}
            />
          ))}
        </div>

        <p className="mt-[0.7vh] text-[0.6rem] text-white/45 text-center">
          {selected !== null
            ? '✦ Now tap another tile to swap'
            : 'Tap a tile to select, then tap another to swap'}
        </p>
      </div>

      {/* Swaps bar */}
      <div className="mx-[4vw] mb-[0.4vh] flex-shrink-0 flex justify-between items-center">
        <span className="text-[0.62rem] font-bold text-blue-300 uppercase tracking-wide">Swaps: {swaps}</span>
        <span className="text-[0.58rem] text-white/40">Fewer swaps = more points</span>
      </div>

      {/* Thumbnail + info panel */}
      <div
        className="flex-shrink-0 px-[4vw]"
        style={{ paddingBottom: 'max(2vh, calc(env(safe-area-inset-bottom) + 0.5rem))' }}
      >
        <div
          className="rounded-[0.9rem] border border-white/10 px-[0.7rem] py-[0.5rem] flex items-center gap-[0.75rem]"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          {/* Thumbnail */}
          <div className="flex-shrink-0">
            <p className="mb-[0.3rem] text-[0.52rem] font-extrabold uppercase tracking-[0.08em] text-blue-300">
              Target — tap to enlarge
            </p>
            <button
              onClick={() => setFullscreen(true)}
              className="btn-press relative overflow-hidden rounded-lg border-2 border-white/30 hover:border-white/70 transition-colors"
              style={{ width: 68, height: 68 }}
              title="View full image"
            >
              <img src={currentImage} alt="Target puzzle" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 right-0 bg-black/60 text-[0.52rem] text-white px-[3px] py-[1px] rounded-tl-sm">
                🔍
              </div>
            </button>
          </div>

          {/* Instructions */}
          <div className="flex-1 min-w-0">
            <p className="text-[0.56rem] text-white/60 leading-snug">
              Rearrange the 9 tiles to recreate this picture. Select a tile, then select another to swap them.
            </p>
            <p className="mt-[0.4rem] text-[0.58rem] font-bold" style={{ color: GREEN }}>
              Score: {score} pts &nbsp;·&nbsp; {puzzlesSolved} solved
            </p>
          </div>
        </div>
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={() => setFullscreen(false)}
        >
          <div className="relative">
            <p className="text-center text-[0.65rem] text-white/65 mb-2">
              Recreate this picture by swapping tiles — tap anywhere to close
            </p>
            <img
              src={currentImage}
              alt="Full puzzle view"
              className="rounded-xl object-contain"
              style={{ maxHeight: '74vh', maxWidth: '85vw' }}
            />
          </div>
        </div>
      )}

      {!started && <HowToPlayPopup onStart={handleStart} />}
    </div>
  );
};

export default GameScreen;
