import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const GameContext = createContext();

export const GAME_STATUS = {
    START: 'START',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    CRASH: 'CRASH',
    GAME_OVER: 'GAME_OVER',
    LIVES_LOST: 'LIVES_LOST',
    CTA: 'CTA',
    THANK_YOU: 'THANK_YOU',
};

const INITIAL_STATE = {
    status: GAME_STATUS.START,
    score: 0,
    lives: 3,
    phase: 1,
    elapsedTime: 0,
    dodgeStreak: 0,
    comboMultiplier: 1,
    risksAvoided: 0,
    leadData: null,
};

export const GameProvider = ({ children }) => {
    const [state, setState] = useState(INITIAL_STATE);

    const setStatus = useCallback((status) => {
        setState(prev => ({ ...prev, status }));
    }, []);

    const setScore = useCallback((score) => {
        setState(prev => ({ ...prev, score }));
    }, []);

    const setLives = useCallback((lives) => {
        setState(prev => ({ ...prev, lives }));
    }, []);

    const setPhase = useCallback((phase) => {
        setState(prev => ({ ...prev, phase }));
    }, []);

    const setElapsedTime = useCallback((elapsedTime) => {
        setState(prev => ({ ...prev, elapsedTime }));
    }, []);

    const incrementDodgeStreak = useCallback(() => {
        setState(prev => ({
            ...prev,
            dodgeStreak: prev.dodgeStreak + 1,
            comboMultiplier: Math.min(1 + (prev.dodgeStreak + 1) * 0.25, 3),
            risksAvoided: prev.risksAvoided + 1,
        }));
    }, []);

    const resetDodgeStreak = useCallback(() => {
        setState(prev => ({
            ...prev,
            dodgeStreak: 0,
            comboMultiplier: 1,
        }));
    }, []);

    const setLeadData = useCallback((leadData) => {
        setState(prev => ({ ...prev, leadData }));
    }, []);

    const startGame = useCallback(() => {
        setState(prev => ({
            ...INITIAL_STATE,
            status: GAME_STATUS.PLAYING,
            leadData: prev.leadData,
        }));
    }, []);

    const triggerCrash = useCallback(() => {
        setState(prev => ({
            ...prev,
            status: GAME_STATUS.CRASH,
            lives: 0,
        }));
    }, []);

    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, duration = 2000) => {
        setToast(message);
        setTimeout(() => {
            setToast(prev => prev === message ? null : prev);
        }, duration);
    }, []);

    const value = {
        ...state,
        toast,
        showToast,
        setStatus,
        setScore,
        setLives,
        setPhase,
        setElapsedTime,
        setLeadData,
        incrementDodgeStreak,
        resetDodgeStreak,
        startGame,
        triggerCrash,
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
