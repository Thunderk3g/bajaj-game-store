import { memo, useCallback, useRef, useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { GRID_SIZE } from '../../../core/matchEngine/index.js';
import GameTile from './GameTile.jsx';
import { AnimatePresence, motion } from 'framer-motion';

const GameGrid = memo(function GameGrid({
    grid,
    selectedCell,
    explodingCells,
    floatingScores,
    activePraise,
    onCellTap,
}) {
    const containerRef = useRef(null);
    // Use a stable, fixed cell size for typical mobile widths to prevent shifting
    const cellSize = 46;
    const boardPadding = 12;
    const gridGap = 4;
    const boardSize = (cellSize * 6) + (gridGap * 5) + (boardPadding * 2);

    const handleTap = useCallback(
        (row, col) => onCellTap(row, col),
        [onCellTap]
    );

    const tiles = useMemo(() => {
        if (!grid) return null;
        return grid.map((row, rowIndex) =>
            row.map((tile, colIndex) => {
                const key = tile ? tile.id : `empty-${rowIndex}-${colIndex}`;

                if (!tile)
                    return <div key={key} style={{ width: cellSize, height: cellSize }} />;

                const isSelected = selectedCell?.row === tile.row && selectedCell?.col === tile.col;
                const isExploding = explodingCells.has(`${tile.row}-${tile.col}`);

                return (
                    <GameTile
                        key={key}
                        tile={tile}
                        isSelected={isSelected}
                        isExploding={isExploding}
                        onTap={handleTap}
                        cellSize={cellSize}
                    />
                );
            })
        );
    }, [grid, selectedCell, explodingCells, handleTap, cellSize]);

    if (!grid) return null;

    return (
        <div
            ref={containerRef}
            className="relative flex items-center justify-center z-10 my-4 h-full"
        >
            {/* Glass Board Container - Fixed Size to prevent any shifting */}
            <div
                className="relative rounded-[1.8rem] shadow-2xl border border-white/10 overflow-hidden"
                style={{
                    width: `${boardSize}px`,
                    height: `${boardSize}px`,
                    background: 'rgba(255, 255, 255, 0.04)',
                    boxShadow: '0 40px 80px -12px rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    padding: `${boardPadding}px`
                }}
            >
                {/* Board Mesh Background - Static underlying grid for visual stability */}
                <div
                    className="absolute pointer-events-none"
                    style={{
                        top: `${boardPadding}px`,
                        left: `${boardPadding}px`,
                        display: 'grid',
                        gridTemplateColumns: `repeat(6, ${cellSize}px)`,
                        gridTemplateRows: `repeat(6, ${cellSize}px)`,
                        gap: `${gridGap}px`,
                    }}
                >
                    {Array.from({ length: 36 }).map((_, i) => (
                        <div key={i} className="bg-white/[0.04] rounded-xl border border-white/[0.02]" />
                    ))}
                </div>

                {/* Actual Tile Grid - Perfectly positioned over the mesh */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${GRID_SIZE}, ${cellSize}px)`,
                        gridTemplateRows: `repeat(${GRID_SIZE}, ${cellSize}px)`,
                        gap: `${gridGap}px`,
                        position: 'relative',
                        zIndex: 1,
                    }}
                >
                    <AnimatePresence initial={false}>
                        {tiles}
                    </AnimatePresence>
                </div>

                {/* Floating Scores Overlay */}
                <div className="absolute inset-0 pointer-events-none z-50 overflow-visible">
                    <AnimatePresence>
                        {floatingScores.map((fs) => (
                            <motion.div
                                key={fs.id}
                                initial={{ opacity: 0, scale: 0.5, y: 0 }}
                                animate={{ opacity: 1, scale: 1.5, y: -80 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="absolute"
                                style={{
                                    left: `${fs.x}%`,
                                    top: `${fs.y}%`,
                                    transform: 'translateX(-50%)'
                                }}
                            >
                                <span className="font-black text-2xl text-yellow-500 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                                    {fs.value}
                                </span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Praise Overlay */}
                <AnimatePresence>
                    {activePraise && (
                        <motion.div
                            key={activePraise}
                            initial={{ opacity: 0, scale: 0.6, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.4, y: -20 }}
                            transition={{ duration: 0.4, type: 'spring', damping: 14 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none z-[100]"
                        >
                            <div className="bg-black/40 backdrop-blur-xl px-10 py-5 rounded-[2rem] border border-white/20 shadow-2xl">
                                <span className="font-black text-4xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 uppercase italic tracking-tight">
                                    {activePraise}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
});

GameGrid.propTypes = {
    grid: PropTypes.array,
    selectedCell: PropTypes.object,
    explodingCells: PropTypes.instanceOf(Set).isRequired,
    floatingScores: PropTypes.array.isRequired,
    activePraise: PropTypes.string,
    onCellTap: PropTypes.func.isRequired,
};

export default GameGrid;
