export const CANVAS_WIDTH = 375;
export const CANVAS_HEIGHT = 812;

export const PLAYER_WIDTH = 75;
export const PLAYER_HEIGHT = 103;
export const PLAYER_Y = CANVAS_HEIGHT * 0.67;
export const PLAYER_SPEED = 8;
export const PLAYER_LANE_PADDING = 24;

export const MAX_LIVES = 3;
// Life regen removed — lives only decrease

export const RISK_SIZE = 62;
export const RISK_INITIAL_SPEED = 2.5;
export const RISK_MAX_SPEED = 7;
export const RISK_SPAWN_INTERVAL_INITIAL = 1200;
export const RISK_SPAWN_INTERVAL_MIN = 600;

export const PHASE_1_END = 20;
export const PHASE_2_END = 40;
export const CRASH_TRIGGER_TIME = 30; // Car always at 30s

export const CAR_WIDTH = 180;
export const CAR_HEIGHT = 90;
export const CAR_SPEED = 25;

export const SCORE_PER_SECOND = 10;
export const DODGE_BONUS = 25;
export const COMBO_MULTIPLIER_INCREMENT = 0.25;
export const MAX_COMBO_MULTIPLIER = 3;

// Bajaj Blue Branding: Primary Blue: #005BAC, Dark Accent Blue: #0A3D91
export const COLORS = {
    SKY_TOP: '#0A3D91',
    SKY_MID: '#005BAC',
    SKY_BOTTOM: '#4FAADA',
    WARM_GLOW: '#FFEAA7',

    BLDG_SKYLINE_BASE: '#5B7A98',
    BLDG_MID_BASE: '#A3725F',
    BLDG_FRONT_BASE: '#BCA893',
    BLDG_WIN_LIT: '#FFDF73',
    BLDG_WIN_DARK: '#2E4C6D',

    ROAD_TOP: '#3A3A40',
    ROAD_MID: '#4A4A52',
    ROAD_BOT: '#2F2F36',
    ROAD_LINE: '#E0E0E0',
    SIDEWALK_TOP: '#98989E',
    SIDEWALK_FACE: '#75757F',
    CURB: '#505058',

    HUD_METAL_OUTER: '#E5C07B',
    HUD_METAL_INNER: '#B78C47',
    HUD_BG: '#12253E',
    HUD_EMBOSS: '#264B7A',

    SCORE_FRAME_OUTER: '#587FA6',
    SCORE_FRAME_INNER: '#34557A',
    SCORE_BG: '#1D304D',
    SCORE_TEXT: '#F4D280',

    HEART_BASE: '#E91E63',
    HEART_HIGHLIGHT: '#FF6492',
    HEART_SHADOW: '#880029',
    HEART_BROKEN: '#5A6C7D',

    GLOW_GOLD: '#FFD700',
    GLOW_BLUE: '#00D0FF',

    WHITE: '#FFFFFF',
    TEXT_DARK: '#0B1221',

    PLAYER_HOODIE: '#005BAC',
    PLAYER_HOODIE_DARK: '#0A3D91',
    PLAYER_FUR: '#E0EAF5',
    PLAYER_FACE: '#FFD1B3',
    PLAYER_SHOES: '#4B3621'
};

export const RISK_TYPES = [
    { id: 'medical', name: 'Medical Bill', emoji: '🏥', color: '#4FC3F7', aura: '#005BAC' },
    { id: 'loan', name: 'Loan Document', emoji: '📄', color: '#FFB74D', aura: '#D97B00' },
    { id: 'accident', name: 'Accident Warning', emoji: '⚠️', color: '#FFD54F', aura: '#B8860B' },
    { id: 'illness', name: 'Health Report', emoji: '💊', color: '#81C784', aura: '#228B22' },
];

export const GAME_OVER_MESSAGES = [
    { text: "In games, you get extra lives.", delay: 0 },
    { text: "In real life, you don't.", delay: 2000 },
    { text: "Protect the one life you have.", delay: 4000 },
];

export const CTA_HEADLINE = "Life is unpredictable.\nYour family's future doesn't have to be.";
export const CTA_PRIMARY = "See How to Protect Your Loved Ones";
export const CTA_SECONDARY = "Talk to a Financial Advisor";
