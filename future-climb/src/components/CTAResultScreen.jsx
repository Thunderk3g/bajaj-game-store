import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, GAME_STATUS } from '../store/useGameStore';
import { Phone, RotateCcw, Calendar, Share2, X, Clock, ChevronDown } from 'lucide-react';
const SVGCar = ({ className }) => (
    <svg viewBox="0 0 160 100" className={className} style={{ width: '80px', height: '50px' }}>
        {/* Antenna */}
        <path d="M40 50 Q 20 20 25 10" stroke="#39ff14" strokeWidth="2.5" fill="none" />
        <circle cx="25" cy="10" r="3.5" fill="#ff007f" />
        
        {/* Roll bar */}
        <rect x="50" y="30" width="4" height="25" fill="#1f2937" rx="1" />
        <rect x="36" y="26" width="18" height="4" fill="#1f2937" rx="1" />
        
        {/* Driver */}
        <circle cx="68" cy="35" r="9" fill="#fecdd3" />
        <rect x="62" y="23" width="15" height="6" fill="#e11d48" rx="1" />
        <rect x="71" y="25" width="9" height="3" fill="#e11d48" rx="1" />
        <circle cx="72" cy="33" r="1.5" fill="#000" />
        
        {/* Windshield */}
        <line x1="84" y1="30" x2="98" y2="55" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
        
        {/* Exhaust & Flame */}
        <rect x="18" y="58" width="10" height="6" fill="#3f3f46" />
        <ellipse cx="8" cy="61" rx="12" ry="6" fill="#00f2fe" opacity="0.85" />
        <ellipse cx="10" cy="61" rx="6" ry="3" fill="#ffffff" />
        
        {/* Chassis & Body Tub */}
        <rect x="25" y="45" width="90" height="15" fill="#e11d48" rx="3" />
        <rect x="25" y="35" width="25" height="15" fill="#e11d48" rx="2" />
        <rect x="75" y="40" width="42" height="10" fill="#e11d48" rx="2" />
        <rect x="20" y="56" width="102" height="6" fill="#1f2937" rx="1" />
        
        {/* Headlight */}
        <circle cx="118" cy="50" r="5" fill="#fef08a" />
        <circle cx="118" cy="50" r="9" fill="#fef08a" opacity="0.3" />
        
        {/* Back Wheel */}
        <g transform="translate(42, 66)">
            <circle cx="0" cy="0" r="15" fill="#18181b" />
            <circle cx="0" cy="0" r="10" fill="#3f3f46" />
            <circle cx="0" cy="0" r="9" fill="none" stroke="#00f2fe" strokeWidth="1" />
            {/* Spokes */}
            <line x1="0" y1="0" x2="0" y2="-9" stroke="#ff007f" strokeWidth="1.5" />
            <line x1="0" y1="0" x2="8.5" y2="3" stroke="#ff007f" strokeWidth="1.5" />
            <line x1="0" y1="0" x2="-8.5" y2="3" stroke="#ff007f" strokeWidth="1.5" />
            <line x1="0" y1="0" x2="5" y2="7" stroke="#ff007f" strokeWidth="1.5" />
            <line x1="0" y1="0" x2="-5" y2="7" stroke="#ff007f" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
        </g>
        
        {/* Front Wheel */}
        <g transform="translate(100, 66)">
            <circle cx="0" cy="0" r="15" fill="#18181b" />
            <circle cx="0" cy="0" r="10" fill="#3f3f46" />
            <circle cx="0" cy="0" r="9" fill="none" stroke="#00f2fe" strokeWidth="1" />
            {/* Spokes */}
            <line x1="0" y1="0" x2="0" y2="-9" stroke="#ff007f" strokeWidth="1.5" />
            <line x1="0" y1="0" x2="8.5" y2="3" stroke="#ff007f" strokeWidth="1.5" />
            <line x1="0" y1="0" x2="-8.5" y2="3" stroke="#ff007f" strokeWidth="1.5" />
            <line x1="0" y1="0" x2="5" y2="7" stroke="#ff007f" strokeWidth="1.5" />
            <line x1="0" y1="0" x2="-5" y2="7" stroke="#ff007f" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
        </g>
    </svg>
);
import Confetti from './Confetti';
import { buildShareUrl } from '../utils/crypto';
import { shortenUrl } from '../utils/shortener';
import { updateLeadNew } from '../utils/api';

