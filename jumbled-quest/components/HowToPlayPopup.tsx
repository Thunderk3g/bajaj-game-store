import React from 'react';
import { ORANGE, GAME_SECS } from '../constants';
import demoImg from '../src/assets/puzzle-1.png';

interface Props {
  onStart: () => void;
}

const HowToPlayPopup: React.FC<Props> = ({ onStart }) => {
  const [animStep, setAnimStep] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setAnimStep(prev => (prev + 1) % 5); // 5-step loop for 1 swap
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // Static grid representations at each swap stage
  // Only 2 pieces are shuffled at the start (slots 7 & 8).
  // Swapping slots 7 & 8 (at step 3) solves the puzzle completely!
  let currentGrid = [0, 1, 2, 3, 4, 5, 6, 8, 7]; // Step 0, 1, 2
  if (animStep >= 3) {
    currentGrid = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // Step 3, 4 (Swap complete - 100% Solved!)
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 px-[4vw] py-[3vh]">
      {/* Custom sliding CSS keyframes for swapping tiles */}
      <style>{`
        @keyframes slide-8-to-7 {
          from {
            transform: translate(calc(4.2rem + 3px), 0);
          }
          to {
            transform: translate(0, 0);
          }
        }
        @keyframes slide-7-to-8 {
          from {
            transform: translate(calc(-4.2rem - 3px), 0);
          }
          to {
            transform: translate(0, 0);
          }
        }
        .animate-slide-7 {
          animation: slide-8-to-7 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        .animate-slide-8 {
          animation: slide-7-to-8 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>

      <div className="max-h-full w-full max-w-[24rem] overflow-y-auto rounded-[1.5rem] border border-white/15 bg-[#061939]/95 p-[1.1rem] shadow-2xl backdrop-blur">

        {/* Header */}
        <div className="mb-[0.9rem] flex items-center justify-between gap-[1rem]">
          <h2 className="text-[1.25rem] font-extrabold text-white">How to Play</h2>
          <div className="rounded-full bg-white/10 px-[0.7rem] py-[0.35rem] text-[0.7rem] font-extrabold uppercase tracking-[0.08em] text-blue-100">
            {GAME_SECS % 60 === 0 ? `${GAME_SECS / 60} min` : `${GAME_SECS} sec`}
          </div>
        </div>

        {/* Mini puzzle demo - Vertical View */}
        <div
          className="relative mb-[1.2rem] flex flex-col items-center justify-center gap-[0.8rem] overflow-hidden rounded-[1rem] py-[1.2rem]"
          style={{ background: 'linear-gradient(180deg,#0A2A5F,#04112A)' }}
        >
          {/* Shuffled grid preview with Demo Swap Animation */}
          <div className="flex flex-col items-center">
            <p className="mb-[0.4rem] text-center text-[0.6rem] font-extrabold uppercase tracking-[0.12em] text-white/50">
              Shuffled Grid (Demo Swap)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,4.2rem)', gridTemplateRows: 'repeat(3,4.2rem)', gap: 3 }}>
              {currentGrid.map((pieceId, i) => {
                const col = pieceId % 3;
                const row = Math.floor(pieceId / 3);

                // Define dynamic states to style borders and glows perfectly
                const isSelectedGold = 
                  (i === 7 && (animStep === 1 || animStep === 2)) ||
                  (i === 8 && animStep === 2);

                const isJustSolvedGreen =
                  (i === 7 || i === 8) && animStep >= 3;

                const isTappedNow = 
                  (i === 7 && animStep === 1) ||
                  (i === 8 && animStep === 2);

                let slideClass = '';
                if (animStep === 3) {
                  // Swap slots 7 & 8 slide transition
                  if (i === 7) slideClass = 'animate-slide-7 z-10';
                  if (i === 8) slideClass = 'animate-slide-8 z-10';
                }

                return (
                  <div
                    key={i}
                    className={`relative rounded-[0.25rem] transition-all duration-300 overflow-hidden ${slideClass}`}
                    style={{
                      backgroundImage: `url(${demoImg})`,
                      backgroundSize: '300% 300%',
                      backgroundPosition: `${col * 50}% ${row * 50}%`,
                      border: isSelectedGold
                        ? '2px solid #FBBF24'
                        : (isJustSolvedGreen || pieceId === i)
                        ? '1.5px solid #4ADE80'
                        : '1.5px solid rgba(255,255,255,0.25)',
                      boxShadow: isSelectedGold
                        ? '0 0 10px rgba(251,191,36,0.8)'
                        : isJustSolvedGreen
                        ? '0 0 10px rgba(74,222,128,0.8)'
                        : 'none',
                      opacity: (isSelectedGold || isJustSolvedGreen || pieceId === i) ? 1 : 0.75,
                      transform: isTappedNow ? 'scale(0.92)' : 'scale(1)',
                      width: '4.2rem',
                      height: '4.2rem',
                    }}
                  >
                    {/* Pulsing indicator & pointer finger emoji with Click! label for simulated taps */}
                    {isTappedNow && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 rounded-[0.25rem] pointer-events-none">
                        <div className="absolute w-[2rem] h-[2rem] border-2 border-yellow-400 rounded-full animate-ping" />
                        <span className="text-[1.8rem] translate-x-2 translate-y-2 drop-shadow-md select-none animate-bounce">
                          👆
                        </span>
                        <span className="absolute top-[0.4rem] bg-yellow-400 text-slate-900 font-extrabold text-[0.55rem] px-[0.35rem] py-[0.1rem] rounded-full shadow-md uppercase tracking-wider animate-pulse select-none scale-110">
                          Click!
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Down Arrow / Instructions */}
          <div className="flex flex-col items-center gap-0.5 my-[0.1rem]">
            <span className="text-[1.5rem] font-black text-blue-400 animate-bounce">↓</span>
            <span className="text-[0.55rem] font-bold uppercase tracking-[0.08em] text-white/40">
              Swap Tiles to Solve
            </span>
          </div>

          {/* Solved grid preview */}
          <div className="flex flex-col items-center">
            <p className="mb-[0.4rem] text-center text-[0.6rem] font-extrabold uppercase tracking-[0.12em] text-green-400">
              Solved!
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,4.2rem)', gridTemplateRows: 'repeat(3,4.2rem)', gap: 3 }}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((pieceId, i) => {
                const col = pieceId % 3;
                const row = Math.floor(pieceId / 3);
                return (
                  <div
                    key={i}
                    className="rounded-[0.25rem] transition-all"
                    style={{
                      backgroundImage: `url(${demoImg})`,
                      backgroundSize: '300% 300%',
                      backgroundPosition: `${col * 50}% ${row * 50}%`,
                      border: '1.5px solid #4ADE80',
                      boxShadow: '0 0 5px rgba(74,222,128,0.4)',
                      width: '4.2rem',
                      height: '4.2rem',
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <button
          onClick={onStart}
          className="btn-press min-h-[3.2rem] w-full rounded-full text-[1rem] font-extrabold uppercase tracking-[0.08em] text-white"
          style={{ background: ORANGE, boxShadow: '0 0.45rem 1.4rem rgba(242,101,34,0.45)' }}
        >
          Start
        </button>
      </div>
    </div>
  );
};

export default HowToPlayPopup;
