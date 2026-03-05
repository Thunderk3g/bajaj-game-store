import React from 'react';
import { motion } from 'framer-motion';
import { Undo2, RotateCcw, Timer } from 'lucide-react';
import Tube from './Tube';
import ProgressBar from '../../../components/ui/ProgressBar';
import ReferencePanel from './ReferencePanel';

const GameScreen = ({
    tubes,
    capacity,
    selectedTube,
    onTubeClick,
    onUndo,
    onRestart,
    timer,
    formatTime,
    progress,
    isUrgent,
    activeCategories,
    moves,
    currentLevel,
    pouringState,
    tubeRefs
}) => {
    return (
        <div className="w-full h-full flex flex-col items-center pt-10">
            {/* Top Fixed Timer HUD */}
            <div className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center pb-2">
                <div className="flex items-center gap-2 mb-1">
                    <Timer className={`${isUrgent ? 'text-risk animate-pulse' : 'text-teal'} w-5 h-5`} />
                    <span className={`text-2xl font-mono font-bold tracking-wider ${isUrgent ? 'text-risk' : 'text-white'}`}>
                        {formatTime(timer)}
                    </span>
                </div>
                <div className="w-full max-w-xs px-4">
                    <ProgressBar progress={progress} isUrgent={isUrgent} />
                </div>
            </div>

            {/* Level & Move Stats (Floating) */}
            <div className="w-full max-w-md flex justify-between px-6 mb-12 mt-12 animate-fade-in">
                <div className="flex flex-col">
                    <span className="text-[0.65rem] uppercase tracking-widest text-white/40 font-bold">Level</span>
                    <span className="text-xl font-bold text-gold">{currentLevel}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[0.65rem] uppercase tracking-widest text-white/40 font-bold">Moves</span>
                    <span className="text-xl font-bold text-white">{moves}</span>
                </div>
            </div>

            {/* Game Board - Scaled Up Tubes */}
            <div className="relative w-full flex flex-wrap justify-center gap-x-6 gap-y-16 max-w-md mx-auto py-4">
                {tubes.map((segments, index) => (
                    <div
                        key={index}
                        ref={el => tubeRefs.current[index] = el}
                    >
                        <Tube
                            index={index}
                            segments={segments}
                            capacity={capacity}
                            isSelected={selectedTube === index}
                            onClick={onTubeClick}
                            isValidTarget={selectedTube !== null && selectedTube !== index}
                            isPouring={pouringState?.sourceIndex === index}
                            isBeingPouredInto={pouringState?.targetIndex === index}
                            pouringState={pouringState}
                            tiltDirection={pouringState ? (pouringState.targetIndex > pouringState.sourceIndex ? 'right' : 'left') : 'right'}
                            pourOffset={pouringState?.sourceIndex === index ? { x: pouringState.dx, y: pouringState.dy } : null}
                        />
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mt-8 animate-fade-in">
                <button
                    onClick={onUndo}
                    className="w-12 h-12 rounded-full glass-button flex items-center justify-center text-white/70 hover:text-white"
                    title="Undo"
                >
                    <Undo2 size={24} />
                </button>
                <button
                    onClick={onRestart}
                    className="w-14 h-14 rounded-full glass-button flex items-center justify-center text-white/70 hover:text-white bg-white/5"
                    title="Restart Level"
                >
                    <RotateCcw size={28} />
                </button>
            </div>

            {/* Reference */}
            <ReferencePanel activeCategories={activeCategories} />
        </div>
    );
};

export default GameScreen;
