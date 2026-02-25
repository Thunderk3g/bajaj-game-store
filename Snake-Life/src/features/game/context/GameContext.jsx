import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { LIFE_MILESTONES } from '../constants/constants';

const GameContext = createContext();

export const GAME_STATUS = {
    START: 'START',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    REFLECTION: 'REFLECTION',
    GAMEOVER: 'GAMEOVER',
    CTA: 'CTA'
};

const INITIAL_STATE = {
    status: GAME_STATUS.START,
    score: 0,
    highScore: 0,
    sessionCount: 0,
    milestones: 0,
    protectionRequirement: 25,
    lifeBuilt: 0,
    leadData: null,
    achievedOnceOnly: [], // Array to store IDs of achieved one-time milestones
    lastEatenMilestone: null,
    nextMilestone: LIFE_MILESTONES[0], // Start with the first one
};

export const GameProvider = ({ children }) => {
    const [state, setState] = useState(INITIAL_STATE);
    const sessionCountRef = useRef(0);

    // Initialize session count from localStorage
    useEffect(() => {
        const savedSessions = localStorage.getItem('life_grows_fast_sessions');
        if (savedSessions) {
            sessionCountRef.current = parseInt(savedSessions, 10);
            setState(prev => ({ ...prev, sessionCount: sessionCountRef.current }));
        }
    }, []);

    const setStatus = useCallback((status) => {
        setState(prev => ({ ...prev, status }));
    }, []);

    const incrementScore = useCallback(() => {
        setState(prev => {
            const newScore = prev.score + 1;
            const newLifeBuilt = Math.min(newScore * 7, 60);
            const randomOffset = Math.floor(Math.random() * 11);
            const newProtectionReq = Math.min(newLifeBuilt + 25 + randomOffset, 95);

            // Calculate next milestone
            const currentMilestone = prev.nextMilestone;
            let updatedAchievedOnce = prev.achievedOnceOnly;
            if (currentMilestone.once) {
                updatedAchievedOnce = [...prev.achievedOnceOnly, currentMilestone.id];
            }

            // Find next milestone in pool
            // Filter out 'once' milestones that are already achieved
            const pool = LIFE_MILESTONES.filter(m => !m.once || !updatedAchievedOnce.includes(m.id));

            // Just move to next index in the pool, wrapping around
            const currentIndexInPool = pool.indexOf(currentMilestone);
            const nextIndex = (currentIndexInPool + 1) % pool.length;
            const nextMilestone = pool[nextIndex];

            return {
                ...prev,
                score: newScore,
                lifeBuilt: newLifeBuilt,
                protectionRequirement: newProtectionReq,
                milestones: newScore,
                lastEatenMilestone: currentMilestone,
                nextMilestone: nextMilestone,
                achievedOnceOnly: updatedAchievedOnce,
            };
        });
    }, []);

    const triggerReflection = useCallback((message, duration = 2500) => {
        setState(prev => ({ ...prev, status: GAME_STATUS.REFLECTION, reflectionMessage: message }));
        setTimeout(() => {
            setState(prev => ({ ...prev, status: GAME_STATUS.PLAYING }));
        }, duration);
    }, []);

    const startGame = useCallback(() => {
        sessionCountRef.current += 1;
        localStorage.setItem('life_grows_fast_sessions', sessionCountRef.current.toString());

        setState(prev => ({
            ...INITIAL_STATE,
            status: GAME_STATUS.PLAYING,
            sessionCount: sessionCountRef.current,
            highScore: Math.max(prev.highScore, prev.score),
            leadData: prev.leadData,
            nextMilestone: LIFE_MILESTONES[0], // Reset milestones
            achievedOnceOnly: [],
        }));
    }, []);

    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, duration = 2000) => {
        setToast(message);
        setTimeout(() => {
            setToast(prev => prev === message ? null : prev);
        }, duration);
    }, []);

    const setLeadData = useCallback((leadData) => {
        setState(prev => ({ ...prev, leadData }));
    }, []);

    const value = {
        ...state,
        toast,
        showToast,
        setStatus,
        setLeadData,
        incrementScore,
        triggerReflection,
        startGame,
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
