import React, { useState } from 'react';
import { GameResult } from '../types';
import imgCoinSrc   from '../src/assets/coin_savings.png';
import imgShieldSrc from '../src/assets/powerup_shield.png';
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

  const { portfolio, gains, losses, distance, coinsCollected, obstaclesDodged, timeSeconds, livesRemaining, shieldsUsed } = result;
  const finalScore = Math.min(100, Math.max(0, Math.round((portfolio / TARGET_PORTFOLIO) * 100)));
  const msg = SCORE_MESSAGES.find(m => finalScore >= m.minScore) ?? SCORE_MESSAGES[SCORE_MESSAGES.length - 1];
  const hasBg = !!SCORING_BG_IMAGE;

  const totalPts = gains + losses || 1;
  const gainPct  = Math.round((gains / totalPts) * 100);
  const drainPct = 100 - gainPct;

  const GAP = 4;
  const gainsDeg  = (gainPct  / 100) * 360 - GAP;
  const drainsDeg = (drainPct / 100) * 360 - GAP;
  const cx = 50; const cy = 50; const r = 42; const stroke = 9;
  const innerR = r - stroke / 2;
  const gainsEnd    = gainsDeg;
  const drainsStart = gainsEnd + GAP;
  const drainsEnd   = drainsStart + drainsDeg;

  const scoreColor  = finalScore >= 70 ? '#22C55E' : finalScore >= 40 ? '#F97316' : '#EF4444';
  const distPct     = Math.min(100, Math.round((distance / TARGET_DISTANCE) * 100));
  const mins        = Math.floor(timeSeconds / 60);
  const secs        = timeSeconds % 60;
  const timeStr     = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Future Sprint Score',
        text: `I ran ${distance}m and scored ${finalScore}/100 in Future Sprint! Can you beat me?`,
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
      style={{ position: 'relative', backgroundColor: '#0f172a', height: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {hasBg && (
        <>
          <div aria-hidden style={{ position:'fixed', inset:0, backgroundImage:`url(${SCORING_BG_IMAGE})`, backgroundSize:'cover', backgroundPosition:'center', filter:'blur(14px)', transform:'scale(1.1)', zIndex:0, pointerEvents:'none' }} />
          <div aria-hidden style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.72)', zIndex:1, pointerEvents:'none' }} />
        </>
      )}

      <div style={{ position:'relative', zIndex:2, display:'flex', flexDirection:'column', flex:1 }}>
        {showBook && (
          <BookSlotModal
            name={playerName}
            mobile={playerMobile}
            onClose={() => setShowBook(false)}
            onBook={() => { setBooked(true); setShowBook(false); }}
          />
        )}

        {/* Header */}
        <div className="px-6 pb-4 text-center"
          style={{ paddingTop:'max(1.75rem, env(safe-area-inset-top))', background:'linear-gradient(135deg,#003DA6,#172554)' }}>
          <h2 className="text-2xl font-extrabold text-white">
            Hi {playerName}!
          </h2>
        </div>

        {/* Score Card Section */}
        <div className="mx-4 px-4 pt-4 pb-5"
          style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:16 }}>

          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-center"
            style={{ color: 'rgba(200,210,240,0.8)' }}>
            Your Sprint Results
          </p>

          {/* 3-widget row: Savings | Dial | Lives */}
          <div className="flex items-center gap-2 mb-3">

            {/* Savings Secured */}
            <div className="flex-1 flex flex-col items-center rounded-2xl px-2 py-3 gap-1"
              style={{ background:'rgba(7,7,7,0.1)', border:'1px solid rgba(76,221,130,0.97)' }}>
              <span className="text-[9px] font-extrabold uppercase tracking-wide text-center leading-tight"
                style={{ color:'rgba(76,221,130,0.97)' }}>Savings{'\n'}Secured</span>
              <span className="text-xl font-extrabold leading-none" style={{ color:'rgba(76,221,130,0.97)' }}>
                {coinsCollected}
              </span>
              <img src={imgCoinSrc} alt="coin" className="w-6 h-6 object-contain" />
            </div>

            {/* Score dial */}
            <div className="flex flex-col items-center">
              <div style={{ position:'relative', width:100, height:100 }}>
                <svg viewBox="0 0 100 100" width={100} height={100}>
                  <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} />
                  {gainsDeg > 0 && (
                    <path d={arcPath(cx,cy,innerR,0,gainsEnd)} fill="none" stroke="rgb(74,228,130)" strokeWidth={stroke} strokeLinecap="round" />
                  )}
                  {drainsDeg > 0 && (
                    <path d={arcPath(cx,cy,innerR,drainsStart,drainsEnd)} fill="none" stroke="#EF4444" strokeWidth={stroke} strokeLinecap="round" />
                  )}
                </svg>
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2 }}>
                  <span className="text-[1.5rem] font-extrabold leading-none" style={{ color: scoreColor }}>
                    {finalScore}
                  </span>
                  <span className="text-[0.55rem] font-bold uppercase tracking-wide" style={{ color:'rgba(255,255,255,0.6)' }}>
                    / 100
                  </span>
                  <span className="text-[0.52rem] font-bold" style={{ color:'rgba(255,255,255,0.9)' }}>score</span>
                </div>
              </div>
            </div>

            {/* Lives Remaining */}
            <div className="flex-1 flex flex-col items-center rounded-2xl px-2 py-3 gap-1"
              style={{ background:'rgba(7,7,7,0.1)', border:'1px solid rgba(255,52,1,0.7)' }}>
              <span className="text-[9px] font-extrabold uppercase tracking-wide text-center leading-tight"
                style={{ color:'rgb(255,100,80)' }}>Lives{'\n'}Remaining</span>
              <span className="text-xl font-extrabold leading-none" style={{ color:'rgb(255,100,80)' }}>
                {livesRemaining}
              </span>
              <img src={imgShieldSrc} alt="shield" className="w-6 h-6 object-contain" style={{filter:'drop-shadow(0 0 4px rgba(255,100,80,0.6))'}} />
            </div>
          </div>

          {/* Distance bar */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[0.65rem] font-bold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Distance Run
              </span>
              <span className="text-[0.65rem] font-extrabold" style={{ color: 'white' }}>
                {distance}m / {TARGET_DISTANCE}m
              </span>
            </div>
            <div className="h-2 rounded-full" style={{ background:'rgba(255,255,255,0.15)' }}>
              <div className="h-2 rounded-full transition-all" style={{ width:`${distPct}%`, background:'linear-gradient(90deg,#34D399,#059669)' }} />
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label:'Obstacles\nDodged', value: obstaclesDodged, icon:<span className="text-base mb-0.5">🏃</span>, color:'#34D399' },
              { label:'Time\nSurvived',    value: timeStr,         icon:<span className="text-base mb-0.5">⏱</span>,  color:'#60A5FA' },
              { label:'Shields\nUsed',     value: shieldsUsed,     icon:<img src={imgShieldSrc} alt="shield" className="w-6 h-6 object-contain mb-0.5" />, color:'#A78BFA' },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center rounded-xl py-2 px-1"
                style={{ background:'rgba(0,0,0,0.15)', border:`1px solid ${s.color}33` }}>
                {s.icon}
                <span className="text-sm font-extrabold leading-none" style={{ color: s.color }}>{s.value}</span>
                <span className="text-[0.52rem] text-center leading-tight mt-0.5"
                  style={{ color:'rgba(255,255,255,0.55)', whiteSpace:'pre-line' }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Score message */}
          <div className="rounded-xl px-3 py-2.5 mb-3" style={{ background:'rgba(0,0,0,0.2)', border:'1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-[0.7rem] font-extrabold text-yellow-300 mb-0.5">{msg.title}</p>
            <p className="text-[0.65rem] leading-relaxed" style={{ color:'rgba(255,255,255,0.8)' }}>{msg.body}</p>
          </div>

          <p className="text-sm font-bold leading-relaxed text-center"
            style={{ color: 'rgba(255,255,255,0.9)' }}>
            {SCORING_TAGLINE}
          </p>
        </div>

        <div style={{ flex:1 }} />

        {/* Action buttons */}
        <div className="space-y-3 px-4 py-4">
          <button className="btn-press w-full rounded-xl py-3.5 text-sm font-bold text-white" style={{ background:'#25D366' }} onClick={handleShare}>
            📤 Share
          </button>
          <p className="text-sm font-semibold leading-relaxed text-center" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {SCORING_CTA_LINE}
          </p>
          <div className="rounded-2xl p-4" style={{ background: 'rgba(30,58,138,0.75)' }}>
            <a href={`tel:${CALL_NOW_NUMBER}`}
              className="btn-press mb-3 flex w-full items-center justify-center rounded-xl py-3 text-sm font-bold text-white"
              style={{ background: ORANGE }}>
              📞 Call now
            </a>
            <button onClick={() => setShowBook(true)}
              className="btn-press w-full rounded-xl py-3 text-sm font-extrabold text-white"
              style={{ background:'#0D9488' }}>
              📅 Book a Slot
            </button>
          </div>
          <button onClick={onPlayAgain}
            className="btn-press w-full rounded-xl py-3.5 text-sm font-bold"
            style={{ color:'white', border:'2px solid rgba(255,255,255,0.35)', background:'rgba(255,255,255,0.1)' }}>
            ▶ Play Again
          </button>
        </div>

        <div style={{ flex:1 }} />

        <p className="px-4 text-[9px] leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.4)', paddingBottom:'max(2rem, env(safe-area-inset-bottom))' }}>
          DISCLAIMER: {DISCLAIMER}
        </p>
      </div>
    </div>
  );
};

export default ScoringScreen;
