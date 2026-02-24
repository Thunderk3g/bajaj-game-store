/**
 * LandingPage — Branded intro for Life Shield Bomber.
 * "Protect Your Financial Future – Bajaj Life Insurance"
 */
import { memo } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.3 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const LandingPage = memo(function LandingPage({ onStart }) {
    return (
        <motion.div
            className="w-full min-h-[100dvh] flex flex-col items-center justify-center px-5 relative overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
                background: 'linear-gradient(180deg, #0D1B3E 0%, #060E24 50%, #0A1628 100%)',
            }}
        >
            {/* Background glows */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[15%] left-[10%] w-80 h-80 rounded-full bg-blue-600/[0.08] blur-[6.25rem]" />
                <div className="absolute bottom-[20%] right-[5%] w-72 h-72 rounded-full bg-red-500/[0.06] blur-[5rem]" />
                <div className="absolute top-[60%] left-[50%] w-64 h-64 rounded-full bg-amber-500/[0.05] blur-[5.625rem]" />
            </div>

            {/* Floating risk icons */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[
                    { icon: '🛡️', x: '12%', y: '18%', delay: 0, size: 32 },
                    { icon: '💣', x: '78%', y: '22%', delay: 0.5, size: 28 },
                    { icon: '🏥', x: '20%', y: '70%', delay: 1, size: 24 },
                    { icon: '💳', x: '82%', y: '65%', delay: 1.5, size: 30 },
                    { icon: '📈', x: '45%', y: '85%', delay: 2, size: 20 },
                    { icon: '⚡', x: '68%', y: '12%', delay: 0.8, size: 22 },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: [0, 0.5, 0.25, 0.5],
                            scale: [0, 1, 0.9, 1],
                            y: [0, -10, 0, -10],
                        }}
                        transition={{
                            delay: item.delay,
                            duration: 4,
                            repeat: Infinity,
                            repeatType: 'reverse',
                            ease: 'easeInOut',
                        }}
                        className="absolute flex items-center justify-center"
                        style={{
                            left: item.x,
                            top: item.y,
                            width: `${item.size / 16}rem`,
                            height: `${item.size / 16}rem`,
                            fontSize: `${item.size / 20}rem`,
                        }}
                    >
                        {item.icon}
                    </motion.div>
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
                {/* Bajaj branding */}
                <motion.div variants={itemVariants} className="mb-6">
                    <div
                        className="px-4 py-1.5 rounded-full text-[0.6rem] font-black uppercase tracking-[0.25em]"
                        style={{
                            background: 'rgba(0, 102, 178, 0.15)',
                            border: '0.09375rem solid rgba(0, 102, 178, 0.35)',
                            color: '#60A5FA',
                        }}
                    >
                        Bajaj Life Insurance
                    </div>
                </motion.div>

                {/* Title */}
                <motion.h1
                    variants={itemVariants}
                    className="font-display text-[2.2rem] font-extrabold leading-[1.1] text-white mb-2"
                    style={{ textShadow: '0 0 2rem rgba(59,130,246,0.3)' }}
                >
                    Life Shield<br />Bomber
                </motion.h1>

                <motion.p
                    variants={itemVariants}
                    className="text-white/40 text-[0.75rem] font-bold uppercase tracking-[0.2em] mb-6"
                >
                    Eliminate Financial Risks
                </motion.p>

                {/* Risk previews */}
                <motion.div variants={itemVariants} className="flex items-center gap-3 mb-8">
                    {[
                        { icon: '🏥', label: 'Medical' },
                        { icon: '💳', label: 'Debt' },
                        { icon: '📈', label: 'Inflation' },
                        { icon: '⚡', label: 'Emergency' },
                    ].map((b, i) => (
                        <motion.div
                            key={b.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 + i * 0.1 }}
                            className="flex flex-col items-center gap-1"
                        >
                            <div
                                className="w-8 h-8 rounded-md flex items-center justify-center"
                                style={{
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    border: '0.0625rem solid rgba(239, 68, 68, 0.3)',
                                }}
                            >
                                <span className="text-[1rem]">{b.icon}</span>
                            </div>
                            <span className="text-[0.45rem] font-bold text-white/30 uppercase tracking-wider">
                                {b.label}
                            </span>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Start CTA */}
                <motion.div variants={itemVariants} className="w-full max-w-[16rem]">
                    <button
                        onClick={onStart}
                        id="btn-start-bomber"
                        className="w-full py-3.5 rounded-md font-display font-extrabold text-[0.95rem] tracking-widest text-white uppercase transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                            background: 'linear-gradient(135deg, #0066B2 0%, #3B82F6 100%)',
                            boxShadow: '0 0.25rem 1.25rem rgba(0, 102, 178, 0.3)',
                        }}
                    >
                        Start Game
                    </button>
                </motion.div>

                {/* Disclaimer */}
                <motion.p
                    variants={itemVariants}
                    className="text-white/15 text-[0.55rem] font-medium mt-6 max-w-[16rem] leading-relaxed"
                >
                    Navigate the grid, plant bombs, and eliminate financial risks in 90 seconds
                </motion.p>
            </div>
        </motion.div>
    );
});

LandingPage.propTypes = {
    onStart: PropTypes.func.isRequired,
};

export default LandingPage;
