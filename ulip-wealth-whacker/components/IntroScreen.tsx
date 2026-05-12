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
      className="relative z-10 flex h-full flex-col items-center justify-end px-[6vw] text-center"
      style={{
        paddingTop: 'max(2rem, calc(env(safe-area-inset-top) + 1rem))',
        paddingBottom: 'max(7vh, calc(env(safe-area-inset-bottom) + 1.5rem))',
      }}
    >

      <button
        onClick={onPlay}
        className="btn-press min-h-[3.5rem] w-full max-w-[18rem] rounded-full text-[1.1rem] font-extrabold uppercase tracking-[0.08em] text-white"
        style={{
          background: ORANGE,
          boxShadow: '0 0.6rem 2rem rgba(242,101,34,0.55), inset 0 0.15rem 0 rgba(255,255,255,0.25)',
        }}
      >
        Play
      </button>
    </div>
  </div>
);

export default IntroScreen;
