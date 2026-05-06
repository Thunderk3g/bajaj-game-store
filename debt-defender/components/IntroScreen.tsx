import React from 'react';
import { COMPANY_NAME, INTRO_CTA, INTRO_EYEBROW, INTRO_HOOK } from '../constants';

import introArtImg from '../assets/intro_screen.png';

interface Props {
  onPlay: () => void;
}

const IntroScreen: React.FC<Props> = ({ onPlay }) => (
  <div className="screen-scroll intro-screen">
    <img className="intro-art" src={introArtImg} alt="" />
    <div className="intro-vignette" />
    <div className="w-full max-w-sm mx-auto min-h-screen px-5 pt-6 pb-7 flex flex-col relative z-10">
      <div className="flex-1" />

      <section className="intro-copy">
        <p className="intro-kicker">60-second financial arena</p>
        <p className="intro-hook">{INTRO_HOOK}</p>
      </section>

      <button onClick={onPlay} className="intro-play btn-press">
        {INTRO_CTA}
      </button>
    </div>
  </div>
);

export default IntroScreen;
