import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RotateCcw, Phone, Calendar, Clock, X, CheckCircle2, ChevronDown, Share2, ShieldCheck, Medal, Star, AlertCircle } from "lucide-react";
import ScoreCard from './ScoreCard';
import Confetti from './Confetti';
import * as Dialog from '@radix-ui/react-dialog';
import { useQuiz } from '../context/QuizContext';

const ResultsScreen = ({ score, total, onRestart }) => {
    const { leadName, leadPhone, handleBookingSubmit, isTermsAccepted } = useQuiz();
    const percentage = (score / total) * 100;
    const today = new Date().toISOString().split("T")[0];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const maxDate = thirtyDaysFromNow.toISOString().split("T")[0];

    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingTermsAccepted, setBookingTermsAccepted] = useState(isTermsAccepted);
    const [bookingData, setBookingData] = useState({
        name: leadName || '',
        mobile_no: leadPhone || '',
        date: '',
        timeSlot: ''
    });
    const [errors, setErrors] = useState({});

    const timeSlots = [
        "9:00 AM - 10:00 AM",
        "10:00 AM - 11:00 AM",
        "11:00 AM - 12:00 PM",
        "12:00 PM - 1:00 PM",
        "1:00 PM - 2:00 PM",
        "2:00 PM - 3:00 PM",
        "3:00 PM - 4:00 PM",
        "4:00 PM - 5:00 PM",
        "5:00 PM - 6:00 PM",
        "6:00 PM - 7:00 PM",
        "7:00 PM - 8:00 PM",
        "8:00 PM - 9:00 PM"
    ];

    const handleShare = async () => {
        const shareMessage = `I scored ${score}/${total} on the GST quiz! 🏆 Check your GST knowledge here:`;
        const shareUrl = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'GST Quiz',
                    text: shareMessage,
                    url: shareUrl,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback: Copy to clipboard
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
            errs.mobile_no = "Invalid 10-digit number";
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        const result = await handleBookingSubmit({
            ...bookingData,
            booking_timestamp: new Date().toISOString()
        });
        setIsSubmitting(false);

        if (result.success) {
            setIsBookingOpen(false);
        } else {
            setErrors({ submit: result.error || 'Failed to book slot. Please try again.' });
        }
    };

    const getResultTitle = (currentScore) => {
        if (currentScore === 0) return "Learning begins";
        if (currentScore <= 2) return "Keep going";
        if (currentScore <= 3) return "Good attempt";
        if (currentScore === 4) return "Well done";
        return "Outstanding";
    };

    const getMotivationalMessage = (currentScore) => {
        if (currentScore === 0) return "No worries — Let’s try again!";
        if (currentScore <= 2) return "Not quite there yet — You can do better!";
        if (currentScore <= 3) return "Good effort — You can do better!";
        if (currentScore === 4) return "You’ve learned important financial concepts";
        return "Excellent! You aced the GST Quiz!";
    };

    const getAchievementIcon = (currentScore) => {
        if (currentScore === 0) return <AlertCircle className="w-12 h-12 text-brand-blue" strokeWidth={2} />;
        if (currentScore <= 2) return <Star className="w-12 h-12 text-brand-blue" strokeWidth={2} />;
        if (currentScore <= 4) return <Medal className="w-12 h-12 text-brand-blue" strokeWidth={2} />;
        return <Trophy className="w-12 h-12 text-brand-blue" strokeWidth={2} />;
    };

    return (
        <motion.div
            className="w-full h-[100dvh] flex flex-col items-center justify-center p-4 text-center relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            {percentage >= 60 && <Confetti />}

            {/* Top Right Share Button */}
            <button
                onClick={handleShare}
                className="absolute top-4 right-4 p-2 sm:p-3 bg-white/50 backdrop-blur-sm rounded-full text-brand-blue hover:bg-white shadow-sm transition-all active:scale-95 z-10"
            >
                <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Content Wrapper for consistency across heights */}
            <div className="w-full h-full max-w-sm sm:max-w-2xl flex flex-col justify-between mx-auto py-1 min-[410px]:py-4 sm:py-16 min-h-0 origin-center">
                <div className="flex-1 flex flex-col justify-center space-y-0.5 min-[410px]:space-y-4 sm:space-y-12 w-full min-h-0 py-1">
                    {/* 1. Greeting */}
                    <p className="text-lg min-[410px]:text-2xl sm:text-5xl text-gray-600 font-bold">
                        Hi <span className="text-brand-blue font-black">{leadName || 'Friend'}</span>
                    </p>

                    {/* 2. Animated Meter */}
                    <div className="py-0 min-[410px]:py-2 sm:py-6 scale-[0.7] min-[410px]:scale-[1] sm:scale-[1.5] flex justify-center origin-center shrink-0">
                        <ScoreCard score={score} total={total} />
                    </div>

                    {/* 3. Titles & Feedback */}
                    <div className="space-y-0 min-[410px]:space-y-2 sm:space-y-6">
                        <h2 className="text-xl min-[410px]:text-4xl sm:text-7xl font-black text-gray-800 tracking-tight leading-none text-center">
                            {getResultTitle(score)}
                        </h2>
                        <p className="text-[13px] min-[410px]:text-lg sm:text-3xl text-gray-500 font-bold leading-tight px-4 text-center">
                            {getMotivationalMessage(score)}
                        </p>
                    </div>

                    {/* 4. Share Button (Restored) */}
                    <button
                        onClick={handleShare}
                        className="flex items-center justify-center gap-2 bg-brand-blue text-white font-black py-2.5 min-[410px]:py-4 sm:py-8 px-6 sm:px-14 rounded-[16px] sm:rounded-[28px] shadow-lg hover:bg-blue-500 transition-all text-sm min-[410px]:text-lg sm:text-3xl w-full max-w-[200px] min-[410px]:max-w-[280px] sm:max-w-[500px] mx-auto mt-1 min-[410px]:mt-2 sm:mt-10 shrink-0"
                    >
                        <Share2 className="w-4 h-4 min-[410px]:w-6 min-[410px]:h-6 sm:w-10 sm:h-10" />
                        <span>Share</span>
                    </button>
                </div>

                <div className="w-full space-y-1 min-[410px]:space-y-4 sm:space-y-12 pb-2 min-[410px]:pb-4 sm:pb-16 mt-1 min-[410px]:mt-10">
                    {/* Enhanced Action Card */}
                    <div className="bg-white rounded-[16px] sm:rounded-[40px] p-2 min-[410px]:p-5 sm:p-14 shadow-sm border-2 border-soft-gray space-y-2 min-[410px]:space-y-4 sm:space-y-12 relative overflow-hidden text-center">
                        <p className="text-gray-700 text-[12px] min-[410px]:text-base sm:text-2xl font-bold leading-tight italic px-2">
                            To know more about insurance and savings products, connect with our Relationship Manager
                        </p>

                        <div className="flex flex-col gap-1.5 min-[410px]:gap-3 sm:gap-6 pt-0 min-[410px]:pt-1 sm:pt-6">
                            <motion.a
                                href="tel:18002097272"
                                className="bg-gray-100 text-gray-700 font-black py-2.5 min-[410px]:py-4 sm:py-8 px-4 sm:px-12 rounded-[16px] sm:rounded-[28px] flex items-center justify-center gap-3 transition-all text-base min-[410px]:text-lg sm:text-3xl border-2 border-gray-200"
                            >
                                <Phone className="w-5 h-5 min-[410px]:w-6 min-[410px]:h-6 sm:w-10 sm:h-10" />
                                <span>Call now</span>
                            </motion.a>
                            <div className="flex items-center gap-2 px-4 scale-90 min-[410px]:scale-100 sm:scale-125">
                                <div className="h-[1px] flex-1 bg-gray-200" />
                                <span className="text-gray-400 font-bold text-[12px] min-[410px]:text-base sm:text-2xl">OR</span>
                                <div className="h-[1px] flex-1 bg-gray-200" />
                            </div>
                            <motion.button
                                onClick={() => setIsBookingOpen(true)}
                                className="bg-brand-green text-white font-black py-2.5 min-[410px]:py-4 sm:py-8 px-4 sm:px-12 rounded-[16px] sm:rounded-[28px] flex items-center justify-center gap-3 transition-all text-base min-[410px]:text-lg sm:text-3xl shadow-[0_4px_0_0_#45a049] sm:shadow-[0_10px_0_0_#45a049]"
                            >
                                <Calendar className="w-4 h-4 min-[410px]:w-6 min-[410px]:h-6 sm:w-10 sm:h-10" />
                                <span>Book a slot</span>
                            </motion.button>
                        </div>
                    </div>

                    {/* Large Retake Button */}
                    <button
                        onClick={onRestart}
                        className="game-btn w-full py-4 min-[410px]:py-5 sm:py-10 text-lg min-[410px]:text-xl sm:text-4xl flex items-center justify-center gap-3 rounded-[16px] sm:rounded-[28px]"
                    >
                        <RotateCcw className="w-5 h-5 min-[410px]:w-6 min-[410px]:h-6 sm:w-10 sm:h-10" />
                        <span>Retake quiz</span>
                    </button>
                </div>
            </div>

            {/* Booking Modal */}
            <Dialog.Root open={isBookingOpen} onOpenChange={setIsBookingOpen}>
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
                                    onClick={() => setIsBookingOpen(false)}
                                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>

                                <Dialog.Title className="text-3xl font-black text-gray-800 text-center mb-2 tracking-tight">
                                    Book a slot
                                </Dialog.Title>
                                <p className="text-center text-gray-400 font-bold mb-8">
                                    Pick your preferred time
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 gap-4">
                                        <input
                                            type="text"
                                            id="booking-name"
                                            name="name"
                                            autoComplete="name"
                                            value={bookingData.name}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                                setBookingData(prev => ({ ...prev, name: val }));
                                                if (!val.trim()) setErrors(prev => ({ ...prev, name: "Name is required" }));
                                                else setErrors(prev => ({ ...prev, name: null }));
                                            }}
                                            placeholder="Your name"
                                            className="w-full bg-gray-50 border-2 border-soft-gray rounded-2xl px-5 py-3 text-gray-800 font-bold focus:outline-none focus:border-brand-blue"
                                        />
                                        <input
                                            type="text"
                                            id="booking-phone"
                                            name="mobile_no"
                                            autoComplete="tel"
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
                                            className="w-full bg-gray-50 border-2 border-soft-gray rounded-2xl px-5 py-3 text-gray-800 font-bold focus:outline-none focus:border-brand-blue"
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-blue pointer-events-none" />
                                            <input
                                                type="date"
                                                id="booking-date"
                                                name="date"
                                                value={bookingData.date}
                                                min={today}
                                                max={maxDate}
                                                onChange={(e) => {
                                                    setBookingData(prev => ({ ...prev, date: e.target.value }));
                                                    setErrors(prev => ({ ...prev, date: null }));
                                                }}
                                                className="w-full bg-gray-50 border-2 border-soft-gray rounded-2xl pl-11 pr-4 py-3 text-gray-800 font-bold focus:outline-none focus:border-brand-blue"
                                            />
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-blue pointer-events-none" />
                                        <select
                                            id="booking-slot"
                                            name="timeSlot"
                                            value={bookingData.timeSlot}
                                            onChange={(e) => {
                                                setBookingData(prev => ({ ...prev, timeSlot: e.target.value }));
                                                setErrors(prev => ({ ...prev, timeSlot: null }));
                                            }}
                                            className="w-full bg-gray-50 border-2 border-soft-gray rounded-2xl pl-11 pr-10 py-3 text-gray-800 font-bold focus:outline-none focus:border-brand-blue appearance-none"
                                        >
                                            <option value="">Choose a slot</option>
                                            {timeSlots.map(slot => (
                                                <option key={slot} value={slot}>{slot}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-start gap-3 cursor-pointer" onClick={() => setBookingTermsAccepted(!bookingTermsAccepted)}>
                                            <div className={`shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${bookingTermsAccepted ? 'bg-brand-green border-brand-green' : 'border-soft-gray bg-gray-50'}`}>
                                                {bookingTermsAccepted && <ShieldCheck className="w-5 h-5 text-white" />}
                                            </div>
                                            <div className="text-sm text-gray-500 font-bold leading-tight">
                                                I accept the terms & conditions and acknowledge the privacy policy.
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full game-btn-green text-xl py-4 disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Booking...' : 'Confirm booking'}
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </motion.div >
    );
};

export default ResultsScreen;
