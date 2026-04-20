
import React, { useState } from 'react';
import { UserLead } from '../types';

interface LeadCaptureProps {
  onSubmit: (lead: UserLead) => void;
}

const LeadCapture: React.FC<LeadCaptureProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<UserLead>({ fullName: '', mobile: '' });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(formData.mobile)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setLoading(true);
    // Simulate brief delay for professional feel
    setTimeout(() => {
      onSubmit(formData);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">You've got the strategy!</h2>
        <p className="text-slate-600 mt-2">Ready to secure your child's future? Share your details for a personalized <strong>₹0 Advisory Call</strong>.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
          <input 
            type="text" 
            placeholder="e.g. Rahul Sharma"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Mobile Number</label>
          <div className="relative">
             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">+91</span>
             <input 
              type="tel" 
              placeholder="9876543210"
              maxLength={10}
              className="w-full pl-14 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              value={formData.mobile}
              onChange={(e) => setFormData({...formData, mobile: e.target.value.replace(/\D/g, '')})}
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-xs font-medium bg-red-50 p-2 rounded-lg">{error}</p>}

        <button 
          type="submit"
          disabled={loading}
          className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Processing...</span>
            </>
          ) : (
            <span>Get My Free Plan (₹)</span>
          )}
        </button>
      </form>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div className="flex items-start space-x-3">
          <div className="mt-0.5 text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-600 font-medium">Why we need this?</p>
            <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
              Your details are safe with us. We only use this information to reach out for a one-on-one professional consultation regarding your child's future insurance needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadCapture;
