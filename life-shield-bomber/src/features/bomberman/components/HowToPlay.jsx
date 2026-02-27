/**
 * HowToPlay — Instructions screen for Life Shield Bomber.
 */
import { memo } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { Move, Shield, Clock, Play } from 'lucide-react';

const HowToPlay = memo(function HowToPlay({ onStart }) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    const instructions = [
        {
            icon: <Move className="text-white w-7 h-7 stroke-[3]" />,
            iconBg: 'from-blue-400 to-blue-600',
            iconShadow: '#1e40af',
            glowColor: 'from-blue-500 to-cyan-500',
            title: 'Move with Joystick',
            desc: 'Drag the joystick to move. Walk over risk blocks to claim and secure them.',
        },
        {
            icon: <Shield className="text-white w-7 h-7 stroke-[3]" />,
            iconBg: 'from-blue-400 to-indigo-600',
            iconShadow: '#312e81',
            glowColor: 'from-blue-500 to-indigo-500',
            title: 'Throw Shield at Threats',
            desc: 'Tap the shield button to launch it at red monsters approaching you.',
        },
        {
            icon: <Shield className="text-white w-7 h-7 stroke-[3]" />,
            iconBg: 'from-emerald-400 to-emerald-600',
            iconShadow: '#065f46',
            glowColor: 'from-emerald-500 to-teal-500',
            title: 'Guard Your Health',
            desc: 'Avoid red monsters — they drain your health. You have 3 lives.',
        },
        {
            icon: <Clock className="text-white w-7 h-7 stroke-[3]" />,
            iconBg: 'from-amber-400 to-amber-600',
            iconShadow: '#92400e',
            glowColor: 'from-amber-500 to-orange-500',
            title: '90 Seconds',
            desc: 'Claim all financial risks to unlock the exit door before time runs out!',
        },
    ];

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="fixed inset-0 z-50 flex flex-col items-center w-full h-full overflow-hidden bg-[#050B14]"
            style={{
                backgroundImage: `
                    radial-gradient(circle at 50% 0%, #1e3a8a 0%, #050B14 60%),
                    repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0rem, rgba(255,255,255,0.03) 0.0625rem, transparent 0.0625rem, transparent 2.5rem),
                    repeating-linear-gradient(-45deg, rgba(255,255,255,0.03) 0rem, rgba(255,255,255,0.03) 0.0625rem, transparent 0.0625rem, transparent 2.5rem)
                `,
            }}
        >
            <div className="flex-1 w-full max-w-md px-6 pt-10 pb-32 overflow-y-auto custom-scrollbar flex flex-col items-center gap-6">
                <motion.div variants={itemVariants} className="text-center shrink-0">
                    <h1 className="font-display text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-blue-200 via-blue-400 to-blue-600 drop-shadow-[0_0.25rem_0_rgba(0,0,0,0.5)]">
                        HOW TO PLAY
                    </h1>
                    <p className="text-blue-200/80 text-xs font-semibold tracking-wide mt-2 uppercase">
                        Claim risks. Defeat monsters. Secure your future.
                    </p>
                </motion.div>

                <div className="w-full space-y-4 shrink-0">
                    {instructions.map((item, i) => (
                        <motion.div key={i} variants={itemVariants} className="relative group">
                            <div className={`absolute -inset-0.5 bg-gradient-to-r ${item.glowColor} rounded-2xl opacity-40 blur`} />
                            <div className="relative bg-[#0a1529] border border-blue-500/50 rounded-2xl p-4 flex items-center gap-5 shadow-[inset_0_0_1.25rem_rgba(59,130,246,0.2)]">
                                <div
                                    className={`w-12 h-12 rounded-md bg-gradient-to-br ${item.iconBg} flex items-center justify-center border border-white/20`}
                                    style={{ boxShadow: `0 0.25rem 0 ${item.iconShadow}` }}
                                >
                                    {item.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-black text-sm uppercase tracking-wide mb-1">{item.title}</h3>
                                    <p className="text-blue-200/60 text-xs leading-tight font-medium">{item.desc}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Scoring Panel */}
                <motion.div variants={itemVariants} className="w-full relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-60 blur" />
                    <div className="relative bg-gradient-to-b from-[#1e3a8a] to-[#0f172a] border border-indigo-400/50 rounded-md p-4 shadow-xl">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0f172a] px-3 py-0.5 rounded-full border border-indigo-400/50">
                            <span className="text-[0.6rem] font-black text-indigo-300 tracking-widest uppercase">Scoring</span>
                        </div>
                        <div className="flex justify-between items-center gap-2 pt-2">
                            {[
                                { label: 'Claim Risk', points: '+10', color: 'text-blue-400' },
                                { label: 'Kill Monster', points: '+15', color: 'text-red-400' },
                                { label: 'Health ×', points: '+10', color: 'text-emerald-400' },
                            ].map((item) => (
                                <div key={item.label} className="flex-1 flex flex-col items-center gap-1">
                                    <span className={`font-display text-2xl font-extrabold ${item.color}`}>{item.points}</span>
                                    <span className="text-[0.5rem] text-white/60 font-bold uppercase">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Risk Types Legend */}
                <motion.div variants={itemVariants} className="w-full mt-2">
                    <h3 className="text-center text-blue-200/80 text-[0.625rem] font-bold uppercase tracking-[0.2em] mb-4">Financial Risks</h3>
                    <div className="grid grid-cols-2 gap-3 bg-[#0a1529]/50 p-4 rounded-md border border-white/5">
                        {[
                            { icon: '🏥', label: 'Medical Risk', color: '#EF4444' },
                            { icon: '💳', label: 'Debt Trap', color: '#F59E0B' },
                            { icon: '📈', label: 'Inflation', color: '#8B5CF6' },
                            { icon: '⚡', label: 'Emergency', color: '#F97316' },
                        ].map((g) => (
                            <div key={g.label} className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                                    style={{
                                        background: `${g.color}22`,
                                        border: `0.0625rem solid ${g.color}44`,
                                    }}
                                >
                                    <span className="text-base">{g.icon}</span>
                                </div>
                                <span className="text-white/70 text-[0.625rem] font-bold uppercase tracking-wide">{g.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Start Button — Fixed at bottom */}
            <motion.div
                variants={itemVariants}
                className="absolute bottom-0 left-0 w-full p-6 bg-[#050B14]/95 backdrop-blur-xl border-t border-white/10 z-20"
            >
                <div className="w-full max-w-md mx-auto">
                    <button
                        onClick={onStart}
                        className="w-full py-4 rounded-md font-display text-xl font-extrabold tracking-wider text-white uppercase relative overflow-hidden group transition-transform active:scale-[0.98] shadow-[0_0.375rem_0_#1e40af,0_0.9375rem_1.25rem_rgba(0,0,0,0.4)] hover:shadow-[0_0.5rem_0_#1e40af,0_1.25rem_1.5625rem_rgba(0,0,0,0.4)] active:shadow-[0_0.125rem_0_#1e40af] active:translate-y-[0.0625rem]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-[#60A5FA] via-[#3B82F6] to-[#1D4ED8]" />
                        <div className="absolute inset-x-0 top-0 h-[0.125rem] bg-white/60" />
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/10 to-transparent" />
                        <div className="relative flex items-center justify-center gap-3 drop-shadow-md">
                            <span>START PLAYING</span>
                            <Play className="w-6 h-6 fill-white" strokeWidth={3} />
                        </div>
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
});

HowToPlay.propTypes = {
    onStart: PropTypes.func.isRequired,
};

export default HowToPlay;
