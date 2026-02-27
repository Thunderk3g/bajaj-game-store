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
            <span className="text-[#0066B2] underline cursor-pointer hover:text-[#004C85]">Terms & Conditions</span>
        </Dialog.Trigger>
        <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-[201] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 bg-white p-6 shadow-2xl border-[6px] border-[#0066B2] animate-in zoom-in-95 fade-in duration-300">
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
                        I hereby authorize Bajaj Life Insurance Limited to call me on the contact number made available by me on the website with a specific request to call back. I further declare that, irrespective of my contact number being registered on National Customer Preference Register (NCPR) or on National Do Not Call Registry (NDNC), any call made, SMS or WhatsApp sent in response to my request shall not be construed as an Unsolicited Commercial Communication even though the content of the call may be for the purposes of explaining various insurance products and services or solicitation and procurement of insurance business.
                    </p>
                    <p>
                        Please refer to <a href="https://www.bajajallianzlife.com/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="text-[#0066B2] underline">BALIC Privacy Policy</a>.
                    </p>
                </div>
                <div className="mt-6">
                    <Dialog.Close asChild>
                        <button className="btn-primary-3d w-full !py-3 uppercase tracking-widest text-sm">
                            Close
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
        setShowNamePopup(true);
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
                                Are you prepared to
                            </h1>
                            <h1 className="text-xl min-[375px]:text-2xl font-black text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] tracking-tighter leading-none mb-1 italic">
                                achieve your
                            </h1>
                            <h1 className="text-3xl min-[375px]:text-4xl font-black text-[#FFD700] tracking-tight leading-none uppercase mt-1 drop-shadow-[0_0_30px_rgba(255,215,0,1)] stroke-black stroke-2">
                                LIFE GOALS?
                            </h1>
                        </div>

                        {/* Desktop Header: 3 Lines with Glow on "LIFE GOALS?" */}
                        <div className="hidden sm:block">
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] tracking-tighter leading-none mb-1 italic">
                                Are you prepared to
                            </h1>
                            <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] tracking-tighter leading-none mb-2 italic">
                                achieve your
                            </h1>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#FFD700] tracking-tight leading-none uppercase mt-2 drop-shadow-[0_0_40px_rgba(255,215,0,0.8)] stroke-black stroke-2">
                                LIFE GOALS?
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

                    {/* Gold Coins */}
                    <img
                        src="./assets/images/gold_coins-removebg-preview.png"
                        alt="Gold Coins"
                        className="absolute bottom-4 -left-8 min-[375px]:-left-6 w-24 min-[375px]:w-32 z-10 opacity-100 drop-shadow-xl object-cover object-center"
                    />
                    <img
                        src="./assets/images/gold_coins-removebg-preview.png"
                        alt="Gold Coins"
                        className="absolute bottom-4 -right-8 min-[375px]:-right-6 w-24 min-[375px]:w-32 z-10 opacity-100 transform scale-x-[-1] drop-shadow-xl object-cover object-center"
                    />

                    {/* Central Clipboard */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="relative z-20 w-full max-w-[200px] min-[375px]:max-w-[240px] bg-white shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex flex-col items-center border-[3px] min-[375px]:border-[4px] border-[#34495E] overflow-hidden shrink-0 mb-8"
                    >
                        {/* Clip Element */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 min-[375px]:w-12 h-3 min-[375px]:h-4 bg-[#E5533D] shadow-lg flex items-center justify-center border-b-2 border-[#C0392B] z-30">
                            <div className="w-1.5 min-[375px]:w-2 h-1.5 min-[375px]:h-2 bg-white border-2 border-[#C0392B] shadow-inner"></div>
                        </div>

                        <div className="pt-4 min-[375px]:pt-5 pb-3 min-[375px]:pb-4 px-2 min-[375px]:px-3 w-full bg-gradient-to-b from-white to-slate-100">
                            <h2 className="text-[#E67E22] text-[8px] min-[375px]:text-[9px] font-black uppercase text-center mb-1.5 min-[375px]:mb-2 tracking-tighter">
                                MISSION: <span className="text-[#D35400]">LIFE GOALS DONE</span>
                            </h2>

                            <ul className="grid grid-cols-1 gap-0.5 min-[375px]:gap-1 px-2 min-[375px]:px-4">
                                {lifeGoals.map((goal) => (
                                    <li key={goal.id} className="flex items-center gap-1 min-[375px]:gap-1.5 text-[7px] min-[375px]:text-[8px] font-black text-[#2C3E50] border-b border-[#0066B2]/5 pb-0.5">
                                        <span className="text-[#0066B2]">•</span>
                                        <span className="truncate">{goal.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>

                    {/* Characters */}
                    <motion.img
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3, type: "spring", damping: 15 }}
                        src="./assets/images/character_woman-removebg-preview.png"
                        alt="Professional Woman"
                        className="char-woman absolute bottom-[10px] min-[375px]:bottom-[15px] -left-12 min-[375px]:-left-20 h-[180px] min-[375px]:h-[230px] object-cover object-center z-30 drop-shadow-xl"
                    />

                    <motion.img
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3, type: "spring", damping: 15 }}
                        src="./assets/images/character_man-removebg-preview.png"
                        alt="Professional Man"
                        className="char-man absolute bottom-[10px] min-[375px]:bottom-[15px] -right-12 min-[375px]:-right-20 h-[190px] min-[375px]:h-[240px] object-cover object-center z-30 drop-shadow-xl"
                    />
                </div>

                {/* Main Visuals Area - Desktop/Tablet View */}
                <div className="relative w-full flex-1 hidden sm:flex items-center justify-center min-h-[350px] my-4 overflow-visible">

                    {/* background_characters.png - Desktop */}
                    {/* background_characters.png - Desktop (Removed, using global background instead) */}

                    {/* Gold Coins - Scaled down */}
                    <img
                        src="./assets/images/gold_coins-removebg-preview.png"
                        alt="Gold Coins"
                        className="absolute bottom-4 -left-6 w-32 sm:w-32 md:w-40 z-10 opacity-100 drop-shadow-xl object-cover object-center"
                    />
                    <img
                        src="./assets/images/gold_coins-removebg-preview.png"
                        alt="Gold Coins"
                        className="absolute bottom-4 -right-6 w-32 sm:w-32 md:w-40 z-10 opacity-100 transform scale-x-[-1] drop-shadow-xl object-cover object-center"
                    />

                    {/* Central Clipboard - Optimized size */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="relative z-20 w-full max-w-[240px] sm:max-w-[320px] md:max-w-[380px] bg-white shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex flex-col items-center border-[4px] sm:border-[6px] border-[#34495E] overflow-hidden shrink-0 transform -translate-y-4"
                    >
                        {/* Clip Element */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 sm:w-16 h-4 sm:h-5 bg-[#E5533D] shadow-lg flex items-center justify-center border-b-2 sm:border-b-4 border-[#C0392B] z-30">
                            <div className="w-2 sm:w-3 h-2 sm:h-3 bg-white border-2 border-[#C0392B] shadow-inner"></div>
                        </div>

                        <div className="pt-5 sm:pt-7 pb-4 sm:pb-6 px-3 sm:px-5 w-full bg-gradient-to-b from-white to-slate-100">
                            <h2 className="text-[#E67E22] text-[9px] sm:text-[11px] md:text-sm font-black uppercase text-center mb-2 sm:mb-3 tracking-tighter">
                                MISSION: <span className="text-[#D35400]">LIFE GOALS DONE</span>
                            </h2>

                            <ul className="grid grid-cols-1 gap-1 sm:gap-1.5 px-4">
                                {lifeGoals.map((goal) => (
                                    <li key={goal.id} className="flex items-center gap-1.5 sm:gap-2 text-[8px] sm:text-[10px] md:text-xs font-black text-[#2C3E50] border-b border-[#0066B2]/5 pb-0.5">
                                        <span className="text-[#0066B2]">•</span>
                                        <span className="truncate">{goal.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>

                    {/* Characters - Scaled down for safe fit */}
                    <motion.img
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3, type: "spring", damping: 15 }}
                        src="./assets/images/character_woman-removebg-preview.png"
                        alt="Professional Woman"
                        className="absolute bottom-0 -left-12 sm:-left-20 md:-left-24 h-[230px] sm:h-[240px] md:h-[280px] lg:h-[320px] object-cover object-center z-30 drop-shadow-xl"
                    />

                    <motion.img
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3, type: "spring", damping: 15 }}
                        src="./assets/images/character_man-removebg-preview.png"
                        alt="Professional Man"
                        className="absolute bottom-0 -right-12 sm:-right-20 md:-right-24 h-[240px] sm:h-[250px] md:h-[290px] lg:h-[330px] object-cover object-center z-30 drop-shadow-xl"
                    />
                </div>

                {/* Footer Section - Better margins */}
                <div className="w-full relative z-40 flex flex-col items-center gap-2 min-[375px]:gap-3 shrink-0 py-2">
                    <h3 className="text-white text-sm min-[375px]:text-base sm:text-lg md:text-xl font-black drop-shadow-xl text-center leading-tight">
                        Measure your Life Goals preparedness
                    </h3>

                    <button
                        onClick={handleStartClick}
                        className="btn-primary-3d w-full max-w-[240px] min-[375px]:max-w-[260px] sm:max-w-[340px] !py-3 sm:!py-5 !text-lg sm:!text-xl mt-1"
                    >
                        Check Now
                    </button>
                </div>
            </div>

            {/* Name Input Popup */}
            <AnimatePresence>
                {showNamePopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
                        onClick={() => setShowNamePopup(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative bg-white shadow-2xl w-full max-w-[320px] min-[375px]:max-w-[340px] p-5 min-[375px]:p-6 border-[4px] sm:border-[6px] border-[#0066B2] my-auto"
                        >
                            <button
                                onClick={() => setShowNamePopup(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-5 h-5 min-[375px]:w-6 min-[375px]:h-6" />
                            </button>

                            <div className="text-center mb-4 min-[375px]:mb-6">
                                <div className="w-14 h-14 min-[375px]:w-16 min-[375px]:h-16 sm:w-20 sm:h-20 bg-[#0066B2] flex items-center justify-center mx-auto mb-3 min-[375px]:mb-4 shadow-xl border-4 border-white">
                                    <span className="text-2xl min-[375px]:text-3xl sm:text-4xl">👋</span>
                                </div>
                                <h2 className="text-[#0066B2] text-lg min-[375px]:text-xl sm:text-2xl font-black mb-1">Welcome!</h2>
                                <p className="text-slate-500 font-bold text-xs min-[375px]:text-sm sm:text-base">What should we call you?</p>
                            </div>

                            <form onSubmit={handleNameSubmit} className="space-y-3 min-[375px]:space-y-4">
                                <div className="space-y-1 min-[375px]:space-y-1.5">
                                    <label className="block text-slate-700 text-[9px] min-[375px]:text-[10px] sm:text-xs font-black uppercase tracking-widest ml-1" htmlFor="userName">
                                        Your Name
                                    </label>
                                    <input
                                        id="userName"
                                        name="userName"
                                        type="text"
                                        value={userName}
                                        onChange={(e) => {
                                            // Allow only letters and spaces, remove everything else
                                            const val = e.target.value.replace(/[^A-Za-z\s]/g, '');
                                            setUserName(val);

                                            // Real-time validation
                                            if (!val.trim()) {
                                                setErrors(prev => ({ ...prev, name: 'Please enter your name' }));
                                            } else {
                                                setErrors(prev => ({ ...prev, name: null }));
                                            }
                                        }}
                                        placeholder="Full Name"
                                        className={`w-full px-3 py-2.5 min-[375px]:px-4 min-[375px]:py-3 sm:py-4 border-4 ${errors.name ? 'border-red-400' : 'border-slate-100'} focus:border-[#0066B2] focus:outline-none focus:ring-4 focus:ring-[#0066B2]/10 text-slate-800 font-bold text-sm min-[375px]:text-base sm:text-lg transition-all`}
                                        autoFocus
                                        autoComplete="name"
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-[10px] min-[375px]:text-[11px] font-black uppercase tracking-wider ml-1 mt-1 leading-tight">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-1 min-[375px]:space-y-1.5">
                                    <label className="block text-slate-700 text-[9px] min-[375px]:text-[10px] sm:text-xs font-black uppercase tracking-widest ml-1" htmlFor="phone">
                                        Mobile Number
                                    </label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setPhone(val);

                                            // Real-time validation
                                            if (!val.trim()) {
                                                setErrors(prev => ({ ...prev, phone: 'Please enter your phone number' }));
                                            } else if (val.length > 0 && !/^[6-9]/.test(val)) {
                                                setErrors(prev => ({ ...prev, phone: 'Phone number must start with 6-9' }));
                                            } else if (val.length > 0 && val.length < 10) {
                                                setErrors(prev => ({ ...prev, phone: 'Please enter 10 digits' }));
                                            } else if (val.length === 10 && !isValidPhone(val)) {
                                                setErrors(prev => ({ ...prev, phone: 'Please enter a valid 10-digit number' }));
                                            } else {
                                                setErrors(prev => ({ ...prev, phone: null }));
                                            }
                                        }}
                                        placeholder="9876543210"
                                        className={`w-full px-3 py-2.5 min-[375px]:px-4 min-[375px]:py-3 sm:py-4 border-4 ${errors.phone ? 'border-red-400' : 'border-slate-100'} focus:border-[#0066B2] focus:outline-none focus:ring-4 focus:ring-[#0066B2]/10 text-slate-800 font-bold text-sm min-[375px]:text-base sm:text-lg transition-all`}
                                        autoComplete="tel"
                                    />
                                    {errors.phone && (
                                        <p className="text-red-500 text-[10px] min-[375px]:text-[11px] font-black uppercase tracking-wider ml-1 mt-1 leading-tight">{errors.phone}</p>
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
                                        <div className="text-[10px] min-[375px]:text-xs font-bold text-slate-600 leading-tight">
                                            I agree to the <TermsModal /> and allow Bajaj Life Insurance to contact me even if registered on DND.
                                        </div>
                                    </div>
                                    {errors.terms && (
                                        <p className="text-red-500 text-[9px] min-[375px]:text-[10px] font-black uppercase tracking-wider ml-1">{errors.terms}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`btn-primary-3d w-full !py-2.5 min-[375px]:!py-3 sm:!py-4 transition-all ${isSubmitting ? 'opacity-50 grayscale cursor-not-allowed translate-y-0 shadow-none' : ''}`}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                                            Processing...
                                        </span>
                                    ) : (
                                        "Let's Go!"
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default WelcomeScreen;
