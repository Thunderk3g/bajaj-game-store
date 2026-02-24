import { useState, useEffect, useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, X, Calendar, Star, Phone, Check } from 'lucide-react';
import { useGame } from '../features/game/context/GameContext.jsx';
import { GAME_PHASES } from '../features/game/context/gameReducer.js';

/* ─────────────────────────────────────────────────────────────────────────────
   SCORE SCENARIOS  — exactly 2, based on score value:
   score === 0  → Zero scenario  (time ran out, no cells filled correctly)
   score  > 0  → Success scenario (at least some correct placements)
───────────────────────────────────────────────────────────────────────────── */
function getScenario(score) {
    if (score === 0) {
        return {
            subheading: "Time's Up!",
            message: "You missed your chance to build a balanced retirement portfolio.",
            points: 0,
            starScore: 0, // Score is 0, so no stars
        };
    }

    // Dynamic stars based on remaining time (max 120s)
    let dynamicStars = 2; // Finishers get at least 2 stars
    if (score >= 90) dynamicStars = 5;
    else if (score >= 60) dynamicStars = 4;
    else if (score >= 30) dynamicStars = 3;

    return {
        subheading: 'Congrats!',
        message: 'You managed to build a balanced retirement portfolio in time.',
        points: score,
        starScore: dynamicStars,
    };
}


