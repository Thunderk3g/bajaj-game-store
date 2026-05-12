import React, { useState } from 'react';
import { GameResult } from '../types';
import {
  BLUE,
  ORANGE,
  MAX_LIVES, TOTAL_BRICKS,
  SCORE_MESSAGES, COVERAGE_WEIGHT, LIVES_BONUS_MAX,
  CALL_NOW_NUMBER, DISCLAIMER,
  SCORING_BG_IMAGE, SCORING_TAGLINE, SCORING_CTA_LINE, THANK_YOU_BODY,
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

  const { bricksCleared, livesRemaining, gainPts, drainPts } = result;
  const coverage = Math.round((bricksCleared / TOTAL_BRICKS) * 100);
  const livesBonus = Math.round((livesRemaining / MAX_LIVES) * LIVES_BONUS_MAX);
  const finalScore = Math.min(100, Math.round(coverage * COVERAGE_WEIGHT + livesBonus));
  const msg = getMessage(finalScore);
  const hasBg = !!SCORING_BG_IMAGE;

  const totalPts = gainPts + drainPts || 1;
  const gainPct = Math.round((gainPts / totalPts) * 100);
  const drainPct = 100 - gainPct;
  const diff = gainPts - drainPts;

  const GAP = 4;
  const gainsDeg = (gainPct / 100) * 360 - GAP;
  const drainsDeg = (drainPct / 100) * 360 - GAP;
  const cx = 50; const cy = 50; const r = 42; const stroke = 9;
  const innerR = r - stroke / 2;
  const gainsEnd = gainsDeg;
  const drainsStart = gainsEnd + GAP;
  const drainsEnd = drainsStart + drainsDeg;

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

  const empPhone = sessionStorage.getItem('gamification_emp_mobile');

  return (
    <div
      className="screen-scroll"
      style={{ position: 'relative', backgroundColor: hasBg ? '#111' : '#EEF2FF', height: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {hasBg && <>
        <div aria-hidden style={{
          position: 'fixed', inset: 0,
          backgroundImage: `url(${SCORING_BG_IMAGE})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'blur(14px)', transform: 'scale(1.1)',
          zIndex: 0, pointerEvents: 'none',
        }} />
        <div aria-hidden style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.72)',
          zIndex: 1, pointerEvents: 'none',
        }} />
      </>}

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', flex: 1 }}>
        {showBook && (
          <BookSlotModal
            name={playerName}
            mobile={playerMobile}
            onClose={() => setShowBook(false)}
            onBook={() => { setBooked(true); setShowBook(false); }}
            result={result}
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
          <h2 className="text-white text-2xl font-extrabold" style={hasBg ? { textShadow: '0 2px 10px rgba(0,0,0,0.6)' } : undefined}>
            Hi {playerName}!
          </h2>
        </div>

        {/* Score card */}
        <div
          className="mx-4 px-4 pt-4 pb-5"
          style={hasBg
            ? { background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', borderRadius: 16 }
            : { background: 'white', borderRadius: 16 }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-3 text-center" style={{ color: hasBg ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}>
            Scoring
          </p>

          {/* 3-widget row: Gainers | Dial | Drainers */}
          <div className="flex items-center gap-2 mb-4">

            {/* Points Gained */}
            <div
              className="flex-1 flex flex-col items-center rounded-2xl px-2 py-3 gap-1"
              style={{ background: 'rgba(7, 7, 7, 0.1)', border: '1px solid rgba(76, 221, 130, 0.97)' }}
            >
              <span className="text-[9px] font-extrabold uppercase tracking-wide text-center leading-tight" style={{ color: 'rgba(76, 221, 130, 0.97)' }}>
                Points{'\n'}Gained
              </span>
              <span className="text-lg font-extrabold leading-none" style={{ color: 'rgba(76, 221, 130, 0.97)' }}>
                +{gainPts.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold" style={{ color: 'rgb(74, 228, 130)' }}>
                {gainPct}%
              </span>
            </div>

            {/* Center dial */}
            <div className="flex flex-col items-center">
              <div style={{ position: 'relative', width: 100, height: 100 }}>
                <svg viewBox="0 0 100 100" width={100} height={100}>
                  <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} />
                  {gainsDeg > 0 && (
                    <path
                      d={arcPath(cx, cy, innerR, 0, gainsEnd)}
                      fill="none" stroke="rgb(74, 228, 130)" strokeWidth={stroke} strokeLinecap="round"
                    />
                  )}
                  {drainsDeg > 0 && (
                    <path
                      d={arcPath(cx, cy, innerR, drainsStart, drainsEnd)}
                      fill="none" stroke="#EF4444" strokeWidth={stroke} strokeLinecap="round"
                    />
                  )}
                </svg>
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 1,
                }}>
                  <span
                    className="text-[10px] font-extrabold leading-none"
                    style={{ color: diff >= 0 ? 'rgb(74, 228, 130)' : '#EF4444' }}
                  >
                    {diff >= 0 ? '+' : ''}{diff.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>net score</span>
                </div>
              </div>
            </div>

            {/* Points Drained */}
            <div
              className="flex-1 flex flex-col items-center rounded-2xl px-2 py-3 gap-1"
              style={{ background: 'rgba(7, 7, 7, 0.1)', border: '1px solid rgb(255, 52, 1)' }}
            >
              <span className="text-[9px] font-extrabold uppercase tracking-wide text-center leading-tight" style={{ color: 'rgb(255, 52, 1)' }}>
                Points{'\n'}Drained
              </span>
              <span className="text-lg font-extrabold leading-none" style={{ color: 'rgb(255, 52, 1)' }}>
                -{drainPts.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold" style={{ color: 'rgb(255, 52, 1)' }}>
                {drainPct}%
              </span>
            </div>
          </div>

          <p className="text-sm font-bold leading-relaxed text-center" style={{ color: hasBg ? 'rgba(255,255,255,0.9)' : '#1f2937' }}>
            {SCORING_TAGLINE}
          </p>
        </div>

        {/* Spacer — pushes action buttons toward vertical center */}
        <div style={{ flex: 1 }} />

        {/* Actions — centered in remaining space */}
        <div className="space-y-6 px-4 pt-0 pb-4">

          <button
            className="btn-press w-full rounded-xl py-3.5 text-sm font-bold text-white"
            style={{ background: '#25D366' }}
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Health Shield Score',
                  text: `I scored ${finalScore}/100 on Health Shield! Can you beat me?`,
                });
              }
            }}
          >
            📤 Share with Friends
          </button>
          <div className="text-center px-4">
            <p className="text-base font-bold leading-tight mb-1" style={{ color: hasBg ? 'white' : '#1e3a8a' }}>
              {SCORING_CTA_LINE.split('?')[0]}?
            </p>
            <p className="text-sm font-semibold leading-relaxed" style={{ color: hasBg ? 'rgba(255,255,255,0.85)' : '#1e3a8a' }}>
              {SCORING_CTA_LINE.split('?').slice(1).join('?').trim()}
            </p>
          </div>
          <div
            className="rounded-2xl p-4"
            style={{ background: hasBg ? 'rgba(30,58,138,0.75)' : '#1e3a8a' }}
          >
            {empPhone && (
              <a
                href={`tel:${empPhone}`}
                className="flex items-center justify-center w-full py-3 rounded-xl font-bold text-white text-sm mb-3 btn-press"
                style={{ background: ORANGE }}
              >
                📞 Call now
              </a>
            )}
            <button
              onClick={() => setShowBook(true)}
              className="w-full py-3 rounded-xl font-extrabold text-white text-sm btn-press"
              style={{ background: '#0D9488' }}
            >
              📅 Book a Slot
            </button>
          </div>

          <button
            onClick={onPlayAgain}
            className="w-full py-3.5 rounded-xl font-bold text-sm btn-press"
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
