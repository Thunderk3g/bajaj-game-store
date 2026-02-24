import { createContext, useContext, useReducer, useCallback } from 'react';
import { SCREENS } from '../constants/game';

// ================================================================
// INITIAL STATE
// ================================================================
const initialState = {
    screen: SCREENS.INTRO,

    user: {
        name: '',
        phone: '',
    },

    game: {
        tiles: [],
        selectedIndices: [],
        matchedPairs: 0,
        flipsCount: 0,
        timeRemaining: 120,
        isLocked: false,
        isEnded: false,
        score: 0,
        elapsedSeconds: 0,
    },

    booking: {
        preferredDate: '',
        preferredTime: '',
    },
};

// ================================================================
// ACTION TYPES
// ================================================================
export const ACTION = {
    NAVIGATE: 'NAVIGATE',
    SET_USER: 'SET_USER',
    INIT_GAME: 'INIT_GAME',
    FLIP_TILE: 'FLIP_TILE',
    RESOLVE_MATCH: 'RESOLVE_MATCH',
    RESOLVE_MISMATCH: 'RESOLVE_MISMATCH',
    TICK_TIMER: 'TICK_TIMER',
    END_GAME: 'END_GAME',
    RESET_GAME: 'RESET_GAME',
    SET_BOOKING: 'SET_BOOKING',
};

// ================================================================
// REDUCER (pure function — no side effects)
// ================================================================
function gameReducer(state, action) {
    switch (action.type) {

        case ACTION.NAVIGATE:
            return { ...state, screen: action.payload };

        case ACTION.SET_USER:
            return { ...state, user: { ...state.user, ...action.payload } };

        case ACTION.MARK_SUBMITTED:
            return { ...state, user: { ...state.user, isLeadSubmitted: true } };

        case ACTION.INIT_GAME:
            return {
                ...state,
                game: {
                    tiles: action.payload.tiles,
                    selectedIndices: [],
                    matchedPairs: 0,
                    flipsCount: 0,
                    timeRemaining: 120,
                    isLocked: false,
                    isEnded: false,
                    score: 0,
                    elapsedSeconds: 0,
                },
            };

        case ACTION.FLIP_TILE: {
            const { index } = action.payload;
            const tiles = state.game.tiles.map((t, i) =>
                i === index ? { ...t, isFlipped: true } : t
            );
            return {
                ...state,
                game: {
                    ...state.game,
                    tiles,
                    selectedIndices: [...state.game.selectedIndices, index],
                    isLocked: state.game.selectedIndices.length === 1, // lock after 2nd pick
                    flipsCount: state.game.flipsCount + 1,
                },
            };
        }

        case ACTION.RESOLVE_MATCH: {
            const { idxA, idxB } = action.payload;
            const tiles = state.game.tiles.map((t, i) =>
                i === idxA || i === idxB ? { ...t, isMatched: true } : t
            );
            const newMatched = state.game.matchedPairs + 1;
            return {
                ...state,
                game: {
                    ...state.game,
                    tiles,
                    selectedIndices: [],
                    matchedPairs: newMatched,
                    score: newMatched,
                    isLocked: false,
                },
            };
        }

        case ACTION.RESOLVE_MISMATCH: {
            const { idxA, idxB } = action.payload;
            const tiles = state.game.tiles.map((t, i) =>
                i === idxA || i === idxB ? { ...t, isFlipped: false } : t
            );
            return {
                ...state,
                game: {
                    ...state.game,
                    tiles,
                    selectedIndices: [],
                    isLocked: false,
                },
            };
        }

        case ACTION.TICK_TIMER:
            return {
                ...state,
                game: {
                    ...state.game,
                    timeRemaining: Math.max(0, state.game.timeRemaining - 1),
                    elapsedSeconds: state.game.elapsedSeconds + 1,
                },
            };

        case ACTION.END_GAME:
            return {
                ...state,
                game: { ...state.game, isEnded: true, isLocked: true },
            };

        case ACTION.RESET_GAME:
            return { ...state, game: initialState.game, booking: initialState.booking };

        case ACTION.SET_BOOKING:
            return { ...state, booking: { ...state.booking, ...action.payload } };

        default:
            return state;
    }
}

// ================================================================
// CONTEXT
// ================================================================
const GameContext = createContext(null);

export function GameProvider({ children }) {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    const navigate = useCallback((screen) => {
        dispatch({ type: ACTION.NAVIGATE, payload: screen });
    }, []);

    const setUser = useCallback((updates) => {
        dispatch({ type: ACTION.SET_USER, payload: updates });
    }, []);

    const setBooking = useCallback((updates) => {
        dispatch({ type: ACTION.SET_BOOKING, payload: updates });
    }, []);

    return (
        <GameContext.Provider value={{ state, dispatch, navigate, setUser, setBooking }}>
            {children}
        </GameContext.Provider>
    );
}

/** Hook to consume the game context */
export function useGame() {
    const ctx = useContext(GameContext);
    if (!ctx) throw new Error('useGame must be used within <GameProvider>');
    return ctx;
}
