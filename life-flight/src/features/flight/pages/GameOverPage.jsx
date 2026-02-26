import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Calendar, X, Check, Loader2, Share2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { useGame } from '../context/GameContext.jsx';
import {
    ZONES, GAME_OVER_QUOTE, INSURANCE_CARDS, buildShareMessage, MAX_REF_SCORE,
} from '../constants/gameConstants.js';
import ScoreRing from '../components/ScoreRing.jsx';
import InsuranceCards from '../components/InsuranceCards.jsx';
import { submitToLMS } from '../../../utils/api.js';

function getZone(pct) {
    return ZONES.find((z) => pct < z.maxPct) || ZONES[ZONES.length - 1];
}

export default function GameOverPage() {
    const { state, dispatch, ACTIONS, PHASES } = useGame();
    const navigate = useNavigate();
    const [shared, setShared] = useState(false);

    const score = state.finalScore;
    const pct = Math.min(Math.round((score / MAX_REF_SCORE) * 100), 100);
    const zone = getZone(pct);

    // Read cached user explicitly for direct prefill
    const initName = sessionStorage.getItem('lastSubmittedName') || '';
    const initPhone = sessionStorage.getItem('lastSubmittedPhone') || '';

    const [userName, setUserName] = useState(initName || 'Friend');
    const [userPhone, setUserPhone] = useState(initPhone);

    useEffect(() => {
        if (state.phase === PHASES.LANDING) navigate('/');
        setUserName(initName || 'Friend');
        setUserPhone(initPhone);
    }, [state.phase, navigate, PHASES, initName, initPhone]);

    // -- Booking Modal State --
    const [showBooking, setShowBooking] = useState(false);
    const [showInsurancePopup, setShowInsurancePopup] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(true);
    const [showTerms, setShowTerms] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        name: initName,
        mobile: initPhone,
        date: '',
        time: ''
    });

    const updateField = (field, val) => {
        setFormData(p => ({ ...p, [field]: val }));
        if (errors[field]) setErrors(p => ({ ...p, [field]: null }));
    };

    const validate = () => {
        const errs = {};
        if (!formData.name.trim()) errs.name = "Name is required";
        else if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) errs.name = "Invalid name";

        if (!formData.mobile) errs.mobile = "Mobile is required";
        else if (!/^\d{10}$/.test(formData.mobile)) errs.mobile = "Invalid Mobile Number";

        if (!formData.date) errs.date = "Required";
        if (!formData.time) errs.time = "Required";

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        if (!termsAccepted) return;

        setIsSubmitting(true);

        try {
            const payload = {
                name: formData.name,
                mobile_no: formData.mobile,
                param4: formData.date,
                param19: formData.time,
                summary_dtls: "Life Flight - Slot Booking",
                p_data_source: "LIFE_FLIGHT_BOOKING"
            };

            const result = await submitToLMS(payload);

            if (result.success) {
                setShowBooking(false);
                dispatch({ type: ACTIONS.SUBMIT_SUCCESS });
                navigate('/success');
            } else {
                alert("Submission failed. Please try again.");
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Limits
    const today = new Date().toISOString().split("T")[0];
    const maxBookingDate = new Date();
    maxBookingDate.setMonth(maxBookingDate.getMonth() + 1);
    const endLimit = maxBookingDate.toISOString().split("T")[0];

    // -- Original Logic --
    const handleShare = async () => {
        const msg = buildShareMessage(score);
        if (navigator.share) {
            try {
                await navigator.share({ title: 'Life Flight', text: msg });
            } catch { /* user cancelled */ }
        } else {
            try { await navigator.clipboard.writeText(msg); setShared(true); } catch { /* ignore */ }
        }
    };

    const handlePlayAgain = () => {
        dispatch({ type: ACTIONS.RESTART });
        navigate('/');
    };

    return (
        <div
            className="h-full flex flex-col pb-6 no-scrollbar overflow-y-auto relative"
            style={{ background: "linear-gradient(180deg, #00509E 0%, #003366 100%)" }}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-cover bg-center opacity-60 mix-blend-overlay"
                style={{ backgroundImage: 'linear-gradient(radial-gradient, circle at center, rgba(255,255,255,0.2) 0%, transparent 70%)' }}>
            </div>

            <div className="relative z-10 px-5 pt-8 pb-4">
                {/* Header Section */}
                <div className="text-center mb-6 shrink-0">
                    <h1 className="text-base sm:text-lg md:text-xl font-medium text-white uppercase tracking-wide italic mb-1">
                        Hi <span className="ml-1 text-2xl sm:text-3xl md:text-4xl font-black">{userName || 'Player'}!</span>
                    </h1>
                    <h2 className="text-base sm:text-lg md:text-xl text-white uppercase tracking-wide italic mb-2">
                        You <span className="font-black text-lg sm:text-xl md:text-2xl text-[#00B4D8] drop-shadow-[0_0_10px_rgba(0,180,216,0.6)]">crossed</span> {score} Hurdles
                    </h2>
                </div>

                {/* Score Ring */}
                <div className="flex flex-col items-center mb-6">
                    <ScoreRing score={score} pct={pct} zoneColor={zone.color} />
                </div>

                {/* Insurance Dropdown Accordion */}
                <div className="flex flex-col items-center mt-6 mb-8 w-full max-w-sm mx-auto">
                    <button
                        onClick={() => setShowInsurancePopup(!showInsurancePopup)}
                        className="w-full py-4 px-6 rounded-full shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95 z-20"
                        style={{ backgroundColor: '#07325F', border: '1px solid rgba(255,255,255,0.15)' }}
                    >
                        <span className="text-sm font-black tracking-wide text-white font-sans">WHAT COULD HAVE PROTECTED YOU</span>
                        {showInsurancePopup ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5 text-white" />}
                    </button>

                    <AnimatePresence>
                        {showInsurancePopup && (
                            <motion.div
                                initial={{ height: 0, opacity: 0, scaleY: 0.9, marginTop: 0 }}
                                animate={{ height: 'auto', opacity: 1, scaleY: 1, marginTop: 8 }}
                                exit={{ height: 0, opacity: 0, scaleY: 0.9, marginTop: 0, transition: { duration: 0.2 } }}
                                className="w-full overflow-hidden rounded-xl border border-white/20 origin-top shadow-xl z-10"
                            >
                                <table className="w-full text-left border-collapse text-[13px] leading-snug font-sans">
                                    <thead>
                                        <tr className="text-white" style={{ backgroundColor: '#48C053' }}>
                                            <th className="p-3 px-4 font-bold border-r border-white/20">Product</th>
                                            <th className="p-3 px-4 font-bold">Benefit Line</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[#07325F]">
                                        <tr className="bg-white border-b border-slate-200">
                                            <td className="p-3 px-4 font-bold border-r border-slate-200 whitespace-nowrap">Term Insurance</td>
                                            <td className="p-3 px-4 font-medium">Your family stays protected even if you are not around</td>
                                        </tr>
                                        <tr className="border-b border-slate-200" style={{ backgroundColor: '#F8FAFC' }}>
                                            <td className="p-3 px-4 font-bold border-r border-slate-200 whitespace-nowrap">Critical Illness</td>
                                            <td className="p-3 px-4 font-medium">Pays lump sum when treatment costs skyrocket</td>
                                        </tr>
                                        <tr className="bg-white border-b border-slate-200">
                                            <td className="p-3 px-4 font-bold border-r border-slate-200 whitespace-nowrap">Accident Rider</td>
                                            <td className="p-3 px-4 font-medium">Income continues even when you physically cannot work</td>
                                        </tr>
                                        <tr style={{ backgroundColor: '#F8FAFC' }}>
                                            <td className="p-3 px-4 font-bold border-r border-slate-200 whitespace-nowrap">Savings Plans</td>
                                            <td className="p-3 px-4 font-medium">Funds education, retirement and every milestone ahead</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Share Button (Below Insurance Cards) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center mt-6 mb-6"
                >
                    <button
                        onClick={handleShare}
                        className="bg-gradient-to-r from-[#FF8C00] to-[#FF7000] hover:from-[#FF7000] hover:to-[#E65C00] text-white font-black py-2.5 px-8 shadow-[0_4px_0_#993D00] active:translate-y-1 active:shadow-none transition-all flex items-center gap-3 text-sm sm:text-base border-2 border-white/20 uppercase tracking-widest rounded-md"
                    >
                        <Share2 className="w-5 h-5" /> {shared ? 'COPIED!' : 'SHARE'}
                    </button>
                </motion.div>

                {/* Form / CTA Area (White Card) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-white/50 mb-6 shrink-0 rounded-sm"
                >
                    <p className="text-slate-600 text-[12px] sm:text-sm font-bold text-center mb-4 leading-relaxed">
                        To know more connect with our relationship manager
                    </p>

                    {/* Call Action */}
                    <a href="tel:18002097272" className="block w-full mb-4">
                        <button className="w-full bg-[#0066B2] hover:bg-[#004C85] text-white font-black py-3 sm:py-4 shadow-[0_6px_0_#00335C] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 text-xs sm:text-base uppercase tracking-widest border-2 border-white/20 rounded-md">
                            <Phone className="w-4 h-4 sm:w-5 sm:h-5" /> CALL NOW
                        </button>
                    </a>

                    <div className="relative py-1 mb-3">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-slate-50"></div></div>
                        <div className="relative flex justify-center text-[8px] sm:text-xs uppercase"><span className="px-4 bg-white text-slate-400 font-black tracking-widest">Or</span></div>
                    </div>

                    {/* Booking Trigger Button */}
                    <button
                        onClick={() => setShowBooking(true)}
                        className="w-full bg-[#FF8C00] hover:bg-[#FF7000] text-white font-black py-3 sm:py-4 shadow-[0_6px_0_#993D00] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 text-xs sm:text-base uppercase tracking-widest border-2 border-white/20 rounded-md"
                    >
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5" /> BOOK A SLOT
                    </button>
                </motion.div>

                {/* Restart Option */}
                <div className="shrink-0 text-center pb-2">
                    <button
                        onClick={handlePlayAgain}
                        className="text-blue-100 hover:text-white text-[11px] sm:text-sm font-black uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 mx-auto drop-shadow-md"
                    >
                        <RefreshCw className="w-4 h-4" /> TRY AGAIN
                    </button>
                </div>
            </div>

            {/* --- Booking Modal Helper --- */}
            <AnimatePresence>
                {showBooking && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white p-6 w-full max-w-sm shadow-2xl relative border-4 border-[#00B4D8] rounded-3xl"
                        >
                            <button
                                onClick={() => setShowBooking(false)}
                                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <h2 className="text-[#00B4D8] font-black text-center mb-6 text-lg uppercase tracking-tight pt-2">Book a convenient slot</h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Your Name</label>
                                    <input
                                        value={formData.name} onChange={e => updateField('name', e.target.value)}
                                        className="w-full bg-slate-50 h-11 border-2 border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#00B4D8] text-sm font-bold px-4 transition-all"
                                        placeholder="Full Name"
                                    />
                                    {errors.name && <span className="text-[10px] text-red-500 ml-1 font-black uppercase tracking-wider">{errors.name}</span>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Mobile Number</label>
                                    <input
                                        value={formData.mobile}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            updateField('mobile', val);
                                        }}
                                        type="tel"
                                        className="w-full bg-slate-50 h-11 border-2 border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#00B4D8] text-sm font-bold px-4 transition-all"
                                        placeholder="9876543210"
                                    />
                                    {errors.mobile && <span className="text-[10px] text-red-500 ml-1 font-black uppercase tracking-wider">{errors.mobile}</span>}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Preferred Date</label>
                                        <input
                                            type="date"
                                            min={today}
                                            max={endLimit}
                                            value={formData.date} onChange={e => updateField('date', e.target.value)}
                                            className="w-full bg-slate-50 h-11 border-2 border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#00B4D8] text-xs font-bold px-4 transition-all"
                                        />
                                        {errors.date && <span className="text-[10px] text-red-500 ml-1 font-black uppercase tracking-wider">{errors.date}</span>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Preferred Time</label>
                                        <select
                                            value={formData.time}
                                            onChange={e => updateField('time', e.target.value)}
                                            className="w-full bg-slate-50 h-11 border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#00B4D8] text-xs font-bold px-4 appearance-none transition-all"
                                        >
                                            <option value="">Select</option>
                                            {[...Array(12)].map((_, i) => {
                                                const start = 9 + i;
                                                const end = start + 1;
                                                const formatTime = (h) => {
                                                    const amp = h >= 12 ? 'pm' : 'am';
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

                                <div className="flex items-start gap-2 pt-2 text-left">
                                    <div className="relative flex items-center shrink-0 pt-0.5">
                                        <input
                                            id="modal-terms"
                                            type="checkbox"
                                            checked={termsAccepted}
                                            onChange={(e) => setTermsAccepted(e.target.checked)}
                                            className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-slate-300 bg-slate-50 transition-all checked:border-[#00B4D8] checked:bg-[#00B4D8] hover:border-[#00B4D8]"
                                        />
                                        <Check className="pointer-events-none absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100" strokeWidth={4} />
                                    </div>
                                    <label htmlFor="modal-terms" className="text-[11px] font-bold text-slate-500 leading-snug select-none pr-1">
                                        I agree to the <button type="button" onClick={() => setShowTerms(true)} className="text-[#00B4D8] hover:underline font-black inline">Terms &amp; Conditions</button> and Privacy Policy.
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !termsAccepted}
                                    className="w-full mt-2 py-3.5 rounded-xl text-[16px] tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-white uppercase font-black transition-all duration-300 shadow-xl"
                                    style={{
                                        background: 'linear-gradient(135deg, #00B4D8 0%, #0077b6 100%)',
                                        border: '2px solid rgba(255,255,255,0.2)'
                                    }}
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /><span>Confirming...</span></>
                                    ) : 'Confirm booking'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>



            {/* Terms Popup Overlay */}
            <AnimatePresence>
                {showTerms && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md"
                        onClick={() => setShowTerms(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white p-6 rounded-3xl max-w-sm w-full shadow-2xl border-4 border-[#00B4D8] relative text-left"
                        >
                            <button
                                onClick={() => setShowTerms(false)}
                                className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <h3 className="text-[#00B4D8] font-black text-xl uppercase mb-4 tracking-tight">Terms &amp; Conditions</h3>
                            <div className="text-sm text-slate-600 space-y-3 font-semibold leading-relaxed max-h-[50vh] overflow-y-auto pr-3 custom-scrollbar">
                                <p>
                                    I hereby authorize Bajaj Life Insurance Limited to call me on the contact number made available by me on the website with a specific request to call back. I further declare that, irrespective of my contact number being registered...
                                </p>
                            </div>
                            <button
                                onClick={() => { setShowTerms(false); setTermsAccepted(true); }}
                                className="w-full mt-6 py-3.5 bg-[#00B4D8] text-white font-black rounded-xl hover:bg-[#0077b6] transition-colors text-base uppercase tracking-widest shadow-lg"
                            >
                                I Agree
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
