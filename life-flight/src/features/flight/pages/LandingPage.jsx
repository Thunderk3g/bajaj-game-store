import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X, Check, Loader2 } from 'lucide-react';
import { useGame } from '../context/GameContext.jsx';
import landingBg from '../../../assets/Life Leap Start Page.png';
import { submitToLMS } from '../../../utils/api.js';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function LandingPage() {
    const { dispatch, ACTIONS } = useGame();
    const navigate = useNavigate();

    // Local State
    const [showNamePopup, setShowNamePopup] = useState(false);
    const [userName, setUserName] = useState('');
    const [phone, setPhone] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(true);
    const [showTerms, setShowTerms] = useState(false);

    // Ref for focus
    const phoneInputRef = useRef(null);

    // Validation & Loading State
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastSubmittedPhone, setLastSubmittedPhone] = useState(() => {
        return sessionStorage.getItem('lastSubmittedPhone') || null;
    });
    const [lastSubmittedName, setLastSubmittedName] = useState(() => {
        return sessionStorage.getItem('lastSubmittedName') || null;
    });

    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (lastSubmittedPhone) {
            sessionStorage.setItem('lastSubmittedPhone', lastSubmittedPhone);
        }
        if (lastSubmittedName) {
            sessionStorage.setItem('lastSubmittedName', lastSubmittedName);
        }
    }, [lastSubmittedPhone, lastSubmittedName]);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const showToastMessage = (message, type = 'error') => {
        setToast({ message, type });
    };

    const handleStartClick = () => {
        setShowNamePopup(true);
    };

    const startGame = () => {
        dispatch({ type: ACTIONS.START_GAME });
        navigate('/game');
    };

    const validateField = (field, value) => {
        let errorMsg = '';
        if (field === 'name') {
            if (!value.trim()) errorMsg = 'Please enter your name';
            else if (!/^[A-Za-z\s]+$/.test(value.trim())) errorMsg = 'Name must contain only letters.';
        } else if (field === 'phone') {
            if (!value) errorMsg = 'Please enter mobile number';
            else if (!/^\d{10}$/.test(value)) errorMsg = 'Enter a valid 10-digit mobile number';
        }

        if (errorMsg) {
            setErrors(prev => ({ ...prev, [field]: errorMsg }));
            return false;
        } else {
            setErrors(prev => ({ ...prev, [field]: '' }));
            return true;
        }
    };

    const validateForm = () => {
        const isNameValid = validateField('name', userName);
        const isPhoneValid = validateField('phone', phone);
        return isNameValid && isPhoneValid;
    };

    const handleNameSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;
        if (!termsAccepted) return;

        if (lastSubmittedPhone === phone) {
            showToastMessage("You have already registered.", "info");
            setTimeout(() => {
                startGame();
            }, 1000);
            return;
        }

        setIsSubmitting(true);

        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dateStr = tomorrow.toISOString().split('T')[0];

            const payload = {
                name: userName.trim(),
                mobile_no: phone,
                param4: dateStr,
                param19: "09:00 AM",
                summary_dtls: "Life Flight Game Lead",
                p_data_source: "LIFE_FLIGHT_LEAD"
            };

            const result = await submitToLMS(payload);

            if (result.success) {
                setLastSubmittedPhone(phone);
                setLastSubmittedName(userName.trim());
                sessionStorage.setItem('lastSubmittedPhone', phone);
                sessionStorage.setItem('lastSubmittedName', userName.trim());
                startGame();
            } else {
                showToastMessage("Submission failed. Please try again.");
            }
        } catch (err) {
            console.error(err);
            showToastMessage("Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            className="w-full flex-1 min-h-[100dvh] flex flex-col items-center justify-end pb-8 pt-8 relative overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
                backgroundImage: `url(${landingBg})`,
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: '#4FC3F7'
            }}
        >
            {/* ── Start Button ── */}
            <motion.div variants={itemVariants} className="w-full max-w-sm z-10 px-8 text-center flex justify-center pb-8 mb-4">
                <button
                    onClick={handleStartClick}
                    className="w-[85%] py-4 rounded-full font-black text-white hover:scale-105 active:scale-95 transition-transform duration-200 uppercase tracking-widest shadow-2xl flex items-center justify-center gap-2"
                    style={{
                        fontSize: 22,
                        background: '#12b886', // Cyan-teal color matching the screenshot
                        border: '3px solid #ffffff',
                        boxShadow: '0 8px 25px rgba(18, 184, 134, 0.4)',
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                >
                    Start Game
                </button>
            </motion.div>

            {/* Name Input Popup */}
            <AnimatePresence>
                {showNamePopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
                        onClick={() => setShowNamePopup(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative bg-white shadow-2xl w-full max-w-[320px] p-6 border-[5px] border-[#00B4D8] rounded-3xl"
                        >
                            <button
                                onClick={() => setShowNamePopup(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-[#00B4D8] flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-white rounded-full">
                                    <span className="text-4xl">🌤️</span>
                                </div>
                                <h2 className="text-[#00B4D8] text-2xl font-black mb-1 leading-tight tracking-tight">Ready to Fly?</h2>
                                <p className="text-slate-500 font-bold text-[13px] leading-tight mt-1">Enter your details to take off.</p>
                            </div>

                            <form onSubmit={handleNameSubmit} className="space-y-4">
                                <div className="space-y-1.5 text-left">
                                    <label className="block text-slate-700 text-[11px] font-black uppercase tracking-widest ml-1" htmlFor="userName">
                                        Your Name
                                    </label>
                                    <input
                                        id="userName"
                                        type="text"
                                        value={userName}
                                        onChange={(e) => {
                                            setUserName(e.target.value);
                                            if (/^[A-Za-z\s]*$/.test(e.target.value)) {
                                                setErrors(prev => ({ ...prev, name: '' }));
                                            }
                                        }}
                                        onBlur={(e) => validateField('name', e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (validateField('name', userName)) {
                                                    phoneInputRef.current?.focus();
                                                }
                                            }
                                        }}
                                        placeholder="Full Name"
                                        autoFocus
                                        className={`w-full px-4 py-3 border-4 ${errors.name ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-slate-100 focus:border-[#00B4D8]'} focus:outline-none focus:ring-4 focus:ring-[#00B4D8]/20 text-slate-800 font-bold text-lg transition-all rounded-xl`}
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-[10px] font-black uppercase tracking-wider ml-1 mt-1">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5 text-left">
                                    <label className="block text-slate-700 text-[11px] font-black uppercase tracking-widest ml-1" htmlFor="phone">
                                        Mobile Number
                                    </label>
                                    <input
                                        ref={phoneInputRef}
                                        id="phone"
                                        type="tel"
                                        maxLength={10}
                                        value={phone}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setPhone(val);
                                            setErrors(prev => ({ ...prev, phone: '' }));
                                        }}
                                        onBlur={(e) => validateField('phone', e.target.value)}
                                        placeholder="9876543210"
                                        className={`w-full px-4 py-3 border-4 ${errors.phone ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-slate-100 focus:border-[#00B4D8]'} focus:outline-none focus:ring-4 focus:ring-[#00B4D8]/20 text-slate-800 font-bold text-lg transition-all rounded-xl`}
                                    />
                                    {errors.phone && (
                                        <p className="text-red-500 text-[10px] font-black uppercase tracking-wider ml-1 mt-1">{errors.phone}</p>
                                    )}
                                </div>

                                <div className="flex items-start gap-2 pt-2 text-left">
                                    <div className="relative flex items-center shrink-0 pt-0.5">
                                        <input
                                            id="terms"
                                            type="checkbox"
                                            checked={termsAccepted}
                                            onChange={(e) => setTermsAccepted(e.target.checked)}
                                            className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-slate-300 bg-slate-50 transition-all checked:border-[#00B4D8] checked:bg-[#00B4D8] hover:border-[#00B4D8]"
                                        />
                                        <Check className="pointer-events-none absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100" strokeWidth={4} />
                                    </div>
                                    <label htmlFor="terms" className="text-[11px] font-bold text-slate-500 leading-snug select-none pr-1">
                                        I agree to the{' '}
                                        <button type="button" onClick={() => setShowTerms(true)} className="text-[#00B4D8] hover:underline font-black inline">
                                            Terms &amp; Conditions
                                        </button>{' '}
                                        and Privacy Policy.
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!userName.trim() || phone.length !== 10 || !termsAccepted || isSubmitting}
                                    className="w-full mt-2 py-3.5 rounded-xl text-[16px] tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-white uppercase font-black transition-all duration-300 shadow-xl"
                                    style={{
                                        background: 'linear-gradient(135deg, #00B4D8 0%, #0077b6 100%)',
                                        border: '2px solid rgba(255,255,255,0.2)'
                                    }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Starting...</span>
                                        </>
                                    ) : (
                                        "Let's Fly!"
                                    )}
                                </button>
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
                        className="absolute inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md"
                        onClick={() => setShowTerms(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white p-6 rounded-3xl max-w-sm w-full shadow-2xl border-4 border-[#00B4D8] relative text-left"
                        >
                            <button
                                onClick={() => setShowTerms(false)}
                                className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <h3 className="text-[#00B4D8] font-black text-xl uppercase mb-4 tracking-tight">Terms &amp; Conditions</h3>
                            <div className="text-sm text-slate-600 space-y-3 font-semibold leading-relaxed max-h-[50vh] overflow-y-auto pr-3 custom-scrollbar">
                                <p>
                                    I hereby authorize Bajaj Life Insurance Limited to call me on the contact number made available by me on the website with a specific request to call back. I further declare that, irrespective of my contact number being registered on National Customer Preference Register (NCPR) or on National Do Not Call Registry (NDNC), any call made, SMS or WhatsApp sent in response to my request shall not be construed as an Unsolicited Commercial Communication even though the content of the call may be for the purposes of explaining various insurance products and services or solicitation and procurement of insurance business.
                                </p>
                                <p>
                                    Please refer to BALIC Privacy Policy.
                                </p>
                            </div>
                            <button
                                onClick={() => { setShowTerms(false); setTermsAccepted(true); }}
                                className="w-full mt-6 py-3.5 bg-[#00B4D8] text-white font-black rounded-xl hover:bg-[#0077b6] transition-colors text-base uppercase tracking-widest shadow-lg"
                            >
                                I Agree
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-[120] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border-2 uppercase font-black tracking-wider text-xs ${toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-blue-50 border-blue-200 text-blue-600'}`}
                    >
                        {toast.type === 'error' ? (
                            <X size={18} className="stroke-[3]" />
                        ) : (
                            <Check size={18} className="stroke-[3]" />
                        )}
                        <span>{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
