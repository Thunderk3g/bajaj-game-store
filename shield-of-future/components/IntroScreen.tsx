
import React from 'react';

interface IntroScreenProps {
  onStart: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onStart }) => {
  return (
    <div className="flex-1 flex flex-col p-6 animate-fadeIn">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <i className="fas fa-shield-alt text-4xl text-blue-600"></i>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Shield of Future</h1>
        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          Term Life Insurance is the ultimate safety net. Low cost, high coverage. 
          Protect your family for 10, 20, or 30 years.
        </p>
        
        <div className="space-y-4 w-full mb-8">
          <div className="flex items-start bg-blue-50 p-3 rounded-lg">
            <i className="fas fa-hand-holding-usd mt-1 mr-3 text-blue-500"></i>
            <div className="text-left">
              <h3 className="font-semibold text-sm text-slate-800">Low Cost</h3>
              <p className="text-xs text-slate-500">Premium prices that fit your budget.</p>
            </div>
          </div>
          <div className="flex items-start bg-green-50 p-3 rounded-lg">
            <i className="fas fa-chart-line mt-1 mr-3 text-green-500"></i>
            <div className="text-left">
              <h3 className="font-semibold text-sm text-slate-800">High Coverage</h3>
              <p className="text-xs text-slate-500">Max protection for loans & family needs.</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-xs text-amber-800 italic">
          "Launch 'Coverage Shields' to clear your family's risks in this quick challenge!"
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 mt-4"
      >
        PLAY NOW <i className="fas fa-play text-xs"></i>
      </button>
    </div>
  );
};

export default IntroScreen;
