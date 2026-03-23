import React, { memo } from 'react';
import { motion } from 'framer-motion';

import greenShield from '../../assets/image/tiles/green_shield.png';
import blueCap from '../../assets/image/tiles/blue_graduation.png';
import goldCoin from '../../assets/image/tiles/gold_coin.png';
import redBriefcase from '../../assets/image/tiles/red_briefcase.png';

const TILE_ASSETS = {
    GREEN: greenShield,
    BLUE: blueCap,
    YELLOW: goldCoin,
    RED: redBriefcase,
};

const HandTutorial = memo(function HandTutorial({ grid, cellSize, gridGap }) {
    if (!grid || !grid[2] || !grid[2][2] || !grid[2][3]) return null;

    const r = 2;
    const c1 = 2;
    const c2 = 3;

    const tileA = grid[r][c1];
    const tileB = grid[r][c2];

    const topPos = r * (cellSize + gridGap);
    const leftA = c1 * (cellSize + gridGap);
    const leftB = c2 * (cellSize + gridGap);

    const shiftDist = cellSize + gridGap;

    // Timings over 2000ms loop
    // 0:     0ms
    // 0.1:   200ms
    // 0.175: 350ms
    // 0.3:   600ms
    // 0.375: 750ms
    // 0.6:   1200ms
    // 0.7:   1400ms
    // 1.0:   2000ms
    const times = [0, 0.1, 0.175, 0.3, 0.375, 0.6, 0.7, 1];

    const handOpacity = [0, 1, 1, 1, 1, 1, 0, 0];
    const handScale = [0, 1.0, 0.85, 0.85, 1.0, 1.0, 1.0, 0];
    const handX = [0, 0, 0, shiftDist, shiftDist, shiftDist, shiftDist, 0];

    const cloneOpacity = [1, 1, 1, 1, 1, 1, 0, 0];
    const cloneAScale = [1, 1, 0.9, 0.9, 1.0, 1.0, 1.0, 1];
    const cloneAX = [0, 0, 0, shiftDist, shiftDist, shiftDist, 0, 0];
    const cloneBX = [0, 0, 0, -shiftDist, -shiftDist, -shiftDist, 0, 0];

    return (
        <div className="absolute inset-0 z-[600] pointer-events-none overflow-visible">

            {/* Fake Tile A (Gets Pressed and Dragged Right) */}
            <motion.div
                animate={{ x: cloneAX, scale: cloneAScale, opacity: cloneOpacity }}
                transition={{ duration: 2, times, repeat: Infinity, ease: "linear" }}
                className="absolute flex items-center justify-center pointer-events-none drop-shadow-md z-[601]"
                style={{
                    left: leftA, top: topPos, width: cellSize, height: cellSize,
                    filter: 'brightness(1.35) saturate(1.45)'
                }}
            >
                <img src={TILE_ASSETS[tileA.type]} className="w-[125%] h-[125%] object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]" alt="" />
            </motion.div>

            {/* Fake Tile B (Gets Swapped Left naturally) */}
            <motion.div
                animate={{ x: cloneBX, opacity: cloneOpacity }}
                transition={{ duration: 2, times, repeat: Infinity, ease: "linear" }}
                className="absolute flex items-center justify-center pointer-events-none drop-shadow-md z-[600]"
                style={{
                    left: leftB, top: topPos, width: cellSize, height: cellSize,
                    filter: 'brightness(1.35) saturate(1.45)'
                }}
            >
                <img src={TILE_ASSETS[tileB.type]} className="w-[125%] h-[125%] object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]" alt="" />
            </motion.div>

            {/* The Orchestrating Hand Gesture Pointer */}
            <motion.div
                animate={{ x: handX, scale: handScale, opacity: handOpacity }}
                transition={{ duration: 2, times, repeat: Infinity, ease: "linear" }}
                className="absolute z-[700] flex items-center justify-center"
                style={{
                    left: leftA + (cellSize / 2) - 10,
                    top: topPos + (cellSize / 2) - 10,
                }}
            >
                {/* Hand visually slightly offset to the bottom right of the cursor center for optimal tile sightline */}
                <div className="text-[36px] drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] ml-4 mt-4" style={{ filter: 'drop-shadow(0px 0px 4px rgba(255,255,255,0.5))' }}>
                    👆
                </div>
            </motion.div>

        </div>
    );
});

export default HandTutorial;
