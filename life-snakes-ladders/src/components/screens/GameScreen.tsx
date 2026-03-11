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
            height: '100dvh', /* Changed to 100dvh */
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
                {/* Position counter - Centered */}
                <div style={{ textAlign: 'center', width: '100%' }}>
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
                                    background: '#004A80', /* Darker blue, fully opaque to block the head */
                                    borderRadius: '50%',
                                    width: '90%',  /* Large enough to fully block the head within the cell */
                                    height: '90%',
                                    border: '2px solid rgba(255, 255, 255, 0.8)',
                                    boxShadow: '0 0 15px rgba(56, 189, 248, 0.9)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    animation: 'shieldPulse 1.5s ease-in-out infinite'
                                }}>
                                    <Shield size={18} color="#fff" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' }} />
                                </div>
                            </div>
                        );
                    })}

                    {/* Player token — absolutely on top of the image */}
                    <div style={{
                        position: 'absolute',
                        left: `${tokenLeft}%`,
                        bottom: `${tokenBottom}%`,
                        transform: 'translate(-50%, 50%)',
                        transition: isMoving
                            ? 'left 0.4s cubic-bezier(0.34,1.56,0.64,1), bottom 0.4s cubic-bezier(0.34,1.56,0.64,1)'
                            : 'none',
                        zIndex: 15,
                        pointerEvents: 'none',
                    }}>
                        {/* 2D Player Character */}
                        <div style={{
                            position: 'relative',
                            width: 60,  /* Substantially increased size */
                            height: 90, /* Substantially increased size */
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            marginBottom: -12 /* Better grounding for the larger character */
                        }}>
                            <img
                                src="./assets/pawn-player.png"
                                alt="Player"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    display: 'block',
                                    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
                                }}
                            />
                        </div>
                        {/* Ground shadow - widened for larger character */}
                        <div style={{
                            width: 28,
                            height: 4,
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '50%',
                            margin: '-2px auto 0',
                            filter: 'blur(2.5px)',
                        }} />
                    </div>
                </div>
            </div>

            {/* ── Controls ── */}
            <div style={{
                flexShrink: 0,
                padding: 'clamp(8px, 2vh, 12px) 16px',
                paddingBottom: 'max(clamp(10px, 2vh, 14px), env(safe-area-inset-bottom, 14px))',
                background: 'linear-gradient(to top, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.70) 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                {/* 2D Premium Dice Wrapper */}
                <div style={{
                    width: 68,
                    height: 68,
                    background: '#fff',
                    borderRadius: 16,
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 -5px 0 rgba(226,232,240,1)',
                    border: '1px solid #e2e8f0',
                    transformOrigin: 'bottom center',
                    animation: isRolling ? 'shakeDice 0.4s ease-in-out infinite' : 'bounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}>
                    {lastDice > 0 && !isRolling ? (
                        <span style={{ fontSize: 56, lineHeight: 1, color: '#1A56DB', marginTop: '-6px' }}>
                            {DICE_FACES[lastDice]}
                        </span>
                    ) : (
                        <Dice5 size={34} color={isRolling ? '#94a3b8' : '#1A56DB'} style={{
                            animation: isRolling ? 'spinDice 0.6s linear infinite' : 'none'
                        }} />
                    )}
                </div>

                {/* Message removed per user request */}

                {/* Roll button */}
                <button
                    onClick={handleRoll}
                    disabled={isMoving || isRolling}
                    style={{
                        width: '100%',
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

            {/* Branding removed per user request */}

            <style>{`
                @keyframes tokenPulse {
                    0%, 100% { box-shadow: 0 0 12px 4px rgba(255,102,0,0.85), 0 2px 6px rgba(0,0,0,0.5); }
                    50%      { box-shadow: 0 0 20px 8px rgba(255,102,0,0.6), 0 2px 6px rgba(0,0,0,0.5); }
                }
                @keyframes shieldPulse {
                    0%, 100% { box-shadow: 0 0 12px 3px rgba(56, 189, 248, 0.8), 0 2px 5px rgba(0,0,0,0.4); }
                    50%      { box-shadow: 0 0 22px 8px rgba(56, 189, 248, 0.6), 0 2px 5px rgba(0,0,0,0.4); }
                }
                @keyframes bounceIn {
                    0% { transform: scale(0.8) translateY(10px); opacity: 0; }
                    100% { transform: scale(1) translateY(0); opacity: 1; }
                }
                @keyframes shakeDice {
                    0%, 100% { transform: rotate(0deg) translateY(0); }
                    25% { transform: rotate(-8deg) translateY(-4px); }
                    75% { transform: rotate(8deg) translateY(-4px); }
                }
                @keyframes spinDice {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @keyframes iceShimmer {
                    0%, 100% { background-position: -100% 0; opacity: 0.6; }
                    50% { background-position: 200% 0; opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default GameScreen;
