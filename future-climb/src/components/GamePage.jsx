import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { useGameStore, GAME_STATUS } from '../store/useGameStore';
import { Shield, Coins as CoinsIcon, Navigation, Trophy } from 'lucide-react';
import MainScene from '../game/scenes/MainScene';
import PreloadScene from '../game/scenes/PreloadScene';

const HUD = () => {
    const { health, coins, distance } = useGameStore();

    return (
        <div className="absolute top-0 left-0 w-full p-4 pt-8 pointer-events-none flex justify-between items-start z-50">
            {/* Left: Progress & Health */}
            <div className="flex flex-col gap-3 max-w-[200px] w-full">
                <div className="glass-card p-3 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                        <div className="flex items-center gap-1">
                            <Shield size={14} className="text-red-500" />
                            <span>HEALTH</span>
                        </div>
                        <span className={health < 30 ? 'text-red-500 animate-pulse' : ''}>{Math.floor(health)}%</span>
                    </div>
                    <div className="arcade-meter bg-slate-900/50">
                        <div 
                            className="arcade-meter-fill transition-all duration-300"
                            style={{ 
                                width: `${health}%`, 
                                backgroundColor: health < 30 ? '#ef4444' : '#22c55e' 
                            }}
                        />
                    </div>
                </div>

                <div className="glass-card p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Navigation size={18} className="text-white opacity-70" />
                        <span className="text-sm font-black text-white text-glow">{distance}m</span>
                    </div>
                </div>
            </div>

            {/* Right: Wealth / Coins */}
            <div className="glass-card p-3 flex items-center gap-3">
                <div className="bg-yellow-500/20 p-1.5 rounded-full border border-yellow-500/30">
                    <CoinsIcon size={20} className="text-yellow-400" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 leading-none">WEALTH</span>
                    <span className="text-xl font-black text-white text-glow leading-none">{coins}</span>
                </div>
            </div>
        </div>
    );
};

const GamePage = () => {
    const gameContainer = useRef(null);
    const gameInstance = useRef(null);
    const { setStatus } = useGameStore();

    useEffect(() => {
        if (!gameInstance.current && gameContainer.current) {
            const config = {
                type: Phaser.AUTO,
                parent: gameContainer.current,
                backgroundColor: '#0f172a',
                physics: {
                    default: 'matter',
                    matter: {
                        gravity: { y: 1.5 },
                        enableSleeping: false,
                        // debug: true // Set to true to see bodies
                    }
                },
                scene: [PreloadScene, MainScene],
                scale: {
                    mode: Phaser.Scale.RESIZE,
                    autoCenter: Phaser.Scale.CENTER_BOTH
                }
            };

            gameInstance.current = new Phaser.Game(config);
        }

        return () => {
            if (gameInstance.current) {
                gameInstance.current.destroy(true);
                gameInstance.current = null;
            }
        };
    }, []);

    return (
        <div className="relative w-full h-full overflow-hidden bg-slate-900">
            {/* Phaser Canvas Container */}
            <div ref={gameContainer} className="w-full h-full" />

            {/* HUD Overlay */}
            <HUD />

            {/* Controls Helper (Desktop/Touch hint) */}
            <div className="absolute bottom-6 left-0 w-full flex justify-between px-6 pointer-events-none opacity-40 z-40">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-2 border-white/20 rounded-full flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold uppercase">Brake</span>
                    </div>
                    <span className="text-white text-[8px] mt-1 font-bold">LEFT / A</span>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-2 border-white/20 rounded-full flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold uppercase">Gas</span>
                    </div>
                    <span className="text-white text-[8px] mt-1 font-bold">RIGHT / D</span>
                </div>
            </div>
        </div>
    );
};

export default GamePage;
