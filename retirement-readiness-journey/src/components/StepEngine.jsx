import React from "react";
import { cn } from "../utils/cn";

const StepEngine = ({ step, selections, onSelect, stepIndex = 4 }) => {
    const currentSelection = selections[step.id] || [];

    return (
        <div className="flex flex-col items-center justify-start w-full">

            <div className="relative z-10 w-full max-w-md px-4 py-2 sm:px-6 sm:py-4 flex flex-col items-center">

                <div className="flex justify-center mb-3 sm:mb-6">
                    <div className="px-4 py-1.5 sm:px-6 sm:py-2 bg-blue-500 text-white rounded-full text-xs sm:text-sm font-semibold shadow-md">
                        Step {stepIndex} of 5
                    </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-center mb-1.5 sm:mb-3">
                    {step.title}
                </h2>

                <p className="text-center text-slate-600 mb-4 sm:mb-6 text-sm sm:text-base">
                    {step.description}
                </p>

                <div className="w-full mb-5 sm:mb-10">
                    <div className="h-1.5 sm:h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500"
                            style={{ width: `${(stepIndex / 5) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:gap-5 w-full">
                    {step.options.map((option) => {
                        const isSelected = currentSelection.includes(option.id);

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
                                    "flex items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/90 backdrop-blur-xl shadow-md sm:shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all",
                                    isSelected && "ring-2 ring-blue-500 bg-blue-50/90"
                                )}
                            >
                                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-slate-50/50 rounded-lg flex items-center justify-center p-1.5 sm:p-2 shadow-inner mr-3 sm:mr-4 flex-shrink-0">
                                    <img
                                        src={option.image}
                                        alt={option.label}
                                        className="max-h-full max-w-full object-contain"
                                    />
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                                        {option.label}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
                                        {option.sublabel}
                                    </p>
                                </div>

                                <div className={cn(
                                    "ml-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors border-2",
                                    isSelected
                                        ? "bg-blue-500 border-blue-500 text-white shadow-sm"
                                        : "bg-slate-50 border-slate-100 text-slate-300"
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

export default StepEngine;
