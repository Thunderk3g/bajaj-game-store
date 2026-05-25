import React from 'react';
import { ITEM_DEFS, ORANGE } from '../constants';
import { ItemType } from '../types';

interface Props {
  onStart: () => void;
}

const HowToPlayPopup: React.FC<Props> = ({ onStart }) => {
  const allItems = Object.entries(ITEM_DEFS) as [ItemType, (typeof ITEM_DEFS)[ItemType]][];
  const gainers = allItems.filter(([, d]) => !d.bad);
  const drainers = allItems.filter(([, d]) => d.bad);
  const tutorialGood = gainers[0][1];
  const tutorialBad = drainers[0][1];

  const ItemLegendCard = ({ type, def }: { type: ItemType; def: (typeof ITEM_DEFS)[ItemType] }) => (
    <div className="flex items-center gap-[0.4rem] rounded-[0.6rem] bg-black/20 p-[0.4rem]">
      <span
        className="flex h-[1.9rem] w-[1.9rem] flex-shrink-0 items-center justify-center rounded-full"
        style={{ background: def.color + '40', border: `1.5px solid ${def.color}80` }}
      >
        <img src={def.icon} alt={def.label} className="h-[1.5rem] w-[1.5rem] object-contain" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[0.6rem] font-extrabold leading-tight text-white">{def.label}</p>
        <p className={`text-[0.55rem] font-bold leading-tight ${def.bad ? 'text-red-300' : 'text-green-300'}`}>
          {def.bad ? `-${Math.abs(def.value).toLocaleString('en-IN')}` : `+${def.value.toLocaleString('en-IN')}`}
        </p>
      </div>
    </div>
  );

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 px-[4vw] py-[2vh]">
      <div className="max-h-full w-full max-w-[26rem] overflow-y-auto rounded-[1.5rem] border border-white/15 bg-[#040E24]/96 p-[1rem] shadow-2xl backdrop-blur">

        <div className="mb-[0.8rem] flex items-center justify-between gap-[1rem]">
          <div>
            <h2 className="text-[1.2rem] font-extrabold text-white">How to Play</h2>
            <p className="text-[0.6rem] font-semibold text-blue-300">Fortune Slice</p>
          </div>
          <div className="rounded-full bg-white/10 px-[0.65rem] py-[0.3rem] text-[0.65rem] font-extrabold uppercase tracking-[0.08em] text-blue-100">
            60 sec
          </div>
        </div>

        {/* Tutorial Animation Section */}
        <div className="relative mb-[0.9rem] h-[8.5rem] overflow-hidden rounded-[1rem] bg-[linear-gradient(180deg,#030A1E,#060F2A)]">
          {/* Background glow */}
          <div className="tutorial-bg-glow" />

          {/* Good item — sliced by swipe */}
          <div className="tutorial-fruit tutorial-fruit-good">
            <div
              className="flex h-[2.8rem] w-[2.8rem] items-center justify-center rounded-full"
              style={{
                background: `radial-gradient(circle at 38% 32%, ${tutorialGood.color}ee, ${tutorialGood.color}aa)`,
                boxShadow: `0 0 0.8rem ${tutorialGood.color}60`,
                border: `0.15rem solid ${tutorialGood.color}88`,
              }}
            >
              <img src={tutorialGood.icon} alt={tutorialGood.label} style={{ width: '1.7rem', height: '1.7rem', objectFit: 'contain' }} />
            </div>
          </div>

          {/* Bad item — appears alone, no swipe near it */}
          <div className="tutorial-fruit tutorial-fruit-bad">
            <div
              className="flex h-[2.8rem] w-[2.8rem] items-center justify-center rounded-full"
              style={{
                background: `radial-gradient(circle at 38% 32%, ${tutorialBad.color}ee, ${tutorialBad.color}aa)`,
                boxShadow: `0 0 0.8rem ${tutorialBad.color}60`,
                border: `0.15rem solid ${tutorialBad.color}88`,
              }}
            >
              <img src={tutorialBad.icon} alt={tutorialBad.label} style={{ width: '1.7rem', height: '1.7rem', objectFit: 'contain' }} />
            </div>
          </div>

          {/* Swipe trail line */}
          <div className="tutorial-swipe-trail" />

          {/* Finger touch-point (with ripple via ::after) */}
          <div className="tutorial-finger" />

          {/* Score popup after slice */}
          <div className="tutorial-score-good">+1500</div>

          {/* Avoid label near bad item */}
          <div className="tutorial-avoid-label">✕ AVOID</div>

          {/* Instruction text */}
          <div className="absolute bottom-[0.5rem] left-0 right-0 text-center">
            <span className="text-[0.52rem] font-extrabold uppercase tracking-[0.12em] text-white/40">Swipe to slice benefit tokens!</span>
          </div>
        </div>

        {/* Game Legends Section */}
        <div className="mb-[0.9rem] flex gap-[0.6rem] rounded-[1rem] border border-white/10 bg-white/5 p-[0.65rem]">
          {/* Benefit Tokens */}
          <div className="flex flex-1 flex-col gap-[0.3rem]">
            <p className="mb-[0.15rem] text-[0.58rem] font-extrabold uppercase tracking-[0.09em] text-green-300">
              ✦ Slice These
            </p>
            {gainers.map(([type, def]) => <ItemLegendCard key={type} type={type} def={def} />)}
          </div>

          {/* Risk Tokens */}
          <div className="flex flex-1 flex-col gap-[0.3rem]">
            <p className="mb-[0.15rem] text-[0.58rem] font-extrabold uppercase tracking-[0.09em] text-red-300">
              ✦ Avoid These
            </p>
            {drainers.map(([type, def]) => <ItemLegendCard key={type} type={type} def={def} />)}
          </div>
        </div>

        <button
          onClick={onStart}
          className="btn-press min-h-[3rem] w-full rounded-full text-[0.95rem] font-extrabold uppercase tracking-[0.08em] text-white"
          style={{ background: ORANGE, boxShadow: '0 0.4rem 1.2rem rgba(242,101,34,0.5)' }}
        >
          ⚔ Start Slicing
        </button>
      </div>
    </div>
  );
};

export default HowToPlayPopup;
