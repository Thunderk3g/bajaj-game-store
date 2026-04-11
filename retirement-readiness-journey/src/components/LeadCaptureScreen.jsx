import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';
import { submitToLMS } from '../utils/api';
import TermsModal from './TermsModal';

const LeadCaptureScreen = ({ onSuccess }) => {
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
                summary_dtls: 'Retirement Readiness Journey - Lead'
            };
            const result = await submitToLMS(formData);

            if (result.success) {
                const responseData = result.data || result;
                if (responseData.leadNo || responseData.LeadNo) {
                    sessionStorage.setItem('retirementReadinessLeadNo', responseData.leadNo || responseData.LeadNo);
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
        <div className="flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/20 shadow-2xl mx-auto my-auto w-full max-w-[380px]">
            <div className="text-center mb-10 w-full px-2">
                <h2 className="text-3xl font-black text-white mb-3 tracking-tighter uppercase italic leading-none text-left drop-shadow-lg">
                    Enter Your Details
                </h2>
                <p className="text-blue-50 font-bold text-lg leading-tight text-left">To see the <span className="text-yellow-400">results</span></p>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-6 text-left">
                <div className="space-y-1.5">
                    <label className="block text-white text-[10px] font-black uppercase tracking-widest ml-1 opacity-90">Full Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                        placeholder="e.g. Rahul Sharma"
                        className={`w-full bg-white/10 border-2 rounded-2xl px-5 py-3.5 text-white placeholder:text-white/30 font-bold focus:outline-none transition-all ${errors.name ? 'border-red-500 bg-red-500/10' : 'border-white/20 focus:border-white/50'}`}
                    />
                    {errors.name && <p className="text-red-400 text-[10px] font-black uppercase tracking-wider ml-1">{errors.name}</p>}
                </div>

                <div className="space-y-1.5">
                    <label className="block text-white text-[10px] font-black uppercase tracking-widest ml-1 opacity-90">Mobile Number</label>
                    <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        className={`w-full bg-white/10 border-2 rounded-2xl px-5 py-3.5 text-white placeholder:text-white/30 font-bold focus:outline-none transition-all ${errors.phone ? 'border-red-500 bg-red-500/10' : 'border-white/20 focus:border-white/50'}`}
                    />
                    {errors.phone && <p className="text-red-400 text-[10px] font-black uppercase tracking-wider ml-1">{errors.phone}</p>}
                </div>

                <div className="flex items-start gap-3 py-1">
                    <div
                        onClick={() => setIsTermsAccepted(!isTermsAccepted)}
                        className={`mt-0.5 shrink-0 w-6 h-6 border-2 flex items-center justify-center rounded-lg cursor-pointer transition-all ${isTermsAccepted ? 'bg-white border-white' : 'bg-transparent border-white/50'}`}
                    >
                        {isTermsAccepted && <span className="text-blue-600 font-black text-xs">✓</span>}
                    </div>
                    <p className="text-[10px] font-bold text-white/90 leading-snug">
                        I agree and consent to the <span onClick={() => setIsTermsModalOpen(true)} className="text-white underline font-black cursor-pointer hover:text-yellow-400 transition-colors">T&C and Privacy Policy</span>
                    </p>
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 bg-white hover:bg-white/90 text-blue-600 font-black text-lg tracking-widest disabled:opacity-50 transition-all duration-300 shadow-[0_8px_0_rgba(255,255,255,0.2)] active:scale-[0.98] active:shadow-none rounded-2xl border-none uppercase"
                >
                    {isSubmitting ? 'Reveal Results...' : 'See Results!'}
                </Button>

                {errors.submit && <p className="text-red-400 text-sm font-black text-center mt-2">{errors.submit}</p>}
                {errors.terms && !isTermsAccepted && <p className="text-red-400 text-[10px] font-black uppercase text-center">{errors.terms}</p>}
            </form>

            <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
        </div>
    );
};

export default LeadCaptureScreen;
