import React, { useState } from 'react';
import { Shield, Dice5 } from 'lucide-react';
import { getCellXY, SNAKES } from '../../features/GameLogic';

interface GameScreenProps {
    playerPosition: number;
    hasShield: boolean;
    onRoll: () => void;
    isMoving: boolean;
    lastDice: number;
    message: string;
    frozenSnakes: number[];
}

const DICE_FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

const GameScreen: React.FC<GameScreenProps> = ({
    playerPosition,
    hasShield,
    onRoll,
    isMoving,
    lastDice,
    message,
    frozenSnakes
}) => {
    const [isRolling, setIsRolling] = useState(false);
    const [visualDice, setVisualDice] = useState(lastDice || 1);

    // Scramble effect during roll
    React.useEffect(() => {
        let interval: number;
        if (isRolling) {
            interval = window.setInterval(() => {
                setVisualDice(Math.floor(Math.random() * 6) + 1);
            }, 80);
        } else {
            setVisualDice(lastDice || 1);
        }
        return () => window.clearInterval(interval);
    }, [isRolling, lastDice]);

    const handleRoll = () => {
        if (isMoving || isRolling) return;

        setIsRolling(true);
        // Simulate a roll duration
        setTimeout(() => {
            setIsRolling(false);
            onRoll();
        }, 800);
    };

    // getCellXY returns: x = left%, y = bottom% (each cell is 10% × 10%)
    // Add 5% left to center, floor the bottom to keep it grounded
    const { x, y } = getCellXY(playerPosition);
    const tokenLeft = x + 5;
    const tokenBottom = y; // Perfectly grounded on the line

    return (
        <div style={{
            width: '100%',
            height: '100dvh', /* Changed to 100dvh */
            display: 'flex',
            flexDirection: 'column',
            background: '#0a0f1e',
            overflow: 'hidden',
        }}>

            {/* ── HUD Bar ── */}
            <div style={{
                flexShrink: 0,
                background: 'rgba(15, 23, 42, 0.4)', // Semi-transparent unified background
                backdropFilter: 'blur(12px)', // Glassmorphism
                padding: '16px 20px', // More breathing room
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#fff',
                zIndex: 20,
                borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    marginBottom: 10
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{
                            fontSize: 10,
                            textTransform: 'uppercase',
                            letterSpacing: '0.2em',
                            color: '#38bdf8',
                            fontWeight: 800,
                            marginBottom: 4,
                            opacity: 0.8
                        }}>Current Square</span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                            <span style={{ fontSize: 32, fontWeight: 900, color: '#f1f5f9', lineHeight: 1 }}>{playerPosition}</span>
                            <span style={{ fontSize: 16, color: '#475569', fontWeight: 600 }}>/ 100</span>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        background: 'rgba(15, 23, 42, 0.6)',
                        padding: '8px 16px',
                        borderRadius: 24,
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: hasShield ? 'radial-gradient(circle, #34d399 0%, #059669 100%)' : '#334155',
                            boxShadow: hasShield ? '0 0 12px #10b981' : 'none',
                            transition: 'all 0.3s ease'
                        }} />
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {hasShield ? 'Shield Active' : 'No Shield'}
                        </span>
                    </div>
                </div>

                {/* Progress bar indicator */}
                <div style={{
                    width: '100%',
                    height: 8,
                    background: 'rgba(15, 23, 42, 0.8)',
                    borderRadius: 4,
                    overflow: 'hidden',
                    position: 'relative',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{
                        width: `${playerPosition}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #0ea5e9 0%, #6366f1 100%)',
                        borderRadius: 4,
                        transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        boxShadow: '0 0 15px rgba(14, 165, 233, 0.4)'
                    }} />
                </div>
            </div>

            {/* ── Board (image only) + Token ── */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                minHeight: 0,
                background: 'radial-gradient(circle at center, #1e293b 0%, #0a0f1e 100%)', // Consistent gradient
            }}>
                {/* Square wrapper — keeps the board image perfectly square */}
                <div style={{
                    position: 'relative',
                    /* Fill width, but cap height so it stays square */
                    width: '100%',
                    aspectRatio: '1 / 1',
                    maxHeight: '100%',
                    overflow: 'visible',
                    borderRadius: 16,
                    boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(56, 189, 248, 0.1)',
                    border: '6px solid #1e293b'
                }}>
                    {/* Board image — no grid, no SVG overlay */}
                    <img
                        src="./assets/s&l board.jpg"
                        alt="Snakes and Ladders Board"
                        draggable={false}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'fill',   /* stretch to fit the square exactly */
                            display: 'block',
                            userSelect: 'none',
                            pointerEvents: 'none',
                            borderRadius: 10,
                        }}
                    />

                    {/* Render Frozen Snakes Overlays — simple shield icon on head */}
                    {frozenSnakes && frozenSnakes.map(snakeId => {
                        const cellXY = getCellXY(snakeId);

                        return (
                            <div key={`frozen-${snakeId}`} style={{
                                position: 'absolute',
                                left: `${cellXY.x}%`,
                                bottom: `${cellXY.y}%`,
                                width: '10%',
                                height: '10%',
                                zIndex: 12,
                                pointerEvents: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <div style={{
                                    background: 'rgba(15, 23, 42, 0.95)',
                                    borderRadius: '50%',
                                    width: '85%',
                                    height: '85%',
                                    border: '2px solid #38bdf8',
                                    boxShadow: '0 0 20px rgba(56, 189, 248, 0.7)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    animation: 'shieldPulse 2s ease-in-out infinite'
                                }}>
                                    <Shield size={16} color="#38bdf8" strokeWidth={3} />
                                </div>
                            </div>
                        );
                    })}

                    {/* Player token — absolutely on top of the image */}
                    <div style={{
                        position: 'absolute',
                        left: `${tokenLeft}%`,
                        bottom: `${tokenBottom}%`,
                        transform: 'translateX(-50%)',
                        transition: isMoving
                            ? 'left 0.4s cubic-bezier(0.34,1.56,0.64,1), bottom 0.4s cubic-bezier(0.34,1.56,0.64,1)'
                            : 'none',
                        zIndex: 15,
                        pointerEvents: 'none',
                    }}>
                        {/* 2D Player Character */}
                        <div style={{
                            position: 'relative',
                            width: 64,
                            height: 96,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            marginBottom: -18, // Pulls the base down onto the line to avoid 'floating'
                        }}>
                            <img
                                src="./assets/pawn-player.png"
                                alt="Player"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    display: 'block',
                                    filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.5))'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Controls ── */}
            <div style={{
                flexShrink: 0,
                padding: '32px 16px',
                paddingBottom: 'max(40px, env(safe-area-inset-bottom, 32px))',
                background: 'rgba(15, 23, 42, 0.6)', // Semi-transparent control area
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                borderTop: '1px solid rgba(255,255,255,0.08)'
            }}>
                {/* Dice Glow Effect */}
                {!isMoving && !isRolling && (
                    <div style={{
                        position: 'absolute',
                        width: 140,
                        height: 140,
                        top: -10,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%)',
                        animation: 'glowPulse 2s infinite',
                        zIndex: 1
                    }} />
                )}

                {/* ADVANCED 3D CUBE DICE */}
                <div
                    onClick={handleRoll}
                    style={{
                        width: 90,
                        height: 90,
                        perspective: 1000,
                        cursor: (isMoving || isRolling) ? 'not-allowed' : 'pointer',
                        zIndex: 10,
                        position: 'relative',
                        margin: '0 auto',
                        /* Container for the cube */
                        transform: `scale(${isRolling ? 1.1 : 1})`,
                        transition: 'transform 0.3s ease'
                    }}
                >
                    <div id="cube" style={{
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        transformStyle: 'preserve-3d',
                        transition: isRolling ? 'none' : 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        animation: isRolling ? 'rollCubeFree 0.6s linear infinite' : 'none',
                        transform: !isRolling ? (
                            lastDice === 1 ? 'rotateX(0deg) rotateY(0deg)' :
                                lastDice === 2 ? 'rotateX(180deg) rotateY(0deg)' :
                                    lastDice === 3 ? 'rotateX(0deg) rotateY(-90deg)' :
                                        lastDice === 4 ? 'rotateX(0deg) rotateY(90deg)' :
                                            lastDice === 5 ? 'rotateX(-90deg) rotateY(0deg)' :
                                                lastDice === 6 ? 'rotateX(90deg) rotateY(0deg)' :
                                                    'rotateX(0deg) rotateY(0deg)' // Default to flat 1
                        ) : undefined
                    }}>
                        {/* 6 FACES */}
                        {[
                            { name: 'front', rot: 'rotateX(0deg)', pips: [4] },
                            { name: 'back', rot: 'rotateX(-180deg)', pips: [0, 8] },
                            { name: 'right', rot: 'rotateY(90deg)', pips: [0, 4, 8] },
                            { name: 'left', rot: 'rotateY(-90deg)', pips: [0, 2, 6, 8] },
                            { name: 'top', rot: 'rotateX(90deg)', pips: [0, 2, 4, 6, 8] },
                            { name: 'bottom', rot: 'rotateX(-90deg)', pips: [0, 3, 6, 2, 5, 8] }
                        ].map((face, index) => (
                            <div key={face.name} style={{
                                position: 'absolute',
                                width: 90,
                                height: 90,
                                background: '#fff',
                                border: '1px solid #e2e8f0',
                                borderRadius: 12,
                                transform: `${face.rot} translateZ(45px)`,
                                display: 'grid',
                                gridTemplate: 'repeat(3, 1fr) / repeat(3, 1fr)',
                                padding: 12,
                                boxSizing: 'border-box',
                                boxShadow: 'inset 0 0 15px rgba(0,0,0,0.1)',
                                backfaceVisibility: 'hidden'
                            }}>
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} style={{
                                        width: 14,
                                        height: 14,
                                        background: i === 4 && index === 0 ? '#2563eb' : (i === 4 && index === 4) ? '#2563eb' : '#1e3a8a',
                                        borderRadius: '50%',
                                        margin: 'auto',
                                        opacity: face.pips.includes(i) ? 1 : 0,
                                        boxShadow: 'inset 0 2px 2px rgba(0,0,0,0.3)'
                                    }} />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hint Text */}
                <div style={{
                    marginTop: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    zIndex: 5
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        opacity: (isMoving || isRolling) ? 0.3 : 1,
                        animation: (!isMoving && !isRolling) ? 'pulseText 2s infinite' : 'none'
                    }}>
                        <div style={{ width: 30, height: 1, background: 'linear-gradient(to right, transparent, #38bdf8)' }} />
                        <span style={{
                            fontSize: 13,
                            fontWeight: 900,
                            color: '#f8fafc',
                            letterSpacing: '0.25em',
                            textShadow: '0 0 10px rgba(56, 189, 248, 0.3)'
                        }}>
                            {(isMoving || isRolling) ? 'PLEASE WAIT' : 'TAP TO ROLL'}
                        </span>
                        <div style={{ width: 30, height: 1, background: 'linear-gradient(to left, transparent, #38bdf8)' }} />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes glowPulse {
                    0%, 100% { transform: scale(1); opacity: 0.2; }
                    50% { transform: scale(1.6); opacity: 0.5; }
                }
                @keyframes pulseText {
                    0%, 100% { opacity: 0.6; transform: scale(0.98); }
                    50% { opacity: 1; transform: scale(1.02); }
                }
                @keyframes shieldPulse {
                    0%, 100% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 30px rgba(56, 189, 248, 0.9); }
                }
                @keyframes rollCubeFree {
                    0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
                    100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
                }
            `}</style>
        </div>
    );
};

export default GameScreen;
