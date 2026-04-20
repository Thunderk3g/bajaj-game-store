
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
          RetireWise <span className="text-blue-600">Vocab</span>
        </h1>
        <p className="text-slate-600 text-lg leading-relaxed px-2">
          Master the words that secure your future. Unscramble key terms to unlock your retirement plan!
        </p>
      </div>

      <div className="w-full space-y-6">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-4 text-left">
          <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">1</div>
          <p className="text-sm text-slate-700 font-medium">Unscramble <span className="text-blue-700 font-bold">3 key terms</span> about insurance.</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-4 text-left">
          <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">2</div>
          <p className="text-sm text-slate-700 font-medium">Earn your <span className="text-green-600 font-bold">Retirement Blueprint</span> at the end.</p>
        </div>
        
        <button 
          onClick={onStart}
          className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl text-xl shadow-lg hover:bg-slate-800 active:scale-95 transition-all"
        >
          Begin Challenge
        </button>
        <p className="text-xs text-slate-400">Takes less than a minute</p>
      </div>
    </div>
  );
};

export default StartScreen;
