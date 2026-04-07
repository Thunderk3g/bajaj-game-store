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

        if (!isTermsAccepted) newErrors.terms = 'Please accept terms';

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
                summary_dtls: 'Secure Saga - Post Game Lead'
            };
            const result = await submitToLMS(formData);

            if (result.success) {
                const responseData = result.data || result;
                if (responseData.leadNo || responseData.LeadNo) {
                    sessionStorage.setItem('secureSagaLeadNo', responseData.leadNo || responseData.LeadNo);
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
        <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-[#001e3a]/90 backdrop-blur-xl p-6">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-[#003366] rounded-[3rem] p-8 w-full max-w-[400px] border-[3px] border-[#fbbf24] shadow-[0_0_60px_rgba(251,191,36,0.3)] relative overflow-hidden"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#fbbf24]/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full -ml-16 -mb-16 blur-3xl" />

                <div className="text-center mb-10 relative z-10">
                    <h2 className="text-[#fbbf24] text-4xl font-black mb-1 tracking-tighter uppercase italic leading-none text-left drop-shadow-sm">
                        Legendary Match!
                    </h2>
                    <p className="text-blue-100 font-bold text-lg text-left opacity-90">Secure your <span className="text-[#fbbf24]">Future Goals</span> now.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 text-left relative z-10">
                    <div className="space-y-2">
                        <label className="block text-blue-200 text-[11px] font-black uppercase tracking-[0.2em] ml-1 opacity-60">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                            placeholder="Full Name"
                            className={`w-full bg-[#001e3a]/50 border-2 rounded-2xl px-6 py-4 text-white placeholder:text-blue-200/20 font-bold focus:outline-none transition-all ${errors.name ? 'border-red-500 bg-red-500/5' : 'border-blue-900 focus:border-[#fbbf24]'}`}
                        />
                        {errors.name && <p className="text-red-400 text-[10px] font-black uppercase tracking-wider ml-1">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-blue-200 text-[11px] font-black uppercase tracking-[0.2em] ml-1 opacity-60">Mobile Number</label>
                        <input
                            type="tel"
                            maxLength={10}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="Mobile Number"
                            className={`w-full bg-[#001e3a]/50 border-2 rounded-2xl px-6 py-4 text-white placeholder:text-blue-200/20 font-bold focus:outline-none transition-all ${errors.phone ? 'border-red-500 bg-red-500/5' : 'border-blue-900 focus:border-[#fbbf24]'}`}
                        />
                        {errors.phone && <p className="text-red-400 text-[10px] font-black uppercase tracking-wider ml-1">{errors.phone}</p>}
                    </div>

                    <div className="flex items-start gap-4 py-2">
                        <div
                            onClick={() => setIsTermsAccepted(!isTermsAccepted)}
                            className={`mt-1 shrink-0 w-6 h-6 border-2 flex items-center justify-center rounded-lg cursor-pointer transition-all ${isTermsAccepted ? 'bg-[#fbbf24] border-[#fbbf24]' : 'bg-transparent border-blue-800'}`}
                        >
                            {isTermsAccepted && <span className="text-[#003366] font-black text-xs">✓</span>}
                        </div>
                        <p className="text-[11px] font-bold text-blue-100/50 leading-relaxed">
                            By proceeding, I agree to the <span onClick={() => setIsTermsModalOpen(true)} className="text-white underline font-black cursor-pointer hover:text-[#fbbf24] transition-colors">T&C and Privacy Policy</span>
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-16 bg-[#fbbf24] hover:bg-[#fcd34d] text-[#003366] font-black text-xl tracking-[0.15em] disabled:opacity-50 transition-all duration-300 shadow-[0_10px_25px_rgba(251,191,36,0.2)] active:scale-[0.98] active:shadow-none rounded-2xl border-none uppercase italic"
                    >
                        {isSubmitting ? 'Verifying...' : 'Show Results'}
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
