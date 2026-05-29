import React from 'react';
import { ORANGE } from '../constants';
import imgPlayerSrc from '../src/assets/player_ship.png';
import imgAccidentSrc from '../src/assets/enemy_accident.png';
import imgIllnessSrc from '../src/assets/enemy_illness.png';
import imgDebtSrc from '../src/assets/enemy_debt.png';

interface Props { onStart: () => void }

const HowToPlayPopup: React.FC<Props> = ({ onStart }) => (
  <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 px-[4vw] py-[3vh]">
    <div className="max-h-full w-full max-w-[26rem] overflow-y-auto rounded-[1.5rem] border border-white/15 bg-[#060F22]/95 p-[1.1rem] shadow-2xl backdrop-blur">

      <div className="mb-[0.85rem]">
        <h2 className="text-[1.2rem] font-extrabold text-white">How to Play</h2>
      </div>

      {/* Tutorial Animation Section */}
      <div className="relative mb-[1rem] h-[9rem] overflow-hidden rounded-[1rem] bg-[linear-gradient(180deg,#040C1E,#060F22)]">
        {/* Stars */}
        {[12, 35, 58, 80, 22, 65, 45, 75, 5, 92].map((x, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{ left: `${x}%`, top: `${(i * 19) % 80}%`, width: 2, height: 2, opacity: 0.5 }} />
        ))}
        {/* Enemy row */}
        <div className="absolute top-[1rem] left-0 right-0 flex justify-center gap-3">
          {[imgAccidentSrc, imgIllnessSrc, imgDebtSrc, imgIllnessSrc, imgAccidentSrc].map((src, i) => (
            <img
              key={i}
              src={src}
              alt="enemy"
              className="h-6 w-6 object-contain"
              style={i === 2 ? { animation: 'tut-enemy-destroy 1.5s ease-out infinite' } : {}}
            />
          ))}
        </div>
        {/* Diving enemy */}
        <img src={imgAccidentSrc} alt="enemy" className="absolute object-contain" style={{
          left: '62%', top: '42%', width: 20, height: 20,
          animation: 'tut-dive 2s ease-in-out infinite',
        }} />
        {/* Player ship container with aligned laser and hit explosion */}
        <div className="absolute bottom-[0.9rem]" style={{
          width: 28,
          height: 28,
          animation: 'tut-move 3s ease-in-out infinite',
          transform: 'translateX(-50%)',
        }}>
          <img src={imgPlayerSrc} alt="player" className="h-full w-full object-contain" />

          {/* Laser beam */}
          <div className="absolute" style={{
            left: 'calc(50% - 1.5px)',
            width: 3,
            borderRadius: 1.5,
            background: '#00DFFF',
            boxShadow: '0 0 8px #00DFFF, 0 0 15px rgba(0,223,255,0.8)',
            animation: 'tut-laser 1.5s linear infinite',
          }} />

          {/* Hit explosion */}
          <div className="absolute" style={{
            left: '50%',
            bottom: '105px',
            width: 30,
            height: 30,
            transform: 'translateX(-50%) scale(0)',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,200,0,0.8) 50%, rgba(255,68,68,0) 70%)',
            boxShadow: '0 0 12px #FFCC00, 0 0 25px #FF4444',
            animation: 'tut-hit 1.5s ease-out infinite',
          }} />
        </div>

        <style>{`
          @keyframes tut-dive { 0%,100%{top:42%} 50%{top:62%} }
          @keyframes tut-move {
            0%, 100% { left: 45%; }
            50% { left: 55%; }
          }
          @keyframes tut-laser {
            0% {
              bottom: 28px;
              height: 0px;
              opacity: 0;
            }
            10% {
              bottom: 28px;
              height: 20px;
              opacity: 1;
            }
            45% {
              bottom: 100px;
              height: 20px;
              opacity: 1;
            }
            50%, 100% {
              bottom: 110px;
              height: 0px;
              opacity: 0;
            }
          }
          @keyframes tut-hit {
            0%, 40% {
              transform: translateX(-50%) scale(0);
              opacity: 0;
            }
            45% {
              transform: translateX(-50%) scale(0.2);
              opacity: 1;
            }
            60% {
              transform: translateX(-50%) scale(1.2);
              opacity: 0.8;
            }
            70%, 100% {
              transform: translateX(-50%) scale(1.5);
              opacity: 0;
            }
          }
          @keyframes tut-enemy-destroy {
            0%, 40% {
              opacity: 1;
              transform: scale(1);
              filter: none;
            }
            45% {
              opacity: 0.8;
              transform: scale(1.2) rotate(6deg);
              filter: brightness(2) saturate(1.5);
            }
            50%, 80% {
              opacity: 0;
              transform: scale(0);
            }
            90%, 100% {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </div>

      <div className="mb-[1.15rem] text-center leading-relaxed text-cyan-200" style={{ textShadow: '0 0 8px rgba(0,223,255,0.4)' }}>
        <p className="text-[0.9rem] font-bold whitespace-nowrap">Defeat the Enemies and Capture the Shields</p>
        <p className="text-[0.78rem] font-medium text-cyan-300/80 mt-0.5">Survive for 3 levels</p>
      </div>

      <button
        onClick={onStart}
        className="btn-press min-h-[3.2rem] w-full rounded-full text-[1rem] font-extrabold uppercase tracking-[0.08em] text-white"
        style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 0.45rem 1.6rem rgba(255,200,0,0.45)' }}
      >
        Start
      </button>
    </div>
  </div>
);

export default HowToPlayPopup;
