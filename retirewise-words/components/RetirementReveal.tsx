
import React from 'react';

interface Props {
  score: number;
  onNext: () => void;
}

const RetirementReveal: React.FC<Props> = ({ score, onNext }) => {
  const years = 20;
  const monthlyPotential = Math.floor(score / (years * 12));

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
      <div className="animate-bounce mb-8">
        <span className="text-6xl">📖</span>
      </div>
      
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Challenge Mastered!</h2>
      <p className="text-slate-500 mb-8 font-medium">You clearly understand the value of financial security.</p>
      
      <div className="w-full bg-slate-50 rounded-3xl p-8 border border-slate-100 mb-8 relative">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Standard Retirement Goal</p>
        <p className="text-5xl font-black text-blue-600 mb-6">₹50,00,000</p>
        
        <div className="h-px bg-slate-200 w-full mb-6"></div>
        
        <p className="text-sm font-medium text-slate-600 mb-2 italic">A big word, but a bigger responsibility...</p>
        <p className="text-slate-800 font-semibold text-lg">
          To maintain your current standard, you need <span className="text-blue-600">Guaranteed Income</span> that never runs out.
        </p>
      </div>

      <p className="text-slate-600 text-sm mb-10 px-4 leading-relaxed">
        Now that you've mastered the <span className="font-bold text-slate-900 underline decoration-blue-500 decoration-2">Vocab</span>, let's look at the <span className="font-bold text-slate-900">Plan</span>.
      </p>

      <button 
        onClick={onNext}
        className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl text-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
      >
        Unlock the Annuity Blueprint
      </button>
    </div>
  );
};

export default RetirementReveal;
