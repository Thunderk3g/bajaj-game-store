import React, { useState } from 'react';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2 } from 'lucide-react';
import { submitToLMS } from '../utils/api';

const Intro = ({ onStart, setUserInfo, userInfo }) => {
    const [showNamePopup, setShowNamePopup] = useState(false);
    const [userName, setUserName] = useState('');
    const [phone, setPhone] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(true);
    const [showTerms, setShowTerms] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleStartClick = () => {
        setTermsAccepted(true);
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
                const responseData = result.data || result;
                setUserInfo({
                    name: userName.trim(),
                    mobile: phone,
                    termsAccepted: true,
                    leadNo: responseData.leadNo || responseData.LeadNo
                });
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
        <div
            className="flex-1 flex flex-col items-center justify-end text-center animate-in fade-in duration-700 w-full"
            style={{
                backgroundImage: `url('./assets/Intro.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                minHeight: '100vh',
            }}
        >
            <div className="w-full flex justify-center pb-12">
                <Button
                    onClick={handleStartClick}
                    className="px-12 h-[4rem] text-[1.25rem] font-black text-white rounded-none tracking-widest hover:opacity-100 transition-all border-b-[6px] border-[#00407A] active:border-b-0 active:translate-y-[6px] relative overflow-hidden group shadow-[0_10px_30px_rgba(0,102,178,0.3)]"
                    style={{ background: '#0066B2' }}
                >
                    <span className="relative z-10 italic">START NOW</span>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
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
                            <div className="flex justify-between items-center mb-4 border-b-2 border-slate-100 pb-2">
                                <h3 className="text-[#0066B2] text-xl font-black uppercase tracking-tight">
                                    Terms & Conditions
                                </h3>
                                <button
                                    onClick={() => setShowTerms(false)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2 text-slate-600 font-bold text-xs min-[375px]:text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-200 text-left">
                                <p>I hereby authorize Bajaj Life Insurance Limited to call me on the contact number made available by me on the website with a specific request to call back. I further declare that, irrespective of my contact number being registered on National Customer Preference Register (NCPR) or on National Do Not Call Registry (NDNC), any call made, SMS or WhatsApp sent in response to my request shall not be construed as an Unsolicited Commercial Communication even though the content of the call may be for the purposes of explaining various insurance products and services or solicitation and procurement of insurance business.</p>
                                <p>Please refer to <a href="https://www.bajajallianzlife.com/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="text-[#0066B2] underline">BALIC Privacy Policy</a>.</p>
                            </div>
                            <div className="mt-6">
                                <button
                                    onClick={() => { setShowTerms(false); setTermsAccepted(true); }}
                                    className="w-full mt-6 py-3 bg-[#0066B2] text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-sm uppercase tracking-wider"
                                >
                                    I Agree
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Intro;
