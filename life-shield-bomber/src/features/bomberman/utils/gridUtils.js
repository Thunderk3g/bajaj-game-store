/**
 * Grid Utilities — Generates and manages the 9x9 Bomberman grid.
 * Walls form a classic bomberman pattern with risk blocks as destructibles.
 */
import {
    GRID_SIZE,
    CELL_TYPES,
    RISK_TYPES,
} from '../constants/gameConstants.js';

/**
 * Check if position is within grid bounds.
 */
export function isInBounds(row, col) {
    return row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE;
}

/**
 * Generate the initial grid layout.
 * Pattern:
 *   - Border cells = WALL (indestructible)
 *   - Even row & even col (interior) = WALL (indestructible pillars)
 *   - Random cells = RISK blocks (~40% of remaining floor)
 *   - Player start (1,1) and adjacent cells = always FLOOR
 *   - Exit at bottom-right corner area
 */
export function generateGrid() {
    const grid = [];

    for (let r = 0; r < GRID_SIZE; r++) {
        const row = [];
        for (let c = 0; c < GRID_SIZE; c++) {
            if (r === 0 || c === 0 || r === GRID_SIZE - 1 || c === GRID_SIZE - 1) {
                row.push(createCell(r, c, CELL_TYPES.WALL));
            } else if (r % 2 === 0 && c % 2 === 0) {
                row.push(createCell(r, c, CELL_TYPES.WALL));
            } else {
                row.push(createCell(r, c, CELL_TYPES.FLOOR));
            }
        }
        grid.push(row);
    }

    const safeZone = new Set(['1,1', '1,2', '2,1', '1,3', '3,1']);
    const exitZone = new Set([
        `${GRID_SIZE - 2},${GRID_SIZE - 2}`,
        `${GRID_SIZE - 2},${GRID_SIZE - 3}`,
        `${GRID_SIZE - 3},${GRID_SIZE - 2}`,
    ]);

    for (let r = 1; r < GRID_SIZE - 1; r++) {
        for (let c = 1; c < GRID_SIZE - 1; c++) {
            const key = `${r},${c}`;
            if (
                grid[r][c].type === CELL_TYPES.FLOOR &&
                !safeZone.has(key) &&
                !exitZone.has(key)
            ) {
                if (Math.random() < 0.4) {
                    const risk = RISK_TYPES[Math.floor(Math.random() * RISK_TYPES.length)];
                    grid[r][c] = createCell(r, c, CELL_TYPES.RISK, risk);
                }
            }
        }
    }

    grid[GRID_SIZE - 2][GRID_SIZE - 2] = createCell(
        GRID_SIZE - 2,
        GRID_SIZE - 2,
        CELL_TYPES.EXIT
    );

    return grid;
}

/**
 * Create a cell object.
 */
function createCell(row, col, type, riskData = null) {
    return {
        row,
        col,
        type,
        riskData,
        hasBomb: false,
        isExploding: false,
    };
}

/**
 * Get explosion target cells (cross pattern with radius).
 */
export function getExplosionCells(grid, bombRow, bombCol, radius) {
    const cells = [{ row: bombRow, col: bombCol }];

    const directions = [
        { dr: -1, dc: 0 },
        { dr: 1, dc: 0 },
        { dr: 0, dc: -1 },
        { dr: 0, dc: 1 },
    ];

    for (const { dr, dc } of directions) {
        for (let i = 1; i <= radius; i++) {
            const nr = bombRow + dr * i;
            const nc = bombCol + dc * i;

            if (!isInBounds(nr, nc)) break;

            const cell = grid[nr][nc];
            if (cell.type === CELL_TYPES.WALL) break;

            cells.push({ row: nr, col: nc });

            if (cell.type === CELL_TYPES.RISK) break;
        }
    }

    return cells;
}

/**
 * Deep clone grid.
 */
export function cloneGrid(grid) {
    return grid.map(row => row.map(cell => ({ ...cell })));
}

/**
 * Count remaining risk blocks.
 */
export function countRisks(grid) {
    let count = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c].type === CELL_TYPES.RISK) count++;
        }
    }
    return count;
}

/**
 * Calculate normalized score (0–100).
 */
export function computeFinalScore(risksDestroyed, healthRemaining, timeRemaining) {
    const rawScore = risksDestroyed * 10;
    const healthBonus = healthRemaining * 5;
    const timeBonus = Math.floor(timeRemaining * 0.5);
    const totalRaw = rawScore + healthBonus + timeBonus;

    const maxPossible = 200;
    const normalized = Math.round(Math.min((totalRaw / maxPossible) * 100, 100));

    return Math.max(0, normalized);
}