/* ─────────────────────────────────────────────────────────────────────────────
   Confetti — canvas-based, exactly like Scramble-Words Confetti.jsx
───────────────────────────────────────────────────────────────────────────── */
function Confetti() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const colors = ['#6B70E5', '#9B6FD8', '#48BB78', '#E53E3E', '#F6AD55', '#FC8181', '#f59e0b', '#0ea5e9'];
        const pieces = [];

        class Piece {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height - canvas.height;
                this.rotation = Math.random() * 360;
                this.size = Math.random() * 8 + 4;
                this.speed = Math.random() * 3 + 2;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.rotationSpeed = Math.random() * 5 - 2.5;
            }
            update() {
                this.y += this.speed;
                this.rotation += this.rotationSpeed;
                if (this.y > canvas.height) this.reset();
            }
            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate((this.rotation * Math.PI) / 180);
                ctx.fillStyle = this.color;
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
                ctx.restore();
            }
        }

        for (let i = 0; i < 100; i++) pieces.push(new Piece());

        let animId;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            pieces.forEach(p => { p.update(); p.draw(); });
            animId = requestAnimationFrame(animate);
        };
        animate();

        const stop = setTimeout(() => {
            cancelAnimationFrame(animId);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, 3000);

        const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        window.addEventListener('resize', onResize);

        return () => {
            cancelAnimationFrame(animId);
            clearTimeout(stop);
            window.removeEventListener('resize', onResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 100 }}
        />
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Score Shield — exactly like Scramble-Words ScoreShield.jsx
   Maps tier points (25/50/75/100) → displayed as tier emoji + points
───────────────────────────────────────────────────────────────────────────── */
function ScoreShield({ tier }) {
    const { starScore, points } = tier;

    // Glow matches score quality
    let glowColor = 'rgba(255,70,70,0.25)';
    if (starScore === 3) glowColor = 'rgba(255,165,0,0.25)';
    if (starScore >= 4) glowColor = 'rgba(0,200,100,0.25)';

    return (
        <div style={{ position: 'relative', width: '12rem', height: '14rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <svg
                viewBox="0 0 100 120"
                style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%',
                    filter: `drop-shadow(0 4px 6px rgba(0,0,0,0.25)) drop-shadow(0 0 15px ${glowColor})`,
                    overflow: 'visible',
                }}
            >
                <defs>
                    <linearGradient id="rShieldBorder" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FF9A00" />
                        <stop offset="100%" stopColor="#FF6A00" />
                    </linearGradient>
                    <linearGradient id="rShieldBg" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#1E3A8A" />
                        <stop offset="100%" stopColor="#0F2A5F" />
                    </linearGradient>
                </defs>
                <path
                    d="M50 5 L95 25 V55 C95 85 50 115 50 115 C50 115 5 85 5 55 V25 L50 5 Z"
                    fill="url(#rShieldBg)"
                    stroke="url(#rShieldBorder)"
                    strokeWidth="3"
                    strokeLinejoin="round"
                />
            </svg>

            {/* Content inside shield */}
            <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '0.5rem', gap: '0.75rem', transform: 'translateY(-8px)' }}>
                {/* Score number */}
                <div style={{ display: 'flex', alignItems: 'baseline', color: '#fff', fontWeight: 700, lineHeight: 1 }}>
                    <span style={{ fontSize: '3.5rem', letterSpacing: '-0.02em' }}>{points}</span>
                    <span style={{ fontSize: '1.5rem', opacity: 0.9, marginLeft: '2px' }}>pts</span>
                </div>

                {/* Stars — only shown when starScore > 0 */}
                {starScore > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={18}
                                fill={i < starScore ? '#FFB800' : 'rgba(255,255,255,0.2)'}
                                stroke="none"
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Booking Modal — ported from Scramble-Words BookingModal.jsx
───────────────────────────────────────────────────────────────────────────── */
function BookingModal({ isOpen, onClose, onSubmit, initialName, initialMobile }) {
    const [formData, setFormData] = useState({ name: initialName || '', mobile: initialMobile || '', date: '', time: '' });
    const [termsAccepted, setTermsAccepted] = useState(true);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateField = (f, v) => {
        setFormData(p => ({ ...p, [f]: v }));
        if (errors[f]) setErrors(p => ({ ...p, [f]: null }));
    };

    const validate = () => {
        const errs = {};
        if (!formData.name.trim()) errs.name = 'Name is required';
        else if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) errs.name = 'Letters only';
        if (!/^\d{10}$/.test(formData.mobile)) errs.mobile = 'Enter valid 10-digit number';
        if (!formData.date) errs.date = 'Date is required';
        if (!formData.time) errs.time = 'Time is required';
        if (!termsAccepted) errs.terms = 'Please accept the terms';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            if (onSubmit) onSubmit(formData);
        }, 800);
    };

    const todayStr = new Date().toISOString().split('T')[0];

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                style={{ background: '#fff', padding: '1.5rem', width: '100%', maxWidth: '22rem', position: 'relative', borderRadius: '0.5rem', border: '4px solid rgba(255,255,255,0.5)' }}
            >
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#f1f5f9', border: 'none', cursor: 'pointer', padding: '0.25rem', borderRadius: '0.25rem' }}>
                    <X size={18} color="#94a3b8" />
                </button>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem', color: '#FF8C00' }}>
                    <Calendar size={28} />
                </div>
                <h2 style={{ color: '#0066B2', fontWeight: 900, textAlign: 'center', marginBottom: '1.25rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Book a Convenient Slot
                </h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {/* Name */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Your Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => { if (/^[A-Za-z\s]*$/.test(e.target.value)) updateField('name', e.target.value); }}
                            placeholder="Full Name"
                            style={{ width: '100%', height: '2.75rem', border: `2px solid ${errors.name ? '#f87171' : '#e2e8f0'}`, background: '#f8fafc', padding: '0 1rem', fontSize: '0.875rem', fontWeight: 700, color: '#1e293b', outline: 'none', boxSizing: 'border-box' }}
                        />
                        {errors.name && <span style={{ fontSize: '0.625rem', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase' }}>{errors.name}</span>}
                    </div>

                    {/* Mobile */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Mobile Number</label>
                        <input
                            type="tel"
                            value={formData.mobile}
                            onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 10); updateField('mobile', v); }}
                            placeholder="9876543210"
                            style={{ width: '100%', height: '2.75rem', border: `2px solid ${errors.mobile ? '#f87171' : '#e2e8f0'}`, background: '#f8fafc', padding: '0 1rem', fontSize: '0.875rem', fontWeight: 700, color: '#1e293b', outline: 'none', boxSizing: 'border-box' }}
                        />
                        {errors.mobile && <span style={{ fontSize: '0.625rem', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase' }}>{errors.mobile}</span>}
                    </div>

                    {/* Date & Time */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Date</label>
                            <input type="date" min={todayStr} value={formData.date} onChange={e => updateField('date', e.target.value)}
                                style={{ width: '100%', height: '2.75rem', border: `2px solid ${errors.date ? '#f87171' : '#e2e8f0'}`, background: '#f8fafc', padding: '0 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#1e293b', outline: 'none', boxSizing: 'border-box' }}
                            />
                            {errors.date && <span style={{ fontSize: '0.6rem', color: '#ef4444', fontWeight: 700 }}>{errors.date}</span>}
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Time</label>
                            <select value={formData.time} onChange={e => updateField('time', e.target.value)}
                                style={{ width: '100%', height: '2.75rem', border: `2px solid ${errors.time ? '#f87171' : '#e2e8f0'}`, background: '#f8fafc', padding: '0 0.5rem', fontSize: '0.7rem', fontWeight: 700, color: '#1e293b', outline: 'none', boxSizing: 'border-box', appearance: 'none' }}
                            >
                                <option value="">Select Slot</option>
                                {[...Array(12)].map((_, i) => {
                                    const s = 9 + i, e2 = s + 1;
                                    const fmt = h => `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'PM' : 'AM'}`;
                                    const lbl = `${fmt(s)} - ${fmt(e2)}`;
                                    return <option key={s} value={lbl}>{lbl}</option>;
                                })}
                            </select>
                            {errors.time && <span style={{ fontSize: '0.6rem', color: '#ef4444', fontWeight: 700 }}>{errors.time}</span>}
                        </div>
                    </div>

                    {/* Terms */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: '#f8fafc', padding: '0.75rem', border: '2px solid #e2e8f0' }}>
                        <input type="checkbox" checked={termsAccepted} onChange={e => { setTermsAccepted(e.target.checked); if (errors.terms) setErrors(p => ({ ...p, terms: null })); }} style={{ marginTop: '2px', cursor: 'pointer' }} />
                        <label style={{ fontSize: '0.65rem', color: '#64748b', lineHeight: 1.4 }}>
                            I authorize Bajaj Life Insurance to contact me for this request, overriding DND registry.
                        </label>
                    </div>
                    {errors.terms && <div style={{ fontSize: '0.625rem', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase', textAlign: 'center' }}>{errors.terms}</div>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{ width: '100%', padding: '1rem', background: '#FF8C00', border: '2px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 900, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, boxShadow: '0 6px 0 #993D00', transition: 'all 0.15s' }}
                    >
                        {isSubmitting ? 'Confirming…' : 'Book a Slot'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ResultPage — full-screen page, exact clone of ResultScreen layout
───────────────────────────────────────────────────────────────────────────── */
const ResultPage = memo(function ResultPage() {
    const navigate = useNavigate();
    const { state, restartGame } = useGame();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState(null);

    // Guard: accessible only when game is WON or TIMEUP
    const isWon = state.phase === GAME_PHASES.WON;
    const isTimeUp = state.phase === GAME_PHASES.TIMEUP;
    const isEligible = isWon || isTimeUp;

    // ── 2-scenario logic ────────────────────────────────────────────────────
    // score: number of correctly placed cells (or points from state)
    // Use timeAtWin: null/0 means time ran out without solving → score = 0
    const score = (isWon && state.timeAtWin > 0) ? state.timeAtWin : 0;
    const isZeroScore = score === 0;
    const scenario = getScenario(score);

    // If user refreshes or lands here without finishing, redirect to intro
    useEffect(() => {
        if (!isEligible) navigate('/', { replace: true });
    }, [isEligible, navigate]);

    // Auto-dismiss toast
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(t);
    }, [toast]);

    if (!isEligible) return null;

    /* Share handler — Web Share API with clipboard fallback + in-app toast */
    const handleShare = async () => {
        const text = isZeroScore
            ? `I played Retirement Sudoku by Bajaj Life. Try it yourself: ${window.location.origin}`
            : `🎉 I just played Retirement Sudoku by Bajaj Life and scored ${scenario.points} pts! Try it yourself: ${window.location.origin}`;
        if (navigator.share) {
            try {
                await navigator.share({ title: 'Retirement Sudoku Score', text, url: window.location.origin });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    // Share failed, fallback to clipboard
                    try {
                        await navigator.clipboard.writeText(text);
                        setToast({ message: 'Result copied to clipboard!', type: 'success' });
                    } catch {
                        setToast({ message: 'Could not share. Please try again.', type: 'error' });
                    }
                }
            }
        } else {
            try {
                await navigator.clipboard.writeText(text);
                setToast({ message: 'Result copied to clipboard!', type: 'success' });
            } catch {
                setToast({ message: 'Sharing not supported on this browser.', type: 'error' });
            }
        }
    };

    /* BookingModal submit → /thank-you */
    const handleBookingSubmit = () => {
        setIsModalOpen(false);
        navigate('/thank-you');
    };

    const fullName = sessionStorage.getItem('sudokuUserName') || 'CHAMPION';
    const userName = fullName.split(' ')[0].toUpperCase() || 'CHAMPION';


    return (
        <div
            style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 55%, #0c1a2e 100%)' }}
        >
            <div
                className="w-full flex flex-col items-center justify-center px-4 py-2 text-center overflow-y-auto font-sans relative"
                style={{ maxWidth: '430px', minHeight: '100dvh' }}
            >
                {/* Confetti */}
                <Confetti />

                {/* Share button — top right */}
                <button
                    onClick={handleShare}
                    className="absolute right-4 top-4 p-2 text-white/80 hover:text-white transition-colors z-20"
                    title="Share Score"
                >
                    <Share2 className="w-5 h-5" />
                </button>

                {/* Main content — exactly like ResultScreen */}
                <div className="w-full max-w-xs flex flex-col items-center z-10">

                    {/* Greeting */}
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl font-extrabold text-white tracking-widest uppercase leading-none mt-2"
                    >
                        Hi {userName}!
                    </motion.h1>

                    <div className="h-3 shrink-0" />

                    {/* Subheading — "YOUR SCORE IS" row */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xs font-semibold text-white/80 tracking-widest uppercase"
                    >
                        YOUR <span className="text-orange-500 font-extrabold text-sm mx-1">SCORE</span> IS
                    </motion.div>

                    <div className="h-4 shrink-0" />

                    {/* Score Shield */}
                    <div className="relative transform scale-[0.65] min-[375px]:scale-75 origin-center -my-10 -translate-y-2">
                        <motion.div
                            initial={{ scale: 0, rotate: -12 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.25 }}
                        >
                            <ScoreShield tier={scenario} />
                        </motion.div>
                    </div>

                    <div className="h-3 shrink-0" />

                    {/* Subheading (Congrats! / Time's Up!) */}
                    <h2 className="text-xl font-bold text-white tracking-wide leading-tight">
                        {scenario.subheading}
                    </h2>

                    <div className="h-2 shrink-0" />

                    {/* Message below shield */}
                    <div className="w-full">
                        <p className="text-white/80 text-xs leading-tight px-2">
                            {scenario.message}
                        </p>
                    </div>

                    <div className="h-4 shrink-0" />

                    {/* Action buttons */}
                    <div className="w-full flex flex-col gap-3">

                        {/* SHARE */}
                        <motion.button
                            onClick={handleShare}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm uppercase tracking-wide rounded-xl shadow-sm flex items-center justify-center gap-2 border border-white/10 transition-all"
                        >
                            SHARE
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path d="M14 5V2L22 9L14 16V13C7 13 4 15 2 20C4 12 7 8 14 8V5Z" />
                            </svg>
                        </motion.button>

                        {/* Info card */}
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-blue-900/30 border border-white/10 rounded-lg p-2.5 mx-1 backdrop-blur-sm"
                        >
                            <p className="text-white/90 text-xs leading-tight font-medium">
                                To know more about retirement-focused products, please connect with your relationship manager.
                            </p>
                        </motion.div>

                        {/* CALL NOW */}
                        <button
                            onClick={() => (window.location.href = 'tel:18002099999')}
                            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm uppercase tracking-wide rounded-xl shadow-sm flex items-center justify-center gap-2 border-2 border-transparent hover:border-white/20 transition-all"
                        >
                            <Phone className="w-4 h-4 fill-current" />
                            CALL NOW
                        </button>

                        {/* BOOK SLOT */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm uppercase tracking-wide rounded-xl shadow-sm flex items-center justify-center gap-2 border-2 border-transparent hover:border-white/20 transition-all"
                        >
                            <Calendar className="w-4 h-4" />
                            BOOK SLOT
                        </button>

                        {/* Try Again */}
                        <button
                            onClick={() => { restartGame(); navigate('/game'); }}
                            className="text-white/70 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors underline underline-offset-4 mt-1"
                        >
                            Try Again
                        </button>
                    </div>
                </div>

                {/* Booking Modal */}
                <BookingModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleBookingSubmit}
                    initialName={userName}
                    initialMobile={sessionStorage.getItem('lastSubmittedPhone') || ''}
                />
            </div>

            {/* Toast notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[120] px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-600'
                            } text-white`}
                    >
                        {toast.type === 'error' ? (
                            <X size={20} className="stroke-[3]" />
                        ) : (
                            <Check size={20} className="stroke-[3]" />
                        )}
                        <span className="font-bold text-sm">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

export default ResultPage;
