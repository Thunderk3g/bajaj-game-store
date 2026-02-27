import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Loader2 } from 'lucide-react';
import Modal from './Modal';
import { submitToLMS } from '../../../services/api';
import bgImage from '../../../assets/Snake-Life TN.png';

const IntroScreen = ({ onStart }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTermsOpen, setIsTermsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '' });
    const [isTermsAccepted, setIsTermsAccepted] = useState(true);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Please enter your name';
        else if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) newErrors.name = 'Letters only';

        if (!formData.phone.trim()) newErrors.phone = 'Please enter your phone number';
        else if (!/^[6-9]\d{9}$/.test(formData.phone)) newErrors.phone = 'Invalid 10-digit number (starts 6-9)';

        if (!isTermsAccepted) newErrors.terms = 'Please accept terms';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        const result = await submitToLMS({
            name: formData.name,
            mobile_no: formData.phone,
            summary_dtls: 'Snake Life - Lead'
        });
        setIsSubmitting(false);

        if (result.success) {
            setIsModalOpen(false);
            onStart({ ...formData, leadNo: result.leadNo || (result.data && (result.data.leadNo || result.data.LeadNo)) }); // Pass lead data back to page
        } else {
            setErrors({ submit: result.error || 'Connection error. Please try again.' });
        }
    };

    return (
        <motion.div
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-between z-[100] bg-[#0B1221] overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-[length:100%_100%] bg-center bg-no-repeat"
                style={{ backgroundImage: `url("${bgImage}")` }}
            />

            {/* Dark overlay for button contrast if needed, but keeping it clean for now */}
            <div className="absolute inset-0 bg-black/10" />

            <div className="relative z-10 w-full h-full flex flex-col items-center justify-end pb-24 px-6 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="w-full max-w-sm"
                >
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="group relative w-full overflow-hidden rounded-3xl bg-primary p-1 shadow-[0_8px_0_0_#991b1b,0_15px_30px_rgba(239,68,68,0.3)] transition-all hover:translate-y-[-2px] hover:shadow-[0_10px_0_0_#991b1b,0_20px_40px_rgba(239,68,68,0.4)] active:translate-y-[4px] active:shadow-none"
                    >
                        <div className="bg-primary rounded-[1.4rem] py-5 border-t-2 border-white/20">
                            <span className="relative z-10 block text-4xl font-black tracking-tighter text-white uppercase italic">
                                Start
                            </span>
                        </div>
                    </button>
                </motion.div>
            </div>

            {/* Lead Gen Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="bg-white rounded-[32px] p-8 w-full shadow-2xl relative overflow-hidden text-left">
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <h2 className="text-3xl font-black text-gray-800 text-center mb-1 tracking-tight">
                        Welcome!
                    </h2>
                    <p className="text-center text-gray-400 font-bold mb-8 italic">Enter your details to start</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                    setFormData(prev => ({ ...prev, name: val }));

                                    // Real-time validation
                                    if (!val.trim()) {
                                        setErrors(prev => ({ ...prev, name: 'Please enter your name' }));
                                    } else if (!/^[A-Za-z\s]+$/.test(val.trim())) {
                                        setErrors(prev => ({ ...prev, name: 'Letters only' }));
                                    } else {
                                        setErrors(prev => ({ ...prev, name: null }));
                                    }
                                }}
                                id="name"
                                name="name"
                                autoComplete="name"
                                placeholder="Your name"
                                className={`w-full bg-gray-50 border-2 rounded-2xl px-5 py-4 text-gray-800 placeholder:text-gray-400 font-bold focus:outline-none focus:border-primary transition-all ${errors.name ? 'border-red-500' : 'border-slate-100'}`}
                            />
                            {errors.name && <p className="text-red-500 text-sm font-black ml-2 animate-fade-in">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                    setFormData(prev => ({ ...prev, phone: val }));

                                    // Real-time validation
                                    if (!val.trim()) {
                                        setErrors(prev => ({ ...prev, phone: 'Please enter your phone number' }));
                                    } else if (!/^[6-9]\d{9}$/.test(val)) {
                                        setErrors(prev => ({ ...prev, phone: 'Invalid 10-digit number (starts 6-9)' }));
                                    } else {
                                        setErrors(prev => ({ ...prev, phone: null }));
                                    }
                                }}
                                id="phone"
                                name="phone"
                                autoComplete="tel"
                                placeholder="Mobile number"
                                className={`w-full bg-gray-50 border-2 rounded-2xl px-5 py-4 text-gray-800 placeholder:text-gray-400 font-bold focus:outline-none focus:border-primary transition-all ${errors.phone ? 'border-red-500' : 'border-slate-100'}`}
                            />
                            {errors.phone && <p className="text-red-500 text-sm font-black ml-2 animate-fade-in">{errors.phone}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-start gap-3 cursor-pointer" onClick={() => {
                                setIsTermsAccepted(!isTermsAccepted);
                                setErrors(prev => ({ ...prev, terms: null }));
                            }}>
                                <div className={`shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${isTermsAccepted ? 'bg-green-500 border-green-500' : 'border-slate-100 bg-gray-50'}`}>
                                    {isTermsAccepted && <ShieldCheck className="w-5 h-5 text-white" />}
                                </div>
                                <div className="text-xs text-gray-400 font-bold leading-tight">
                                    I accept the{' '}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsTermsOpen(true);
                                        }}
                                        className="text-primary hover:underline"
                                    >
                                        Terms & Conditions
                                    </button>
                                    {' '}and acknowledge the privacy policy.
                                </div>
                            </div>
                            {errors.terms && <p className="text-red-500 text-sm font-black ml-2">{errors.terms}</p>}
                        </div>

                        {errors.submit && (
                            <p className="text-red-500 text-sm font-black text-center">{errors.submit}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-primary text-white font-black text-xl py-4 rounded-2xl shadow-[0_4px_0_0_#991b1b] active:translate-y-[2px] active:shadow-none disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : "LET'S GO!"}
                        </button>
                    </form>
                </div>
            </Modal>

            {/* Terms Modal */}
            <Modal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)}>
                <div className="bg-white rounded-[32px] p-8 w-full shadow-2xl relative text-left">
                    <button
                        onClick={() => setIsTermsOpen(false)}
                        className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <h2 className="text-2xl font-black text-gray-800 mb-6 tracking-tight">
                        Terms & Conditions
                    </h2>
                    <div className="text-sm text-gray-500 font-bold space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                        <p>Privacy Policy & Terms of Use for Life Grows Fast.</p>
                        <p>Your data stays secure.</p>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
};

export default IntroScreen;
