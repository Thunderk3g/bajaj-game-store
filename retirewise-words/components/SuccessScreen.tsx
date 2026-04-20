
import React from 'react';

interface Props {
  name: string;
}

const SuccessScreen: React.FC<Props> = ({ name }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-green-50">
      <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-green-200">
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">You're All Set, {name.split(' ')[0]}!</h2>
      <p className="text-slate-600 text-lg leading-relaxed mb-8">
        Your retirement blueprint is being prepared. One of our Senior Annuity Specialists will contact you within 24 hours.
      </p>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-green-100 w-full mb-10">
        <h4 className="font-bold text-slate-900 mb-2">What's Next?</h4>
        <ul className="text-sm text-slate-500 text-left space-y-3">
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            Verification of your details
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            Personalized Income Projection
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            Step-by-step enrollment guide
          </li>
        </ul>
      </div>

      <button 
        onClick={() => window.location.reload()}
        className="text-blue-600 font-bold hover:underline"
      >
        Play Again
      </button>
    </div>
  );
};

export default SuccessScreen;
