import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { useQuiz } from '../context/QuizContext';
import { ShieldCheck, X } from 'lucide-react';

const WelcomeScreen = ({ onStart }) => {
    const { onLeadSubmit, leadName: savedName, leadPhone: savedPhone, isLeadSubmitted, isTermsAccepted, setIsTermsAccepted } = useQuiz();
    const [isOpen, setIsOpen] = useState(false);
    const [isTermsOpen, setIsTermsOpen] = useState(false);

    // Form state
    const [name, setName] = useState(savedName || '');
    const [phone, setPhone] = useState(savedPhone || '');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validatePhone = (p) => /^[6-9]\d{9}$/.test(p);

    const validate = () => {
        const newErrors = {};
        if (!name.trim()) {
            newErrors.name = 'Please enter your name';
        } else if (!/^[A-Za-z\s]+$/.test(name.trim())) {
            newErrors.name = 'Letters only';
        }

        if (!phone.trim()) {
            newErrors.phone = 'Please enter your phone number';
        } else if (!validatePhone(phone)) {
            newErrors.phone = 'Invalid 10-digit number (starts 6-9)';
        }

        if (!isTermsAccepted) {
            newErrors.terms = 'Please accept terms';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        const result = await onLeadSubmit(name, phone);
        setIsSubmitting(false);

        if (result.success) {
            setIsOpen(false);
            onStart();
        } else {
            setErrors({ submit: result.error || 'Something went wrong. Please try again.' });
        }
    };

    const handleStartClick = () => {
        if (!isLeadSubmitted) {
            setIsOpen(true);
        } else {
            onStart();
        }
    };

    return (
        <motion.div
            className="w-full h-[100dvh] flex flex-col items-center justify-end pb-12 overflow-hidden bg-no-repeat"
            style={{
                backgroundImage: 'url(/assets/Quiz-bg.png)',
                backgroundSize: '100% 100%',
                backgroundPosition: 'center'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Action Section */}
            <div className="w-full max-w-[200px] mx-auto flex items-center justify-center">
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    onClick={handleStartClick}
                    className="w-full game-btn-green text-xl sm:text-2xl py-3 shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-wider"
                >
                    START
                </motion.button>
            </div>

            {/* Lead Gen Modal */}
            <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-[#B9E6FE]/80 backdrop-blur-md z-50" />
                    <Dialog.Content asChild aria-describedby={undefined}>
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl border-2 border-soft-gray relative overflow-hidden my-auto"
                            >
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>

                                <Dialog.Title className="text-3xl font-black text-gray-800 text-center mb-8 tracking-tight leading-none">
                                    Welcome!<br />
                                    <span className="text-lg font-bold text-gray-400">Enter your details to start</span>
                                </Dialog.Title>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            id="lead-name"
                                            name="name"
                                            autoComplete="name"
                                            value={name}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                                setName(val);
                                                if (!val.trim()) setErrors(prev => ({ ...prev, name: 'Please enter your name' }));
                                                else setErrors(prev => ({ ...prev, name: null }));
                                            }}
                                            placeholder="Your name"
                                            className="w-full bg-gray-50 border-2 border-soft-gray rounded-2xl px-5 py-4 text-gray-800 placeholder:text-gray-400 font-bold focus:outline-none focus:border-brand-blue transition-all"
                                        />
                                        {errors.name && <p className="text-red-500 text-sm font-black ml-2">{errors.name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <input
                                            type="tel"
                                            id="lead-phone"
                                            name="phone"
                                            autoComplete="tel"
                                            value={phone}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                setPhone(val);
                                                if (!val.trim()) setErrors(prev => ({ ...prev, phone: 'Please enter your phone number' }));
                                                else if (val.length > 0 && !/^[6-9]/.test(val)) setErrors(prev => ({ ...prev, phone: 'Must start with 6-9' }));
                                                else if (val.length > 0 && val.length < 10) setErrors(prev => ({ ...prev, phone: 'Enter 10 digits' }));
                                                else setErrors(prev => ({ ...prev, phone: null }));
                                            }}
                                            placeholder="Mobile number"
                                            className="w-full bg-gray-50 border-2 border-soft-gray rounded-2xl px-5 py-4 text-gray-800 placeholder:text-gray-400 font-bold focus:outline-none focus:border-brand-blue transition-all"
                                        />
                                        {errors.phone && <p className="text-red-500 text-sm font-black ml-2">{errors.phone}</p>}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-start gap-3 group cursor-pointer" onClick={() => {
                                            setIsTermsAccepted(!isTermsAccepted);
                                            setErrors(prev => ({ ...prev, terms: null }));
                                        }}>
                                            <div className={`shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${isTermsAccepted ? 'bg-brand-green border-brand-green' : 'border-soft-gray bg-gray-50'}`}>
                                                {isTermsAccepted && <ShieldCheck className="w-5 h-5 text-white" />}
                                            </div>
                                            <div className="text-sm text-gray-500 font-bold leading-tight">
                                                I accept the{' '}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setIsTermsOpen(true);
                                                    }}
                                                    className="text-brand-blue hover:underline font-black"
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
                                        className="w-full game-btn-green text-2xl py-4 disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Processing...' : "Let's go!"}
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* Terms Sub-Modal */}
            <AnimatePresence>
                {isTermsOpen && (
                    <Dialog.Root open={isTermsOpen} onOpenChange={setIsTermsOpen}>
                        <Dialog.Portal>
                            <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" />
                            <Dialog.Content asChild aria-describedby={undefined}>
                                <div className="fixed inset-0 z-[60] grid place-items-center p-4">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="bg-white border-2 border-soft-gray rounded-[32px] p-8 w-full max-w-lg shadow-2xl relative"
                                    >
                                        <button
                                            onClick={() => setIsTermsOpen(false)}
                                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>

                                        <Dialog.Title className="text-2xl font-black text-gray-800 mb-6 tracking-tight">
                                            Terms & Conditions
                                        </Dialog.Title>
                                        <div className="text-base text-gray-500 font-bold space-y-4 max-h-[60vh] overflow-y-auto pr-4 scrollbar-hide overflow-x-hidden">
                                            <p>I hereby authorize Bajaj Life Insurance Limited to call me on the contact number made available by me on the website with a specific request to call back. I further declare that, irrespective of my contact number being registered on National Customer Preference Register (NCPR) or on National Do Not Call Registry (NDNC), any call made, SMS or WhatsApp sent in response to my request shall not be construed as an Unsolicited Commercial Communication even though the content of the call may be for the purposes of explaining various insurance products and services or solicitation and procurement of insurance business.</p>
                                            <p>Please refer to <a href="https://www.bajajallianzlife.com/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline font-black">BALIC Privacy Policy</a>.</p>
                                        </div>
                                    </motion.div>
                                </div>
                            </Dialog.Content>
                        </Dialog.Portal>
                    </Dialog.Root>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default WelcomeScreen;                                                                                                                          