/**
 * useBombSystem — Manages bomb placement, detonation, and explosion effects.
 * Bomb explodes after BOMB_TIMER_MS, clears risk blocks in cross pattern.
 */
import { useCallback, useRef } from 'react';
import {
    BOMB_TIMER_MS,
    BOMB_RADIUS,
    POINTS_PER_RISK,
    CELL_TYPES,
} from '../constants/gameConstants.js';
import { getExplosionCells, cloneGrid } from '../utils/gridUtils.js';

export function useBombSystem(gridRef, playerPosRef, isPlayingRef, callbacks) {
    const activeBombRef = useRef(null);
    const bombTimerRef = useRef(null);

    const {
        onGridUpdate,
        onExplosionStart,
        onExplosionEnd,
        onRisksDestroyed,
        onPlayerDamage,
        onScoreUpdate,
    } = callbacks;

    const placeBomb = useCallback(() => {
        if (!isPlayingRef.current) return;
        if (activeBombRef.current) return;

        const pos = playerPosRef.current;
        const grid = gridRef.current;
        if (!grid) return;

        const cell = grid[pos.row][pos.col];
        if (cell.hasBomb) return;

        const newGrid = cloneGrid(grid);
        newGrid[pos.row][pos.col].hasBomb = true;
        onGridUpdate(newGrid);

        activeBombRef.current = { row: pos.row, col: pos.col };

        bombTimerRef.current = setTimeout(() => {
            detonateBomb(pos.row, pos.col);
        }, BOMB_TIMER_MS);
    }, []);

    const detonateBomb = useCallback((bombRow, bombCol) => {
        const grid = gridRef.current;
        if (!grid) return;

        const explosionCells = getExplosionCells(grid, bombRow, bombCol, BOMB_RADIUS);

        onExplosionStart(explosionCells);

        const newGrid = cloneGrid(grid);
        let risksDestroyed = 0;

        newGrid[bombRow][bombCol].hasBomb = false;

        for (const { row, col } of explosionCells) {
            newGrid[row][col].isExploding = true;

            if (newGrid[row][col].type === CELL_TYPES.RISK) {
                newGrid[row][col].type = CELL_TYPES.FLOOR;
                newGrid[row][col].riskData = null;
                risksDestroyed++;
            }
        }

        onGridUpdate(newGrid);

        const playerPos = playerPosRef.current;
        const playerHit = explosionCells.some(
            c => c.row === playerPos.row && c.col === playerPos.col
        );

        if (playerHit) {
            onPlayerDamage();
        }

        if (risksDestroyed > 0) {
            onRisksDestroyed(risksDestroyed);
            onScoreUpdate(risksDestroyed * POINTS_PER_RISK);
        }

        setTimeout(() => {
            const cleanGrid = cloneGrid(gridRef.current);
            for (let r = 0; r < cleanGrid.length; r++) {
                for (let c = 0; c < cleanGrid[r].length; c++) {
                    cleanGrid[r][c].isExploding = false;
                }
            }
            onGridUpdate(cleanGrid);
            onExplosionEnd();
            activeBombRef.current = null;
        }, 500);
    }, []);

    const cleanup = useCallback(() => {
        if (bombTimerRef.current) {
            clearTimeout(bombTimerRef.current);
            bombTimerRef.current = null;
        }
        activeBombRef.current = null;
    }, []);

    useEffect_keyboard(isPlayingRef, placeBomb);

    return { placeBomb, cleanup, hasBomb: activeBombRef };
}

/**
 * Keyboard listener for bomb placement (Space / Enter).
 */
function useEffect_keyboard(isPlayingRef, placeBomb) {
    if (typeof window === 'undefined') return;

    const handler = (e) => {
        if (!isPlayingRef.current) return;
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            placeBomb();
        }
    };

    window.addEventListener('keydown', handler);

    return () => window.removeEventListener('keydown', handler);
}
