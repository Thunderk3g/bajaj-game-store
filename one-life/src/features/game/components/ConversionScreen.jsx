import React, { useState, useRef, useEffect, useMemo } from 'react';
import { buildShareUrl } from '../../../utils/crypto';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Phone, Calendar, X, RefreshCw } from 'lucide-react';
import Modal from './Modal';
import ThankYouScreen from './ThankYouScreen';

const ConversionScreen = ({ score, leadData, onBookSlot, onRestart }) => {
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isBookingSuccess, setIsBookingSuccess] = useState(false);
    const [bookingData, setBookingData] = useState({
        name: leadData?.name || '',
        mobile_no: leadData?.phone || '',
        date: '',
        timeSlot: ''
    });
    const [bookingError, setBookingError] = useState('');

    const today = new Date().toISOString().split("T")[0];

    const displayName = useMemo(() => {
        const rawName = (leadData?.name || 'Player').trim();
        const firstName = rawName.split(/\s+/)[0];
        return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    }, [leadData]);

    const timeSlots = [
        "9:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM",
        "12:00 PM - 1:00 PM", "1:00 PM - 2:00 PM", "2:00 PM - 3:00 PM",
        "3:00 PM - 4:00 PM", "4:00 PM - 5:00 PM", "5:00 PM - 6:00 PM",
        "6:00 PM - 7:00 PM", "7:00 PM - 8:00 PM", "8:00 PM - 9:00 PM"
    ];

    const handleShare = async () => {
        const shareUrl = buildShareUrl() || window.location.href;
        const senderName = sessionStorage.getItem('gamification_emp_name') || '';
        const shareMessage = `Hi,\nI just experienced this eye-opening truth about life's uncertainties and protection.\nIt takes less than a minute — give it a try: ${shareUrl}\n\nRegards,\n${senderName}`.trim();
        if (navigator.share) {
            try { await navigator.share({ title: 'Expect the Unexpected', text: shareMessage, url: shareUrl }); } catch { }
        } else {
            try { await navigator.clipboard.writeText(shareMessage); } catch { }
        }
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        setBookingError('');

        if (bookingData.date < today) {
            setBookingError('Please select a valid future date.');
            return;
        }

        setIsSubmitting(true);
        const result = await onBookSlot({ ...bookingData, summary_dtls: 'One Life - Appointment' });
        setIsSubmitting(false);
        if (result.success) {
            setIsBookingSuccess(true);
            setIsBookingOpen(false);
        }
    };

    return (
        <div className="w-full min-h-[100dvh] h-full flex flex-col items-center relative bg-gradient-to-b from-[#00509E] to-[#003366] overflow-y-auto overflow-x-hidden">
            {/* Header Share Button Support */}
            <button onClick={handleShare} className="absolute top-4 right-4 z-50 text-white p-2">
                <Share2 className="w-6 h-6" />
            </button>

            {/* Flexible Single Screen Container */}
            <div className="w-full max-w-[420px] mx-auto min-h-full flex flex-col px-5 py-4 safe-p-top safe-p-bottom justify-between">

                {/* 1. Header Section */}
                <header className="flex flex-col items-center text-center pt-2">
                    <h1 className="text-lg sm:text-xl font-bold text-white uppercase italic leading-none">
                        Hi <span className="text-2xl sm:text-3xl font-black text-[#FFEBB7]">{displayName}!</span>
                    </h1>
                    <h2 className="text-sm sm:text-base font-black text-white uppercase italic tracking-wider mt-1">
                        You scored
                    </h2>
                </header>

                {/* 2. Score Meter Section */}
                <main className="flex flex-col items-center flex-grow justify-center py-2">
                    <div className="w-[min(48vw,180px)] h-[min(48vw,180px)] rounded-full border-4 border-white/20 flex flex-col items-center justify-center relative shadow-2xl shrink-0">
                        <div className="absolute w-[80%] h-[80%] rounded-full border border-dashed border-white/30" />
                        <span className="text-4xl sm:text-[48px] font-black text-white drop-shadow-md leading-none">{score}</span>
                        <div className="h-[2px] w-[20%] bg-white/20 my-1.5" />
                        <span className="text-[10px] sm:text-[12px] font-black text-white/70 uppercase tracking-[0.2em]">Points</span>
                    </div>

                    <div className="mt-4 flex flex-col items-center text-center space-y-1.5 px-2">
                        <p className="text-[#FFEBB7] text-xs sm:text-sm font-black italic uppercase tracking-tight">
                            But you lost to an unexcepted event
                        </p>
                        <p className="text-white text-sm sm:text-[15px] font-black leading-tight max-w-[320px] italic">
                            "The best time to protect the family was yesterday. The second best time is NOW!"
                        </p>
                    </div>

                    <div className="mt-4 w-full flex justify-center">
                        <button onClick={handleShare} className="w-full max-w-[200px] bg-gradient-to-r from-[#FF8C00] to-[#FF7000] text-white font-black py-3 shadow-[0_4px_0_#993D00] flex items-center justify-center gap-3 text-sm sm:text-base border-2 border-white/20 uppercase tracking-widest active:translate-y-1 transition-all rounded-none">
                            <Share2 className="w-5 h-5" /> SHARE
                        </button>
                    </div>
                </main>

                {/* 3. CTA & Footer Section */}
                <footer className="footer-section">
                    <div className="bg-white p-4 shadow-2xl rounded-[12px] border border-slate-100 w-full mb-3">
                        <p className="text-slate-800 text-[11px] sm:text-xs font-black text-center leading-tight uppercase tracking-tight mb-3">
                            Secure your family's future against unexcepted event. Connet with our realtionship manager now!
                        </p>
                        <div className="flex flex-col gap-2.5">
                            <a href="tel:18002097272" className="block w-full">
                                <button className="w-full h-11 bg-[#0066B2] text-white font-black shadow-[0_5px_0_#00335C] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 text-sm tracking-widest uppercase rounded-none">
                                    <Phone className="w-5 h-5" /> Call Now
                                </button>
                            </a>
                            <div className="relative py-0 flex items-center justify-center">
                                <div className="absolute w-full border-t border-slate-100" />
                                <span className="relative px-3 bg-white text-slate-300 text-[8px] font-black uppercase tracking-[0.4em]">Or</span>
                            </div>
                            <button onClick={() => setIsBookingOpen(true)} className="w-full h-11 bg-[#FF8C00] text-white font-black shadow-[0_5px_0_#993D00] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 text-sm tracking-widest uppercase rounded-none">
                                <Calendar className="w-5 h-5" /> Book a Slot
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col items-center space-y-3">
                        <div className="px-1">
                            <p className="opacity-60 text-[6.5px] sm:text-[7.5px] text-white text-center leading-tight max-w-[380px] uppercase font-medium">
                                The results shown in this game are indicative and based solely on the information provided by the participant. They are intended for engagement and awareness purposes only and do not constitute financial advice or a recommendation to purchase any life insurance product. Participants should seek independent professional advice before making any financial or insurance decisions. While due care has been taken in designing the game, Bajaj Life Insurance Ltd. assumes no liability for its outcomes
                            </p>
                        </div>

                        <button onClick={() => onRestart && onRestart()} className="text-white text-[12px] sm:text-sm font-black uppercase tracking-widest flex items-center gap-2 underline underline-offset-4 decoration-white/30">
                            <RefreshCw className="w-4 h-4" /> TRY AGAIN
                        </button>
                    </div>
                </footer>
            </div>

            {/* Overlays */}
            <AnimatePresence>
                {isBookingSuccess && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-[#020617]">
                        <ThankYouScreen leadName={bookingData.name} />
                    </motion.div>
                )}
            </AnimatePresence>

            <Modal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)}>
                <div className="bg-white p-6 w-[90%] max-w-[360px] mx-auto rounded-[12px] overflow-hidden relative text-left border-4 border-white/50 shadow-2xl">
                    <button onClick={() => setIsBookingOpen(false)} className="absolute right-4 top-4 text-slate-400 p-1"><X className="w-5 h-5" /></button>
                    <h2 className="text-[#0066B2] font-black text-center mb-6 uppercase text-base tracking-widest">Book a Slot</h2>
                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                        {bookingError && <p className="text-red-500 text-xs font-bold text-center uppercase tracking-wider">{bookingError}</p>}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Name</label>
                            <input value={bookingData.name} onChange={e => setBookingData(p => ({ ...p, name: e.target.value }))} className="w-full bg-slate-50 h-10 border-2 border-slate-100 text-slate-900 text-sm font-bold px-4 rounded-lg outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Mobile</label>
                            <input type="tel" value={bookingData.mobile_no} onChange={e => setBookingData(p => ({ ...p, mobile_no: e.target.value.replace(/\D/g, '').slice(0, 10) }))} className="w-full bg-slate-50 h-10 border-2 border-slate-100 text-slate-900 text-sm font-bold px-4 rounded-lg outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <input type="date" min={today} value={bookingData.date} onChange={e => setBookingData(p => ({ ...p, date: e.target.value, bookingError: '' }))} className="bg-slate-50 h-10 border-2 border-slate-100 text-slate-900 text-xs font-bold px-2 rounded-lg outline-none" />
                            <select value={bookingData.timeSlot} onChange={e => setBookingData(p => ({ ...p, timeSlot: e.target.value }))} className="bg-slate-50 h-10 border-2 border-slate-100 text-slate-900 text-xs font-bold px-2 rounded-lg outline-none">
                                <option value="" className="text-black">Select Time</option>
                                {timeSlots.map(s => <option key={s} value={s} className="text-black">{s}</option>)}
                            </select>
                        </div>
                        <button type="submit" disabled={isSubmitting || !bookingData.date || !bookingData.timeSlot || bookingData.mobile_no.length !== 10} className="w-full bg-[#FF8C00] text-white font-black py-4 shadow-[0_5px_0_#993D00] active:translate-y-1 transition-all uppercase tracking-widest text-sm mt-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting ? '...' : 'Confirm Slot'}
                        </button>
                    </form>
                </div>
            </Modal>

            <style>{`
                .safe-p-top { padding-top: env(safe-area-inset-top); }
                .safe-p-bottom { padding-bottom: env(safe-area-inset-bottom); }
            `}</style>
        </div>
    );
};

export default ConversionScreen;
