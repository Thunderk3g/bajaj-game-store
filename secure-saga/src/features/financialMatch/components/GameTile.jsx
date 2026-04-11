/**
 * GameTile — Uses explicit file assets from assets/image/tiles, strictly transparent background configuration.
 * Swipe: directional-only (no free drag). Pointer events detect dominant axis on release.
 */
import { memo, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

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

const GameTile = memo(function GameTile({
    tile,
    isSelected,
    isExploding,
    invalidSwapTarget,
    onTap,
    onSwipe,
    cellSize,
    gridGap,
}) {
    // Pointer-based swipe detection — tile does NOT move freely
    const pointerStart = useRef(null);
    const hasSwiped = useRef(false);

    const SWIPE_THRESHOLD = 20;

    if (!tile || !tile.type) {
        return <div style={{ width: cellSize, height: cellSize }} />;
    }

    const { type, row, col } = tile;
    const imgSrc = TILE_ASSETS[type] || greenShield;

    const leftPos = col * (cellSize + gridGap);
    const topPos = row * (cellSize + gridGap);

    const isSelectedClass = isSelected ? 'ring-[2px] ring-white/80 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : '';

    const handlePointerDown = useCallback((e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        pointerStart.current = { x: e.clientX, y: e.clientY };
        hasSwiped.current = false;
    }, []);

    const handlePointerUp = useCallback((e) => {
        if (!pointerStart.current) return;
        const dx = e.clientX - pointerStart.current.x;
        const dy = e.clientY - pointerStart.current.y;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        pointerStart.current = null;

        if (absX > SWIPE_THRESHOLD || absY > SWIPE_THRESHOLD) {
            hasSwiped.current = true;
            let targetRow = row;
            let targetCol = col;
            if (absX > absY) {
                targetCol = dx > 0 ? col + 1 : col - 1;
            } else {
                targetRow = dy > 0 ? row + 1 : row - 1;
            }
            if (targetRow >= 0 && targetRow < 6 && targetCol >= 0 && targetCol < 6) {
                if (onSwipe) onSwipe(row, col, targetRow, targetCol);
            }
        }
    }, [row, col, onSwipe]);

    const handleClick = useCallback(() => {
        if (!hasSwiped.current) {
            onTap(row, col);
        }
        hasSwiped.current = false;
    }, [row, col, onTap]);

    // ── Build Animation Constraints ──

    let animateConfig = {
        left: leftPos,
        top: topPos,
        scale: isExploding ? [1, 1.15, 0.3] : isSelected ? 0.94 : 1,
        opacity: isExploding ? [1, 1, 0] : 1,
        zIndex: isExploding ? 500 : isSelected ? 50 : 10,
    };

    // Dynamic framer times tracking for Invalid Swap (500ms max sequence)
    let explicitTransition = {
        type: 'spring',
        stiffness: isExploding ? 300 : 500,
        damping: isExploding ? 20 : 35,
        mass: 0.8,
        opacity: { duration: isExploding ? 0.2 : 0.1 }
    };

    if (isExploding) {
        explicitTransition = {
            duration: 0.35,
            times: [0, 0.5, 1], // 1.0 -> 1.15 -> 0.3
            ease: "easeInOut"
        };
    }

    if (invalidSwapTarget) {
        const targetLeft = invalidSwapTarget.col * (cellSize + gridGap);
        const targetTop = invalidSwapTarget.row * (cellSize + gridGap);
        const dX = leftPos - targetLeft;
        const dY = topPos - targetTop;

        const timesArray = [0, 0.3, 0.4, 0.5, 0.7, 0.84, 0.88, 0.92, 0.96, 1];

        animateConfig = {
            ...animateConfig,
            left: [
                leftPos, targetLeft, targetLeft, targetLeft,
                leftPos + dX * 0.08, leftPos,
                leftPos - 3, leftPos + 3, leftPos - 2, leftPos
            ],
            top: [
                topPos, targetTop, targetTop, targetTop,
                topPos + dY * 0.08, topPos,
                topPos, topPos, topPos, topPos
            ],
            scale: [1, 1, 1.05, 1, 1, 1, 1, 1, 1, 1]
        };

        explicitTransition = {
            duration: 0.5,
            times: timesArray,
            ease: "easeInOut"
        };
    }

    return (
        <>

            <motion.div
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onClick={handleClick}
                layoutId={tile.id}
                initial={{ left: leftPos, top: topPos - 40, opacity: 0 }}
                animate={animateConfig}
                transition={explicitTransition}
                className={`absolute flex items-center justify-center bg-transparent
                    ${isSelectedClass} select-none overflow-visible touch-none`}
                style={{
                    width: cellSize,
                    height: cellSize,
                    filter: 'brightness(1.35) saturate(1.45)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    touchAction: 'none',
                }}
            >
                {/* Visual Overlays logic purely for FX (Red Flash / Green Flash) */}
                <AnimatePresence>
                    {isExploding && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 0.35, times: [0, 0.5, 1] }}
                            className="absolute inset-[10%] rounded-[12px] border-2 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.8)] z-30 pointer-events-none"
                        />
                    )}

                    {invalidSwapTarget && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 1, 0] }}
                            transition={{ duration: 0.5, times: [0, 0.2, 0.6, 0.8] }}
                            className="absolute inset-[10%] rounded-[12px] border-2 border-red-500 bg-[#FF3300]/25 shadow-[0_0_15px_rgba(255,50,50,0.8)] z-30 pointer-events-none"
                        />
                    )}
                </AnimatePresence>

                {/* Glossy Specular */}
                <div
                    className="absolute top-[8%] left-[8%] w-[45%] h-[20%] rounded-[50%] z-20 pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse at top left, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 80%)',
                        transform: 'rotate(-15deg)',
                    }}
                />

                <img
                    src={imgSrc}
                    alt={type}
                    className="w-[125%] h-[125%] object-contain pointer-events-none drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)] bg-transparent"
                    draggable={false}
                />
            </motion.div>
        </>
    );
});

GameTile.propTypes = {
    tile: PropTypes.object,
    isSelected: PropTypes.bool,
    isExploding: PropTypes.bool,
    invalidSwapTarget: PropTypes.object,
    onTap: PropTypes.func.isRequired,
    onSwipe: PropTypes.func,
    cellSize: PropTypes.number.isRequired,
    gridGap: PropTypes.number.isRequired,
};

export default GameTile;
