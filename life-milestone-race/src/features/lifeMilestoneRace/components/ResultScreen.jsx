import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, CheckCircle, Share2, RefreshCw, ChevronDown, ChevronUp, Calendar, X, Check } from 'lucide-react';
import Confetti from './Confetti';
import Speedometer from './Speedometer';
import TimelineSummary from './TimelineSummary';
import { submitToLMS } from '../../../utils/api';

const ResultScreen = ({
    score,
    finalScore, // Use finalScore as the main score prop
    userName,
    userPhone,
    timeline,
    category,
    onRestart,
    gameId,
    riskGaps,
    onBookSlot
}) => {
    // Score handling
    const displayScore = finalScore || score || 0;

    const [isTimelineOpen, setIsTimelineOpen] = useState(false);
    const [showBooking, setShowBooking] = useState(false);

    // Autofill Logic: If userPhone/userName changes, update form state? 
    // Or just init. Since props might update late, use memo or effect?
    // Usually standard useState init is enough if component mounts with data.
    // If not, use useEffect.
    const [formData, setFormData] = useState({
        name: userName || '',
        mobile: userPhone || '',
        date: '',
        time: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [termsAccepted, setTermsAccepted] = useState(true);
    const [showTerms, setShowTerms] = useState(false);

    // Form logic
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
        setIsSubmitting(true);

        try {
            const payload = {
                name: formData.name,
                mobile_no: formData.mobile,
                param4: formData.date,
                param19: formData.time,
                summary_dtls: "Life Milestone Race - Slot Booking",
                p_data_source: "LIFE_MILESTONE_RACE_BOOKING"
            };

            const result = await submitToLMS(payload);

            if (result.success) {
                setShowBooking(false);
                if (onBookSlot) onBookSlot(); // Correctly redirect to ThankYou
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

    const handleShare = async () => {
        const appBaseUrl = window.location.href;
        const shareData = {
            title: 'Life Milestone Race Score',
            text: `I scored ${displayScore}/100 in the Life Milestone Race! Check how prepared you are.`,
            url: appBaseUrl
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Error:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareData.url);
                alert('Link copied!');
            } catch (err) {
                console.error(err);
            }
        }
    };

    // Date Logic: "Must of this year only"
    const today = new Date().toISOString().split("T")[0];
    const endOfYear = new Date(new Date().getFullYear(), 11, 31).toISOString().split("T")[0];

    // Styling logic - Transparent BG to use game theme, No Border
    const ghibliCardClass = "relative w-full min-h-[100dvh] flex flex-col overflow-hidden max-w-[600px] mx-auto";
    const ghibliContentClass = "relative z-10 w-full h-full flex flex-col py-4 px-4 sm:px-8 overflow-y-auto overflow-x-hidden custom-scrollbar";

    return (
        <div className={ghibliCardClass} style={{
            background: "linear-gradient(180deg, #00509E 0%, #003366 100%)" // Deep Blue Game Theme
        }}>
            <Confetti />

            {/* Top Right Share Icon */}
            <button
                onClick={handleShare}
                className="absolute top-4 right-4 z-50 text-white/90 hover:text-white transition-opacity p-2"
            >
                <Share2 className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-md" strokeWidth={2.5} />
            </button>

            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-cover bg-center opacity-60 mix-blend-overlay"
                style={{ backgroundImage: 'linear-gradient(radial-gradient, circle at center, rgba(255,255,255,0.2) 0%, transparent 70%)' }}>
            </div>

            <div className={ghibliContentClass + " justify-between sm:justify-start"}>

                {/* Header Section */}
                <div className="text-center mb-1 shrink-0 mt-4">
                    <h1 className="text-base sm:text-lg md:text-xl font-medium text-white uppercase tracking-wide italic mb-1">
                        Hi <span className="ml-1 text-2xl sm:text-3xl md:text-4xl font-black">{userName || 'Player'}!</span>
                    </h1>
                    <h2 className="text-base sm:text-lg md:text-xl text-white uppercase tracking-wide italic mb-2">
                        Your <span className="font-black text-lg sm:text-xl md:text-2xl text-[#FF8C00] drop-shadow-[0_0_10px_rgba(255,140,0,0.8)]">Life Milestone</span> score is
                    </h2>

                    {/* Speedometer */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-block transform scale-90 sm:scale-100 mb-2"
                    >
                        <Speedometer score={displayScore} />
                    </motion.div>

                    {/* View Journey Button - Opens Popup */}
                    <div className="flex justify-center mt-2 mb-4 relative z-20">
                        <button
                            onClick={() => setIsTimelineOpen(true)}
                            className="text-white/80 hover:text-white text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all"
                        >
                            View Journey <ChevronDown size={12} />
                        </button>
                    </div>

                    {/* Share Button (Below Speedometer) */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex justify-center mt-1 sm:mt-2 mb-4"
                    >
                        <button
                            onClick={handleShare}
                            className="bg-gradient-to-r from-[#FF8C00] to-[#FF7000] hover:from-[#FF7000] hover:to-[#E65C00] text-white font-black py-2.5 px-8 shadow-[0_4px_0_#993D00] active:translate-y-1 active:shadow-none transition-all flex items-center gap-3 text-sm sm:text-base border-2 border-white/20 uppercase tracking-widest"
                        >
                            <Share2 className="w-5 h-5" /> SHARE
                        </button>
                    </motion.div>
                </div>

                {/* Form / CTA Area (White Card) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-white/50 mb-3 shrink-0 rounded-sm"
                >
                    <p className="text-slate-600 text-[12px] sm:text-sm font-bold text-center mb-4 leading-relaxed">
                        To secure your milestones risk from real life risk, Connect with our relationship manager
                    </p>

                    {/* Call Action */}
                    <a href="tel:1800209999" className="block w-full mb-4">
                        <button className="w-full bg-[#0066B2] hover:bg-[#004C85] text-white font-black py-3 sm:py-4 shadow-[0_6px_0_#00335C] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 text-xs sm:text-base uppercase tracking-widest border-2 border-white/20">
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
                        className="w-full bg-[#FF8C00] hover:bg-[#FF7000] text-white font-black py-3 sm:py-4 shadow-[0_6px_0_#993D00] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 text-xs sm:text-base uppercase tracking-widest border-2 border-white/20"
                    >
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5" /> BOOK A CONVENIENT SLOT
                    </button>
                </motion.div>

                {/* Restart Option */}
                <div className="shrink-0 text-center pb-2">
                    <button
                        onClick={onRestart}
                        className="text-blue-100 hover:text-white text-[11px] sm:text-sm font-black uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 mx-auto drop-shadow-md"
                    >
                        <RefreshCw className="w-4 h-4" /> RETAKE QUIZ
                    </button>
                </div>

            </div>

            {/* Booking Modal Helper - Autofilled & Validated */}
            {showBooking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white p-6 w-full max-w-sm shadow-2xl relative border-4 border-white/50"
                    >
                        <button
                            onClick={() => setShowBooking(false)}
                            className="absolute right-4 top-4 text-slate-300 hover:text-slate-500 transition-colors bg-slate-100 p-1"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-[#0066B2] font-black text-center mb-6 text-sm sm:text-base uppercase tracking-tight pt-2">Book a convenient slot</h2>

                        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Name</label>
                                <input
                                    value={formData.name} onChange={e => updateField('name', e.target.value)}
                                    className="w-full bg-slate-50 h-11 border-2 border-slate-100 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm font-bold px-4"
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
                                    className="w-full bg-slate-50 h-11 border-2 border-slate-100 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm font-bold px-4"
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
                                        className="w-full bg-slate-50 h-11 border-2 border-slate-100 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 text-xs font-bold px-4"
                                    />
                                    {errors.date && <span className="text-[10px] text-red-500 ml-1 font-black uppercase tracking-wider">{errors.date}</span>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Time</label>
                                    <select
                                        value={formData.time}
                                        onChange={e => updateField('time', e.target.value)}
                                        className="w-full bg-slate-50 h-11 border-2 border-slate-100 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 text-xs font-bold px-4 appearance-none"
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

                            {/* Terms Checkbox — pre-checked by default */}
                            <div className="flex items-start space-x-2 pt-1 text-left">
                                <div className="relative flex items-center shrink-0">
                                    <input
                                        id="modal-terms"
                                        type="checkbox"
                                        checked={termsAccepted}
                                        onChange={(e) => setTermsAccepted(e.target.checked)}
                                        className="peer h-4 w-4 cursor-pointer appearance-none rounded border-2 border-slate-300 bg-slate-50 transition-all checked:border-[#0066B2] checked:bg-[#0066B2] hover:border-[#0066B2]"
                                    />
                                    <Check className="pointer-events-none absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100" strokeWidth={4} />
                                </div>
                                <label htmlFor="modal-terms" className="text-[9px] sm:text-[10px] font-semibold text-slate-500 leading-tight select-none">
                                    I agree to the <button type="button" onClick={() => setShowTerms(true)} className="text-[#0066B2] font-bold hover:underline inline">Terms & Conditions</button> and Acknowledge the Privacy Policy.
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !termsAccepted}
                                className="w-full bg-[#FF8C00] hover:bg-[#FF7000] text-white font-black py-4 shadow-[0_6px_0_#993D00] active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest text-sm mt-2 border-2 border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Confirming...' : 'Book a Slot'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Journey Details Popup Modal */}
            <AnimatePresence>
                {isTimelineOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                        onClick={() => setIsTimelineOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="bg-white w-full max-w-md max-h-[80vh] overflow-hidden rounded-2xl shadow-2xl relative flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="bg-[#0066B2] p-4 flex items-center justify-between shrink-0">
                                <h3 className="text-white font-black text-lg uppercase tracking-wider">Your Journey</h3>
                                <button onClick={() => setIsTimelineOpen(false)} className="text-white/80 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-4 custom-scrollbar bg-slate-50 h-[450px]">
                                <TimelineSummary timeline={timeline} onContinue={() => { }} />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ResultScreen;
