/**
 * ResultScreen — Displays final score with speedometer, breakdown popup, and CTAs.
 * Follows the secure-saga blueprint exactly.
 */
import { memo, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Calendar, Share2, RotateCcw, X, ChevronDown, Shield, Heart, Clock, Zap, CheckSquare } from 'lucide-react';
import Confetti from './Confetti.jsx';
import { buildShareUrl } from '../../../utils/crypto';

const ResultScreen = memo(function ResultScreen({
    finalScore,
    risksDestroyed,
    health,
    timeLeft,
    score,
    isMissionComplete,
    onBookSlot,
    onShowThankYou,
    onRestart,
    entryDetails,
}) {
    const outcome = (() => {
        if (isMissionComplete) {
            return {
                message: "You defeated life’s risks with the help of Power Riders",
                subMessage: "In real life, as well, you can overcome life risks with proper financial planning",
                ctaText: "Discover the Life Insurance riders that can protect your real-life goals"
            };
        } else if (timeLeft <= 0) {
            return {
                message: "Your time is up before you could secure your future",
                subMessage: "In life, time doesn't wait. Secure your future before it's too late",
                ctaText: "Discover the Life Insurance riders that can protect your real-life goals"
            };
        } else {
            return {
                message: "You didn’t have enough Power Riders to overcome life’s risks",
                subMessage: "In games, you get another try\nin life you don't",
                ctaText: "Discover the Life Insurance riders that can protect your real-life goals"
            };
        }
    })();
    const [showBooking, setShowBooking] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [agreedTerms, setAgreedTerms] = useState(true);

    const [bookingForm, setBookingForm] = useState({
        name: entryDetails?.name || '',
        mobile: entryDetails?.mobile || '',
        date: '',
        time: '',
    });

    const userName = entryDetails?.name || 'Player';

    // Date Validation — only future dates allowed (up to 1 month ahead)
    const today = useMemo(() => new Date().toISOString().split('T')[0], []);
    const maxDate = useMemo(() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        return d.toISOString().split('T')[0];
    }, []);

    const updateField = (field, val) => {
        setBookingForm(p => ({ ...p, [field]: val }));
        if (errors[field]) setErrors(p => ({ ...p, [field]: null }));
    };

    const validate = () => {
        const errs = {};
        if (!bookingForm.name.trim()) errs.name = 'Name is required';
        else if (!/^[A-Za-z\s]+$/.test(bookingForm.name.trim())) errs.name = 'Invalid name';
        if (!bookingForm.mobile) errs.mobile = 'Mobile is required';
        else if (!/^\d{10}$/.test(bookingForm.mobile)) errs.mobile = 'Invalid mobile';
        if (!bookingForm.date) errs.date = 'Required';
        else {
            const sel = new Date(bookingForm.date);
            const tod = new Date(today);
            const mx = new Date(maxDate);
            if (sel < tod) errs.date = 'Cannot select past date';
            if (sel > mx) errs.date = 'Max 1 month ahead';
        }
        if (!bookingForm.time) errs.time = 'Required';
        if (!agreedTerms) errs.terms = 'Please agree';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            await onBookSlot(bookingForm);
            setShowBooking(false);
        } catch {
            /* parent handles */
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleShare = async () => {
        const shareUrl = buildShareUrl() || window.location.href;
        const senderName = sessionStorage.getItem('gamification_emp_name') || '';
        const shareText = `Hi,\nI just realized the importance of riders to protect from life risks. You should try this interesting game. ${shareUrl}\n\n${senderName}`.trim();
        try {
            if (navigator.share) {
                await navigator.share({ title: 'Shield Man', text: shareText, url: shareUrl });
            } else {
                await navigator.clipboard.writeText(shareText);
            }
        } catch {
            /* fail silently */
        }
    };



    return (
        <div
            className="w-full h-full absolute inset-0 overflow-y-auto overflow-x-hidden flex flex-col items-center px-4 custom-scrollbar"
            style={{ background: 'linear-gradient(180deg, #00509E 0%, #003366 100%)' }}
        >
            <Confetti />



            {/* Content Container */}
            <div className="relative z-10 w-full max-w-[500px] flex flex-col items-center py-8 sm:py-10 my-auto flex-shrink-0">

                {/* ─── Header Block ─── */}
                <div className="w-full flex flex-col items-center mt-2 mb-8">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-center mb-3 sm:mb-5 flex items-end justify-center gap-1"
                    >
                        <span className="text-[12px] sm:text-[14px] font-bold text-white uppercase italic leading-none mb-[3px] sm:mb-[4px]">
                            HI
                        </span>
                        <h1 className="text-xl sm:text-2xl font-black text-white uppercase font-display tracking-tight leading-none drop-shadow-sm">
                            {userName}!
                        </h1>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center px-4"
                    >
                        <h2 className="text-white text-[18px] sm:text-[22px] font-display font-black leading-tight mb-3 uppercase tracking-tight drop-shadow-lg max-w-[340px] mx-auto">
                            {outcome.message}
                        </h2>
                        <p className="whitespace-pre-line text-[#2a8ad1] drop-shadow-md font-display text-[22px] sm:text-[24px] font-black italic leading-relaxed max-w-[400px] mx-auto opacity-100 border-t border-white/10 pt-3 mt-1">
                            {outcome.subMessage}
                        </p>
                    </motion.div>

                    {/* Share Button Block */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex justify-center mt-5"
                    >
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            style={{
                                background: '#FF7A00',
                                color: 'white',
                                borderRadius: '8px',
                                padding: '10px 24px',
                                fontWeight: 800,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            }}
                        >
                            <Share2 className="w-[18px] h-[18px]" strokeWidth={3} />
                            <span className="uppercase tracking-[0.1em] text-[13px]">SHARE</span>
                        </button>
                    </motion.div>
                </div>

                {/* ─── Middle Block (CTA Card) ─── */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="w-full bg-white p-4 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.6)] border-4 border-white border-opacity-30 rounded-[1.25rem] relative z-20 flex flex-col gap-3 max-w-[90%]"
                >
                    <p className="text-[#00509E] text-[10px] sm:text-[11px] font-black text-center mb-1 leading-[1.3] uppercase tracking-wide px-1">
                        {outcome.ctaText}
                    </p>

                    <div className="flex flex-col gap-2.5">
                        <button
                            onClick={() => window.open('tel:18002099999', '_self')}
                            className="w-full bg-[#0066B2] hover:bg-[#004C85] text-white font-black py-[14px] flex items-center justify-center gap-2 text-[12px] sm:text-[13px] uppercase tracking-widest rounded-xl transition-all active:scale-[0.98]"
                        >
                            <Phone className="w-4 h-4" strokeWidth={2.5} /> CALL NOW
                        </button>

                        <div className="flex items-center gap-4 py-1">
                            <div className="flex-1 h-[2px] bg-slate-100" />
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">OR</span>
                            <div className="flex-1 h-[2px] bg-slate-100" />
                        </div>

                        <button
                            onClick={() => setShowBooking(true)}
                            className="w-full bg-[#FF8C00] hover:bg-[#FF7000] text-white font-black py-[14px] flex items-center justify-center gap-2 text-[12px] sm:text-[13px] uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] shadow-[0_4px_0_#CC6B00] active:translate-y-1 active:shadow-none"
                        >
                            <Calendar className="w-4 h-4" strokeWidth={2.5} /> BOOK A SLOT
                        </button>
                    </div>
                </motion.div>

                {/* ─── Bottom Actions Block ─── */}
                <div className="w-full flex flex-col items-center mt-12 mb-2 gap-8">
                    {/* Disclaimer */}
                    <div className="w-full px-6 opacity-40">
                        <p className="text-[7px] sm:text-[8px] text-white leading-relaxed text-center font-bold max-w-[380px] mx-auto uppercase tracking-tighter">
                            <span className="opacity-60 underline mr-1">Disclaimer:</span> The results shown in this game are indicative and based solely on the information provided by the participant. They are intended for engagement and awareness purposes only and do not constitute financial advice or a recommendation to purchase any life insurance product. Participants should seek independent professional advice before making any financial or insurance decisions. While due care has been taken in designing the game, Bajaj Life Insurance Ltd. assumes no liability for its outcomes.
                        </p>
                    </div>

                    {/* Try Again */}
                    <button
                        onClick={onRestart}
                        className="text-white hover:text-white flex items-center gap-3 transition-all group active:scale-95"
                    >
                        <div className="p-2 border border-blue-300/30 rounded-full group-hover:bg-white/10 transition-colors">
                            <RotateCcw className="w-[18px] h-[18px]" strokeWidth={2.5} />
                        </div>
                        <span className="text-[12px] sm:text-[14px] font-black uppercase tracking-[0.3em]">TRY AGAIN</span>
                    </button>
                </div>
            </div>



            {/* ─── Booking Modal ─── */}
            <AnimatePresence>
                {showBooking && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white p-6 w-full max-w-sm shadow-2xl relative border-4 border-white/50 rounded-xl"
                        >
                            <button
                                onClick={() => setShowBooking(false)}
                                className="absolute right-4 top-4 text-slate-300 hover:text-slate-500 transition-colors bg-slate-100 p-1 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <h2 className="text-[#0066B2] font-black text-center mb-6 text-sm sm:text-base uppercase tracking-tight pt-2">Book a convenient slot</h2>

                            <form onSubmit={handleBookingSubmit} className="space-y-3 sm:space-y-4">
                                {/* Name — Autofilled */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Name</label>
                                    <input
                                        value={bookingForm.name}
                                        onChange={(e) => updateField('name', e.target.value)}
                                        className="w-full bg-slate-50 h-10 border-2 border-slate-100 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 text-xs font-bold px-3 rounded"
                                        placeholder="Full Name"
                                    />
                                    {errors.name && <span className="text-[10px] text-red-500 ml-1 font-black uppercase tracking-wider">{errors.name}</span>}
                                </div>

                                {/* Mobile — Autofilled */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                                    <input
                                        value={bookingForm.mobile}
                                        onChange={(e) => updateField('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        type="tel"
                                        className="w-full bg-slate-50 h-10 border-2 border-slate-100 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 text-xs font-bold px-3 rounded"
                                        placeholder="9876543210"
                                    />
                                    {errors.mobile && <span className="text-[10px] text-red-500 ml-1 font-black uppercase tracking-wider">{errors.mobile}</span>}
                                </div>

                                {/* Date + Time */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Date</label>
                                        <input
                                            type="date"
                                            min={today}
                                            max={maxDate}
                                            value={bookingForm.date}
                                            onChange={(e) => updateField('date', e.target.value)}
                                            className="w-full bg-slate-50 h-10 border-2 border-slate-100 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 text-[10px] font-bold px-2 rounded"
                                        />
                                        {errors.date && <span className="text-[10px] text-red-500 ml-1 font-black uppercase tracking-wider">{errors.date}</span>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Time</label>
                                        <select
                                            value={bookingForm.time}
                                            onChange={(e) => updateField('time', e.target.value)}
                                            className="w-full bg-slate-50 h-10 border-2 border-slate-100 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 text-[10px] font-bold px-2 appearance-none rounded"
                                        >
                                            <option value="">Select</option>
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

                                {/* Checkbox */}
                                <label className="flex items-start gap-2 cursor-pointer pt-1">
                                    <input
                                        type="checkbox"
                                        checked={agreedTerms}
                                        onChange={(e) => {
                                            setAgreedTerms(e.target.checked);
                                            if (errors.terms) setErrors(p => ({ ...p, terms: null }));
                                        }}
                                        className="mt-0.5 w-4 h-4 accent-[#0066B2] rounded shrink-0"
                                    />
                                    <span className="text-[10px] text-slate-500 leading-tight font-semibold">
                                        I agree to receive a callback from Bajaj Life Insurance regarding my booking.
                                    </span>
                                </label>
                                {errors.terms && <span className="text-[10px] text-red-500 ml-1 font-black uppercase tracking-wider">{errors.terms}</span>}

                                {/* Confirm */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-[#FF8C00] hover:bg-[#FF7000] text-white font-black py-4 shadow-[0_4px_0_#993D00] active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest text-xs mt-3 border-2 border-white/20 rounded-lg disabled:opacity-60"
                                >
                                    {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
});

ResultScreen.propTypes = {
    finalScore: PropTypes.number.isRequired,
    risksDestroyed: PropTypes.number.isRequired,
    health: PropTypes.number.isRequired,
    timeLeft: PropTypes.number.isRequired,
    score: PropTypes.number.isRequired,
    onBookSlot: PropTypes.func.isRequired,
    onShowThankYou: PropTypes.func.isRequired,
    onRestart: PropTypes.func.isRequired,
    isMissionComplete: PropTypes.bool,
    entryDetails: PropTypes.object,
};

export default ResultScreen;
