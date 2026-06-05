import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { useGameStore, GAME_STATUS } from '../store/useGameStore';
import { Shield, IndianRupee as RupeeIcon, Navigation, Trophy } from 'lucide-react';
import MainScene from '../game/scenes/MainScene';
import PreloadScene from '../game/scenes/PreloadScene';

const HUD = () => {
    const { shield, coins, distance } = useGameStore();

    return (
        <div className="absolute top-0 left-0 w-full p-4 pt-8 pointer-events-none flex justify-between items-start z-50">
            {/* Left: Progress & Shield */}
            <div className="flex flex-col gap-3 max-w-[200px] w-full">
                <div className="p-3 flex flex-col gap-2 rounded-xl" style={{ border: '1px solid #00f2fe', boxShadow: '0 0 15px rgba(0, 242, 254, 0.3)', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)' }}>
                    <div className="flex justify-between items-center text-xs font-black text-cyan-400 tracking-widest" style={{ textShadow: '0 0 8px rgba(0,242,254,0.5)' }}>
                        <div className="flex items-center gap-1.5">
                            <Shield size={14} className="text-cyan-400" />
                            <span>SHIELD</span>
                        </div>
                        <span className={shield < 30 ? 'text-red-500 animate-pulse' : 'text-white'}>{Math.floor(shield)}%</span>
                    </div>
                    <div className="arcade-meter bg-slate-900 border border-cyan-500/30 overflow-hidden">
                        <div 
                            className="arcade-meter-fill transition-all duration-300"
                            style={{ 
                                width: `${shield}%`, 
                                backgroundColor: shield < 30 ? '#ef4444' : '#00f2fe',
                                boxShadow: `0 0 15px ${shield < 30 ? '#ef4444' : '#00f2fe'}`
                            }}
                        />
                    </div>
                </div>

                <div className="p-2 px-3 flex items-center justify-between rounded-xl w-fit" style={{ border: '1px solid #ff007f', boxShadow: '0 0 15px rgba(255, 0, 127, 0.3)', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)' }}>
                    <div className="flex items-center gap-2">
                        <Navigation size={16} className="text-pink-500" />
                        <span className="text-sm font-black text-white" style={{ textShadow: '0 0 10px #ff007f' }}>{distance}m</span>
                    </div>
                </div>
            </div>

            {/* Right: Wealth / Coins */}
            <div className="p-2 px-4 flex items-center gap-3 rounded-xl" style={{ border: '1px solid #facc15', boxShadow: '0 0 15px rgba(250, 204, 21, 0.3)', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)' }}>
                <div className="bg-yellow-500/20 p-1.5 rounded-full border border-yellow-500/50 shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                    <RupeeIcon size={18} className="text-yellow-400" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-yellow-500/80 leading-none tracking-widest mb-1">WEALTH</span>
                    <span className="text-xl font-black text-white leading-none" style={{ textShadow: '0 0 12px #facc15' }}>{coins}</span>
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
        let game;
        
        const initGame = () => {
            if (!gameContainer.current) return;
            // Prevent initialization if container is 0x0
            if (gameContainer.current.clientWidth === 0 || gameContainer.current.clientHeight === 0) {
                return;
            }

            const config = {
                type: Phaser.AUTO,
                parent: gameContainer.current,
                backgroundColor: '#0f172a',
                banner: false, // Disables the Phaser console log
                physics: {
                    default: 'matter',
                    matter: {
                        gravity: { y: 1.5 },
                        enableSleeping: false,
                    }
                },
                scene: [PreloadScene, MainScene],
                scale: {
                    mode: Phaser.Scale.RESIZE,
                    autoCenter: Phaser.Scale.CENTER_BOTH,
                    min: {
                        width: 8,
                        height: 8
                    }
                }
            };

            game = new Phaser.Game(config);
            gameInstance.current = game;
        };

        // Delay slightly to let React Strict Mode double-invocations settle
        // and allow DOM to be fully rendered with correct dimensions.
        const timer = setTimeout(initGame, 50);

        return () => {
            clearTimeout(timer);
            if (game) {
                // Stop the game loop immediately so it doesn't try to render a 0x0 canvas while unmounting
                if (game.loop) game.loop.sleep();
                
                // Async destroy to prevent WebGL context crashing during unmount
                setTimeout(() => {
                    if (game) game.destroy(true);
                }, 0);
                gameInstance.current = null;
            }
        };
    }, []);

    return (
        <div className="relative w-full h-full overflow-hidden bg-[#0B1221] flex items-center justify-center">
            {/* On desktop: constrain to mobile width and center; on mobile: fill full screen */}
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    maxWidth: '480px',
                    margin: '0 auto',
                    overflow: 'hidden',
                }}
            >
                {/* Phaser Canvas Container */}
                <div ref={gameContainer} style={{ width: '100%', height: '100%' }} />

                {/* HUD Overlay */}
                <HUD />
            </div>
        </div>
    );
};

export default GamePage;
