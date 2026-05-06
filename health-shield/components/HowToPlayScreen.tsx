import React from 'react';
import { INTRO_HOW_TO_PLAY, BRICK_DEFS } from '../constants';

interface Props {
  onStart: () => void;
}

const HowToPlayScreen: React.FC<Props> = ({ onStart }) => (
  <div
    className="screen-scroll flex flex-col items-center"
    style={{
      background: 'linear-gradient(160deg, #0d0024 0%, #1a0040 60%, #0d0024 100%)',
      minHeight: '100vh',
    }}
  >
    <div className="w-full max-w-sm flex flex-col items-center min-h-screen px-6 pt-10 pb-8 gap-6">

      {/* Header */}
      <div className="flex flex-col items-center gap-1">
        <span
          className="text-xs font-bold tracking-widest uppercase"
          style={{ color: '#ff2d78', letterSpacing: '0.2em' }}
        >
          Health Shield
        </span>
        <h1
          className="text-3xl font-extrabold text-white text-center"
          style={{ textShadow: '0 0 20px rgba(255,45,120,0.6), 0 0 40px rgba(124,58,237,0.4)' }}
        >
          HOW TO PLAY
        </h1>
      </div>

      {/* Instructions */}
      <div className="w-full flex flex-col gap-3">
        {INTRO_HOW_TO_PLAY.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-2xl px-5 py-4"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,45,120,0.25)',
            }}
          >
            <span className="text-2xl flex-shrink-0">{item.icon}</span>
            <p className="text-white text-sm font-medium leading-snug">{item.text}</p>
          </div>
        ))}
      </div>

      {/* Coverage legend */}
      {BRICK_DEFS.length > 0 && (
        <div className="w-full flex flex-col gap-2">
          <p
            className="text-xs font-bold tracking-widest uppercase text-center"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            Coverage Layers
          </p>
          <div className="w-full grid grid-cols-2 gap-2">
            {BRICK_DEFS.map((brick, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${brick.color}55` }}
              >
                <span
                  className="text-base flex-shrink-0"
                  style={{ filter: `drop-shadow(0 0 4px ${brick.glow})` }}
                >
                  {brick.icon}
                </span>
                <span className="text-xs font-semibold" style={{ color: brick.color }}>
                  {brick.label}
                </span>
                <span className="ml-auto text-xs font-bold" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {brick.pts}pt
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1" />

      {/* CTA */}
      <button
        onClick={onStart}
        className="w-full py-4 rounded-full font-extrabold text-white text-lg tracking-wide btn-press"
        style={{
          background: 'linear-gradient(90deg, #ff2d78, #ff6bb3)',
          boxShadow: '0 0 18px rgba(255,45,120,0.7), 0 6px 24px rgba(255,45,120,0.4)',
        }}
      >
        ▶ START
      </button>
    </div>
  </div>
);

export default HowToPlayScreen;
