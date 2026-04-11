import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { submitToLMS } from '../../../services/api';
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
                summary_dtls: 'One Life - Post Game Lead'
            };
            const result = await submitToLMS(formData);

            if (result.success) {
                const responseData = result.data || result;
                if (responseData.leadNo || responseData.LeadNo) {
                    sessionStorage.setItem('oneLifeLeadNo', responseData.leadNo || responseData.LeadNo);
                }
                onSuccess({ name: name.trim(), phone: phone });
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
        <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-[#0B1221]/90 backdrop-blur-xl p-6">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-[#151f33] rounded-[2.5rem] p-8 w-full max-w-[400px] border-4 border-[#00c6ff]/30 shadow-[0_0_50px_rgba(0,198,255,0.2)] relative overflow-hidden"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00c6ff]/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full -ml-16 -mb-16 blur-3xl" />

                <div className="text-center mb-8 relative z-10">
                    <h2 className="text-white text-3xl font-black mb-2 tracking-tight uppercase leading-none text-left drop-shadow-sm">
                        Enter Your Details
                    </h2>
                    <p className="text-blue-300 font-bold text-lg text-left opacity-90">To see the results</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 text-left relative z-10">
                    <div className="space-y-1.5">
                        <label className="block text-blue-200 text-[10px] font-black uppercase tracking-[0.2em] ml-1 opacity-60">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                            placeholder="Full Name"
                            className={`w-full bg-[#0B1221]/50 border-2 rounded-2xl px-6 py-4 text-white placeholder:text-blue-400/20 font-bold focus:outline-none transition-all ${errors.name ? 'border-red-500 bg-red-500/5' : 'border-white/5 focus:border-[#00c6ff]'}`}
                        />
                        {errors.name && <p className="text-red-400 text-[10px] font-black uppercase tracking-wider ml-1">{errors.name}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-blue-200 text-[10px] font-black uppercase tracking-[0.2em] ml-1 opacity-60">Mobile Number</label>
                        <input
                            type="tel"
                            maxLength={10}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="Mobile Number"
                            className={`w-full bg-[#0B1221]/50 border-2 rounded-2xl px-6 py-4 text-white placeholder:text-blue-400/20 font-bold focus:outline-none transition-all ${errors.phone ? 'border-red-500 bg-red-500/5' : 'border-white/5 focus:border-[#00c6ff]'}`}
                        />
                        {errors.phone && <p className="text-red-400 text-[10px] font-black uppercase tracking-wider ml-1">{errors.phone}</p>}
                    </div>

                    <div className="flex items-start gap-4 py-1">
                        <div
                            onClick={() => setIsTermsAccepted(!isTermsAccepted)}
                            className={`mt-1 shrink-0 w-6 h-6 border-2 flex items-center justify-center rounded-lg cursor-pointer transition-all ${isTermsAccepted ? 'bg-[#00c6ff] border-[#00c6ff]' : 'bg-transparent border-white/10'}`}
                        >
                            {isTermsAccepted && <span className="text-[#0B1221] font-black text-xs">✓</span>}
                        </div>
                        <p className="text-[10px] font-bold text-blue-300/40 leading-relaxed">
                            I agree and consent to the <span onClick={() => setIsTermsModalOpen(true)} className="text-white underline font-black cursor-pointer hover:text-[#00c6ff] transition-colors">T&C and Privacy Policy</span>
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 bg-gradient-to-r from-[#00c6ff] to-[#0072ff] hover:from-[#33d4ff] hover:to-[#338aff] text-white font-black text-lg tracking-[0.1em] disabled:opacity-50 transition-all duration-300 shadow-[0_10px_25px_rgba(0,198,255,0.2)] active:scale-[0.98] active:shadow-none rounded-2xl border-none uppercase"
                    >
                        {isSubmitting ? 'Verifying...' : 'Show Results'}
                    </button>

                    {errors.submit && <p className="text-red-400 text-xs font-black text-center mt-2">{errors.submit}</p>}
                    {errors.terms && !isTermsAccepted && <p className="text-red-400 text-[10px] font-black uppercase text-center">{errors.terms}</p>}
                </form>
            </motion.div>

            <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
        </div>
    );
};

export default PostGameLeadCapture;
