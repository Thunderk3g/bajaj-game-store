import React from 'react';
import { COMPANY_NAME, ORANGE, THANK_YOU_BODY } from '../constants';

interface Props {
  name: string;
  onPlayAgain: () => void;
}

const ThankYouScreen: React.FC<Props> = ({ name, onPlayAgain }) => (
  <div className="h-screen flex flex-col items-center justify-center text-center px-7" style={{ background: 'linear-gradient(180deg, #003DA6 0%, #06162f 100%)' }}>
    <h2 className="text-white text-5xl font-extrabold leading-none mb-3">THANK YOU!</h2>
    <h3 className="text-2xl font-extrabold mb-5" style={{ color: '#b8d3ff' }}>{name.toUpperCase()}</h3>
    <p className="text-sm leading-relaxed font-semibold mb-10 max-w-xs" style={{ color: '#eaf2ff' }}>{THANK_YOU_BODY}</p>
    <button onClick={onPlayAgain} className="px-12 py-4 rounded-full text-white font-extrabold text-base btn-press" style={{ background: ORANGE }}>
      PLAY AGAIN
    </button>
    <p className="absolute bottom-7 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.48)' }}>{COMPANY_NAME}</p>
  </div>
);

export default ThankYouScreen;
