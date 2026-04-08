import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { submitToLMS } from '../services/apiClient';
import TermsModal from './TermsModal';

const PostGameLeadCapture = ({ onSuccess, score }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isTermsAccepted, setIsTermsAccepted] = useState(true);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!name.trim()) newErrors.name = 'Name is required';
        else if (!/^[A-Za-z\s]+$/.test(name.trim())) newErrors.name = 'Letters only';

        if (!/^[6-9]\d{9}$/.test(phone)) newErrors.phone = 'Invalid 10-digit number';

        if (!isTermsAccepted) newErrors.terms = 'Please agree to Terms and Conditions';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const formData = {
                name: name.trim(),
                mobile_no: phone,
                score: score,
                summary_dtls: 'Life Shield Bomber - Post Game Lead'
            };
            const result = await submitToLMS(formData);

            if (result.success) {
                const responseData = result.data || result;
                if (responseData.leadNo || responseData.LeadNo) {
                    sessionStorage.setItem('lifeShieldBomberLeadNo', responseData.leadNo || responseData.LeadNo);
                }
                onSuccess({ name: name.trim(), mobile: phone });
            } else {
                setErrors({ submit: result.error || 'Submission failed' });
            }
        } catch (err) {
            setErrors({ submit: 'Something went wrong' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-[#1e1b4b] rounded-[2.5rem] p-8 w-full max-w-[380px] border-4 border-[#60a5fa] shadow-[0_0_50px_rgba(59,130,246,0.5)]"
            >
                <div className="text-center mb-8">
                    <h2 className="text-white text-3xl font-black mb-2 tracking-tighter uppercase italic leading-none text-left">
                        Enter <span className="text-[#60a5fa]">Details</span>
                    </h2>
                    <p className="text-blue-200 font-bold text-lg text-left italic">To see the results</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div className="space-y-1.5">
                        <label className="block text-blue-300 text-[10px] font-black uppercase tracking-widest ml-1">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                            placeholder="e.g. Rahul Sharma"
                            className={`w-full bg-white/5 border-2 rounded-2xl px-5 py-3.5 text-white placeholder:text-white/20 font-bold focus:outline-none transition-all ${errors.name ? 'border-red-500 bg-red-500/10' : 'border-[#60a5fa]/30 focus:border-[#60a5fa]'}`}
                        />
                        {errors.name && <p className="text-red-400 text-[10px] font-black uppercase tracking-wider ml-1">{errors.name}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-blue-300 text-[10px] font-black uppercase tracking-widest ml-1">Mobile Number</label>
                        <input
                            type="tel"
                            maxLength={10}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="9876543210"
                            className={`w-full bg-white/5 border-2 rounded-2xl px-5 py-3.5 text-white placeholder:text-white/20 font-bold focus:outline-none transition-all ${errors.phone ? 'border-red-500 bg-red-500/10' : 'border-[#60a5fa]/30 focus:border-[#60a5fa]'}`}
                        />
                        {errors.phone && <p className="text-red-400 text-[10px] font-black uppercase tracking-wider ml-1">{errors.phone}</p>}
                    </div>

                    <div className="flex items-start gap-4 py-1">
                        <div
                            onClick={() => setIsTermsAccepted(!isTermsAccepted)}
                            className={`mt-1 shrink-0 w-6 h-6 border-2 flex items-center justify-center rounded-lg cursor-pointer transition-all ${isTermsAccepted ? 'bg-[#60a5fa] border-[#60a5fa]' : `bg-transparent ${errors.terms ? 'border-red-500' : 'border-[#60a5fa]/30'}`}`}
                        >
                            {isTermsAccepted && <span className="text-[#1e1b4b] font-black text-xs">✓</span>}
                        </div>
                        <p className="text-[10px] font-bold text-blue-200/60 leading-snug">
                            I agree and consent to the <span onClick={() => setIsTermsModalOpen(true)} className="text-white underline font-black cursor-pointer hover:text-[#60a5fa] transition-colors">T&C and Privacy Policy</span>
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 bg-[#60a5fa] hover:bg-[#3b82f6] text-[#1e1b4b] font-black text-xl tracking-widest disabled:opacity-50 transition-all duration-300 shadow-[0_8px_0_#1e3a8a] active:scale-[0.98] active:shadow-none rounded-2xl border-none uppercase italic"
                    >
                        {isSubmitting ? 'Processing...' : 'Get Results!'}
                    </button>

                    {errors.submit && <p className="text-red-400 text-sm font-black text-center mt-2">{errors.submit}</p>}
                    {errors.terms && !isTermsAccepted && <p className="text-red-400 text-[10px] font-black uppercase text-center">{errors.terms}</p>}
                </form>
            </motion.div>

            <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
        </div>
    );
};

export default PostGameLeadCapture;
