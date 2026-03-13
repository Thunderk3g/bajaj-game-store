import React, { useState } from 'react';
import { buildShareUrl } from '../../../utils/crypto';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, PhoneCall, Calendar, Trophy, RotateCcw, Star, Medal, AlertCircle, Phone, Clock, ChevronDown, ShieldCheck, X } from 'lucide-react';
import ScoreCard from './ScoreCard';
import Modal from '../../../components/ui/Modal';
import ThankYouScreen from './ThankYouScreen';

const ConversionScreen = ({ score, total = 2000, leadData, onRestart, onBookSlot }) => {
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

    const [isTermsOpen, setIsTermsOpen] = useState(false);

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
        const shareUrl = buildShareUrl() || window.location.href;
        const senderName = sessionStorage.getItem('gamification_emp_name') || '';
        const shareMessage = `Hi,\nI just played Blocks of Wealth and achieved ${Math.round(score)} milestones.\nSee how many milestones you can reach — try it here: ${shareUrl}\n\n${senderName}`.trim();

        if (navigator.share) {
            try {
                // We exclude 'url' here because it's already included in the 'text' 
                // and some platforms (Android/WhatsApp) append it twice if both are sent.
                await navigator.share({
                    title: 'Financial Tetris',
                    text: shareMessage
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
        } else {
            const selectedDate = new Date(bookingData.date);
            const t = new Date();
            t.setHours(0, 0, 0, 0);
            if (selectedDate < t) {
                errs.date = "Cannot be in the past";
            }
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
            booking_timestamp: new Date().toISOString()
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
        if (m <= 15) return "You’ve secured some great financial milestones!";
        return "Excellent! You have Secured all financial milestones!";
    };

    return (
        <motion.div
            className="w-full h-full relative overflow-hidden"
            style={{ background: '#050c1a' }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Scrollable Content Layer */}
            <div className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden p-4 pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col items-center">
                {/* Header / Top Bar */}
                <div className="w-full max-w-sm flex flex-col items-center justify-center relative py-2 mb-1">
                    <p className="text-gray-400 font-bold text-2xl text-center">
                        Hi <span className="text-blue-500 font-black">{leadData?.name || 'Friend'}</span>
                    </p>
                    <p className="text-white font-black text-2xl text-center mt-1">
                        You Achieved
                    </p>
                    <button
                        onClick={handleShare}
                        className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-white/5 backdrop-blur-sm rounded-full text-white/70 hover:text-white hover:bg-white/10 border border-white/10 transition-all active:scale-95 z-10"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>

                <div className="w-full max-w-sm flex flex-col items-center gap-y-3">
                    {/* Score Section */}
                    <div className="scale-90 transform origin-center py-1">
                        <ScoreCard score={score} total={total} />
                    </div>

                    {/* Messaging Section */}
                    <div className="text-center flex flex-col items-center">
                        <p className="text-xl text-white font-black leading-tight px-4">
                            {getMotivationalMessage(score)}
                        </p>
                    </div>

                    {/* Primary Action */}
                    <button
                        onClick={handleShare}
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white font-black py-4 px-8 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:bg-blue-500 transition-all text-lg w-full max-w-[280px]"
                    >
                        <Share2 className="w-5 h-5" />
                        <span>Share</span>
                    </button>

                    {/* Action Card Section */}
                    <div className="w-full bg-[#0f172a]/80 backdrop-blur-md rounded-[28px] p-5 border border-slate-800 space-y-4 relative overflow-hidden text-center shadow-xl">
                        <p className="text-white text-md font-bold leading-tight">
                            To build a strong financial foundation,<br />Connect with our Relationship Manager now!
                        </p>

                        <div className="flex flex-col gap-3">
                            <motion.a
                                href="tel:18002097272"
                                className="bg-amber-600 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all text-lg border border-amber-500/20 hover:bg-amber-500 active:scale-95"
                            >
                                <Phone className="w-6 h-6 text-white/80" />
                                <span>Call now</span>
                            </motion.a>

                            <div className="flex items-center gap-4 py-1">
                                <div className="h-[1px] flex-1 bg-slate-800" />
                                <span className="text-slate-600 font-bold text-[14px] uppercase tracking-widest leading-none">OR</span>
                                <div className="h-[1px] flex-1 bg-slate-800" />
                            </div>

                            <motion.button
                                onClick={() => setIsBookingOpen(true)}
                                className="bg-green-600 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all text-lg shadow-[0_0_15px_rgba(22,163,74,0.2)] hover:bg-green-500"
                            >
                                <Calendar className="w-5 h-5 opacity-80" />
                                <span>Book a slot</span>
                            </motion.button>
                        </div>
                    </div>

                    {/* Restart Action */}
                    <button
                        onClick={onRestart}
                        className="w-full py-3 text-gray-400 font-black text-xl flex items-center justify-center gap-3 hover:text-white transition-all tracking-widest"
                    >
                        <RotateCcw className="w-6 h-6 text-gray-500" />
                        <span>Play again</span>
                    </button>

                    {/* Disclaimer */}
                    <div className="w-full px-4 mb-2 mt-auto">
                        <p className="text-[9px] sh:text-[8px] text-gray-500/80 leading-tight text-center font-medium">
                            <span className="font-bold">Disclaimer:</span> The results shown in this game are indicative and based solely on the information provided by the participant. They are intended for engagement and awareness purposes only and do not constitute financial advice or a recommendation to purchase any life insurance product. Participants should seek independent professional advice before making any financial or insurance decisions. While due care has been taken in designing the game, Bajaj Life Insurance Ltd. assumes no liability for its outcomes.
                        </p>
                    </div>
                </div>
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
                                <label className="text-sm font-bold text-gray-400 block mb-1 ml-1">Name</label>
                                <input
                                    id="booking-name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
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
                                <label className="text-sm font-bold text-gray-400 block mb-1 ml-1">Mobile number</label>
                                <input
                                    id="booking-mobile"
                                    name="mobile_no"
                                    type="text"
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
                                    className={`w-full bg-slate-900 border-2 rounded-2xl px-5 py-3 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors ${errors.mobile_no ? 'border-red-500' : 'border-slate-800'}`}
                                />
                                {errors.mobile_no && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{errors.mobile_no}</p>}
                            </div>
                        </div>

                        <div className="w-full">
                            <label className="text-sm font-bold text-gray-400 block mb-1 ml-1">Preferred Date</label>
                            <div className="relative w-full">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 pointer-events-none" strokeWidth={2.5} />
                                <input
                                    id="booking-date"
                                    name="date"
                                    type="date"
                                    value={bookingData.date}
                                    min={today}
                                    max={maxDate}
                                    onChange={(e) => {
                                        setBookingData(prev => ({ ...prev, date: e.target.value }));
                                        setErrors(prev => ({ ...prev, date: null }));
                                    }}
                                    className={`w-full block bg-slate-900 border-2 rounded-2xl pl-12 pr-10 py-4 text-white font-bold focus:outline-none focus:border-blue-500 transition-all appearance-none uppercase text-sm min-h-[52px] [&::-webkit-calendar-picker-indicator]:opacity-0 ${errors.date ? 'border-red-500' : 'border-slate-800'}`}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <Calendar className="w-4 h-4 text-white/40" />
                                </div>
                            </div>
                        </div>

                        <div className="relative w-full">
                            <label className="text-sm font-bold text-gray-400 block mb-1 ml-1">Preferred Slot</label>
                            <div className="relative w-full">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none z-10" />
                                <select
                                    id="booking-slot"
                                    name="timeSlot"
                                    value={bookingData.timeSlot}
                                    onChange={(e) => {
                                        setBookingData(prev => ({ ...prev, timeSlot: e.target.value }));
                                        setErrors(prev => ({ ...prev, timeSlot: null }));
                                    }}
                                    className={`w-full block bg-slate-900 border-2 rounded-2xl pl-11 pr-10 py-3 text-white font-bold focus:outline-none focus:border-blue-500 appearance-none transition-colors min-h-[52px] ${errors.timeSlot ? 'border-red-500' : 'border-slate-800'}`}
                                >
                                    <option value="" className="bg-slate-950">Choose a slot</option>
                                    {timeSlots.map(slot => (
                                        <option key={slot} value={slot} className="bg-slate-950">{slot}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none z-10" />
                            </div>
                            {errors.timeSlot && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{errors.timeSlot}</p>}
                        </div>

                        <div className="flex flex-col gap-2 py-1">
                            <div className="flex items-start gap-3 cursor-pointer" onClick={() => { setBookingTermsAccepted(!bookingTermsAccepted); setErrors(prev => ({ ...prev, terms: null })) }}>
                                <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${bookingTermsAccepted ? 'bg-green-600 border-green-600' : 'border-slate-800 bg-slate-900'}`}>
                                    {bookingTermsAccepted && <ShieldCheck className="w-4 h-4 text-white" />}
                                </div>
                                <div className="text-xs text-slate-400 font-bold leading-tight">
                                    I agree to the{' '}
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setIsTermsOpen(true); }}
                                        className="text-[#0066B2] underline cursor-pointer hover:text-[#004C85]"
                                    >
                                        Terms & Conditions
                                    </button>
                                    {' '}and allow Bajaj Life Insurance to contact me even if registered on DND.
                                </div>
                            </div>
                            {errors.terms && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.terms}</p>}
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

            {/* Terms Modal */}
            <Modal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)}>
                <div className="bg-[#0f172a] rounded-[32px] p-8 w-full shadow-2xl relative max-w-sm mx-auto border-2 border-slate-800">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                        <h3 className="text-blue-500 text-xl font-black uppercase tracking-tight">
                            Terms & Conditions
                        </h3>
                        <button
                            onClick={() => setIsTermsOpen(false)}
                            className="text-white/40 hover:text-white transition-colors p-1"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2 text-white/50 font-bold text-xs min-[375px]:text-sm leading-relaxed scrollbar-thin scrollbar-thumb-white/10 text-left">
                        <p>I hereby authorize Bajaj Life Insurance Limited to call me on the contact number made available by me on the website with a specific request to call back. I further declare that, irrespective of my contact number being registered on National Customer Preference Register (NCPR) or on National Do Not Call Registry (NDNC), any call made, SMS or WhatsApp sent in response to my request shall not be construed as an Unsolicited Commercial Communication even though the content of the call may be for the purposes of explaining various insurance products and services or solicitation and procurement of insurance business.</p>
                        <p>Please refer to <a href="https://www.bajajallianzlife.com/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">BALIC Privacy Policy</a>.</p>
                    </div>
                    <div className="mt-6">
                        <button
                            onClick={() => { setIsTermsOpen(false); setBookingTermsAccepted(true); }}
                            className="w-full mt-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors text-sm uppercase tracking-wider"
                        >
                            I Agree
                        </button>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
};

export default ConversionScreen;
