import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../features/game/context/GameContext.jsx';
import coverImage from '../assets/images/Cover-Image.png';

/**
 * Full-screen cover intro page.
 * Lead capture moved to post-game.
 */
const IntroPage = memo(function IntroPage() {
    const { startGame } = useGame();
    const navigate = useNavigate();

    const handleStart = () => {
        startGame();
        navigate('/game');
    };

    return (
        <div
            style={{
                minHeight: '100dvh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0d1b3e',
            }}
        >
            <div
                className="relative w-full"
                style={{
                    minHeight: '100dvh',
                    maxWidth: '430px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Cover Image */}
                <img
                    src={coverImage}
                    alt="Retirement Sudoku"
                    draggable={false}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        userSelect: 'none',
                        pointerEvents: 'none',
                    }}
                />

                {/* Bottom CTA area */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        paddingBottom: 'max(env(safe-area-inset-bottom), 32px)',
                        paddingLeft: '24px',
                        paddingRight: '24px',
                        paddingTop: '48px',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)',
                    }}
                >
                    <button
                        id="intro-start-btn"
                        onClick={handleStart}
                        style={{
                            width: '100%',
                            maxWidth: '320px',
                            padding: '16px 0',
                            borderRadius: '16px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            fontWeight: 800,
                            letterSpacing: '0.08em',
                            color: '#ffffff',
                            background: 'linear-gradient(135deg, #0066B2 0%, #3B82F6 100%)',
                            boxShadow: '0 4px 24px rgba(0, 102, 178, 0.55), 0 1px 0 rgba(255,255,255,0.15) inset',
                        }}
                    >
                        Start
                    </button>
                </div>
            </div>
        </div>
    );
});

export default IntroPage;
