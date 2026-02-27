import React from 'react';
import Tetromino from './Tetromino';
import { GRID_WIDTH, GRID_HEIGHT } from '../constants/gridConfig';

const GameBoard = ({ grid, currentPiece, ghostPiece, onBoardClick }) => {
    return (
        <div
            onClick={onBoardClick}
            className="relative w-full aspect-[10/14] bg-[#020210] border-[2px] border-blue-500/50 rounded-lg shadow-2xl overflow-hidden cursor-pointer"
        >
            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                {Array.from({ length: GRID_HEIGHT }).map((_, y) => (
                    <div key={`y-${y}`} className="absolute w-full border-b border-blue-400" style={{ top: `${(y / GRID_HEIGHT) * 100}%`, height: '1px' }}></div>
                ))}
                {Array.from({ length: GRID_WIDTH }).map((_, x) => (
                    <div key={`x-${x}`} className="absolute top-0 bottom-0 border-r border-blue-400 h-full" style={{ left: `${(x / GRID_WIDTH) * 100}%`, width: '1px' }}></div>
                ))}
            </div>

            {/* Render Settled Pieces */}
            {grid.map((row, y) =>
                row.map((cell, x) => {
                    if (cell && cell.filled) {
                        return (
                            <div
                                key={`settled-${x}-${y}`}
                                className={`absolute tetris-block rounded-[1px] bg-${cell.color} ${cell.bursting ? 'animate-burst z-10' : ''}`}
                                style={{
                                    width: `${100 / GRID_WIDTH}%`,
                                    height: `${100 / GRID_HEIGHT}%`,
                                    left: `${(x / GRID_WIDTH) * 100}%`,
                                    top: `${(y / GRID_HEIGHT) * 100}%`,
                                }}
                            />
                        );
                    }
                    return null;
                })
            )}

            {/* Render Ghost Piece */}
            {ghostPiece && (
                <Tetromino
                    shape={ghostPiece.shape}
                    color={ghostPiece.color}
                    pos={ghostPiece.pos}
                    gridWidth={GRID_WIDTH}
                    gridHeight={GRID_HEIGHT}
                    className="opacity-30"
                />
            )}

            {/* Render Current Active Piece */}
            {currentPiece && (
                <Tetromino
                    shape={currentPiece.shape}
                    color={currentPiece.color}
                    pos={currentPiece.pos}
                    gridWidth={GRID_WIDTH}
                    gridHeight={GRID_HEIGHT}
                />
            )}
        </div>
    );
};

export default GameBoard;
