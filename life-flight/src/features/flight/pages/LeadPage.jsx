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

const INITIAL_FORM = { name: '', mobile: '', age: '', concern: '' };
const INITIAL_ERRORS = { name: '', mobile: '', age: '', concern: '' };

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
        if (!/^\d{10}$/.test(form.mobile)) { errs.mobile = 'Enter a valid 10-digit mobile number'; valid = false; }
        const age = parseInt(form.age, 10);
        if (!form.age || isNaN(age) || age < 18 || age > 65) {
            errs.age = 'Age must be between 18 and 65'; valid = false;
        }
        if (!form.concern) { errs.concern = 'Please select a concern'; valid = false; }

        setErrors(errs);
        return valid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);

        await submitLead({
            name: form.name.trim(),
            mobile: form.mobile,
            age: form.age,
            concern: form.concern,
            score: state.finalScore,
            mode,
        });

        dispatch({ type: ACTIONS.SUBMIT_SUCCESS });
        navigate('/success');
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
            className="h-full flex flex-col pb-8 no-scrollbar overflow-y-auto"
            style={{ background: 'linear-gradient(180deg, #0A2540 0%, #021A38 100%)' }}
        >
            {/* Back arrow */}
            <div className="px-5 pt-5 pb-2">
                <button
                    onClick={() => navigate('/gameover')}
                    className="flex items-center gap-2 transition-opacity active:opacity-60"
                    style={{ color: '#90E0EF', fontSize: 14, background: 'none', border: 'none' }}
                >
                    ← Back
                </button>
            </div>

            <div className="px-5">
                {/* Header */}
                <h1 className="font-black mb-2" style={{ fontSize: 24, color: '#ffffff', lineHeight: 1.2 }}>
                    {copy.title}
                </h1>
                <p className="mb-8 leading-relaxed" style={{ fontSize: 14, color: '#ADE8F4' }}>
                    {copy.subtext}
                </p>

                {/* Score context */}
                <div
                    className="rounded-2xl px-4 py-3 mb-6 flex items-center gap-3"
                    style={{ background: 'rgba(0,180,216,0.10)', border: '1px solid rgba(0,180,216,0.25)' }}
                >
                    <span style={{ fontSize: 22 }}>🎮</span>
                    <p style={{ fontSize: 13, color: '#ADE8F4' }}>
                        Your game score: <strong style={{ color: '#00B4D8' }}>{state.finalScore} hurdles cleared</strong>
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate>
                    {field('Full Name *', 'name', 'text', 'Enter your full name')}
                    {field('Mobile Number *', 'mobile', 'tel', 'Enter 10-digit mobile number')}
                    {field('Age *', 'age', 'number', 'Enter your age (18–65)')}

                    {/* Concern dropdown */}
                    <div className="mb-6">
                        <label className="block mb-1 font-semibold" style={{ fontSize: 13, color: '#ADE8F4' }}>
                            Primary Concern *
                        </label>
                        <select
                            value={form.concern}
                            onChange={(e) => {
                                setForm((f) => ({ ...f, concern: e.target.value }));
                                if (errors.concern) setErrors((er) => ({ ...er, concern: '' }));
                            }}
                            className="w-full px-4 py-3 rounded-xl font-medium outline-none appearance-none"
                            style={{
                                background: 'rgba(255,255,255,0.07)',
                                border: errors.concern ? '1.5px solid #E63946' : '1.5px solid rgba(255,255,255,0.12)',
                                color: form.concern ? '#ffffff' : 'rgba(255,255,255,0.4)',
                                fontSize: 15,
                            }}
                        >
                            <option value="" disabled style={{ color: '#1a1a2e' }}>Select your main concern</option>
                            {CONCERN_OPTIONS.map((opt) => (
                                <option key={opt} value={opt} style={{ color: '#1a1a2e', background: '#fff' }}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                        {errors.concern && (
                            <p className="mt-1" style={{ fontSize: 12, color: '#E63946' }}>{errors.concern}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 rounded-2xl font-bold text-white transition-all active:scale-95 disabled:opacity-60"
                        style={{
                            fontSize: 16,
                            background: 'linear-gradient(135deg, #00B4D8 0%, #2DC653 100%)',
                            boxShadow: '0 8px 24px rgba(0,180,216,0.35)',
                        }}
                    >
                        {submitting ? '⏳ Submitting...' : `✅ ${copy.submitLabel}`}
                    </button>

                    <p className="text-center mt-3" style={{ fontSize: 12, color: 'rgba(173,232,244,0.5)' }}>
                        No obligation. Just clarity.
                    </p>
                </form>
            </div>
        </div>
    );
}
