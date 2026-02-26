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
    score: 0,
    lives: 3,
    finalScore: 0,
    leadMode: 'call',
};

// ── Reducer ───────────────────────────────────────────────────
export function gameReducer(state, action) {
    switch (action.type) {
        case ACTIONS.START_GAME:
            return { ...initialState, phase: PHASES.PLAYING };

        case ACTIONS.ADD_SCORE:
            return { ...state, score: state.score + 1 };

        case ACTIONS.LOSE_LIFE: {
            const newLives = state.lives - 1;
            return {
                ...state,
                lives: newLives,
                phase: newLives <= 0 ? PHASES.GAMEOVER : PHASES.HIT,
                finalScore: newLives <= 0 ? state.score : state.finalScore,
            };
        }

        case ACTIONS.GAME_OVER:
            return { ...state, phase: PHASES.GAMEOVER, finalScore: state.score };

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
