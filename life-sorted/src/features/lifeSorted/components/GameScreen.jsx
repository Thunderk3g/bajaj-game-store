import React from 'react';
import { motion } from 'framer-motion';
import { Timer, CheckCircle2 } from 'lucide-react';
import Tube from './Tube';
import ReferencePanel from './ReferencePanel';
import { CATEGORY_CONFIG } from '../constants/categoryConfig';

const GameScreen = ({
    tubes,
    capacity,
    selectedTube,
    onTubeClick,
    timer,
    formatTime,
    progress,
    isUrgent,
    activeCategories,
    moves,
    currentLevel,
    tubeRefs,
    newlySortedTubes,
    sortedCount
}) => {
    const categoryMapping = ['growth', 'safety', 'resp', 'risk', 'asset'];

    return (
        <div className="w-full h-full flex flex-col items-center pt-1">
            {/* ─── Premium Timer + Progress HUD ─── */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md">
                <div className="w-full bg-[#0a1628]/90 backdrop-blur-xl rounded-2xl border border-white/[0.07] shadow-[0_4px_30px_rgba(0,0,0,0.5)] px-5 py-3 sh:px-3 sh:py-1.5 flex items-center justify-between">
                    {/* Timer */}
                    <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl ${isUrgent ? 'bg-red-500/15 ring-1 ring-red-500/30' : 'bg-teal/10 ring-1 ring-teal/20'} transition-all`}>
                            <Timer className={`w-5 h-5 ${isUrgent ? 'text-red-400 animate-pulse' : 'text-teal'}`} />
                        </div>
                        <div className="flex flex-col">
                            <span className={`text-2xl sh:text-lg font-mono font-black tracking-wider leading-none ${isUrgent ? 'text-red-400' : 'text-white'}`}>
                                {formatTime(timer)}
                            </span>
                            {/* Inline Progress Bar */}
                            <div className="w-28 h-1 bg-white/[0.06] rounded-full overflow-hidden mt-1.5">
                                <motion.div
                                    animate={{
                                        width: `${progress}%`,
                                        backgroundColor: isUrgent ? '#ef4444' : '#2dd4bf'
                                    }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                    className="h-full rounded-full"
                                    style={{ boxShadow: isUrgent ? '0 0 6px rgba(239,68,68,0.4)' : '0 0 6px rgba(45,212,191,0.3)' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sorted Progress */}
                    <div className="flex items-center gap-2.5">
                        <div className="flex flex-col items-end">
                            <span className="text-[0.6rem] uppercase text-white/30 tracking-[0.15em] font-bold leading-none">Sorted</span>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-2xl sh:text-base font-black text-teal leading-none">{sortedCount}</span>
                                <span className="text-xs text-white/30 font-bold">/ {activeCategories.length}</span>
                            </div>
                        </div>
                        <div className={`p-2 rounded-xl ${sortedCount === activeCategories.length ? 'bg-emerald-500/15 ring-1 ring-emerald-500/30' : 'bg-white/[0.04] ring-1 ring-white/[0.06]'} transition-all`}>
                            <CheckCircle2 className={`w-5 h-5 ${sortedCount === activeCategories.length ? 'text-emerald-400' : 'text-white/20'}`} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Reference Panel */}
            <div className="mt-16 sh:mt-11 w-full flex justify-center">
                <ReferencePanel activeCategories={activeCategories} />
            </div>

            {/* ─── Game Board ─── */}
            <div className="relative w-full flex flex-col items-center gap-4 sh:gap-1 sm:gap-12 mt-6 sh:mt-2 sm:mt-12 mb-2 sm:mb-8 animate-fade-in px-2">
                {/* Active Tubes (Row 1) */}
                <div className="w-full max-w-5xl overflow-hidden px-1">
                    <div className="flex flex-nowrap justify-center gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-12 shrink-0 relative z-10 py-1 sm:py-4">
                        {tubes.slice(0, 5).map((segments, index) => {
                            const catKey = categoryMapping[index];
                            const config = CATEGORY_CONFIG[catKey];
                            return (
                                <div key={index} className="flex flex-col items-center gap-2 sm:gap-4 shrink-0">
                                    <div ref={el => tubeRefs.current[index] = el}>
                                        <Tube
                                            index={index}
                                            segments={segments}
                                            capacity={capacity}
                                            isSelected={selectedTube === index}
                                            isSorted={segments.length === capacity && segments.every(s => s.category === categoryMapping[index])}
                                            isNewlySorted={newlySortedTubes?.includes(index)}
                                            onClick={onTubeClick}
                                            isValidTarget={selectedTube !== null && selectedTube !== index}
                                        />
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: config.color }} />
                                        <span className="text-[0.6rem] sm:text-[0.7rem] font-black tracking-[0.1em] sm:tracking-[0.2em]" style={{ color: config.color }}>
                                            {config.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Empty Tubes (Row 2) */}
                <div className="flex justify-center gap-x-4 sm:gap-x-8">
                    {tubes.slice(5, 7).map((segments, index) => {
                        const tubeIndex = index + 5;
                        return (
                            <div key={tubeIndex} className="flex flex-col items-center gap-2 sm:gap-4 shrink-0">
                                <div ref={el => tubeRefs.current[tubeIndex] = el}>
                                    <Tube
                                        index={tubeIndex}
                                        segments={segments}
                                        capacity={capacity}
                                        isSelected={selectedTube === tubeIndex}
                                        isSorted={false}
                                        isNewlySorted={false}
                                        onClick={onTubeClick}
                                        isValidTarget={selectedTube !== null && selectedTube !== tubeIndex}
                                    />
                                </div>
                                <span className="text-[0.55rem] sm:text-[0.7rem] font-bold text-white/30 tracking-[0.1em] sm:tracking-[0.2em] mt-0.5 sm:mt-1 uppercase">
                                    Empty
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default GameScreen;
