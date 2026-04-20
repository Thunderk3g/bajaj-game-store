
import React from 'react';

interface Props {
  onStart: () => void;
}

const StartScreen: React.FC<Props> = ({ onStart }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-between p-8 text-center bg-gradient-to-b from-blue-50 to-white">
      <div className="mt-12">
        <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
          The <span className="text-blue-600">Balance</span> Challenge
        </h1>
        <p className="text-slate-600 text-lg leading-relaxed px-2">
          Can you balance your retirement plan? Complete the financial grid to secure your future!
        </p>
      </div>

      <div className="w-full space-y-6">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-4 text-left">
          <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">1</div>
          <p className="text-sm text-slate-700 font-medium">Fill the 4x4 grid with financial icons.</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-4 text-left">
          <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">2</div>
          <p className="text-sm text-slate-700 font-medium">Each row and column must contain unique items.</p>
        </div>
        
        <button 
          onClick={onStart}
          className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl text-xl shadow-lg hover:bg-slate-800 active:scale-95 transition-all"
        >
          Start Puzzle
        </button>
        <p className="text-xs text-slate-400">Quick 45-second challenge</p>
      </div>
    </div>
  );
};

export default StartScreen;
