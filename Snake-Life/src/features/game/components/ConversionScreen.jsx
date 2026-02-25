import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, PhoneCall, Calendar, Trophy, RotateCcw, Star, Medal, AlertCircle, Phone, Clock, ChevronDown, ShieldCheck, X } from 'lucide-react';
import ScoreCard from './ScoreCard';
import Modal from './Modal';
import ThankYouScreen from './ThankYouScreen';

const ConversionScreen = ({ score, total = 20, leadData, onRestart, onBookSlot }) => {
    const today = new Date().toISOString().split("T")[0];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const maxDate = thirtyDaysFromNow.toISOString().split("T")[0];

    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isBookingSuccess, setIsBookingSuccess] = useState(false);
    const [bookingTermsAccepted, setBookingTermsAccepted] = useState(true);
    const [bookingData, setBookingData] = useState({
        name: leadData?.name || '',
        mobile_no: leadData?.phone || '',
        date: '',
        timeSlot: ''
    });
    const [errors, setErrors] = useState({});

    const timeSlots = [
        "10:00 AM - 12:00 PM",
        "12:00 PM - 02:00 PM",
        "02:00 PM - 04:00 PM",
        "04:00 PM - 06:00 PM"
    ];

    const handleShare = async () => {
        const shareMessage = `I achieved ${score} milestones on Snake Life! 🏆 Secure your future here:`;
        const shareUrl = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Snake Life',
                    text: shareMessage,
                    url: shareUrl,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            try {
                const fullText = `${shareMessage} ${shareUrl}`;
                await navigator.clipboard.writeText(fullText);
                alert('Score and link copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        }
    };

    const validate = () => {
        const errs = {};
        if (!bookingData.name.trim()) {
            errs.name = "Name is required";
        } else if (!/^[A-Za-z\s]+$/.test(bookingData.name.trim())) {
            errs.name = "Letters only";
        }

        if (!bookingData.mobile_no.trim()) {
            errs.mobile_no = "Mobile is required";
        } else if (!/^[6-9]\d{9}$/.test(bookingData.mobile_no)) {
            errs.mobile_no = "Invalid 10-digit number (starts 6-9)";
        }

        if (!bookingData.date) {
            errs.date = "Select a date";
        }
        if (!bookingData.timeSlot) {
            errs.timeSlot = "Select a slot";
        }
        if (!bookingTermsAccepted) {
            errs.terms = "Accept terms";
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        const result = await onBookSlot({
            ...bookingData,
            summary_dtls: 'Snake Life - Appointment'
        });
        setIsSubmitting(false);

        if (result.success) {
            setIsBookingSuccess(true);
            setIsBookingOpen(false);
        } else {
            setErrors({ submit: result.error || 'Failed to book slot. Please try again.' });
        }
    };

    const getResultTitle = (m) => {
        if (m === 0) return "Learning begins";
        if (m <= 5) return "Keep going";
        if (m <= 10) return "Good attempt";
        if (m <= 15) return "Well done";
        return "Outstanding";
    };

    const getMotivationalMessage = (m) => {
        if (m === 0) return "No worries — Let’s try again!";
        if (m <= 5) return "Building a foundation takes time. Each milestone counts!";
        if (m <= 15) return "You’ve secured some great life milestones!";
        return "Excellent! You are a master of life protection!";
    };

    return (
        <motion.div
            className="w-full h-[100dvh] flex flex-col items-center bg-slate-950 p-4 sh:p-2 pb-4 sh:pb-6 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header / Top Bar */}
            <div className="w-full max-w-sm flex items-center justify-center relative py-2 sh:py-0 mb-1 sh:mb-0">
                <p className="text-gray-400 font-bold text-2xl sm:text-3xl sh:text-lg text-center">
                    Hi <span className="text-blue-500 font-black">{leadData?.name || 'Friend'}</span>
                </p>
                <button
                    onClick={handleShare}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 sh:p-1 bg-white/5 backdrop-blur-sm rounded-full text-white/70 hover:text-white hover:bg-white/10 border border-white/10 transition-all active:scale-95 z-10"
                >
                    <Share2 className="w-5 h-5 sh:w-3.5 sh:h-3.5" />
                </button>
            </div>

            <div className="w-full max-w-sm flex flex-col items-center flex-1 justify-between gap-y-3 sh:gap-y-0.5 min-h-0">
                {/* Score Section */}
                <div className="scale-90 sh:scale-[0.85] transform origin-center py-1 sh:py-0 sh:-mt-4 sh:-mb-12 transition-all">
                    <ScoreCard score={score} total={total} />
                </div>

                {/* Messaging Section */}
                <div className="space-y-1 sh:space-y-0.5 text-center flex flex-col items-center">
                    <h2 className="text-3xl sm:text-4xl sh:text-2xl font-black text-white tracking-tight leading-none">
                        {getResultTitle(score)}
                    </h2>
                    <p className="text-base sm:text-lg sh:text-xs text-gray-500 font-bold leading-tight px-4 mt-0.5 sh:mt-1">
                        {getMotivationalMessage(score)}
                    </p>
                </div>

                {/* Primary Action */}
                <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white font-black py-4 sh:py-3.5 px-8 rounded-2xl sh:rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:bg-blue-500 transition-all text-lg sh:text-base w-full max-w-[280px]"
                >
                    <Share2 className="w-5 h-5 sh:w-4 sh:h-4" />
                    <span>Share</span>
                </button>

                {/* Action Card Section */}
                <div className="w-full bg-[#0f172a]/80 backdrop-blur-md rounded-[28px] sh:rounded-[20px] p-5 sh:p-3 border border-slate-800 space-y-4 sh:space-y-2 relative overflow-hidden text-center shadow-xl">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
                    <p className="text-gray-400 text-sm sh:text-xs font-bold leading-tight">
                        To Keep Achieving Life Milestones,<br />Connect with our Relationship Manager
                    </p>

                    <div className="flex flex-col gap-3 sh:gap-2">
                        <motion.a
                            href="tel:18002097272"
                            className="bg-slate-900 text-white font-black py-4 sh:py-3.5 px-6 rounded-2xl sh:rounded-xl flex items-center justify-center gap-3 transition-all text-lg sh:text-base border border-slate-700 hover:bg-slate-800"
                        >
                            <Phone className="w-6 h-6 sh:w-5 sh:h-5 text-gray-400" />
                            <span>Call now</span>
                        </motion.a>

                        <div className="flex items-center gap-4 py-1 sh:py-0.5">
                            <div className="h-[1px] flex-1 bg-slate-800" />
                            <span className="text-slate-600 font-bold text-[10px] uppercase tracking-widest leading-none">OR</span>
                            <div className="h-[1px] flex-1 bg-slate-800" />
                        </div>

                        <motion.button
                            onClick={() => setIsBookingOpen(true)}
                            className="bg-green-600 text-white font-black py-4 sh:py-3.5 px-6 rounded-2xl sh:rounded-xl flex items-center justify-center gap-3 transition-all text-lg sh:text-base shadow-[0_0_15px_rgba(22,163,74,0.2)] hover:bg-green-500"
                        >
                            <Calendar className="w-5 h-5 sh:w-4 sh:h-4 opacity-80" />
                            <span>Book a slot</span>
                        </motion.button>
                    </div>
                </div>

                {/* Restart Action */}
                <button
                    onClick={onRestart}
                    className="w-full py-5 sh:py-4 rounded-2xl sh:rounded-xl bg-slate-900 border border-slate-800 text-white font-black text-xl sh:text-lg flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-lg"
                >
                    <RotateCcw className="w-6 h-6 sh:w-5 sh:h-5 text-gray-400" />
                    <span>Play again</span>
                </button>
            </div>

            <AnimatePresence>
                {isBookingSuccess && (
                    <div className="fixed inset-0 z-[110] bg-slate-950">
                        <ThankYouScreen
                            leadName={bookingData.name}
                            onRestart={onRestart}
                        />
                    </div>
                )}
            </AnimatePresence>

            {/* Booking Modal */}
            <Modal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)}>
                <div className="bg-[#0f172a] rounded-[32px] p-8 w-full max-w-md shadow-2xl border-2 border-slate-800 relative overflow-hidden my-auto text-left">
                    <button
                        onClick={() => setIsBookingOpen(false)}
                        className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <h2 className="text-3xl font-black text-white text-center mb-2 tracking-tight">
                        Book a slot
                    </h2>
                    <p className="text-center text-gray-400 font-bold mb-8 text-sm">
                        Pick your preferred time
                    </p>

                    <form onSubmit={handleBookingSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <input
                                    type="text"
                                    value={bookingData.name}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                        setBookingData(prev => ({ ...prev, name: val }));
                                        if (!val.trim()) setErrors(prev => ({ ...prev, name: "Name is required" }));
                                        else setErrors(prev => ({ ...prev, name: null }));
                                    }}
                                    placeholder="Your name"
                                    className={`w-full bg-slate-900 border-2 rounded-2xl px-5 py-3 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors ${errors.name ? 'border-red-500' : 'border-slate-800'}`}
                                />
                                {errors.name && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{errors.name}</p>}
                            </div>

                            <div>
                                <input
                                    type="text"
                                    value={bookingData.mobile_no}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setBookingData(prev => ({ ...prev, mobile_no: val }));
                                        if (!val.trim()) setErrors(prev => ({ ...prev, mobile_no: "Mobile is required" }));
                                        else if (val.length > 0 && val.length < 10) setErrors(prev => ({ ...prev, mobile_no: "Enter 10 digits" }));
                                        else if (val.length === 10 && !/^[6-9]/.test(val)) setErrors(prev => ({ ...prev, mobile_no: "Must start 6-9" }));
                                        else setErrors(prev => ({ ...prev, mobile_no: null }));
                                    }}
                                    placeholder="Mobile number"
                                    className={`w-full bg-slate-900 border-2 rounded-2xl px-5 py-3 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors ${errors.mobile_no ? 'border-red-500' : 'border-slate-800'}`}
                                />
                                {errors.mobile_no && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{errors.mobile_no}</p>}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none" />
                                <input
                                    type="date"
                                    value={bookingData.date}
                                    min={today}
                                    max={maxDate}
                                    onChange={(e) => {
                                        setBookingData(prev => ({ ...prev, date: e.target.value }));
                                        setErrors(prev => ({ ...prev, date: null }));
                                    }}
                                    className={`w-full bg-slate-900 border-2 rounded-2xl pl-11 pr-4 py-3 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors ${errors.date ? 'border-red-500' : 'border-slate-800'}`}
                                />
                                {errors.date && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{errors.date}</p>}
                            </div>
                        </div>

                        <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none" />
                            <select
                                value={bookingData.timeSlot}
                                onChange={(e) => {
                                    setBookingData(prev => ({ ...prev, timeSlot: e.target.value }));
                                    setErrors(prev => ({ ...prev, timeSlot: null }));
                                }}
                                className={`w-full bg-slate-900 border-2 rounded-2xl pl-11 pr-10 py-3 text-white font-bold focus:outline-none focus:border-blue-500 appearance-none transition-colors ${errors.timeSlot ? 'border-red-500' : 'border-slate-800'}`}
                            >
                                <option value="" className="bg-slate-950 text-white">Choose a slot</option>
                                {timeSlots.map(slot => (
                                    <option key={slot} value={slot} className="bg-slate-950 text-white">{slot}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                            {errors.timeSlot && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{errors.timeSlot}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-start gap-3 cursor-pointer" onClick={() => setBookingTermsAccepted(!bookingTermsAccepted)}>
                                <div className={`shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${bookingTermsAccepted ? 'bg-green-600 border-green-600' : 'border-slate-800 bg-slate-900'}`}>
                                    {bookingTermsAccepted && <ShieldCheck className="w-5 h-5 text-white" />}
                                </div>
                                <div className="text-sm text-gray-500 font-bold leading-tight">
                                    I accept the terms & conditions and acknowledge the privacy policy.
                                </div>
                            </div>
                            {errors.terms && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{errors.terms}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-4 rounded-2xl text-xl font-black text-white transition-all ${isSubmitting ? 'bg-green-800 opacity-50' : 'bg-green-600 hover:bg-green-500 active:scale-95 shadow-lg'}`}
                        >
                            {isSubmitting ? 'Booking...' : 'Confirm booking'}
                        </button>
                    </form>
                </div>
            </Modal>
        </motion.div>
    );
};

export default ConversionScreen;
