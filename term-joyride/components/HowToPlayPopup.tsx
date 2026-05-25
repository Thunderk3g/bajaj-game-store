import React from 'react';
import { ITEM_DEFS, ORANGE, BLUE, GREEN, GAME_SECS } from '../constants';
import { ItemType } from '../types';

interface Props {
  onStart: () => void;
}

const HowToPlayPopup: React.FC<Props> = ({ onStart }) => {
  const allItems = Object.entries(ITEM_DEFS) as [ItemType, (typeof ITEM_DEFS)[ItemType]][];
  const gainers = allItems.filter(([, d]) => !d.bad);
  const drainers = allItems.filter(([, d]) => d.bad);

  const ItemLegendCard = ({ type, def }: { type: ItemType; def: (typeof ITEM_DEFS)[ItemType] }) => (
    <div className="flex items-center gap-[0.4rem] rounded-[0.6rem] bg-black/20 p-[0.4rem]">
      <span
        className="flex h-[1.9rem] w-[1.9rem] flex-shrink-0 items-center justify-center rounded-full"
        style={{ background: def.color + '40', border: `1.5px solid ${def.color}80` }}
      >
        <img src={def.icon} alt={def.label} className="h-[1.3rem] w-[1.3rem] object-contain" />
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
      <div className="max-h-full w-full max-w-[26rem] overflow-y-auto rounded-[1.5rem] border border-white/15 bg-[#040E24]/96 p-[1.2rem] shadow-2xl backdrop-blur">

        <div className="mb-[0.8rem] flex items-center justify-between gap-[1rem]">
          <div>
            <h2 className="text-[1.2rem] font-extrabold text-white">How to Play</h2>
            <p className="text-[0.6rem] font-semibold text-blue-300">Nano Banana Flight</p>
          </div>
          <div className="rounded-full bg-white/10 px-[0.65rem] py-[0.3rem] text-[0.65rem] font-extrabold uppercase tracking-[0.08em] text-blue-100">
            {GAME_SECS || 45} sec
          </div>
        </div>

        {/* Jetpack controls tutorial instruction card */}
        <div className="mb-[0.9rem] rounded-[1rem] bg-gradient-to-br from-blue-950 to-indigo-950 p-[0.9rem] border border-blue-800/40">
          <h3 className="text-xs font-extrabold text-blue-200 mb-2 uppercase tracking-wide">🚀 Jetpack Controls</h3>
          <div className="flex gap-3 items-center mb-3">
            <div className="flex-1 text-center bg-black/40 py-2.5 px-1.5 rounded-xl border border-white/5">
              <p className="text-[0.62rem] font-black text-green-300 uppercase tracking-widest">TAP & HOLD</p>
              <p className="text-[0.55rem] font-medium text-white/70 mt-0.5">Ignite thruster & fly UP</p>
            </div>
            <div className="flex-1 text-center bg-black/40 py-2.5 px-1.5 rounded-xl border border-white/5">
              <p className="text-[0.62rem] font-black text-orange-300 uppercase tracking-widest">RELEASE</p>
              <p className="text-[0.55rem] font-medium text-white/70 mt-0.5">Cut power & fall DOWN</p>
            </div>
          </div>
          <p className="text-[0.65rem] text-slate-300 leading-relaxed">
            Dodge incoming electric zappers and homing missiles while floating along coin lines to build up your financial portfolio!
          </p>
        </div>

        {/* Game Legends Section */}
        <div className="mb-[0.9rem] flex gap-[0.6rem] rounded-[1rem] border border-white/10 bg-white/5 p-[0.65rem]">
          {/* Benefit Tokens */}
          <div className="flex flex-1 flex-col gap-[0.3rem]">
            <p className="mb-[0.15rem] text-[0.58rem] font-extrabold uppercase tracking-[0.09em] text-green-300">
              ✦ Collect Benefits
            </p>
            {gainers.slice(0, 4).map(([type, def]) => <ItemLegendCard key={type} type={type} def={def} />)}
          </div>

          {/* Risk Tokens */}
          <div className="flex flex-1 flex-col gap-[0.3rem]">
            <p className="mb-[0.15rem] text-[0.58rem] font-extrabold uppercase tracking-[0.09em] text-red-300">
              ✦ Dodge Risks
            </p>
            {drainers.slice(0, 4).map(([type, def]) => <ItemLegendCard key={type} type={type} def={def} />)}
          </div>
        </div>

        <button
          onClick={onStart}
          className="btn-press min-h-[3rem] w-full rounded-full text-[0.95rem] font-extrabold uppercase tracking-[0.08em] text-white"
          style={{ background: ORANGE, boxShadow: '0 0.4rem 1.2rem rgba(242,101,34,0.5)' }}
        >
          🚀 Start Flying
        </button>
      </div>
    </div>
  );
};

export default HowToPlayPopup;
