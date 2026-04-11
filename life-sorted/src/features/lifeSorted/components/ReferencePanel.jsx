import React from 'react';
import { CATEGORY_CONFIG } from '../constants/categoryConfig';

const EMOJI_MAP = {
    growth: ['📈', '🌅'],
    safety: ['🛡️', '💰'],
    resp: ['🎓', '🏠'],
    risk: ['🩺', '🛡️', '🏥'],
    asset: ['🏠'],
};

const ReferencePanel = ({ activeCategories }) => {
    return (
        <div className="w-full max-w-md flex flex-wrap justify-center gap-1.5 mt-2 animate-fade-in px-2">
            {activeCategories.map(catKey => {
                const config = CATEGORY_CONFIG[catKey];
                if (!config) return null;
                const emojis = EMOJI_MAP[catKey] || [];

                return (
                    <div
                        key={catKey}
                        className="flex flex-col w-[30%] max-w-[130px] rounded-xl overflow-hidden border border-white/[0.08] shadow-lg"
                        style={{ background: `linear-gradient(160deg, ${config.color}12 0%, ${config.color}05 100%)` }}
                    >
                        {/* Header */}
                        <div
                            className="flex items-center justify-center gap-1.5 py-1.5 px-1.5"
                            style={{ background: `linear-gradient(135deg, ${config.color}25 0%, ${config.color}10 100%)`, borderBottom: `1px solid ${config.color}20` }}
                        >
                            <span className="text-base leading-none">{config.icon}</span>
                            <span className="text-[0.55rem] font-black tracking-widest uppercase" style={{ color: config.color }}>
                                {config.label}
                            </span>
                        </div>

                        {/* Elements */}
                        <div className="flex flex-col gap-0.5 px-2 py-1.5">
                            {config.elements.map((el, idx) => (
                                <div key={idx} className="flex items-center gap-1">
                                    <span className="text-[0.55rem] leading-none">{emojis[idx] || '•'}</span>
                                    <span className="text-[0.48rem] text-white/60 font-semibold whitespace-nowrap leading-tight">{el}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ReferencePanel;
