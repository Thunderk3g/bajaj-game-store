import React from 'react';
import { GAME_SECS, MAX_HINTS, ORANGE } from '../constants';
import { termDuration, lowPremium, familyPayout, pureCover } from '../src/assets';

interface Props {
  onStart: () => void;
}

const HowToPlayPopup: React.FC<Props> = ({ onStart }) => {
  const displayTime = `${Math.floor(GAME_SECS / 60)}:${String(GAME_SECS % 60).padStart(2, '0')}`;
  const legends = [
    { title: 'Clue Cells', body: 'Fixed tiles start the shield. They cannot be changed.', tone: '#22d3ee' },
    { title: 'Icon Tiles', body: 'Place each icon once per row, column, and shield box.', tone: '#f59e0b' },
    { title: 'Hints', body: `Use up to ${MAX_HINTS} hints. Hints help, but reduce score.`, tone: '#34d399' },
    { title: 'Mistakes', body: 'Wrong choices shake the grid and reduce your protection score.', tone: '#fb7185' },
  ];
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
        <div className="relative mb-[1rem] h-[9.4rem] overflow-hidden rounded-[1rem] bg-[radial-gradient(circle_at_50%_0%,rgba(45,212,191,0.28),rgba(8,13,26,0.98)_62%)]">
          <div className="tutorial-grid">
            {[0, null, 2, null, null, 3, null, 1, 1, null, 3, null, null, 2, null, 0].map((cell, index) => (
              <span key={index} className={cell !== null ? 'tutorial-fixed' : 'tutorial-empty'}>
                {cell !== null ? <img src={iconTiles[cell]} alt="" draggable={false} /> : ''}
              </span>
            ))}
          </div>
          <div className="tutorial-tile">
            <img src={lowPremium} alt="" draggable={false} />
          </div>
          <div className="tutorial-check">Shield locked</div>
        </div>

        {/* Game Legends Section */}
        <div className="mb-[1rem] grid grid-cols-2 gap-[0.55rem] rounded-[1rem] border border-white/10 bg-white/6 p-[0.75rem]">
          {legends.map(item => (
            <div key={item.title} className="rounded-[0.8rem] bg-black/20 p-[0.55rem]">
              <p className="text-[0.64rem] font-extrabold uppercase tracking-[0.08em]" style={{ color: item.tone }}>
                {item.title}
              </p>
              <p className="mt-[0.2rem] text-[0.68rem] font-semibold leading-snug text-white/85">{item.body}</p>
            </div>
          ))}
        </div>

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
