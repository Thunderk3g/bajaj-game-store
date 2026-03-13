import React, { useState } from 'react';
import { buildShareUrl } from '../../../utils/crypto';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, PhoneCall, Calendar, Trophy, RotateCcw, Star, Medal, AlertCircle, Phone, Clock, ChevronDown, ShieldCheck, X } from 'lucide-react';
import ScoreCard from './ScoreCard';
import Modal from './Modal';
import ThankYouScreen from './ThankYouScreen';
import bgImage from '../../../assets/Snake-Life TN.png';

const ConversionScreen = ({ score, total = 20, leadData, onRestart, onBookSlot }) => {
    const today = new Date().toISOString().split("T")[0];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const maxDate = thirtyDaysFromNow.toISOString().split("T")[0];

    const isSmallScreen = window.innerHeight < 700;

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
        const shareMessage = `Hi,\nI built ${Math.round(score)} life milestones in this challenge.\nIt really makes you think about how much protection those milestones need — try it here: ${shareUrl}\n\nRegards,\n${senderName}`.trim();

        if (navigator.share) {
            try {
                // We exclude 'url' here because it's already included in the 'text' 
                // and some platforms (Android/WhatsApp) append it twice if both are sent.
                await navigator.share({
                    title: 'Snake Life',
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
            className="w-full h-full relative overflow-hidden bg-blue-950"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Absolute Backgrounds - Sticky to the static motion.div */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-white/10 z-0 pointer-events-none" />
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] z-0 pointer-events-none" />
            <div
                className="absolute inset-0 bg-[length:100%_100%] bg-center bg-no-repeat opacity-40 blur-md scale-110 z-0 pointer-events-none"
                style={{ backgroundImage: `url("${bgImage}")` }}
            />

            {/* Scrollable Overlay Layer */}
            <div className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden p-4 sh:p-2 mh:p-3 pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] z-10 flex flex-col items-center">

                {/* Header / Top Bar */}
                <div className="w-full max-w-sm flex shrink-0 items-center justify-center relative py-2 sh:py-0 mb-3 sh:mb-0 z-10">
                    <p className="text-gray-200 font-bold text-2xl sm:text-3xl sh:text-lg text-center drop-shadow-md">
                        Hi <span className="text-blue-400 font-black">{leadData?.name || 'Friend'}!</span><br />
                        <span>You Built a Life of</span>
                    </p>
                    <button
                        onClick={handleShare}
                        className="absolute right-0 top-1/2 -translate-y-1/2 p-2.5 sh:p-1.5 bg-blue-600 rounded-full text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition-all active:scale-95 z-20"
                    >
                        <Share2 className="w-5 h-5 sh:w-3.5 sh:h-3.5" />
                    </button>
                </div>

                <div className="w-full max-w-sm flex flex-col items-center flex-1 justify-center min-h-full gap-y-4 sh:gap-y-2 z-10">
                    {/* Score Section */}
                    <div className="scale-90 sh:scale-[0.85] mh:scale-[0.88] shrink-0 transform origin-center py-1 sh:py-0 transition-all">

                        <ScoreCard score={score} total={total} />
                    </div>

                    {/* Messaging Section */}
                    <div className="space-y-1 sh:space-y-0.5 text-center flex flex-col items-center">
                        <h2 className="text-xl sm:text-2xl sh:text-lg font-black text-white tracking-tight leading-tight px-4 drop-shadow-lg">
                            Calculate what Life Cover your Family needs to continue this life
                        </h2>
                    </div>

                    {/* Primary Action */}
                    <button
                        onClick={handleShare}
                        className="flex items-center justify-center gap-2 bg-[#1d4ed8] text-white font-black py-4 sh:py-3.5 mh:py-3 px-8 rounded-2xl sh:rounded-xl mh:rounded-xl shadow-[0_4px_20px_rgba(29,78,216,0.6)] hover:bg-blue-600 transition-all text-lg sh:text-base w-full max-w-[280px] active:scale-[0.98]"
                    >
                        <Share2 className="w-5 h-5 sh:w-4 sh:h-4" />
                        <span>Share</span>
                    </button>

                    {/* Action Card Section */}
                    <div className="w-full shrink-0 bg-[#0f172a]/80 backdrop-blur-md rounded-[28px] sh:rounded-[20px] mh:rounded-[24px] p-5 sh:p-3 mh:p-4 border border-slate-800 space-y-4 sh:space-y-2 mh:space-y-3 relative overflow-hidden text-center shadow-xl">
                        <p className="text-white text-lg sh:text-base font-bold leading-tight px-2">
                            A simple conversation can protect everything you're building
                        </p>

                        <div className="flex flex-col gap-2.5 sh:gap-1.5 mh:gap-2">
                            <motion.a
                                href="tel:18002097272"
                                className="bg-amber-500 text-black font-black py-3 sh:py-2.5 mh:py-2.5 px-6 rounded-2xl sh:rounded-xl mh:rounded-xl flex items-center justify-center gap-3 transition-all text-lg sh:text-base border border-amber-400 hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                            >
                                <Phone className="w-5 h-5 sh:w-4 sh:h-4 text-black" />
                                <span>Call now</span>
                            </motion.a>

                            <div className="flex items-center gap-4 py-0.5 sh:py-0">
                                <div className="h-[1px] flex-1 bg-slate-800" />
                                <span className="text-slate-600 font-bold text-[10px] uppercase tracking-widest leading-none">OR</span>
                                <div className="h-[1px] flex-1 bg-slate-800" />
                            </div>

                            <motion.button
                                onClick={() => setIsBookingOpen(true)}
                                className="bg-green-600 text-white font-black py-3 sh:py-2.5 mh:py-2.5 px-6 rounded-2xl sh:rounded-xl mh:rounded-xl flex items-center justify-center gap-3 transition-all text-lg sh:text-base shadow-[0_0_15px_rgba(22,163,74,0.2)] hover:bg-green-500"
                            >
                                <Calendar className="w-5 h-5 sh:w-4 sh:h-4 opacity-80" />
                                <span>Book a slot</span>
                            </motion.button>
                        </div>
                    </div>

                    {/* Restart Action */}
                    <button
                        onClick={onRestart}
                        className="w-full py-4 mt-2 flex items-center justify-center gap-3 text-white/50 hover:text-white transition-colors group shrink-0"
                    >
                        <RotateCcw className="w-6 h-6 opacity-60 group-hover:opacity-100" />
                        <span className="text-xl font-bold tracking-widest capitalize">Play again</span>
                    </button>

                    {/* Disclaimer */}
                    <div className="w-full px-6 opacity-40 mt-1 pb-4 shrink-0">
                        <p className="text-[7px] sm:text-[8px] text-white leading-relaxed text-center font-bold max-w-[380px] mx-auto tracking-normal">
                            <span className="opacity-60 mr-1">Disclaimer:</span> The results shown in this game are indicative and based solely on the information provided by the participant. They are intended for engagement and awareness purposes only and do not constitute financial advice or a recommendation to purchase any life insurance product. Participants should seek independent professional advice before making any financial or insurance decisions. While due care has been taken in designing the game, Bajaj Life Insurance Ltd. assumes no liability for its outcomes.
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
                <div className="bg-[#0f172a] rounded-[32px] p-6 sm:p-8 w-full max-w-md shadow-2xl border-2 border-slate-800 relative overflow-hidden my-auto text-left">
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
                                <label htmlFor="name" className="text-sm font-bold text-slate-400 ml-1 block mb-1.5">Name</label>
                                <input
                                    type="text"
                                    value={bookingData.name}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                        setBookingData(prev => ({ ...prev, name: val }));
                                        if (!val.trim()) setErrors(prev => ({ ...prev, name: "Name is required" }));
                                        else setErrors(prev => ({ ...prev, name: null }));
                                    }}
                                    id="name"
                                    name="name"
                                    autoComplete="name"
                                    placeholder="Your name"
                                    className={`w-full bg-slate-900 border-2 rounded-2xl px-5 py-3 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors ${errors.name ? 'border-red-500' : 'border-slate-800'}`}
                                />
                                {errors.name && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{errors.name}</p>}
                            </div>

                            <div>
                                <label htmlFor="mobile" className="text-sm font-bold text-slate-400 ml-1 block mb-1.5">Mobile Number</label>
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
                                    id="mobile"
                                    name="mobile"
                                    autoComplete="tel"
                                    placeholder="Mobile number"
                                    className={`w-full bg-slate-900 border-2 rounded-2xl px-5 py-3 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors ${errors.mobile_no ? 'border-red-500' : 'border-slate-800'}`}
                                />
                                {errors.mobile_no && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{errors.mobile_no}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="date" className="text-sm font-bold text-slate-400 ml-1 block mb-1.5">Booking Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 pointer-events-none" strokeWidth={2.5} />
                                <input
                                    type="date"
                                    value={bookingData.date}
                                    min={today}
                                    max={maxDate}
                                    onChange={(e) => {
                                        setBookingData(prev => ({ ...prev, date: e.target.value }));
                                        setErrors(prev => ({ ...prev, date: null }));
                                    }}
                                    id="date"
                                    name="date"
                                    className={`w-full block bg-slate-900 border-2 rounded-2xl pl-12 pr-12 py-4 text-white font-bold focus:outline-none focus:border-blue-500 transition-all appearance-none uppercase text-sm min-h-[52px] text-center [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer ${errors.date ? 'border-red-500' : 'border-slate-800'}`}
                                />
                                <div
                                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer z-10 p-1"
                                    onClick={() => {
                                        const input = document.getElementById('date');
                                        if (input && input.showPicker) {
                                            input.showPicker();
                                        } else if (input) {
                                            input.click();
                                        }
                                    }}
                                >
                                    <Calendar className="w-5 h-5 text-white" strokeWidth={2.5} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="timeSlot" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">Preferred Time Slot</label>
                            <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none" />
                                <select
                                    value={bookingData.timeSlot}
                                    onChange={(e) => {
                                        setBookingData(prev => ({ ...prev, timeSlot: e.target.value }));
                                        setErrors(prev => ({ ...prev, timeSlot: null }));
                                    }}
                                    id="timeSlot"
                                    name="timeSlot"
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
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-start gap-3 cursor-pointer" onClick={() => setBookingTermsAccepted(!bookingTermsAccepted)}>
                                <div className={`shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${bookingTermsAccepted ? 'bg-green-600 border-green-600' : 'border-slate-800 bg-slate-900'}`}>
                                    {bookingTermsAccepted && <ShieldCheck className="w-5 h-5 text-white" />}
                                </div>
                                <div className="text-sm text-gray-500 font-bold leading-tight">
                                    I agree to the{' '}
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setIsTermsOpen(true); }}
                                        className="text-blue-500 font-bold underline cursor-pointer hover:text-blue-400"
                                    >
                                        Terms & Conditions
                                    </button>
                                    {' '}and allow Bajaj Life Insurance to contact me even if registered on DND.
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
