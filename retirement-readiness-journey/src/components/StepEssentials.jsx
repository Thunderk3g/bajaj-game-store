import React from 'react';
import { cn } from '../utils/cn';

const StepEssentials = ({ step, selections, onSelect }) => {
    const currentSelection = selections[step.id] || [];

    const toggleOption = (optionId) => {
        const newSelection = currentSelection.includes(optionId)
            ? currentSelection.filter(id => id !== optionId)
            : [...currentSelection, optionId];
        onSelect(step.id, newSelection.length > 0 ? newSelection : null);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-[1.75rem] font-bold text-slate-900">{step.title}</h2>
                <p className="text-slate-500 text-[1rem]">{step.description}</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {step.options.map((option) => {
                    const isSelected = currentSelection.includes(option.id);
                    return (
                        <button
                            key={option.id}
                            onClick={() => toggleOption(option.id)}
                            className={cn(
                                "relative flex items-center p-5 rounded-[1rem] border-2 transition-all duration-200 text-left",
                                isSelected
                                    ? "border-primary-500 bg-primary-50/30 shadow-sm"
                                    : "border-slate-100 bg-white hover:border-slate-200"
                            )}
                        >
                            <div className={cn(
                                "w-6 h-6 rounded-md border-2 mr-4 flex items-center justify-center transition-colors",
                                isSelected ? "bg-primary-500 border-primary-500" : "border-slate-200"
                            )}>
                                {isSelected && (
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className={cn(
                                    "text-[1rem] font-bold",
                                    isSelected ? "text-primary-700" : "text-slate-900"
                                )}>
                                    {option.label}
                                </h3>
                                <p className="text-[0.75rem] text-slate-400 font-medium">
                                    {option.sublabel}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>

            <p className="text-[0.875rem] text-slate-400 text-center font-medium italic">
                Select all that apply to your retirement vision
            </p>
        </div>
    );
};

export default StepEssentials;
