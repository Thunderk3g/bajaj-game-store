import { memo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Button from '../../../components/ui/Button';
import bgImage from '../../../assets/image/Life-Milestone-Race.png';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

/**
 * Intro screen with game title image and CTA.
 * Lead generation moved to post-game.
 */
const IntroScreen = memo(function IntroScreen({ onStart }) {
    const handleStartClick = () => {
        onStart('', '');
    };

    return (
        <motion.div
            className="w-full flex-1 min-h-[100dvh] flex flex-col items-center justify-end pb-8 pt-8 relative overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* CTA */}
            <motion.div variants={itemVariants} className="w-full max-w-xs z-10 px-6">
                <Button
                    variant="primary"
                    size="md"
                    className="w-full shadow-lg text-white btn-5 py-3"
                    onClick={handleStartClick}
                    id="btn-start-race"
                    style={{
                        background: 'linear-gradient(135deg, #FF6600 0%, #F59E0B 100%)',
                    }}
                >
                    Start the Race
                    <ChevronRight size={20} />
                </Button>
            </motion.div>
        </motion.div>
    );
});

IntroScreen.displayName = 'IntroScreen';

IntroScreen.propTypes = {
    onStart: PropTypes.func.isRequired,
};

export default IntroScreen;
