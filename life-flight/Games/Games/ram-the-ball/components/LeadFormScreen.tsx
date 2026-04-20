
import React, { useState } from 'react';
import { LeadData } from '../types';

interface LeadFormScreenProps {
  onSubmit: (data: LeadData) => void;
}

const LeadFormScreen: React.FC<LeadFormScreenProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<LeadData>({ fullName: '', mobile: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || formData.fullName.length < 3) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.mobile || formData.mobile.length < 10) {
      setError('Please enter a valid mobile number.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="flex-1 flex flex-col p-6 animate-fadeIn">
      <div className="flex-1 flex flex-col">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Get Your Personalized Plan</h2>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          Fill in your details, and our expert sales team will connect with you to tailor a high-coverage, low-cost term plan for your family.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
            <div className="relative">
              <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-700"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mobile Number</label>
            <div className="relative">
              <i className="fas fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="tel"
                placeholder="+1 234 567 890"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-700"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-500 italic mt-2">{error}</p>}

          <p className="text-[10px] text-slate-400 leading-tight">
            By clicking submit, you agree to allow our sales team to contact you via phone or SMS for enrollment processing.
          </p>
        </form>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 mt-4"
      >
        SUBMIT DETAILS <i className="fas fa-paper-plane text-xs"></i>
      </button>
    </div>
  );
};

export default LeadFormScreen;
