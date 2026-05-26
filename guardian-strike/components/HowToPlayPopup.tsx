import React from 'react';
import { ORANGE } from '../constants';
import imgPlayerSrc   from '../src/assets/player_ship.png';
import imgAccidentSrc from '../src/assets/enemy_accident.png';
import imgIllnessSrc  from '../src/assets/enemy_illness.png';
import imgDebtSrc     from '../src/assets/enemy_debt.png';
import imgBossSrc     from '../src/assets/enemy_boss.png';
import imgShieldSrc   from '../src/assets/powerup_shield.png';

interface Props { onStart: () => void }

const HowToPlayPopup: React.FC<Props> = ({ onStart }) => (
  <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 px-[4vw] py-[3vh]">
    <div className="max-h-full w-full max-w-[26rem] overflow-y-auto rounded-[1.5rem] border border-white/15 bg-[#060F22]/95 p-[1.1rem] shadow-2xl backdrop-blur">

      <div className="mb-[0.85rem] flex items-center justify-between">
        <h2 className="text-[1.2rem] font-extrabold text-white">How to Play</h2>
        <div className="rounded-full bg-cyan-900/60 px-[0.7rem] py-[0.3rem] text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-cyan-300">
          3 Waves
        </div>
      </div>

      {/* Tutorial Animation Section */}
      <div className="relative mb-[1rem] h-[9rem] overflow-hidden rounded-[1rem] bg-[linear-gradient(180deg,#040C1E,#060F22)]">
        {/* Stars */}
        {[12,35,58,80,22,65,45,75,5,92].map((x,i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{ left: `${x}%`, top: `${(i * 19) % 80}%`, width: 2, height: 2, opacity: 0.5 }} />
        ))}
        {/* Enemy row */}
        <div className="absolute top-[1rem] left-0 right-0 flex justify-center gap-3">
          {[imgAccidentSrc, imgIllnessSrc, imgDebtSrc, imgIllnessSrc, imgAccidentSrc].map((src, i) => (
            <img key={i} src={src} alt="enemy" className="h-6 w-6 object-contain" />
          ))}
        </div>
        {/* Diving enemy */}
        <img src={imgAccidentSrc} alt="enemy" className="absolute object-contain" style={{
          left: '62%', top: '42%', width: 20, height: 20,
          animation: 'tut-dive 2s ease-in-out infinite',
        }} />
        {/* Player ship */}
        <div className="absolute bottom-[0.9rem] left-1/2 -translate-x-1/2" style={{ animation: 'tut-move 2s ease-in-out infinite' }}>
          <img src={imgPlayerSrc} alt="player" style={{ width: 28, height: 28, objectFit: 'contain' }} />
        </div>
        {/* Laser */}
        <div className="absolute" style={{
          left: 'calc(50% - 1px)', bottom: '3.2rem', width: 2, height: 18,
          background: '#00DFFF', boxShadow: '0 0 6px #00DFFF',
          animation: 'tut-laser 2s ease-in-out infinite',
        }} />
        {/* Hit flash */}
        <div className="absolute top-[1.4rem]" style={{
          left: '60%', width: 22, height: 8, borderRadius: 4,
          background: 'rgba(255,220,0,0.8)',
          animation: 'tut-hit 2s ease-in-out infinite',
        }} />

        <style>{`
          @keyframes tut-dive { 0%,100%{top:42%} 50%{top:62%} }
          @keyframes tut-move { 0%,100%{transform:translateX(-60%)} 50%{transform:translateX(-40%)} }
          @keyframes tut-laser { 0%,100%{opacity:0} 40%,60%{opacity:1} }
          @keyframes tut-hit   { 0%,100%{opacity:0} 50%{opacity:1} }
        `}</style>
      </div>

      {/* Game Legends Section */}
      <div className="mb-[1rem] rounded-[1rem] border border-white/10 bg-white/5 p-[0.75rem]">
        <p className="mb-[0.55rem] text-[0.62rem] font-extrabold uppercase tracking-[0.1em] text-cyan-300">
          Threat Types
        </p>
        <div className="grid grid-cols-2 gap-[0.4rem]">
          {[
            { src: imgAccidentSrc, label: 'Accident', hp: '1 HP · 100 pts', desc: 'Fast, low durability',     color: '#FF4444' },
            { src: imgIllnessSrc,  label: 'Illness',  hp: '2 HP · 200 pts', desc: 'Fires more often',         color: '#33DD44' },
            { src: imgDebtSrc,     label: 'Debt',     hp: '2 HP · 250 pts', desc: 'Dives aggressively',       color: '#AA33FF' },
            { src: imgBossSrc,     label: 'Death',    hp: '8 HP · 1000 pts', desc: 'Boss — high firepower',   color: '#FF1111' },
          ].map(t => (
            <div key={t.label} className="flex items-center gap-[0.45rem] rounded-[0.65rem] bg-black/25 p-[0.4rem]">
              <img src={t.src} alt={t.label} className="h-7 w-7 flex-shrink-0 rounded-md object-contain" />
              <div className="min-w-0">
                <p className="truncate text-[0.7rem] font-extrabold text-white leading-tight">{t.label}</p>
                <p className="text-[0.58rem] font-semibold leading-tight" style={{ color: t.color }}>{t.hp}</p>
                <p className="truncate text-[0.55rem] text-white/55 leading-tight">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-[0.55rem] flex gap-[0.4rem]">
          <div className="flex flex-1 items-center gap-[0.45rem] rounded-[0.65rem] bg-black/25 p-[0.4rem]">
            <img src={imgShieldSrc} alt="shield" className="h-7 w-7 flex-shrink-0 rounded-full object-contain" style={{ background: '#FFD700' }} />
            <div>
              <p className="text-[0.7rem] font-extrabold text-yellow-300 leading-tight">Shield Power-up</p>
              <p className="text-[0.58rem] text-white/55 leading-tight">4s invincibility + 200 pts</p>
            </div>
          </div>
          <div className="flex flex-1 items-center gap-[0.45rem] rounded-[0.65rem] bg-black/25 p-[0.4rem]">
            <img src={imgPlayerSrc} alt="player" className="h-7 w-7 flex-shrink-0 rounded-full object-contain bg-cyan-900" />
            <div>
              <p className="text-[0.7rem] font-extrabold text-cyan-300 leading-tight">Guardian Lives</p>
              <p className="text-[0.58rem] text-white/55 leading-tight">3 lives to protect family</p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onStart}
        className="btn-press min-h-[3.2rem] w-full rounded-full text-[1rem] font-extrabold uppercase tracking-[0.08em] text-white"
        style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 0.45rem 1.6rem rgba(255,200,0,0.45)' }}
      >
        Launch Mission
      </button>
    </div>
  </div>
);

export default HowToPlayPopup;
