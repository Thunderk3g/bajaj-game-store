import { motion } from 'framer-motion';
import { useState } from 'react';
import { lifeGoals } from '../data/lifeGoals';
import {
    GraduationCap, Palmtree, Castle, Check,
    Rocket, Globe, Car, Wallet, HeartPulse, HeartHandshake
} from "lucide-react";

const iconMap = {
    GraduationCap,
    Palmtree,
    Castle,
    Globe,
    Car,
    Wallet,
    Rocket,
    HeartPulse,
    HeartHandshake
};

const GoalSelectionScreen = ({ onProceed }) => {
    const [selectedGoals, setSelectedGoals] = useState([]);

    const toggleGoal = (goalId) => {
        setSelectedGoals(prev => {
            if (prev.includes(goalId)) {
                return prev.filter(id => id !== goalId);
            }

            if (prev.length < 3) {
                return [...prev, goalId];
            }

            const newSelection = [...prev];
            newSelection.shift();
            newSelection.push(goalId);
            return newSelection;
        });
    };

    const handleProceed = () => {
        if (selectedGoals.length === 3) {
            const goals = lifeGoals.filter(g => selectedGoals.includes(g.id));
            onProceed(goals);
        }
    };

    return (
        <div className="ghibli-card">
            {/* Background Pattern */}
            <div className="bg-burst"></div>

            {/* Content Layer */}
            <div className="ghibli-content">

                {/* Header */}
                <header className="shrink-0 text-center mb-3 sm:mb-4">
                    <motion.h2
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-xl sm:text-2xl md:text-3xl font-black text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)] leading-tight italic"
                    >
                        Select Top 3 Goals
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-blue-100 text-[10px] sm:text-xs md:text-sm font-bold mt-1 opacity-90 uppercase tracking-widest"
                    >
                        Choose your financial priorities
                    </motion.p>
                </header>

                {/* Progress Indicator */}
                <div className="shrink-0 mb-3 sm:mb-4">
                    <div className="flex justify-center gap-2 sm:gap-4">
                        {[1, 2, 3].map((num) => (
                            <div
                                key={num}
                                className={`w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 border-4 sm:border-[6px] flex items-center justify-center font-black text-base sm:text-xl transition-all ${selectedGoals.length >= num
                                    ? 'bg-white border-white text-[#0066B2] shadow-[0_5px_15px_rgba(255,255,255,0.3)] scale-110'
                                    : 'bg-transparent border-white/30 text-white/50'
                                    }`}
                            >
                                {selectedGoals.length >= num ? <Check className="w-5 sm:w-7 h-5 sm:h-7" strokeWidth={5} /> : num}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Card */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex-1 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col mb-2 sm:mb-4 border-4 border-white/20 backdrop-blur-sm"
                >

                    {/* Scrollable Goals Grid */}
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar">
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            {lifeGoals.map((goal, index) => {
                                const IconComponent = iconMap[goal.icon];
                                const isSelected = selectedGoals.includes(goal.id);
                                const selectionOrder = selectedGoals.indexOf(goal.id) + 1;

                                return (
                                    <motion.button
                                        key={goal.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => toggleGoal(goal.id)}
                                        className={`relative p-3 sm:p-5 border-2 sm:border-4 transition-all duration-300 ${isSelected
                                            ? 'bg-[#0066B2] border-[#0066B2] shadow-xl scale-105'
                                            : 'bg-slate-50 border-slate-100 hover:border-[#0066B2]/30 hover:shadow-lg hover:scale-[1.02]'
                                            }`}
                                    >
                                        {isSelected && (
                                            <div className="absolute -top-1 -right-1 w-6 sm:w-8 h-6 sm:h-8 bg-[#FF8C00] flex items-center justify-center shadow-lg border-2 border-white z-20">
                                                <span className="text-white font-black text-[10px] sm:text-xs">{selectionOrder}</span>
                                            </div>
                                        )}

                                        <div className={`mb-2 md:mb-3 transition-colors ${isSelected ? 'text-white' : 'text-[#0066B2]'}`}>
                                            <IconComponent className="w-6 sm:w-10 h-6 sm:h-10 mx-auto drop-shadow-md" strokeWidth={2.5} />
                                        </div>

                                        <h3 className={`text-xs sm:text-base font-black leading-tight ${isSelected ? 'text-white' : 'text-slate-800'
                                            }`}>
                                            {goal.name}
                                        </h3>

                                        <p className={`text-[9px] sm:text-xs mt-1 leading-snug font-bold opacity-80 ${isSelected ? 'text-blue-100' : 'text-slate-500'
                                            }`}>
                                            {goal.description}
                                        </p>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* Footer Button */}
                <div className="shrink-0">
                    <button
                        onClick={handleProceed}
                        disabled={selectedGoals.length !== 3}
                        className="btn-primary-3d w-full !py-4 sm:!py-6 !text-lg sm:!text-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Continue
                    </button>

                    <p className="text-center text-blue-100 font-black uppercase tracking-[0.3em] mt-3 opacity-60 text-[10px] sm:text-xs">
                        {selectedGoals.length}/3 Selected
                    </p>
                </div>

            </div>
        </div>
    );
};

export default GoalSelectionScreen;
