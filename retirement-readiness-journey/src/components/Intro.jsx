import React, { useState } from 'react';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2 } from 'lucide-react';
import { submitToLMS } from '../utils/api';

const Intro = ({ onStart, setUserInfo, userInfo }) => {
    const [showNamePopup, setShowNamePopup] = useState(false);
    const [userName, setUserName] = useState('');
    const [phone, setPhone] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleStartClick = () => {
        setShowNamePopup(true);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!userName.trim()) {
            newErrors.name = 'Please enter your name';
        } else if (!/^[A-Za-z\s]+$/.test(userName.trim())) {
            newErrors.name = 'Name must contain only letters';
        }

        if (!phone) {
            newErrors.phone = 'Please enter mobile number';
        } else if (!/^[6-9]\d{9}$/.test(phone)) {
            newErrors.phone = 'Enter valid 10-digit mobile number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNameSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (!termsAccepted) return;

        setIsSubmitting(true);
        try {
            const payload = {
                name: userName.trim(),
                mobile_no: phone,
                email_id: "",
                summary_dtls: "Retirement Journey Initial Lead",
                p_data_source: "RETIREMENT_GAME_LEAD"
            };

            const result = await submitToLMS(payload);

            if (result.success) {
                setUserInfo({ name: userName.trim(), mobile: phone, termsAccepted: true });
                onStart();
            } else {
                alert("Submission failed. Please try again.");
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-700">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, type: "spring" }}
                className="w-[12rem] h-[12rem] bg-primary-50 rounded-full flex items-center justify-center p-8"
            >
                <div className="w-full h-full bg-primary-500 rounded-full flex items-center justify-center text-[4rem] shadow-xl shadow-primary-500/30">
                    🎯
                </div>
            </motion.div>

            <div className="space-y-4 max-w-[32rem]">
                <h1 className="text-[2.5rem] font-extrabold text-slate-900 leading-tight">
                    Discover Your <br />
                    <span className="text-primary-500 underline decoration-accent-orange decoration-4 underline-offset-8">
                        Retirement Readiness
                    </span>
                </h1>
                <p className="text-[1.125rem] text-slate-500">
                    Embark on a fun, interactive journey to see how prepared you are for your future self. It only takes 2 minutes!
                </p>
            </div>

            <div className="w-full max-w-[20rem] pt-8">
                <Button
                    onClick={handleStartClick}
                    className="w-full h-[4rem] text-[1.125rem] bg-primary-500 hover:bg-primary-600 shadow-xl shadow-primary-500/40"
                >
                    BEGIN ASSESSMENT
                </Button>
                <p className="mt-4 text-[0.875rem] text-slate-400">
                    No credit card required • Instant results
                </p>
            </div>

            {/* Initial Lead Popup */}
            <AnimatePresence>
                {showNamePopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
                        onClick={() => setShowNamePopup(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative bg-white shadow-2xl w-full max-w-[340px] p-6 border-[6px] border-[#0066B2] rounded-2xl"
                        >
                            <button
                                onClick={() => setShowNamePopup(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-[#0066B2] flex items-center justify-center mx-auto mb-4 shadow-xl border-4 border-white rounded-full">
                                    <span className="text-4xl">👋</span>
                                </div>
                                <h2 className="text-[#0066B2] text-2xl font-black mb-1">Welcome!</h2>
                                <p className="text-slate-500 font-bold text-base">Enter your details to start.</p>
                            </div>

                            <form onSubmit={handleNameSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="block text-slate-700 text-xs font-black uppercase tracking-widest ml-1 text-left" htmlFor="userName">
                                        Your Name
                                    </label>
                                    <input
                                        id="userName"
                                        type="text"
                                        value={userName}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (/^[A-Za-z\s]*$/.test(val)) {
                                                setUserName(val);
                                                if (errors.name) setErrors({ ...errors, name: '' });
                                            }
                                        }}
                                        placeholder="Full Name"
                                        className={`w-full px-4 py-3 sm:py-3.5 border-4 ${errors.name ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-slate-100 focus:border-[#0066B2]'} focus:outline-none focus:ring-4 focus:ring-[#0066B2]/10 text-slate-800 font-bold text-base transition-all rounded-lg`}
                                        autoFocus
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-[10px] font-black uppercase tracking-wider ml-1 text-left">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-slate-700 text-xs font-black uppercase tracking-widest ml-1 text-left" htmlFor="phone">
                                        Mobile Number
                                    </label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        maxLength={10}
                                        value={phone}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            if (val === '' || /^[6-9]/.test(val)) {
                                                setPhone(val);
                                                if (errors.phone) setErrors({ ...errors, phone: '' });
                                            }
                                        }}
                                        placeholder="9876543210"
                                        className={`w-full px-4 py-3 sm:py-3.5 border-4 ${errors.phone ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-slate-100 focus:border-[#0066B2]'} focus:outline-none focus:ring-4 focus:ring-[#0066B2]/10 text-slate-800 font-bold text-base transition-all rounded-lg`}
                                    />
                                    {errors.phone && (
                                        <p className="text-red-500 text-[10px] font-black uppercase tracking-wider ml-1 text-left">{errors.phone}</p>
                                    )}
                                </div>

                                <div className="flex items-start space-x-3 pt-1">
                                    <div className="relative flex items-center">
                                        <input
                                            id="terms"
                                            type="checkbox"
                                            checked={termsAccepted}
                                            onChange={(e) => setTermsAccepted(e.target.checked)}
                                            className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-slate-300 bg-slate-50 transition-all checked:border-[#0066B2] checked:bg-[#0066B2] hover:border-[#0066B2]"
                                        />
                                        <Check className="pointer-events-none absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100" strokeWidth={4} />
                                    </div>
                                    <label htmlFor="terms" className="text-xs font-semibold text-slate-500 leading-tight select-none text-left">
                                        I agree to the <button type="button" onClick={() => setShowTerms(true)} className="text-[#0066B2] hover:underline font-bold inline">Term & condition</button> and Acknowledge the Privacy Policy.
                                    </label>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={!userName.trim() || phone.length !== 10 || !termsAccepted || isSubmitting}
                                    className="w-full py-4 rounded-xl font-bold tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 bg-[#0066B2] hover:bg-[#005596] text-white"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Starting...</span>
                                        </>
                                    ) : (
                                        "Let's Go!"
                                    )}
                                </Button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Terms Popup Overlay */}
            <AnimatePresence>
                {showTerms && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md"
                        onClick={() => setShowTerms(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl border-4 border-[#0066B2] relative"
                        >
                            <button
                                onClick={() => setShowTerms(false)}
                                className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <h3 className="text-[#0066B2] font-black text-lg uppercase mb-4 tracking-tight">Terms & Conditions</h3>
                            <div className="text-sm text-slate-600 space-y-3 font-medium leading-relaxed max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar text-left">
                                <p>BAJAJ LIFE INSURANCE</p>
                            </div>
                            <button
                                onClick={() => { setShowTerms(false); setTermsAccepted(true); }}
                                className="w-full mt-6 py-3 bg-[#0066B2] text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-sm uppercase tracking-wider"
                            >
                                I Agree
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Intro;
