import { useRef, useCallback, useState } from 'react';
import { CELL_TYPES } from '../constants/gameConstants.js';

const POWERUP_SPAWN_INTERVAL = 20000;
const POWERUP_DURATION = 6000;

export const POWERUP_TYPES = {
    MULTI_SHIELD: 'MULTI_SHIELD',
    SHIELD_PENETRATION: 'SHIELD_PENETRATION',
    TIME_FREEZE: 'TIME_FREEZE',
    HEALTH_RESTORE: 'HEALTH_RESTORE'
};

const getRandomPowerup = () => {
    const types = Object.values(POWERUP_TYPES);
    return types[Math.floor(Math.random() * types.length)];
};

export function usePowerupSystem(gridRef) {
    const [activePowerup, setActivePowerup] = useState(null);
    const powerupRef = useRef(null);
    const lastSpawnTimeRef = useRef(0);

    const checkPowerupSpawn = useCallback((now) => {
        if (powerupRef.current) {
            // Check if it should disappear
            if (now - powerupRef.current.spawnedAt >= POWERUP_DURATION) {
                powerupRef.current = null;
                setActivePowerup(null);
            }
            return;
        }

        if (now - lastSpawnTimeRef.current >= POWERUP_SPAWN_INTERVAL) {
            lastSpawnTimeRef.current = now;

            // Find empty cell
            const grid = gridRef.current;
            const freeCells = [];
            for (let r = 0; r < grid.length; r++) {
                for (let c = 0; c < grid[r].length; c++) {
                    if (grid[r][c].type === CELL_TYPES.FLOOR) {
                        freeCells.push({ row: r, col: c });
                    }
                }
            }

            if (freeCells.length > 0) {
                const cell = freeCells[Math.floor(Math.random() * freeCells.length)];
                powerupRef.current = {
                    id: `pu-${Date.now()}`,
                    row: cell.row,
                    col: cell.col,
                    type: getRandomPowerup(),
                    spawnedAt: now
                };
                setActivePowerup({ ...powerupRef.current });
            }
        }
    }, [gridRef]);

    const collectPowerup = useCallback((playerRow, playerCol) => {
        if (!powerupRef.current) return null;

        if (powerupRef.current.row === playerRow && powerupRef.current.col === playerCol) {
            const collected = { ...powerupRef.current };
            powerupRef.current = null;
            setActivePowerup(null);
            return collected;
        }
        return null;
    }, []);

    const clearPowerups = useCallback(() => {
        powerupRef.current = null;
        setActivePowerup(null);
        lastSpawnTimeRef.current = 0;
    }, []);

    return {
        activePowerup,
        checkPowerupSpawn,
        collectPowerup,
        clearPowerups
    };
}
