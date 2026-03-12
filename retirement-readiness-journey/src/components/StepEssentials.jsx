import React from "react";
import { cn } from "../utils/cn";

const StepEssentials = ({ step, selections, onSelect, stepIndex = 3 }) => {
    const currentSelection = selections[step.id] || [];

    return (
        <div className="flex flex-col items-center justify-start w-full">

            <div className="relative z-10 w-full max-w-md px-4 py-2 flex flex-col items-center">

                <div className="flex justify-center mb-6">
                    <div className="px-6 py-2 bg-blue-500 text-white rounded-full text-sm font-semibold">
                        Step {stepIndex} of 5
                    </div>
                </div>

                <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-1.5">
                    {step.title}
                </h2>

                {/* Description */}
                <p className="text-center text-slate-600 text-sm mb-4">
                    {step.description}
                </p>

                {/* Progress Bar */}
                <div className="w-full mb-5">
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${(stepIndex / 5) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Options - Consistent 2-column grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
                    {step.options.map((option, index) => {
                        const isSelected = currentSelection.includes(option.id);
                        const isLastOdd = step.options.length % 2 !== 0 && index === step.options.length - 1;

                        return (
                            <button
                                key={option.id}
                                onClick={() => {
                                    const next = isSelected
                                        ? currentSelection.filter(id => id !== option.id)
                                        : [...currentSelection, option.id];
                                    onSelect(step.id, next);
                                }}
                                className={cn(
                                    "flex flex-col items-center text-center rounded-xl transition-all duration-300 overflow-hidden group relative",
                                    "bg-white/90 backdrop-blur-xl shadow-md hover:shadow-lg hover:-translate-y-0.5",
                                    isSelected
                                        ? "ring-2 ring-blue-500 bg-blue-50/90"
                                        : "hover:bg-white",
                                    isLastOdd ? "col-span-2 w-[calc(50%-0.375rem)] sm:w-[calc(50%-0.5rem)] mx-auto h-full" : "h-full"
                                )}
                            >
                                <div className="h-16 sm:h-24 w-full overflow-hidden p-2 sm:p-3 flex items-center justify-center bg-slate-50/50">
                                    <img
                                        src={option.image}
                                        alt={option.label}
                                        className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <div className="px-2 py-2 sm:px-3 sm:py-3 w-full flex flex-col items-center justify-center flex-1">
                                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                                        {option.label}
                                    </h3>
                                    <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 sm:mt-1 leading-snug">
                                        {option.sublabel}
                                    </p>
                                </div>
                                <div className={cn(
                                    "absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors border-2",
                                    isSelected
                                        ? "bg-blue-500 border-blue-500 text-white shadow-sm"
                                        : "bg-white/80 border-slate-100 text-slate-300 opacity-0 group-hover:opacity-100"
                                )}>
                                    {isSelected ? <span className="text-[10px] font-bold">✓</span> : <span className="text-[10px]">→</span>}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StepEssentials;
