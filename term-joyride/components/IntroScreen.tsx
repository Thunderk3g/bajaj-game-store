import React from 'react';
import { INTRO_IMAGE, ORANGE, BLUE } from '../constants';

interface Props {
  onPlay: () => void;
}

const IntroScreen: React.FC<Props> = ({ onPlay }) => (
  <div className="relative h-full min-h-0 w-full overflow-hidden bg-[#00091A]">
    {/* Full Screen Splash Background */}
    <img
      src={INTRO_IMAGE}
      alt="Banana Joyride Splash"
      className="absolute inset-0 h-full w-full object-cover object-center"
      draggable={false}
    />
    
    {/* Gradient Dark Overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/75" />

    <div
      className="relative z-10 flex h-full flex-col items-center justify-between px-[6vw] text-center"
      style={{
        paddingTop: 'max(3rem, calc(env(safe-area-inset-top) + 2rem))',
        paddingBottom: 'max(8vh, calc(env(safe-area-inset-bottom) + 2rem))',
      }}
    >
      {/* Dynamic Floating Premium Header */}
      <div className="float mt-2">
        <h1 
          className="text-4xl font-extrabold text-white uppercase tracking-wider select-none"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            textShadow: '0 0 10px rgba(0, 97, 242, 0.8), 0 0 25px rgba(242, 101, 34, 0.6)',
            letterSpacing: '0.08em'
          }}
        >
          Banana <span className="text-orange-500">Joyride</span>
        </h1>
        <p 
          className="text-[0.68rem] font-bold uppercase tracking-[0.25em] text-blue-300 mt-1 select-none"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
        >
          ✦ Nano Banana Flight ✦
        </p>
      </div>

      {/* Dynamic CTA button */}
      <div className="w-full flex flex-col items-center gap-3">
        <button
          onClick={onPlay}
          className="btn-press min-h-[3.6rem] w-full max-w-[17rem] rounded-full text-base font-black uppercase tracking-[0.1em] text-white"
          style={{
            background: `linear-gradient(135deg, ${ORANGE} 0%, #E04E0F 100%)`,
            boxShadow: '0 0.6rem 2.2rem rgba(242,101,34,0.6), inset 0 0.15rem 0 rgba(255,255,255,0.3)',
            border: '2px solid rgba(255,255,255,0.1)'
          }}
        >
          ⚡ Start Flight ⚡
        </button>
        <p className="text-[0.55rem] text-slate-400 font-bold uppercase tracking-[0.1em]">
          Powered by Bajaj Allianz Life Insurance
        </p>
      </div>
    </div>
  </div>
);

export default IntroScreen;
