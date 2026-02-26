import React, { useState } from 'react';
import LeadModal from '../modals/LeadModal';

interface WelcomeScreenProps {
    onStart: (leadData: { name: string; mobile: string }) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    background: '#0a0f1e',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    overflow: 'hidden',
                }}
            >
                {/* Full-screen background image */}
                <img
                    src="./assets/s&l intro-bg.png"
                    alt="Life Snakes & Ladders — Are You Protected?"
                    draggable={false}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center top',
                        display: 'block',
                        userSelect: 'none',
                        pointerEvents: 'none',
                    }}
                />

                {/* Bottom gradient */}
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        left: 0, right: 0, bottom: 0,
                        height: '38%',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.30) 65%, transparent 100%)',
                        pointerEvents: 'none',
                    }}
                />

                {/* START GAME button */}
                <div
                    style={{
                        position: 'relative',
                        width: '100%',
                        padding: '0 28px',
                        paddingBottom: 'max(36px, env(safe-area-inset-bottom, 36px))',
                        display: 'flex',
                        justifyContent: 'center',
                        zIndex: 10,
                    }}
                >
                    <button
                        onClick={() => setShowModal(true)}
                        style={{
                            width: '100%',
                            maxWidth: 340,
                            padding: 'clamp(14px, 4vw, 20px) 32px',
                            background: 'linear-gradient(135deg, #FF6600 0%, #FF9933 100%)',
                            color: '#fff',
                            fontFamily: "'Baloo 2', 'Nunito', system-ui, sans-serif",
                            fontSize: 'clamp(16px, 4.5vw, 20px)',
                            fontWeight: 900,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            border: '2px solid rgba(255,255,255,0.25)',
                            borderRadius: '999px',
                            cursor: 'pointer',
                            boxShadow: '0 6px 32px rgba(255,102,0,0.60), 0 2px 8px rgba(0,0,0,0.45)',
                            transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                            WebkitTapHighlightColor: 'transparent',
                        }}
                        onPointerDown={e => Object.assign(e.currentTarget.style, { transform: 'scale(0.95)', boxShadow: '0 2px 12px rgba(255,102,0,0.45)' })}
                        onPointerUp={e => Object.assign(e.currentTarget.style, { transform: 'scale(1)', boxShadow: '0 6px 32px rgba(255,102,0,0.60), 0 2px 8px rgba(0,0,0,0.45)' })}
                        onPointerLeave={e => Object.assign(e.currentTarget.style, { transform: 'scale(1)', boxShadow: '0 6px 32px rgba(255,102,0,0.60), 0 2px 8px rgba(0,0,0,0.45)' })}
                    >
                        START GAME
                    </button>
                </div>
            </div>

            {/* Lead capture modal */}
            {showModal && (
                <LeadModal
                    onClose={() => setShowModal(false)}
                    onSubmit={(data) => {
                        setShowModal(false);
                        onStart(data);
                    }}
                />
            )}
        </>
    );
};

export default WelcomeScreen;
