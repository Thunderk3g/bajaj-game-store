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
  THANK_YOU_BODY,
} from '../constants';
import BookSlotModal from './BookSlotModal';

interface Props {
  result: GameResult;
  playerName: string;
  playerMobile: string;
  onPlayAgain: () => void;
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const toRad = (d: number) => (d - 90) * (Math.PI / 180);
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(endDeg));
  const y2 = cy + r * Math.sin(toRad(endDeg));
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

const ScoringScreen: React.FC<Props> = ({ result, playerName, playerMobile, onPlayAgain }) => {
  const [showBook, setShowBook] = useState(false);
  const [booked, setBooked] = useState(false);

  const finalScore = result.rawScore;
  const msg = SCORE_MESSAGES.find(m => finalScore >= m.minScore) ?? SCORE_MESSAGES[SCORE_MESSAGES.length - 1];
  const hasBg = !!SCORING_BG_IMAGE;

  const GAP = 4;
  const solvedPct = Math.round((result.puzzlesSolved / result.totalPuzzles) * 100);
  const remainingPct = 100 - solvedPct;
  const solvedDeg = (solvedPct / 100) * 360 - GAP;
  const remainingDeg = (remainingPct / 100) * 360 - GAP;
  const cx = 50; const cy = 50; const r = 42; const stroke = 9;
  const innerR = r - stroke / 2;
  const solvedEnd = solvedDeg;
  const remainingStart = solvedEnd + GAP;
  const remainingEnd = remainingStart + remainingDeg;

  const scoreColor = finalScore >= 70 ? '#22C55E' : finalScore >= 40 ? '#F97316' : '#EF4444';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Guardian Grid Score',
        text: `I scored ${finalScore}/100 in Guardian Grid! Can you solve the protection puzzle?`,
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
            Scoring
          </p>

          <h3 className="mb-1 text-center text-xl font-extrabold" style={{ color: scoreColor }}>
            {msg.title}
          </h3>
          <p
            className="mb-4 text-center text-xs font-semibold leading-relaxed"
            style={{ color: hasBg ? 'rgba(255,255,255,0.78)' : '#334155' }}
          >
            {msg.body}
          </p>

          {/* 3-widget row: Solved | Dial | Accuracy */}
          <div className="flex items-center gap-2 mb-4">

            <div
              className="flex-1 flex flex-col items-center rounded-2xl px-2 py-3 gap-1"
              style={{ background: 'rgba(7, 7, 7, 0.1)', border: '1px solid rgba(45, 212, 191, 0.9)' }}
            >
              <span className="text-[9px] font-extrabold uppercase tracking-wide text-center leading-tight" style={{ color: 'rgba(45, 212, 191, 0.97)' }}>
                Puzzles{'\n'}Solved
              </span>
              <span className="text-lg font-extrabold leading-none" style={{ color: 'rgba(45, 212, 191, 0.97)' }}>
                {result.puzzlesSolved}/{result.totalPuzzles}
              </span>
              <span className="text-[10px] font-bold" style={{ color: 'rgb(74, 228, 130)' }}>
                Level {result.levelReached}
              </span>
            </div>

            {/* Center dial */}
            <div className="flex flex-col items-center">
              <div style={{ position: 'relative', width: 100, height: 100 }}>
                <svg viewBox="0 0 100 100" width={100} height={100}>
                  <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} />
                  {solvedDeg > 0 && (
                    <path
                      d={arcPath(cx, cy, innerR, 0, solvedEnd)}
                      fill="none" stroke="#22d3ee" strokeWidth={stroke} strokeLinecap="round"
                    />
                  )}
                  {remainingDeg > 0 && (
                    <path
                      d={arcPath(cx, cy, innerR, remainingStart, remainingEnd)}
                      fill="none" stroke="rgba(251,191,36,0.88)" strokeWidth={stroke} strokeLinecap="round"
                    />
                  )}
                </svg>
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 1,
                }}>
                  <span
                    className="text-xl font-extrabold leading-none"
                    style={{ color: scoreColor }}
                  >
                    {finalScore}
                  </span>
                  <span className="text-[10px] font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>/100</span>
                  
                </div>
              </div>
            </div>

            <div
              className="flex-1 flex flex-col items-center rounded-2xl px-2 py-3 gap-1"
              style={{ background: 'rgba(7, 7, 7, 0.1)', border: '1px solid rgba(251, 191, 36, 0.92)' }}
            >
              <span className="text-[9px] font-extrabold uppercase tracking-wide text-center leading-tight" style={{ color: 'rgba(251, 191, 36, 0.97)' }}>
                Accuracy
              </span>
              <span className="text-lg font-extrabold leading-none" style={{ color: 'rgba(251, 191, 36, 0.97)' }}>
                {result.accuracy}%
              </span>
              <span className="text-[10px] font-bold" style={{ color: 'rgba(251, 191, 36, 0.97)' }}>
                {result.mistakes} mistakes
              </span>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-black/10 px-2 py-2">
              <p className="text-[9px] font-extrabold uppercase tracking-wide" style={{ color: hasBg ? '#bae6fd' : '#0e7490' }}>Score</p>
              <p className="text-sm font-extrabold" style={{ color: hasBg ? '#fff' : '#0f172a' }}>{result.score}/{result.maxScore}</p>
            </div>
            <div className="rounded-xl bg-black/10 px-2 py-2">
              <p className="text-[9px] font-extrabold uppercase tracking-wide" style={{ color: hasBg ? '#fde68a' : '#b45309' }}>Hints</p>
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
            {SCORING_TAGLINE}
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
            📤 Share
          </button>
          <p className="text-sm font-semibold leading-relaxed text-center" style={{ color: hasBg ? 'rgba(255,255,255,0.85)' : '#1e3a8a' }}>
            {SCORING_CTA_LINE}
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
              📞 Call now
            </a>
            <button
              onClick={() => setShowBook(true)}
              className="btn-press w-full rounded-xl py-3 text-sm font-extrabold text-white"
              style={{ background: '#0D9488' }}
            >
              📅 Book a Slot
            </button>
          </div>

          <button
            onClick={onPlayAgain}
            className="btn-press w-full rounded-xl py-3.5 text-sm font-bold"
            style={hasBg
              ? { color: 'white', border: '2px solid rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.12)' }
              : { color: BLUE, border: `2px solid ${BLUE}`, background: 'white' }}
          >
            ▶ Play Again
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
