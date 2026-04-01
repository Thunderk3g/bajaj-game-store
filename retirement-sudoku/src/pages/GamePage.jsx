import { memo, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import DndGameContext from '../features/game/components/DndGameContext.jsx';
import GameBoard from '../features/game/components/GameBoard.jsx';
import BlockTray from '../features/game/components/BlockTray.jsx';
import WinModal from '../features/game/components/WinModal.jsx';
import TimeUpModal from '../features/game/components/TimeUpModal.jsx';
import { useTimer } from '../features/game/hooks/useGameState.js';
import { GAME_DURATION } from '../constants/game.js';

/* ─────────────────────────────────────────────────────────────────────────────
   Confetti Background
───────────────────────────────────────────────────────────────────────────── */
const ConfettiBackground = memo(() => {
    const pieces = useMemo(() => {
        return Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 5}s`,
            colorClass: ['bg-orange-500', 'c-blue', 'c-gold', 'c-teal'][Math.floor(Math.random() * 4)],
        }));
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {pieces.map((p) => (
                <div
                    key={p.id}
                    className={`confetti-piece ${p.colorClass}`}
                    style={{ left: p.left, top: -20, animationDelay: p.animationDelay, animationDuration: p.animationDuration }}
                />
            ))}
        </div>
    );
});

const GAME_RULES = [
    { emoji: '🎯', text: 'Place each income pillar once per row & column.' },
    { emoji: '🚫', text: 'No duplicate pillars in any row or column.' },
    { emoji: '🔒', text: 'Pre-filled cells are locked — cannot be changed.' },
    { emoji: '↩️', text: 'Double-tap a placed pillar to remove it.' },
    { emoji: '⏱️', text: 'Complete the board before time runs out!' },
];

/* ─────────────────────────────────────────────────────────────────────────────
   How to Play Modal — pops up on start
───────────────────────────────────────────────────────────────────────────── */
const HowToPlayModal = memo(({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1.25rem',
                        backgroundColor: 'rgba(13, 27, 62, 0.85)',
                        backdropFilter: 'blur(8px)',
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 30 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        style={{
                            backgroundColor: '#0d1b3e',
                            padding: '1.75rem',
                            borderRadius: '1.5rem',
                            border: '3px solid #f97316',
                            boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 30px rgba(249,115,22,0.15)',
                            width: '100%',
                            maxWidth: '360px',
                            textAlign: 'center',
                            position: 'relative',
                        }}
                    >
                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'rgba(255,115,22,0.1)',
                                border: 'none',
                                color: '#f97316',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                            }}
                        >
                            <X size={20} strokeWidth={3} />
                        </button>

                        <div style={{ fontSize: '2.75rem', marginBottom: '0.75rem', filter: 'drop-shadow(0 0 10px rgba(249,115,22,0.3))' }}>🎮</div>
                        <h2 style={{
                            color: '#ffffff',
                            fontSize: '1.35rem',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '0.12rem',
                            marginBottom: '1.25rem',
                            lineHeight: 1.1
                        }}>
                            How to <span style={{ color: '#f97316' }}>Play</span>
                        </h2>

                        <div style={{
                            textAlign: 'left',
                            marginBottom: '1.75rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.85rem',
                            background: 'rgba(0,0,0,0.25)',
                            padding: '1rem',
                            borderRadius: '1rem',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            {GAME_RULES.map((rule, i) => (
                                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{rule.emoji}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.4, fontWeight: 500 }}>{rule.text}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={onClose}
                            style={{
                                width: '100%',
                                padding: '1.1rem',
                                backgroundColor: '#f97316',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '1rem',
                                fontSize: '1rem',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                cursor: 'pointer',
                                boxShadow: '0 4px 0 #c2410c',
                                transition: 'all 0.1s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                            onPointerDown={e => (e.currentTarget.style.transform = 'translateY(2px)', e.currentTarget.style.boxShadow = '0 2px 0 #c2410c')}
                            onPointerUp={e => (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 4px 0 #c2410c')}
                        >
                            Got It! Let's Go
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
});

/* ─────────────────────────────────────────────────────────────────────────────
   Timer Bar
───────────────────────────────────────────────────────────────────────────── */
function TimerBar() {
    const { timeRemaining, formatted } = useTimer();
    const pct = Math.max(0, (timeRemaining / GAME_DURATION) * 100);

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Left: label + info icon — container is overflow:visible so tooltip shows */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'visible', position: 'relative' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' }}>
                        Time Left
                    </span>
                </div>
                {/* Right: countdown */}
                <span style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'monospace', color: '#f97316', filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.8))' }}>
                    {formatted}
                </span>
            </div>
            {/* Progress bar */}
            <div style={{ width: '100%', height: '0.45rem', background: '#1f2937', borderRadius: '99px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: '#f97316', borderRadius: '99px', boxShadow: '0 0 10px #f97316', transition: 'width 1s linear' }} />
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main Game Page — full-screen layout on every device
───────────────────────────────────────────────────────────────────────────── */
const GamePage = memo(function GamePage() {
    const [showHowToPlay, setShowHowToPlay] = useState(true);

    return (
        <div style={{ position: 'relative', width: '100%', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at center, #1e3a5f 0%, #0d1b3e 100%)' }}>
            <ConfettiBackground />

            {/* Full-height card — centered mobile-width column */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                width: '100%',
                maxWidth: '430px',
                minHeight: '100dvh', // Changed from height to minHeight
                display: 'flex',
                flexDirection: 'column',
                background: '#0d1b3e',
                border: '2px solid #f97316',
                boxShadow: '0 0 20px rgba(249,115,22,0.15), inset 0 0 20px rgba(249,115,22,0.05)',
                overflowY: 'auto', // Allow scrolling if grid is too tall
            }}>

                {/* ── 1. HEADER ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 'clamp(1rem, 4vw, 1.25rem)', fontWeight: 800, color: '#ffffff', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
                            Retirement Sudoku
                        </h1>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.65rem', color: 'rgba(147,197,253,0.7)', fontWeight: 500 }}>
                            Balance Your Retirement Pillars
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem', fontSize: 'clamp(1rem, 4vw, 1.25rem)', opacity: 0.9 }}>
                        <span>🏦</span><span>🏠</span><span>₹</span><span>🏥</span><span>✈️</span>
                    </div>
                </div>

                {/* ── 2. TIMER ── overflow:visible so tooltip isn't clipped */}
                <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.1)', flexShrink: 0, overflow: 'visible', position: 'relative', zIndex: 50 }}>
                    <TimerBar />
                </div>

                <DndGameContext>
                    {/* ── 3. GRID — flex:1 so it takes ALL remaining space ── */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(0.5rem, 2vw, 1rem)', background: 'rgba(0,0,0,0.05)', minHeight: 0 }}>
                        <GameBoard />
                    </div>

                    {/* ── 4. BLOCK TRAY ── */}
                    <div style={{ padding: '0.65rem 0.85rem 0.85rem', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>
                        <p style={{ margin: '0 0 0.5rem', fontSize: '0.58rem', fontWeight: 700, textAlign: 'center', color: 'rgba(147,197,253,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Select the Right Pillar for Happy Retirement
                        </p>
                        <BlockTray />
                    </div>
                </DndGameContext>
            </div>

            {/* Modals */}
            <WinModal />
            <TimeUpModal />
            <HowToPlayModal isOpen={showHowToPlay} onClose={() => setShowHowToPlay(false)} />
        </div>
    );
});

export default GamePage;
