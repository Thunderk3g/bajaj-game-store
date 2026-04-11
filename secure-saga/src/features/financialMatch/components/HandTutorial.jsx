import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { wouldCreateMatch } from '../../../core/matchEngine/index.js';

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
    const move = useMemo(() => {
        if (!grid) return null;
        const size = grid.length;
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                // Check right
                if (c + 1 < size && wouldCreateMatch(grid, r, c, r, c + 1)) {
                    return { r1: r, c1: c, r2: r, c2: c + 1, type: 'HORIZ' };
                }
                // Check down
                if (r + 1 < size && wouldCreateMatch(grid, r, c, r + 1, c)) {
                    return { r1: r, c1: c, r2: r + 1, c2: c, type: 'VERT' };
                }
            }
        }
        return null; // Should not happen in SECURE SAGA due to valid move guarantee
    }, [grid]);

    if (!move) return null;

    const { r1, c1, r2, c2, type } = move;
    const tileA = grid[r1][c1];
    const tileB = grid[r2][c2];

    const topA = r1 * (cellSize + gridGap);
    const leftA = c1 * (cellSize + gridGap);
    const topB = r2 * (cellSize + gridGap);
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
    const handX = [0, 0, 0, type === 'HORIZ' ? shiftDist : 0, type === 'HORIZ' ? shiftDist : 0, type === 'HORIZ' ? shiftDist : 0, type === 'HORIZ' ? shiftDist : 0, 0];
    const handY = [0, 0, 0, type === 'VERT' ? shiftDist : 0, type === 'VERT' ? shiftDist : 0, type === 'VERT' ? shiftDist : 0, type === 'VERT' ? shiftDist : 0, 0];

    const cloneOpacity = [1, 1, 1, 1, 1, 1, 0, 0];
    const cloneAScale = [1, 1, 0.9, 0.9, 1.0, 1.0, 1.0, 1];

    // Animate X if horizontal swap
    const cloneAX = [0, 0, 0, type === 'HORIZ' ? shiftDist : 0, type === 'HORIZ' ? shiftDist : 0, type === 'HORIZ' ? shiftDist : 0, 0, 0];
    const cloneBX = [0, 0, 0, type === 'HORIZ' ? -shiftDist : 0, type === 'HORIZ' ? -shiftDist : 0, type === 'HORIZ' ? -shiftDist : 0, 0, 0];

    // Animate Y if vertical swap
    const cloneAY = [0, 0, 0, type === 'VERT' ? shiftDist : 0, type === 'VERT' ? shiftDist : 0, type === 'VERT' ? shiftDist : 0, 0, 0];
    const cloneBY = [0, 0, 0, type === 'VERT' ? -shiftDist : 0, type === 'VERT' ? -shiftDist : 0, type === 'VERT' ? -shiftDist : 0, 0, 0];

    return (
        <div className="absolute inset-0 z-[600] pointer-events-none overflow-visible">

            {/* Fake Tile A */}
            <motion.div
                animate={{ x: cloneAX, y: cloneAY, scale: cloneAScale, opacity: cloneOpacity }}
                transition={{ duration: 2, times, repeat: Infinity, ease: "linear" }}
                className="absolute flex items-center justify-center pointer-events-none drop-shadow-md z-[601]"
                style={{
                    left: leftA, top: topA, width: cellSize, height: cellSize,
                    filter: 'brightness(1.35) saturate(1.45)'
                }}
            >
                <img src={TILE_ASSETS[tileA.type]} className="w-[125%] h-[125%] object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]" alt="" />
            </motion.div>

            {/* Fake Tile B */}
            <motion.div
                animate={{ x: cloneBX, y: cloneBY, opacity: cloneOpacity }}
                transition={{ duration: 2, times, repeat: Infinity, ease: "linear" }}
                className="absolute flex items-center justify-center pointer-events-none drop-shadow-md z-[600]"
                style={{
                    left: leftB, top: topB, width: cellSize, height: cellSize,
                    filter: 'brightness(1.35) saturate(1.45)'
                }}
            >
                <img src={TILE_ASSETS[tileB.type]} className="w-[125%] h-[125%] object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]" alt="" />
            </motion.div>

            {/* The Orchestrating Hand Gesture Pointer */}
            <motion.div
                animate={{ x: handX, y: handY, scale: handScale, opacity: handOpacity }}
                transition={{ duration: 2, times, repeat: Infinity, ease: "linear" }}
                className="absolute z-[700] flex items-center justify-center"
                style={{
                    left: leftA + (cellSize / 2) - 10,
                    top: topA + (cellSize / 2) - 10,
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
