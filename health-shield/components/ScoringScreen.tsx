import React, { useState } from 'react';
import { GameResult } from '../types';
import {
  GREEN,
  MAX_LIVES, TOTAL_BRICKS,
  SCORE_MESSAGES, COVERAGE_WEIGHT, LIVES_BONUS_MAX,
  SCORE_COLOR_GREEN, SCORE_COLOR_ORANGE,
  COMPANY_NAME, CALL_NOW_NUMBER, DISCLAIMER,
  SCORING_TAGLINE, SCORING_CTA_LINE, THANK_YOU_BODY,
} from '../constants';
import BookSlotModal from './BookSlotModal';

interface Props {
  result: GameResult;
  playerName: string;
  playerMobile: string;
  onPlayAgain: () => void;
}

function getMessage(score: number) {
  return SCORE_MESSAGES.find(m => score >= m.minScore) ?? SCORE_MESSAGES[SCORE_MESSAGES.length - 1];
}

const NEON_PRIMARY = '#7c3aed';
const NEON_ACCENT  = '#ff2d78';
const NEON_CYAN    = '#00e5ff';
const NEON_GREEN   = '#39ff14';

const ScoringScreen: React.FC<Props> = ({ result, playerName, playerMobile, onPlayAgain }) => {
  const [showBook, setShowBook] = useState(false);
  const [booked,   setBooked]   = useState(false);

  const { bricksCleared, ballsLost, livesRemaining, timeSeconds } = result;

  const coverage   = Math.round((bricksCleared / TOTAL_BRICKS) * 100);
  const livesBonus = Math.round((livesRemaining / MAX_LIVES) * LIVES_BONUS_MAX);
  const finalScore = Math.min(100, Math.round(coverage * COVERAGE_WEIGHT + livesBonus));

  const mm = String(Math.floor(timeSeconds / 60)).padStart(2, '0');
  const ss = String(timeSeconds % 60).padStart(2, '0');

  const scoreColor = finalScore >= SCORE_COLOR_GREEN
    ? NEON_GREEN
    : finalScore >= SCORE_COLOR_ORANGE
      ? '#ffe600'
      : NEON_ACCENT;
  const { title: greenTitle, body: greenBody } = getMessage(finalScore);

  if (booked) {
    return (
      <div
        className="screen-scroll flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center arcade-bg"
        style={{ background: 'linear-gradient(170deg, #0d0024 0%, #1a0040 55%, #0d0024 100%)' }}
      >
        <div className="text-7xl mb-5 pop">🎉</div>
        <h2 className="text-white text-4xl font-extrabold pop">THANK YOU!</h2>
        <h3
          className="font-extrabold text-2xl mt-2 mb-5 pop neon-glow"
          style={{ color: NEON_CYAN, textShadow: `0 0 12px ${NEON_CYAN}, 0 0 30px rgba(0,229,255,0.5)` }}
        >
          {playerName.toUpperCase()}
        </h3>
        <p className="text-sm leading-relaxed mb-10 max-w-xs" style={{ color: '#d8b4fe' }}>
          {THANK_YOU_BODY}
        </p>
        <button
          onClick={onPlayAgain}
          className="px-12 py-4 rounded-full font-extrabold text-white text-base btn-press"
          style={{
            background: `linear-gradient(90deg, ${NEON_ACCENT}, #ff6bb3)`,
            boxShadow: `0 0 18px rgba(255,45,120,0.7), 0 6px 24px rgba(255,45,120,0.4)`,
          }}
        >
          PLAY AGAIN
        </button>
        <p className="text-xs font-semibold mt-10 tracking-widest" style={{ color: 'rgba(192,132,252,0.5)' }}>
          {COMPANY_NAME.toUpperCase()}
        </p>
      </div>
    );
  }

  return (
    <div
      className="screen-scroll arcade-bg"
      style={{ background: 'linear-gradient(180deg, #0d0024 0%, #130033 50%, #0d0024 100%)' }}
    >
      {showBook && (
        <BookSlotModal
          name={playerName}
          mobile={playerMobile}
          onClose={() => setShowBook(false)}
          onBook={() => { setBooked(true); setShowBook(false); }}
        />
      )}

      {/* Header */}
      <div
        className="px-6 pt-7 pb-14"
        style={{ background: 'linear-gradient(135deg, #1a0040 0%, #250060 100%)' }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: 'rgba(192,132,252,0.7)' }}
        >
          {COMPANY_NAME.toUpperCase()}
        </p>
        <h2 className="text-white text-2xl font-extrabold mt-1">Hi {playerName}! 👋</h2>
        <p className="text-sm mt-0.5" style={{ color: '#d8b4fe' }}>Here's your Health Shield Report</p>
      </div>

      {/* Score badge */}
      <div className="flex justify-center -mt-10 mb-4">
        <div
          className="rounded-full flex flex-col items-center justify-center pop"
          style={{
            width: 118,
            height: 118,
            background: '#0d0024',
            border: `5px solid ${scoreColor}`,
            boxShadow: `0 0 24px ${scoreColor}66, 0 8px 32px rgba(0,0,0,0.6)`,
          }}
        >
          <span
            className="font-extrabold text-4xl leading-none neon-glow"
            style={{ color: scoreColor }}
          >
            {finalScore}
          </span>
          <span className="text-xs font-bold" style={{ color: '#c084fc' }}>/ 100</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-2.5 px-4 mb-4">
        {[
          { label: 'TIME TAKEN', value: `${mm}:${ss}` },
          { label: 'BALLS LOST', value: ballsLost       },
          { label: 'COVERAGE',   value: `${coverage}%`  },
        ].map(s => (
          <div
            key={s.label}
            className="flex-1 rounded-2xl p-3 text-center"
            style={{
              background: 'rgba(124,58,237,0.12)',
              border: '1px solid rgba(191,90,242,0.25)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#a78bfa' }}>
              {s.label}
            </p>
            <p className="font-extrabold text-xl mt-0.5" style={{ color: NEON_CYAN }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Green zone */}
      <div
        className="mx-4 mb-3 rounded-2xl p-4"
        style={{
          background: 'rgba(57,255,20,0.06)',
          border: `1.5px solid rgba(57,255,20,0.5)`,
          backdropFilter: 'blur(4px)',
        }}
      >
        <p className="text-[10px] font-extrabold uppercase tracking-wider mb-2" style={{ color: NEON_GREEN }}>
          ✅ Your Health Shield
        </p>
        <p className="text-sm font-bold mb-1" style={{ color: '#a7ffb0' }}>{greenTitle}</p>
        <p className="text-xs leading-relaxed mb-3" style={{ color: '#80e890' }}>{greenBody}</p>
        <div>
          <div className="flex justify-between text-xs font-bold mb-1" style={{ color: NEON_GREEN }}>
            <span>Shield Strength</span><span>{coverage}%</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(57,255,20,0.18)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${coverage}%`, background: NEON_GREEN, boxShadow: `0 0 8px ${NEON_GREEN}` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Red zone */}
      <div
        className="mx-4 mb-3 rounded-2xl p-4"
        style={{
          background: 'rgba(255,45,120,0.06)',
          border: `1.5px solid rgba(255,45,120,0.45)`,
          backdropFilter: 'blur(4px)',
        }}
      >
        <p className="text-[10px] font-extrabold uppercase tracking-wider mb-2" style={{ color: NEON_ACCENT }}>
          🛡️ Protect What Matters
        </p>
        <p className="text-sm font-bold mb-1" style={{ color: '#ffb3cc' }}>{SCORING_TAGLINE}</p>
        <p className="text-xs mb-3" style={{ color: '#ff80a8' }}>{SCORING_CTA_LINE}</p>
        <p className="text-[9px] leading-relaxed" style={{ color: 'rgba(255,130,160,0.7)' }}>
          {DISCLAIMER}
        </p>
      </div>

      {/* Action buttons */}
      <div className="px-4 pb-10 grid grid-cols-2 gap-3 mt-1">
        <button
          className="py-3.5 rounded-2xl font-bold text-sm text-white btn-press"
          style={{ background: '#25D366', boxShadow: '0 4px 12px rgba(37,211,102,0.4)' }}
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: 'Health Shield Score', text: `I scored ${finalScore}/100 on Health Shield by Bajaj Life! Can you beat me?` });
            }
          }}
        >
          📤 Share Score
        </button>
        <a
          href={`tel:${CALL_NOW_NUMBER}`}
          className="py-3.5 rounded-2xl font-bold text-sm text-white text-center flex items-center justify-center btn-press"
          style={{
            background: `linear-gradient(90deg, ${NEON_ACCENT}, #ff6bb3)`,
            boxShadow: '0 4px 12px rgba(255,45,120,0.4)',
          }}
        >
          📞 Call Now
        </a>
        <button
          onClick={() => setShowBook(true)}
          className="col-span-2 py-3.5 rounded-2xl font-extrabold text-white text-sm btn-press"
          style={{
            background: `linear-gradient(90deg, ${NEON_PRIMARY}, #9d4edd)`,
            boxShadow: `0 4px 18px rgba(124,58,237,0.5)`,
          }}
        >
          📅 Book a Slot with Our Expert
        </button>
        <button
          onClick={onPlayAgain}
          className="col-span-2 py-3.5 rounded-2xl font-bold text-sm btn-press"
          style={{
            background: 'rgba(255,255,255,0.05)',
            color: NEON_CYAN,
            border: `2px solid rgba(0,229,255,0.5)`,
            textShadow: `0 0 8px rgba(0,229,255,0.6)`,
          }}
        >
          🔄 Play Again
        </button>
      </div>
    </div>
  );
};

export default ScoringScreen;
