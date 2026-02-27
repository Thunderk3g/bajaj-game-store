import { useRef, useCallback, useState, useEffect } from 'react';
import { CELL_TYPES } from '../constants/gameConstants.js';

const MONSTER_MOVE_INTERVAL = 500;
const INITIAL_MONSTERS = 5; // Spawn 5 monsters for higher difficulty
const MAX_MONSTERS = 8;
const SPAWN_INTERVAL = 30000;

const getRandomFreeCell = (grid, avoidRow, avoidCol) => {
    const freeCells = [];
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c].type === CELL_TYPES.FLOOR) {
                // Keep some distance from player/target
                if (Math.abs(r - avoidRow) > 2 || Math.abs(c - avoidCol) > 2) {
                    freeCells.push({ row: r, col: c });
                }
            }
        }
    }
    if (freeCells.length === 0) return null;
    return freeCells[Math.floor(Math.random() * freeCells.length)];
};

export function useMonsterSystem(gridRef) {
    const [monsters, setMonsters] = useState([]);
    const monstersRef = useRef([]);
    const lastMoveTimeRef = useRef(0);
    const lastSpawnTimeRef = useRef(0);
    const floatIdRef = useRef(0);

    const initMonsters = useCallback((playerRow, playerCol) => {
        const grid = gridRef.current;
        const initial = [];
        for (let i = 0; i < INITIAL_MONSTERS; i++) {
            const cell = getRandomFreeCell(grid, playerRow, playerCol);
            if (cell) {
                initial.push({
                    id: `monster-${++floatIdRef.current}`,
                    row: cell.row,
                    col: cell.col,
                    active: true,
                    type: 'base', // debt, inflation, etc. can be added later
                });
            }
        }
        monstersRef.current = initial;
        setMonsters(initial);
        lastSpawnTimeRef.current = Date.now();
        lastMoveTimeRef.current = Date.now();
    }, [gridRef]);

    const updateMonsters = useCallback((
        now,
        playerPos,
        isTimeFrozen,
        onHitPlayer
    ) => {
        if (!monstersRef.current.length) return;

        // Check if we need to spawn a new monster
        if (now - lastSpawnTimeRef.current >= SPAWN_INTERVAL) {
            lastSpawnTimeRef.current = now;
            if (monstersRef.current.filter(m => m.active).length < MAX_MONSTERS) {
                const cell = getRandomFreeCell(gridRef.current, playerPos.row, playerPos.col);
                if (cell) {
                    monstersRef.current.push({
                        id: `monster-${++floatIdRef.current}`,
                        row: cell.row,
                        col: cell.col,
                        active: true,
                        type: 'base'
                    });
                }
            }
        }

        if (isTimeFrozen) {
            setMonsters([...monstersRef.current]);
            return;
        }

        if (now - lastMoveTimeRef.current >= MONSTER_MOVE_INTERVAL) {
            lastMoveTimeRef.current = now;
            let changed = false;
            const grid = gridRef.current;

            monstersRef.current.forEach(monster => {
                if (!monster.active) return;

                const dirs = [
                    { r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 }
                ];

                // Keep moving in a direction or pick random valid
                // simple random roaming
                const validDirs = dirs.filter(d => {
                    const nr = monster.row + d.r;
                    const nc = monster.col + d.c;
                    if (nr < 0 || nr >= grid.length || nc < 0 || nc >= grid[0].length) return false;
                    const cell = grid[nr][nc];
                    return cell.type !== CELL_TYPES.WALL && cell.type !== CELL_TYPES.RISK;
                });

                if (validDirs.length > 0) {
                    const dir = validDirs[Math.floor(Math.random() * validDirs.length)];
                    monster.row += dir.r;
                    monster.col += dir.c;
                    changed = true;
                }

                // Check collision with player
                if (Math.abs(monster.row - playerPos.row) === 0 && Math.abs(monster.col - playerPos.col) === 0) {
                    onHitPlayer();
                }
            });

            if (changed) {
                setMonsters([...monstersRef.current]);
            }
        }
    }, [gridRef]);

    const removeMonster = useCallback((id) => {
        const monster = monstersRef.current.find(m => m.id === id);
        if (monster) {
            monster.active = false;
        }
        monstersRef.current = monstersRef.current.filter(m => m.active);
        setMonsters([...monstersRef.current]);
    }, []);

    const clearMonsters = useCallback(() => {
        monstersRef.current = [];
        setMonsters([]);
    }, []);

    return {
        monsters,
        monstersRef,
        initMonsters,
        updateMonsters,
        removeMonster,
        clearMonsters
    };
}
