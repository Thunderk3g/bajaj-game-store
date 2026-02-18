import { memo, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { LIFE_STAGES } from '../constants/lifeStages';

/**
 * Alignment pattern for zigzag map layout.
 * Cards alternate: left → right → center → left → right
 */
const ALIGNMENT_PATTERN = ['justify-start', 'justify-end', 'justify-center', 'justify-start', 'justify-end'];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.15 },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] },
    },
};

/**
 * Gamified stage selection screen — level-select map style.
 * Zigzag card layout with glossy cards, ray burst background,
 * SVG dashed path, and chunky 3D "BEGIN RACE" button.
 * Cards now show: Emoji → Stage Name → Age Range.
 */
const StageSelection = memo(function StageSelection({ onSelectStage }) {
    const [selected, setSelected] = useState(null);

    const handleSelect = useCallback((stageId) => {
        setSelected(stageId);
    }, []);

    const handleConfirm = useCallback(() => {
        if (selected) onSelectStage(selected);
    }, [selected, onSelectStage]);

    // Memoize the SVG path to avoid recalculation
    const mapPath = useMemo(() => (
        <svg
            className="absolute top-0 left-0 w-full h-full z-[1] pointer-events-none"
            fill="none"
            viewBox="0 0 430 600"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
        >
            <path
                d="M100 60 C 250 100, 350 150, 300 220 C 250 290, 100 320, 150 400 C 200 480, 350 500, 300 580"
                stroke="white"
                strokeWidth="8"
                strokeDasharray="16 16"
                strokeLinecap="round"
                opacity="0.4"
            />
        </svg>
    ), []);

    return (
        <div className="fixed inset-0 map-bg flex flex-col overflow-hidden">
            {/* Ray burst background effect */}
            <div className="ray-burst" aria-hidden="true" />

            {/* Ambient glow orbs */}
            <div className="absolute top-[5rem] -left-[2.5rem] w-[8rem] h-[8rem] bg-white/30 blur-2xl rounded-full z-0" aria-hidden="true" />
            <div className="absolute bottom-[10rem] -right-[2.5rem] w-[12rem] h-[12rem] bg-yellow-200/20 blur-2xl rounded-full z-0" aria-hidden="true" />

            {/* Header — compact on small screens */}
            <motion.div
                className="px-4 pt-8 sm:pt-12 pb-1 sm:pb-2 text-center z-20 flex-shrink-0"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <h1 className="font-game text-[1.75rem] sm:text-[2.25rem] text-white drop-shadow-lg tracking-wide leading-tight mb-0.5 uppercase">
                    Select Your Stage
                </h1>
                <p className="text-blue-900 font-game-body font-black text-[0.625rem] sm:text-[0.6875rem] uppercase tracking-widest opacity-80">
                    Tap a milestone to start the race
                </p>
            </motion.div>

            {/* Stage map area — uses flex-1 + justify-evenly to distribute evenly */}
            <motion.div
                className="flex-1 relative z-10 px-4 sm:px-6 py-2 flex flex-col justify-evenly gap-0 max-w-[26.875rem] mx-auto w-full min-h-0"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* SVG dashed path connecting stages */}
                {mapPath}

                {/* Stage cards */}
                {LIFE_STAGES.map((stage, index) => {
                    const isSelected = selected === stage.id;
                    const alignment = ALIGNMENT_PATTERN[index] || 'justify-center';

                    return (
                        <motion.div
                            key={stage.id}
                            variants={cardVariants}
                            className={`flex ${alignment} w-full z-10`}
                        >
                            <div
                                className={`glossy-card ${isSelected ? 'glossy-selected' : ''} w-[8.5rem] sm:w-[10rem] p-2 sm:p-3 rounded-2xl sm:rounded-3xl flex flex-col items-center gap-1 sm:gap-1.5 cursor-pointer`}
                                onClick={() => handleSelect(stage.id)}
                                role="radio"
                                aria-checked={isSelected}
                                aria-label={`${stage.label} (${stage.ageRange})`}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleSelect(stage.id);
                                    }
                                }}
                            >
                                {/* Emoji + check indicator */}
                                <div className="relative">
                                    <span className="text-[2.25rem] sm:text-[3rem] drop-shadow-md block leading-none">
                                        {stage.emoji}
                                    </span>
                                    <div
                                        className={`absolute -top-1 -right-1 w-[1.125rem] h-[1.125rem] sm:w-[1.375rem] sm:h-[1.375rem] rounded-full border-2 border-white flex items-center justify-center transition-colors duration-200 ${isSelected ? 'bg-green-500' : 'bg-slate-200'
                                            }`}
                                    >
                                        <span
                                            className={`material-symbols-outlined text-[0.625rem] sm:text-[0.75rem] font-bold ${isSelected ? 'text-white' : 'text-slate-400'
                                                }`}
                                        >
                                            {isSelected ? 'check' : 'radio_button_unchecked'}
                                        </span>
                                    </div>
                                </div>

                                {/* Stage label */}
                                <span className="font-game-body font-black text-[0.6875rem] sm:text-[0.8125rem] uppercase tracking-tight text-slate-800 text-center leading-tight">
                                    {stage.label}
                                </span>

                                {/* Age range — subtle but visible */}
                                <span className="text-[0.5625rem] sm:text-[0.6875rem] font-semibold text-slate-500 tracking-wider">
                                    {stage.ageRange}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* BEGIN RACE button — pinned to bottom */}
            <motion.div
                className="px-4 sm:px-6 pb-6 pt-2 z-20 max-w-[26.875rem] mx-auto w-full flex-shrink-0"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5, ease: 'easeOut' }}
            >
                <button
                    className="chunky-btn w-full bg-blue-600 hover:bg-blue-500 text-white font-game text-[1.25rem] sm:text-[1.5rem] py-4 sm:py-5 rounded-2xl sm:rounded-3xl flex items-center justify-center gap-2 active:scale-95 disabled:hover:bg-blue-600"
                    onClick={handleConfirm}
                    disabled={!selected}
                    id="btn-confirm-stage"
                >
                    BEGIN RACE
                    <span className="material-symbols-outlined text-[1.5rem] sm:text-[1.875rem]">chevron_right</span>
                </button>
            </motion.div>
        </div>
    );
});

StageSelection.displayName = 'StageSelection';

StageSelection.propTypes = {
    onSelectStage: PropTypes.func.isRequired,
};

export default StageSelection;
