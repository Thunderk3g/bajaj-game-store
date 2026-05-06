import React from 'react';
import { BLUE, GREEN, IMAGE_PATH, INTRO_HOOK_LINE, INTRO_HOW_TO_PLAY, INTRO_TITLE, ORANGE, PRODUCT } from '../constants';
import { playSfx } from '../audio';

interface Props {
  onPlay: () => void;
}

const IntroScreen: React.FC<Props> = ({ onPlay }) => (
  <div className="screen-scroll" style={{ background: 'linear-gradient(180deg, #f6f9ff 0%, #dce8ff 45%, #06265c 100%)' }}>
    <div className="min-h-screen px-5 pt-6 pb-8 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: BLUE }}>{PRODUCT}</p>
          <h1 className="text-3xl font-extrabold leading-tight mt-1" style={{ color: '#071b3c' }}>{INTRO_TITLE}</h1>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm font-extrabold shadow-lg" style={{ background: BLUE }}>3x3</div>
      </div>

      <p className="text-sm font-semibold leading-relaxed mb-4" style={{ color: '#24415f' }}>{INTRO_HOOK_LINE}</p>

      <div className="relative rounded-[8px] overflow-hidden shadow-2xl mb-4" style={{ aspectRatio: '1 / 1', border: '4px solid white' }}>
        <img src={IMAGE_PATH} alt="ULIP protection and growth puzzle artwork" className="w-full h-full object-cover" />
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} style={{ border: '1px solid rgba(255,255,255,0.7)' }} />
          ))}
        </div>
      </div>

      <div className="rounded-[8px] bg-white p-4 shadow-lg mb-4">
        <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: ORANGE }}>How to play</p>
        <p className="text-sm font-semibold leading-relaxed" style={{ color: '#26384f' }}>{INTRO_HOW_TO_PLAY}</p>
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[
            ['Life Cover', BLUE],
            ['Fund Choice', ORANGE],
            ['Growth', GREEN]
          ].map(([label, color]) => (
            <div key={label} className="rounded-[8px] px-2 py-2 text-center text-[10px] font-extrabold" style={{ background: `${color}14`, color }}>
              {label}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          playSfx('button');
          onPlay();
        }}
        className="mt-auto w-full py-4 rounded-full text-white font-extrabold text-lg shadow-xl btn-press"
        style={{ background: `linear-gradient(90deg, ${BLUE}, ${ORANGE})` }}
      >
        PLAY
      </button>
    </div>
  </div>
);

export default IntroScreen;
