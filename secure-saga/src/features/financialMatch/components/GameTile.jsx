/**
 * GameTile — Uses explicit file assets from assets/image/tiles, strictly transparent background configuration.
 */
import { memo, useState } from 'react';
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
    const [isDragging, setIsDragging] = useState(false);

    if (!tile || !tile.type) {
        return <div style={{ width: cellSize, height: cellSize }} />;
    }

    const { type, row, col } = tile;
    const imgSrc = TILE_ASSETS[type] || greenShield;

    const leftPos = col * (cellSize + gridGap);
    const topPos = row * (cellSize + gridGap);

    const isSelectedClass = isSelected && !isDragging ? 'ring-[2px] ring-white/80 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : '';

    const SWIPE_THRESHOLD = 30;

    const handleDragStart = () => {
        setIsDragging(true);
    };

    const handleDragEnd = (event, info) => {
        setIsDragging(false);
        const { offset } = info;
        const absX = Math.abs(offset.x);
        const absY = Math.abs(offset.y);

        if (absX > SWIPE_THRESHOLD || absY > SWIPE_THRESHOLD) {
            let targetRow = row;
            let targetCol = col;

            if (absX > absY) {
                targetCol = offset.x > 0 ? col + 1 : col - 1;
            } else {
                targetRow = offset.y > 0 ? row + 1 : row - 1;
            }

            if (targetRow >= 0 && targetRow < 6 && targetCol >= 0 && targetCol < 6) {
                if (onSwipe) onSwipe(row, col, targetRow, targetCol);
            }
        }
    };

    const handleClick = () => {
        if (!isDragging) {
            onTap(row, col);
        }
    };

    // ── Build Animation Constraints ──

    let animateConfig = {
        left: leftPos,
        top: topPos,
        scale: isExploding ? [1, 1.15, 0.3] : isSelected ? 0.94 : 1,
        opacity: isExploding ? [1, 1, 0] : isDragging ? 0.85 : 1,
        zIndex: isDragging || isExploding ? 500 : isSelected ? 50 : 10,
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
            {/* Native 30% ghost rendering underneath explicitly mimicking mechanics during active drags entirely passively */}
            {isDragging && (
                <div
                    className="absolute flex items-center justify-center bg-transparent drop-shadow-md pointer-events-none opacity-30"
                    style={{ left: leftPos, top: topPos, width: cellSize, height: cellSize, filter: 'brightness(1.35) saturate(1.45)' }}
                >
                    <img src={imgSrc} className="w-[125%] h-[125%] object-contain" alt="" />
                </div>
            )}

            <motion.div
                drag
                dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
                dragElastic={0.8} // Highly interactive fluid drag pull
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
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
                    cursor: 'grab'
                }}
                whileDrag={{ cursor: 'grabbing' }}
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
