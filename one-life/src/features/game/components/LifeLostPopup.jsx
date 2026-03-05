import React from 'react';
import { motion } from 'framer-motion';

/**
 * LifeLostPopup — shown when a risk hits the player.
 * - type='lost'    → "You lost a life, but you can continue"
 * - type='gameover' → "You lost all lives, try again"
 */
const LifeLostPopup = ({ message, type, onContinue, onGameOver, onRestart }) => {
    return (
        <motion.div
            className="absolute inset-0 z-[100] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Dark backdrop */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)',
                }}
            />

            {/* Popup Card */}
            <motion.div
                style={{
                    position: 'relative',
                    zIndex: 10,
                    maxWidth: '320px',
                    width: '85%',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255, 60, 60, 0.15)',
                }}
                initial={{ scale: 0.7, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.7, y: 30 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
                {/* Top danger strip */}
                <div
                    style={{
                        background: type === 'gameover'
                            ? 'linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)'
                            : 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)',
                        padding: '24px 20px 16px',
                        textAlign: 'center',
                    }}
                >
                    {/* Icon */}
                    <div style={{
                        fontSize: '48px',
                        marginBottom: '8px',
                        filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
                    }}>
                        {type === 'gameover' ? '💀' : '⚠️'}
                    </div>

                    <h2 style={{
                        fontFamily: "'Outfit', system-ui, sans-serif",
                        fontSize: type === 'gameover' ? '22px' : '20px',
                        fontWeight: 800,
                        color: '#FFFFFF',
                        margin: 0,
                        lineHeight: 1.3,
                        textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    }}>
                        {type === 'gameover' ? 'Game Over!' : 'Oops!'}
                    </h2>
                </div>

                {/* Body */}
                <div
                    style={{
                        background: 'linear-gradient(180deg, #1A2744 0%, #0F1B30 100%)',
                        padding: '20px 24px 28px',
                        textAlign: 'center',
                    }}
                >
                    <p style={{
                        fontFamily: "'Outfit', system-ui, sans-serif",
                        fontSize: '17px',
                        fontWeight: 500,
                        color: '#CBD5E1',
                        margin: '0 0 24px 0',
                        lineHeight: 1.5,
                    }}>
                        {message}
                    </p>

                    {type === 'gameover' ? (
                        <button
                            onClick={onRestart}
                            style={{
                                width: '100%',
                                padding: '14px 24px',
                                borderRadius: '12px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #E53935 0%, #C62828 100%)',
                                color: '#FFF',
                                fontFamily: "'Outfit', system-ui, sans-serif",
                                fontSize: '17px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 4px 16px rgba(229, 57, 53, 0.4)',
                                transition: 'transform 0.15s ease',
                            }}
                            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
                            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            🔄 Try Again
                        </button>
                    ) : (
                        <button
                            onClick={onContinue}
                            style={{
                                width: '100%',
                                padding: '14px 24px',
                                borderRadius: '12px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #005BAC 0%, #0A3D91 100%)',
                                color: '#FFF',
                                fontFamily: "'Outfit', system-ui, sans-serif",
                                fontSize: '17px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 4px 16px rgba(0, 91, 172, 0.4)',
                                transition: 'transform 0.15s ease',
                            }}
                            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
                            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            ▶️ Continue
                        </button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default LifeLostPopup;
