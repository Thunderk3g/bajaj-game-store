
import React from 'react';

const SuccessScreen: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col p-6 animate-fadeIn items-center justify-center text-center">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <i className="fas fa-check-circle text-5xl text-green-600"></i>
      </div>
      
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Request Received!</h2>
      <p className="text-slate-600 text-sm mb-8">
        Thank you for your interest in securing your future. Our expert consultants will reach out to you within 24 hours to discuss your Term Life Insurance plan.
      </p>

      <div className="bg-slate-50 rounded-2xl p-6 w-full text-left space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Next Steps</h4>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">1</div>
          <p className="text-xs text-slate-600">Verification call from our enrollment team.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">2</div>
          <p className="text-xs text-slate-600">Customized quote based on your age and income.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">3</div>
          <p className="text-xs text-slate-600">Instant digital enrollment with zero paperwork.</p>
        </div>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="mt-12 text-blue-600 font-bold text-sm underline decoration-blue-200 underline-offset-4"
      >
        Play Again
      </button>
    </div>
  );
};

export default SuccessScreen;