const CTAResultScreen = () => {
    const { leadData, coins, distance, setStatus, resetGame } = useGameStore();
    const empPhone = sessionStorage.getItem('gamification_emp_mobile');
    const [showBooking, setShowBooking] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingData, setBookingData] = useState({
        name: leadData?.name || '',
        phone: leadData?.phone || '',
        date: '',
        time: ''
    });

    const [animatedDistance, setAnimatedDistance] = useState(0);

    useEffect(() => {
        let startTime = null;
        const duration = 3500; // 3.5s animation

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;

            if (elapsed < duration) {
                const progress = elapsed / duration;
                // Cubic ease-in-out progress mapping
                const easeProgress = progress < 0.5 
                    ? 4 * progress * progress * progress 
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                setAnimatedDistance(Math.round(easeProgress * distance));
                requestAnimationFrame(animate);
            } else {
                setAnimatedDistance(distance);
            }
        };

        const animId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animId);
    }, [distance]);

    // Calculate Date constraints
    const today = new Date();
    const localToday = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));
    const minDate = localToday.toISOString().split('T')[0];

    const nextMonth = new Date(localToday);
    nextMonth.setMonth(localToday.getMonth() + 1);
    const maxDate = nextMonth.toISOString().split('T')[0];

    // Generate Time Slots (9am to 9pm)
    const generateTimeSlots = (selectedDate) => {
        const slots = [];
        const isToday = selectedDate === minDate;
        const currentHour = today.getHours();

        for (let hour = 9; hour < 21; hour++) {
            // If today, skip past hours
            if (isToday && currentHour >= hour) continue;

            const formatAMPM = (h) => {
                const ampm = h >= 12 ? 'PM' : 'AM';
                const formattedHour = h % 12 || 12;
                return `${formattedHour}:00 ${ampm}`;
            };

            const startStr = formatAMPM(hour);
            const endStr = formatAMPM(hour + 1);
            slots.push(`${startStr} - ${endStr}`);
        }
        return slots;
    };

    const availableSlots = generateTimeSlots(bookingData.date);

    // Calculate a "Future Readiness Score" (0-100) based on percentage of 1000m target
    const readinessScore = Math.min(100, Math.round((distance / 1000) * 100));

    // Dynamic game-themed quotes based on score milestones
    let gameQuote = "";
    if (readinessScore < 30) {
        gameQuote = "Keep climbing! Collect more coins and keep your shields active to reach new heights.";
    } else if (readinessScore < 60) {
        gameQuote = "Great progress! Balance your coin collection and shield protection to climb even higher.";
    } else if (readinessScore >= 60 && distance < 1000) {
        gameQuote = "Outstanding climbing! You've mastered collecting coins and shields to get close to the peak.";
    } else {
        gameQuote = "Outstanding climbing! You've mastered collecting coins and shields to reach the peak.";
    }

    const handleShare = async () => {
        const rawUrl = buildShareUrl() || window.location.href;
        const shareUrl = await shortenUrl(rawUrl);
        const senderName = leadData?.name || '';
        const signature = senderName ? `\n\nBest Regards,\n${senderName}` : '';

        const shareData = {
            title: 'Future Climb - My Score',
            text: `Hi!\nI just achieved a Future Readiness Score of ${readinessScore}/100 in Future Climb! Can you beat my score?\nTry it here: ${shareUrl}${signature}`.trim(),
            url: shareUrl
        };

        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareData.title,
                    text: shareData.text
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
                alert('Link copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };

    return (
        <div className="flex flex-col h-full items-center bg-[#0B1221] relative overflow-y-auto overflow-x-hidden py-8 px-4 custom-scrollbar">
            <Confetti />

            {/* Background Glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md text-center flex flex-col items-center"
            >
                {/* Header Section */}
                <div className="mb-4">
                    <h1 className="text-xl sm:text-2xl font-medium text-white tracking-wide italic mb-1 uppercase">
                        Hi <span className="text-2xl sm:text-3xl font-black text-[#FFCC00]">{leadData?.name?.split(' ')[0] || 'Player'}!</span>
                    </h1>
                </div>

                {/* Translucent Card for Score, Progress Track, and Quote */}
                <div 
                    className="w-full max-w-sm rounded-[32px] p-6 mb-6 flex flex-col items-center" 
                    style={{ 
                        background: 'rgba(255, 255, 255, 0.04)', 
                        border: '1px solid rgba(255, 255, 255, 0.08)', 
                        backdropFilter: 'blur(16px)', 
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)' 
                    }}
                >
                    {/* Score Section */}
                    <div className="text-center mb-4">
                        <span className="text-xs font-bold tracking-widest uppercase text-cyan-400">
                            YOUR SCORE
                        </span>
                        <h2 className="text-6xl font-black text-yellow-300 tracking-tight drop-shadow-[0_2px_12px_rgba(253,224,71,0.65)] mt-1">
                            {readinessScore}%
                        </h2>
                    </div>

                    {/* Arena track box */}
                    <div className="relative flex items-center h-28 w-full my-1 overflow-hidden rounded-2xl shadow-inner bg-slate-950/80 border border-white/5">
                        
                        {/* Glowing neon aura behind starting area */}
                        <div className="absolute w-32 h-32 rounded-full bg-blue-500/10 blur-2xl left-[10%] bottom-0 pointer-events-none" />

                        {/* Horizontal progress track line (grey backdrop) */}
                        <div className="absolute left-[10%] right-[10%] bottom-[32px] h-2 bg-white/10 rounded-full" />

                        {/* Horizontal active highlight path (dynamic color gradient filled behind car) */}
                        <div className="absolute left-[10%] bottom-[32px] h-2 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                            style={{
                                width: `${readinessScore * 0.8}%`, // Since track spans 80% of width (from 10% to 90%)
                            }}
                        />

                        {/* Start Line Marker Flag */}
                        <div className="absolute left-[10%] bottom-[44px] flex flex-col items-center">
                            <span className="text-[9px] font-bold text-white/55">Start</span>
                            <div className="w-[1px] h-3 bg-white/20 mt-1" />
                        </div>

                        {/* Finish/Goal Marker Flag */}
                        <div className="absolute right-[10%] bottom-[44px] flex flex-col items-center">
                            <span className="text-[9px] font-black text-emerald-400 flex items-center gap-0.5">
                                🏁 1000m
                            </span>
                            <div className="w-[1px] h-3 bg-emerald-500/30 mt-1" />
                        </div>

                        {/* Car Container sliding horizontally along track */}
                        <motion.div 
                            className="absolute bottom-[20px]"
                            initial={{ left: '10%' }}
                            animate={{ left: `calc(10% + ${readinessScore * 0.8}%)` }}
                            transition={{
                                duration: 3.5,
                                ease: "easeInOut"
                            }}
                            style={{
                                transform: 'translateX(-50%)',
                                zIndex: 10,
                            }}
                        >
                            {/* Floating Distance Badge directly above car */}
                            <div className="absolute left-1/2 bg-[#FFCC00] text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded shadow-lg flex items-center justify-center whitespace-nowrap"
                                style={{
                                    bottom: '48px',
                                    transform: 'translateX(-50%)',
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                                }}
                            >
                                {animatedDistance}m
                            </div>

                            <SVGCar className="w-16 h-10 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]" />
                        </motion.div>
                    </div>

                    {/* Quote Section */}
                    <div className="mt-4 px-2 text-center">
                        <p className="text-white text-base font-extrabold leading-relaxed drop-shadow-md">
                            "{gameQuote}"
                        </p>
                    </div>
                </div>

                {/* Share Button (Above CTA Box) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mb-4 w-full flex justify-center px-4"
                >
                    <button
                        onClick={handleShare}
                        className="bg-gradient-to-r from-[#FF8C00] to-[#FF7000] hover:from-[#FF7000] hover:to-[#E65C00] text-white font-black py-2 px-10 shadow-[0_3px_0_#993D00] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 text-sm border-2 border-white/20 uppercase tracking-[0.2em] rounded-sm"
                    >
                        SHARE
                    </button>
                </motion.div>

                {/* CTA Box (White Card) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="w-full bg-white rounded-sm p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-white/50 mb-6 mx-2"
                >
                    <p className="text-slate-600 text-sm font-bold text-center mb-6 leading-tight">
                        To systematically plan for your future climb and secure your future, connect with our relationship manager now
                    </p>

                    <div className="space-y-4">
                        {empPhone && (
                            <>
                                <a href={`tel:${empPhone}`} className="block w-full">
                                    <button className="w-full bg-[#0066B2] hover:bg-[#004C85] text-white font-black py-3.5 shadow-[0_4px_0_#00335C] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest border-2 border-white/20">
                                        <Phone className="w-4 h-4" /> CALL NOW
                                    </button>
                                </a>

                                <div className="relative py-1 flex items-center justify-center">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                                    <span className="relative px-4 bg-white text-slate-300 font-black text-[10px] tracking-widest uppercase">Or</span>
                                </div>
                            </>
                        )}

                        <button
                            onClick={() => setShowBooking(true)}
                            className="w-full bg-[#FF8C00] hover:bg-[#FF7000] text-white font-black py-3.5 shadow-[0_4px_0_#993D00] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest border-2 border-white/20"
                        >
                            <Calendar className="w-4 h-4" /> BOOK A CONVENIENT SLOT
                        </button>
                    </div>
                </motion.div>

                {/* Play Again Button */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    onClick={() => {
                        resetGame();
                        setStatus(GAME_STATUS.PLAYING);
                    }}
                    className="text-white text-base sm:text-lg font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 mx-auto drop-shadow-md hover:scale-105 active:scale-95 mb-8"
                >
                    <RotateCcw className="w-5 h-5" /> PLAY AGAIN
                </motion.button>

                {/* Disclaimer */}
                <div className="w-full px-8 opacity-40 mb-8">
                    <p className="text-[7px] sm:text-[8px] text-white leading-relaxed text-center font-bold max-w-[380px] mx-auto uppercase tracking-tighter">
                        <span className="opacity-60 underline mr-1">Disclaimer:</span> The results shown in this game are indicative and based solely on the information provided by the participant. They are intended for engagement and awareness purposes only and do not constitute financial advice or a recommendation to purchase any life insurance product. Participants should seek independent professional advice before making any financial or insurance decisions. While due care has been taken in designing the game, Bajaj Life Insurance Ltd. assumes no liability for its outcomes.
                    </p>
                </div>
            </motion.div>

            {/* Booking Modal */}
            <AnimatePresence>
                {showBooking && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white p-8 w-full max-w-sm shadow-2xl relative border-4 border-white/50"
                        >
                            <button
                                onClick={() => setShowBooking(false)}
                                className="absolute right-4 top-4 text-slate-300 hover:text-slate-500 transition-colors bg-slate-100 p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-[#0066B2] font-black text-center mb-8 text-sm uppercase tracking-widest pt-2">Secure Your Future</h2>

                            <form className="space-y-6" onSubmit={async (e) => {
                                e.preventDefault();
                                if (!bookingData.name || !bookingData.phone || !bookingData.date || !bookingData.time) return alert("Please fill all details");

                                setIsSubmitting(true);
                                try {
                                    const leadNo = sessionStorage.getItem('futureClimbLeadNo');
                                    const result = await updateLeadNew(leadNo, {
                                        name: bookingData.name,
                                        mobile: bookingData.phone,
                                        date: bookingData.date,
                                        time: bookingData.time,
                                        remarks: `Future Climb Slot Booking | Readiness Score: ${readinessScore}`
                                    });

                                    if (result.success) {
                                        setShowBooking(false);
                                        setStatus(GAME_STATUS.THANK_YOU);
                                    }
                                } catch (err) {
                                    console.error(err);
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}>
                                <div className="space-y-1 text-left">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Name</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={bookingData.name}
                                            onChange={e => setBookingData(p => ({ ...p, name: e.target.value }))}
                                            className="w-full bg-slate-50 h-12 border-2 border-slate-100 text-slate-800 text-xs font-bold px-4 focus:border-[#0066B2] focus:outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1 text-left">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            maxLength={10}
                                            value={bookingData.phone}
                                            onChange={e => setBookingData(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                                            className="w-full bg-slate-50 h-12 border-2 border-slate-100 text-slate-800 text-xs font-bold px-4 focus:border-[#0066B2] focus:outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1 text-left">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Date</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            min={minDate}
                                            max={maxDate}
                                            value={bookingData.date}
                                            onChange={e => {
                                                const newDate = e.target.value;
                                                // Reset time when date changes to prevent invalid old time selection
                                                setBookingData(p => ({ ...p, date: newDate, time: '' }));
                                            }}
                                            className="w-full bg-slate-50 h-12 border-2 border-slate-100 text-slate-800 text-xs font-bold px-4 focus:border-[#0066B2] focus:outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1 text-left">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Slot</label>
                                    <div className="relative">
                                        <select
                                            value={bookingData.time}
                                            onChange={e => setBookingData(p => ({ ...p, time: e.target.value }))}
                                            className="w-full bg-slate-50 h-12 border-2 border-slate-100 text-slate-800 text-xs font-bold px-4 appearance-none focus:border-[#0066B2] focus:outline-none"
                                            required
                                        >
                                            <option value="">Select a time</option>
                                            {availableSlots.length > 0 ? (
                                                availableSlots.map(slot => (
                                                    <option key={slot} value={slot}>{slot}</option>
                                                ))
                                            ) : (
                                                <option value="" disabled>No slots available today</option>
                                            )}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-[#FF8C00] hover:bg-[#FF7000] text-white font-black py-4 shadow-[0_6px_0_#993D00] active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest text-sm border-2 border-white/20"
                                >
                                    {isSubmitting ? 'CONFIRMING...' : 'CONFIRM BOOKING'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CTAResultScreen;
