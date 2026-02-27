import { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext();

export function GameProvider({ children }) {
    // Lead generation state (persisted in session)
    const [lastSubmittedPhone, setLastSubmittedPhone] = useState(() => {
        return sessionStorage.getItem('lastSubmittedPhone') || null;
    });

    const [leadNo, setLeadNo] = useState(() => {
        return sessionStorage.getItem('gameLeadNo') || null;
    });
    useEffect(() => {
        if (lastSubmittedPhone) {
            sessionStorage.setItem('lastSubmittedPhone', lastSubmittedPhone);
        }
        if (leadNo) {
            sessionStorage.setItem('gameLeadNo', leadNo);
        }
    }, [lastSubmittedPhone, leadNo]);

    // Global Toast State
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000); // Auto-hide after 3s
    };

    return (
        <GameContext.Provider value={{
            lastSubmittedPhone,
            setLastSubmittedPhone,
            leadNo,
            setLeadNo,
            toast,
            showToast
        }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGameState() {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGameState must be used within a GameProvider');
    }
    return context;
}
