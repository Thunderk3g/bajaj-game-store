
import React from 'react';

interface Props {
  onNext: () => void;
}

const EducationScreen: React.FC<Props> = ({ onNext }) => {
  return (
    <div className="flex-1 flex flex-col p-8 bg-slate-50">
      <div className="mb-8">
        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-full mb-4">THE SOLUTION</span>
        <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">Annuity Plans: Your Lifelong Paycheck</h2>
      </div>

      <div className="space-y-4 flex-1">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
          <div className="bg-green-100 p-2 rounded-lg">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Guaranteed Income</h3>
            <p className="text-sm text-slate-500">Pay a lump sum once, receive monthly or yearly income for the rest of your life.</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Flexibility</h3>
            <p className="text-sm text-slate-500">Start receiving income immediately or defer it for a few years to grow your returns.</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
          <div className="bg-purple-100 p-2 rounded-lg">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Family Protection</h3>
            <p className="text-sm text-slate-500">Options to return the purchase price to your family after your death.</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button 
          onClick={onNext}
          className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl text-xl shadow-xl hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          Get Personalized Quote
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default EducationScreen;
