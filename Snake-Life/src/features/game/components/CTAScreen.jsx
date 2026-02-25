import React, { useEffect, useState } from 'react';
import { useGame, GAME_STATUS } from '../context/GameContext';
import { Shield, ChevronRight, Share2, PhoneOutgoing } from 'lucide-react';

const CTAScreen = ({ onCalculate }) => {
    const { score, lifeBuilt, protectionRequirement, startGame } = useGame();
    const [showMeters, setShowMeters] = useState(false);
    const [showProtection, setShowProtection] = useState(false);

    useEffect(() => {
        const t1 = setTimeout(() => setShowMeters(true), 500);
        const t2 = setTimeout(() => setShowProtection(true), 1200);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, []);

    return (
        <div className="flex flex-col h-full bg-background overflow-y-auto px-6 py-8">
            {/* Meters Section */}
            <div className="space-y-8 mb-10">
                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <span className="text-primary font-bold">Life Built</span>
                        <span className="text-primary text-2xl font-black">{lifeBuilt}%</span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-1000 ease-out"
                            style={{ width: showMeters ? `${lifeBuilt}%` : '0%' }}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <span className="text-success font-bold flex items-center gap-2">
                            <Shield size={18} /> Protection Required
                        </span>
                        <span className="text-success text-2xl font-black">{protectionRequirement}%</span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-success transition-all duration-1000 ease-out"
                            style={{ width: showProtection ? `${protectionRequirement}%` : '0%' }}
                        />
                    </div>
                </div>
            </div>

            {/* Message Section */}
            <div className="text-center space-y-4 mb-10">
                <h2 className="text-2xl font-black text-primary leading-tight">
                    Calculate what your family actually needs to continue this life.
                </h2>
                <p className="text-gray-600 font-medium">
                    A simple conversation can protect everything you’re building.
                </p>
            </div>

            {/* Buttons Section */}
            <div className="flex flex-col gap-4 mt-auto">
                <button
                    onClick={onCalculate}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                >
                    Calculate Now <ChevronRight size={20} />
                </button>

                <button className="btn-secondary w-full flex items-center justify-center gap-2">
                    <PhoneOutgoing size={18} /> Talk to a Relationship Manager
                </button>

                <button className="flex items-center justify-center gap-2 py-4 text-gray-500 font-bold">
                    <Share2 size={18} /> Share This Game
                </button>

                <button
                    onClick={startGame}
                    className="text-primary underline font-bold mt-2"
                >
                    Play Again
                </button>
            </div>
        </div>
    );
};

export default CTAScreen;
