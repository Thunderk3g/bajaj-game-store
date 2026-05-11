import React from 'react';
import { MOLE_DEFS, ORANGE } from '../constants';
import { MoleType } from '../types';

interface Props {
  onStart: () => void;
}

const HowToPlayPopup: React.FC<Props> = ({ onStart }) => {
  const allMoles = Object.entries(MOLE_DEFS) as [MoleType, (typeof MOLE_DEFS)[MoleType]][];
  const gainers = allMoles.filter(([, d]) => !d.bad);
  const drainers = allMoles.filter(([, d]) => d.bad);

  const MoleItem = ({ type, def }: { type: MoleType; def: (typeof MOLE_DEFS)[MoleType] }) => (
    <div className="flex items-center gap-[0.45rem] rounded-[0.65rem] bg-black/20 p-[0.45rem]">
      <img
        src={def.icon}
        alt={def.label}
        className="h-[2.2rem] w-[2.2rem] flex-shrink-0 rounded-full object-cover"
        style={{ background: def.color }}
      />
      <p className="truncate text-[0.68rem] font-extrabold text-white leading-tight">{def.label}</p>
    </div>
  );

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 px-[4vw] py-[3vh]">
      <div className="max-h-full w-full max-w-[26rem] overflow-y-auto rounded-[1.5rem] border border-white/15 bg-[#061939]/95 p-[1.1rem] shadow-2xl backdrop-blur">
        <div className="mb-[0.9rem] flex items-center justify-between gap-[1rem]">
          <h2 className="text-[1.25rem] font-extrabold text-white">How to Play</h2>
          <div className="rounded-full bg-white/10 px-[0.7rem] py-[0.35rem] text-[0.7rem] font-extrabold uppercase tracking-[0.08em] text-blue-100">
            60 sec
          </div>
        </div>

        <div className="relative mb-[1rem] h-[8.8rem] overflow-hidden rounded-[1rem] bg-[linear-gradient(180deg,#0A2A5F,#04112A)]">
          <div className="tutorial-hole tutorial-hole-good">
            <span>E</span>
          </div>
          <div className="tutorial-hole tutorial-hole-bad">
            <span>!</span>
          </div>
          <div className="tutorial-mallet" />
          <div className="tutorial-score">+500</div>
          <div className="absolute bottom-[0.75rem] left-0 right-0 mx-auto h-[1rem] w-[84%] rounded-full bg-black/45 shadow-inner" />
        </div>

        {/* Mole legends — two vertical columns */}
        <div className="mb-[1rem] rounded-[1rem] border border-white/10 bg-white/6 p-[0.75rem] flex gap-[0.75rem]">
          {/* Wealth Gainers */}
          <div className="flex-1 flex flex-col gap-[0.4rem]">
            <p className="mb-[0.2rem] text-[0.62rem] font-extrabold uppercase tracking-[0.09em] text-green-300">
              Wealth Gainers
            </p>
            {gainers.map(([type, def]) => <MoleItem key={type} type={type} def={def} />)}
          </div>

          {/* Wealth Drainers */}
          <div className="flex-1 flex flex-col gap-[0.4rem]">
            <p className="mb-[0.2rem] text-[0.62rem] font-extrabold uppercase tracking-[0.09em] text-red-300">
              Wealth Drainers
            </p>
            {drainers.map(([type, def]) => <MoleItem key={type} type={type} def={def} />)}
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
