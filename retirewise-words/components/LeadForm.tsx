
import React, { useState } from 'react';
import { LeadData } from '../types';

interface Props {
  onSubmit: (data: LeadData) => void;
}

const LeadForm: React.FC<Props> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<LeadData>({ fullName: '', mobile: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.mobile) {
      setError('Please fill in all fields');
      return;
    }
    if (formData.mobile.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid mobile number');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="flex-1 flex flex-col p-8 bg-white">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Secure Your Future</h2>
        <p className="text-slate-500">Enter your details and our expert advisors will create a custom Annuity Plan for you.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
          <input 
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-slate-800"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Mobile Number</label>
          <input 
            type="tel"
            required
            value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-slate-800"
            placeholder="+91 98765 43210"
          />
        </div>

        {error && <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

        <div className="pt-4">
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl text-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
          >
            Connect With Expert
          </button>
        </div>
      </form>

      <p className="mt-8 text-xs text-center text-slate-400">
        By submitting, you agree to be contacted by our sales team regarding retirement products.
      </p>
    </div>
  );
};

export default LeadForm;
