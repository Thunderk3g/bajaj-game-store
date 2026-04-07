import { GAME_DURATION, INCOME_PILLARS } from '../../../constants/game.js';
import { generatePuzzle } from '../utils/gridGenerator.js';
import { isPuzzleComplete, isDropValid } from '../utils/validators.js';

export const GAME_PHASES = {
    INTRO: 'intro',
    PLAYING: 'playing',
    WON: 'won',
    TIMEUP: 'timeup',
    LEAD_CAPTURE: 'lead_capture',
};

export const ACTIONS = {
    START_GAME: 'START_GAME',
    TICK: 'TICK',
    SET_DRAGGED: 'SET_DRAGGED',
    CLEAR_DRAGGED: 'CLEAR_DRAGGED',
    DROP_CELL: 'DROP_CELL',
    CLEAR_CELL: 'CLEAR_CELL',
    GAME_WON: 'GAME_WON',
    GAME_TIMEUP: 'GAME_TIMEUP',
    RESTART: 'RESTART',
};

function buildAvailableBlocks(userGrid, prefilled) {
    const placedIds = {};
    INCOME_PILLARS.forEach((p) => {
        placedIds[p.id] = 0;
    });

    userGrid.forEach((row, r) =>
        row.forEach((val, c) => {
            if (val !== null && prefilled.has(`${r}-${c}`)) {
                placedIds[val] = (placedIds[val] || 0) + 1;
            }
        })
    );

    // Each pillar appears 5 times in solution; available = 5 - prefilled appearances - user placements
    // On init, we only subtract prefilled
    return INCOME_PILLARS.map((p) => ({
        ...p,
        remaining: 5 - (placedIds[p.id] || 0),
    }));
}

function recomputeAvailable(userGrid, prefilled) {
    const countMap = {};
    INCOME_PILLARS.forEach((p) => {
        countMap[p.id] = 0;
    });

    userGrid.forEach((row, r) =>
        row.forEach((val, c) => {
            if (val !== null) {
                countMap[val] = (countMap[val] || 0) + 1;
            }
        })
    );

    return INCOME_PILLARS.map((p) => ({
        ...p,
        remaining: 5 - (countMap[p.id] || 0),
    }));
}

export const initialState = {
    phase: GAME_PHASES.INTRO,
    solution: null,
    userGrid: null,
    prefilled: null,
    draggedItem: null,
    availableBlocks: INCOME_PILLARS.map((p) => ({ ...p, remaining: 5 })),
    timeRemaining: GAME_DURATION,
    timeAtWin: null,       // seconds remaining when puzzle was solved
};

export function gameReducer(state, action) {
    switch (action.type) {
        case ACTIONS.START_GAME: {
            const { solution, userGrid, prefilled } = generatePuzzle();
            const availableBlocks = buildAvailableBlocks(userGrid, prefilled);
            return {
                ...state,
                phase: GAME_PHASES.PLAYING,
                solution,
                userGrid,
                prefilled,
                availableBlocks,
                timeRemaining: GAME_DURATION,
                draggedItem: null,
            };
        }

        case ACTIONS.TICK: {
            if (state.phase !== GAME_PHASES.PLAYING) return state;
            const next = state.timeRemaining - 1;
            if (next <= 0) {
                return { ...state, timeRemaining: 0, phase: GAME_PHASES.TIMEUP, timeAtWin: 0 };
            }
            return { ...state, timeRemaining: next };
        }

        case ACTIONS.SET_DRAGGED: {
            return { ...state, draggedItem: action.payload };
        }

        case ACTIONS.CLEAR_DRAGGED: {
            return { ...state, draggedItem: null };
        }

        case ACTIONS.DROP_CELL: {
            const { row, col, pillarId } = action.payload;

            // Guard: cell is prefilled
            if (state.prefilled.has(`${row}-${col}`)) return state;

            // Guard: validate
            if (!isDropValid(state.userGrid, row, col, pillarId)) return state;

            // Build new grid
            const newGrid = state.userGrid.map((r, ri) =>
                r.map((v, ci) => {
                    if (ri === row && ci === col) return pillarId;
                    return v;
                })
            );

            const available = recomputeAvailable(newGrid, state.prefilled);
            const complete = isPuzzleComplete(newGrid);

            return {
                ...state,
                userGrid: newGrid,
                availableBlocks: available,
                draggedItem: null,
                phase: complete ? GAME_PHASES.WON : state.phase,
                timeAtWin: complete ? state.timeRemaining : state.timeAtWin,
            };
        }

        case ACTIONS.CLEAR_CELL: {
            const { row, col } = action.payload;
            if (state.prefilled.has(`${row}-${col}`)) return state;

            const newGrid = state.userGrid.map((r, ri) =>
                r.map((v, ci) => (ri === row && ci === col ? null : v))
            );

            const available = recomputeAvailable(newGrid, state.prefilled);

            return {
                ...state,
                userGrid: newGrid,
                availableBlocks: available,
            };
        }

        case ACTIONS.GAME_WON: {
            return { ...state, phase: GAME_PHASES.WON };
        }

        case ACTIONS.GAME_TIMEUP: {
            return { ...state, phase: GAME_PHASES.TIMEUP };
        }

        case ACTIONS.RESTART: {
            const { solution, userGrid, prefilled } = generatePuzzle();
            const availableBlocks = buildAvailableBlocks(userGrid, prefilled);
            return {
                ...initialState,
                phase: GAME_PHASES.PLAYING,
                solution,
                userGrid,
                prefilled,
                availableBlocks,
                timeRemaining: GAME_DURATION,
                timeAtWin: null,
            };
        }

        default:
            return state;
    }
}
