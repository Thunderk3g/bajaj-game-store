import React, { useState } from 'react';
import { GameResult } from '../types';
import {
  BLUE, CALL_NOW_NUMBER, DISCLAIMER, ORANGE, SCORE_MESSAGES,
  SCORING_BG_IMAGE, THANK_YOU_BODY,
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
  const [booked,   setBooked]   = useState(false);

  const { score, cellsRevealed, totalSafe, minesFound, totalMines, timeSeconds, won } = result;
  const finalScore = Math.min(100, Math.max(0, score));
  const msg = SCORE_MESSAGES.find(m => finalScore >= m.minScore) ?? SCORE_MESSAGES[SCORE_MESSAGES.length - 1];
  const hasBg = !!SCORING_BG_IMAGE;

  const coverPct  = totalSafe > 0 ? Math.round((cellsRevealed / totalSafe) * 100) : 0;
  const flagPct   = totalMines > 0 ? Math.round((minesFound / totalMines) * 100) : 0;
  const mm = String(Math.floor(timeSeconds / 60)).padStart(2, '0');
  const ss = String(timeSeconds % 60).padStart(2, '0');

  const GAP = 4;
  const coverDeg = (coverPct / 100) * 360 - GAP;
  const riskDeg  = ((100 - coverPct) / 100) * 360 - GAP;
  const cx = 50; const cy = 50; const r = 42; const stroke = 9;
  const innerR = r - stroke / 2;
  const coverEnd   = Math.max(0, coverDeg);
  const riskStart  = coverEnd + GAP;
  const riskEnd    = riskStart + Math.max(0, riskDeg);
  const scoreColor = finalScore >= 70 ? '#22C55E' : finalScore >= 40 ? '#F97316' : '#EF4444';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Legacy Sweep', text: `I scored ${finalScore}/100 in Legacy Sweep! Can you beat me?` });
    }
  };

  if (booked) {
    return (
      <div className="screen-scroll flex min-h-full flex-col items-center justify-center px-[6vw] py-[6vh] text-center" style={{ background: BLUE }}>
        <h2 className="pop text-[clamp(2.4rem,12vw,4rem)] font-extrabold text-white">THANK YOU!</h2>
        <h3 className="pop mb-[1.2rem] mt-[0.6rem] text-[clamp(1.4rem,7vw,2rem)] font-extrabold" style={{ color: ORANGE }}>
          {playerName.toUpperCase()}
        </h3>
        <p className="mb-[2.4rem] max-w-[21rem] text-[0.95rem] leading-relaxed text-blue-100">{THANK_YOU_BODY}</p>
        <button onClick={onPlayAgain} className="btn-press rounded-full px-[3rem] py-[1rem] text-[1rem] font-extrabold text-white" style={{ background: ORANGE }}>
          PLAY AGAIN
        </button>
      </div>
    );
  }

  return (
    <div className="screen-scroll" style={{ position: 'relative', backgroundColor: hasBg ? '#111' : '#0f1f3d', height: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {hasBg && (
        <>
          <div aria-hidden style={{ position: 'fixed', inset: 0, backgroundImage: `url(${SCORING_BG_IMAGE})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(14px)', transform: 'scale(1.1)', zIndex: 0, pointerEvents: 'none' }} />
          <div aria-hidden style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', zIndex: 1, pointerEvents: 'none' }} />
        </>
      )}

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', flex: 1 }}>
        {showBook && (
          <BookSlotModal name={playerName} mobile={playerMobile} onClose={() => setShowBook(false)} onBook={() => { setBooked(true); setShowBook(false); }} />
        )}

        {/* Header */}
        <div className="px-6 pb-6 text-center" style={{ paddingTop: 'max(1.75rem, env(safe-area-inset-top))', ...(hasBg ? {} : { background: 'linear-gradient(135deg,#1a2744,#172554)' }) }}>
          <h2 className="text-2xl font-extrabold text-white" style={hasBg ? { textShadow: '0 2px 10px rgba(0,0,0,0.6)' } : undefined}>
            Hi {playerName}!
          </h2>
          <p className="mt-1 text-sm font-semibold" style={{ color: won ? '#86EFAC' : '#FCA5A5' }}>
            {won ? '🏆 Full Coverage Achieved!' : '⚠️ Risk Encountered'}
          </p>
        </div>

        {/* Score Card Section */}
        <div className="mx-4 px-4 pt-4 pb-5" style={hasBg ? { background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', borderRadius: 16 } : { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 }}>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-center" style={{ color: 'rgba(200,200,200,0.7)' }}>Your Results</p>

          {/* 3-widget row */}
          <div className="flex items-center gap-2 mb-4">
            {/* Cells Revealed */}
            <div className="flex-1 flex flex-col items-center rounded-2xl px-2 py-3 gap-1" style={{ background: 'rgba(7,7,7,0.1)', border: '1px solid rgba(76,221,130,0.97)' }}>
              <span className="text-[9px] font-extrabold uppercase tracking-wide text-center leading-tight" style={{ color: 'rgba(76,221,130,0.97)' }}>Coverage{'\n'}Unlocked</span>
              <span className="text-lg font-extrabold leading-none" style={{ color: 'rgba(76,221,130,0.97)' }}>{cellsRevealed}/{totalSafe}</span>
              <span className="text-[10px] font-bold" style={{ color: 'rgb(74,228,130)' }}>{coverPct}%</span>
            </div>

            {/* Center dial */}
            <div className="flex flex-col items-center">
              <div style={{ position: 'relative', width: 100, height: 100 }}>
                <svg viewBox="0 0 100 100" width={100} height={100}>
                  <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} />
                  {coverEnd > 0 && <path d={arcPath(cx, cy, innerR, 0, coverEnd)} fill="none" stroke="rgb(74,228,130)" strokeWidth={stroke} strokeLinecap="round" />}
                  {riskDeg  > 0 && <path d={arcPath(cx, cy, innerR, riskStart, riskEnd)} fill="none" stroke="#EF4444" strokeWidth={stroke} strokeLinecap="round" />}
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <span className="text-[11px] font-extrabold leading-none" style={{ color: scoreColor }}>{finalScore}</span>
                  <span className="text-[9px] font-bold" style={{ color: 'rgba(255,255,255,0.75)' }}>/ 100</span>
                  <span className="text-[8px] font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>score</span>
                </div>
              </div>
              <span className="mt-1 text-[9px] font-extrabold uppercase tracking-wide" style={{ color: scoreColor }}>{msg.title}</span>
            </div>

            {/* Time & Flags */}
            <div className="flex-1 flex flex-col items-center rounded-2xl px-2 py-3 gap-1" style={{ background: 'rgba(7,7,7,0.1)', border: '1px solid rgba(248,113,113,0.8)' }}>
              <span className="text-[9px] font-extrabold uppercase tracking-wide text-center leading-tight" style={{ color: 'rgba(248,113,113,0.9)' }}>Risks{'\n'}Flagged</span>
              <span className="text-lg font-extrabold leading-none" style={{ color: 'rgba(248,113,113,0.9)' }}>{minesFound}/{totalMines}</span>
              <span className="text-[10px] font-bold" style={{ color: '#F87171' }}>{flagPct}%</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 rounded-xl p-2 text-center" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <div className="text-[0.65rem] font-bold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.5)' }}>Time</div>
              <div className="text-[1rem] font-extrabold text-white">{mm}:{ss}</div>
            </div>
            <div className="flex-1 rounded-xl p-2 text-center" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <div className="text-[0.65rem] font-bold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.5)' }}>Result</div>
              <div className="text-[1rem] font-extrabold" style={{ color: won ? '#86EFAC' : '#FCA5A5' }}>{won ? 'WIN' : 'LOSS'}</div>
            </div>
            <div className="flex-1 rounded-xl p-2 text-center" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <div className="text-[0.65rem] font-bold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.5)' }}>Points</div>
              <div className="text-[1rem] font-extrabold" style={{ color: 'rgba(76,221,130,0.97)' }}>{result.gains.toLocaleString('en-IN')}</div>
            </div>
          </div>

          {/* Contextual message */}
          <p className="text-sm font-semibold leading-relaxed text-center" style={{ color: 'rgba(200,230,255,0.85)' }}>
            {msg.body}
          </p>
        </div>

        {/* Spacer — pushes action buttons toward vertical center */}
        <div style={{ flex: 1 }} />

        {/* Action buttons */}
        <div className="space-y-3 px-4 py-4">
          <button
            className="btn-press w-full rounded-xl py-3.5 text-sm font-bold text-white"
            style={{ background: '#25D366' }}
            onClick={handleShare}
          >
            📤 Share
          </button>
          <div className="rounded-2xl p-4" style={{ background: hasBg ? 'rgba(30,58,138,0.75)' : '#1e3a8a' }}>
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
            style={{ color: 'white', border: '2px solid rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.12)' }}
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
            color: 'rgba(255,255,255,0.5)',
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
