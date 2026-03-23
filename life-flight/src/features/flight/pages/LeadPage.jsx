import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext.jsx';
import { CONCERN_OPTIONS } from '../constants/gameConstants.js';
import { submitLead } from '../services/leadService.js';

const LEAD_COPY = {
    call: {
        title: '📞 Talk to an Advisor',
        subtext:
            'Our certified Bajaj Life advisors will help you build a personalized protection plan — in just one call.',
        submitLabel: 'Request a Callback',
    },
    book: {
        title: '📅 Book a Free Consultation',
        subtext:
            'Schedule a no-obligation session with a financial expert and discover the right plan for your life.',
        submitLabel: 'Book My Free Slot',
    },
};

const INITIAL_FORM = { name: '', mobile: '' };
const INITIAL_ERRORS = { name: '', mobile: '' };

export default function LeadPage() {
    const { state, dispatch, ACTIONS, PHASES } = useGame();
    const navigate = useNavigate();
    const mode = state.leadMode || 'call';
    const copy = LEAD_COPY[mode];

    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState(INITIAL_ERRORS);
    const [submitting, setSubmitting] = useState(false);

    const validate = () => {
        const errs = { ...INITIAL_ERRORS };
        let valid = true;

        if (!form.name.trim()) { errs.name = 'Name is required'; valid = false; }
        else if (!/^[A-Za-z\s]+$/.test(form.name.trim())) { errs.name = 'Invalid name'; valid = false; }

        if (!/^\d{10}$/.test(form.mobile)) { errs.mobile = 'Enter a valid 10-digit mobile number'; valid = false; }

        setErrors(errs);
        return valid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);

        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            const result = await submitLead({
                name: form.name.trim(),
                mobile: form.mobile,
                param4: tomorrow.toISOString().split('T')[0],
                param19: '09:00 AM',
                score: state.finalScore,
                p_data_source: 'LIFE_FLIGHT_LEAD'
            });

            if (result.success) {
                if (result.leadNo || result.lead_no) {
                    sessionStorage.setItem('lifeFlightLeadNo', result.leadNo || result.lead_no);
                }
                sessionStorage.setItem('lastSubmittedName', form.name.trim());
                sessionStorage.setItem('lastSubmittedPhone', form.mobile);
                navigate('/gameover');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const field = (label, key, type = 'text', placeholder = '') => (
        <div className="mb-4">
            <label className="block mb-1 font-semibold" style={{ fontSize: 13, color: '#ADE8F4' }}>
                {label}
            </label>
            <input
                type={type}
                value={form[key]}
                onChange={(e) => {
                    setForm((f) => ({ ...f, [key]: e.target.value }));
                    if (errors[key]) setErrors((er) => ({ ...er, [key]: '' }));
                }}
                placeholder={placeholder}
                inputMode={type === 'tel' ? 'numeric' : type === 'number' ? 'numeric' : 'text'}
                className="w-full px-4 py-3 rounded-xl font-medium outline-none transition-all"
                style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: errors[key] ? '1.5px solid #E63946' : '1.5px solid rgba(255,255,255,0.12)',
                    color: '#ffffff',
                    fontSize: 15,
                }}
            />
            {errors[key] && (
                <p className="mt-1" style={{ fontSize: 12, color: '#E63946' }}>{errors[key]}</p>
            )}
        </div>
    );

    return (
        <div
            className="h-full flex flex-col items-center justify-center p-5 translate-y-[-20px]"
            style={{ background: 'linear-gradient(180deg, #00509E 0%, #003366 100%)' }}
        >
            <div
                className="bg-white shadow-2xl w-full max-w-[340px] p-8 border-[5px] border-[#00B4D8] rounded-[2rem]"
            >
                <div className="text-center mb-8">
                    <h2 className="text-[#005BAC] text-3xl font-black mb-2 tracking-tight">Enter Your Details</h2>
                    <p className="text-slate-500 font-bold text-lg">to reveal your score</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2 text-left">
                        <label className="block text-slate-700 text-[12px] font-black uppercase tracking-widest ml-1">Your Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="Full Name"
                            className={`w-full px-4 py-4 border-4 ${errors.name ? 'border-red-400 bg-red-50' : 'border-slate-100 focus:border-[#00B4D8]'} focus:outline-none text-slate-800 font-bold text-lg transition-all rounded-2xl`}
                        />
                        {errors.name && <p className="text-red-500 text-[11px] font-black uppercase tracking-wider ml-1">{errors.name}</p>}
                    </div>

                    <div className="space-y-2 text-left">
                        <label className="block text-slate-700 text-[12px] font-black uppercase tracking-widest ml-1">Mobile Number</label>
                        <input
                            type="tel"
                            maxLength={10}
                            value={form.mobile}
                            onChange={(e) => setForm(f => ({ ...f, mobile: e.target.value.replace(/\D/g, '') }))}
                            placeholder="9876543210"
                            className={`w-full px-4 py-4 border-4 ${errors.mobile ? 'border-red-400 bg-red-50' : 'border-slate-100 focus:border-[#00B4D8]'} focus:outline-none text-slate-800 font-bold text-lg transition-all rounded-2xl`}
                        />
                        {errors.mobile && <p className="text-red-500 text-[11px] font-black uppercase tracking-wider ml-1">{errors.mobile}</p>}
                    </div>

                    <div className="flex items-start gap-3 py-1">
                        <div className="mt-1 shrink-0 w-6 h-6 bg-[#00B4D8] border-2 border-[#00B4D8] flex items-center justify-center rounded-md">
                            <span className="text-white font-black text-sm">✓</span>
                        </div>
                        <p className="text-[12px] font-bold text-slate-600 leading-snug text-left">
                            I agree and consent to the <span className="text-[#00B4D8] underline font-black">T&C and Privacy Policy</span>
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 rounded-2xl text-xl tracking-widest disabled:opacity-50 text-white uppercase font-black transition-all duration-300 shadow-xl"
                        style={{ background: 'linear-gradient(135deg, #00B4D8 0%, #0077b6 100%)' }}
                    >
                        {submitting ? 'Loading...' : 'See Results!'}
                    </button>
                </form>
            </div>
        </div>
    );
}
