import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

const StepSurprises = ({ step, selections, onSelect, stepIndex = 5, currentSubStep, setSubStep }) => {
    const currentSelections = selections[step.id] || {};
    const [direction, setDirection] = useState(0);
    const prevSubStepRef = useRef(currentSubStep);

    useEffect(() => {
        if (currentSubStep > prevSubStepRef.current) {
            setDirection(1);
        } else if (currentSubStep < prevSubStepRef.current) {
            setDirection(-1);
        }
        prevSubStepRef.current = currentSubStep;
    }, [currentSubStep]);

    const categories = step.categories;

    const handleSubSelect = (catId, optId) => {
        onSelect(step.id, {
            ...currentSelections,
            [catId]: optId
        });
    };

    const goToSubStep = (index) => {
        setSubStep(index);
    };

    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 300 : -300,
            opacity: 0
        })
    };

    const category = categories[currentSubStep];

    return (
        <div className="flex flex-col items-center justify-start w-full">
            <div className="relative z-10 w-full max-w-md px-6 py-4 flex flex-col items-center overflow-hidden">

                {/* Step Header & Progress */}
                <div className="flex flex-col items-center w-full mb-6">
                    <div className="px-5 py-1.5 bg-blue-600/10 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-blue-600/20">
                        Step {stepIndex} of 5
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 text-center mb-3 leading-tight px-4">
                        {step.title}
                    </h2>

                    {/* Compact Dot Indicators (• • •) */}
                    <div className="flex gap-2.5 mb-2">
                        {categories.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => goToSubStep(idx)}
                                className={cn(
                                    "w-2.5 h-2.5 rounded-full transition-all duration-500",
                                    currentSubStep === idx
                                        ? "bg-blue-600 scale-125"
                                        : "bg-slate-200"
                                )}
                                aria-label={`Go to scenario ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="relative w-full overflow-visible">
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        <motion.div
                            key={currentSubStep}
                            custom={direction}
                            variants={{
                                enter: (direction) => ({
                                    x: direction > 0 ? '100%' : '-100%',
                                    opacity: 0
                                }),
                                center: {
                                    x: 0,
                                    opacity: 1
                                },
                                exit: (direction) => ({
                                    x: direction < 0 ? '100%' : '-100%',
                                    opacity: 0
                                })
                            }}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            className="w-full"
                        >
                            <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-50 relative overflow-hidden">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 shrink-0" />

                                <div className="relative z-10">
                                    <div className="flex flex-col items-center text-center mb-5 sm:mb-8">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl flex items-center justify-center text-3xl sm:text-4xl mb-3 sm:mb-4 shadow-sm border-2 border-white">
                                            {category.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-lg sm:text-xl font-black text-slate-800 uppercase tracking-tight mb-1 sm:mb-2">
                                                {category.title}
                                            </h3>
                                            <p className="text-[12px] sm:text-[13px] text-slate-500 font-bold leading-relaxed px-2 sm:px-4">
                                                {category.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5 sm:space-y-3">
                                        {category.options.map((option) => {
                                            const isSelected = currentSelections[category.id] === option.id;
                                            return (
                                                <button
                                                    key={option.id}
                                                    onClick={() => handleSubSelect(category.id, option.id)}
                                                    className={cn(
                                                        "w-full flex items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all text-left relative group",
                                                        isSelected
                                                            ? "border-blue-500 bg-blue-50/50"
                                                            : "border-slate-100 bg-slate-50/50 hover:border-blue-200"
                                                    )}
                                                >
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[0.5rem] sm:rounded-xl overflow-hidden mr-2.5 sm:mr-3 shadow-sm flex-shrink-0 border-2 border-white bg-white">
                                                        <img
                                                            src={option.image}
                                                            alt={option.label}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className={cn(
                                                            "text-[11px] font-black tracking-wider uppercase leading-tight block",
                                                            isSelected ? "text-blue-700" : "text-slate-600"
                                                        )}>
                                                            {option.label}
                                                        </span>
                                                    </div>
                                                    <div className={cn(
                                                        "w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ml-3 flex-shrink-0",
                                                        isSelected
                                                            ? "border-blue-500 bg-blue-500"
                                                            : "border-slate-300 bg-white group-hover:border-blue-400"
                                                    )}>
                                                        {isSelected && (
                                                            <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default StepSurprises;
