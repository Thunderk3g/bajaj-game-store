import { memo, useMemo, useState } from 'react';
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

/* ─────────────────────────────────────────────────────────────────────────────
   Info Icon — tooltip opens DOWNWARD to avoid header overlap
───────────────────────────────────────────────────────────────────────────── */
const GAME_RULES = [
    { emoji: '🎯', text: 'Place each income pillar once per row & column.' },
    { emoji: '🚫', text: 'No duplicate pillars in any row or column.' },
    { emoji: '🔒', text: 'Pre-filled cells are locked — cannot be changed.' },
    { emoji: '↩️', text: 'Double-tap a placed pillar to remove it.' },
    { emoji: '⏱️', text: 'Complete the board before time runs out!' },
];

function InfoIcon() {
    const [visible, setVisible] = useState(false);

    return (
        <div
            style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
            onFocus={() => setVisible(true)}
            onBlur={() => setVisible(false)}
        >
            {/* Circular ℹ button */}
            <button
                aria-label="Show game rules"
                aria-expanded={visible}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '1.1rem',
                    height: '1.1rem',
                    borderRadius: '50%',
                    background: visible ? 'rgba(249,115,22,0.28)' : 'rgba(249,115,22,0.15)',
                    border: '1.5px solid rgba(249,115,22,0.7)',
                    color: '#f97316',
                    fontSize: '0.6rem',
                    fontWeight: 900,
                    lineHeight: 1,
                    cursor: 'pointer',
                    padding: 0,
                    flexShrink: 0,
                    outline: 'none',
                    transition: 'box-shadow 0.2s, background 0.2s',
                    boxShadow: visible ? '0 0 10px rgba(249,115,22,0.6)' : 'none',
                    fontFamily: 'Georgia, serif',
                    fontStyle: 'italic',
                }}
            >
                i
            </button>

            {/* Tooltip — opens DOWNWARD below the timer bar */}
            {visible && (
                <div
                    role="tooltip"
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',   // ← below the icon
                        left: 0,
                        zIndex: 9999,
                        width: '13.5rem',
                        background: 'linear-gradient(140deg, #0d1b3e 0%, #1a2f56 100%)',
                        border: '1.5px solid rgba(249,115,22,0.55)',
                        borderRadius: '0.9rem',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(249,115,22,0.12)',
                        padding: '0.7rem 0.85rem',
                        pointerEvents: 'none',
                        animation: 'tooltipFadeIn 0.18s ease forwards',
                    }}
                >
                    {/* Upward arrow */}
                    <div style={{
                        position: 'absolute',
                        top: '-7px',
                        left: '0.55rem',
                        width: 0,
                        height: 0,
                        borderLeft: '7px solid transparent',
                        borderRight: '7px solid transparent',
                        borderBottom: '7px solid rgba(249,115,22,0.55)',
                    }} />

                    {/* Title */}
                    <div style={{
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        color: '#f97316',
                        letterSpacing: '0.07em',
                        textTransform: 'uppercase',
                        marginBottom: '0.4rem',
                        paddingBottom: '0.3rem',
                        borderBottom: '1px solid rgba(249,115,22,0.22)',
                    }}>
                        📋 How to Play
                    </div>

                    {/* Rules list */}
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.28rem' }}>
                        {GAME_RULES.map((rule, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.38rem', fontSize: '0.58rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                                <span style={{ fontSize: '0.65rem', flexShrink: 0 }}>{rule.emoji}</span>
                                <span>{rule.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

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
                    <InfoIcon />
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
    return (
        <div style={{ position: 'relative', width: '100%', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at center, #1e3a5f 0%, #0d1b3e 100%)' }}>
            <ConfettiBackground />

            {/* Full-height card — centered mobile-width column */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                width: '100%',
                maxWidth: '430px',
                height: '100dvh',
                display: 'flex',
                flexDirection: 'column',
                background: '#0d1b3e',
                border: '2px solid #f97316',
                boxShadow: '0 0 20px rgba(249,115,22,0.15), inset 0 0 20px rgba(249,115,22,0.05)',
                overflow: 'hidden', // keep contents clipped to card
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
                        <span>🏦</span><span>🏠</span><span>💰</span><span>🏥</span><span>✈️</span>
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
        </div>
    );
});

export default GamePage;
