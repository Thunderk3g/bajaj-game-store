import { create } from 'zustand';

export const GAME_STATUS = {
    START: 'START',
    PLAYING: 'PLAYING',
    GAMEOVER: 'GAMEOVER',
    LEAD_CAPTURE: 'LEAD_CAPTURE',
    CTA: 'CTA',
    THANK_YOU: 'THANK_YOU'
};

export const useGameStore = create((set) => ({
    status: GAME_STATUS.START,
    score: 0,
    coins: 0,
    shield: 100,   // Financial concept: Insurance Shield / Protection Cover
    distance: 0,
    highScore: parseInt(localStorage.getItem('futureClimbHighScore') || '0'),
    leadData: null,
    toast: null,

    setStatus: (status) => set((state) => ({
        status,
        ...(status !== GAME_STATUS.PLAYING ? { toast: null } : {})
    })),
    
    setScore: (score) => set((state) => {
        if (score > state.highScore) {
            localStorage.setItem('futureClimbHighScore', score.toString());
            return { score, highScore: score };
        }
        return { score };
    }),

    setCoins: (coins) => set({ coins }),
    addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
    setShield: (shield) => set({ shield }),   // Replaces setHealth
    setDistance: (distance) => set({ distance }),
    setLeadData: (leadData) => set({ leadData }),
    
    showToast: (message, duration = 3000) => {
        set({ toast: message });
        setTimeout(() => set({ toast: null }), duration);
    },

    resetGame: () => set({
        status: GAME_STATUS.PLAYING,
        score: 0,
        coins: 0,
        shield: 100,   // Full insurance cover on restart
        distance: 0,
        toast: null
    })
}));
