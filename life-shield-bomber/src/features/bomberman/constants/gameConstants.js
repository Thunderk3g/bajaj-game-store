/**
 * Bomberman Game Constants — Life Shield Bomber
 * Insurance Risk Edition: Protect your financial future.
 */

// ── Grid Configuration ────────────────────────────────────────
export const GRID_SIZE = 9;

// ── Cell Types ────────────────────────────────────────────────
export const CELL_TYPES = {
    FLOOR: 'FLOOR',
    WALL: 'WALL',
    RISK: 'RISK',
    EXIT: 'EXIT',
};

// ── Risk Block Types (Financial Risks) ────────────────────────
export const RISK_TYPES = [
    { id: 'medical', label: 'Medical Risk', icon: '🏥', color: '#EF4444' },
    { id: 'debt', label: 'Debt Trap', icon: '💳', color: '#F59E0B' },
    { id: 'inflation', label: 'Inflation', icon: '📈', color: '#8B5CF6' },
    { id: 'emergency', label: 'Emergency', icon: '⚡', color: '#F97316' },
    { id: 'generic', label: 'Financial Risk', icon: '⚠️', color: '#EC4899' },
];

// ── Game Phases ───────────────────────────────────────────────
export const GAME_PHASES = {
    LANDING: 'landing',
    ENTRY: 'entry',
    HOW_TO_PLAY: 'how_to_play',
    PLAYING: 'playing',
    FINISHED: 'finished',
    RESULT: 'result',
    THANK_YOU: 'thank_you',
    EXITED: 'exited',
};

// ── Game Settings ─────────────────────────────────────────────
export const GAME_DURATION_SECONDS = 90;
export const INITIAL_HEALTH = 3;
export const BOMB_TIMER_MS = 2000;
export const BOMB_RADIUS = 1;
export const POINTS_PER_RISK = 10;
export const HEALTH_BONUS_MULTIPLIER = 5;
export const TIME_BONUS_MULTIPLIER = 0.5;

// ── Directions ────────────────────────────────────────────────
export const DIRECTIONS = {
    UP: { row: -1, col: 0 },
    DOWN: { row: 1, col: 0 },
    LEFT: { row: 0, col: -1 },
    RIGHT: { row: 0, col: 1 },
};

// ── Praise Messages ───────────────────────────────────────────
export const PRAISE_MESSAGES = [
    'Risk Eliminated!',
    'Well Protected!',
    'Great Defense!',
    'Shield Up!',
    'Outstanding!',
    'Secured!',
    'Brilliant!',
    'Keep Going!',
];
