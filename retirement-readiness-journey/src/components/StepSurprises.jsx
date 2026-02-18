import React from 'react';
import { cn } from '../utils/cn';

const StepSurprises = ({ step, selections, onSelect }) => {
    const currentSelections = selections[step.id] || {};

    const handleSubSelect = (catId, optId) => {
        onSelect(step.id, {
            ...currentSelections,
            [catId]: optId
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="space-y-2">
                <h2 className="text-[1.75rem] font-bold text-slate-900">{step.title}</h2>
                <p className="text-slate-500 text-[1rem]">{step.description}</p>
            </div>

            <div className="space-y-8">
                {step.categories.map((category) => (
                    <div key={category.id} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-[1.5rem]">{category.icon}</span>
                            <div>
                                <h3 className="text-[1.125rem] font-bold text-slate-800 uppercase tracking-wide">
                                    {category.title}
                                </h3>
                                <p className="text-[0.875rem] text-slate-400 font-medium">
                                    {category.description}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 pl-4 border-l-2 border-slate-100">
                            {category.options.map((option) => {
                                const isSelected = currentSelections[category.id] === option.id;
                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => handleSubSelect(category.id, option.id)}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-[0.75rem] border-2 transition-all text-left group",
                                            isSelected
                                                ? "border-primary-500 bg-primary-50/30"
                                                : "border-slate-50 bg-white hover:border-slate-200"
                                        )}
                                    >
                                        <span className={cn(
                                            "text-[0.875rem] font-bold tracking-tight uppercase",
                                            isSelected ? "text-primary-700" : "text-slate-600"
                                        )}>
                                            {option.label}
                                        </span>
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-[0.625rem] font-black tracking-widest uppercase shadow-sm",
                                            option.strength === 'STRONG'
                                                ? (isSelected ? "bg-primary-500 text-white" : "bg-slate-100 text-slate-400")
                                                : (isSelected ? "bg-accent-orange text-white" : "bg-slate-100 text-slate-400")
                                        )}>
                                            {option.strength}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StepSurprises;
