import { useState, useRef, useEffect } from 'react';
import { buildShareUrl } from '../utils/crypto';
import { shortenUrl } from '../utils/shortener';
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
    const [isTermsOpen, setIsTermsOpen] = useState(false);
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
        const rawUrl = buildShareUrl() || window.location.href;
        const shareUrl = await shortenUrl(rawUrl);
        const senderName = sessionStorage.getItem('gamification_emp_name') || '';
        const shareMessage = `Hi,\nI tried this GST quiz related to Life Insurance and got ${Math.round(score)}/${total}.\nThink you can beat my score? Take the quiz here: ${shareUrl}\n\n${senderName}`.trim();

        if (navigator.share) {
            try {
                // We exclude 'url' here because it's already included in the 'text' 
                // and some platforms (Android/WhatsApp) append it twice if both are sent.
                await navigator.share({
                    title: 'GST Quiz',
                    text: shareMessage
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareMessage);
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
            errs.mobile_no = "Mobile Number is required";
        } else if (!/^[6-9]\d{9}$/.test(bookingData.mobile_no)) {
            errs.mobile_no = "Enter a Valid Mobile Number";
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
            className="w-full min-h-[100dvh] flex flex-col items-center p-4 pt-10 text-center relative overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            {percentage >= 60 && <Confetti />}

            {/* Top Right Share Button */}

            {/* Content Wrapper for consistency across heights */}
            <div className="w-full max-w-sm flex flex-col justify-between mx-auto py-4">
                <div className="flex flex-col space-y-4 w-full">
                    {/* 1. Greeting */}
                    <p className="text-2xl text-gray-600 font-bold">
                        Hi <span className="text-brand-blue font-black">{leadName || 'Friend'}</span>
                    </p>

                    {/* 2. Animated Meter */}
                    <div className="py-2 flex justify-center origin-center">
                        <ScoreCard score={score} total={total} />
                    </div>

                    {/* 3. Titles & Feedback */}
                    <div className="space-y-2">
                        <h2 className="text-4xl font-black text-gray-800 tracking-tight leading-none text-center">
                            {getResultTitle(score)}
                        </h2>
                        <p className="text-lg text-gray-500 font-bold leading-tight px-4 text-center">
                            {getMotivationalMessage(score)}
                        </p>
                    </div>

                    {/* 4. Share Button (Restored) */}
                    <button
                        onClick={handleShare}
                        className="flex items-center justify-center gap-2 bg-brand-blue text-white font-black py-4 px-6 rounded-[16px] shadow-lg hover:bg-blue-500 transition-all text-lg w-full max-w-[280px] mx-auto mt-2"
                    >
                        <Share2 className="w-6 h-6" />
                        <span>Share</span>
                    </button>
                </div>

                <div className="w-full space-y-4 pb-4 mt-4">
                    {/* Enhanced Action Card */}
                    <div className="bg-white rounded-[16px] p-5 shadow-sm border-2 border-soft-gray space-y-4 relative overflow-hidden text-center">
                        <p className="text-gray-700 text-base font-bold leading-tight italic px-2">
                            To know more about insurance and savings products, connect with our Relationship Manager
                        </p>

                        <div className="flex flex-col gap-3 pt-1">
                            <motion.a
                                href="tel:18002097272"
                                className="bg-gray-100 text-gray-700 font-black py-4 px-4 rounded-[16px] flex items-center justify-center gap-3 transition-all text-lg border-2 border-gray-200"
                            >
                                <Phone className="w-6 h-6" />
                                <span>Call now</span>
                            </motion.a>
                            <div className="flex items-center gap-2 px-4">
                                <div className="h-[1px] flex-1 bg-gray-200" />
                                <span className="text-gray-400 font-bold text-base">OR</span>
                                <div className="h-[1px] flex-1 bg-gray-200" />
                            </div>
                            <motion.button
                                onClick={() => setIsBookingOpen(true)}
                                className="bg-brand-green text-white font-black py-4 px-4 rounded-[16px] flex items-center justify-center gap-3 transition-all text-lg shadow-[0_4px_0_0_#45a049]"
                            >
                                <Calendar className="w-6 h-6" />
                                <span>Book a slot</span>
                            </motion.button>
                        </div>
                    </div>

                    {/* Play again Text Link */}
                    <div
                        onClick={onRestart}
                        className="text-white font-black uppercase tracking-[0.2em] text-sm cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center gap-3 mb-3"
                    >
                        <RotateCcw className="w-5 h-5" />
                        <span>play again</span>
                    </div>

                    {/* Disclaimer */}
                    <div className="w-full px-6 opacity-40 mt-2">
                        <p className="text-[7px] sm:text-[8px] text-white leading-relaxed text-center font-bold max-w-[380px] mx-auto uppercase tracking-tighter">
                            <span className="opacity-60 underline mr-1">Disclaimer:</span> The results shown in this game are indicative and based solely on the information provided by the participant. They are intended for engagement and awareness purposes only and do not constitute financial advice or a recommendation to purchase any life insurance product. Participants should seek independent professional advice before making any financial or insurance decisions. While due care has been taken in designing the game, Bajaj Life Insurance Ltd. assumes no liability for its outcomes.
                        </p>
                    </div>


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
                                className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl border-2 border-slate-100 relative overflow-hidden my-auto text-left"
                            >
                                <button
                                    onClick={() => setIsBookingOpen(false)}
                                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>

                                <Dialog.Title className="text-xl sm:text-2xl font-black text-gray-800 text-center mb-6 tracking-tight pr-6 whitespace-nowrap">
                                    Book a Slot
                                </Dialog.Title>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-1">
                                            <label htmlFor="booking-name" className="text-sm font-bold text-gray-500 block text-left mb-1 ml-1">Name</label>
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
                                                className={`w-full bg-gray-50 border-2 rounded-2xl px-5 py-3 text-gray-800 font-bold focus:outline-none transition-colors ${errors.name ? 'border-red-500' : 'border-slate-100 focus:border-blue-400'}`}
                                            />
                                            {errors.name && <p className="text-red-500 text-xs font-bold ml-2">{errors.name}</p>}
                                        </div>

                                        <div className="space-y-1">
                                            <label htmlFor="booking-phone" className="text-sm font-bold text-gray-500 block text-left mb-1 ml-1">Mobile Number</label>
                                            <input
                                                type="text"
                                                id="booking-phone"
                                                name="mobile_no"
                                                autoComplete="tel"
                                                value={bookingData.mobile_no}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                    setBookingData(prev => ({ ...prev, mobile_no: val }));
                                                    if (!val.trim()) setErrors(prev => ({ ...prev, mobile_no: "Mobile Number is required" }));
                                                    else if (val.length < 10 || !/^[6-9]/.test(val)) setErrors(prev => ({ ...prev, mobile_no: "Enter a Valid Mobile Number" }));
                                                    else setErrors(prev => ({ ...prev, mobile_no: null }));
                                                }}
                                                placeholder="Mobile number"
                                                className={`w-full bg-gray-50 border-2 rounded-2xl px-5 py-3 text-gray-800 font-bold focus:outline-none transition-colors ${errors.mobile_no ? 'border-red-500' : 'border-slate-100 focus:border-blue-400'}`}
                                            />
                                            {errors.mobile_no && <p className="text-red-500 text-xs font-bold ml-2">{errors.mobile_no}</p>}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <div className="space-y-1">
                                            <label htmlFor="booking-date" className="text-sm font-bold text-gray-500 block text-left mb-1 ml-1">Booking Date</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none" />
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
                                                    className={`block w-full min-h-[52px] bg-gray-50 border-2 rounded-2xl pl-11 pr-4 py-3 text-gray-800 font-bold focus:outline-none transition-colors appearance-none ${errors.date ? 'border-red-500' : 'border-slate-100 focus:border-blue-400'}`}
                                                />
                                                {errors.date && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{errors.date}</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label htmlFor="booking-timeslot" className="text-sm font-bold text-gray-500 block text-left mb-1 ml-1">Preferred Time Slot</label>
                                            <div className="relative">
                                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none" />
                                                <select
                                                    id="booking-timeslot"
                                                    name="timeSlot"
                                                    value={bookingData.timeSlot}
                                                    onChange={(e) => {
                                                        setBookingData(prev => ({ ...prev, timeSlot: e.target.value }));
                                                        setErrors(prev => ({ ...prev, timeSlot: null }));
                                                    }}
                                                    className={`block w-full min-h-[52px] bg-gray-50 border-2 rounded-2xl pl-11 pr-10 py-3 text-gray-800 font-bold focus:outline-none appearance-none transition-colors ${errors.timeSlot ? 'border-red-500' : 'border-slate-100 focus:border-blue-400'}`}
                                                >
                                                    <option value="">Choose a slot</option>
                                                    {timeSlots.map(slot => {
                                                        const now = new Date();
                                                        const isToday = bookingData.date === today;
                                                        const currentHour = now.getHours();

                                                        // Parse "9:00 AM - 10:00 AM" -> start hour is 9
                                                        const startHourStr = slot.split(':')[0];
                                                        let startHour = parseInt(startHourStr);
                                                        if (slot.includes('PM') && startHour !== 12) startHour += 12;
                                                        if (slot.includes('AM') && startHour === 12) startHour = 0;

                                                        if (isToday && startHour <= currentHour) return null;

                                                        return <option key={slot} value={slot}>{slot}</option>;
                                                    }).filter(Boolean)}
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                                                {errors.timeSlot && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{errors.timeSlot}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-center items-center gap-3 cursor-pointer" onClick={() => setBookingTermsAccepted(!bookingTermsAccepted)}>
                                            <div className={`shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${bookingTermsAccepted ? 'bg-brand-green border-brand-green' : 'border-slate-100 bg-gray-50'}`}>
                                                {bookingTermsAccepted && <ShieldCheck className="w-5 h-5 text-white" />}
                                            </div>
                                            <div className="text-[11px] text-gray-400 font-bold leading-tight underline-offset-2">
                                                I agree and consent to the <span className="text-[#0066B2] underline cursor-pointer hover:text-[#004C85]" onClick={(e) => { e.stopPropagation(); setIsTermsOpen(true); }}>T&C and Privacy Policy</span>
                                            </div>
                                        </div>
                                        {errors.terms && <p className="text-red-500 text-xs font-bold ml-2">{errors.terms}</p>}
                                    </div>

                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`w-full py-4 rounded-2xl text-xl font-black text-white transition-all ${isSubmitting ? 'opacity-50' : 'bg-brand-green hover:bg-[#45a049] shadow-[0_4px_0_0_#45a049] active:translate-y-1 active:shadow-none'}`}
                                    >
                                        {isSubmitting ? 'Booking...' : 'Book a slot'}
                                    </motion.button>
                                </form>
                            </motion.div>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* Terms Modal via Radix Dialog for correct stacking */}
            <Dialog.Root open={isTermsOpen} onOpenChange={setIsTermsOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" />
                    <Dialog.Content asChild aria-describedby={undefined}>
                        <div className="fixed inset-0 z-[100] grid place-items-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white border-2 border-soft-gray rounded-[32px] p-8 w-full max-w-lg shadow-2xl relative"
                            >
                                <div className="flex justify-between items-center mb-4 border-b-2 border-slate-100 pb-2">
                                    <Dialog.Title className="text-[#0066B2] text-xl font-black uppercase tracking-tight">
                                        Terms & Conditions
                                    </Dialog.Title>
                                    <button
                                        onClick={() => setIsTermsOpen(false)}
                                        className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2 text-slate-600 font-bold text-xs min-[375px]:text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-200 text-left">
                                    <p>I hereby authorize Bajaj Life Insurance Limited. to call me on the contact number made available by me on the website with a specific request to call back. I further declare that, irrespective of my contact number being registered on National Customer Preference Register (NCPR) or on National Do Not Call Registry (NDNC), any call made, SMS or WhatsApp sent in response to my request shall not be construed as an Unsolicited Commercial Communication even though the content of the call may be for the purposes of explaining various insurance products and services or solicitation and procurement of insurance business</p>
                                    <p>Please refer to Bajaj Life <a href="https://www.bajajlifeinsurance.com/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="text-[#0066B2] underline">Privacy Policy</a>.</p>
                                </div>
                                <div className="mt-6">
                                    <button
                                        onClick={() => { setIsTermsOpen(false); setBookingTermsAccepted(true); }}
                                        className="w-full mt-6 py-3 bg-[#0066B2] text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-sm uppercase tracking-wider"
                                    >
                                        I Agree
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </motion.div >
    );
};

export default ResultsScreen;
