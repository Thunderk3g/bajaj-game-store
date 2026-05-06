import React from 'react';
import { ENEMY_DEFS, HOW_TO_PLAY_ITEMS, HOW_TO_START_CTA, HOW_TO_SUBTITLE, HOW_TO_TITLE, ORANGE } from '../constants';
import { EnemyType } from '../types';

interface Props {
  onStart: () => void;
}

const HowToPlayScreen: React.FC<Props> = ({ onStart }) => (
  <div className="screen-scroll how-screen">
    <div className="w-full max-w-sm mx-auto min-h-screen px-5 py-7 flex flex-col">
      <header className="mb-5">
        <p className="text-[10px] font-extrabold tracking-[0.22em] uppercase text-cyan-200">Briefing</p>
        <h2 className="text-white text-3xl font-extrabold mt-1">{HOW_TO_TITLE}</h2>
        <p className="text-blue-100 text-sm mt-1">{HOW_TO_SUBTITLE}</p>
      </header>

      <section className="panel p-4 mb-4">
        <div className="space-y-3">
          {HOW_TO_PLAY_ITEMS.map((item) => (
            <div key={item.text} className="flex items-start gap-3">
              <span className="rule-badge">{item.icon}</span>
              <p className="text-sm leading-relaxed text-slate-100">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel p-4 mb-5">
        <p className="text-[10px] font-extrabold tracking-[0.18em] uppercase text-cyan-200 mb-3">Threat Legend</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(ENEMY_DEFS) as [EnemyType, typeof ENEMY_DEFS[EnemyType]][]).map(([type, def]) => (
            <div key={type} className="legend-tile" style={{ borderColor: `${def.color}66`, background: `${def.color}1A` }}>
              <span className="legend-icon" style={{ background: def.color }}>{def.icon}</span>
              <div className="min-w-0">
                <p className="text-white text-[11px] font-extrabold leading-tight truncate">{def.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <button
        onClick={onStart}
        className="mt-auto w-full py-4 rounded-full font-extrabold text-white text-base tracking-[0.14em] btn-press"
        style={{ background: ORANGE, boxShadow: '0 10px 26px rgba(242,101,34,0.34)' }}
      >
        {HOW_TO_START_CTA}
      </button>
    </div>
  </div>
);

export default HowToPlayScreen;
