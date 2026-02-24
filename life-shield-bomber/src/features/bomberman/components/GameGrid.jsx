/**
 * GameGrid — Renders the 9x9 Bomberman grid.
 * Memoized to prevent full grid re-renders on small updates.
 */
import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { CELL_TYPES, GRID_SIZE } from '../constants/gameConstants.js';
import PlayerCharacter from './PlayerCharacter.jsx';

const CellContent = memo(function CellContent({ cell, isPlayer, isExploding }) {
    if (isExploding) {
        return <div className="explosion-effect" />;
    }

    if (isPlayer) {
        return (
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <PlayerCharacter />
            </div>
        );
    }

    if (cell.hasBomb) {
        return (
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="animate-bomb-pulse flex items-center justify-center">
                    <span className="text-[1rem] drop-shadow-xl">💣</span>
                </div>
            </div>
        );
    }

    if (cell.type === CELL_TYPES.RISK && cell.riskData) {
        return (
            <div className="absolute inset-0 flex items-center justify-center">
                <div
                    className="w-[11px] h-[11px] flex items-center justify-center overflow-hidden"
                    title={cell.riskData.label}
                >
                    <span
                        className="text-[11px] leading-none select-none pointer-events-none display-block"
                        style={{ fontSize: '11px', width: '11px', height: '11px', textAlign: 'center' }}
                    >
                        {cell.riskData.icon}
                    </span>
                </div>
            </div>
        );
    }

    if (cell.type === CELL_TYPES.EXIT) {
        return (
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[1rem] animate-pulse drop-shadow-lg">🚪</span>
            </div>
        );
    }

    if (cell.type === CELL_TYPES.WALL) {
        return (
            <div className="absolute inset-[0.125rem] rounded-sm"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    border: '0.0625rem solid rgba(255,255,255,0.1)',
                }}
            />
        );
    }

    return null;
});

CellContent.propTypes = {
    cell: PropTypes.object.isRequired,
    isPlayer: PropTypes.bool.isRequired,
    isExploding: PropTypes.bool.isRequired,
};

const GameGrid = memo(function GameGrid({
    grid,
    playerPos,
    explosionCells,
    floatingScores,
    activePraise,
}) {
    const explosionSet = useMemo(() => {
        const set = new Set();
        if (explosionCells) {
            explosionCells.forEach(c => set.add(`${c.row},${c.col}`));
        }
        return set;
    }, [explosionCells]);

    const getCellClass = (cell) => {
        switch (cell.type) {
            case CELL_TYPES.WALL: return 'cell-wall';
            case CELL_TYPES.RISK: return 'cell-risk';
            case CELL_TYPES.EXIT: return 'cell-exit';
            default: return 'cell-floor';
        }
    };

    return (
        <div className="relative w-full max-w-[30rem] mx-auto px-4 py-6">
            {/* Grid glow behind */}
            <div
                className="absolute inset-0 -z-10"
                style={{
                    background: 'radial-gradient(circle at center, rgba(59,130,246,0.12) 0%, transparent 75%)',
                    filter: 'blur(2rem)',
                }}
            />

            <div
                className="bomber-grid border-2 border-white/10 shadow-lg"
                style={{
                    gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                    aspectRatio: '1',
                }}
            >
                {grid.map((row, r) =>
                    row.map((cell, c) => {
                        const isPlayer = playerPos.row === r && playerPos.col === c;
                        const isExploding = explosionSet.has(`${r},${c}`);

                        return (
                            <div
                                key={`${r}-${c}`}
                                className={`grid-cell ${getCellClass(cell)}`}
                                style={{
                                    border: '1px solid rgba(255,255,255,0.05)',
                                }}
                            >
                                <CellContent
                                    cell={cell}
                                    isPlayer={isPlayer}
                                    isExploding={isExploding}
                                />
                            </div>
                        );
                    })
                )}
            </div>

            {/* Floating Scores */}
            {floatingScores.map(fs => (
                <div
                    key={fs.id}
                    className="float-point"
                    style={{
                        top: `${(fs.row / GRID_SIZE) * 100}%`,
                        left: `${(fs.col / GRID_SIZE) * 100}%`,
                    }}
                >
                    {fs.value}
                </div>
            ))}

            {/* Praise Overlay */}
            {activePraise && (
                <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <div className="animate-pop-in px-8 py-3 rounded-xl bg-[#0F2A55]/95 backdrop-blur-md border-2 border-bb-accent shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                        <span className="font-display text-xl font-black text-white uppercase tracking-tighter drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-300">
                            {activePraise}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
});

GameGrid.propTypes = {
    grid: PropTypes.array.isRequired,
    playerPos: PropTypes.object.isRequired,
    explosionCells: PropTypes.array.isRequired,
    floatingScores: PropTypes.array.isRequired,
    activePraise: PropTypes.string,
};

export default GameGrid;
