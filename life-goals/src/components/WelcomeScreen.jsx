import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { lifeGoals } from '../data/lifeGoals';
import { X, Check } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { isValidPhone } from '../utils/helpers';
// No longer need submitToLMS, useGameState, or formatCallbackDate here as they are handled in App.jsx/useGameState.js
// No longer need submitToLMS or useGameState here as they are passed from App.jsx

const TermsModal = () => (
    <Dialog.Root>
        <Dialog.Trigger asChild>
            <span className="text-[#0066B2] underline cursor-pointer hover:text-[#004C85]">T&C and Privacy Policy</span>
        </Dialog.Trigger>
        <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" />
            <Dialog.Content aria-describedby={undefined} className="fixed left-1/2 top-1/2 z-[201] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 bg-white p-6 shadow-2xl border-[6px] border-[#0066B2] animate-in zoom-in-95 fade-in duration-300">
                <div className="flex justify-between items-center mb-4 border-b-2 border-slate-100 pb-2">
                    <Dialog.Title className="text-[#0066B2] text-xl font-black uppercase tracking-tight">
                        Terms & Conditions
                    </Dialog.Title>
                    <Dialog.Close asChild>
                        <button className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                            <X className="w-6 h-6" />
                        </button>
                    </Dialog.Close>
                </div>
                <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2 text-slate-600 font-bold text-xs min-[375px]:text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-200">
                    <p>
                        I hereby authorize Bajaj Life Insurance Limited. to call me on the contact number made available by me on the website with a specific request to call back. I further declare that, irrespective of my contact number being registered on National Customer Preference Register (NCPR) or on National Do Not Call Registry (NDNC), any call made, SMS or WhatsApp sent in response to my request shall not be construed as an Unsolicited Commercial Communication even though the content of the call may be for the purposes of explaining various insurance products and services or solicitation and procurement of insurance business
                    </p>
                    <p>
                        Please refer to Bajaj Life <a href="https://www.bajajlifeinsurance.com/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="text-[#0066B2] underline">Privacy Policy</a>.
                    </p>
                </div>
                <div className="mt-6">
                    <Dialog.Close asChild>
                        <button className="btn-primary-3d w-full !py-3 uppercase tracking-widest text-sm">
                            CLOSE
                        </button>
                    </Dialog.Close>
                </div>
            </Dialog.Content>
        </Dialog.Portal>
    </Dialog.Root>
);

const WelcomeScreen = ({
    onStart,
    onSubmitLead,
    isSubmitting,
    lastSubmittedPhone,
    setSuccessMessage,
    setShowSuccessToast
}) => {
    const [showNamePopup, setShowNamePopup] = useState(false);
    const [userName, setUserName] = useState('');
    const [phone, setPhone] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(true);
    const [errors, setErrors] = useState({});

    const handleStartClick = () => {
        // Lead popup disabled — start game directly
        onStart({});
    };

    const handleNameSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!userName.trim()) {
            newErrors.name = 'Please enter your name';
        } else if (!/^[A-Za-z\s]+$/.test(userName.trim())) {
            newErrors.name = 'Please enter a valid name (letters only)';
        }

        if (!phone.trim()) {
            newErrors.phone = 'Please enter your phone number';
        } else if (!isValidPhone(phone)) {
            newErrors.phone = 'Please enter a valid 10-digit Indian phone number (starts with 6-9)';
        }

        if (!termsAccepted) {
            newErrors.terms = 'Please accept the Terms & Conditions';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        const result = await onSubmitLead({
            name: userName.trim(),
            phone: phone
        });

        if (result.success) {
            setShowNamePopup(false);
            setTimeout(() => {
                onStart({ name: userName.trim(), phone });
            }, 600);
        } else {
            // handleLeadSubmit already shows the error toast
        }
    };

    return (
        <div className="ghibli-card">
            {/* Background Image */}
            <div className="bg-burst"></div>

            {/* Global Desktop Background */}
            <img
                src="./assets/images/background_characters.png"
                alt="Background Characters"
                className="absolute inset-0 w-full h-full object-cover object-center hidden sm:block z-0 opacity-40 scale-110 origin-top"
            />

            {/* Content Container - Center aligned for impact */}
            <div className="ghibli-content justify-between sm:justify-start py-4 sm:py-0">

                {/* Header Section - Larger responsive typography */}
                <header className="w-full flex flex-col items-center z-50 shrink-0 mb-4 sm:mb-8 sm:mt-12">
                    <motion.div
                        initial={{ y: -30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-center w-full"
                    >
                        {/* Mobile Header: 3 Lines with Glow */}
                        <div className="block sm:hidden mt-2 min-[375px]:mt-6">
                            <h1 className="text-xl min-[375px]:text-2xl font-black text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] tracking-tighter leading-none mb-1 italic">
                                Are You Prepared to
                            </h1>
                            <h1 className="text-xl min-[375px]:text-2xl font-black text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] tracking-tighter leading-none mb-1 italic">
                                Achieve Your
                            </h1>
                            <h1 className="text-3xl min-[375px]:text-4xl font-black text-[#FFD700] tracking-tight leading-none mt-1 drop-shadow-[0_0_30px_rgba(255,215,0,1)] stroke-black stroke-2">
                                Life Goals?
                            </h1>
                        </div>

                        {/* Desktop Header: 3 Lines with Glow on "LIFE GOALS?" */}
                        <div className="hidden sm:block">
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] tracking-tighter leading-none mb-1 italic">
                                Are You Prepared to
                            </h1>
                            <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] tracking-tighter leading-none mb-2 italic">
                                Achieve Your
                            </h1>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#FFD700] tracking-tight leading-none mt-2 drop-shadow-[0_0_40px_rgba(255,215,0,0.8)] stroke-black stroke-2">
                                Life Goals?
                            </h1>
                        </div>
                    </motion.div>
                </header>

                {/* Main Visuals Area - Mobile View */}
                <div className="relative w-full flex-1 flex sm:hidden items-end justify-center min-h-[250px] md:min-h-[300px] my-2 min-[375px]:my-4 overflow-visible">

                    {/* background_characters.png - Mobile */}
                    <img
                        src="./assets/images/background_characters.png"
                        alt="Background Characters"
                        className="absolute inset-0 w-full h-full object-cover object-center scale-x-[1.1] scale-y-[1.1] min-[375px]:scale-x-[1.18] min-[375px]:scale-y-[1.2] z-0 opacity-100 origin-center"
                        style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)' }}
                    />






                </div>

                {/* Main Visuals Area - Desktop/Tablet View */}
                <div className="relative w-full flex-1 hidden sm:flex items-center justify-center min-h-[350px] my-4 overflow-visible">

                    {/* background_characters.png - Desktop */}
                    {/* background_characters.png - Desktop (Removed, using global background instead) */}






                </div>

                {/* Footer Section - Better margins */}
                <div className="w-full relative z-40 flex flex-col items-center gap-2 min-[375px]:gap-3 shrink-0 py-2">
                    <button
                        onClick={handleStartClick}
                        className="btn-primary-3d w-auto px-8 min-[375px]:px-10 sm:w-full sm:max-w-[340px] !py-3 sm:!py-5 !text-base min-[375px]:!text-lg sm:!text-xl mt-1 whitespace-nowrap"
                    >
                        CHECK YOUR SCORE
                    </button>
                </div>
            </div>

        </div >
    );
};

export default WelcomeScreen;
