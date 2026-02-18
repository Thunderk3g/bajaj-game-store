import { memo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Share2, Phone, CalendarClock } from 'lucide-react';
import Button from '../../../components/ui/Button';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

/**
 * Conversion screen with Share, Call, and Book Slot CTAs.
 */
const ConversionScreen = memo(function ConversionScreen({
    score,
    category,
    onBookSlot,
}) {
    const handleShare = async () => {
        const shareText = `I scored ${score}/100 (${category?.label}) on the Life Milestone Race! Check your Life Goals readiness and discover how prepared you are for your future. ${window.location.href}`;
        const shareData = {
            title: 'My Life Protection Score',
            text: shareText,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(shareText);
            alert("Result copied to clipboard!");
        }
    };

    const handleCall = () => {
        window.location.href = 'tel:18002099999';
    };

    return (
        <motion.div
            className="w-full flex flex-col items-center gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center space-y-3">
                <h2 className="race-heading text-[1.75rem] text-blue-950">
                    Strengthen Your Protection
                </h2>
                <div className="flex flex-col items-center">
                    <span
                        className="text-[0.75rem] font-black uppercase tracking-[0.2em] text-blue-900/40 mb-1"
                    >
                        Your Score
                    </span>
                    <span
                        className="text-[2.5rem] font-black"
                        style={{ color: category?.color || '#3B82F6', textShadow: `0 0 20px ${category?.color}40` }}
                    >
                        {score}/100
                    </span>
                </div>
            </motion.div>

            {/* Decorative Info Box */}
            <motion.div
                variants={itemVariants}
                className="w-full bg-bajaj-blue/10 border border-bajaj-blue/30 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group"
            >
                <div className="absolute top-0 left-0 w-1 h-full bg-bajaj-blue" />
                <p className="text-[1rem] text-blue-900/90 leading-relaxed font-medium">
                    &ldquo;To know more about insurance and savings products, please connect with our relationship manager.&rdquo;
                </p>
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <CalendarClock size={100} />
                </div>
            </motion.div>

            {/* Actions */}
            <div className="w-full flex flex-col gap-4">
                <motion.div variants={itemVariants}>
                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full py-4 bg-orange-500 hover:bg-orange-600 border-orange-400 shadow-[0_4px_0_rgb(194,65,12)] active:shadow-none active:translate-y-1 transition-all"
                        onClick={handleShare}
                        id="btn-share"
                    >
                        <Share2 size={20} />
                        Share Your Result
                    </Button>
                </motion.div>

                <div className="grid grid-cols-2 gap-4">
                    <motion.div variants={itemVariants}>
                        <button
                            onClick={handleCall}
                            className="w-full h-14 bg-bajaj-blue/10 hover:bg-bajaj-blue/20 border-2 border-bajaj-blue/30 text-bajaj-blue font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                            id="btn-call"
                        >
                            <Phone size={18} />
                            Call Now
                        </button>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <button
                            onClick={onBookSlot}
                            className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_0_rgb(180,83,9)] active:shadow-none active:translate-y-1 transition-all"
                            id="btn-book-slot"
                        >
                            <CalendarClock size={18} />
                            Book Slot
                        </button>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
});

ConversionScreen.displayName = 'ConversionScreen';

ConversionScreen.propTypes = {
    score: PropTypes.number.isRequired,
    category: PropTypes.shape({
        label: PropTypes.string,
        color: PropTypes.string,
    }),
    onBookSlot: PropTypes.func.isRequired,
};

export default ConversionScreen;
