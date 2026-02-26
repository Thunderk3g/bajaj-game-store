import React, { createContext, useContext, useReducer } from 'react';
import { gameReducer, initialState, ACTIONS, PHASES } from './gameReducer.js';

const GameContext = createContext(null);

export function GameProvider({ children }) {
    const [state, dispatch] = useReducer(gameReducer, initialState);
    return (
        <GameContext.Provider value={{ state, dispatch, ACTIONS, PHASES }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const ctx = useContext(GameContext);
    if (!ctx) throw new Error('useGame must be used inside GameProvider');
    return ctx;
}
