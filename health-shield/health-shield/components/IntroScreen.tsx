import React from 'react';
import { BLUE, ORANGE, BRICK_DEFS } from '../constants';

interface Props {
  onPlay: () => void;
}

const IntroScreen: React.FC<Props> = ({ onPlay }) => (
  <div
    className="screen-scroll flex flex-col items-center"
    style={{ background: `linear-gradient(170deg, #001a5e 0%, ${BLUE} 55%, #0055cc 100%)` }}
  >
    <div className="w-full max-w-sm flex flex-col items-center min-h-screen px-6 pt-8 pb-8">

      {/* Branding */}
      <div className="flex flex-col items-center mb-6">
        <span className="text-white text-xs font-bold tracking-widest opacity-60">BAJAJ LIFE INSURANCE</span>
        <div className="w-12 h-0.5 mt-1 rounded-full" style={{ background: ORANGE }}></div>
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center text-center mb-6 flex-1 justify-center">
        <div className="text-6xl mb-3 float">🛡️</div>
        <h1 className="text-5xl font-extrabold text-white leading-none mb-1">Health</h1>
        <h1 className="text-5xl font-extrabold leading-none mb-3" style={{ color: ORANGE }}>Shield</h1>
        <p className="text-blue-200 text-sm font-semibold tracking-wide">THE CRITICAL ILLNESS CHALLENGE</p>

        {/* How to play */}
        <div
          className="mt-6 w-full rounded-2xl p-5 text-left"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          <p className="text-white font-bold text-sm mb-3">How to Play</p>
          <div className="space-y-2.5">
            {([
              ['🏓', 'Move the paddle to bounce the health ball'],
              ['🧱', 'Break coverage bricks to activate your shield'],
              ['❤️', '3 lives — clear all bricks before time runs out!'],
              ['🖱️', 'Mouse / Touch to move · Tap to launch'],
            ] as [string, string][]).map(([icon, text]) => (
              <div key={text} className="flex items-start gap-2.5">
                <span className="text-base">{icon}</span>
                <p className="text-blue-100 text-xs leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Coverage legend */}
        <div className="mt-4 w-full grid grid-cols-3 gap-1.5">
          {BRICK_DEFS.map(b => (
            <div
              key={b.label}
              className="rounded-lg px-2 py-1.5 flex items-center gap-1.5"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: b.color }}></div>
              <span className="text-white text-[10px] font-semibold leading-tight">
                {b.label.replace('\n', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onPlay}
        className="w-full py-4 rounded-full font-extrabold text-white text-lg tracking-wide btn-press"
        style={{ background: ORANGE, boxShadow: '0 6px 24px rgba(242,101,34,0.5)' }}
      >
        ▶ PLAY NOW
      </button>
    </div>
  </div>
);

export default IntroScreen;
