import React, { useState, useRef, useEffect } from 'react';
import { buildShareUrl } from '../../../utils/crypto';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Phone, Calendar, Clock, ChevronDown, ShieldCheck, X, RefreshCw, Trophy, Star, Target } from 'lucide-react';
import Modal from './Modal';
import { updateLeadNew } from '../../../services/api';
import { getArchetypeDetails } from '../utils/archetypeResolver';
import ScoreRing from '../../../components/ui/ScoreRing';

const FinalScreen = ({ results, onRetry, leadData, onBookingSuccess }) => {
    const archetype = getArchetypeDetails(results.archetype);

    // Appointment Booking State
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingTermsAccepted, setBookingTermsAccepted] = useState(true);
    const [bookingData, setBookingData] = useState({
        name: leadData?.name || '',
        mobile_no: leadData?.phone || '',
        date: '',
        timeSlot: ''
    });
    const [errors, setErrors] = useState({});
    const [isTermsOpen, setIsTermsOpen] = useState(false);

    const today = new Date().toISOString().split("T")[0];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const maxDate = thirtyDaysFromNow.toISOString().split("T")[0];

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
        const text = `Hi,\nI just tried this life finance sorting challenge — it really shows why savings, goals and risks shouldn't be mixed together.\nGive it a try: ${shareUrl}\n\n${senderName}`.trim();
        if (navigator.share) {
            try {
                // We exclude 'url' here because it's already included in the 'text' 
                // and some platforms (Android/WhatsApp) append it twice if both are sent.
                await navigator.share({
                    title: 'Life Sorted 3D',
                    text: text
                });
            } catch (err) {
                copyToClipboard(text);
            }
        } else {
            copyToClipboard(text);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Progress copied to clipboard!');
    };

    const validateBooking = () => {
        const errs = {};
        if (!bookingData.name.trim()) errs.name = "Name is required";
        if (!bookingData.mobile_no.trim()) errs.mobile_no = "Mobile is required";
        else if (!/^[6-9]\d{9}$/.test(bookingData.mobile_no)) errs.mobile_no = "Invalid 10-digit number";
        if (!bookingData.date) errs.date = "Select a date";
        if (!bookingData.timeSlot) errs.timeSlot = "Select a slot";
        if (!bookingTermsAccepted) errs.terms = "Accept terms";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        if (!validateBooking()) return;

        setIsSubmitting(true);
        const result = await updateLeadNew(leadData?.leadNo, {
            ...bookingData,
            remarks: `Life Sorted Appointment - Score: ${results.score}`
        });
        setIsSubmitting(false);

        if (result.success) {
            setIsBookingOpen(false);
            onBookingSuccess?.();
        } else {
            setErrors({ submit: result.error || 'Failed to book slot. Please try again.' });
        }
    };

    return (
        <>
            <motion.div
                className="w-full flex flex-col items-center pt-10 pb-20 relative min-h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >


                <div className="w-full max-w-md flex flex-col items-center flex-1 gap-y-6 z-10 px-4">
                    <div className="text-center">
                        <h2 className="text-4xl font-black text-white tracking-tight uppercase">
                            HII <span className="text-gold">{leadData?.name || 'GUEST'}</span>
                        </h2>
                    </div>

                    {/* Visual Score */}
                    <div className="flex flex-col items-center gap-7">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gold/10 blur-3xl rounded-full scale-150 animate-pulse" />
                            <ScoreRing score={results.score} size={200} strokeWidth={14} />
                        </div>

                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-10 py-3 bg-gold/10 border border-gold/30 rounded-full text-gold font-bold text-base tracking-wide hover:bg-gold/20 transition-all active:scale-95"
                        >
                            <Share2 className="w-4 h-4" /> Share
                        </button>
                    </div>

                    {/* Heading below share */}
                    <div className="w-full text-center px-2">
                        <h3 className="text-2xl font-black text-white mb-2 leading-tight">Ready to Sort Your Real Life Finances?</h3>
                    </div>

                    {/* Action Card Section */}
                    <div className="w-full bg-white/5 backdrop-blur-xl rounded-[2.5rem] pt-5 pb-7 px-7 border border-white/10 space-y-4 relative shadow-2xl overflow-hidden">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-teal/5 blur-3xl rounded-full -mb-16 -mr-16" />

                        <div className="text-center">
                            <p className="text-sm text-white leading-relaxed font-medium">
                                A Relationship Manager can help you structure protection, savings and growth — clearly and calmly.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <a
                                href="tel:18002097272"
                                className="bg-[#D97706] text-black font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all text-lg hover:brightness-110 active:scale-95 shadow-xl"
                            >
                                <Phone className="w-5 h-5 text-black/40" />
                                <span>Call now</span>
                            </a>

                            <div className="flex items-center gap-4 py-1">
                                <div className="h-[1px] flex-1 bg-white/10" />
                                <span className="text-white/20 font-black text-[10px] tracking-widest uppercase">OR</span>
                                <div className="h-[1px] flex-1 bg-white/10" />
                            </div>

                            <button
                                onClick={() => setIsBookingOpen(true)}
                                className="bg-gold text-black font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all text-lg hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] active:scale-95"
                            >
                                <Calendar className="w-5 h-5 text-black/40" />
                                <span>Book a slot</span>
                            </button>
                        </div>
                    </div>

                    {/* Play Again Action */}
                    <button
                        onClick={onRetry}
                        className="flex items-center justify-center gap-3 text-white font-black text-2xl transition-all active:scale-95 py-4"
                    >
                        <RefreshCw className="w-6 h-6 text-gold" />
                        <span>Play again</span>
                    </button>

                    {/* Disclaimer */}
                    <div className="w-full px-6 opacity-60 mt-0 mb-4">
                        <p className="text-[10px] sm:text-xs text-white leading-relaxed text-center max-w-[420px] mx-auto">
                            <span className="opacity-80 mr-1 font-bold">Disclaimer:</span> The results shown in this game are indicative and based solely on the information provided by the participant. They are intended for engagement and awareness purposes only and do not constitute financial advice or a recommendation to purchase any life insurance product. Participants should seek independent professional advice before making any financial or insurance decisions. While due care has been taken in designing the game, Bajaj Life Insurance Ltd. assumes no liability for its outcomes.
                        </p>
                    </div>
                </div>

                {/* Booking Modal */}
                <Modal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)}>
                    <div className="bg-[#0B1221] rounded-[32px] p-8 w-full max-w-md shadow-2xl border-2 border-white/10 relative overflow-hidden text-left translate-z-0">
                        <button onClick={() => setIsBookingOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-3xl font-black text-white text-center mb-1 tracking-tight">Book a slot</h2>
                        <p className="text-center text-white/40 font-bold mb-8 text-sm italic">Connect with an expert</p>

                        <form onSubmit={handleBookingSubmit} className="space-y-5">
                            <div className="space-y-4">
                                <div className="w-full">
                                    <label className="text-sm font-bold text-white/40 block mb-1 pl-1">Name</label>
                                    <input
                                        type="text"
                                        value={bookingData.name}
                                        onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                                        placeholder="Your name"
                                        className={`w-full bg-white/5 border-2 rounded-2xl px-5 py-3 text-white font-bold focus:outline-none focus:border-gold transition-all ${errors.name ? 'border-red-500' : 'border-white/5'}`}
                                    />
                                    {errors.name && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{errors.name}</p>}
                                </div>
                                <div className="w-full">
                                    <label className="text-sm font-bold text-white/40 block mb-1 pl-1">Mobile number</label>
                                    <input
                                        type="tel"
                                        value={bookingData.mobile_no}
                                        onChange={(e) => setBookingData({ ...bookingData, mobile_no: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                        placeholder="Mobile number"
                                        className={`w-full bg-white/5 border-2 rounded-2xl px-5 py-3 text-white font-bold focus:outline-none focus:border-gold transition-all ${errors.mobile_no ? 'border-red-500' : 'border-white/5'}`}
                                    />
                                    {errors.mobile_no && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{errors.mobile_no}</p>}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="w-full">
                                    <label className="text-sm font-bold text-white/40 block mb-1 pl-1">Preferred Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#005faa] pointer-events-none" strokeWidth={2.5} />
                                        <input
                                            type="date"
                                            min={today}
                                            max={maxDate}
                                            value={bookingData.date}
                                            onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                                            className={`w-full block bg-white/5 border-2 rounded-2xl pl-12 pr-10 py-4 text-white font-bold focus:outline-none focus:border-gold appearance-none uppercase text-sm min-h-[52px] [&::-webkit-calendar-picker-indicator]:opacity-0 ${errors.date ? 'border-red-500' : 'border-white/5'}`}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <Calendar className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                    {errors.date && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{errors.date}</p>}
                                </div>
                                <div className="w-full">
                                    <label className="text-sm font-bold text-white/40 block mb-1 pl-1">Preferred Slot</label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#005faa] pointer-events-none" strokeWidth={2.5} />
                                        <select
                                            value={bookingData.timeSlot}
                                            onChange={(e) => setBookingData({ ...bookingData, timeSlot: e.target.value })}
                                            className={`w-full block bg-white/5 border-2 rounded-2xl pl-12 pr-10 py-4 text-white font-bold focus:outline-none focus:border-gold appearance-none text-sm min-h-[52px] ${errors.timeSlot ? 'border-red-500' : 'border-white/5'}`}
                                        >
                                            <option value="" className="bg-[#0B1221]">Choose a slot</option>
                                            {timeSlots.map(s => <option key={s} value={s} className="bg-[#0B1221]">{s}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <ChevronDown className="w-5 h-5 text-white/40" />
                                        </div>
                                    </div>
                                    {errors.timeSlot && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{errors.timeSlot}</p>}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-start gap-3 cursor-pointer" onClick={() => setBookingTermsAccepted(!bookingTermsAccepted)}>
                                    <div className={`shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${bookingTermsAccepted ? 'bg-[#005faa] border-[#005faa]' : 'border-white/10 bg-white/5'}`}>
                                        {bookingTermsAccepted && <ShieldCheck className="w-4 h-4 text-white" />}
                                    </div>
                                    <div className="text-[10px] text-white/50 font-medium leading-[1.4]">
                                        I agree to the{' '}
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setIsTermsOpen(true); }}
                                            className="text-[#005faa] font-bold underline cursor-pointer hover:text-blue-400"
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
                                className="w-full bg-gold text-black font-black py-4 rounded-2xl text-xl transition-all hover:translate-y-[-2px] active:translate-y-0 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Confirming...' : 'Confirm booking'}
                            </button>
                        </form>
                    </div>
                </Modal>
            </motion.div>

            {/* Terms Modal */}
            <Modal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)}>
                <div className="bg-[#0B1221] rounded-[32px] p-8 w-full shadow-2xl relative max-w-sm mx-auto border-2 border-white/10">
                    <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                        <h3 className="text-[#005faa] text-xl font-black uppercase tracking-tight">
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
                        <p>Please refer to <a href="https://www.bajajallianzlife.com/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="text-[#005faa] underline">BALIC Privacy Policy</a>.</p>
                    </div>
                    <div className="mt-6">
                        <button
                            onClick={() => { setIsTermsOpen(false); setBookingTermsAccepted(true); }}
                            className="w-full mt-6 py-3 bg-[#005faa] text-white font-bold rounded-lg hover:bg-[#004C85] transition-colors text-sm uppercase tracking-wider"
                        >
                            I Agree
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default FinalScreen;
