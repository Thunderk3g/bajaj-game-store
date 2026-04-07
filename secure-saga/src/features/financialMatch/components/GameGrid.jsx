/**
 * GameGrid — Sapphire blue gem frame with gear decorations and precision absolute layout.
 */
import { memo, useCallback, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { GRID_SIZE } from '../../../core/matchEngine/index.js';
import GameTile from './GameTile.jsx';
import HandTutorial from './HandTutorial.jsx';
import { AnimatePresence, motion } from 'framer-motion';

import gearCogImg from '../../assets/image/ui/gear_cog.png';

const GameGrid = memo(function GameGrid({
    grid,
    totalMatches,
    selectedCell,
    explodingCells,
    invalidSwapping,
    floatingScores,
    activePraise,
    onCellTap,
    onCellSwipe,
}) {
    const containerRef = useRef(null);
    const cellSize = 44;
    const gridGap = 4;
    const innerPadding = 8;
    const innerWidth = (cellSize * 6) + (gridGap * 5) + (innerPadding * 2);
    const frameThickness = 18;
    const totalOuterWidth = innerWidth + (frameThickness * 2);

    const handleTap = useCallback((row, col) => onCellTap(row, col), [onCellTap]);
    const handleSwipe = useCallback((r1, c1, r2, c2) => onCellSwipe(r1, c1, r2, c2), [onCellSwipe]);

    const tiles = useMemo(() => {
        if (!grid) return null;
        return grid.flatMap((row, rowIndex) =>
            row.map((tile, colIndex) => {
                const key = tile ? tile.id : `empty-${rowIndex}-${colIndex}`;

                if (!tile)
                    return <div key={key} style={{ width: cellSize, height: cellSize }} />;

                const isSelected = selectedCell?.row === tile.row && selectedCell?.col === tile.col;
                const isExploding = explodingCells.has(`${tile.row}-${tile.col}`);

                let invalidSwapTarget = null;
                if (invalidSwapping) {
                    const swapData = invalidSwapping.find(s => s.row === tile.row && s.col === tile.col);
                    if (swapData) {
                        invalidSwapTarget = { row: swapData.targetRow, col: swapData.targetCol };
                    }
                }

                return (
                    <GameTile
                        key={key}
                        tile={tile}
                        isSelected={isSelected}
                        isExploding={isExploding}
                        invalidSwapTarget={invalidSwapTarget}
                        onTap={handleTap}
                        onSwipe={handleSwipe}
                        cellSize={cellSize}
                        gridGap={gridGap}
                    />
                );
            })
        );
    }, [grid, selectedCell, explodingCells, invalidSwapping, handleTap, cellSize, gridGap]);

    if (!grid) return null;

    // Helper to generate gem studs (Task 8: embedded sapphire gemstone studs)
    const renderStuds = (isHorizontal, count) => {
        return Array.from({ length: count }).map((_, i) => (
            <div
                key={i}
                className="rounded-full shadow-inner"
                style={{
                    width: '6px',
                    height: '6px',
                    background: 'radial-gradient(circle at 30% 30%, #4facfe 0%, #1A3A8F 50%, #05101F 100%)',
                    boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.8), 0 1px 1px rgba(255,255,255,0.4)',
                    margin: isHorizontal ? '0 3px' : '3px 0'
                }}
            />
        ));
    };

    return (
        <div ref={containerRef} className="relative flex items-center justify-center z-10 w-full" style={{ height: '50vh' }}>

            {/* Soft dark shadow beneath the entire board */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[320px] bg-black/60 blur-[30px] rounded-[40px] z-[0] pointer-events-none" />

            {/* Main Outer Sapphire Frame Container - TASK 3 */}
            <div
                className="relative z-10 rounded-[24px] shadow-2xl flex items-center justify-center"
                style={{
                    width: `${totalOuterWidth}px`,
                    height: `${totalOuterWidth}px`,
                    background: '#1A3A8F', // Pure sapphire blue
                    boxShadow: 'inset 0 4px 10px rgba(255,255,255,0.4), inset 0 -4px 15px rgba(0,0,0,0.8), 0 20px 40px rgba(0,0,0,0.8)',
                    border: '2px solid #0D225c'
                }}
            >
                {/* 3D facets shading for lapis lazuli frame look */}
                <div className="absolute inset-x-2 top-2 h-[8px] rounded-full bg-white/20 blur-sm pointer-events-none" />
                <div className="absolute inset-y-2 left-2 w-[8px] rounded-full bg-white/10 blur-sm pointer-events-none" />

                {/* Vertical Stud Arrays */}
                <div className="absolute left-[5px] top-[24px] bottom-[24px] flex flex-col justify-between items-center z-20 pointer-events-none">
                    {renderStuds(false, 20)}
                </div>
                <div className="absolute right-[5px] top-[24px] bottom-[24px] flex flex-col justify-between items-center z-20 pointer-events-none">
                    {renderStuds(false, 20)}
                </div>

                {/* Horizontal Stud Arrays */}
                <div className="absolute top-[5px] left-[24px] right-[24px] flex justify-between items-center z-20 pointer-events-none">
                    {renderStuds(true, 20)}
                </div>
                <div className="absolute bottom-[5px] left-[24px] right-[24px] flex justify-between items-center z-20 pointer-events-none">
                    {renderStuds(true, 20)}
                </div>

                {/* Corner Gear Decorations Outside Frame */}
                <img src={gearCogImg} alt="" className="absolute -top-3 -left-3 w-[30px] h-[30px] z-30 drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]" draggable={false} />
                <img src={gearCogImg} alt="" className="absolute -top-3 -right-3 w-[30px] h-[30px] z-30 drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]" draggable={false} />
                <img src={gearCogImg} alt="" className="absolute -bottom-3 -left-3 w-[30px] h-[30px] z-30 drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]" draggable={false} />
                <img src={gearCogImg} alt="" className="absolute -bottom-3 -right-3 w-[30px] h-[30px] z-30 drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]" draggable={false} />


                {/* Inner Board Area - TASK 4 Darker Interior */}
                <div
                    className="relative z-10 rounded-[12px] flex items-center justify-center pointer-events-auto"
                    style={{
                        width: `${innerWidth}px`,
                        height: `${innerWidth}px`,
                        backgroundColor: '#05101F', // Darken to pure #05101F
                        // Minimizing shadow opacity to prevent greying out the deepest layer
                        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)',
                        border: '2px solid #D4A017',
                    }}
                >
                    {/* Dark faint grid lines in background */}
                    <div
                        className="absolute inset-[8px] pointer-events-none opacity-[0.05]"
                        style={{
                            backgroundImage: 'linear-gradient(to right, #D4A017 1px, transparent 1px), linear-gradient(to bottom, #D4A017 1px, transparent 1px)',
                            backgroundSize: `${cellSize + gridGap}px ${cellSize + gridGap}px`,
                            backgroundPosition: '0 0',
                            width: `${cellSize * 6 + gridGap * 5}px`,
                            height: `${cellSize * 6 + gridGap * 5}px`,
                        }}
                    />

                    {/* Actual Tile Grid with Absolute Positioning */}
                    <div
                        style={{
                            width: `${cellSize * 6 + gridGap * 5}px`,
                            height: `${cellSize * 6 + gridGap * 5}px`,
                            position: 'relative',
                            zIndex: 1,
                        }}
                    >
                        <AnimatePresence>
                            {tiles}
                        </AnimatePresence>

                        {/* Infinite hand gesture tutorial - only visible until player makes their first match */}
                        {totalMatches === 0 && (
                            <HandTutorial
                                grid={grid}
                                cellSize={cellSize}
                                gridGap={gridGap}
                            />
                        )}
                    </div>
                </div>

                {/* All center-board floating text overlays (scores and praise words) have been entirely removed as requested, leaving only the audio intact behind the scenes. */}
            </div>
        </div>
    );
});

GameGrid.propTypes = {
    grid: PropTypes.array,
    totalMatches: PropTypes.number,
    selectedCell: PropTypes.object,
    explodingCells: PropTypes.instanceOf(Set).isRequired,
    floatingScores: PropTypes.array.isRequired,
    activePraise: PropTypes.string,
    onCellTap: PropTypes.func.isRequired,
    onCellSwipe: PropTypes.func.isRequired,
};

export default GameGrid;
