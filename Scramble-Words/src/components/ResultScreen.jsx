import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Phone, Calendar } from "lucide-react";
import { buildShareUrl } from "../utils/crypto";
import { shortenUrl } from "../utils/shortener";
import ScoreShield from "./common/ScoreShield";
import BookingModal from "./BookingModal";
import Confetti from "./common/Confetti";
import { useGameState } from "../hooks/useGameState";
import gameThumbnail from "../assets/front-page/NewSartScreen.png";

export default function ResultScreen({ score, onRestart, onThankYou, firstName }) {
    const { lastSubmittedPhone } = useGameState();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Normalize score 1-5
    const normalizedScore = score > 5 ? Math.round(score / 10) : score;
    const finalScore = Math.min(Math.max(normalizedScore, 0), 5);
    const name = firstName || "BAJAJ";

    // Dynamic Subtext based on score
    let subtext = "";

    if (finalScore === 0) {
        subtext = "It's ok! You learned something new";
    } else if (finalScore >= 1 && finalScore <= 4) {
        subtext = "You did well but you can surely do better!";
    } else if (finalScore === 5) {
        subtext = "You know a lot of insurance related concepts, keep going";
    }

    const handleShare = async () => {
        const rawShareUrl = buildShareUrl() || window.location.href;
        const shareUrl = await shortenUrl(rawShareUrl);
        const senderName = firstName || '';
        const signature = senderName ? `\n\nBest Regards,\n${senderName}` : '';
        const shareText = `Hi,\nI just tried this word-unscramble challenge on life insurance and scored ${(finalScore)}/5.\nSee if you can beat my score — try it here: ${shareUrl}${signature}`.trim();
        const shareData = {
            title: 'Unscrambled Financial Words',
            text: shareText,
            url: shareUrl
        };

        if (navigator.share) {
            try {
                const sharePayload = {
                    title: shareData.title,
                    text: shareData.text
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
                console.log('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(shareText);
            alert("Result copied to clipboard!");
        }
    };

    return (
        <div className="w-full h-dvh flex flex-col items-center justify-center px-4 py-2 text-center game-bg-gradient overflow-hidden font-sans relative">
            <Confetti />

            {/* Top Share Button (Icon only - Secondary) */}
            <button
                onClick={handleShare}
                className="absolute right-4 top-4 p-2 text-white/80 hover:text-white transition-colors z-20"
                title="Share Score"
            >
                <Share2 className="w-5 h-5" />
            </button>

            {/* Main Content Area - Centered and Compact */}
            <div className="w-full max-w-xs flex flex-col items-center z-10">

                {/* Greeting */}
                <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-extrabold text-white tracking-widest uppercase leading-none mt-2"
                >
                    HI {name}!
                </motion.h1>

                {/* Gap 12px */}
                <div className="h-3 shrink-0"></div>

                {/* Score Text */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xs font-semibold text-white/80 tracking-widest uppercase"
                >
                    YOUR <span className="text-orange-500 font-extrabold text-sm mx-1">SCORE</span> IS
                </motion.div>

                {/* Gap 16px (before shield) */}
                <div className="h-4 shrink-0"></div>

                {/* Score Shield - Reduced Size (10-15%) & Tighter Spacing */}
                <div className="relative transform scale-[0.65] min-[375px]:scale-75 origin-center -my-10 -translate-y-2">
                    <ScoreShield score={finalScore} />
                </div>

                {/* Gap 12px (after shield visual space) */}
                <div className="h-3 shrink-0"></div>



                {/* Description */}
                <div className="w-full">
                    <p className="text-white/80 text-xs leading-tight whitespace-pre-line px-2">
                        {subtext}
                    </p>
                </div>

                {/* Gap 16px */}
                <div className="h-4 shrink-0"></div>

                {/* Actions: Connect & Share */}
                <div className="w-full flex flex-col gap-3">
                    {/* Share Button (Above CTA) */}
                    <motion.button
                        onClick={handleShare}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm uppercase tracking-wide rounded-xl shadow-sm flex items-center justify-center gap-2 border border-white/10 transition-all"
                    >
                        SHARE
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 5V2L22 9L14 16V13C7 13 4 15 2 20C4 12 7 8 14 8V5Z" />
                        </svg>
                    </motion.button>

                    {/* Compact Info Box (Below Share) */}
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-blue-900/30 border border-white/10 rounded-lg p-2.5 mx-1 backdrop-blur-sm"
                    >
                        <p className="text-white/90 text-xs leading-tight font-medium">
                            "To know more about insurance and savings products, please connect with our relationship manager"
                        </p>
                    </motion.div>

                    {/* Call Now */}
                    <button
                        onClick={() => window.location.href = "tel:18002099999"}
                        className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm uppercase tracking-wide rounded-xl shadow-sm flex items-center justify-center gap-2 border-2 border-transparent hover:border-white/20 transition-all"
                    >
                        <Phone className="w-4 h-4 fill-current" />
                        CALL NOW
                    </button>

                    {/* Book Slot */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm uppercase tracking-wide rounded-xl shadow-sm flex items-center justify-center gap-2 border-2 border-transparent hover:border-white/20 transition-all"
                    >
                        <Calendar className="w-4 h-4" />
                        BOOK SLOT
                    </button>

                    {/* Try Again Button (Above Disclaimer) */}
                    <button
                        onClick={onRestart}
                        className="text-white/70 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors underline underline-offset-4 mt-2"
                    >
                        Play Again

                    </button>

                    {/* Disclaimer */}
                    <div className="w-full px-6 opacity-40 mt-4">
                        <p className="text-[7px] sm:text-[8px] text-white leading-relaxed text-center font-bold max-w-[380px] mx-auto uppercase tracking-tighter">
                            <span className="opacity-60 underline mr-1">Disclaimer:</span> The results shown in this game are indicative and based solely on the information provided by the participant. They are intended for engagement and awareness purposes only and do not constitute financial advice or a recommendation to purchase any life insurance product. Participants should seek independent professional advice before making any financial or insurance decisions. While due care has been taken in designing the game, Bajaj Life Insurance Ltd. assumes no liability for its outcomes.
                        </p>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            <BookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={onThankYou}
                initialName={firstName}
                initialMobile={lastSubmittedPhone}
            />
        </div>
    );
}

