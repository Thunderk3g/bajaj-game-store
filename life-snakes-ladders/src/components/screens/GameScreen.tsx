import React, { useState } from 'react';
import { Shield, Dice5 } from 'lucide-react';
import { getCellXY } from '../../features/GameLogic';

interface GameScreenProps {
    playerPosition: number;
    hasShield: boolean;
    onRoll: () => void;
    isMoving: boolean;
    lastDice: number;
    message: string;
}

const DICE_FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

const GameScreen: React.FC<GameScreenProps> = ({
    playerPosition,
    hasShield,
    onRoll,
    isMoving,
    lastDice,
    message
}) => {
    const [isRolling, setIsRolling] = useState(false);

    const handleRoll = () => {
        if (isMoving || isRolling) return;
        setIsRolling(true);
        setTimeout(() => {
            setIsRolling(false);
            onRoll();
        }, 600);
    };

    // getCellXY returns: x = left%, y = bottom% (each cell is 10% × 10%)
    // Add 5% to center the token within its cell
    const { x, y } = getCellXY(playerPosition);
    const tokenLeft = x + 5;
    const tokenBottom = y + 5;

    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: '#0a0f1e',
            overflow: 'hidden',
        }}>

            {/* ── HUD Bar ── */}
            <div style={{
                flexShrink: 0,
                background: 'linear-gradient(135deg, #0066B2 0%, #004A80 100%)',
                padding: '10px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#fff',
                boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                zIndex: 20,
            }}>
                {/* Shield badge */}
                <div>
                    {hasShield ? (
                        <div style={{
                            background: 'rgba(255,255,255,0.18)',
                            borderRadius: 20,
                            padding: '5px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 11,
                            fontWeight: 800,
                            letterSpacing: '0.1em',
                        }}>
                            <Shield size={13} />
                            PROTECTED
                        </div>
                    ) : (
                        <div style={{
                            background: 'rgba(255,102,0,0.22)',
                            borderRadius: 20,
                            padding: '5px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 11,
                            fontWeight: 800,
                            letterSpacing: '0.1em',
                            color: '#FFB380',
                        }}>
                            <Shield size={13} />
                            UNPROTECTED
                        </div>
                    )}
                </div>

                {/* Position counter */}
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.65, margin: '0 0 1px' }}>Square</p>
                    <p style={{ fontSize: 22, fontWeight: 900, margin: 0, lineHeight: 1 }}>
                        {playerPosition}
                        <span style={{ fontSize: 12, opacity: 0.45, fontWeight: 600 }}>/100</span>
                    </p>
                </div>
            </div>

            {/* ── Board (image only) + Token ── */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                minHeight: 0,
            }}>
                {/* Square wrapper — keeps the board image perfectly square */}
                <div style={{
                    position: 'relative',
                    /* Fill width, but cap height so it stays square */
                    width: '100%',
                    aspectRatio: '1 / 1',
                    maxHeight: '100%',
                    overflow: 'visible',
                    borderRadius: 4,
                    boxShadow: '0 4px 32px rgba(0,102,178,0.30)',
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
                            borderRadius: 4,
                        }}
                    />

                    {/* Player token — absolutely on top of the image */}
                    <div style={{
                        position: 'absolute',
                        left: `${tokenLeft}%`,
                        bottom: `${tokenBottom}%`,
                        transform: 'translate(-50%, 50%)',
                        transition: isMoving
                            ? 'left 0.22s cubic-bezier(0.34,1.56,0.64,1), bottom 0.22s cubic-bezier(0.34,1.56,0.64,1)'
                            : 'none',
                        zIndex: 10,
                        pointerEvents: 'none',
                    }}>
                        {/* Glow ring */}
                        <div style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: hasShield
                                ? 'radial-gradient(circle, #60A5FA 0%, #2563EB 80%)'
                                : 'radial-gradient(circle, #FF8533 0%, #CC4400 80%)',
                            boxShadow: hasShield
                                ? '0 0 12px 4px rgba(96,165,250,0.85), 0 2px 6px rgba(0,0,0,0.5)'
                                : '0 0 12px 4px rgba(255,102,0,0.85), 0 2px 6px rgba(0,0,0,0.5)',
                            border: '2.5px solid rgba(255,255,255,0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            animation: 'tokenPulse 1.8s ease-in-out infinite',
                        }}>
                            {hasShield && <Shield size={12} color="#fff" />}
                        </div>
                        {/* Ground shadow */}
                        <div style={{
                            width: 14,
                            height: 3,
                            background: 'rgba(0,0,0,0.45)',
                            borderRadius: '50%',
                            margin: '2px auto 0',
                            filter: 'blur(2px)',
                        }} />
                    </div>
                </div>
            </div>

            {/* ── Controls ── */}
            <div style={{
                flexShrink: 0,
                padding: '10px 16px',
                paddingBottom: 'max(14px, env(safe-area-inset-bottom, 14px))',
                background: 'linear-gradient(to top, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.70) 100%)',
            }}>
                {/* Message */}
                <div style={{
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: 12,
                    padding: '8px 14px',
                    marginBottom: 10,
                    textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.07)',
                }}>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)', margin: 0, fontStyle: 'italic' }}>"{message}"</p>
                </div>

                {/* Dice + Roll */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {/* Dice display */}
                    <div style={{
                        width: 56,
                        height: 56,
                        background: 'rgba(255,255,255,0.07)',
                        border: '1.5px solid rgba(255,255,255,0.14)',
                        borderRadius: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        animation: isRolling ? 'spinDice 0.5s linear infinite' : 'none',
                    }}>
                        {lastDice > 0 && !isRolling
                            ? <span style={{ fontSize: 32, lineHeight: 1 }}>{DICE_FACES[lastDice]}</span>
                            : <Dice5 size={26} color="rgba(255,255,255,0.18)" />
                        }
                    </div>

                    {/* Roll button */}
                    <button
                        onClick={handleRoll}
                        disabled={isMoving || isRolling}
                        style={{
                            flex: 1,
                            height: 56,
                            background: (isMoving || isRolling)
                                ? 'rgba(255,255,255,0.08)'
                                : 'linear-gradient(135deg, #0066B2 0%, #1A56DB 100%)',
                            color: '#fff',
                            fontFamily: 'inherit',
                            fontSize: 16,
                            fontWeight: 900,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            border: 'none',
                            borderRadius: 14,
                            cursor: (isMoving || isRolling) ? 'not-allowed' : 'pointer',
                            opacity: (isMoving || isRolling) ? 0.5 : 1,
                            boxShadow: (isMoving || isRolling) ? 'none' : '0 4px 20px rgba(0,102,178,0.4)',
                            transition: 'all 0.2s',
                        }}
                    >
                        {isRolling ? 'ROLLING…' : isMoving ? 'MOVING…' : '🎲 ROLL DICE'}
                    </button>
                </div>
            </div>

            {/* Branding */}
            <div style={{
                textAlign: 'center',
                padding: '6px 0',
                fontSize: 8,
                fontWeight: 800,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.2)',
            }}>
                Bajaj Allianz Life
            </div>

            <style>{`
                @keyframes tokenPulse {
                    0%, 100% { box-shadow: ${hasShield ? '0 0 12px 4px rgba(96,165,250,0.85)' : '0 0 12px 4px rgba(255,102,0,0.85)'}, 0 2px 6px rgba(0,0,0,0.5); }
                    50%       { box-shadow: ${hasShield ? '0 0 20px 8px rgba(96,165,250,0.6)' : '0 0 20px 8px rgba(255,102,0,0.6)'}, 0 2px 6px rgba(0,0,0,0.5); }
                }
                @keyframes spinDice {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default GameScreen;
