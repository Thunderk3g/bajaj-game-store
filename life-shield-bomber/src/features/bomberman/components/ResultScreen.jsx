/**
 * ResultScreen — Displays final score with speedometer, breakdown popup, and CTAs.
 * Follows the financial-match-arena blueprint exactly.
 */
import { memo, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Calendar, Share2, RotateCcw, X, ChevronDown, Shield, Heart, Clock, Zap, CheckSquare } from 'lucide-react';
import ScoreRing from './ScoreRing.jsx';
import Confetti from './Confetti.jsx';

const ResultScreen = memo(function ResultScreen({
    finalScore,
    risksDestroyed,
    health,
    timeLeft,
    score,
    onBookSlot,
    onShowThankYou,
    onRestart,
    entryDetails,
}) {
    const [showBooking, setShowBooking] = useState(false);
    const [showBreakdown, setShowBreakdown] = useState(false);
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
    const displayScore = finalScore || 0;

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
        const shareText = `I scored ${displayScore}/100 in Life Shield Bomber by Bajaj Life Insurance! Can you beat my score? 🛡️💣`;
        try {
            if (navigator.share) {
                await navigator.share({ title: 'Life Shield Bomber', text: shareText, url: window.location.href });
            } else {
                await navigator.clipboard.writeText(shareText + ' ' + window.location.href);
            }
        } catch {
            /* fail silently */
        }
    };

    const breakdownData = [
        { icon: <Shield className="w-5 h-5 text-blue-400" />, label: `Risks Destroyed: ${risksDestroyed}`, value: `+${risksDestroyed * 10}`, desc: '10 pts each' },
        { icon: <Heart className="w-5 h-5 text-red-400" />, label: `Health Remaining: ${health}`, value: `+${health * 5}`, desc: '5 pts each' },
        { icon: <Clock className="w-5 h-5 text-amber-400" />, label: `Time Left: ${timeLeft}s`, value: `+${Math.floor(timeLeft * 0.5)}`, desc: '0.5 pts/sec' },
        { icon: <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />, label: 'Raw Score', value: `${score + health * 5 + Math.floor(timeLeft * 0.5)}`, desc: 'Total raw pts' },
    ];

    return (
        <div
            className="w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col items-center pt-4 pb-8 px-4"
            style={{ background: 'linear-gradient(180deg, #00509E 0%, #003366 100%)' }}
        >
            <Confetti />

            {/* Top Right Share Icon */}
            <button
                onClick={handleShare}
                className="fixed top-4 right-4 z-50 text-white/90 hover:text-white transition-opacity p-2 bg-black/10 rounded-full backdrop-blur-sm"
            >
                <Share2 className="w-5 h-5 drop-shadow-md" strokeWidth={2.5} />
            </button>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-[500px] flex flex-col items-center shrink-0">

                {/* Header — Hi {Name} */}
                <div className="text-center mb-2 w-full">
                    <motion.h1
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-base sm:text-lg md:text-xl font-medium text-white uppercase tracking-wide italic mb-1"
                    >
                        Hi <span className="ml-1 text-2xl sm:text-3xl md:text-4xl font-black">{userName}!</span>
                    </motion.h1>
                    <motion.h2
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-sm sm:text-base md:text-lg text-white uppercase tracking-wide italic mb-2 opacity-90"
                    >
                        Your <span className="font-black text-lg sm:text-xl text-[#FF8C00]">Life Shield</span> score is
                    </motion.h2>

                    {/* Speedometer */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="transform scale-90 sm:scale-100 mb-1 origin-top"
                    >
                        <ScoreRing score={displayScore} />
                    </motion.div>

                    {/* View Breakdown Button (opens popup) */}
                    <div className="flex justify-center -mt-4 mb-4 relative z-20">
                        <button
                            onClick={() => setShowBreakdown(true)}
                            className="text-white/80 hover:text-white text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-1 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all shadow-lg"
                        >
                            Score Breakdown <ChevronDown size={12} />
                        </button>
                    </div>

                    {/* Share Button — Small Orange Pill */}
                    <div className="flex justify-center mb-6">
                        <button
                            onClick={handleShare}
                            className="bg-gradient-to-r from-[#FF8C00] to-[#FF7000] hover:from-[#FF7000] hover:to-[#E65C00] text-white font-black py-2.5 px-8 shadow-[0_3px_0_#993D00] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 text-xs border-2 border-white/20 uppercase tracking-widest rounded-full"
                        >
                            <Share2 className="w-4 h-4" /> Share
                        </button>
                    </div>
                </div>

                {/* CTA Card (White Box) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="w-full bg-white p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-white/50 mb-6 shrink-0 rounded-xl relative z-20"
                >
                    <p className="text-slate-600 text-[11px] sm:text-sm font-bold text-center mb-4 leading-relaxed uppercase tracking-wide">
                        To know more, connect with our Relationship Manager.
                    </p>

                    {/* Call Now — Blue, no number visible */}
                    <button
                        onClick={() => window.open('tel:18002099999', '_self')}
                        className="w-full bg-[#0066B2] hover:bg-[#004C85] text-white font-black py-4 shadow-[0_4px_0_#00335C] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 text-sm sm:text-lg uppercase tracking-widest border-2 border-white/10 rounded-lg mb-4"
                    >
                        <Phone className="w-5 h-5" /> Call Now
                    </button>

                    {/* Divider */}
                    <div className="relative py-2 mb-4">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-slate-100"></div></div>
                        <div className="relative flex justify-center text-[10px] sm:text-xs uppercase"><span className="px-4 bg-white text-slate-400 font-black tracking-widest">Or</span></div>
                    </div>

                    {/* Book a Slot — Orange */}
                    <button
                        onClick={() => setShowBooking(true)}
                        className="w-full bg-[#FF8C00] hover:bg-[#FF7000] text-white font-black py-4 shadow-[0_4px_0_#993D00] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 text-sm sm:text-lg uppercase tracking-widest border-2 border-white/10 rounded-lg"
                    >
                        <Calendar className="w-5 h-5" /> Book a Slot
                    </button>
                </motion.div>

                {/* Try Again — small, at bottom */}
                <div className="shrink-0 text-center pb-8">
                    <button
                        onClick={onRestart}
                        className="text-blue-100/60 hover:text-white text-[11px] sm:text-sm font-black uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 mx-auto drop-shadow-md hover:scale-105 active:scale-95"
                    >
                        <RotateCcw className="w-4 h-4" /> Try Again
                    </button>
                </div>
            </div>

            {/* ─── Breakdown POPUP Modal ─── */}
            <AnimatePresence>
                {showBreakdown && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white p-6 w-full max-w-sm shadow-2xl relative border-4 border-white/50 rounded-xl"
                        >
                            <button
                                onClick={() => setShowBreakdown(false)}
                                className="absolute right-4 top-4 text-slate-300 hover:text-slate-500 transition-colors bg-slate-100 p-1 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <h3 className="text-[#0066B2] font-black text-center mb-6 uppercase tracking-wider text-sm">Score Breakdown</h3>

                            <div className="space-y-3">
                                {breakdownData.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-b-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                                                {item.icon}
                                            </div>
                                            <div>
                                                <p className="text-slate-700 text-sm font-semibold">{item.label}</p>
                                                <p className="text-slate-400 text-[10px]">{item.desc}</p>
                                            </div>
                                        </div>
                                        <span className="text-[#FF8C00] font-black text-sm">{item.value}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 pt-3 border-t-2 border-slate-100 flex items-center justify-between">
                                <span className="text-slate-600 font-bold text-sm uppercase tracking-wider">Final Score</span>
                                <span className="text-[#0066B2] font-black text-xl">{displayScore}/100</span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
    entryDetails: PropTypes.object,
};

export default ResultScreen;
