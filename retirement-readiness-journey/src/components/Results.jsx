import React, { useState, useEffect } from 'react';
import { buildShareUrl } from '../utils/crypto';
import { shortenUrl } from '../utils/shortener';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { Button } from './ui/Button';
import { Share2, Phone, Calendar, RotateCcw, CheckCircle2 } from 'lucide-react';
import { READINESS_BANDS } from '../constants/journeySteps';
import BookingModal from './BookingModal';

const Results = ({ score, onReset, userInfo }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [displayScore, setDisplayScore] = useState(0);

    // Counting animation for the score number
    useEffect(() => {
        const controls = animate(0, score, {
            duration: 1.5,
            ease: "easeOut",
            onUpdate: (latest) => setDisplayScore(Math.round(latest))
        });
        return controls.stop;
    }, [score]);

    const handleBookingSubmit = () => {
        setIsSubmitted(true);
    };

    const handleShare = async () => {
        const rawUrl = buildShareUrl() || window.location.href;
        const shareUrl = await shortenUrl(rawUrl);
        const senderName = sessionStorage.getItem('gamification_emp_name') || '';
        const shareData = {
            title: 'Retirement Readiness',
            text: `Hi,\nI just tried this retirement preparedness test and scored ${Math.round(score)}/100. It really made me think about my retirement corpus!\nSee how prepared you are — try it here: ${shareUrl}\n\n${senderName}`.trim(),
            url: shareUrl
        };

        try {
            if (navigator.share) {
                // We exclude 'url' here because it's already included in the 'text' 
                // and some platforms (Android/WhatsApp) append it twice if both are sent.
                await navigator.share({
                    title: shareData.title,
                    text: shareData.text
                });
            } else {
                await navigator.clipboard.writeText(`${shareData.text} Check it out here: ${shareData.url}`);
                alert('Result copied to clipboard!');
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    const band = READINESS_BANDS.find(b => score >= b.min) || READINESS_BANDS[READINESS_BANDS.length - 1];

    // Thank You Screen View (Refined background and animation)
    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center space-y-8 py-12 text-center animate-in fade-in duration-700">
                <div className="relative">
                    {/* Blinking/Pulsing Shadow */}
                    <motion.div
                        animate={{
                            scale: [1, 1.6, 1],
                            opacity: [0, 0.6, 0]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute inset-0 bg-[#ff6600] rounded-full blur-3xl"
                    />

                    <div className="w-32 h-32 bg-[#ff6600] rounded-full flex items-center justify-center relative z-10 shadow-2xl shadow-[#ff6600]/50">
                        <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={3} />
                    </div>
                </div>

                <div className="space-y-4 max-w-[320px]">
                    <h1 className="text-slate-900 text-3xl font-extrabold leading-tight uppercase tracking-tight">
                        THANK YOU<br />
                        <span className="text-primary-500 truncate block max-w-full">{userInfo?.name || 'USER'}</span><br />
                        FOR<br />
                        SHARING YOUR<br />
                        DETAILS
                    </h1>
                    <p className="text-slate-500 font-semibold text-sm tracking-wide uppercase">
                        OUR RELATIONSHIP MANAGER<br />
                        WILL REACH OUT TO YOU
                    </p>
                </div>

                <button
                    onClick={onReset}
                    className="w-full max-w-[280px] h-[4.5rem] bg-[#ff6600] hover:bg-[#ff7711] text-white font-extrabold rounded-2xl shadow-[0_6px_0_#993d00] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 text-xl uppercase tracking-wider"
                >
                    <RotateCcw className="w-6 h-6" />
                    RETAKE
                </button>

            </div>
        );
    }

    // Results Screen View
    return (
        <div className="max-w-[480px] mx-auto w-full flex flex-col space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12 pt-4 px-4 h-auto 
            [/* Mobile-only one-screen constraint */] 
            max-[640px]:px-4 max-[640px]:pb-6 max-[640px]:space-y-4 max-[640px]:pt-2">

            {/* Score Card Section */}
            <div className="text-center space-y-4 sm:space-y-6 pt-0 text-white relative flex-shrink-0
                max-[640px]:space-y-2">

                {/* Centered Greeting Header */}
                <div className="flex justify-center items-center relative pt-2 max-[640px]:pt-1">
                    <h2 className="text-white text-base font-bold uppercase tracking-wider text-center px-10 max-[640px]:text-[0.8rem] opacity-100">
                        HI {userInfo?.name?.toUpperCase() || 'THERE'}
                        <div className="text-[0.75rem] mt-1 max-[640px]:text-[0.65rem] text-white font-semibold tracking-[0.15em]">
                            YOUR RETIREMENT READINESS SCORE
                        </div>
                    </h2>
                    <button
                        onClick={handleShare}
                        className="absolute right-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white/70 hover:bg-white/30 transition-colors max-[640px]:w-8 max-[640px]:h-8"
                    >
                        <Share2 className="w-5 h-5 max-[640px]:w-4 max-[640px]:h-4" />
                    </button>
                </div>

                {/* SVG Circle Meter */}
                <div className="flex justify-center py-1 max-[640px]:py-0 max-[640px]:scale-75 max-[640px]:-my-4">
                    <div className="relative inline-flex flex-col items-center justify-center">
                        <svg className="w-[12rem] h-[12rem] -rotate-90">
                            <circle
                                cx="96" cy="96" r="88"
                                fill="transparent"
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="12"
                                className="transition-all duration-300"
                            />
                            <motion.circle
                                cx="96" cy="96" r="88"
                                fill="transparent"
                                stroke="#ff6600"
                                strokeWidth="12"
                                strokeDasharray="552.9"
                                initial={{ strokeDashoffset: 552.9 }}
                                animate={{ strokeDashoffset: 552.9 * (1 - score / 100) }}
                                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">

                            <div className="flex flex-col items-center justify-center">
                                <span className="text-[3.5rem] font-bold leading-none max-[640px]:text-[2.75rem]">
                                    {displayScore}
                                </span>
                                <span className="text-[1.25rem] font-medium opacity-70 max-[640px]:text-[1rem]">/ 100</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Large Band Text with Emoji */}
                <div className="space-y-2 max-[640px]:space-y-1">
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                        {band.icon.includes('.png') ? (
                            <img src={band.icon} alt={band.label} className="w-[2.5rem] h-[2.5rem] sm:w-[3.5rem] sm:h-[3.5rem] object-contain drop-shadow-sm" />
                        ) : (
                            <span className="text-[2rem] sm:text-[3rem] drop-shadow-sm">{band.icon}</span>
                        )}
                        <h2 className="text-[2.2rem] sm:text-[3rem] font-bold tracking-wide text-[#ff6600] uppercase drop-shadow-md leading-none max-[640px]:text-[1.8rem]">
                            {band.label}
                        </h2>
                    </div>
                    <p className="text-[1.25rem] sm:text-[1.35rem] font-semibold leading-relaxed max-w-[24rem] sm:max-w-[28rem] mx-auto text-white/95 drop-shadow-sm max-[640px]:text-[0.95rem]">
                        {band.description}
                    </p>
                </div>
            </div>

            {/* Large Share Button */}
            <button
                onClick={handleShare}
                className="w-[60%] max-w-[320px] mx-auto h-[4.5rem] bg-[#ff6600] hover:bg-[#ff7711] text-white font-extrabold rounded-2xl shadow-[0_6px_0_#993d00] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 text-xl uppercase tracking-wider flex-shrink-0
                    max-[640px]:h-[3rem] max-[640px]:rounded-xl max-[640px]:text-base max-[640px]:shadow-[0_4px_0_#993d00] max-[640px]:w-[70%]"
            >
                <Share2 className="w-6 h-6 max-[640px]:w-4 max-[640px]:h-4" />
                SHARE
            </button>

            {/* Conversion Section Card */}
            <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 space-y-6 flex-shrink-0
                max-[640px]:p-3 max-[640px]:rounded-[1.25rem] max-[640px]:space-y-2.5">
                <div className="text-center">
                    <p className="text-slate-700 font-bold text-sm leading-relaxed max-[640px]:text-[0.7rem] max-[640px]:px-1 max-[640px]:leading-snug">
                        To Know more about retirement focussed products, connect with our Relationship Manager NOW!
                    </p>
                </div>

                <div className="space-y-4 max-[640px]:space-y-2">
                    <Button
                        onClick={() => window.location.href = "tel:18002099999"}
                        className="w-full h-[3.5rem] sm:h-[4rem] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-2 sm:gap-3 rounded-xl shadow-lg shadow-emerald-500/20 max-[640px]:h-[3rem]"
                    >
                        <Phone className="w-4 h-4 sm:w-5 sm:h-5 fill-current max-[640px]:w-3 max-[640px]:h-3" />
                        CALL NOW
                    </Button>

                    <div className="flex items-center gap-4 py-1 max-[640px]:py-0 max-[640px]:gap-2">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-slate-400 text-[10px] sm:text-[10px] max-[640px]:text-[8px] font-semibold uppercase tracking-widest">OR</span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full h-[3.5rem] sm:h-[4rem] bg-[#0066B2] hover:bg-[#005596] text-white font-bold text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-2 sm:gap-3 rounded-xl shadow-lg shadow-blue-500/20 max-[640px]:h-[3rem]"
                    >
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 max-[640px]:w-3 max-[640px]:h-3" />
                        BOOK A SLOT
                    </Button>
                </div>

                <button
                    onClick={onReset}
                    className="w-full flex items-center justify-center gap-2 text-slate-400 text-[0.75rem] font-semibold uppercase tracking-widest hover:text-blue-500 transition-colors pt-4 max-[640px]:pt-2 max-[640px]:text-[0.65rem]"
                >
                    <RotateCcw className="w-4 h-4" />
                    RETAKE ASSESSMENT
                </button>
            </div>

            {/* Disclaimer */}
            <div className="w-full px-6 mt-4">
                <p className="text-[7px] sm:text-[8px] text-white/60 leading-relaxed text-center font-bold max-w-[380px] mx-auto uppercase tracking-tighter">
                    <span className="text-white/80 underline mr-1">Disclaimer:</span> The results shown in this game are indicative and based solely on the information provided by the participant. They are intended for engagement and awareness purposes only and do not constitute financial advice or a recommendation to purchase any life insurance product. Participants should seek independent professional advice before making any financial or insurance decisions. While due care has been taken in designing the game, Bajaj Life Insurance Ltd. assumes no liability for its outcomes.
                </p>
            </div>

            <BookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleBookingSubmit}
                initialName={userInfo?.name}
                initialMobile={userInfo?.mobile}
                leadNo={userInfo?.leadNo}
                score={score}
            />
        </div>
    );
};

export default Results;
