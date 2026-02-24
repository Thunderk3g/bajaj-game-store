import React, { useState } from 'react';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

const StepSurprises = ({ step, selections, onSelect, stepIndex = 5 }) => {
    const currentSelections = selections[step.id] || {};
    const [currentSubStep, setCurrentSubStep] = useState(0);
    const [direction, setDirection] = useState(0);

    const categories = step.categories;

    const handleSubSelect = (catId, optId) => {
        onSelect(step.id, {
            ...currentSelections,
            [catId]: optId
        });

        // Auto-advance after a small delay for better UX
        if (currentSubStep < categories.length - 1) {
            setTimeout(() => {
                setDirection(1);
                setCurrentSubStep(prev => prev + 1);
            }, 400);
        }
    };

    const goToSubStep = (index) => {
        setDirection(index > currentSubStep ? 1 : -1);
        setCurrentSubStep(index);
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
        <div className="flex flex-col items-center justify-start w-full min-h-[60vh]">
            <div className="relative z-10 w-full max-w-md px-6 pt-12 pb-10 flex flex-col items-center overflow-hidden">

                {/* Step Badge & Progress */}
                <div className="flex flex-col items-center w-full mb-8">
                    <div className="px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-bold shadow-lg mb-4">
                        Step {stepIndex} of 5
                    </div>

                    <h2 className="text-3xl font-black text-slate-900 text-center mb-2">
                        {step.title}
                    </h2>

                    {/* Dot Indicators */}
                    <div className="flex gap-2 mb-4">
                        {categories.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => goToSubStep(idx)}
                                className={cn(
                                    "w-2.5 h-2.5 rounded-full transition-all duration-300",
                                    currentSubStep === idx
                                        ? "bg-blue-600 w-6"
                                        : "bg-slate-300 hover:bg-slate-400"
                                )}
                            />
                        ))}
                    </div>
                </div>

                <div className="relative w-full min-h-[400px]">
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        <motion.div
                            key={currentSubStep}
                            custom={direction}
                            variants={{
                                enter: (direction) => ({
                                    x: direction > 0 ? 50 : -50,
                                    opacity: 0
                                }),
                                center: {
                                    x: 0,
                                    opacity: 1
                                },
                                exit: (direction) => ({
                                    x: direction < 0 ? 50 : -50,
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
                            <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border-2 border-white/50 shadow-xl overflow-hidden">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                                        {category.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-blue-900 uppercase tracking-tight">
                                            {category.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 font-bold leading-tight">
                                            {category.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {category.options.map((option) => {
                                        const isSelected = currentSelections[category.id] === option.id;
                                        return (
                                            <button
                                                key={option.id}
                                                onClick={() => handleSubSelect(category.id, option.id)}
                                                className={cn(
                                                    "w-full flex items-center p-4 rounded-2xl border-4 transition-all text-left relative group",
                                                    isSelected
                                                        ? "border-blue-500 bg-blue-50 shadow-md translate-y-[-2px]"
                                                        : "border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50"
                                                )}
                                            >
                                                <div className="w-12 h-12 rounded-xl overflow-hidden mr-4 shadow-sm flex-shrink-0 border-2 border-white">
                                                    <img
                                                        src={option.image}
                                                        alt={option.label}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <span className={cn(
                                                        "text-sm font-black tracking-tight uppercase leading-tight block",
                                                        isSelected ? "text-blue-700" : "text-slate-600"
                                                    )}>
                                                        {option.label}
                                                    </span>
                                                </div>
                                                {isSelected && (
                                                    <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                                )}
                                            </button>
                                        );
                                    })}
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
