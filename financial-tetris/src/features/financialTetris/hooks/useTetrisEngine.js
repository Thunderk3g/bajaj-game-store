import { useState, useEffect, useCallback, useRef } from 'react';
import { createGrid } from '../utils/createGrid';
import { randomTetromino } from '../utils/tetrominoShapes';
import { checkCollision } from '../utils/collisionDetector';
import { rotate } from '../utils/rotateMatrix';
import { clearCompletedLines } from '../utils/clearCompletedLines';
import { calculateSpeed } from '../utils/speedCalculator';
import { GAME_STATUS, INITIAL_SPEED } from '../constants/gameConfig';
import { GRID_WIDTH, GRID_HEIGHT } from '../constants/gridConfig';

export const useTetrisEngine = () => {
    const [grid, setGrid] = useState(createGrid());
    const [gameStatus, setGameStatus] = useState(GAME_STATUS.IDLE);
    const [currentPiece, setCurrentPiece] = useState(null);
    const [nextPiece, setNextPiece] = useState(randomTetromino());
    const [score, setScore] = useState(0);
    const [linesCleared, setLinesCleared] = useState(0);
    const [speed, setSpeed] = useState(INITIAL_SPEED);
    const [milestoneMessage, setMilestoneMessage] = useState(null);
    const [showMilestone, setShowMilestone] = useState(false);
    const [ghostPiece, setGhostPiece] = useState(null);

    const gameLoopRef = useRef(null);

    const spawnPiece = useCallback(() => {
        const piece = nextPiece;
        const newNextPiece = randomTetromino();

        const pos = { x: Math.floor(GRID_WIDTH / 2) - 1, y: 0 };

        if (checkCollision({ ...piece, pos }, grid, { x: 0, y: 0 })) {
            setGameStatus(GAME_STATUS.LOST);
            return;
        }

        setCurrentPiece({ ...piece, pos });
        setNextPiece(newNextPiece);
    }, [nextPiece, grid]);

    const updateGhostPiece = useCallback((piece) => {
        if (!piece) {
            setGhostPiece(null);
            return;
        }
        let ghostPos = { ...piece.pos };
        while (!checkCollision({ ...piece, pos: ghostPos }, grid, { x: 0, y: 1 })) {
            ghostPos.y += 1;
        }
        setGhostPiece({ ...piece, pos: ghostPos });
    }, [grid]);

    useEffect(() => {
        updateGhostPiece(currentPiece);
    }, [currentPiece, updateGhostPiece]);

    const startGame = () => {
        setGrid(createGrid());
        setScore(0);
        setLinesCleared(0);
        setSpeed(INITIAL_SPEED);
        setGameStatus(GAME_STATUS.PLAYING);
        const firstPiece = randomTetromino();
        const next = randomTetromino();
        setCurrentPiece({ ...firstPiece, pos: { x: Math.floor(GRID_WIDTH / 2) - 1, y: 0 } });
        setNextPiece(next);
    };

    const lockPiece = useCallback(() => {
        const newGrid = [...grid.map(row => [...row])];
        if (currentPiece) {
            currentPiece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        const gridY = y + currentPiece.pos.y;
                        const gridX = x + currentPiece.pos.x;
                        if (gridY >= 0 && gridY < GRID_HEIGHT && gridX >= 0 && gridX < GRID_WIDTH) {
                            newGrid[gridY][gridX] = { filled: true, color: currentPiece.color };
                        }
                    }
                });
            });
        }

        const { clearedIndices, removeLines } = clearCompletedLines(newGrid);

        if (clearedIndices.length > 0) {
            // Mark lines as bursting without removing them yet
            const burstingGrid = newGrid.map((row, idx) =>
                clearedIndices.includes(idx) ? row.map(cell => ({ ...cell, bursting: true })) : row
            );

            // Hide the piece overlay immediately so it crushes with the row visually
            setCurrentPiece(null);
            setGhostPiece(null);
            setGrid(burstingGrid);
            setGameStatus(GAME_STATUS.CLEARING);

            // Wait for animation
            setTimeout(() => {
                const { newGrid: finalGrid, linesCleared: lines } = removeLines(burstingGrid);
                setLinesCleared(prev => prev + lines);
                setScore(prev => prev + (lines * 100));
                setGrid(finalGrid);
                setGameStatus(GAME_STATUS.LINE_CLEARED);
            }, 400);
        } else {
            setGrid(newGrid);
            spawnPiece();
        }
    }, [currentPiece, grid, spawnPiece]);

    const moveDown = useCallback(() => {
        if (!currentPiece || gameStatus !== GAME_STATUS.PLAYING) return;
        if (!checkCollision(currentPiece, grid, { x: 0, y: 1 })) {
            setCurrentPiece(prev => ({ ...prev, pos: { ...prev.pos, y: prev.pos.y + 1 } }));
        } else {
            lockPiece();
        }
    }, [currentPiece, grid, gameStatus, lockPiece]);

    const moveLeft = useCallback(() => {
        if (!currentPiece || gameStatus !== GAME_STATUS.PLAYING) return;
        if (!checkCollision(currentPiece, grid, { x: -1, y: 0 })) {
            const newPos = { ...currentPiece.pos, x: currentPiece.pos.x - 1 };
            const newPiece = { ...currentPiece, pos: newPos };
            setCurrentPiece(newPiece);
        }
    }, [currentPiece, grid, gameStatus]);

    const moveRight = useCallback(() => {
        if (!currentPiece || gameStatus !== GAME_STATUS.PLAYING) return;
        if (!checkCollision(currentPiece, grid, { x: 1, y: 0 })) {
            const newPos = { ...currentPiece.pos, x: currentPiece.pos.x + 1 };
            const newPiece = { ...currentPiece, pos: newPos };
            setCurrentPiece(newPiece);
        }
    }, [currentPiece, grid, gameStatus]);

    const rotatePiece = useCallback(() => {
        if (!currentPiece || gameStatus !== GAME_STATUS.PLAYING) return;
        const rotatedShape = rotate(currentPiece.shape);

        // Wall Kick Logic
        const kicks = [0, 1, -1, 2, -2];

        for (let kick of kicks) {
            const kickedPos = { ...currentPiece.pos, x: currentPiece.pos.x + kick };
            const rotatedPiece = { ...currentPiece, shape: rotatedShape, pos: kickedPos };

            if (!checkCollision(rotatedPiece, grid, { x: 0, y: 0 })) {
                setCurrentPiece(rotatedPiece);
                return;
            }
        }
    }, [currentPiece, grid, gameStatus]);

    // Instant Lock removed to prevent render loop
    // Will move logic to handlers

    // Custom useInterval hook to prevent timer reset on re-renders
    const useInterval = (callback, delay) => {
        const savedCallback = useRef();

        useEffect(() => {
            savedCallback.current = callback;
        }, [callback]);

        useEffect(() => {
            function tick() {
                if (savedCallback.current) savedCallback.current();
            }
            if (delay !== null) {
                const id = setInterval(tick, delay);
                return () => clearInterval(id);
            }
        }, [delay]);
    };

    useInterval(() => {
        if (gameStatus === GAME_STATUS.PLAYING) {
            moveDown();
        }
    }, gameStatus === GAME_STATUS.PLAYING ? speed : null);

    useEffect(() => {
        setSpeed(calculateSpeed(linesCleared));
    }, [linesCleared]);

    return {
        grid,
        currentPiece,
        nextPiece,
        score,
        linesCleared,
        speed,
        gameStatus,
        setGameStatus,
        startGame,
        moveLeft,
        moveRight,
        moveDown,
        rotatePiece,
        spawnPiece,
        ghostPiece,
        resetGame: startGame
    };
};
