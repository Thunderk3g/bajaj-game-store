import React, { useState } from 'react';
import { GameResult } from '../types';
import {
  BLUE,
  CALL_NOW_NUMBER,
  DISCLAIMER,
  ORANGE,
  SCORING_BG_IMAGE,
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

  const finalScore = result.rawScore;
  const hasBg = !!SCORING_BG_IMAGE;

  const scoreColor = finalScore >= 70 ? '#22C55E' : finalScore >= 40 ? '#F97316' : '#EF4444';

  let dynamicTagline = '';
  if (finalScore <= 30) {
    dynamicTagline = "Oops! Some shield slots remained empty. Let's practice locking your protection goals!";
  } else if (finalScore <= 60) {
    dynamicTagline = "Well Played! You placed several protection blocks, but you can build a more secure grid.";
  } else {
    dynamicTagline = "Awesome! You successfully locked your life goals and built a robust protection grid.";
  }

  const dynamicCtaLine = "To completely secure your family's real-life financial protection, connect with our relationship manager now!";

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Guardian Grid Score',
        text: `I scored ${finalScore}/100 in Guardian Grid! Can you solve the protection grid?`,
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
          <p
            className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-center"
            style={{ color: hasBg ? 'rgba(230, 210, 210, 1)' : '#9ca3af' }}
          >
            Your Score
          </p>

          {/* Glowing central circular score badge */}
          <div className="flex flex-col items-center justify-center my-5">
            <div
              className="rounded-full flex flex-col items-center justify-center shadow-xl border-4"
              style={{
                width: 124,
                height: 124,
                background: hasBg ? 'rgba(0, 30, 60, 0.45)' : '#F3F4F6',
                borderColor: scoreColor,
                boxShadow: `0 0 15px ${scoreColor}`,
              }}
            >
              <span className="text-4xl font-extrabold leading-none" style={{ color: hasBg ? 'white' : '#1F2937' }}>
                {finalScore}%
              </span>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-black/10 px-2 py-2">
              <p className="text-[9px] font-extrabold uppercase tracking-wide" style={{ color: hasBg ? '#bae6fd' : '#0e7490' }}>Levels</p>
              <p className="text-sm font-extrabold" style={{ color: hasBg ? '#fff' : '#0f172a' }}>{result.puzzlesSolved}/{result.totalPuzzles}</p>
            </div>
            <div className="rounded-xl bg-black/10 px-2 py-2">
              <p className="text-[9px] font-extrabold uppercase tracking-wide" style={{ color: hasBg ? '#fde68a' : '#b45309' }}>Moves</p>
              <p className="text-sm font-extrabold" style={{ color: hasBg ? '#fff' : '#0f172a' }}>{result.hintsUsed}</p>
            </div>
            <div className="rounded-xl bg-black/10 px-2 py-2">
              <p className="text-[9px] font-extrabold uppercase tracking-wide" style={{ color: hasBg ? '#bbf7d0' : '#15803d' }}>Time Left</p>
              <p className="text-sm font-extrabold" style={{ color: hasBg ? '#fff' : '#0f172a' }}>{result.timeRemaining}s</p>
            </div>
          </div>

          <p
            className="text-sm font-bold leading-relaxed text-center"
            style={{ color: hasBg ? 'rgba(255,255,255,0.9)' : '#1f2937' }}
          >
            {dynamicTagline}
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
          <p className="text-sm font-semibold leading-relaxed text-center" style={{ color: hasBg ? 'rgba(255,255,255,0.85)' : '#1e3a8a' }}>
            {dynamicCtaLine}
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
