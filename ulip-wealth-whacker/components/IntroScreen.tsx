import React from 'react';
import { BLUE, ORANGE, GREEN, MOLE_DEFS } from '../constants';
import { MoleType } from '../types';

interface Props {
  onPlay: () => void;
}

const IntroScreen: React.FC<Props> = ({ onPlay }) => (
  <div
    className="screen-scroll flex flex-col items-center"
    style={{ background: 'linear-gradient(170deg, #001230 0%, #002060 50%, #001a40 100%)' }}
  >
    <div className="w-full max-w-sm flex flex-col items-center min-h-screen px-5 pt-7 pb-8">


      {/* Hero */}
      <div className="flex flex-col items-center text-center mb-5">
        <div className="text-6xl mb-2 float">💹</div>
        <h1 className="text-4xl font-extrabold text-white leading-none">ULIP</h1>
        <h1 className="text-4xl font-extrabold leading-none mb-1" style={{ color: ORANGE }}>Wealth Whacker</h1>
        <p className="text-blue-300 text-xs font-bold tracking-widest uppercase mt-1">
          The Market-Linked Fund Challenge
        </p>
      </div>

      {/* How to Play */}
      <div
        className="w-full rounded-2xl p-4 mb-4"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
      >
        <p className="text-white font-extrabold text-xs mb-3 uppercase tracking-wider">How to Play</p>
        <div className="space-y-2">
          {[
            { icon: '👆', text: 'Tap good fund moles (Equity, Debt, Balanced) to grow your virtual ULIP portfolio.' },
            { icon: '🚫', text: 'Avoid Market Crashes (💥) and Fund Charges (💸) — they shrink your portfolio!' },
            { icon: '🚀', text: 'Rare Bull Run moles are worth BIG returns. Move fast — moles duck back quickly!' },
          ].map(({ icon, text }) => (
            <div key={icon} className="flex items-start gap-2.5">
              <span className="text-base flex-shrink-0">{icon}</span>
              <p className="text-blue-100 text-xs leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fund Legend */}
      <div
        className="w-full rounded-2xl p-4 mb-5"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <p className="text-white font-extrabold text-xs mb-3 uppercase tracking-wider">Fund Types</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(MOLE_DEFS) as [MoleType, typeof MOLE_DEFS[MoleType]][]).map(([type, def]) => (
            <div
              key={type}
              className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ background: `${def.color}18`, border: `1px solid ${def.color}40` }}
            >
              <span className="text-lg flex-shrink-0">{def.emoji}</span>
              <div>
                <p className="text-white text-[11px] font-bold leading-tight">{def.label}</p>
                <p
                  className="text-[10px] font-extrabold"
                  style={{ color: def.bad ? '#FCA5A5' : '#86EFAC' }}
                >
                  {def.value > 0 ? `+₹${def.value}` : `-₹${Math.abs(def.value)}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onPlay}
        className="w-full py-4 rounded-full font-extrabold text-white text-lg tracking-wide btn-press"
        style={{ background: ORANGE, boxShadow: '0 6px 28px rgba(242,101,34,0.55)' }}
      >
        ▶ PLAY NOW
      </button>

      <p className="text-blue-400 text-[10px] mt-4 opacity-50">
        Build your ₹{(8000).toLocaleString('en-IN')} portfolio in 60 seconds
      </p>
    </div>
  </div>
);

export default IntroScreen;
