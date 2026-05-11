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
                className="bg-white rounded-[32px] p-8 w-full max-w-[340px] shadow-2xl relative border-[5px] border-primary"
            >
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-dark leading-tight tracking-tight mb-2 uppercase">
                        Enter Details
                    </h2>
                    <p className="text-gray-400 font-bold text-sm leading-tight">
                        To see your personalized results
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                            Your Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                            placeholder="Full Name"
                            className={`w-full bg-gray-50 border-4 rounded-xl px-5 py-4 text-gray-800 placeholder:text-gray-300 font-bold focus:outline-none transition-all ${errors.name ? 'border-red-500' : 'border-slate-100 focus:border-primary'}`}
                        />
                        {errors.name && <p className="text-red-500 text-[10px] font-black ml-1 uppercase">{errors.name}</p>}
                    </div>

                    <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                            Mobile Number
                        </label>
                        <input
                            type="tel"
                            maxLength={10}
                            value={formData.mobile}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                            placeholder="9876543210"
                            className={`w-full bg-gray-50 border-4 rounded-xl px-5 py-4 text-gray-800 placeholder:text-gray-300 font-bold focus:outline-none transition-all ${errors.mobile ? 'border-red-500' : 'border-slate-100 focus:border-primary'}`}
                        />
                        {errors.mobile && <p className="text-red-500 text-[10px] font-black ml-1 uppercase">{errors.mobile}</p>}
                    </div>

                    <div className="flex items-start gap-3 py-1 text-left">
                        <div
                            onClick={() => setIsTermsAccepted(!isTermsAccepted)}
                            className={`mt-0.5 shrink-0 w-6 h-6 border-2 flex items-center justify-center rounded-md cursor-pointer transition-all ${isTermsAccepted ? 'bg-primary border-primary' : `bg-white ${errors.terms ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'border-slate-300'}`}`}
                        >
                            {isTermsAccepted && <span className="text-white font-black text-xs">✓</span>}
                        </div>
                        <p className="text-[11px] font-bold text-gray-500 leading-snug">
                            I agree and consent to the <span onClick={() => setIsTermsModalOpen(true)} className="text-primary underline font-black cursor-pointer">T&C and Privacy Policy</span>
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary text-white font-black text-lg py-4 rounded-2xl shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 tracking-widest uppercase mt-4"
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
