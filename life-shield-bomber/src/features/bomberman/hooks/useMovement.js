/**
 * useMovement — Player movement hook for Bomberman.
 * Handles keyboard (desktop) and exposes move function for on-screen controls (mobile).
 * Prevents moving through walls.
 */
import { useCallback, useEffect, useRef } from 'react';
import { CELL_TYPES, DIRECTIONS } from '../constants/gameConstants.js';
import { isInBounds } from '../utils/gridUtils.js';

export function useMovement(playerPos, gridRef, isPlaying, onMove) {
    const lastMoveRef = useRef(0);
    const MOVE_COOLDOWN = 120;

    const tryMove = useCallback((direction) => {
        if (!isPlaying) return;

        const now = Date.now();
        if (now - lastMoveRef.current < MOVE_COOLDOWN) return;

        const dir = DIRECTIONS[direction];
        if (!dir) return;

        const newRow = playerPos.row + dir.row;
        const newCol = playerPos.col + dir.col;

        if (!isInBounds(newRow, newCol)) return;

        const grid = gridRef.current;
        if (!grid) return;

        const targetCell = grid[newRow][newCol];

        if (targetCell.type === CELL_TYPES.WALL || targetCell.type === CELL_TYPES.RISK) {
            return;
        }

        if (targetCell.hasBomb) return;

        lastMoveRef.current = now;
        onMove(newRow, newCol);
    }, [playerPos, gridRef, isPlaying, onMove]);

    useEffect(() => {
        if (!isPlaying) return;

        const handleKeyDown = (e) => {
            const keyMap = {
                ArrowUp: 'UP',
                ArrowDown: 'DOWN',
                ArrowLeft: 'LEFT',
                ArrowRight: 'RIGHT',
                w: 'UP',
                W: 'UP',
                s: 'DOWN',
                S: 'DOWN',
                a: 'LEFT',
                A: 'LEFT',
                d: 'RIGHT',
                D: 'RIGHT',
            };

            const direction = keyMap[e.key];
            if (direction) {
                e.preventDefault();
                tryMove(direction);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, tryMove]);

    return { tryMove };
}
