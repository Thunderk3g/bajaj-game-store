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
  RELATIONSHIP_MANAGER_LINE,
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

  const { portfolio, gains, losses } = result;
  const finalScore = Math.min(100, Math.max(0, Math.round((portfolio / TARGET_PORTFOLIO) * 100)));
  const msg = SCORE_MESSAGES.find(m => finalScore >= m.minScore) ?? SCORE_MESSAGES[SCORE_MESSAGES.length - 1];
  const hasBg = !!SCORING_BG_IMAGE;

  const totalPts = gains + losses || 1;
  const gainPct = Math.round((gains / totalPts) * 100);
  const drainPct = 100 - gainPct;
  const diff = gains - losses;

  const GAP = 4;
  const gainsDeg = (gainPct / 100) * 360 - GAP;
  const drainsDeg = (drainPct / 100) * 360 - GAP;
  const cx = 50; const cy = 50; const r = 42; const stroke = 9;
  const innerR = r - stroke / 2;
  const gainsEnd = gainsDeg;
  const drainsStart = gainsEnd + GAP;
  const drainsEnd = drainsStart + drainsDeg;

  const scoreColor = finalScore >= 70 ? '#22C55E' : finalScore >= 40 ? '#F97316' : '#EF4444';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Wealth Whacker Score',
        text: `I scored ${finalScore}/100 in Wealth Whacker! Can you beat me?`,
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
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1, pointerEvents: 'none' }}
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
          <p
            className="mt-1 text-base font-semibold"
            style={{ color: hasBg ? 'rgba(255,255,255,0.85)' : '#bfdbfe', textShadow: hasBg ? '0 1px 6px rgba(0,0,0,0.5)' : undefined }}
          >
            {msg.title}
          </p>
        </div>

        {/* Score card */}
        <div
          className="mx-4 px-4 pt-4 pb-5"
          style={hasBg
            ? { background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', borderRadius: 16 }
            : { background: 'white', borderRadius: 16 }}
        >
          <p
            className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-center"
            style={{ color: hasBg ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}
          >
            Scoring
          </p>

          {/* 3-widget row: Gainers | Dial | Drainers */}
          <div className="flex items-center gap-2 mb-4">

            {/* Wealth Gainers */}
            <div
              className="flex-1 flex flex-col items-center rounded-2xl px-2 py-3 gap-1"
              style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.35)' }}
            >
              <span className="text-[9px] font-extrabold uppercase tracking-wide text-center leading-tight" style={{ color: '#22C55E' }}>
                Points{'\n'}Gained
              </span>
              <span className="text-lg font-extrabold leading-none" style={{ color: '#22C55E' }}>
                +₹{gains.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] font-bold" style={{ color: 'rgba(34,197,94,0.75)' }}>
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
                      fill="none" stroke="#22C55E" strokeWidth={stroke} strokeLinecap="round"
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
                    style={{ color: diff >= 0 ? '#22C55E' : '#EF4444' }}
                  >
                    {diff >= 0 ? '+' : ''}₹{Math.abs(diff).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[8px] font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>net</span>
                  <span
                    className="text-[10px] font-extrabold leading-none"
                    style={{ color: scoreColor }}
                  >
                    {finalScore}%
                  </span>
                </div>
              </div>
            </div>

            {/* Wealth Drainers */}
            <div
              className="flex-1 flex flex-col items-center rounded-2xl px-2 py-3 gap-1"
              style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.35)' }}
            >
              <span className="text-[9px] font-extrabold uppercase tracking-wide text-center leading-tight" style={{ color: '#EF4444' }}>
                Points{'\n'}Drained
              </span>
              <span className="text-lg font-extrabold leading-none" style={{ color: '#EF4444' }}>
                -₹{losses.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] font-bold" style={{ color: 'rgba(239,68,68,0.75)' }}>
                {drainPct}%
              </span>
            </div>
          </div>

          <p
            className="text-lg font-bold leading-relaxed text-center"
            style={{ color: hasBg ? 'rgba(255,255,255,0.9)' : '#1f2937' }}
          >
            {SCORING_TAGLINE}
          </p>
        </div>


        {/* Equal spacer above Share button */}
        <div style={{ flex: 1 }} />

        {/* Share + RM line — centered between score card and call/book section */}
        <div className="px-4 space-y-2">
          <button
            className="btn-press w-full rounded-xl py-3.5 text-sm font-bold text-white"
            style={{ background: '#25D366' }}
            onClick={handleShare}
          >
            📤 Share
          </button>

          <p className="text-base font-semibold leading-relaxed text-center px-2" style={{ color: hasBg ? 'rgba(255,255,255,0.85)' : '#1e3a8a' }}>
            {RELATIONSHIP_MANAGER_LINE}
          </p>
        </div>

        {/* Equal spacer below Share + RM (mirrors spacer above) */}
        <div style={{ flex: 1 }} />

        {/* Call now / Book a Slot / Play Again */}
        <div className="space-y-3 px-4 pb-4">
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
