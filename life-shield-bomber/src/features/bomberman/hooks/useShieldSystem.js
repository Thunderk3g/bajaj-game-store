import { useRef, useCallback, useState } from 'react';
import { CELL_TYPES, DIRECTIONS } from '../constants/gameConstants.js';

const SHIELD_SPEED = 8; // Tiles per second
const MAX_DISTANCE = 4;
const SHIELD_COOLDOWN = 2000;

export function useShieldSystem(gridRef) {
    const shieldsRef = useRef([]);
    const [shields, setShields] = useState([]);
    const lastFireTimeRef = useRef(0);
    const floatIdRef = useRef(0);

    const fireShield = useCallback((startRow, startCol, direction, isMulti = false) => {
        const now = Date.now();
        if (now - lastFireTimeRef.current < SHIELD_COOLDOWN) return;
        lastFireTimeRef.current = now;

        const baseDir = DIRECTIONS[direction];
        if (!baseDir) return;

        const createObj = (dirObj) => ({
            id: `sh-${++floatIdRef.current}`,
            row: startRow,
            col: startCol,
            startRow,
            startCol,
            dir: dirObj,
            distance: 0,
            active: true
        });

        const newShields = [createObj(baseDir)];

        if (isMulti) {
            if (baseDir.row === 0) {
                newShields.push(createObj(DIRECTIONS.UP));
                newShields.push(createObj(DIRECTIONS.DOWN));
            } else {
                newShields.push(createObj(DIRECTIONS.LEFT));
                newShields.push(createObj(DIRECTIONS.RIGHT));
            }
        }

        shieldsRef.current.push(...newShields);
        setShields([...shieldsRef.current]);
    }, []);

    /**
     * Shield only targets MONSTERS. It passes through risk blocks (ignores them).
     * It stops on walls and grid boundaries.
     */
    const updateShields = useCallback((deltaMs, onHitMonster, monstersRef, isPenetration) => {
        if (shieldsRef.current.length === 0) return;

        const tilesMoved = (deltaMs / 1000) * SHIELD_SPEED;
        const currentGrid = gridRef.current;

        shieldsRef.current = shieldsRef.current.filter(sh => {
            if (!sh.active) return false;

            sh.row += sh.dir.row * tilesMoved;
            sh.col += sh.dir.col * tilesMoved;
            sh.distance += Math.abs(sh.dir.row * tilesMoved) + Math.abs(sh.dir.col * tilesMoved);

            if (sh.distance >= MAX_DISTANCE) return false;

            const currRow = Math.round(sh.row);
            const currCol = Math.round(sh.col);

            // Boundary check
            if (currRow < 0 || currRow >= currentGrid.length || currCol < 0 || currCol >= currentGrid[0].length) {
                return false;
            }

            const targetCell = currentGrid[currRow][currCol];

            // Stop on walls only
            if (targetCell.type === CELL_TYPES.WALL) return false;

            // Shield passes THROUGH risk blocks — does NOT destroy them
            // Risk blocks are claimed by walking over them

            // Check monster collision
            if (monstersRef.current) {
                const hitMonster = monstersRef.current.find(
                    m => m.active && Math.abs(m.row - sh.row) < 0.8 && Math.abs(m.col - sh.col) < 0.8
                );

                if (hitMonster) {
                    onHitMonster(hitMonster.id);
                    return isPenetration ? true : false;
                }
            }

            return true;
        });

        setShields([...shieldsRef.current]);
    }, [gridRef]);

    const getCooldownProgress = useCallback(() => {
        const now = Date.now();
        const elapsed = now - lastFireTimeRef.current;
        return Math.min(1, elapsed / SHIELD_COOLDOWN);
    }, []);

    const clearShields = useCallback(() => {
        shieldsRef.current = [];
        setShields([]);
    }, []);

    return {
        shields,
        shieldsRef,
        fireShield,
        updateShields,
        getCooldownProgress,
        clearShields
    };
}
