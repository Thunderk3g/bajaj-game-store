import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BLUE,
  GAME_SECS,
  GREEN,
  GRID_SIZE,
  IMAGE_PATH,
  MAX_MOVES,
  MAX_SCORE,
  ORANGE,
  PAR_MOVES,
  PENALTY_PER_MOVE_OVER_PAR,
  POINTS_PER_CORRECT_TILE,
  SHUFFLE_MOVES,
  SOLVED_BONUS,
  TIME_BONUS,
  TIME_BONUS_THRESHOLD_SECONDS,
  TOTAL_TILES
} from '../constants';
import { playSfx, setMuted as setAudioMuted, startMusic, stopMusic } from '../audio';
import { GameResult } from '../types';

interface Props {
  onGameEnd: (result: GameResult) => void;
}

function makeSolved(): number[] {
  return Array.from({ length: TOTAL_TILES }, (_, i) => i);
}

function shuffleTiles(): number[] {
  const tiles = makeSolved();
  for (let i = 0; i < SHUFFLE_MOVES; i += 1) {
    const a = Math.floor(Math.random() * TOTAL_TILES);
    let b = Math.floor(Math.random() * TOTAL_TILES);
    if (a === b) b = (b + 1) % TOTAL_TILES;
    [tiles[a], tiles[b]] = [tiles[b], tiles[a]];
  }
  if (tiles.every((tile, idx) => tile === idx)) {
    [tiles[0], tiles[1]] = [tiles[1], tiles[0]];
  }
  return tiles;
}

function correctCount(tiles: number[]): number {
  return tiles.filter((tile, idx) => tile === idx).length;
}

function calculateScore(tiles: number[], moves: number, timeUsed: number, solved: boolean): number {
  const correct = correctCount(tiles);
  const tileScore = correct * POINTS_PER_CORRECT_TILE;
  const solvedScore = solved ? SOLVED_BONUS : 0;
  const movePenalty = Math.max(0, moves - PAR_MOVES) * PENALTY_PER_MOVE_OVER_PAR;
  const timeBonus = TIME_BONUS && solved && timeUsed <= TIME_BONUS_THRESHOLD_SECONDS ? 8 : 0;
  return Math.max(0, Math.min(MAX_SCORE, Math.round(tileScore + solvedScore + timeBonus - movePenalty)));
}

