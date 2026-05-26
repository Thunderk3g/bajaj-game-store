import React from 'react';
import imgChildSrc    from '../src/assets/child_runner.png';
import imgIllnessSrc  from '../src/assets/obstacle_illness.png';
import imgAccidentSrc from '../src/assets/obstacle_accident.png';
import imgDebtSrc     from '../src/assets/obstacle_debt.png';
import imgCoinSrc     from '../src/assets/coin_savings.png';
import imgShieldSrc   from '../src/assets/powerup_shield.png';

interface Props { onStart: () => void }

const HowToPlayPopup: React.FC<Props> = ({ onStart }) => (
  <div className="absolute inset-0 z-50 flex items-center justify-center" style={{background:'rgba(0,10,30,0.82)', backdropFilter:'blur(3px)'}}>
    <div className="w-full max-w-sm mx-3 rounded-3xl flex flex-col overflow-hidden" style={{background:'linear-gradient(160deg,#0f172a,#1e3a8a)', border:'1px solid rgba(255,255,255,0.15)', maxHeight:'calc(100vh - 2rem)'}}>
    <div className="overflow-y-auto px-4 py-4 flex flex-col items-center">

    {/* Header */}
    <h2 className="text-2xl font-extrabold tracking-tight text-white mb-4">HOW TO PLAY</h2>

    {/* Tutorial Animation Section */}
    <div className="w-full rounded-2xl bg-white/10 border border-white/20 p-4 mb-4">
      <p className="text-[0.72rem] font-bold uppercase tracking-wider text-blue-200 mb-3 text-center">
        Tap / Click to Jump
      </p>
      {/* Animated scene */}
      <div className="relative h-24 w-full rounded-xl overflow-hidden"
        style={{background:'linear-gradient(180deg,#93C5FD 0%,#BFDBFE 60%,#4ADE80 60%,#22C55E 100%)'}}>
        {/* sun */}
        <div className="absolute top-2 right-4 w-8 h-8 rounded-full bg-yellow-300 shadow-lg" style={{boxShadow:'0 0 12px 4px #FDE68A'}} />
        {/* child */}
        <img src={imgChildSrc}
          className="absolute bottom-5 left-10 h-10 w-auto animate-bounce"
          style={{animationDuration:'0.5s', filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'}}
          alt="child runner" />
        {/* obstacle ahead */}
        <img src={imgIllnessSrc}
          className="absolute bottom-5 right-10 h-8 w-auto"
          style={{filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'}}
          alt="obstacle" />
        {/* tap hint arrow */}
        <div className="absolute bottom-14 left-14 text-white font-extrabold text-xl animate-ping" style={{animationDuration:'1.2s'}}>👆</div>
      </div>
      <p className="mt-2 text-center text-[0.65rem] text-blue-200">
        Double-tap for a second jump to clear tall obstacles!
      </p>
    </div>

    {/* Game Legends Section */}
    <div className="w-full rounded-2xl bg-white/10 border border-white/20 p-2.5 mb-2">
      <p className="text-[0.7rem] font-bold uppercase tracking-wider text-blue-200 mb-2 text-center">
        What You'll Meet
      </p>

      {/* Obstacle types */}
      <div className="grid grid-cols-3 gap-1.5 mb-2">
        {[
          { src: imgIllnessSrc,  label: 'Illness',  sub: 'Easy jump',   color: '#FCA5A5' },
          { src: imgAccidentSrc, label: 'Accident', sub: 'Jump high',   color: '#FED7AA' },
          { src: imgDebtSrc,     label: 'Debt',     sub: 'Time it',     color: '#C4B5FD' },
        ].map(item => (
          <div key={item.label}
            className="flex flex-col items-center rounded-xl p-1.5"
            style={{background:'rgba(0,0,0,0.25)', border:`1px solid ${item.color}44`}}>
            <img src={item.src} className="h-7 w-auto mb-0.5 object-contain" alt={item.label} />
            <span className="text-[0.58rem] font-extrabold text-white">{item.label}</span>
            <span className="text-[0.5rem] text-white/60 text-center leading-tight">{item.sub}</span>
          </div>
        ))}
      </div>

      {/* Collectibles */}
      <div className="flex gap-2">
        <div className="flex flex-1 items-center gap-1.5 rounded-xl p-1.5" style={{background:'rgba(0,0,0,0.25)', border:'1px solid #FCD34D44'}}>
          <img src={imgCoinSrc} className="h-7 w-7 object-contain flex-shrink-0" alt="savings coin" />
          <div>
            <div className="text-[0.6rem] font-extrabold text-yellow-300">Savings Coin</div>
            <div className="text-[0.5rem] text-white/60 leading-tight">+500 pts each</div>
          </div>
        </div>
        <div className="flex flex-1 items-center gap-1.5 rounded-xl p-1.5" style={{background:'rgba(0,0,0,0.25)', border:'1px solid #60A5FA44'}}>
          <img src={imgShieldSrc} className="h-7 w-7 object-contain flex-shrink-0" alt="parent shield" />
          <div>
            <div className="text-[0.6rem] font-extrabold text-blue-300">Parent Shield</div>
            <div className="text-[0.5rem] text-white/60 leading-tight">Blocks 1 hit</div>
          </div>
        </div>
      </div>
    </div>

    {/* Objective strip */}
    <div className="w-full rounded-xl bg-emerald-900/60 border border-emerald-400/30 px-3 py-2 mb-3 text-center">
      <p className="text-[0.68rem] font-extrabold uppercase tracking-wide text-emerald-300 mb-0">Your Goal</p>
      <p className="text-[0.65rem] text-white/80">Run <span className="font-bold text-white">2000 m</span>, collect savings &amp; avoid risks. <span className="text-red-300 font-bold">3 lives ❤️</span></p>
    </div>

    {/* Start button */}
    <button
      onClick={onStart}
      className="w-full max-w-xs rounded-2xl py-4 text-base font-extrabold tracking-wide text-white shadow-xl active:scale-95 transition-transform"
      style={{background:'linear-gradient(135deg,#F97316,#F59E0B)', boxShadow:'0 0 24px rgba(249,115,22,0.55)'}}>
      ▶ START RUNNING
    </button>
    </div>
    </div>
  </div>
);

export default HowToPlayPopup;
