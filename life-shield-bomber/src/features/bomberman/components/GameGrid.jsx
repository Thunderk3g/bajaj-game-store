/**
 * GameGrid — Renders the 9x9 Shield Guardian grid.
 * Shields, monsters, and powerups are overlaid using the grid container ref
 * so they never escape the grid boundary.
 */
import { memo, useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { CELL_TYPES, GRID_SIZE } from '../constants/gameConstants.js';
import { POWERUP_TYPES } from '../hooks/usePowerupSystem.js';
import PlayerCharacter from './PlayerCharacter.jsx';
import { Shield, Zap, Heart, Snowflake } from 'lucide-react';

const CellContent = memo(function CellContent({ cell, isPlayer, isInvulnerable }) {
    if (isPlayer) {
        return (
            <div className={`absolute inset-0 flex items-center justify-center z-10 transition-opacity ${isInvulnerable ? 'opacity-50 animate-pulse' : 'opacity-100'}`}>
                <PlayerCharacter />
                {/* Spotlight under player */}
                <div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        width: '150%', height: '150%',
                        background: 'radial-gradient(circle, rgba(30,94,255,0.25) 0%, transparent 70%)',
                        zIndex: -1,
                    }}
                />
            </div>
        );
    }

    if (cell.type === CELL_TYPES.RISK && cell.riskData) {
        return (
            <div className="absolute inset-0 flex items-center justify-center">
                <span
                    className="select-none pointer-events-none drop-shadow-lg"
                    style={{ fontSize: '2rem', lineHeight: 1 }}
                    title={cell.riskData.label}
                >
                    {cell.riskData.icon}
                </span>
            </div>
        );
    }

    if (cell.type === CELL_TYPES.EXIT) {
        return (
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[1.2rem] animate-pulse drop-shadow-lg">🚪</span>
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
    isInvulnerable: PropTypes.bool,
};

const GameGrid = memo(function GameGrid({
    grid,
    playerPos,
    shields = [],
    monsters = [],
    activePowerup,
    floatingScores,
    activePraise,
    isInvulnerable,
}) {
    const gridContainerRef = useRef(null);
    const [gridRect, setGridRect] = useState(null);

    // Measure the actual grid container so overlays stay inside it
    useEffect(() => {
        const measure = () => {
            if (gridContainerRef.current) {
                const rect = gridContainerRef.current.getBoundingClientRect();
                setGridRect({ width: rect.width, height: rect.height });
            }
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    const getCellClass = (cell) => {
        switch (cell.type) {
            case CELL_TYPES.WALL: return 'cell-wall';
            case CELL_TYPES.RISK: return 'cell-risk';
            case CELL_TYPES.EXIT: return 'cell-exit';
            default: return 'cell-floor';
        }
    };

    const cellSize = gridRect ? gridRect.width / GRID_SIZE : 0;

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

            {/* Grid Container — all overlays are relative to this */}
            <div
                ref={gridContainerRef}
                className="bomber-grid border-2 border-white/10 shadow-lg relative overflow-hidden"
                style={{
                    gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                    aspectRatio: '1',
                }}
            >
                {grid.map((row, r) =>
                    row.map((cell, c) => {
                        const isPlayer = playerPos.row === r && playerPos.col === c;

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
                                    isInvulnerable={isInvulnerable}
                                />
                            </div>
                        );
                    })
                )}

                {/* ── Overlay layers positioned INSIDE the grid ── */}

                {/* Shields */}
                {cellSize > 0 && shields.map(sh => (
                    <div
                        key={sh.id}
                        className="absolute z-30 pointer-events-none"
                        style={{
                            width: cellSize,
                            height: cellSize,
                            top: sh.row * cellSize,
                            left: sh.col * cellSize,
                        }}
                    >
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div
                                className="rounded-full animate-pulse"
                                style={{
                                    width: '60%',
                                    height: '60%',
                                    background: 'radial-gradient(circle, rgba(30,94,255,0.9) 0%, rgba(59,130,246,0.4) 100%)',
                                    boxShadow: '0 0 12px rgba(30,94,255,0.8), 0 0 24px rgba(59,130,246,0.4)',
                                    border: '2px solid rgba(255,255,255,0.6)',
                                }}
                            />
                        </div>
                    </div>
                ))}

                {/* Powerup */}
                {cellSize > 0 && activePowerup && (
                    <div
                        className="absolute z-20 pointer-events-none"
                        style={{
                            width: cellSize,
                            height: cellSize,
                            top: activePowerup.row * cellSize,
                            left: activePowerup.col * cellSize,
                        }}
                    >
                        <div className="absolute inset-0 flex items-center justify-center animate-bounce">
                            <div
                                className="flex items-center justify-center rounded-full"
                                style={{
                                    width: '70%',
                                    height: '70%',
                                    background: 'radial-gradient(circle, rgba(34,211,238,0.25) 0%, transparent 100%)',
                                    boxShadow: '0 0 15px rgba(34,211,238,0.5)',
                                    border: '1.5px solid rgba(34,211,238,0.6)',
                                }}
                            >
                                {activePowerup.type === POWERUP_TYPES.MULTI_SHIELD && <Shield className="w-4 h-4 text-cyan-200" />}
                                {activePowerup.type === POWERUP_TYPES.SHIELD_PENETRATION && <Zap className="w-4 h-4 text-yellow-200" />}
                                {activePowerup.type === POWERUP_TYPES.TIME_FREEZE && <Snowflake className="w-4 h-4 text-blue-200" />}
                                {activePowerup.type === POWERUP_TYPES.HEALTH_RESTORE && <Heart className="w-4 h-4 text-red-400" />}
                            </div>
                        </div>
                    </div>
                )}

                {/* Monsters */}
                {cellSize > 0 && monsters.map(monster => (
                    <div
                        key={monster.id}
                        className="absolute z-20 pointer-events-none transition-all duration-300"
                        style={{
                            width: cellSize,
                            height: cellSize,
                            top: monster.row * cellSize,
                            left: monster.col * cellSize,
                        }}
                    >
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div
                                className="rotate-45 flex items-center justify-center overflow-hidden"
                                style={{
                                    width: '65%',
                                    height: '65%',
                                    background: 'rgba(0,0,0,0.5)',
                                    border: '2px solid #EF4444',
                                    boxShadow: 'inset 0 0 10px rgba(239,68,68,0.8), 0 0 12px rgba(239,68,68,0.5)',
                                }}
                            >
                                <div className="w-1/2 h-1/2 bg-red-500/60 rounded-full animate-pulse blur-[2px]" />
                            </div>
                        </div>
                    </div>
                ))}

                {/* Floating Scores — inside grid */}
                {floatingScores.map(fs => (
                    <div
                        key={fs.id}
                        className="float-point absolute z-50 pointer-events-none"
                        style={{
                            top: `${(fs.row / GRID_SIZE) * 100}%`,
                            left: `${(fs.col / GRID_SIZE) * 100}%`,
                        }}
                    >
                        {fs.value}
                    </div>
                ))}

            </div>
        </div>
    );
});

GameGrid.propTypes = {
    grid: PropTypes.array.isRequired,
    playerPos: PropTypes.object.isRequired,
    shields: PropTypes.array,
    monsters: PropTypes.array,
    activePowerup: PropTypes.object,
    floatingScores: PropTypes.array.isRequired,
    activePraise: PropTypes.string,
    isInvulnerable: PropTypes.bool,
};

export default GameGrid;
