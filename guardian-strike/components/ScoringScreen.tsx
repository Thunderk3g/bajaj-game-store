import React, { useState } from 'react';
import { buildShareUrl } from '../utils/crypto';
import { shortenUrl } from '../utils/shortener';
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
  TOTAL_WAVES,
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

  const empPhone = sessionStorage.getItem('gamification_emp_mobile');

  const { portfolio, gains, losses } = result;
  const enemiesKilled = result.molesWhacked;
  const totalEnemies = TOTAL_WAVES * 15;
  const finalScore = Math.min(100, Math.max(0, Math.round((enemiesKilled / totalEnemies) * 100)));
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

  let dynamicTagline = '';
  if (finalScore <= 30) {
    dynamicTagline = "Oops! You could not protect yourself from threats. Try again!";
  } else if (finalScore <= 60) {
    dynamicTagline = "Well Played! You managed to protect yourself from some threats, but you can do better.";
  } else {
    dynamicTagline = "Awesome! You defended your ship well!";
  }

  const dynamicCtaLine = "To build  a strong shield for your family's protection in real-life, connect with our relationship manager now!";

  const handleShare = async () => {
    try {
      const rawUrl = buildShareUrl() || window.location.href;
      const shareUrl = await shortenUrl(rawUrl) || rawUrl;
      const shareText = `Hi,
I just played Guardian Strike and loved it. My score is ${finalScore}%.
Can you beat me? Play now: ${shareUrl}

${playerName}`;

      if (navigator.share) {
        await navigator.share({
          title: 'Guardian Strike Score',
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        alert('Share text copied to clipboard!');
      }
    } catch (err) {
      console.error('[Share] Error:', err);
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
            ? { background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', borderRadius: 16 }
            : { background: 'white', borderRadius: 16 }}
        >
          <p
            className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-center"
            style={{ color: hasBg ? 'rgba(200, 230, 255, 0.9)' : '#9ca3af' }}
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
          {/* Clean 3-column stats row for gameplay metrics */}
          <div className="flex gap-2.5 mb-4">
            <div className="flex-1 rounded-xl p-2.5 text-center" style={{ background: 'rgba(0,0,0,0.22)' }}>
              <div className="text-[0.62rem] font-bold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.5)' }}>Enemies Down</div>
              <div className="text-[1.05rem] font-extrabold text-white">
                {enemiesKilled} <span className="text-[0.75rem] text-white/40">/ {totalEnemies}</span>
              </div>
            </div>
            <div className="flex-1 rounded-xl p-2.5 text-center" style={{ background: 'rgba(0,0,0,0.22)' }}>
              <div className="text-[0.62rem] font-bold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.5)' }}>Lives Left</div>
              <div className="text-[1.05rem] font-extrabold text-white">
                {3 - result.badWhacks} <span className="text-[0.75rem] text-white/40">/ 3</span>
              </div>
            </div>
            <div className="flex-1 rounded-xl p-2.5 text-center" style={{ background: 'rgba(0,0,0,0.22)' }}>
              <div className="text-[0.62rem] font-bold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.5)' }}>Time Taken</div>
              <div className="text-[1.05rem] font-extrabold text-white">
                {result.timeSeconds}s
              </div>
            </div>
          </div>

          <p
            className="text-sm font-bold leading-relaxed text-center"
            style={{ color: hasBg ? 'rgba(200,230,255,0.9)' : '#1f2937' }}
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
            {empPhone && (
              <a
                href={`tel:${empPhone}`}
                className="btn-press mb-3 flex w-full items-center justify-center rounded-xl py-3 text-sm font-bold text-white"
                style={{ background: ORANGE }}
              >
                📞 Call now
              </a>
            )}
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
