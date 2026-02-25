/**
 * ResultScreen — Exact Replica + Scrolling Fix.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Share2, RefreshCw, Calendar, X, ChevronDown } from 'lucide-react';
import { submitToLMS } from '../services/apiClient.js';
import Speedometer from './ScoreRing.jsx';
import Confetti from './Confetti.jsx';
import { TILE_META, BUCKET_MAX } from '../config/gameConfig.js';

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

    const [showBooking, setShowBooking] = useState(false);
    const [showBreakdown, setShowBreakdown] = useState(false);

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
        if (!formData.consent) errs.consent = "Consent is required";
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
        const text = `Check how prepared you are for your financial goals with Secure Saga! Play now at Bajaj Life Insurance.`;
        if (navigator.share) {
            try { await navigator.share({ title: 'Secure Saga', text, url: window.location.href }); } catch { }
        } else {
            try { await navigator.clipboard.writeText(text + ' ' + window.location.href); } catch { }
        }
    };

    // Styling logic — Simplified Scrolling
    // Root is absolute/fixed filling parent. Overflow-y-auto guarantees scroll.
    // Root is absolute/fixed filling parent. Overflow-hidden to prevent scroll.
    const ghibliCardClass = "w-full h-[100dvh] overflow-hidden flex flex-col items-center px-4 py-2 sm:py-4 relative";

    return (
        <div className={ghibliCardClass} style={{
            background: "linear-gradient(180deg, #00509E 0%, #003366 100%)"
        }}>
            <Confetti />

            {/* Top Right Share Icon */}
            <button onClick={handleShare} className="absolute top-4 right-4 z-50 text-white/90 hover:text-white transition-opacity p-2 bg-black/10 rounded-full backdrop-blur-sm">
                <Share2 className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.5} />
            </button>

            {/* Content Container (Max width for desktop, full flex height) */}
            <div className="relative z-10 w-full max-w-[500px] flex-1 flex flex-col items-center justify-between py-1 sm:py-2">

                {/* Header Section */}
                <div className="text-center w-full flex flex-col items-center">
                    <h1 className="text-sm sm:text-lg font-medium text-white uppercase tracking-wide italic leading-tight">
                        Hi <span className="ml-1 text-xl sm:text-3xl font-black">{(userName ? userName.charAt(0).toUpperCase() + userName.slice(1) : 'Player')}!</span>
                    </h1>
                    <h2 className="text-[10px] sm:text-base text-white uppercase tracking-wide italic opacity-90 leading-tight">
                        Your <span className="font-black text-sm sm:text-xl text-[#FF8C00]">Secure Saga</span> score is
                    </h2>

                    {/* Speedometer - Adjusted scaling for mobile fit without aggressive overlaps */}
                    <div className="transform scale-[0.7] xs:scale-[0.85] sm:scale-100 -my-10 sm:-my-4 origin-center">
                        <Speedometer score={displayScore} />
                    </div>

                    {/* Grouping Breakdown button to stay close to score */}
                    <div className="flex justify-center -mt-2 sm:-mt-4 mb-2 relative z-20">
                        <button
                            onClick={() => setShowBreakdown(true)}
                            className="text-white/80 hover:text-white text-[9px] sm:text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-1 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all shadow-lg"
                        >
                            View Breakdown <ChevronDown size={11} />
                        </button>
                    </div>
                </div>

                {/* Share Button + CTA Card Container to reduce gap */}
                <div className="w-full flex-1 flex flex-col items-center justify-center gap-2 sm:gap-3 mt-1 sm:mt-2">
                    {/* Share Button (Rectangle) */}
                    <div className="flex justify-center">
                        <button
                            onClick={handleShare}
                            className="bg-gradient-to-r from-[#FF8C00] to-[#FF7000] text-white font-black py-2.5 px-10 sm:py-3 sm:px-12 shadow-[0_3px_0_#993D00] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 text-[11px] sm:text-sm border-2 border-white/10 tracking-widest rounded-lg"
                        >
                            <Share2 className="w-4 h-4 sm:w-5 sm:h-5" /> Share
                        </button>
                    </div>

                    {/* CTA Card (White) */}
                    <div className="w-full bg-white p-4 sm:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.5)] border-2 border-white/50 rounded-xl relative z-20 mx-auto">
                        <p className="text-slate-600 text-[9px] sm:text-[11px] font-bold text-center mb-3 leading-tight tracking-wide">
                            To know more, connect with our Relationship Manager.
                        </p>

                        {/* Call Action */}
                        <a href="tel:1800209999" className="block w-full mb-3">
                            <button className="w-full bg-[#0066B2] hover:bg-[#004C85] text-white font-black py-3 sm:py-4 shadow-[0_3px_0_#00335C] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 text-xs sm:text-base tracking-widest border-2 border-white/10 rounded-lg">
                                <Phone className="w-4 h-4 sm:w-5 sm:h-5" /> Call Now
                            </button>
                        </a>

                        <div className="relative py-1 sm:py-2 mb-3">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                            <div className="relative flex justify-center text-[8px] sm:text-[10px] uppercase"><span className="px-3 bg-white text-slate-400 font-black tracking-widest">Or</span></div>
                        </div>

                        {/* Booking Trigger Button */}
                        <button
                            onClick={() => setShowBooking(true)}
                            className="w-full bg-[#FF8C00] hover:bg-[#FF7000] text-white font-black py-3 sm:py-4 shadow-[0_3px_0_#993D00] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 text-xs sm:text-base tracking-widest border-2 border-white/10 rounded-lg"
                        >
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" /> Book a Slot
                        </button>
                    </div>
                </div>

                {/* Restart Option */}
                <div className="text-center pb-3 sm:pb-6">
                    <button
                        onClick={onRestart}
                        className="text-blue-100/60 hover:text-white text-[10px] sm:text-sm font-black tracking-[0.2em] transition-colors flex items-center justify-center gap-2 mx-auto drop-shadow-md"
                    >
                        <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Retake Quiz
                    </button>
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
                                            className="w-full bg-slate-50 h-10 border-2 border-slate-100 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 text-[10px] font-bold px-2 rounded"
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

                                {/* Consent Checkbox */}
                                <div className="pt-1">
                                    <label className="flex items-start gap-2 cursor-pointer group">
                                        <div className="relative mt-0.5">
                                            <input
                                                type="checkbox"
                                                checked={formData.consent}
                                                onChange={e => updateField('consent', e.target.checked)}
                                                className="peer sr-only"
                                            />
                                            <div className="w-4 h-4 border-2 border-slate-200 rounded bg-slate-50 peer-checked:bg-[#0066B2] peer-checked:border-[#0066B2] transition-all"></div>
                                            <svg className="absolute top-0 left-0 w-4 h-4 text-white p-0.5 opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                        <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium leading-tight select-none">
                                            I agree to receive communications from Bajaj Life Insurance regarding my booking and other products.
                                            <span className="text-[#0066B2] hover:underline ml-1">T&C Apply.</span>
                                        </span>
                                    </label>
                                    {errors.consent && <p className="text-[9px] text-red-500 mt-1 font-bold uppercase">{errors.consent}</p>}
                                </div>
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
        </div>
    );
};

export default ResultScreen;
