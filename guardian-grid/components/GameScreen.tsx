import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GameResult } from '../types';
import { BLUE, BOX_SIZE, CELL_SCORE, COMPLETE_BONUS, GAME_SECS, GREEN, GRID_SIZE, LEVELS, MAX_HINTS, ORANGE, TIME_BONUS_PER_SECOND } from '../constants';
import HowToPlayPopup from './HowToPlayPopup';
import { termDuration, lowPremium, familyPayout, pureCover } from '../src/assets';

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let musicTimer: ReturnType<typeof setTimeout> | null = null;
let beat = 0;

const MUSIC_NOTES = [196, 246.94, 293.66, 369.99, 440, 493.88];
const MUSIC_PATTERN = [0, 2, 4, 5, 4, 2, 1, 3, 5, 3, 2, 0];

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

  musicTimer = setTimeout(beatTick, 360);
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

function playSFX(type: 'place' | 'hint' | 'bad' | 'complete' | 'gameover' | 'btn') {
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

  if (type === 'place') noteAt(880, 0, 0.12, 'sine', 0.28);
  if (type === 'hint') noteAt(659, 0, 0.12, 'triangle', 0.24);
  if (type === 'bad') noteAt(90, 0, 0.25, 'sawtooth', 0.3);
  if (type === 'complete') {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => noteAt(f, i * 0.09, 0.18, 'sine', 0.34));
  }
  if (type === 'gameover') [523.25, 440, 349.23, 261.63].forEach((f, i) => noteAt(f, i * 0.22, 0.28, 'sine', 0.3));
  if (type === 'btn') noteAt(880, 0, 0.07, 'sine', 0.18);
}

interface Props {
  onGameEnd: (result: GameResult) => void;
}

type CellValue = number | null;

const SOLUTIONS: number[][][] = [
  [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
    [2, 1, 4, 3],
    [4, 3, 2, 1],
  ],
  [
    [4, 1, 2, 3],
    [2, 3, 4, 1],
    [1, 4, 3, 2],
    [3, 2, 1, 4],
  ],
  [
    [2, 4, 1, 3],
    [1, 3, 2, 4],
    [4, 2, 3, 1],
    [3, 1, 4, 2],
  ],
];

const CLUE_ORDERS = [
  [0, 5, 10, 15, 2, 7, 8, 13],
  [1, 4, 11, 14, 3, 6],
  [0, 6, 9, 15, 12],
];

const SYMBOLS = [
  { value: 1, label: 'Term duration', icon: termDuration, fact: 'Fixed term: protection for chosen years.' },
  { value: 2, label: 'Low premium', icon: lowPremium, fact: 'Low premium can still create high cover.' },
  { value: 3, label: 'Family payout', icon: familyPayout, fact: 'Family receives sum assured if life risk occurs during term.' },
  { value: 4, label: 'Pure cover', icon: pureCover, fact: 'Pure protection: no payout if you outlive the policy term.' },
];

function buildPuzzle(levelIndex: number, clues: number): CellValue[][] {
  const solution = SOLUTIONS[levelIndex % SOLUTIONS.length];
  const allowed = new Set(CLUE_ORDERS[levelIndex % CLUE_ORDERS.length].slice(0, clues));
  return solution.map((row, r) => row.map((value, c) => (allowed.has(r * GRID_SIZE + c) ? value : null)));
}

function flatten(board: CellValue[][]): CellValue[] {
  return board.flat();
}

