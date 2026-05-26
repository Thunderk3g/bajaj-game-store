import React from 'react';
import { ORANGE } from '../constants';
import demoImg from '../src/assets/puzzle-1.png';

interface Props {
  onStart: () => void;
}

const STEPS = [
  {
    num: '1',
    color: '#60A5FA',
    title: 'Pick & Swap',
    desc: 'Tap any tile to select it (it glows gold), then tap another tile to swap their positions.',
  },
  {
    num: '2',
    color: '#4ADE80',
    title: 'Recreate the Picture',
    desc: 'Rearrange all 9 tiles until they form the complete image shown in the thumbnail below the grid.',
  },
  {
    num: '3',
    color: '#FBBF24',
    title: 'Score Points',
    desc: 'Each solved puzzle earns up to 500 pts. The fewer swaps you use, the higher the bonus!',
  },
  {
    num: '4',
    color: '#F472B6',
    title: 'Keep Going',
    desc: 'A new random picture loads automatically after each solve. Solve as many as you can in 60 seconds!',
  },
];

const HowToPlayPopup: React.FC<Props> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 px-[4vw] py-[3vh]">
      <div className="max-h-full w-full max-w-[26rem] overflow-y-auto rounded-[1.5rem] border border-white/15 bg-[#061939]/95 p-[1.1rem] shadow-2xl backdrop-blur">

        {/* Header */}
        <div className="mb-[0.9rem] flex items-center justify-between gap-[1rem]">
          <h2 className="text-[1.25rem] font-extrabold text-white">How to Play</h2>
          <div className="rounded-full bg-white/10 px-[0.7rem] py-[0.35rem] text-[0.7rem] font-extrabold uppercase tracking-[0.08em] text-blue-100">
            60 sec
          </div>
        </div>

        {/* Mini puzzle demo */}
        <div
          className="relative mb-[1rem] flex items-center justify-center gap-[0.5rem] overflow-hidden rounded-[1rem] py-[1rem]"
          style={{ background: 'linear-gradient(180deg,#0A2A5F,#04112A)' }}
        >
          {/* Shuffled grid preview */}
          <div>
            <p className="mb-[0.35rem] text-center text-[0.55rem] font-bold uppercase tracking-wide text-white/50">Shuffled</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,2rem)', gridTemplateRows: 'repeat(3,2rem)', gap: 2 }}>
              {[4,7,2,1,8,5,3,0,6].map((pieceId, i) => {
                const col = pieceId % 3;
                const row = Math.floor(pieceId / 3);
                return (
                  <div
                    key={i}
                    className="rounded-sm"
                    style={{
                      backgroundImage: `url(${demoImg})`,
                      backgroundSize: '300% 300%',
                      backgroundPosition: `${col * 50}% ${row * 50}%`,
                      border: pieceId === i ? '1.5px solid #4ADE80' : '1.5px solid rgba(255,255,255,0.25)',
                      opacity: pieceId === i ? 1 : 0.75,
                      width: '2rem',
                      height: '2rem',
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[1.3rem]">→</span>
            <span className="text-[0.52rem] text-white/40">swap</span>
          </div>

          {/* Solved grid preview */}
          <div>
            <p className="mb-[0.35rem] text-center text-[0.55rem] font-bold uppercase tracking-wide text-green-300">Solved!</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,2rem)', gridTemplateRows: 'repeat(3,2rem)', gap: 2 }}>
              {[0,1,2,3,4,5,6,7,8].map((pieceId, i) => {
                const col = pieceId % 3;
                const row = Math.floor(pieceId / 3);
                return (
                  <div
                    key={i}
                    className="rounded-sm"
                    style={{
                      backgroundImage: `url(${demoImg})`,
                      backgroundSize: '300% 300%',
                      backgroundPosition: `${col * 50}% ${row * 50}%`,
                      border: '1.5px solid #4ADE80',
                      boxShadow: '0 0 4px rgba(74,222,128,0.4)',
                      width: '2rem',
                      height: '2rem',
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="mb-[1rem] flex flex-col gap-[0.55rem]">
          {STEPS.map(step => (
            <div
              key={step.num}
              className="flex items-start gap-[0.6rem] rounded-[0.8rem] px-[0.6rem] py-[0.5rem]"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div
                className="flex h-[1.5rem] w-[1.5rem] flex-shrink-0 items-center justify-center rounded-full text-[0.7rem] font-extrabold"
                style={{ background: step.color + '22', color: step.color, border: `1.5px solid ${step.color}55` }}
              >
                {step.num}
              </div>
              <div>
                <p className="text-[0.7rem] font-extrabold leading-tight text-white">{step.title}</p>
                <p className="mt-[0.15rem] text-[0.6rem] leading-snug text-white/55">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          className="btn-press min-h-[3.2rem] w-full rounded-full text-[1rem] font-extrabold uppercase tracking-[0.08em] text-white"
          style={{ background: ORANGE, boxShadow: '0 0.45rem 1.4rem rgba(242,101,34,0.45)' }}
        >
          Start Puzzle
        </button>
      </div>
    </div>
  );
};

export default HowToPlayPopup;
