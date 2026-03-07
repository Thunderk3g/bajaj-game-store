import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Check } from 'lucide-react';
import { submitToLMS } from '../../../services/api';
import bgImage from '../assets/images/TN_Expect_The_Unexpected-thumbnail.png';

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

const IntroScreen = ({ onStart }) => {
    // Local State
    const [showNamePopup, setShowNamePopup] = useState(false);
    const [userName, setUserName] = useState('');
    const [phone, setPhone] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(true); // Default to Checked
    const [showTerms, setShowTerms] = useState(false);

    // Ref for focus management (name -> phone on Enter)
    const phoneInputRef = useRef(null);

    // Validation & Loading State
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastSubmittedPhone, setLastSubmittedPhone] = useState(() => {
        return sessionStorage.getItem('lastSubmittedPhone') || null;
    });

    // Toast State
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (lastSubmittedPhone) {
            sessionStorage.setItem('lastSubmittedPhone', lastSubmittedPhone);
        }
    }, [lastSubmittedPhone]);

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

    // Per-field validation
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

        // Duplicate Check
        if (lastSubmittedPhone === phone) {
            showToastMessage("You have already registered.", "info");
            setTimeout(() => {
                onStart({ name: userName.trim(), phone });
            }, 1000);
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await submitToLMS({
                name: userName.trim(),
                mobile_no: phone,
                summary_dtls: 'One Life - Lead'
            });

            if (result.success) {
                setLastSubmittedPhone(phone);
                onStart({ name: userName.trim(), phone });
            } else {
                showToastMessage(result.error || "Submission failed. Please try again.");
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
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-between z-[100] overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* CTA */}
            <motion.div variants={itemVariants} style={{ width: '100%', maxWidth: '220px', zIndex: 10, paddingBottom: '12px', margin: '0 auto' }}>
                <motion.button
                    onClick={handleStartClick}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        width: '100%',
                        padding: '12px 0',
                        borderRadius: '1.5rem',
                        background: 'linear-gradient(to bottom, #00c6ff 0%, #0072ff 100%)',
                        border: '6px solid #ffffff',
                        boxShadow: '0 8px 0 #0056b3, 0 15px 25px rgba(0, 0, 0, 0.4)',
                        cursor: 'pointer',
                        color: '#ffffff',
                        fontSize: '18px',
                        fontWeight: 900,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.1s ease',
                    }}
                >
                    Start
                </motion.button>
            </motion.div>

            {/* Name Input Popup */}
            <AnimatePresence>
                {showNamePopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[100] flex items-center justify-center"
                        style={{
                            padding: '16px',
                            backgroundColor: 'rgba(15, 23, 42, 0.8)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                        }}
                        onClick={() => setShowNamePopup(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                position: 'relative',
                                backgroundColor: '#ffffff',
                                width: '100%',
                                maxWidth: '340px',
                                padding: '24px',
                                borderWidth: '4px',
                                borderStyle: 'solid',
                                borderColor: '#0066B2',
                                borderRadius: '16px',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            }}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setShowNamePopup(false)}
                                style={{
                                    position: 'absolute',
                                    top: '14px',
                                    right: '14px',
                                    color: '#94a3b8',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '2px',
                                }}
                            >
                                <X style={{ width: '22px', height: '22px' }} />
                            </button>

                            {/* Header */}
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <div
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        backgroundColor: '#0066B2',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 14px auto',
                                        borderRadius: '50%',
                                        borderWidth: '4px',
                                        borderStyle: 'solid',
                                        borderColor: '#ffffff',
                                        boxShadow: '0 10px 25px -5px rgba(0, 102, 178, 0.4)',
                                    }}
                                >
                                    <span style={{ fontSize: '28px' }}>👋</span>
                                </div>
                                <h2 style={{
                                    color: '#0066B2',
                                    fontSize: '20px',
                                    fontWeight: 900,
                                    marginBottom: '4px',
                                    lineHeight: 1.2,
                                }}>Welcome!</h2>
                                <p style={{
                                    color: '#64748b',
                                    fontWeight: 700,
                                    fontSize: '13px',
                                }}>Enter your details to start.</p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleNameSubmit}>
                                {/* Name Field */}
                                <div style={{ marginBottom: '14px', textAlign: 'left' }}>
                                    <label
                                        htmlFor="userName"
                                        style={{
                                            display: 'block',
                                            color: '#334155',
                                            fontSize: '10px',
                                            fontWeight: 900,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            marginBottom: '6px',
                                            marginLeft: '4px',
                                        }}
                                    >
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
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderWidth: '4px',
                                            borderStyle: 'solid',
                                            borderColor: errors.name ? '#f87171' : '#f1f5f9',
                                            borderRadius: '8px',
                                            fontSize: '15px',
                                            fontWeight: 700,
                                            color: '#1e293b',
                                            outline: 'none',
                                            transition: 'all 0.2s ease',
                                            backgroundColor: errors.name ? '#fef2f2' : '#ffffff',
                                            boxSizing: 'border-box',
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = errors.name ? '#ef4444' : '#0066B2';
                                            e.target.style.boxShadow = '0 0 0 4px rgba(0, 102, 178, 0.1)';
                                        }}
                                        onBlurCapture={(e) => {
                                            e.target.style.borderColor = errors.name ? '#f87171' : '#f1f5f9';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                    {errors.name && (
                                        <p style={{
                                            color: '#ef4444',
                                            fontSize: '10px',
                                            fontWeight: 900,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            marginLeft: '4px',
                                            marginTop: '4px',
                                        }}>{errors.name}</p>
                                    )}
                                </div>

                                {/* Phone Field */}
                                <div style={{ marginBottom: '14px', textAlign: 'left' }}>
                                    <label
                                        htmlFor="phone"
                                        style={{
                                            display: 'block',
                                            color: '#334155',
                                            fontSize: '10px',
                                            fontWeight: 900,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            marginBottom: '6px',
                                            marginLeft: '4px',
                                        }}
                                    >
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
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderWidth: '4px',
                                            borderStyle: 'solid',
                                            borderColor: errors.phone ? '#f87171' : '#f1f5f9',
                                            borderRadius: '8px',
                                            fontSize: '15px',
                                            fontWeight: 700,
                                            color: '#1e293b',
                                            outline: 'none',
                                            transition: 'all 0.2s ease',
                                            backgroundColor: errors.phone ? '#fef2f2' : '#ffffff',
                                            boxSizing: 'border-box',
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = errors.phone ? '#ef4444' : '#0066B2';
                                            e.target.style.boxShadow = '0 0 0 4px rgba(0, 102, 178, 0.1)';
                                        }}
                                        onBlurCapture={(e) => {
                                            e.target.style.borderColor = errors.phone ? '#f87171' : '#f1f5f9';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                    {errors.phone && (
                                        <p style={{
                                            color: '#ef4444',
                                            fontSize: '10px',
                                            fontWeight: 900,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            marginLeft: '4px',
                                            marginTop: '4px',
                                        }}>{errors.phone}</p>
                                    )}
                                </div>

                                {/* Terms */}
                                <div className="space-y-2 py-1">
                                    <div className="flex items-start gap-3">
                                        <div
                                            onClick={() => {
                                                setTermsAccepted(!termsAccepted);
                                                setErrors(prev => ({ ...prev, terms: null }));
                                            }}
                                            className={`mt-0.5 shrink-0 w-5 h-5 min-[375px]:w-6 min-[375px]:h-6 border-2 flex items-center justify-center cursor-pointer transition-all ${termsAccepted ? 'bg-[#0066B2] border-[#0066B2]' : 'bg-white border-slate-300'}`}
                                        >
                                            {termsAccepted && <Check className="w-4 h-4 text-white" strokeWidth={4} />}
                                        </div>
                                        <div className="text-[10px] min-[375px]:text-xs font-bold text-slate-600 leading-tight text-left">
                                            I agree to the{' '}
                                            <button type="button" onClick={() => setShowTerms(true)} className="text-[#0066B2] underline cursor-pointer hover:text-[#004C85]">
                                                Terms & Conditions
                                            </button>{' '}
                                            and allow Bajaj Life Insurance to contact me even if registered on DND.
                                        </div>
                                    </div>
                                    {errors.terms && (
                                        <p className="text-red-500 text-[9px] min-[375px]:text-[10px] font-black uppercase tracking-wider ml-1 text-left">{errors.terms}</p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={!userName.trim() || phone.length !== 10 || !termsAccepted || isSubmitting}
                                    style={{
                                        width: '100%',
                                        padding: '14px 0',
                                        borderRadius: '12px',
                                        border: 'none',
                                        fontWeight: 800,
                                        fontSize: '15px',
                                        letterSpacing: '0.15em',
                                        color: '#ffffff',
                                        textTransform: 'uppercase',
                                        cursor: (!userName.trim() || phone.length !== 10 || !termsAccepted || isSubmitting) ? 'not-allowed' : 'pointer',
                                        opacity: (!userName.trim() || phone.length !== 10 || !termsAccepted || isSubmitting) ? 0.5 : 1,
                                        background: 'linear-gradient(135deg, #0066B2 0%, #3B82F6 100%)',
                                        boxShadow: '0 4px 15px rgba(0, 102, 178, 0.3)',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.3s ease',
                                        marginTop: '8px',
                                    }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="animate-spin" style={{ width: '20px', height: '20px' }} />
                                            <span>Starting...</span>
                                        </>
                                    ) : (
                                        "LET'S GO!"
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
                            className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl border-4 border-[#0066B2] relative text-left"
                        >
                            <button
                                onClick={() => setShowTerms(false)}
                                className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <h3 className="text-[#0066B2] font-black text-lg uppercase mb-4 tracking-tight">Terms &amp; Conditions</h3>
                            <div className="text-xs sm:text-sm text-slate-600 space-y-3 font-medium leading-relaxed max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                <p>
                                    I hereby authorize Bajaj Life Insurance Limited to call me on the contact number made available by me on the website with a specific request to call back. I further declare that, irrespective of my contact number being registered on National Customer Preference Register (NCPR) or on National Do Not Call Registry (NDNC), any call made, SMS or WhatsApp sent in response to my request shall not be construed as an Unsolicited Commercial Communication even though the content of the call may be for the purposes of explaining various insurance products and services or solicitation and procurement of insurance business.
                                </p>
                                <p>
                                    Please refer to BALIC Privacy Policy.
                                </p>
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

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[120] px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'}`}
                    >
                        {toast.type === 'error' ? (
                            <X size={20} className="stroke-[3]" />
                        ) : (
                            <Check size={20} className="stroke-[3]" />
                        )}
                        <span className="font-bold text-sm">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default IntroScreen;