const GameScreen: React.FC<Props> = ({ onGameEnd }) => {
  const [tiles, setTiles] = useState<number[]>(() => shuffleTiles());
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECS);
  const [muted, setMuted] = useState(false);
  const [finished, setFinished] = useState(false);

  const tilesRef = useRef(tiles);
  const movesRef = useRef(0);
  const timeLeftRef = useRef(GAME_SECS);
  const endedRef = useRef(false);

  const correct = useMemo(() => correctCount(tiles), [tiles]);
  const progress = Math.round((correct / TOTAL_TILES) * 100);

  function finish(nextTiles: number[], nextMoves: number, solved: boolean): void {
    if (endedRef.current) return;
    endedRef.current = true;
    setFinished(true);
    stopMusic();
    playSfx(solved ? 'win' : 'end');
    const timeUsed = GAME_SECS - timeLeftRef.current;
    window.setTimeout(() => {
      onGameEnd({
        rawScore: calculateScore(nextTiles, nextMoves, timeUsed, solved),
        movesUsed: nextMoves,
        correctTiles: correctCount(nextTiles),
        totalTiles: TOTAL_TILES,
        timeSeconds: timeUsed,
        solved
      });
    }, solved ? 650 : 350);
  }

  useEffect(() => {
    startMusic();
    const timer = window.setInterval(() => {
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        window.clearInterval(timer);
        finish(tilesRef.current, movesRef.current, false);
      }
    }, 1000);

    return () => {
      window.clearInterval(timer);
      stopMusic();
    };
  }, []);

  function handleTileClick(index: number): void {
    if (endedRef.current) return;
    if (selected === null) {
      setSelected(index);
      playSfx('button');
      return;
    }
    if (selected === index) {
      setSelected(null);
      return;
    }

    const nextTiles = [...tilesRef.current];
    [nextTiles[selected], nextTiles[index]] = [nextTiles[index], nextTiles[selected]];
    const nextMoves = movesRef.current + 1;
    const before = correctCount(tilesRef.current);
    const after = correctCount(nextTiles);

    tilesRef.current = nextTiles;
    movesRef.current = nextMoves;
    setTiles(nextTiles);
    setMoves(nextMoves);
    setSelected(null);
    playSfx(after > before ? 'match' : 'swap');

    const solved = after === TOTAL_TILES;
    if (solved || nextMoves >= MAX_MOVES) {
      finish(nextTiles, nextMoves, solved);
    }
  }

  function toggleMute(): void {
    const next = !muted;
    setMuted(next);
    setAudioMuted(next);
    if (!next) playSfx('button');
  }

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');

  return (
    <div className="h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #06162f 0%, #082a66 55%, #06162f 100%)' }}>
      <div className="px-4 pt-4 pb-2 flex items-center justify-between flex-shrink-0">
        <button onClick={toggleMute} className="w-10 h-10 rounded-full text-white font-bold btn-press" style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.2)' }}>
          {muted ? 'Mute' : 'Vol'}
        </button>
        <div className="text-center">
          <div className="text-white text-3xl font-extrabold tabular-nums">{mm}:{ss}</div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: '#9fc2ff' }}>Time Left</div>
        </div>
        <div className="text-right">
          <div className="text-white text-2xl font-extrabold tabular-nums">{moves}</div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: '#9fc2ff' }}>Moves</div>
        </div>
      </div>

      <div className="px-4 pb-2 flex-shrink-0">
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.14)' }}>
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${ORANGE}, ${GREEN})` }} />
        </div>
        <div className="flex justify-between text-[10px] font-bold mt-1" style={{ color: '#b8d3ff' }}>
          <span>{correct}/{TOTAL_TILES} aligned</span>
          <span>Max {MAX_MOVES} moves</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-2">
        <div
          className={`grid rounded-[8px] overflow-hidden shadow-2xl ${finished ? 'tile-win' : ''}`}
          style={{
            width: 'min(92vw, 420px)',
            maxWidth: 420,
            aspectRatio: '1 / 1',
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            border: '4px solid rgba(255,255,255,0.96)',
            background: '#fff'
          }}
        >
          {tiles.map((tile, cell) => {
            const tileRow = Math.floor(tile / GRID_SIZE);
            const tileCol = tile % GRID_SIZE;
            const isSelected = selected === cell;
            const isCorrect = tile === cell;
            return (
              <button
                key={`${cell}-${tile}`}
                onClick={() => handleTileClick(cell)}
                className="relative btn-press"
                style={{
                  backgroundImage: `url(${IMAGE_PATH})`,
                  backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
                  backgroundPosition: `${(tileCol / (GRID_SIZE - 1)) * 100}% ${(tileRow / (GRID_SIZE - 1)) * 100}%`,
                  border: `1px solid ${isSelected ? ORANGE : 'rgba(255,255,255,0.85)'}`,
                  boxShadow: isSelected ? `inset 0 0 0 4px ${ORANGE}` : isCorrect ? `inset 0 0 0 3px ${GREEN}99` : 'none'
                }}
                aria-label={`Puzzle tile ${cell + 1}`}
              >
                {isSelected && <span className="absolute top-1 right-1 w-5 h-5 rounded-full text-white text-xs font-extrabold flex items-center justify-center" style={{ background: ORANGE }}>1</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pb-4 flex-shrink-0">
        <div className="rounded-[8px] px-4 py-3" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.16)' }}>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] font-extrabold uppercase" style={{ color: '#9fc2ff' }}>Protect</p>
              <p className="text-white text-xs font-bold">Life cover</p>
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase" style={{ color: '#9fc2ff' }}>Invest</p>
              <p className="text-white text-xs font-bold">Fund choice</p>
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase" style={{ color: '#9fc2ff' }}>Grow</p>
              <p className="text-white text-xs font-bold">Market linked</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
