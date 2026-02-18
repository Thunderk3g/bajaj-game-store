import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Button } from './ui/Button';
import { READINESS_BANDS } from '../constants/journeySteps';
import { cn } from '../utils/cn';

const Results = ({ score, selections, onReset, insights, scoreBreakdown }) => {
    const [formState, setFormState] = useState({ name: '', mobile: '', date: '', time: '' });
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Counting animation for the score
    const count = useMotionValue(0);
    const roundedCount = useTransform(count, (latest) => Math.round(latest));
    const [displayCount, setDisplayCount] = useState(0);

    useEffect(() => {
        const animation = animate(count, score, {
            duration: 1.5,
            delay: 0.5,
            ease: "easeOut",
            onUpdate: (latest) => setDisplayCount(Math.round(latest))
        });

        return animation.stop;
    }, [score, count]);

    const band = READINESS_BANDS.find(b => score >= b.min) || READINESS_BANDS[READINESS_BANDS.length - 1];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Lead Captured:", {
            ...formState,
            score,
            ...scoreBreakdown,
            timestamp: new Date().toISOString()
        });
        setTimeout(() => setIsSubmitted(true), 1000);
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Score Section */}
            <div className="text-center space-y-6 bg-primary-500 rounded-[2rem] p-10 text-white shadow-2xl shadow-primary-500/30">
                <p className="text-[0.875rem] font-bold tracking-[0.2em] uppercase opacity-80">Your Preparedness Score</p>

                <div className="relative inline-flex flex-col items-center justify-center">
                    <svg className="w-[12rem] h-[12rem] -rotate-90">
                        <circle
                            cx="96" cy="96" r="88"
                            fill="transparent"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="12"
                        />
                        <motion.circle
                            cx="96" cy="96" r="88"
                            fill="transparent"
                            stroke="#ffffff"
                            strokeWidth="12"
                            strokeDasharray="552.9"
                            initial={{ strokeDashoffset: 552.9 }}
                            animate={{ strokeDashoffset: 552.9 * (1 - score / 100) }}
                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1, duration: 0.5 }}
                            className="text-[4rem] font-black leading-none"
                        >
                            {displayCount}
                        </motion.span>
                        <span className="text-[1rem] font-bold opacity-70">/ 100</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-[2rem] font-black tracking-tight flex items-center justify-center gap-2">
                        {band.icon} <span style={{ color: band.color }}>{band.label.toUpperCase()}</span>
                    </h2>
                    <p className="text-[1.125rem] opacity-90 max-w-[24rem] mx-auto font-medium">
                        {band.description}
                    </p>
                </div>
            </div>

            {/* Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {insights.map((insight, idx) => (
                    <div key={idx} className="bg-white border-2 border-slate-50 p-6 rounded-[1.25rem] shadow-sm flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-[1.25rem]">{insight.label.split(' ')[0]}</span>
                            <span className="text-[0.75rem] font-bold text-primary-500 uppercase tracking-wider">
                                {insight.label.split(' ').slice(1).join(' ')}
                            </span>
                        </div>
                        <p className="text-[0.9375rem] font-semibold text-slate-700 leading-snug">{insight.text}</p>
                    </div>
                ))}
            </div>

            {/* Conversion Section */}
            <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 overflow-hidden relative">
                <div className="relative z-10 space-y-8">
                    <div className="text-center space-y-2">
                        <h3 className="text-[1.5rem] font-bold text-slate-900">Expert Guidance awaits you</h3>
                        <p className="text-slate-500">To improve your retirement readiness score, connect with our advisor for personalized planning.</p>
                    </div>

                    <div className="space-y-4">
                        <Button className="w-full h-[4rem] bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-[1.125rem] font-bold shadow-lg shadow-orange-500/30">
                            📞 CALL NOW
                        </Button>

                        <div className="flex items-center gap-4 text-slate-300">
                            <div className="flex-1 h-px bg-current" />
                            <span className="text-[0.75rem] font-bold uppercase tracking-widest">or book a slot</span>
                            <div className="flex-1 h-px bg-current" />
                        </div>

                        {!isSubmitted ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        required
                                        name="name"
                                        placeholder="Full Name *"
                                        className="h-[3.5rem] bg-white border-2 border-slate-100 rounded-[0.75rem] px-4 focus:border-primary-500 outline-none transition-all"
                                        onChange={handleInputChange}
                                    />
                                    <input
                                        required
                                        name="mobile"
                                        type="tel"
                                        pattern="[0-9]{10}"
                                        placeholder="Mobile Number (10 digits) *"
                                        className="h-[3.5rem] bg-white border-2 border-slate-100 rounded-[0.75rem] px-4 focus:border-primary-500 outline-none transition-all"
                                        onChange={handleInputChange}
                                    />
                                    <input
                                        required
                                        type="date"
                                        name="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        className="h-[3.5rem] bg-white border-2 border-slate-100 rounded-[0.75rem] px-4 focus:border-primary-500 outline-none transition-all"
                                        onChange={handleInputChange}
                                    />
                                    <select
                                        required
                                        name="time"
                                        className="h-[3.5rem] bg-white border-2 border-slate-100 rounded-[0.75rem] px-4 focus:border-primary-500 outline-none transition-all appearance-none"
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Preferred Time *</option>
                                        <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                                        <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                                        <option value="12:00 PM - 01:00 PM">12:00 PM - 01:00 PM</option>
                                        <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                                        <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM</option>
                                        <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                                    </select>
                                </div>
                                <Button type="submit" className="w-full h-[3.5rem] bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold">
                                    BOOK A SLOT
                                </Button>
                            </form>
                        ) : (
                            <div className="text-center py-8 space-y-2 bg-emerald-50 rounded-[1rem] border border-emerald-100">
                                <div className="text-[2rem]">✅</div>
                                <h4 className="text-emerald-800 font-bold">Slot Booked Successfully!</h4>
                                <p className="text-emerald-600/80 text-[0.875rem]">Thank you {formState.name}! Our Bajaj Life advisor will contact you shortly.</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onReset}
                        className="w-full text-slate-400 text-[0.875rem] font-bold uppercase tracking-widest hover:text-primary-500 transition-colors"
                    >
                        Retake Assessment
                    </button>
                </div>
            </div>
        </div>
    );
};


export default Results;
