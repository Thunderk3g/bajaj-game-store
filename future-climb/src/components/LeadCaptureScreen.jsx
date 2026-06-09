import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore, GAME_STATUS } from '../store/useGameStore';
import { submitToLMS } from '../utils/api';
import TermsModal from './TermsModal';

const LeadCaptureScreen = () => {
    const { score, setStatus, setLeadData } = useGameStore();
    const [formData, setFormData] = useState({ name: '', mobile: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTermsAccepted, setIsTermsAccepted] = useState(true);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const errs = {};
        if (!formData.name.trim()) errs.name = 'Name is required';
        else if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) errs.name = 'Letters only';

        if (!/^[6-9]\d{9}$/.test(formData.mobile)) errs.mobile = 'Invalid 10-digit number';

        if (!isTermsAccepted) errs.terms = 'Please agree to Terms and Conditions';

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const result = await submitToLMS({
                name: formData.name,
                mobile_no: formData.mobile,
                score: score,
                summary_dtls: 'Future Climb - Post Game Lead',
            });
            if (result.success) {
                const responseData = result.data || result;
                const ln = responseData.leadNo || responseData.LeadNo;
                if (ln) sessionStorage.setItem('futureClimbLeadNo', ln);
                setLeadData({
                    name: formData.name,
                    phone: formData.mobile,
                    leadNo: ln
                });
                setStatus(GAME_STATUS.CTA);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full items-center justify-center p-6 bg-[#0B1221] relative z-[100]">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-gradient-radial from-primary/10 via-transparent to-transparent" />
            </div>

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="p-8 w-full max-w-[340px] relative border rounded-[32px]"
                style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                }}
            >
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-white leading-tight tracking-tight mb-2 uppercase">
                        Enter Details
                    </h2>
                    <p className="text-slate-400 font-bold text-sm leading-tight">
                        To see your personalized results
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            Your Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                            placeholder="Full Name"
                            className={`w-full bg-white/5 border rounded-2xl px-5 py-4 text-white placeholder:text-white/20 font-bold focus:outline-none transition-all ${errors.name ? 'border-red-500' : 'border-white/10 focus:border-cyan-400 focus:bg-white/10'}`}
                        />
                        {errors.name && <p className="text-red-500 text-[10px] font-black ml-1 uppercase">{errors.name}</p>}
                    </div>

                    <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            Mobile Number
                        </label>
                        <input
                            type="tel"
                            maxLength={10}
                            value={formData.mobile}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                            placeholder="9876543210"
                            className={`w-full bg-white/5 border rounded-2xl px-5 py-4 text-white placeholder:text-white/20 font-bold focus:outline-none transition-all ${errors.mobile ? 'border-red-500' : 'border-white/10 focus:border-cyan-400 focus:bg-white/10'}`}
                        />
                        {errors.mobile && <p className="text-red-500 text-[10px] font-black ml-1 uppercase">{errors.mobile}</p>}
                    </div>

                    <div className="flex items-start gap-3 py-1 text-left">
                        <div
                            onClick={() => setIsTermsAccepted(!isTermsAccepted)}
                            className={`mt-0.5 shrink-0 w-6 h-6 border flex items-center justify-center rounded-md cursor-pointer transition-all ${isTermsAccepted ? 'bg-[#FF8C00] border-[#FF8C00]' : `bg-white/5 ${errors.terms ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'border-white/20'}`}`}
                        >
                            {isTermsAccepted && <span className="text-white font-black text-xs">✓</span>}
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 leading-snug">
                            I agree and consent to the <span onClick={() => setIsTermsModalOpen(true)} className="text-cyan-400 underline font-black cursor-pointer">T&C and Privacy Policy</span>
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-[#FF8C00] to-[#FF7000] hover:from-[#FF7000] hover:to-[#E65C00] text-white font-black text-lg py-4 rounded-2xl shadow-[0_0_15px_rgba(255,140,0,0.35)] hover:shadow-[0_0_20px_rgba(255,140,0,0.5)] active:scale-95 transition-all disabled:opacity-50 tracking-widest uppercase mt-4 border border-white/10"
                    >
                        {isSubmitting ? 'LOADING...' : 'See Results!'}
                    </button>
                    {errors.terms && !isTermsAccepted && <p className="text-red-500 text-[10px] font-black text-center uppercase">{errors.terms}</p>}
                </form>
            </motion.div>

            <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
        </div>
    );
};

export default LeadCaptureScreen;
