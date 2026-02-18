import React from 'react';
import { cn } from '../utils/cn';

const StepEngine = ({ step, selections, onSelect }) => {
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

            <div className="grid grid-cols-1 gap-4">
                {step.options.map((option) => {
                    const isSelected = currentSelection.includes(option.id);
                    return (
                        <button
                            key={option.id}
                            onClick={() => toggleOption(option.id)}
                            className={cn(
                                "relative flex items-center p-6 rounded-[1rem] border-2 transition-all duration-200 text-left",
                                isSelected
                                    ? "border-primary-500 bg-primary-50/50 shadow-md ring-1 ring-primary-500/20"
                                    : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
                            )}
                        >
                            <div className={cn(
                                "w-[3.5rem] h-[3.5rem] rounded-[1rem] flex items-center justify-center text-[2rem] mr-6 bg-white shadow-sm border border-slate-50",
                                isSelected ? "text-primary-500" : "text-slate-400"
                            )}>
                                {option.id === 'safety' ? '🛡️' : option.id === 'growth' ? '📈' : '💰'}
                            </div>
                            <div className="flex-1">
                                <h3 className={cn(
                                    "text-[1.125rem] font-bold",
                                    isSelected ? "text-primary-700" : "text-slate-900"
                                )}>
                                    {option.label}
                                </h3>
                                <p className="text-[0.875rem] text-slate-400 font-medium">{option.sublabel}</p>
                            </div>
                            <div className={cn(
                                "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all",
                                isSelected ? "bg-primary-500 border-primary-500 rotate-0" : "border-slate-200 rotate-90"
                            )}>
                                {isSelected && (
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="bg-accent-lightOrange border border-accent-orange/20 p-4 rounded-[1rem] flex gap-3 items-start">
                <span className="text-[1.25rem]">💡</span>
                <p className="text-[0.875rem] text-accent-darkOrange leading-relaxed">
                    <span className="font-bold">Pro Tip:</span> A robust retirement plan often combines multiple investment strategies for safety and growth.
                </p>
            </div>
        </div>
    );
};

export default StepEngine;
