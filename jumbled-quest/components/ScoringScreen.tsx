import React, { useState } from 'react';
import { GameResult } from '../types';
import {
  BLUE,
  CALL_NOW_NUMBER,
  DISCLAIMER,
  ORANGE,
  SCORE_MESSAGES,
  SCORING_BG_IMAGE,
  SCORING_CTA_LINE,
  SCORING_TAGLINE,
  TARGET_PORTFOLIO,
  THANK_YOU_BODY,
} from '../constants';
import BookSlotModal from './BookSlotModal';

interface Props {
  result: GameResult;
  playerName: string;
  playerMobile: string;
  onPlayAgain: () => void;
}

const ScoringScreen: React.FC<Props> = ({ result, playerName, playerMobile, onPlayAgain }) => {
  const [showBook, setShowBook] = useState(false);
  const [booked, setBooked] = useState(false);

  const totalScore = result.portfolio;
  const puzzlesSolved = result.goodWhacks;
  const totalSwaps = result.molesSeen;

  const finalScore = totalScore;
  const msg = SCORE_MESSAGES.find(m => finalScore >= m.minScore) ?? SCORE_MESSAGES[SCORE_MESSAGES.length - 1];
  const hasBg = !!SCORING_BG_IMAGE;

  let scoringText = '';
  if (finalScore <= 30) {
    scoringText = "Oops! You could not solve the puzzle. But this was just a game.";
  } else if (finalScore > 30 && finalScore <= 60) {
    scoringText = "Well Played! But you can do better.";
  } else {
    scoringText = "Awesome! You have aced the puzzle.";
  }

  const scoreColor = finalScore >= 70 ? '#22C55E' : finalScore >= 40 ? '#F97316' : '#EF4444';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Picture Puzzle Score',
        text: `I scored ${totalScore} points solving ${puzzlesSolved} puzzle${puzzlesSolved !== 1 ? 's' : ''}! Can you beat me?`,
      });
    }
  };

  if (booked) {
    return (
      <div
        className="screen-scroll flex min-h-full flex-col items-center justify-center px-[6vw] py-[6vh] text-center"
        style={{ background: BLUE }}
      >
        <h2 className="pop text-[clamp(2.4rem,12vw,4rem)] font-extrabold text-white">THANK YOU!</h2>
        <h3 className="pop mb-[1.2rem] mt-[0.6rem] text-[clamp(1.4rem,7vw,2rem)] font-extrabold" style={{ color: ORANGE }}>
          {playerName.toUpperCase()}
        </h3>
        <p className="mb-[2.4rem] max-w-[21rem] text-[0.95rem] leading-relaxed text-blue-100">{THANK_YOU_BODY}</p>
        <button
          onClick={onPlayAgain}
          className="btn-press rounded-full px-[3rem] py-[1rem] text-[1rem] font-extrabold text-white"
          style={{ background: ORANGE }}
        >
          PLAY AGAIN
        </button>
      </div>
    );
  }

  return (
    <div
      className="screen-scroll"
      style={{ position: 'relative', backgroundColor: hasBg ? '#111' : '#EEF2FF', height: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {hasBg && (
        <>
          <div
            aria-hidden
            style={{
              position: 'fixed', inset: 0,
              backgroundImage: `url(${SCORING_BG_IMAGE})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              filter: 'blur(14px)', transform: 'scale(1.1)',
              zIndex: 0, pointerEvents: 'none',
            }}
          />
          <div
            aria-hidden
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', zIndex: 1, pointerEvents: 'none' }}
          />
        </>
      )}

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', flex: 1 }}>
        {showBook && (
          <BookSlotModal
            name={playerName}
            mobile={playerMobile}
            onClose={() => setShowBook(false)}
            onBook={() => { setBooked(true); setShowBook(false); }}
          />
        )}

        {/* Header — anchored top, respects device safe-area */}
        <div
          className="px-6 pb-6 text-center"
          style={{
            paddingTop: 'max(1.75rem, env(safe-area-inset-top))',
            ...(hasBg ? {} : { background: 'linear-gradient(135deg, #003DA6, #172554)' }),
          }}
        >
          <h2
            className="text-2xl font-extrabold text-white"
            style={hasBg ? { textShadow: '0 2px 10px rgba(0,0,0,0.6)' } : undefined}
          >
            Hi {playerName}!
          </h2>
        </div>

        {/* Score Card Section */}
        <div
          className="mx-4 px-4 pt-4 pb-5"
          style={hasBg
            ? { background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', borderRadius: 16 }
            : { background: 'white', borderRadius: 16 }}
        >
          {/* Score badge */}
          <div className="flex flex-col items-center mb-4 gap-1.5">
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: hasBg ? 'rgba(255,255,255,0.6)' : '#9ca3af' }}
            >
              YOUR SCORE
            </span>
            <span className="text-5xl font-extrabold leading-none" style={{ color: scoreColor }}>
              {totalScore}%
            </span>
          </div>

          {/* Two stat tiles */}
          <div className="flex gap-3 mb-4">
            <div
              className="flex-1 flex flex-col items-center rounded-2xl px-2 py-3 gap-1"
              style={{ background: 'rgba(74,222,128,0.10)', border: '1px solid rgba(74,222,128,0.45)' }}
            >
              <span className="text-2xl font-extrabold leading-none" style={{ color: '#4ADE80' }}>
                {puzzlesSolved}/3
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-center leading-tight" style={{ color: 'rgba(74,222,128,0.9)' }}>
                Puzzles{'\n'}Solved
              </span>
            </div>
            <div
              className="flex-1 flex flex-col items-center rounded-2xl px-2 py-3 gap-1"
              style={{ background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.45)' }}
            >
              <span className="text-2xl font-extrabold leading-none" style={{ color: '#FBBF24' }}>
                {totalSwaps}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-center leading-tight" style={{ color: 'rgba(251,191,36,0.9)' }}>
                Total{'\n'}Swaps
              </span>
            </div>
          </div>

          {/* <p
            className="text-xs font-medium leading-relaxed text-center mb-2"
            style={{ color: hasBg ? 'rgba(255,255,255,0.75)' : '#4b5563' }}
          >
            {msg.body}
          </p> */}

          <p
            className="text-sm font-bold leading-relaxed text-center"
            style={{ color: hasBg ? 'rgba(255,255,255,0.9)' : '#1f2937' }}
          >
            {scoringText}
          </p>
        </div>


        {/* Spacer — pushes action buttons toward vertical center */}
        <div style={{ flex: 1 }} />

        {/* Action buttons — centered in remaining space */}
        <div className="space-y-3 px-4 py-4">

          <button
            className="btn-press w-full rounded-xl py-3.5 text-sm font-bold text-white"
            style={{ background: '#25D366' }}
            onClick={handleShare}
          >
            Share
          </button>
          <p className="text-xs font-semibold leading-relaxed text-center max-w-[280px] mx-auto" style={{ color: hasBg ? 'rgba(255,255,255,0.85)' : '#1e3a8a' }}>
            To solve your real life financial puzzles, connect with our relationship manager now!
          </p>
          <div
            className="rounded-2xl p-4"
            style={{ background: hasBg ? 'rgba(30,58,138,0.75)' : '#1e3a8a' }}
          >
            <a
              href={`tel:${CALL_NOW_NUMBER}`}
              className="btn-press mb-3 flex w-full items-center justify-center rounded-xl py-3 text-sm font-bold text-white"
              style={{ background: ORANGE }}
            >
              Call now
            </a>
            <button
              onClick={() => setShowBook(true)}
              className="btn-press w-full rounded-xl py-3 text-sm font-extrabold text-white"
              style={{ background: '#0D9488' }}
            >
              Book a Slot
            </button>
          </div>

          <button
            onClick={onPlayAgain}
            className="btn-press w-full rounded-xl py-3.5 text-sm font-bold"
            style={hasBg
              ? { color: 'white', border: '2px solid rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.12)' }
              : { color: BLUE, border: `2px solid ${BLUE}`, background: 'white' }}
          >
            Play Again
          </button>
        </div>

        {/* Spacer — keeps disclaimer at bottom */}
        <div style={{ flex: 1 }} />

        {/* Disclaimer — anchored bottom, respects device safe-area */}
        <p
          className="px-4 text-[9px] leading-relaxed"
          style={{
            color: hasBg ? 'rgba(255,255,255,0.5)' : '#9ca3af',
            paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
          }}
        >
          DISCLAIMER: {DISCLAIMER}
        </p>
      </div>
    </div>
  );
};

export default ScoringScreen;
