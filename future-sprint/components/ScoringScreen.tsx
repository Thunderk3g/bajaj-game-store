import React, { useState, useEffect } from 'react';
import { buildShareUrl } from '../utils/crypto';
import { shortenUrl } from '../utils/shortener';
import { GameResult } from '../types';
import imgCoinSrc from '../src/assets/coin_savings.png';

import imgChildF1Src from '../src/assets/child_runner_f1.png';
import imgChildF2Src from '../src/assets/child_runner_f2.png';
import imgChildF3Src from '../src/assets/child_runner_f3.png';
import imgChildF4Src from '../src/assets/child_runner_f4.png';
import imgChildF5Src from '../src/assets/child_runner_f5.png';
import imgChildF6Src from '../src/assets/child_runner_f6.png';
import imgChildF7Src from '../src/assets/child_runner_f7.png';
import imgChildF8Src from '../src/assets/child_runner_f8.png';

const runnerFrames = [
  imgChildF1Src,
  imgChildF2Src,
  imgChildF3Src,
  imgChildF4Src,
  imgChildF5Src,
  imgChildF6Src,
  imgChildF7Src,
  imgChildF8Src,
];
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
  TARGET_DISTANCE,
} from '../constants';
import BookSlotModal from './BookSlotModal';

interface Props {
  result: GameResult;
  playerName: string;
  playerMobile: string;
  onPlayAgain: () => void;
}

// Removed unused arcPath helper

