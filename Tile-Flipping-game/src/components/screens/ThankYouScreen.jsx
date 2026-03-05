import { motion } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { SCREENS } from '../../constants/game';
import { useGameEngine } from '../../hooks/useGameEngine';

const ThankYouScreen = () => {
    const { state, navigate } = useGame();
    const { initGame } = useGameEngine();
    const { user } = state;

    function handleRetake() {
        initGame();
        navigate(SCREENS.GAME);
    }

    // Styling from ScoreResultsScreen framework
    const ghibliCardClass = "screen";
    const ghibliContentClass = "screen-inner relative z-10 w-full h-full flex flex-col py-4 px-4 overflow-y-auto overflow-x-hidden justify-between";

    return (
        <div className={ghibliCardClass} style={{
            background: "linear-gradient(180deg, #00509E 0%, #003366 100%)", // Deep Blue Game Theme
            height: '100dvh',
            width: '100vw',
            overflow: 'hidden'
        }}>
            {/* Background Pattern - using CSS gradient fallback */}
            <div style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                pointerEvents: 'none',
                opacity: 0.6,
                mixBlendMode: 'overlay',
                backgroundImage: 'linear-gradient(radial-gradient, circle at center, rgba(255,255,255,0.2) 0%, transparent 70%)'
            }}>
            </div>

            <div className={ghibliContentClass} style={{ alignItems: 'center', margin: 'auto' }}>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: 'auto',
                        flex: 1,
                        textAlign: 'center',
                        padding: '0 16px',
                        width: '100%'
                    }}
                >
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        style={{
                            fontSize: 'clamp(36px, 10vw, 72px)',
                            fontWeight: 900,
                            color: 'white',
                            fontStyle: 'italic',
                            letterSpacing: '-0.025em',
                            textShadow: '0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)',
                            marginBottom: '24px',
                            lineHeight: 1.1
                        }}
                    >
                        Thank You {user?.name ? user.name.split(' ')[0] : ''}
                    </motion.h1>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        style={{
                            fontSize: 'clamp(18px, 5vw, 24px)',
                            color: '#DBEAFE', // blue-100
                            fontWeight: 700,
                            textShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            marginBottom: '8px',
                            margin: '0 0 8px 0'
                        }}
                    >
                        For sharing your details
                    </motion.p>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        style={{
                            fontSize: 'clamp(16px, 4vw, 20px)',
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontWeight: 500,
                            textShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            marginBottom: '48px',
                            margin: '0 0 48px 0'
                        }}
                    >
                        Our Relationship Manager will connect with you
                    </motion.p>

                    <motion.button
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        onClick={handleRetake}
                        style={{
                            backgroundColor: '#FF8C00',
                            color: 'white',
                            fontWeight: 900,
                            fontSize: '14px',
                            padding: '12px 32px',
                            boxShadow: '0 4px 0 #993D00',
                            transition: 'all 0.1s',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            border: '2px solid rgba(255,255,255,0.2)',
                            borderRadius: '9999px',
                            cursor: 'pointer'
                        }}
                        onMouseDown={(e) => {
                            e.currentTarget.style.transform = 'translateY(4px)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                        onMouseUp={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 4px 0 #993D00';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 4px 0 #993D00';
                        }}
                    >
                        RETAKE
                    </motion.button>
                </motion.div>
                <div style={{ textAlign: 'center', padding: '20px 0 16px', fontSize: 9, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.4)' }}>
                    Bajaj Life Insurance
                </div>
            </div>
        </div>
    );
};

export default ThankYouScreen;
