/**
 * ResultScreen — Exact Replica + Scrolling Fix.
 */
import { useState, useRef, useEffect } from 'react';
import { buildShareUrl } from '../../../utils/crypto';
import { shortenUrl } from '../../../utils/shortener';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Share2, RefreshCw, Calendar, X, ChevronDown, Check } from 'lucide-react';
import { submitToLMS } from '../services/apiClient.js';
import Speedometer from './ScoreRing.jsx';
import Confetti from './Confetti.jsx';
import TermsModal from './TermsModal.jsx';
import { TILE_META, BUCKET_MAX } from '../config/gameConfig.js';
import gameThumbnail from '../../assets/image/secure-thumbnail.png';

const BUCKET_ORDER = ['GREEN', 'BLUE', 'YELLOW', 'RED'];

const ResultScreen = ({
    finalScore,
    buckets,
    userName,
    userPhone,
    onRestart,
    onBookSlot,
}) => {
    // Score handling
    const displayScore = finalScore || 0;

    // Dynamic Content based on score
    const getResultContent = (score) => {
        if (score <= 40) {
            return {
                headline: "Your Life Goals Need Stronger Planning",
                message: "“You’ve secured less than half of your life goals. Start planning today to build stronger financial protection.”",
                cta: "Turn Your Life Goals into Reality with Us!"
            };
        } else if (score <= 70) {
            return {
                headline: "You’re On The Right Path",
                message: "“You’re on your way, but some life goals still need stronger planning.”",
                cta: "Turn Your Life Goals into Reality with Us!"
            };
        } else {
            return {
                headline: "You’re On The Right Path",
                message: "“Great progress! You’re well on track to securing your life goals”",
                cta: "Turn Your Life Goals into Reality with Us!"
            };
        }
    };

    const resultContent = getResultContent(displayScore);

    const [showBooking, setShowBooking] = useState(false);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [isTermsOpen, setIsTermsOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: userName || '',
        mobile: userPhone || '',
        date: '',
        time: '',
        consent: true
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Date Logic
    const today = new Date().toISOString().split("T")[0];
    const endOfYear = new Date(new Date().getFullYear(), 11, 31).toISOString().split("T")[0];

    // Form logic
    const updateField = (field, val) => {
        setFormData(p => ({ ...p, [field]: val }));
        if (errors[field]) setErrors(p => ({ ...p, [field]: null }));
    };

    const validate = () => {
        /* ... same validation ... */
        const errs = {};
        if (!formData.name.trim()) errs.name = "Name is required";
        else if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) errs.name = "Invalid name";
        if (!formData.mobile) errs.mobile = "Mobile is required";
        else if (!/^\d{10}$/.test(formData.mobile)) errs.mobile = "Invalid Mobile Number";
        if (!formData.date) errs.date = "Required";
        if (!formData.time) errs.time = "Required";
        if (!formData.consent) errs.consent = "Please agree to Terms and Conditions";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            if (onBookSlot) {
                await onBookSlot(formData);
            }
            setShowBooking(false);
        } catch (err) {
            // Parent handles logging
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleShare = async () => {
        const rawUrl = buildShareUrl() || window.location.href;
        const shareUrl = await shortenUrl(rawUrl);
        const senderName = userName || '';
        const signature = senderName ? `\n\nBest Regards,\n${senderName}` : '';
        // URL must be inline in text (before signature). If passed as a separate `url` field,
        // WhatsApp appends it after the last character without a newline → "[Name],[URL]".
        const text = `Hi,\nI managed to fulfil ${Math.round(displayScore)}% of my bucket list. Fulfil your bucket list. ${shareUrl}${signature}`.trim();
        if (navigator.share) {
            try {
                const sharePayload = {
                    title: 'Secure Saga',
                    text: text
                };
                try {
                    const res = await fetch(gameThumbnail);
                    const blob = await res.blob();
                    const file = new File([blob], 'game-thumbnail.png', { type: blob.type });
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        sharePayload.files = [file];
                    }
                } catch (e) {
                    // Share without image if fetch fails
                }
                await navigator.share(sharePayload);
            } catch (err) {
                // If user cancels, we do nothing. If error, fallback.
                if (err.name !== 'AbortError') {
                    copyToClipboard(`${text}\n${shareUrl}`);
                }
            }
        } else {
            copyToClipboard(`${text}\n${shareUrl}`);
        }
    };

    const copyToClipboard = async (str) => {
        try {
            await navigator.clipboard.writeText(str);
            alert("Share details copied to clipboard!");
        } catch (err) {
            alert("Sharing not supported on this browser.");
        }
    };

    // Styling logic
    const ghibliCardClass = "w-full min-h-[100dvh] overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col items-center px-4 py-2 sm:py-4 relative";

    return (
        <div className={ghibliCardClass} style={{
            background: "linear-gradient(180deg, #00509E 0%, #003366 100%)"
        }}>
            <Confetti />

            {/* Top Right Share Icon */}
            <button onClick={handleShare} className="absolute top-4 right-4 z-50 text-white/90 hover:text-white transition-opacity p-2 bg-black/10 rounded-full backdrop-blur-sm">
                <Share2 className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
            </button>

            {/* Content Container - 3 Block Distribution */}
            <div className="relative z-10 w-full max-w-[500px] h-full flex flex-col items-center justify-between py-2 sm:py-6">

                {/* BLOCK 1: Branding & Score */}
                <div className="w-full flex flex-col items-center">
                    <div className="text-center mb-1 sm:mb-4">
                        <h1 className="text-sm sm:text-xl font-black text-white uppercase tracking-widest italic leading-tight">
                            Hi <span className="ml-[1px] text-xl sm:text-3xl text-white">{(userName ? userName.charAt(0).toUpperCase() + userName.slice(1) : 'Player')}!</span>
                        </h1>
                        <h2 className="text-[10px] sm:text-xs text-white uppercase tracking-[0.2em] italic opacity-60 mt-1 ml-1.5">
                            Your score is
                        </h2>
                    </div>

                    {/* Speedometer - Better Scaling and Positioning */}
                    <div className="relative transform scale-[0.55] xs:scale-[0.65] sm:scale-95 -mt-10 mb-0 xs:-mt-8 xs:mb-0 sm:-my-2 origin-center">
                        <Speedometer score={displayScore} />
                    </div>
                </div>

                {/* BLOCK 2: Feedback & Headline (Middle) */}
                <div className="flex flex-col items-center gap-1 sm:gap-4 px-2 -mt-4 xs:-mt-2 sm:mt-2">
                    <p className="text-white font-black italic text-[16px] sm:text-[22px] leading-tight px-4 drop-shadow-lg text-center max-w-[360px]">
                        "{resultContent.headline}"
                    </p>

                    <div className="relative z-20 mt-1 mb-1">
                        <button
                            onClick={() => setShowBreakdown(true)}
                            className="text-white/80 hover:text-white text-[8px] sm:text-xs font-bold uppercase tracking-[0.1em] flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all shadow-lg active:scale-95"
                        >
                            View Breakdown <ChevronDown size={10} />
                        </button>
                    </div>

                    <p className="text-blue-100/90 text-[12px] sm:text-[16px] font-medium italic leading-relaxed max-w-[340px] px-6 opacity-80 text-center">
                        {resultContent.message}
                    </p>
                </div>

                {/* BLOCK 3: Actions & Navigation (Bottom) */}
                <div className="w-full flex flex-col items-center gap-2 sm:gap-4 px-2 mb-1">
                    <button
                        onClick={handleShare}
                        className="bg-gradient-to-r from-[#FF8C00] to-[#FF7000] text-white font-black py-2 px-8 sm:py-3 sm:px-12 shadow-[0_3px_0_#993D00] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 text-[9px] sm:text-xs border-2 border-white/10 tracking-widest rounded-lg"
                    >
                        <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Share
                    </button>

                    <div className="w-full bg-white p-3 sm:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.5)] border-2 border-white/50 rounded-xl relative z-20 mx-auto max-w-[360px] sm:max-w-none">
                        <p className="text-slate-600 text-[11px] sm:text-[15px] font-bold text-center mb-2 leading-tight tracking-wide italic">
                            {resultContent.cta}
                        </p>

                        {sessionStorage.getItem('gamification_emp_mobile') && (
                            <a href={`tel:${sessionStorage.getItem('gamification_emp_mobile')}`} className="block w-full mb-2">
                                <button className="w-full bg-[#0066B2] hover:bg-[#004C85] text-white font-black py-2 sm:py-3 shadow-[0_3px_0_#00335C] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 text-[11px] sm:text-sm tracking-widest border-2 border-white/10 rounded-lg">
                                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Call Now
                                </button>
                            </a>
                        )}

                        <div className="relative py-0.5 mb-1.5">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                            <div className="relative flex justify-center text-[7px] sm:text-[9px] uppercase"><span className="px-2 bg-white text-slate-400 font-black tracking-widest">Or</span></div>
                        </div>

                        <button
                            onClick={() => setShowBooking(true)}
                            className="w-full bg-[#FF8C00] hover:bg-[#FF7000] text-white font-black py-2 sm:py-3 shadow-[0_3px_0_#993D00] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 text-[11px] sm:text-sm tracking-widest border-2 border-white/10 rounded-lg"
                        >
                            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Book a Slot
                        </button>
                    </div>

                    <button
                        onClick={onRestart}
                        className="text-white/30 hover:text-white text-[9px] sm:text-xs font-black tracking-[0.2em] transition-colors flex items-center justify-center gap-1 active:scale-95 py-1 mb-2 mt-1 underline underline-offset-4"
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> Try Again
                    </button>

                    <div className="w-full px-4 mt-auto">
                        <p className="text-[7.5px] sm:text-[9px] text-white/40 leading-tight text-center font-medium max-w-[420px] mx-auto pb-4">
                            <span className="font-bold whitespace-nowrap">Disclaimer:</span> The results shown in this game are indicative and based solely on the information provided by the participant. They are intended for engagement and awareness purposes only and do not constitute financial advice or a recommendation to purchase any life insurance product. Participants should seek independent professional advice before making any financial or insurance decisions. While due care has been taken in designing the game, Bajaj Life Insurance Ltd. assumes no liability for its outcomes.
                        </p>
                    </div>
                </div>

            </div>

            {/* Breakdown Modal */}
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
                            <h3 className="text-[#0066B2] font-black text-center mb-6 uppercase tracking-wider text-sm">Bucket Breakdown</h3>

                            <div className="grid grid-cols-2 gap-3">
                                {BUCKET_ORDER.map(type => {
                                    const meta = TILE_META[type];
                                    const val = buckets[type] || 0;
                                    const pct = Math.min(Math.round((val / BUCKET_MAX) * 100), 100);
                                    return (
                                        <div key={type} className="bg-slate-50 p-2 rounded-lg flex flex-col items-center border border-slate-100 shadow-sm relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-1 h-full" style={{ background: meta.color }}></div>
                                            <div className="w-6 h-6 rounded mb-1 shadow-sm" style={{ background: meta.bg }}></div>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide text-center leading-tight mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis w-full px-1">{meta.label}</span>
                                            <span className="text-lg font-black text-slate-700">{pct}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Booking Modal */}
            <AnimatePresence>
                {showBooking && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white p-6 w-full max-w-sm shadow-2xl relative border-4 border-white/50 rounded-xl"
                        >
                            <button
                                onClick={() => setShowBooking(false)}
                                className="absolute right-4 top-4 text-slate-300 hover:text-slate-500 transition-colors bg-slate-100 p-1 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-[#0066B2] font-black text-center mb-6 text-sm sm:text-base uppercase tracking-tight pt-2">Book a convenient slot</h2>

                            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Name</label>
                                    <input
                                        value={formData.name} onChange={e => updateField('name', e.target.value)}
                                        className="w-full bg-slate-50 h-10 border-2 border-slate-100 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 text-xs font-bold px-3 rounded"
                                        placeholder="Full Name"
                                    />
                                    {errors.name && <span className="text-[10px] text-red-500 ml-1 font-black uppercase tracking-wider">{errors.name}</span>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                                    <input
                                        value={formData.mobile}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            updateField('mobile', val);
                                        }}
                                        type="tel"
                                        className="w-full bg-slate-50 h-10 border-2 border-slate-100 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 text-xs font-bold px-3 rounded"
                                        placeholder="9876543210"
                                    />
                                    {errors.mobile && <span className="text-[10px] text-red-500 ml-1 font-black uppercase tracking-wider">{errors.mobile}</span>}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Date</label>
                                        <input
                                            type="date"
                                            min={today}
                                            max={endOfYear}
                                            value={formData.date} onChange={e => updateField('date', e.target.value)}
                                            className={`w-full bg-slate-50 h-10 border-2 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 text-[10px] font-bold px-2 ${errors.date ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'border-slate-100'}`}
                                        />
                                        {errors.date && <span className="text-[10px] text-red-500 ml-1 font-black uppercase tracking-wider">{errors.date}</span>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Time</label>
                                        <select
                                            value={formData.time}
                                            onChange={e => updateField('time', e.target.value)}
                                            className="w-full bg-slate-50 h-10 border-2 border-slate-100 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 text-[10px] font-bold px-2 appearance-none rounded"
                                        >
                                            <option value="">Select</option>
                                            {[...Array(12)].map((_, i) => {
                                                const start = 9 + i;
                                                const end = start + 1;
                                                const formatTime = (h) => {
                                                    const amp = h >= 12 ? 'PM' : 'AM';
                                                    const hour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
                                                    return `${hour}:00 ${amp}`;
                                                };
                                                const label = `${formatTime(start)} - ${formatTime(end)}`;

                                                // Filter logic: if today, check if slot start time has passed
                                                if (formData.date === today) {
                                                    const currentHour = new Date().getHours();
                                                    if (start <= currentHour) return null;
                                                }

                                                return <option key={start} value={label}>{label}</option>;
                                            }).filter(Boolean)}
                                            {formData.date === today && [...Array(12)].filter((_, i) => (9 + i) > new Date().getHours()).length === 0 && (
                                                <option disabled className="text-gray-400 italic">No slots available for today</option>
                                            )}
                                        </select>
                                        {errors.time && <span className="text-[10px] text-red-500 ml-1 font-black uppercase tracking-wider">{errors.time}</span>}
                                    </div>
                                </div>

                                {/* Consent Checkbox */}
                                <div className="flex items-start gap-2 pt-1">
                                    <div
                                        onClick={() => {
                                            const newVal = !formData.consent;
                                            updateField('consent', newVal);
                                            if (newVal && errors.consent) setErrors(prev => {
                                                const next = { ...prev };
                                                delete next.consent;
                                                return next;
                                            });
                                        }}
                                        className="relative mt-0.5 shrink-0 cursor-pointer"
                                    >
                                        <div className={`w-5 h-5 border-2 rounded-lg transition-all flex items-center justify-center ${formData.consent ? 'bg-[#0066B2] border-[#0066B2]' : `bg-slate-50 border-slate-200 ${errors.consent ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : ''}`}`}>
                                            {formData.consent && <span className="text-white font-black text-xs">✓</span>}
                                        </div>
                                    </div>
                                    <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium leading-tight select-none">
                                        I agree and consent to the <span className="text-[#0066B2] underline cursor-pointer hover:text-[#004C85]" onClick={(e) => { e.stopPropagation(); setIsTermsOpen(true); }}>T&C and Privacy Policy</span>
                                    </p>
                                </div>
                                {errors.consent && <p className="text-red-500 text-[10px] font-black uppercase text-center -mt-1">{errors.consent}</p>}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-[#FF8C00] hover:bg-[#FF7000] text-white font-black py-4 shadow-[0_4px_0_#993D00] active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest text-xs mt-3 border-2 border-white/20 rounded-lg"
                                >
                                    {isSubmitting ? 'Confirming...' : 'Book a Slot'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
        </div>
    );
};

export default ResultScreen;