const ScoringScreen: React.FC<Props> = ({ result, playerName, playerMobile, onPlayAgain }) => {
  const [showBook, setShowBook] = useState(false);
  const [booked, setBooked] = useState(false);
  const [frameIdx, setFrameIdx] = useState(1);
  const [currentProgress, setCurrentProgress] = useState(0);

  const empPhone = sessionStorage.getItem('gamification_emp_mobile');

  const { portfolio, gains, losses, distance, coinsCollected, obstaclesDodged, timeSeconds, livesRemaining, shieldsUsed } = result;
  const targetPct = Math.min(100, Math.round((distance / TARGET_DISTANCE) * 100));

  useEffect(() => {
    // Start sliding after mounting
    const slideTimer = setTimeout(() => {
      setCurrentProgress(targetPct);
    }, 150);
    return () => clearTimeout(slideTimer);
  }, [targetPct]);

  useEffect(() => {
    // Character keeps running indefinitely to look good
    const timer = setInterval(() => {
      setFrameIdx(f => (f % 8) + 1);
    }, 90);
    return () => clearInterval(timer);
  }, []);
  const finalScore = Math.min(100, Math.max(0, Math.round((portfolio / TARGET_PORTFOLIO) * 100)));
  const msg = SCORE_MESSAGES.find(m => finalScore >= m.minScore) ?? SCORE_MESSAGES[SCORE_MESSAGES.length - 1];
  const hasBg = !!SCORING_BG_IMAGE;

  // Removed unused score dial geometry and colors
  const distPct = Math.min(100, Math.round((distance / TARGET_DISTANCE) * 100));
  const mins = Math.floor(timeSeconds / 60);
  const secs = timeSeconds % 60;
  const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  let feedbackText = '';
  if (distPct < 30) {
    feedbackText = "You missed your milestone but you can do better!";
  } else if (distPct < 60) {
    feedbackText = "Decent Progress! You are close to your Milestone!";
  } else {
    feedbackText = "Wow! you have excelled in this game. Now repeat the same in real life";
  }

  const handleShare = async () => {
    try {
      const rawUrl = buildShareUrl() || window.location.href;
      const shareUrl = await shortenUrl(rawUrl) || rawUrl;
      const shareText = `Hi,
I survived this game and scored ${distPct}%. Try to dodge all the hurdles in the path and check your score. Play now: ${shareUrl}
Regards,
${playerName}`;

      const shareData: any = {
        title: 'Future Sprint Score',
        text: shareText,
      };

      // Try to include thumbnail
      if (SCORING_BG_IMAGE) {
        try {
          const imgUrl = new URL(SCORING_BG_IMAGE, import.meta.url).href;
          const res = await fetch(imgUrl);
          const blob = await res.blob();
          const file = new File([blob], 'future-sprint-thumbnail.png', { type: blob.type });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            shareData.files = [file];
          }
        } catch (e) {
          console.warn('[Share] Failed to fetch thumbnail', e);
        }
      }

      if (navigator.share) {
        await navigator.share(shareData);
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
      style={{ position: 'relative', backgroundColor: '#0f172a', height: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {hasBg && (
        <>
          <div aria-hidden style={{ position: 'fixed', inset: 0, backgroundImage: `url(${SCORING_BG_IMAGE})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(14px)', transform: 'scale(1.1)', zIndex: 0, pointerEvents: 'none' }} />
          <div aria-hidden style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', zIndex: 1, pointerEvents: 'none' }} />
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

        {/* Header */}
        <div className="px-6 pb-4 text-center"
          style={{ paddingTop: 'max(1.75rem, env(safe-area-inset-top))' }}>
          <h2 className="text-2xl font-extrabold text-white">
            Hi {playerName}!
          </h2>
        </div>

        {/* Score Card Section */}
        <div className="mx-4 px-4 pt-4 pb-5"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 }}>

          {/* Prominent Distance Display */}
          <div className="flex flex-col items-center justify-center my-4">
            <span className="text-xs font-bold tracking-widest uppercase text-cyan-400">
              Your Score
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-5xl font-black tracking-tight text-yellow-300" style={{ filter: 'drop-shadow(0 2px 12px rgba(253,224,71,0.65))' }}>
                {distPct}%
              </span>
            </div>
          </div>

          {/* Premium Interactive Animated Runner Track Arena */}
          <div className="relative flex items-center h-28 my-4 overflow-hidden rounded-2xl shadow-inner"
            style={{ background: 'linear-gradient(to bottom, rgba(15,23,42,0.85), rgba(30,41,59,0.95))' }}>

            {/* Embedded Inline CSS for Bobbing, Track Scrolling, and Floating animations */}
            <style>{`
              @keyframes trackScroll {
                0% { background-position-x: 0px; }
                100% { background-position-x: -30px; }
              }
              @keyframes charBob {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-4px); }
              }
              @keyframes floatGentle {
                0%, 100% { transform: translate(-50%, 0px); }
                50% { transform: translate(-50%, -3px); }
              }
            `}</style>

            {/* Glowing neon aura behind starting area */}
            <div className="absolute w-32 h-32 rounded-full bg-blue-500/10 blur-2xl left-[10%] bottom-0 pointer-events-none" />

            {/* Horizontal progress track line (grey backdrop) */}
            <div className="absolute left-[10%] right-[10%] bottom-[32px] h-2 bg-white/10 rounded-full" />

            {/* Horizontal active highlight path (dynamic color gradient filled behind runner) */}
            <div className="absolute left-[10%] bottom-[32px] h-2 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
              style={{
                width: `${currentProgress * 0.8}%`, // Since track spans 80% of width (from 10% to 90%)
                transition: 'width 2s cubic-bezier(0.25, 1, 0.25, 1)'
              }}
            />

            {/* Start Line Marker Flag */}
            <div className="absolute left-[10%] bottom-[44px] flex flex-col items-center">
              <span className="text-[9px] font-bold text-white/55">Start</span>
              <div className="w-[1px] h-3 bg-white/20 mt-1" />
            </div>

            {/* Finish/Goal Marker Flag */}
            <div className="absolute right-[10%] bottom-[44px] flex flex-col items-center">
              <span className="text-[9px] font-black text-emerald-400 flex items-center gap-0.5">
                🏁 {TARGET_DISTANCE}m
              </span>
              <div className="w-[1px] h-3 bg-emerald-500/30 mt-1" />
            </div>

            {/* Runner Container sliding horizontally along track */}
            <div className="absolute bottom-[36px]"
              style={{
                left: `calc(10% + ${currentProgress * 0.8}%)`,
                transform: 'translateX(-50%)',
                transition: 'left 2s cubic-bezier(0.25, 1, 0.25, 1)',
                zIndex: 10,
              }}
            >
              {/* Floating Distance Badge directly above runner (lowered and floating gently to prevent clipping) */}
              <div className="absolute left-1/2 bg-yellow-400 text-slate-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-lg flex items-center justify-center whitespace-nowrap"
                style={{
                  bottom: '38px',
                  transform: 'translateX(-50%)',
                  animation: 'floatGentle 2s ease-in-out infinite',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }}>
                {distance}m
              </div>

              <img
                src={runnerFrames[frameIdx - 1]}
                alt="Running character"
                className="w-11 h-13 object-contain"
                style={{
                  animation: 'charBob 0.4s ease-in-out infinite',
                  filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))'
                }}
              />
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-4 mb-4 justify-items-center">
            {[
              { label: 'Obstacles\nDodged', value: obstaclesDodged, color: '#34D399' },
              { label: 'Time\nSurvived', value: timeStr, color: '#60A5FA' },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center justify-center rounded-full aspect-square w-24 h-24"
                style={{ background: 'rgba(0,0,0,0.25)', border: `2.5px solid ${s.color}dd`, boxShadow: `0 0 12px ${s.color}44` }}>
                <span className="text-xl font-black leading-tight" style={{ color: s.color }}>{s.value}</span>
                <span className="text-[0.6rem] font-extrabold text-center uppercase tracking-wide leading-tight mt-1"
                  style={{ color: 'rgba(255,255,255,0.78)', whiteSpace: 'pre-line' }}>{s.label}</span>
              </div>
            ))}
          </div>

          <p className="text-sm font-bold leading-relaxed text-center"
            style={{ color: 'rgba(255,255,255,0.9)' }}>
            {feedbackText}
          </p>
        </div>

        <div style={{ flex: 1 }} />

        {/* Action buttons */}
        <div className="space-y-3 px-4 py-4">
          <button className="btn-press w-full rounded-xl py-3.5 text-sm font-bold text-white" style={{ background: '#25D366' }} onClick={handleShare}>
            Share
          </button>
          <p className="text-sm font-semibold leading-relaxed text-center" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {SCORING_CTA_LINE}
          </p>
          <div className="rounded-2xl p-4" style={{ background: 'rgba(30,58,138,0.75)' }}>
            {empPhone && (
              <a href={`tel:${empPhone}`}
                className="btn-press mb-3 flex w-full items-center justify-center rounded-xl py-3 text-sm font-bold text-white"
                style={{ background: ORANGE }}>
                Call now
              </a>
            )}
            <button onClick={() => setShowBook(true)}
              className="btn-press w-full rounded-xl py-3 text-sm font-extrabold text-white"
              style={{ background: '#0D9488' }}>
              Book a Slot
            </button>
          </div>
          <button onClick={onPlayAgain}
            className="btn-press w-full rounded-xl py-3.5 text-sm font-bold"
            style={{ color: 'white', border: '2px solid rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.1)' }}>
            Play Again
          </button>
        </div>

        <div style={{ flex: 1 }} />

        <p className="px-4 text-[9px] leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.4)', paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
          DISCLAIMER: {DISCLAIMER}
        </p>
      </div>
    </div>
  );
};

export default ScoringScreen;
