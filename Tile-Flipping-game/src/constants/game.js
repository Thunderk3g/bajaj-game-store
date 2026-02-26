// ================================================================
// GAME CONSTANTS
// ================================================================

/** All 8 unique insurance icon pairs */

export const ICONS = [
    { id: 'family', label: 'Family Security', emoji: '👨‍👩‍👧‍👦' },
    { id: 'health', label: 'Health Insurance', emoji: '🏥' },
    { id: 'income', label: 'Income', emoji: '💼' },
    { id: 'home', label: 'Home', emoji: '🏠' },
    { id: 'education', label: 'Education', emoji: '🎓' },
    { id: 'retirement', label: 'Retirement', emoji: '👴' },
    { id: 'illness', label: 'Critical Illness', emoji: '💳' },
    { id: 'emergency', label: 'Emergency', emoji: '🚑' },
];

/** Total game duration in seconds */
export const GAME_DURATION = 120;

/** Delay before flipping back non-matching tiles (ms) */
export const MISMATCH_DELAY = 700;

/** Number of pairs */
export const TOTAL_PAIRS = ICONS.length;

/** Maximum allowed flips */
export const MAX_FLIPS = 30;

/** Color palette for confetti */
export const CONFETTI_COLORS = [
    '#F97316', '#1E4ED8', '#10B981',
    '#FBBF24', '#EC4899', '#6366F1',
];

/** Background colors for matching tile pairs (pastel/light themes for emoji visibility) */
export const TILE_PAIRS_COLORS = [
    '#EFF6FF', // Blue-50
    '#F0FDF4', // Green-50
    '#FFF7ED', // Orange-50
    '#FEF2F2', // Red-50
    '#FAF5FF', // Purple-50
    '#FFFBEB', // Amber-50
    '#F5F3FF', // Indigo-50
    '#F0FDFA', // Teal-50
];

// ================================================================
// NAVIGATION STATES
// ================================================================
export const SCREENS = {
    INTRO: 'intro',
    GAME: 'game',
    SCORE: 'score',
    THANK_YOU: 'thankyou',
};
