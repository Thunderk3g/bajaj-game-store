import React from 'react';
import { CATEGORY_CONFIG } from '../constants/categoryConfig';

const ReferencePanel = ({ activeCategories }) => {
    return (
        <div className="w-full max-w-xl flex justify-center gap-2 sm:gap-2.5 mt-2 animate-fade-in px-2 sm:px-4">
            {activeCategories.map(catKey => {
                const config = CATEGORY_CONFIG[catKey];
                if (!config) return null;

                return (
                    <div
                        key={catKey}
                        className="flex-1 flex items-center justify-center rounded-2xl py-4 px-2 shadow-lg transition-transform duration-300 hover:scale-105"
                        style={{
                            backgroundColor: config.color,
                        }}
                    >
                        <span
                            className="text-xs sh:text-[0.65rem] sm:text-sm font-black tracking-widest uppercase leading-none text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                        >
                            {config.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default ReferencePanel;
