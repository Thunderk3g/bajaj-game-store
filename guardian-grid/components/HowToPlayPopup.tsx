import React from 'react';
import { GAME_SECS, ORANGE } from '../constants';
import { termDuration, lowPremium, familyPayout, pureCover } from '../src/assets';

interface Props {
  onStart: () => void;
}

const HowToPlayPopup: React.FC<Props> = ({ onStart }) => {
  const displayTime = `${Math.floor(GAME_SECS / 60)}:${String(GAME_SECS % 60).padStart(2, '0')}`;
  const iconTiles = [termDuration, lowPremium, familyPayout, pureCover];

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 px-[4vw] py-[3vh]">
      <div className="max-h-full w-full max-w-[26rem] overflow-y-auto rounded-[1.5rem] border border-cyan-200/20 bg-[#041320]/95 p-[1.1rem] shadow-2xl backdrop-blur">
        <div className="mb-[0.9rem] flex items-center justify-between gap-[1rem]">
          <h2 className="text-[1.25rem] font-extrabold text-white">How to Play</h2>
          <div className="rounded-full bg-white/10 px-[0.7rem] py-[0.35rem] text-[0.7rem] font-extrabold uppercase tracking-[0.08em] text-cyan-100">
            {displayTime}
          </div>
        </div>

        {/* Tutorial Animation Section*/}
        <div className="relative mb-[1.2rem] h-[14.2rem] overflow-hidden rounded-[1rem] bg-[radial-gradient(circle_at_50%_0%,rgba(45,212,191,0.28),rgba(8,13,26,0.98)_62%)]">
          <div className="tutorial-grid">
            {[0, null, 2, null, 2, 3, null, 1, 1, null, 3, 2, null, 2, 1, 0].map((cell, index) => {
              let customClass = cell !== null ? 'tutorial-fixed' : 'tutorial-empty';
              if (index === 9) {
                customClass += ' tutorial-wrong-cell';
              } else if (index === 8) {
                customClass += ' tutorial-existing-dup';
              } else if (index === 1) {
                customClass += ' tutorial-correct-cell';
              }
              return (
                <span key={index} className={customClass}>
                  {cell !== null ? <img src={iconTiles[cell]} alt="" draggable={false} /> : ''}
                </span>
              );
            })}
          </div>
          <div className="tutorial-tile">
            <img src={lowPremium} alt="" draggable={false} />
          </div>
          <div className="tutorial-selection"></div>
          <div className="tutorial-hand"></div>
          <div className="tutorial-check"></div>

          {/* 4 Bottom Icon boxes matching the actual game input panel */}
          <div className="absolute inset-x-0 bottom-3 px-[1.25rem]">
            <div className="grid grid-cols-4 gap-[0.35rem]">
              {iconTiles.map((icon, idx) => (
                <div
                  key={idx}
                  className={`flex h-[2.5rem] items-center justify-center rounded-[0.7rem] p-[0.2rem] border ${idx === 1 ? 'tutorial-icon-box-active' : 'border-white/10'}`}
                  style={{ background: 'linear-gradient(180deg, #f8fafc, #bae6fd)', boxShadow: 'inset 0 0.1rem 0 rgba(255,255,255,0.9)' }}
                >
                  <img src={icon} alt="" draggable={false} className="h-full w-full object-contain" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mb-[1.2rem] text-center text-[0.95rem] font-semibold text-cyan-200/90">
          Solve this picture Sudoku under 2 minutes
        </p>

        <button
          onClick={onStart}
          className="btn-press min-h-[3.2rem] w-full rounded-full text-[1rem] font-extrabold uppercase tracking-[0.08em] text-white"
          style={{ background: `linear-gradient(135deg, ${ORANGE}, #fbbf24)`, boxShadow: '0 0.45rem 1.4rem rgba(251,191,36,0.38)' }}
        >
          Start
        </button>
      </div>
    </div>
  );
};

export default HowToPlayPopup;
