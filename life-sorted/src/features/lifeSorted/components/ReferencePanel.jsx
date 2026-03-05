import React from 'react';
import { CATEGORY_CONFIG } from '../constants/categoryConfig';

const ReferencePanel = ({ activeCategories }) => {
    return (
        <div className="w-full max-w-sm flex flex-wrap justify-center gap-2 mt-8 animate-fade-in">
            {activeCategories.map(catKey => {
                const config = CATEGORY_CONFIG[catKey];
                if (!config) return null;
                return (
                    <div
                        key={catKey}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-white/10"
                    >
                        <div
                            className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
                            style={{ backgroundColor: config.color, color: config.color }}
                        />
                        <span className="text-[0.65rem] font-bold uppercase tracking-widest text-white/70">
                            {config.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default ReferencePanel;
