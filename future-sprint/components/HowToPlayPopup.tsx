import React, { useState, useEffect } from 'react';
import imgChildF1Src from '../src/assets/child_runner_f1.png';
import imgChildF2Src from '../src/assets/child_runner_f2.png';
import imgChildF3Src from '../src/assets/child_runner_f3.png';
import imgChildF4Src from '../src/assets/child_runner_f4.png';
import imgChildF5Src from '../src/assets/child_runner_f5.png';
import imgChildF6Src from '../src/assets/child_runner_f6.png';
import imgChildF7Src from '../src/assets/child_runner_f7.png';
import imgChildF8Src from '../src/assets/child_runner_f8.png';
import imgIllnessSrc from '../src/assets/obstacle_illness.png';
import imgCoinSrc from '../src/assets/coin_savings.png';

interface Props { onStart: () => void }

const HowToPlayPopup: React.FC<Props> = ({ onStart }) => {
  const [activeImg, setActiveImg] = useState(imgChildF1Src);

  useEffect(() => {
    let start = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const elapsed = (now - start) % 4000;
      const pct = elapsed / 4000;

      let isJumping = false;
      if (pct >= 0.20 && pct < 0.35) {
        isJumping = true;
      } else if (pct >= 0.50 && pct < 0.65) {
        isJumping = true;
      }

      if (isJumping) {
        setActiveImg(imgChildF1Src);
      } else {
        // Cycle 8 running frames at ~12fps (83ms per frame)
        const frameIdx = Math.floor(elapsed / 83) % 8;
        const frames = [
          imgChildF1Src, imgChildF2Src, imgChildF3Src, imgChildF4Src,
          imgChildF5Src, imgChildF6Src, imgChildF7Src, imgChildF8Src
        ];
        setActiveImg(frames[frameIdx]);
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,10,30,0.82)', backdropFilter: 'blur(3px)' }}>
    <div className="w-full max-w-sm mx-3 rounded-3xl flex flex-col overflow-hidden" style={{ background: 'linear-gradient(160deg,#0f172a,#1e3a8a)', border: '1px solid rgba(255,255,255,0.15)', maxHeight: 'calc(100vh - 2rem)' }}>
      <div className="overflow-y-auto px-4 py-6 flex flex-col items-center">

        {/* Header */}
        <h2 className="text-2xl font-extrabold tracking-tight text-white mb-4">HOW TO PLAY</h2>

        {/* Tutorial Animation Section */}
        <div className="w-full rounded-2xl bg-white/10 border border-white/20 p-4 mb-6">
          <p className="text-[0.72rem] font-bold uppercase tracking-wider text-blue-200 mb-3 text-center">
            Tap / Click to Jump
          </p>

          {/* Custom looped animation styles */}
          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes tutorial-runner {
              0% { transform: translateY(0px) scaleY(1); }
              2.5% { transform: translateY(-2px) scaleY(0.98); }
              5% { transform: translateY(0px) scaleY(1); }
              7.5% { transform: translateY(-2px) scaleY(0.98); }
              10% { transform: translateY(0px) scaleY(1); }
              12.5% { transform: translateY(-2px) scaleY(0.98); }
              15% { transform: translateY(0px) scaleY(1); }
              17.5% { transform: translateY(-2px) scaleY(0.98); }
              20% { transform: translateY(0px) scaleY(1); }

              /* Jump 1: Over Obstacle */
              22% { transform: translateY(2px) scaleY(0.88); }
              27% { transform: translateY(-36px) scaleY(1.02) rotate(6deg); }
              33% { transform: translateY(0px) scaleY(0.9); }
              35% { transform: translateY(0px) scaleY(1); }

              /* Running */
              37.5% { transform: translateY(-2px); }
              40.0% { transform: translateY(0px); }
              42.5% { transform: translateY(-2px); }
              45.0% { transform: translateY(0px); }
              47.5% { transform: translateY(-2px); }
              50.0% { transform: translateY(0px); }

              /* Jump 2: Collect Coin */
              52% { transform: translateY(2px) scaleY(0.88); }
              57% { transform: translateY(-44px) scaleY(1.02) rotate(-6deg); }
              63% { transform: translateY(0px) scaleY(0.9); }
              65% { transform: translateY(0px) scaleY(1); }

              /* Running */
              67.5% { transform: translateY(-2px); }
              70.0% { transform: translateY(0px); }
              72.5% { transform: translateY(-2px); }
              75.0% { transform: translateY(0px); }
              77.5% { transform: translateY(-2px); }
              80.0% { transform: translateY(0px); }
              82.5% { transform: translateY(-2px); }
              85.0% { transform: translateY(0px); }
              87.5% { transform: translateY(-2px); }
              90.0% { transform: translateY(0px); }
              92.5% { transform: translateY(-2px); }
              95.0% { transform: translateY(0px); }
              97.5% { transform: translateY(-2px); }
              100.0% { transform: translateY(0px); }
            }

            @keyframes tutorial-obstacle {
              0% { left: 110%; }
              /* Meets runner at 27% */
              27% { left: 40px; }
              40% { left: -40px; }
              100% { left: -40px; }
            }

            @keyframes tutorial-coin {
              0% { left: 110%; opacity: 1; transform: scale(1); }
              45% { left: 110%; opacity: 1; transform: scale(1); }
              /* Meets runner at 57% */
              57% { left: 42px; opacity: 1; transform: scale(1); }
              58% { left: 42px; opacity: 0; transform: scale(1.6); }
              70% { left: -40px; opacity: 0; }
              100% { left: -40px; opacity: 0; }
            }

            @keyframes tutorial-hand {
              0%, 18% { opacity: 0; transform: scale(0.8); }
              21% { opacity: 1; transform: scale(1.2); }
              24% { opacity: 0; transform: scale(0.9); }
              25%, 48% { opacity: 0; transform: scale(0.8); }
              51% { opacity: 1; transform: scale(1.2); }
              54% { opacity: 0; transform: scale(0.9); }
              100% { opacity: 0; }
            }

            @keyframes tutorial-sparkle {
              0%, 56% { opacity: 0; transform: scale(0.1); }
              57% { opacity: 1; transform: scale(1); }
              63% { opacity: 0; transform: scale(2.2); }
              100% { opacity: 0; }
            }

            @keyframes tutorial-score-pop {
              0%, 56% { opacity: 0; transform: translateY(0) scale(0.5); }
              58% { opacity: 1; transform: translateY(-22px) scale(1.25); }
              68% { opacity: 0; transform: translateY(-38px) scale(1); }
              100% { opacity: 0; }
            }
          ` }} />

          {/* Animated scene */}
          <div className="relative h-24 w-full rounded-xl overflow-hidden"
            style={{ background: 'linear-gradient(180deg,#93C5FD 0%,#BFDBFE 60%,#4ADE80 60%,#22C55E 100%)' }}>
            {/* sun */}
            <div className="absolute top-2 right-4 w-8 h-8 rounded-full bg-yellow-300 shadow-lg" style={{ boxShadow: '0 0 12px 4px #FDE68A' }} />

            {/* runner child */}
            <div
              className="absolute bottom-5 left-10 h-10 w-[34px] bg-contain bg-no-repeat bg-center"
              style={{
                animation: 'tutorial-runner 4s linear infinite',
                backgroundImage: `url(${activeImg})`,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }}
              aria-label="child runner" />

            {/* sliding obstacle */}
            <img src={imgIllnessSrc}
              className="absolute bottom-5 h-8 w-auto"
              style={{
                animation: 'tutorial-obstacle 4s linear infinite',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }}
              alt="obstacle" />

            {/* sliding coin */}
            <img src={imgCoinSrc}
              className="absolute bottom-14 h-7 w-7 object-contain"
              style={{
                animation: 'tutorial-coin 4s linear infinite',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }}
              alt="savings coin" />

            {/* Golden collection spark ring */}
            <div className="absolute rounded-full border-[3px] border-yellow-400 pointer-events-none z-10"
              style={{
                left: '42px',
                bottom: '56px',
                width: '28px',
                height: '28px',
                transform: 'translate(-50%, -50%)',
                animation: 'tutorial-sparkle 4s linear infinite',
                boxShadow: '0 0 8px rgba(250,204,21,0.6)'
              }}
            />

            {/* "+500" point pop text */}
            <div className="absolute font-black text-[0.72rem] text-yellow-300 pointer-events-none z-10 text-center w-12"
              style={{
                left: '26px',
                bottom: '68px',
                animation: 'tutorial-score-pop 4s linear infinite',
                textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 6px rgba(250,204,21,0.9)'
              }}>
              +500
            </div>

            {/* tap indicator hand */}
            <div className="absolute bottom-8 left-14 text-white font-extrabold text-xl z-20"
              style={{
                animation: 'tutorial-hand 4s linear infinite',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
              }}>
              👆
            </div>
          </div>

          <p className="mt-2 text-center text-[0.65rem] text-blue-200">
            Double-tap for a second jump to clear tall obstacles!
          </p>
        </div>

        <p className="text-center text-[0.8rem] font-bold text-cyan-200 mb-4">
          Collect coins, avoid obstacles and reach your Milestone!
        </p>

        {/* Start button */}
        <button
          onClick={onStart}
          className="w-full max-w-xs rounded-2xl py-4 text-base font-extrabold tracking-wide text-white shadow-xl active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg,#F97316,#F59E0B)', boxShadow: '0 0 24px rgba(249,115,22,0.55)' }}>
          START
        </button>
      </div>
    </div>
  </div>
  );
};

export default HowToPlayPopup;
