
import React from 'react';

interface SummaryScreenProps {
  score: number;
  onContinue: () => void;
}

const SummaryScreen: React.FC<SummaryScreenProps> = ({ score, onContinue }) => {
  return (
    <div className="flex-1 flex flex-col p-6 animate-slideUp">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <i className="fas fa-trophy text-3xl text-green-600"></i>
        </div>
        
        <h2 className="text-xl font-bold text-slate-800 mb-1">Excellent Job!</h2>
        <p className="text-slate-500 text-sm mb-6">You secured your family with virtual cover.</p>
        
        <div className="bg-blue-600 text-white w-full rounded-2xl p-6 mb-8 shadow-xl">
          <div className="text-xs uppercase opacity-80 mb-1">Total Coverage Protected</div>
          <div className="text-4xl font-black">${score.toLocaleString()}</div>
        </div>

        <div className="text-left space-y-4">
          <p className="text-sm text-slate-600 font-medium">
            In the game, protection was free. In real life, Term Insurance makes high coverage affordable.
          </p>
          <ul className="text-xs text-slate-500 space-y-2">
            <li><i className="fas fa-check text-green-500 mr-2"></i> Only protection, no money back.</li>
            <li><i className="fas fa-check text-green-500 mr-2"></i> Low premiums for young earners.</li>
            <li><i className="fas fa-check text-green-500 mr-2"></i> Best for loan liabilities.</li>
          </ul>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
      >
        SECURE REAL COVER <i className="fas fa-arrow-right text-xs"></i>
      </button>
    </div>
  );
};

export default SummaryScreen;