const GameScreen: React.FC<Props> = ({ onGameEnd }) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const [board, setBoard] = useState<CellValue[][]>(() => buildPuzzle(0, LEVELS[0]?.clues ?? 8));
  const [selected, setSelected] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECS);
  const [muted, setMuted] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [entries, setEntries] = useState(0);
  const [correctEntries, setCorrectEntries] = useState(0);
  const [shake, setShake] = useState(false);
  const [started, setStarted] = useState(false);
  const [feedback, setFeedback] = useState('Fill each row, column, and shield box once.');

  const boardRef = useRef(board);
  const levelRef = useRef(0);
  const scoreRef = useRef(0);
  const timeLeftRef = useRef(GAME_SECS);
  const activeRef = useRef(false);
  const statsRef = useRef({ mistakes: 0, hintsUsed: 0, entries: 0, correctEntries: 0, puzzlesSolved: 0 });

  const solution = SOLUTIONS[levelIndex % SOLUTIONS.length];
  const level = LEVELS[levelIndex] ?? LEVELS[LEVELS.length - 1];
  const givens = useMemo(() => flatten(buildPuzzle(levelIndex, level?.clues ?? 5)).map(value => value !== null), [level?.clues, levelIndex]);
  const selectedValue = board[Math.floor(selected / GRID_SIZE)]?.[selected % GRID_SIZE];

  useEffect(() => {
    if (!started) return;

    startMusic();
    activeRef.current = true;

    const timer = setInterval(() => {
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        clearInterval(timer);
        finishGame(false);
      }
    }, 1000);

    return () => {
      activeRef.current = false;
      clearInterval(timer);
      stopMusic();
    };
  }, [started]);

  function syncBoard(next: CellValue[][]) {
    boardRef.current = next;
    setBoard(next);
  }

  function addScore(delta: number) {
    scoreRef.current = Math.max(0, scoreRef.current + delta);
    setScore(scoreRef.current);
  }

  function finishGame(completed: boolean) {
    if (!activeRef.current) return;
    activeRef.current = false;
    stopMusic();
    playSFX(completed ? 'complete' : 'gameover');

    const stats = statsRef.current;
    const finalScore = scoreRef.current + (completed ? COMPLETE_BONUS : 0) + timeLeftRef.current * TIME_BONUS_PER_SECOND;
    const maxCellScore = LEVELS.reduce((sum, item) => sum + (GRID_SIZE * GRID_SIZE - item.clues) * CELL_SCORE, 0);
    const maxScore = LEVELS.reduce((sum, item) => sum + item.score, 0) + maxCellScore + COMPLETE_BONUS + GAME_SECS * TIME_BONUS_PER_SECOND;
    const accuracy = stats.entries === 0 ? 100 : Math.round((stats.correctEntries / stats.entries) * 100);

    onGameEnd({
      score: finalScore,
      maxScore,
      puzzlesSolved: stats.puzzlesSolved,
      totalPuzzles: LEVELS.length,
      mistakes: stats.mistakes,
      hintsUsed: stats.hintsUsed,
      accuracy,
      timeSeconds: GAME_SECS,
      timeRemaining: timeLeftRef.current,
      levelReached: Math.min(levelRef.current + 1, LEVELS.length),
      rawScore: Math.min(100, Math.max(0, Math.round((finalScore / maxScore) * 100))),
    });
  }

  function advanceLevel() {
    const currentLevel = LEVELS[levelRef.current] ?? LEVELS[LEVELS.length - 1];
    statsRef.current.puzzlesSolved++;
    addScore(currentLevel.score);
    playSFX('complete');
    setFeedback(`${currentLevel.name} secured. Protection stays simple: pay premium, keep cover active.`);

    if (levelRef.current >= LEVELS.length - 1) {
      setTimeout(() => finishGame(true), 650);
      return;
    }

    const nextLevel = levelRef.current + 1;
    levelRef.current = nextLevel;
    setLevelIndex(nextLevel);
    const nextBoard = buildPuzzle(nextLevel, LEVELS[nextLevel]?.clues ?? 5);
    syncBoard(nextBoard);
    setSelected(nextBoard.flat().findIndex(value => value === null));
  }

  function isSolved(nextBoard: CellValue[][]) {
    return nextBoard.every((row, r) => row.every((value, c) => value === SOLUTIONS[levelRef.current % SOLUTIONS.length][r][c]));
  }

  function handleCellTap(index: number) {
    setSelected(index);
  }

  function handleNumberTap(value: number) {
    if (!started || !activeRef.current) return;
    const row = Math.floor(selected / GRID_SIZE);
    const col = selected % GRID_SIZE;
    if (givens[selected]) {
      setFeedback('Clue cells are fixed. They protect the grid.');
      playSFX('bad');
      return;
    }

    statsRef.current.entries++;
    setEntries(statsRef.current.entries);
    if (solution[row][col] !== value) {
      statsRef.current.mistakes++;
      setMistakes(statsRef.current.mistakes);
      addScore(-(level?.mistakePenalty ?? 50));
      setShake(true);
      setTimeout(() => setShake(false), 360);
      setFeedback('That number breaks a row, column, or shield box.');
      playSFX('bad');
      return;
    }

    const next = boardRef.current.map(boardRow => [...boardRow]);
    next[row][col] = value;
    syncBoard(next);
    statsRef.current.correctEntries++;
    setCorrectEntries(statsRef.current.correctEntries);
    addScore(CELL_SCORE);
    setFeedback(SYMBOLS[value - 1]?.fact ?? 'Correct fit.');
    playSFX('place');

    const nextEmpty = next.flat().findIndex((cell, idx) => cell === null && idx > selected);
    if (nextEmpty >= 0) setSelected(nextEmpty);

    if (isSolved(next)) {
      setTimeout(advanceLevel, 420);
    }
  }

  function handleHint() {
    if (!started || !activeRef.current) return;
    if (statsRef.current.hintsUsed >= MAX_HINTS) {
      setFeedback('No hints left. Trust the pattern.');
      playSFX('bad');
      return;
    }

    const empties = boardRef.current.flat().map((value, index) => (value === null ? index : -1)).filter(index => index >= 0);
    if (!empties.length) return;
    const target = empties.includes(selected) ? selected : empties[0];
    const row = Math.floor(target / GRID_SIZE);
    const col = target % GRID_SIZE;
    const value = solution[row][col];
    const next = boardRef.current.map(boardRow => [...boardRow]);
    next[row][col] = value;
    syncBoard(next);
    setSelected(target);
    statsRef.current.hintsUsed++;
    setHintsUsed(statsRef.current.hintsUsed);
    addScore(-(level?.hintPenalty ?? 80));
    setFeedback(`Hint placed: ${SYMBOLS[value - 1]?.label}. Term cover is a safety-first choice.`);
    playSFX('hint');

    if (isSolved(next)) {
      setTimeout(advanceLevel, 420);
    }
  }

  function handleClear() {
    if (!started || !activeRef.current || givens[selected]) return;
    const row = Math.floor(selected / GRID_SIZE);
    const col = selected % GRID_SIZE;
    if (boardRef.current[row][col] === null) return;
    const next = boardRef.current.map(boardRow => [...boardRow]);
    next[row][col] = null;
    syncBoard(next);
    setFeedback('Cell cleared. Re-check row, column, and box.');
  }

  function handleRestart() {
    stopMusic();
    playSFX('btn');
    const initial = buildPuzzle(0, LEVELS[0]?.clues ?? 8);
    levelRef.current = 0;
    scoreRef.current = 0;
    timeLeftRef.current = GAME_SECS;
    statsRef.current = { mistakes: 0, hintsUsed: 0, entries: 0, correctEntries: 0, puzzlesSolved: 0 };
    setLevelIndex(0);
    syncBoard(initial);
    setSelected(initial.flat().findIndex(value => value === null));
    setScore(0);
    setTimeLeft(GAME_SECS);
    setMistakes(0);
    setHintsUsed(0);
    setEntries(0);
    setCorrectEntries(0);
    setFeedback('Fill each row, column, and shield box once.');
    setStarted(false);
    activeRef.current = false;
  }

  function handleMuteToggle() {
    const next = !muted;
    setMuted(next);
    setAudioMuted(next);
    if (!next) playSFX('btn');
  }

  function handleStart() {
    playSFX('btn');
    const initial = buildPuzzle(0, LEVELS[0]?.clues ?? 8);
    syncBoard(initial);
    setSelected(initial.flat().findIndex(value => value === null));
    setStarted(true);
  }

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  const timerCritical = timeLeft <= 20;
  const accuracy = entries === 0 ? 100 : Math.round((correctEntries / entries) * 100);
  const progressPct = ((statsRef.current.puzzlesSolved + board.flat().filter(Boolean).length / (GRID_SIZE * GRID_SIZE)) / LEVELS.length) * 100;

  return (
    <div
      className="relative flex h-full min-h-0 flex-col overflow-hidden"
      style={{ background: 'radial-gradient(circle at 50% -10%, #0f766e 0%, #071b33 42%, #030712 100%)' }}
    >
      <div
        className="flex flex-shrink-0 items-center justify-between gap-[0.5rem] px-[4vw] pb-[1vh]"
        style={{ paddingTop: 'max(2vh, calc(env(safe-area-inset-top) + 0.5rem))' }}
      >
        <button
          onClick={handleMuteToggle}
          className="btn-press flex h-[2.55rem] min-w-[4rem] items-center justify-center rounded-full px-[0.6rem] text-[0.68rem] font-extrabold uppercase text-white"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(125,211,252,0.25)' }}
        >
          {muted ? 'Muted' : 'Sound'}
        </button>

        <div className="text-center">
          <div
            className="font-extrabold tabular-nums transition-colors"
            style={{
              color: timerCritical ? '#FB7185' : 'white',
              fontSize: 'clamp(1.55rem, 7vw, 2rem)',
              textShadow: timerCritical ? '0 0 12px rgba(251,113,133,0.6)' : '0 0 12px rgba(45,212,191,0.35)',
            }}
          >
            {mm}:{ss}
          </div>
          <div className="text-[0.56rem] font-bold uppercase tracking-[0.14em] text-cyan-200">Cover Clock</div>
        </div>

        <button
          onClick={handleRestart}
          className="btn-press flex h-[2.55rem] min-w-[4rem] items-center justify-center rounded-full px-[0.6rem] text-[0.68rem] font-extrabold uppercase text-white"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(251,191,36,0.28)' }}
        >
          Reset
        </button>
      </div>

      <div className="mx-[4vw] flex-shrink-0 rounded-[0.9rem] border border-cyan-200/15 bg-white/8 px-[0.45rem] py-[0.25rem] backdrop-blur">
        <div className="flex items-center justify-between gap-[0.5rem]">
          <div>
            <p className="text-[0.5rem] font-extrabold uppercase tracking-[0.12em] text-cyan-200">Level {levelIndex + 1}/{LEVELS.length}</p>
            <h2 className="text-[0.72rem] font-extrabold text-white">{level?.name}</h2>
          </div>
          <div className="text-right">
            <p className="text-[0.5rem] font-extrabold uppercase tracking-[0.1em] text-amber-200">Score</p>
            <p className="text-[0.85rem] font-extrabold tabular-nums" style={{ color: ORANGE }}>{score}</p>
          </div>
        </div>
        <div className="mt-[0.25rem] h-[0.35rem] overflow-hidden rounded-full bg-black/35">
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, progressPct)}%`, background: `linear-gradient(90deg, ${GREEN}, #22d3ee, ${ORANGE})` }} />
        </div>
      </div>

      <div className="flex flex-1 min-h-0 items-center justify-center px-[4vw] py-[1.2vh]">
        <div className={`grid w-full max-w-[22rem] grid-cols-4 overflow-hidden rounded-[1.25rem] border-[0.22rem] border-cyan-100/35 bg-cyan-100/20 shadow-[0_1rem_3rem_rgba(0,0,0,0.45)] ${shake ? 'shake' : ''}`}>
          {board.flat().map((value, index) => {
            const row = Math.floor(index / GRID_SIZE);
            const col = index % GRID_SIZE;
            const isSelected = selected === index;
            const sameValue = selectedValue !== null && value === selectedValue;
            const isGiven = givens[index];
            const thickRight = (col + 1) % BOX_SIZE === 0 && col !== GRID_SIZE - 1;
            const thickBottom = (row + 1) % BOX_SIZE === 0 && row !== GRID_SIZE - 1;

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleCellTap(index)}
                className="btn-press sudoku-cell relative aspect-square text-center font-extrabold transition-all"
                style={{
                  borderRight: thickRight ? '0.18rem solid rgba(207,250,254,0.65)' : '1px solid rgba(207,250,254,0.18)',
                  borderBottom: thickBottom ? '0.18rem solid rgba(207,250,254,0.65)' : '1px solid rgba(207,250,254,0.18)',
                  background: isSelected
                    ? 'linear-gradient(145deg, rgba(251,191,36,0.96), rgba(245,158,11,0.92))'
                    : isGiven
                      ? 'linear-gradient(145deg, rgba(20,184,166,0.95), rgba(14,116,144,0.9))'
                      : sameValue
                        ? 'rgba(125,211,252,0.3)'
                        : 'rgba(3,7,18,0.62)',
                  color: isSelected ? '#111827' : 'white',
                  fontSize: 'clamp(1rem, 8vw, 2.3rem)',
                  boxShadow: isSelected ? 'inset 0 0 0 0.16rem rgba(255,255,255,0.8), 0 0 1.2rem rgba(251,191,36,0.45)' : undefined,
                }}
                aria-label={`Cell ${row + 1}, ${col + 1}`}
              >
                {value ? (
                  <img
                    src={SYMBOLS[value - 1]?.icon}
                    alt=""
                    draggable={false}
                    className="mx-auto h-[72%] w-[72%] object-contain drop-shadow-[0_0.3rem_0.55rem_rgba(0,0,0,0.4)]"
                  />
                ) : ''}

              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-[4vw] flex-shrink-0 rounded-[0.85rem] border border-white/10 bg-black/25 px-[0.5rem] py-[0.3rem]">
        <p className="min-h-[1.7rem] text-center text-[0.7rem] font-bold leading-snug text-cyan-50">{feedback}</p>
        <div className="mt-[0.2rem] grid grid-cols-4 gap-[0.35rem]">
          {SYMBOLS.map(symbol => (
            <button
              key={symbol.value}
              type="button"
              onClick={() => handleNumberTap(symbol.value)}
              aria-label={`Place ${symbol.label}`}
              title={symbol.label}
              className="btn-press flex h-[3rem] items-center justify-center rounded-[0.75rem] p-[0.25rem]"
              style={{ background: 'linear-gradient(180deg, #f8fafc, #bae6fd)', boxShadow: 'inset 0 0.1rem 0 rgba(255,255,255,0.9)' }}
            >
              <img src={symbol.icon} alt="" draggable={false} className="h-full w-full object-contain" />
            </button>
          ))}
        </div>

      </div>

      <div
        className="grid flex-shrink-0 grid-cols-3 gap-[0.4rem] px-[4vw] pt-[0.2rem] text-center"
        style={{ paddingBottom: 'max(2vh, calc(env(safe-area-inset-bottom) + 0.5rem))' }}
      >
        <div className="rounded-[0.75rem] bg-white/8 p-[0.3rem]">
          <p className="text-[0.5rem] font-extrabold uppercase tracking-[0.08em] text-cyan-200">Accuracy</p>
          <p className="text-[0.78rem] font-extrabold text-white">{accuracy}%</p>
        </div>
        <div className="rounded-[0.75rem] bg-white/8 p-[0.3rem]">
          <p className="text-[0.5rem] font-extrabold uppercase tracking-[0.08em] text-rose-200">Mistakes</p>
          <p className="text-[0.78rem] font-extrabold text-white">{mistakes}</p>
        </div>
        <div className="rounded-[0.75rem] bg-white/8 p-[0.3rem]">
          <p className="text-[0.5rem] font-extrabold uppercase tracking-[0.08em] text-amber-200">Hints</p>
          <p className="text-[0.78rem] font-extrabold text-white">{hintsUsed}/{MAX_HINTS}</p>
        </div>
      </div>

      {!started && <HowToPlayPopup onStart={handleStart} />}
    </div>
  );
};

export default GameScreen;
