/**
 * GameGrid — Performance-Optimized Game Board
 * ══════════════════════════════════════════════════════════
 * OPTIMIZATIONS:
 * - Removed AnimatePresence from floating scores (use CSS animation)
 * - Removed Framer Motion from praise overlay (use CSS animation)
 * - Stable keys for empty cells (no Math.random() keys)
 * - Tutorial uses CSS animation instead of Framer Motion
 * - ResizeObserver throttled via RAF
 * ══════════════════════════════════════════════════════════
 */
import { memo, useCallback, useRef, useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { GRID_SIZE } from '../../../core/matchEngine/index.js';
import GameTile from './GameTile.jsx';

const GameGrid = memo(function GameGrid({
    grid,
    selectedCell,
    explodingCells,
    floatingScores,
    activePraise,
    onCellTap,
    attemptSwap,
}) {
    const containerRef = useRef(null);
    const [cellSize, setCellSize] = useState(48);
    const [showTutorial, setShowTutorial] = useState(true);

    // Tutorial Timer — auto-dismiss after 2.5s
    useEffect(() => {
        const t = setTimeout(() => setShowTutorial(false), 2500);
        return () => clearTimeout(t);
    }, []);

    // Responsive Cell Sizing (RAF-throttled)
    useEffect(() => {
        if (!containerRef.current) return;
        let rafId = null;
        const observer = new ResizeObserver((entries) => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                const width = entries[0].contentRect.width;
                const availableW = width - 24;
                const maxByWidth = Math.floor(availableW / GRID_SIZE);
                setCellSize(Math.max(42, Math.min(64, maxByWidth)));
            });
        });
        observer.observe(containerRef.current);
        return () => {
            observer.disconnect();
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, []);

    const handleTap = useCallback(
        (row, col) => onCellTap(row, col),
        [onCellTap]
    );

    const handleSwipe = useCallback((row, col, direction) => {
        if (!attemptSwap) return;
        let tRow = row;
        let tCol = col;
        if (direction === 'UP') tRow -= 1;
        if (direction === 'DOWN') tRow += 1;
        if (direction === 'LEFT') tCol -= 1;
        if (direction === 'RIGHT') tCol += 1;

        if (tRow >= 0 && tRow < GRID_SIZE && tCol >= 0 && tCol < GRID_SIZE) {
            attemptSwap(row, col, tRow, tCol);
        }
    }, [attemptSwap]);

    // Memoize grid style to avoid object re-creation
    const gridStyle = useMemo(() => ({
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_SIZE}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${GRID_SIZE}, ${cellSize}px)`,
        gap: '4px',
        position: 'relative',
        zIndex: 1,
        padding: '2px',
    }), [cellSize]);

    if (!grid) return null;

    return (
        <div
            ref={containerRef}
            className="relative flex-1 w-full max-w-[600px] flex items-center justify-center p-4 z-10"
        >
            {/* Board Container — lightweight glass effect */}
            <div className="board-container relative p-3 rounded-2xl">

                <div style={gridStyle}>
                    {grid.map((row, rowIdx) =>
                        row.map((tile, colIdx) => {
                            if (!tile) {
                                return (
                                    <div
                                        key={`empty-${rowIdx}-${colIdx}`}
                                        style={{ width: cellSize, height: cellSize }}
                                    />
                                );
                            }

                            const isSelected = selectedCell?.row === tile.row && selectedCell?.col === tile.col;
                            const isExploding = explodingCells.has(`${tile.row}-${tile.col}`);

                            return (
                                <GameTile
                                    key={tile.id}
                                    tile={tile}
                                    isSelected={isSelected}
                                    isExploding={isExploding}
                                    onTap={handleTap}
                                    onSwipe={handleSwipe}
                                    cellSize={cellSize}
                                />
                            );
                        })
                    )}
                </div>

                {/* Tutorial Overlay — CSS-only animation */}
                {showTutorial && (
                    <div className="tutorial-overlay">
                        <div className="tutorial-hand">
                            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v0" />
                                <path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2" />
                                <path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8" />
                                <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                            </svg>
                            <span className="tutorial-label">Swipe to Swap!</span>
                        </div>
                    </div>
                )}

                {/* Floating Scores — CSS animation, no Framer Motion */}
                {floatingScores.map((fs) => (
                    <div
                        key={fs.id}
                        className="float-score"
                        style={{
                            top: `${fs.y}%`,
                            left: `${fs.x}%`,
                        }}
                    >
                        {fs.value}
                    </div>
                ))}

                {/* Praise Overlay — CSS animation */}
                {activePraise && (
                    <div className="praise-overlay" key={activePraise}>
                        <div className="praise-badge">
                            <span className="praise-text">{activePraise}</span>
                        </div>
                    </div>
                )}
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
    attemptSwap: PropTypes.func,
};

export default GameGrid;
