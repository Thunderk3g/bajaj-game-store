import React from 'react';
import { INTRO_IMAGE, ORANGE } from '../constants';

interface Props {
  onPlay: () => void;
}

const IntroScreen: React.FC<Props> = ({ onPlay }) => (
  <div className="relative h-full min-h-0 w-full overflow-hidden bg-[#071527]">
    <img
      src={INTRO_IMAGE}
      alt=""
      className="absolute inset-0 h-full w-full object-cover"
      draggable={false}
      onError={event => {
        event.currentTarget.style.display = 'none';
      }}
    />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(255,255,255,0.08),rgba(0,0,0,0.12)_34%,rgba(0,0,0,0.72)_100%)]" />
    <div
      className="relative z-10 flex h-full flex-col items-center justify-between px-[6vw] text-center"
      style={{
        paddingTop: 'max(2rem, calc(env(safe-area-inset-top) + 1rem))',
        paddingBottom: 'max(7vh, calc(env(safe-area-inset-bottom) + 1.5rem))',
      }}
    >
      <img
        className="w-[min(82vw,28rem)] max-h-[28vh] object-contain drop-shadow-[0_0.75rem_1.75rem_rgba(0,0,0,0.75)]"
        draggable={false}
      />
      <button
        onClick={onPlay}
        className="btn-press min-h-[3.5rem] w-full max-w-[18rem] rounded-full text-[1.1rem] font-extrabold uppercase tracking-[0.08em] text-white"
        style={{
          background: 'linear-gradient(135deg, #F97316, #F59E0B)',
          boxShadow: '0 0.6rem 2.4rem rgba(249,115,22,0.65), inset 0 0.15rem 0 rgba(255,255,255,0.3)',
        }}
      >
        Start
      </button>
    </div>
  </div>
);

export default IntroScreen;
