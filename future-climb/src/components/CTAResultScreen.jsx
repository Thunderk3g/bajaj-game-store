import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, GAME_STATUS } from '../store/useGameStore';
import { Phone, RotateCcw, Calendar, Share2, X, Clock, ChevronDown } from 'lucide-react';
import Speedometer from './Speedometer';
import Confetti from './Confetti';
import { buildShareUrl } from '../utils/crypto';
import { shortenUrl } from '../utils/shortener';
import { updateLeadNew } from '../utils/api';

const CTAResultScreen = () => {
    const { leadData, coins, distance, setStatus, resetGame } = useGameStore();
    const [showBooking, setShowBooking] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingData, setBookingData] = useState({ 
        name: leadData?.name || '', 
        phone: leadData?.phone || '', 
        date: '', 
        time: '' 
    });

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

    // Calculate a "Future Readiness Score" (0-100)
    const readinessScore = Math.min(100, Math.floor((coins / 10) + (distance / 5)));

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
                    <h2 className="text-sm sm:text-base text-white tracking-widest italic uppercase">
                        Your <span className="font-black text-[#FF8C00] drop-shadow-[0_0_10px_rgba(255,140,0,0.6)]">Future Readiness</span> Score Is
                    </h2>
                </div>

                {/* Speedometer */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-2 transform scale-90 sm:scale-100"
                >
                    <Speedometer score={readinessScore} />
                </motion.div>

                {/* Quote Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mb-6 px-6"
                >
                    <p className="text-gray-400 text-xs italic leading-relaxed border-l-4 border-[#FFCC00] pl-4 py-1 text-left">
                        "The best way to predict the future is to create it, and the best way to create it is to secure it today."
                    </p>
                </motion.div>

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
                        To achieve your life goals and secure your future. Connect with our relationship manager
                    </p>

                    <div className="space-y-4">
                        <a href="tel:+911800123456" className="block w-full">
                            <button className="w-full bg-[#0066B2] hover:bg-[#004C85] text-white font-black py-3.5 shadow-[0_4px_0_#00335C] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest border-2 border-white/20">
                                <Phone className="w-4 h-4" /> CALL NOW
                            </button>
                        </a>

                        <div className="relative py-1 flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                            <span className="relative px-4 bg-white text-slate-300 font-black text-[10px] tracking-widest uppercase">Or</span>
                        </div>

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

                <p className="text-[9px] text-gray-600 font-black tracking-widest uppercase mb-4 opacity-80">
                    Bajaj Allianz Life Insurance Co. Ltd.
                </p>

                {/* Disclaimer */}
                <div className="w-full px-8 opacity-40 mb-8">
                    <p className="text-[7px] sm:text-[8px] text-white leading-relaxed text-center font-bold max-w-[380px] mx-auto uppercase tracking-tighter">
                        <span className="opacity-60 underline mr-1">Disclaimer:</span> The results shown in this game are indicative and based solely on the information provided by the participant. They are intended for engagement and awareness purposes only and do not constitute financial advice or a recommendation to purchase any life insurance product. Participants should seek independent professional advice before making any financial or insurance decisions. While due care has been taken in designing the game, Bajaj Allianz Life Insurance Co. Ltd. assumes no liability for its outcomes.
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
