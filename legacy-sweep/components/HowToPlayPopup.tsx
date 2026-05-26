import React from 'react';
import { BENEFIT_DEFS, HOW_TO_PLAY_ITEMS, MINE_DEF, ORANGE } from '../constants';
import { BenefitType } from '../types';

interface Props { onStart: () => void; }

const HowToPlayPopup: React.FC<Props> = ({ onStart }) => {
  const benefits = Object.entries(BENEFIT_DEFS) as [BenefitType, (typeof BENEFIT_DEFS)[BenefitType]][];

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 px-[4vw] py-[3vh]">
      <div className="max-h-full w-full max-w-[26rem] overflow-y-auto rounded-[1.5rem] border border-white/15 bg-[#061939]/95 p-[1.1rem] shadow-2xl backdrop-blur">
        <div className="mb-[0.5rem] flex items-center justify-between gap-[1rem]">
          <h2 className="text-[1.25rem] font-extrabold text-white">How to Play</h2>
          <div className="rounded-full bg-white/10 px-[0.7rem] py-[0.35rem] text-[0.7rem] font-extrabold uppercase tracking-[0.08em] text-blue-100">
            Sweep
          </div>
        </div>

        {/* Tutorial Animation Section */}
        <div className="relative mb-[0.6rem] overflow-hidden rounded-[1rem] bg-[linear-gradient(180deg,#0A2A5F,#04112A)]" style={{ height: '6rem' }}>
          {/* Animated grid cells */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {/* Cell 1 - hidden then reveals benefit */}
            <div style={{ width: 52, height: 52, borderRadius: 8, background: 'rgba(30,58,95,0.9)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'tutorial-reveal 3s ease-in-out infinite' }}>
              <span style={{ fontSize: 22 }}>🛡️</span>
            </div>
            {/* Cell 2 - flagged */}
            <div style={{ width: 52, height: 52, borderRadius: 8, background: 'rgba(30,58,95,0.9)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 22 }}>🚩</span>
            </div>
            {/* Cell 3 - mine hit */}
            <div style={{ width: 52, height: 52, borderRadius: 8, background: '#7f1d1d', border: '2px solid #EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'tutorial-shake 3s ease-in-out infinite' }}>
              <span style={{ fontSize: 22 }}>⚠️</span>
            </div>
            {/* Cell 4 - number hint */}
            <div style={{ width: 52, height: 52, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: '#60A5FA' }}>2</span>
            </div>
          </div>
          {/* Labels */}
          <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
            {['Tap', 'Flag', 'Risk!', 'Count'].map(t => (
              <div key={t} style={{ width: 52, textAlign: 'center', fontSize: '0.55rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t}</div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-[0.6rem] flex flex-col gap-[0.3rem]">
          {HOW_TO_PLAY_ITEMS.map((item, i) => (
              <div key={i} className="flex items-start gap-[0.55rem] rounded-[0.65rem] bg-white/5 p-[0.4rem]">
              <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 1 }}>
                {item.icon === 'tap' ? '👆' : item.icon === 'avoid' ? '⚠️' : '🚩'}
              </span>
              <p className="text-[0.72rem] font-semibold leading-snug text-blue-100">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Game Legends Section */}
        <div className="mb-[0.6rem] rounded-[1rem] border border-white/10 bg-white/5 p-[0.5rem]">
          <div className="flex gap-[0.75rem]">
            {/* Benefits */}
            <div className="flex-1 flex flex-col gap-[0.2rem]">
              <p className="mb-[0.2rem] text-[0.62rem] font-extrabold uppercase tracking-[0.09em] text-green-300">Benefits</p>
              {benefits.map(([type, def]) => (
                <div key={type} className="flex items-center gap-[0.4rem] rounded-[0.55rem] bg-black/20 p-[0.3rem]">
                  <img src={def.icon} alt={def.label} style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', background: def.color, flexShrink: 0 }} />
                  <p className="truncate text-[0.65rem] font-extrabold text-white leading-tight">{def.label}</p>
                </div>
              ))}
            </div>
            {/* Risk */}
            <div style={{ width: '44%', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <p className="mb-[0.2rem] text-[0.62rem] font-extrabold uppercase tracking-[0.09em] text-red-300">Avoid</p>
              <div className="flex items-center gap-[0.4rem] rounded-[0.55rem] bg-black/20 p-[0.3rem]">
                <img src={MINE_DEF.icon} alt={MINE_DEF.label} style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', background: MINE_DEF.color, flexShrink: 0 }} />
                <p className="text-[0.65rem] font-extrabold text-white leading-tight">{MINE_DEF.label}</p>
              </div>
              <div style={{ marginTop: '0.3rem', padding: '0.3rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.55rem' }}>
                <p style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
                  Numbers show how many risks are adjacent to a cell — use them to sweep safely.
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onStart}
          className="btn-press min-h-[3.2rem] w-full rounded-full text-[1rem] font-extrabold uppercase tracking-[0.08em] text-white"
          style={{ background: ORANGE, boxShadow: '0 0.45rem 1.4rem rgba(212,160,23,0.45)' }}
        >
          Start
        </button>
      </div>
    </div>
  );
};

export default HowToPlayPopup;
