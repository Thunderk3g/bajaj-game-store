import React from 'react';
import { BLUE, COMPANY_NAME, ORANGE, PLAY_AGAIN_CTA, THANK_YOU_BODY, THANK_YOU_TITLE } from '../constants';

interface Props {
  playerName: string;
  onPlayAgain: () => void;
}

const ThankYouScreen: React.FC<Props> = ({ playerName, onPlayAgain }) => (
  <div className="screen-scroll flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center" style={{ background: BLUE }}>
    <div className="thank-mark mb-6">OK</div>
    <h2 className="text-white text-4xl font-extrabold">{THANK_YOU_TITLE}</h2>
    <h3 className="font-extrabold text-2xl mt-2 mb-5" style={{ color: ORANGE }}>
      {playerName.toUpperCase()}
    </h3>
    <p className="text-blue-100 text-sm leading-relaxed mb-10 max-w-xs">{THANK_YOU_BODY}</p>
    <button
      onClick={onPlayAgain}
      className="px-12 py-4 rounded-full font-extrabold text-white text-base btn-press"
      style={{ background: ORANGE, boxShadow: '0 6px 24px rgba(242,101,34,0.5)' }}
    >
      {PLAY_AGAIN_CTA}
    </button>
    <p className="text-blue-200 text-xs font-semibold mt-10 opacity-70 tracking-[0.18em] uppercase">{COMPANY_NAME}</p>
  </div>
);

export default ThankYouScreen;
