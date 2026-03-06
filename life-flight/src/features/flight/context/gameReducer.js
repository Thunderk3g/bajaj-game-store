// ── Action Types ──────────────────────────────────────────────
export const ACTIONS = {
    START_GAME: 'START_GAME',
    ADD_SCORE: 'ADD_SCORE',
    LOSE_LIFE: 'LOSE_LIFE',
    GAME_OVER: 'GAME_OVER',
    OPEN_LEAD: 'OPEN_LEAD',
    SUBMIT_SUCCESS: 'SUBMIT_SUCCESS',
    RESTART: 'RESTART',
};

// ── Phases ────────────────────────────────────────────────────
export const PHASES = {
    LANDING: 'landing',
    PLAYING: 'playing',
    HIT: 'hit',
    GAMEOVER: 'gameover',
    LEAD: 'lead',
    SUCCESS: 'success',
};

// ── Initial State ─────────────────────────────────────────────
export const initialState = {
    phase: PHASES.LANDING,
    score: 0, // hurdles in current life
    bestScore: 0, // max hurdles in any life
    lives: 3,
    finalScore: 0,
    leadMode: 'call',
};

// ── Reducer ───────────────────────────────────────────────────
export function gameReducer(state, action) {
    switch (action.type) {
        case ACTIONS.START_GAME:
            return { ...initialState, phase: PHASES.PLAYING };

        case ACTIONS.ADD_SCORE: {
            const currentScore = action.payload ?? (state.score + 1);
            return {
                ...state,
                score: currentScore,
                bestScore: Math.max(state.bestScore, currentScore),
            };
        }

        case ACTIONS.LOSE_LIFE: {
            const newLives = state.lives - 1;
            const finalBest = Math.max(state.bestScore, state.score);
            return {
                ...state,
                lives: newLives,
                phase: PHASES.HIT,
                score: 0, // Reset current life score in state
                bestScore: finalBest,
                finalScore: newLives <= 0 ? finalBest : state.finalScore,
            };
        }

        case ACTIONS.GAME_OVER: {
            const finalBest = Math.max(state.bestScore, state.score);
            return {
                ...state,
                phase: PHASES.GAMEOVER,
                bestScore: finalBest,
                finalScore: finalBest,
            };
        }

        case ACTIONS.OPEN_LEAD:
            return { ...state, phase: PHASES.LEAD, leadMode: action.payload.mode };

        case ACTIONS.SUBMIT_SUCCESS:
            return { ...state, phase: PHASES.SUCCESS };

        case ACTIONS.RESTART:
            return { ...initialState, phase: PHASES.LANDING };

        default:
            return state;
    }
}
