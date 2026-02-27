import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from "./ui/input";
import { PhoneCall, RotateCcw, X, Calendar, Share, Share2 } from "lucide-react";
import Confetti from './Confetti';
import { isValidPhone } from '../utils/helpers';
import Speedometer from './Speedometer';
import { submitToLMS } from '../utils/api';

const ScoreResultsScreen = ({ score, userName, userPhone, onBookSlot, onRestart }) => {
    const today = new Date().toISOString().split("T")[0];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const maxDate = thirtyDaysFromNow.toISOString().split("T")[0];

    const [formData, setFormData] = useState({ name: userName || '', mobile: userPhone || '', date: '', time: '', consent: true });
    const [isSubmitting, setIsSubmitting] = useState(false);
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
            await submitToLMS({
                name: formData.name,
                mobile_no: formData.mobile,
                date: formData.date,
                time: formData.time,
                score: Math.round(score)
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
            onBookSlot(formData);
            setShowBooking(false);
        }
    };

    const handleShare = async () => {
        // compute app base URL dynamically so share link works under any deployment subpath
        const appBaseUrl = (typeof window !== 'undefined')
            ? new URL(import.meta.env.BASE_URL || './', window.location.href).href
            : '/';

        const shareData = {
            title: 'Bajaj Life Goals Quiz',
            text: 'Check your Life Goals readiness! Take the Bajaj Life Goals Quiz and discover how prepared you are for your future.',
            url: appBaseUrl
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
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
                    <p className="text-slate-600 text-[10px] sm:text-sm font-bold text-center mb-4 leading-relaxed">
                        To Know more about insurance and savings products! Connect with our Relationship Manager to get started.
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

                        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                            <div className="space-y-1">
                                <label htmlFor="booking-name" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Name</label>
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
                                {errors.name && <span className="text-[10px] text-red-500 ml-1 font-black uppercase tracking-wider">{errors.name}</span>}
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="booking-mobile" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
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
                                {errors.mobile && <span className="text-[10px] text-red-500 ml-1 font-black uppercase tracking-wider">{errors.mobile}</span>}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label htmlFor="booking-date" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Date</label>
                                    <Input
                                        id="booking-date"
                                        name="date"
                                        type="date"
                                        min={today}
                                        max={maxDate}
                                        value={formData.date} onChange={e => updateField('date', e.target.value)}
                                        className={`bg-slate-50 h-11 border-2 ${errors.date ? 'border-red-400' : 'border-slate-100'} text-slate-800 placeholder:text-slate-300 focus-visible:ring-blue-100 text-xs font-bold px-4`}
                                    />
                                    {errors.date && <span className="text-[10px] text-red-500 ml-1 font-black uppercase tracking-wider">{errors.date}</span>}
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="booking-time" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Time</label>
                                    <select
                                        id="booking-time"
                                        name="time"
                                        value={formData.time}
                                        onChange={e => updateField('time', e.target.value)}
                                        className="w-full bg-slate-50 h-11 border-2 border-slate-100 text-slate-800 focus-visible:ring-blue-100 text-xs font-bold px-4 appearance-none"
                                    >
                                        <option value="">Select Slot</option>
                                        {[...Array(12)].map((_, i) => {
                                            const start = 9 + i;
                                            const end = start + 1;
                                            const formatTime = (h) => {
                                                const amp = h >= 12 ? 'PM' : 'AM';
                                                const hour = h > 12 ? h - 12 : h;
                                                return `${hour}:00 ${amp}`;
                                            };
                                            const label = `${formatTime(start)} - ${formatTime(end)}`;
                                            return <option key={start} value={label}>{label}</option>;
                                        })}
                                    </select>
                                    {errors.time && <span className="text-[10px] text-red-500 ml-1 font-black uppercase tracking-wider">{errors.time}</span>}
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
                                    I agree to the <span className="text-[#0066B2] underline cursor-pointer">Terms & Conditions</span> and allow Bajaj Life Insurance to contact me even if registered on DND.
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
