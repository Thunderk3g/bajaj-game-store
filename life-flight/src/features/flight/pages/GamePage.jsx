import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext.jsx';
import { useFlightEngine } from '../hooks/useFlightEngine.js';
import { CANVAS_W, CANVAS_H, MAX_LIVES, MAX_REF_SCORE } from '../constants/gameConstants.js';
import HitOverlay from '../components/HitOverlay.jsx';

export default function GamePage() {
    const { state, dispatch, ACTIONS, PHASES } = useGame();
    const navigate = useNavigate();

    const [isActive, setIsActive] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [showHit, setShowHit] = useState(false);
    const [hitHurdle, setHitHurdle] = useState(null);
    const [scoreDisplay, setScoreDisplay] = useState(0);
    const [livesDisplay, setLivesDisplay] = useState(MAX_LIVES);
    const [shake, setShake] = useState(false);

    const livesRef = useRef(MAX_LIVES);
    const scoreRef = useRef(0);
    const hitLockRef = useRef(false);

    // Redirect if not in playing phase
    useEffect(() => {
        if (state.phase === PHASES.GAMEOVER) navigate('/gameover');
        else if (state.phase === PHASES.LANDING) navigate('/');
    }, [state.phase, navigate, PHASES]);

    useEffect(() => {
        livesRef.current = MAX_LIVES;
        scoreRef.current = 0;
        setLivesDisplay(MAX_LIVES);
        setScoreDisplay(0);
        setIsActive(true);
        setGameStarted(false);
        setCountdown(3);
        return () => setIsActive(false);
    }, []);

    const handleScorePoint = useCallback((newScore) => {
        scoreRef.current = newScore;
        setScoreDisplay(newScore);
        dispatch({ type: ACTIONS.ADD_SCORE });
    }, [dispatch, ACTIONS]);

    const handleHit = useCallback((hurdle) => {
        if (hitLockRef.current) return;
        hitLockRef.current = true;

        setIsActive(false);
        setHitHurdle(hurdle);
        setShake(true);
        setTimeout(() => setShake(false), 200);

        const newLives = livesRef.current - 1;
        livesRef.current = newLives;
        setLivesDisplay(newLives);

        dispatch({ type: ACTIONS.LOSE_LIFE });

        if (newLives <= 0) {
            setTimeout(() => navigate('/gameover'), 800);
        } else {
            setShowHit(true);
        }
    }, [dispatch, ACTIONS, navigate]);

    const handleRetry = useCallback(() => {
        setShowHit(false);
        setHitHurdle(null);
        hitLockRef.current = false;
        setGameStarted(false);
        setCountdown(3);
        setTimeout(() => setIsActive(true), 100);
    }, []);

    const { canvasRef, handleFlap, currentHurdle, microMsg } = useFlightEngine({
        isActive,
        gameStarted,
        onScorePoint: handleScorePoint,
        onHit: handleHit,
    });

    useEffect(() => {
        let timer;
        if (isActive && !gameStarted && !showHit) {
            if (countdown > 0) {
                timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            } else if (countdown === 0) {
                setGameStarted(true);
                handleFlap();
            }
        }
        return () => clearTimeout(timer);
    }, [isActive, gameStarted, countdown, showHit, handleFlap]);

    const pct = Math.min(Math.round((scoreDisplay / MAX_REF_SCORE) * 100), 100);

    const handleTap = useCallback((e) => {
        if (e && e.type === 'pointerdown') {
            // Optionally prevent default if needed
        }
        if (!showHit && isActive && gameStarted) handleFlap();
    }, [showHit, isActive, gameStarted, handleFlap]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleTap();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleTap]);

    return (
        <div
            className="absolute inset-0 flex flex-col items-center justify-start overflow-hidden"
            style={{ background: '#0A2540', touchAction: 'none' }}
            onPointerDown={handleTap}
        >
            {/* ── Canvas (Full Screen) ── */}
            <div className={`absolute inset-0 ${!gameStarted ? 'opacity-80' : 'opacity-100'} transition-opacity pointer-events-none`}>
                <canvas
                    ref={canvasRef}
                    width={CANVAS_W}
                    height={CANVAS_H}
                    className="w-full h-full object-fill block"
                />
            </div>

            {/* ── Start Countdown Overlay ── */}
            {!gameStarted && !showHit && isActive && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none">
                    <div
                        key={countdown}
                        className="text-white font-black text-9xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] animate-[ping_1s_ease-out_reverse]"
                        style={{ textShadow: '0 4px 15px rgba(255,140,0,0.8)' }}
                    >
                        {countdown > 0 ? countdown : 'FLY!'}
                    </div>
                </div>
            )}

            {/* ── HUD Dashboard (Bottom) ── */}
            <div
                className={`absolute bottom-0 left-0 right-0 z-20 px-4 pb-6 pt-3 ${shake ? 'screen-shake' : ''}`}
                style={{
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(8px)',
                    borderTop: '1px solid rgba(255,255,255,0.15)',
                    pointerEvents: 'none'
                }}
            >
                <div style={{ pointerEvents: 'auto' }} onClick={(e) => e.stopPropagation()}>
                    {/* Top Row: Label + Lives */}
                    <div className="flex items-center justify-between mb-1">
                        <span
                            className="font-black tracking-widest"
                            style={{ fontSize: 10, color: '#90E0EF', textTransform: 'uppercase', letterSpacing: '0.18em', opacity: 0.9 }}
                        >
                            PREPAREDNESS SCORE
                        </span>
                        <div className="flex gap-1">
                            {Array.from({ length: MAX_LIVES }).map((_, i) => (
                                <span key={i} style={{ fontSize: 22 }}>
                                    {i < livesDisplay ? '❤️' : '🖤'}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Mid Row: Score + Badge */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-3">
                            <span className="font-black" style={{ fontSize: 42, color: '#ffffff', lineHeight: 1 }}>
                                {scoreDisplay}
                            </span>
                            <span className="font-black uppercase" style={{ fontSize: 14, color: '#00B4D8' }}>
                                {pct}% Prepared
                            </span>
                        </div>

                        {currentHurdle && (
                            <div className="badge-pop">
                                <div
                                    className="rounded-lg px-3 py-1.5 flex items-center gap-2"
                                    style={{
                                        background: currentHurdle.color + '33',
                                        border: `1px solid ${currentHurdle.color}77`,
                                    }}
                                >
                                    <div
                                        className="rounded-full"
                                        style={{ width: 6, height: 6, background: currentHurdle.color }}
                                    />
                                    <span className="font-black uppercase" style={{ fontSize: 10, color: currentHurdle.color }}>
                                        {currentHurdle.name}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Micro Message ── */}
            {microMsg && (
                <div className="absolute bottom-32 left-0 right-0 flex justify-center z-20 pointer-events-none">
                    <div
                        className="fade-in-out rounded-2xl px-5 py-3"
                        style={{
                            background: 'rgba(0,180,216,0.25)',
                            border: '1px solid rgba(0,180,216,0.5)',
                            backdropFilter: 'blur(12px)',
                        }}
                    >
                        <p className="font-semibold text-center text-white" style={{ fontSize: 14 }}>
                            {microMsg}
                        </p>
                    </div>
                </div>
            )}

            {/* ── Tap to fly hint ── */}
            {isActive && gameStarted && scoreDisplay === 0 && !showHit && (
                <div className="absolute bottom-40 left-0 right-0 flex justify-center z-20 pointer-events-none">
                    <p className="font-medium animate-pulse text-white/60" style={{ fontSize: 14 }}>
                        👆 Tap to fly!
                    </p>
                </div>
            )}

            {/* ── Hit overlay ── */}
            {showHit && hitHurdle && (
                <HitOverlay
                    hurdle={hitHurdle}
                    livesLeft={livesDisplay}
                    onRetry={handleRetry}
                />
            )}
        </div>
    );
}
