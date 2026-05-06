import React from 'react';
import { ORANGE, BRICK_DEFS, INTRO_HOW_TO_PLAY, COMPANY_NAME } from '../constants';

import introBgImg from '../assets/intro_page.png';

interface Props {
  onPlay: () => void;
}

const IntroScreen: React.FC<Props> = ({ onPlay }) => (
  <div
    className="screen-scroll flex flex-col items-center"
    style={{
      backgroundImage: `url(${introBgImg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center top',
      backgroundRepeat: 'no-repeat',
    }}
  >
    <div className="w-full max-w-sm flex flex-col items-center min-h-screen px-6 pt-6 pb-8">

      {/* Spacer — pushes controls to the bottom, letting the bg image show through */}
      <div className="flex-1" />

      {/* CTA */}
      <button
        onClick={onPlay}
        className="w-full py-4 rounded-full font-extrabold text-white text-lg tracking-wide btn-press"
        style={{
          background: 'linear-gradient(90deg, #ff2d78, #ff6bb3)',
          boxShadow: '0 0 18px rgba(255,45,120,0.7), 0 6px 24px rgba(255,45,120,0.4)',
        }}
      >
        ▶ PLAY NOW
      </button>
    </div>
  </div>
);

export default IntroScreen;
