import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from "./ui/input";
import { PhoneCall, RotateCcw, X, Calendar, Share, Share2, Clock, ChevronDown } from "lucide-react";
import Confetti from './Confetti';
import { isValidPhone } from '../utils/helpers';
import Speedometer from './Speedometer';
import { submitToLMS, updateLeadNew } from '../utils/api';
import { buildShareUrl } from '../utils/crypto';
import * as Dialog from '@radix-ui/react-dialog';

const TermsModal = () => (
    <Dialog.Root>
        <Dialog.Trigger asChild>
            <span className="text-[#0066B2] underline cursor-pointer hover:text-[#004C85]" onClick={(e) => e.stopPropagation()}>Terms & Conditions</span>
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

const ScoreResultsScreen = ({ score, userName, userPhone, onBookSlot, onRestart }) => {
    const today = new Date().toISOString().split("T")[0];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const maxDate = thirtyDaysFromNow.toISOString().split("T")[0];

    const [formData, setFormData] = useState({ name: userName || '', mobile: userPhone || '', date: '', time: '', consent: true });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const dropdownScrollRef = useRef(null);
    const [showScrollIndicator, setShowScrollIndicator] = useState(false);

    const checkScroll = () => {
        if (dropdownScrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = dropdownScrollRef.current;
            setShowScrollIndicator(scrollHeight > clientHeight + scrollTop + 10);
        }
    };

    const scrollToBottom = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (dropdownScrollRef.current) {
            dropdownScrollRef.current.scrollTo({
                top: dropdownScrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        if (isTimeDropdownOpen) {
            setTimeout(checkScroll, 100);
        }
    }, [isTimeDropdownOpen]);


    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsTimeDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    const [errors, setErrors] = useState({});
    const [showBooking, setShowBooking] = useState(false);

    const updateField = (field, val) => {
        setFormData(p => ({ ...p, [field]: val }));
        if (errors[field]) setErrors(p => ({ ...p, [field]: null }));
    };

    const validate = () => {
        const errs = {};
        if (!formData.name.trim()) {
            errs.name = "Name is required";
        } else if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) {
            errs.name = "Invalid name (letters only)";
        }
        if (!isValidPhone(formData.mobile)) errs.mobile = "Invalid Mobile Number";
        if (!formData.date) errs.date = "Preferred Date is required";
        if (!formData.time) errs.time = "Preferred Time is required";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);

        try {
            const leadNo = sessionStorage.getItem('lifeGoalsLeadNo');
            if (leadNo) {
                await updateLeadNew(leadNo, {
                    firstName: formData.name,
                    mobile: formData.mobile,
                    date: formData.date,
                    time: formData.time,
                    remarks: `Life Goals Game Slot Booking | Score: ${Math.round(score)}`
                });
            } else {
                await submitToLMS({
                    name: formData.name,
                    mobile_no: formData.mobile,
                    date: formData.date,
                    time: formData.time,
                    score: Math.round(score)
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
            onBookSlot(formData);
            setShowBooking(false);
        }
    };

    const handleShare = async () => {
        // Build share URL with re-encrypted token (referral=Y)
        const shareUrl = buildShareUrl() || (typeof window !== 'undefined'
            ? new URL(import.meta.env.BASE_URL || './', window.location.href).href
            : '/');

        const senderName = sessionStorage.getItem('gamification_emp_name') || '';

        const shareData = {
            title: 'Life Goals Preparedness',
            text: `Hi,\nI just tried this Life Goals Preparedness Quiz and scored ${Math.round(score)}/100. It was quite interesting!\nSee how prepared you are for your life goals — try it here: ${shareUrl}\n\n${senderName}`.trim(),
            url: shareUrl
        };

        if (navigator.share) {
            try {
                // We exclude 'url' here because it's already included in the 'text' 
                // and some platforms (Android/WhatsApp) append it twice if both are sent.
                await navigator.share({
                    title: shareData.title,
                    text: shareData.text
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            // Fallback
            try {
                await navigator.clipboard.writeText(shareData.url);
                alert('Link copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };

    return (
        <div className="ghibli-card">
            <Confetti />

            {/* Top Right Share Icon */}
            <button
                onClick={handleShare}
                className="absolute top-4 right-4 z-50 text-white/90 hover:text-white transition-opacity p-2"
            >
                <Share2 className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-md" strokeWidth={2.5} />
            </button>

            {/* Background Pattern */}
            <div className="bg-burst"></div>

            {/* Content Layer - justify-center for impact */}
            <div className="results-container ghibli-content justify-between sm:justify-center py-4 sm:py-8 min-h-0">

                {/* Header Section - Heading above speedometer */}
                <div className="results-header text-center mb-3 sm:mb-4 shrink-0">
                    {/* Heading Text - Above Speedometer - Two lines */}
                    <h1 className="results-title text-base sm:text-lg md:text-xl font-medium text-white uppercase tracking-wide italic mb-2">
                        Hi <span className="ml-1 text-2xl sm:text-3xl md:text-4xl font-black">{userName || 'Bajaj'}!</span>
                    </h1>
                    <h2 className="results-subtitle text-base sm:text-lg md:text-xl text-white uppercase tracking-wide italic mb-3 sm:mb-4">
                        Your <span className="font-black text-lg sm:text-xl md:text-2xl text-[#FF8C00] drop-shadow-[0_0_10px_rgba(255,140,0,0.8)]">life goals</span> score is
                    </h2>

                    {/* Speedometer */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="speedometer-container inline-block transform scale-90 sm:scale-100"
                    >
                        <Speedometer score={Math.round(score)} />
                    </motion.div>

                    {/* Share Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="share-trigger-container flex justify-center mt-2 sm:mt-3"
                    >
                        <button
                            onClick={handleShare}
                            className="bg-gradient-to-r from-[#FF8C00] to-[#FF7000] hover:from-[#FF7000] hover:to-[#E65C00] text-white font-black py-2.5 px-8 transition-all flex items-center gap-3 text-sm sm:text-base uppercase tracking-widest"
                        >
                            <Share2 className="w-5 h-5" /> SHARE
                        </button>
                    </motion.div>
                </div>

                {/* Form Area - More robust and premium */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="contact-box bg-white p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-white/50 mb-3 shrink-0"
                >
                    <p className="text-slate-600 text-[15px] sm:text-sm font-bold text-center mb-4 leading-relaxed">
                        Want to achieve your LIFE GOALS in Real Life?
                    </p>

                    {/* Call Action */}
                    <a href="tel:1800209999" className="block w-full mb-4">
                        <button className="w-full bg-[#0066B2] hover:bg-[#004C85] text-white font-black py-3 sm:py-4 transition-all flex items-center justify-center gap-2 text-xs sm:text-base uppercase tracking-widest">
                            <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5" /> CALL NOW
                        </button>
                    </a>

                    <div className="results-divider relative py-1 mb-3">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-slate-50"></div></div>
                        <div className="relative flex justify-center text-[8px] sm:text-xs uppercase"><span className="px-4 bg-white text-slate-400 font-black tracking-widest">Or</span></div>
                    </div>

                    {/* Booking Trigger Button */}
                    <button
                        onClick={() => setShowBooking(true)}
                        className="w-full bg-[#FF8C00] hover:bg-[#FF7000] text-white font-black py-3 sm:py-4 transition-all flex items-center justify-center gap-2 text-xs sm:text-base uppercase tracking-widest"
                    >
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5" /> BOOK A CONVENIENT SLOT
                    </button>
                </motion.div>

                {/* Disclaimer */}
                <div className="w-full px-6 opacity-60 mt-4">
                    <p className="text-[8px] sm:text-[9px] text-white leading-relaxed text-center max-w-[400px] mx-auto">
                        <span className="font-bold mr-1">Disclaimer:</span> The results shown in this game are indicative and based solely on the information provided by the participant. They are intended for engagement and awareness purposes only and do not constitute financial advice or a recommendation to purchase any life insurance product. Participants should seek independent professional advice before making any financial or insurance decisions. While due care has been taken in designing the game, Bajaj Life Insurance Ltd. assumes no liability for its outcomes.
                    </p>
                </div>

                {/* Restart Option */}
                <div className="restart-container shrink-0 text-center pb-4">
                    <button
                        onClick={onRestart}
                        className="text-blue-100 hover:text-white text-sm sm:text-lg font-black uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-3 mx-auto drop-shadow-md py-4 px-8 bg-white/5 hover:bg-white/10 rounded-xl"
                    >
                        <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" /> Retake Quiz
                    </button>
                </div>
            </div>

            {showBooking && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white p-6 w-full max-w-sm shadow-2xl relative border-4 border-white/50"
                    >
                        <button
                            onClick={() => setShowBooking(false)}
                            className="absolute right-4 top-4 text-slate-300 hover:text-slate-500 transition-colors bg-slate-100 p-1"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-[#0066B2] font-black text-center mb-6 text-sm sm:text-base uppercase tracking-tight pt-2">Book a convenient slot</h2>

                        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 pb-12 sm:pb-24">
                            <div className="space-y-0.5">
                                <label htmlFor="booking-name" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Name</label>
                                <div className="relative">
                                    <Input
                                        id="booking-name"
                                        name="name"
                                        value={formData.name}
                                        onChange={e => {
                                            const val = e.target.value.replace(/[^A-Za-z\s]/g, '');
                                            updateField('name', val);
                                            if (!val.trim()) {
                                                setErrors(prev => ({ ...prev, name: "Name is required" }));
                                            } else {
                                                setErrors(prev => ({ ...prev, name: null }));
                                            }
                                        }}
                                        className={`bg-slate-50 h-11 border-2 ${errors.name ? 'border-red-400' : 'border-slate-100'} text-slate-800 placeholder:text-slate-300 focus-visible:ring-blue-100 text-sm font-bold px-4`}
                                        placeholder="Full Name"
                                        autoComplete="name"
                                    />
                                </div>
                                <div className="min-h-[18px]">
                                    {errors.name && <span className="text-[10px] text-red-500 ml-1 font-black uppercase tracking-wider">{errors.name}</span>}
                                </div>
                            </div>
                            <div className="space-y-0.5">
                                <label htmlFor="booking-mobile" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                                <div className="relative">
                                    <Input
                                        id="booking-mobile"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            updateField('mobile', val);

                                            if (!val.trim()) {
                                                setErrors(p => ({ ...p, mobile: "Mobile is required" }));
                                            } else if (val.length > 0 && !/^[6-9]/.test(val)) {
                                                setErrors(p => ({ ...p, mobile: "Must start with 6-9" }));
                                            } else if (val.length > 0 && val.length < 10) {
                                                setErrors(p => ({ ...p, mobile: "Enter 10 digits" }));
                                            } else {
                                                setErrors(p => ({ ...p, mobile: null }));
                                            }
                                        }}
                                        type="tel"
                                        className={`bg-slate-50 h-11 border-2 ${errors.mobile ? 'border-red-400' : 'border-slate-100'} text-slate-800 placeholder:text-slate-300 focus-visible:ring-blue-100 text-sm font-bold px-4`}
                                        placeholder="9876543210"
                                        autoComplete="tel"
                                    />
                                </div>
                                <div className="min-h-[18px]">
                                    {errors.mobile && <span className="text-[10px] text-red-500 ml-1 font-black uppercase tracking-wider">{errors.mobile}</span>}
                                </div>
                            </div>
                            <div className="space-y-0.5">
                                <label htmlFor="booking-date" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Booking Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 pointer-events-none z-10" strokeWidth={2.5} />
                                    <Input
                                        id="booking-date"
                                        name="date"
                                        type="date"
                                        min={today}
                                        max={maxDate}
                                        value={formData.date}
                                        onChange={e => updateField('date', e.target.value)}
                                        ref={(el) => {
                                            if (el) {
                                                // We can store it in a local variable or use a ref if needed, 
                                                // but for a single click handler, we can find it via parent
                                            }
                                        }}
                                        className={`w-full appearance-none bg-slate-50 h-11 border-2 ${errors.date ? 'border-red-400' : 'border-slate-100'} text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-0 text-sm font-bold pl-12 pr-12 uppercase text-center [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                                        placeholder="DD-MM-YYYY"
                                    />
                                    <div
                                        className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer z-10 p-1"
                                        onClick={() => {
                                            const input = document.getElementById('booking-date');
                                            if (input && input.showPicker) {
                                                input.showPicker();
                                            } else if (input) {
                                                input.click();
                                            }
                                        }}
                                    >
                                        <Calendar className="w-5 h-5 text-slate-800" strokeWidth={2.5} />
                                    </div>
                                </div>
                                <div className="min-h-[18px]">
                                    {errors.date && <p className="text-red-500 text-[10px] font-black uppercase tracking-wider ml-1">{errors.date}</p>}
                                </div>
                            </div>
                            <div className="space-y-0.5">
                                <label htmlFor="booking-time" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Time Slot</label>
                                <div className="relative" ref={dropdownRef}>
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none z-10" />
                                    <div
                                        onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                                        className={`w-full bg-slate-50 h-11 border-2 ${errors.time ? 'border-red-400' : 'border-slate-100'} text-slate-800 text-sm font-bold pl-11 pr-10 rounded-md cursor-pointer flex items-center justify-between ${isTimeDropdownOpen ? 'border-blue-500 ring-4 ring-blue-100' : ''}`}
                                    >
                                        <span className={formData.time ? 'text-slate-800' : 'text-slate-400'}>
                                            {formData.time || "Choose a slot"}
                                        </span>
                                    </div>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none z-10" />

                                    <AnimatePresence>
                                        {isTimeDropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-slate-100 rounded-md shadow-xl z-50 overflow-hidden"
                                            >
                                                <div
                                                    ref={dropdownScrollRef}
                                                    onScroll={checkScroll}
                                                    className="py-1 max-h-[220px] overflow-y-auto scrollbar-hide relative"
                                                >
                                                    {[...Array(12)].map((_, i) => {
                                                        const start = 9 + i;
                                                        const end = start + 1;
                                                        const formatTime = (h) => {
                                                            const amp = h >= 12 ? 'PM' : 'AM';
                                                            const hour = h > 12 ? h - 12 : h;
                                                            return `${hour}:00 ${amp}`;
                                                        };
                                                        const label = `${formatTime(start)} - ${formatTime(end)}`;
                                                        return (
                                                            <div
                                                                key={start}
                                                                onClick={() => {
                                                                    updateField('time', label);
                                                                    setIsTimeDropdownOpen(false);
                                                                }}
                                                                className={`px-4 py-2 text-sm font-bold cursor-pointer hover:bg-slate-100 transition-colors ${formData.time === label ? 'bg-blue-50 text-blue-600' : 'text-slate-800'}`}
                                                            >
                                                                {label}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Floating Scroll Indicator Arrow */}
                                                <AnimatePresence>
                                                    {showScrollIndicator && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: 5 }}
                                                            className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[60] cursor-pointer"
                                                            onClick={scrollToBottom}
                                                        >
                                                            <motion.div
                                                                animate={{ y: [0, 8, 0] }}
                                                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                                                className="flex items-center justify-center p-1"
                                                            >
                                                                <ChevronDown className="w-6 h-6 text-black" strokeWidth={3} />
                                                            </motion.div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <div className="min-h-[18px]">
                                    {errors.time && <p className="text-red-500 text-[10px] font-black uppercase tracking-wider ml-2">{errors.time}</p>}
                                </div>
                            </div>

                            {/* Consent Checkbox - pre-checked */}
                            <label htmlFor="booking-consent" className="flex items-start gap-2 cursor-pointer mt-1">
                                <input
                                    id="booking-consent"
                                    name="consent"
                                    type="checkbox"
                                    checked={formData.consent}
                                    onChange={e => updateField('consent', e.target.checked)}
                                    className="mt-0.5 w-4 h-4 accent-[#0066B2] cursor-pointer shrink-0"
                                />
                                <span className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight">
                                    I agree to the <TermsModal /> and allow Bajaj Life Insurance to contact me even if registered on DND.
                                </span>
                            </label>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#FF8C00] hover:bg-[#FF7000] text-white font-black py-4 transition-all uppercase tracking-widest text-sm mt-2"
                            >
                                {isSubmitting ? 'Confirming...' : 'Book a Slot'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ScoreResultsScreen;
