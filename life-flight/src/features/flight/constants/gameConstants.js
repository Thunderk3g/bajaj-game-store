/**
 * Life Flight: Cross Every Hurdle
 * Game Constants — Single Source of Truth
 */

// ── Canvas / Physics ──────────────────────────────────────────
export const CANVAS_W = 390;
export const CANVAS_H = 844;
export const BIRD_X = 90;
export const GRAVITY = 0.37;
export const FLAP_FORCE = -7.2;
export const PIPE_SPEED = 2.8;
export const PIPE_WIDTH = 68;
export const PIPE_GAP = 195;
export const GROUND_HEIGHT = 52;
export const BIRD_RADIUS = 15;
export const SPAWN_GAP = 230;
export const MAX_ROTATION_UP = -0.45;
export const MAX_ROTATION_DOWN = 0.75;
export const ROTATION_FACTOR = 0.055;

// ── Cloud Settings ────────────────────────────────────────────
export const CLOUD_COUNT = 6;
export const CLOUD_SPEED_MIN = 0.22;
export const CLOUD_SPEED_MAX = 0.52;

// ── Game Rules ────────────────────────────────────────────────
export const MAX_LIVES = 3;
export const MAX_REF_SCORE = 14;

// ── Hurdles (7, looping infinitely) ──────────────────────────
export const HURDLES = [
    {
        id: 'hospitalization',
        name: 'Hospitalization',
        cost: 'Rs.5–10 Lakhs',
        color: '#E63946',
        tooltip: 'Medical emergencies can drain your savings overnight.',
        hitMessage:
            'A sudden hospitalization cost your family Rs.5–10 Lakhs. No insurance = full pocket hit.',
    },
    {
        id: 'critical-illness',
        name: 'Critical Illness',
        cost: 'Rs.15–25 Lakhs',
        color: '#E76F51',
        tooltip: 'Critical illness treatment costs are rising every year.',
        hitMessage:
            'Critical illness treatment set you back Rs.15–25 Lakhs. Early insurance shields you.',
    },
    {
        id: 'accident-disability',
        name: 'Accident Disability',
        cost: 'Rs.8–20 Lakhs',
        color: '#F4A261',
        tooltip: 'Disability can halt income for months or permanently.',
        hitMessage:
            'Accident disability cost Rs.8–20 Lakhs + income loss. A cover plan prevents this.',
    },
    {
        id: 'child-education',
        name: 'Child Education',
        cost: 'Rs.20–50 Lakhs',
        color: '#457B9D',
        tooltip: 'Education costs are doubling every 8 years.',
        hitMessage:
            "Your child's education needs Rs.20–50 Lakhs. Start a plan now — every year counts.",
    },
    {
        id: 'dream-home-loan',
        name: 'Dream Home Loan',
        cost: 'Rs.40–80 Lakhs',
        color: '#2A9D8F',
        tooltip: 'Home loans leave families exposed without cover.',
        hitMessage:
            'Your home loan of Rs.40–80 Lakhs is uncovered. A term plan protects your family.',
    },
    {
        id: 'retirement-gap',
        name: 'Retirement Gap',
        cost: 'Rs.1–3 Cr needed',
        color: '#6A4C93',
        tooltip: 'Most people retire with only 20% of what they need.',
        hitMessage:
            'You need Rs.1–3 Cr for retirement. Without a pension plan, the gap is enormous.',
    },
    {
        id: 'loss-of-earner',
        name: 'Loss of Earner',
        cost: 'Future Income',
        color: '#1D3557',
        tooltip: 'Your family depends on your income — protect it.',
        hitMessage:
            "Loss of earner = loss of future income. Life insurance keeps your family's dreams alive.",
    },
];

// ── Micro Messages (shown every 3 hurdles cleared) ────────────
export const MICRO_MESSAGES = {
    3: 'Protection gives you wings. 🛡️',
    6: 'Savings reduce turbulence. 💰',
    9: 'Insurance is your backup plan. 📋',
    12: 'Preparation turns obstacles into milestones. 🎯',
    15: 'Your family is your greatest asset. ❤️',
    18: 'Every hurdle you plan for becomes a milestone. 🏆',
};

// ── Score Zones ───────────────────────────────────────────────
export const ZONES = [
    {
        label: 'High Risk Zone',
        minPct: 0,
        maxPct: 30,
        color: '#E63946',
        emoji: '🔴',
        primaryMessage: 'Life can surprise you early.',
        subMessage: 'Most financial shocks happen before we plan for them. Your family deserves better preparation.',
    },
    {
        label: 'Partially Protected',
        minPct: 30,
        maxPct: 60,
        color: '#F4A261',
        emoji: '🟡',
        primaryMessage: 'You handled some risks. But life has more.',
        subMessage: 'You are on the right track — but the harder hurdles are still ahead. Partial protection is not full protection.',
    },
    {
        label: 'Moderately Prepared',
        minPct: 60,
        maxPct: 90,
        color: '#0077B6',
        emoji: '🔵',
        primaryMessage: "Good flying. But life's biggest hurdles remain.",
        subMessage: 'You are doing well. A structured financial plan can take you the full distance.',
    },
    {
        label: 'Well Prepared (In Game)',
        minPct: 90,
        maxPct: 101,
        color: '#2DC653',
        emoji: '🟢',
        primaryMessage: 'You did well. But in real life, you get only one chance.',
        subMessage: 'Impressive skills! Now transfer that preparation to real life — where there is no retry button.',
    },
];

// ── Universal Quote ───────────────────────────────────────────
export const GAME_OVER_QUOTE =
    'In this game you can restart. In life, preparation is the only restart.';

// ── Insurance benefit cards shown on Game Over ────────────────
export const INSURANCE_CARDS = [
    {
        icon: '🏥',
        title: 'Health Shield',
        desc: 'Cover hospitalization & critical illness from Rs.5L',
    },
    {
        icon: '🛡️',
        title: 'Life Cover',
        desc: 'Protect your family income with a term plan from Rs.599/month',
    },
    {
        icon: '🎓',
        title: 'Child Future',
        desc: 'Secure education & marriage goals with guaranteed returns',
    },
    {
        icon: '🌅',
        title: 'Retirement Plan',
        desc: 'Build a Rs.1 Cr+ retirement corpus with systematic savings',
    },
];

// ── Lead Form ─────────────────────────────────────────────────
export const CONCERN_OPTIONS = [
    'Life Insurance / Term Plan',
    'Health & Critical Illness',
    'Child Education Plan',
    'Retirement Planning',
    'Home Loan Protection',
    'Accident & Disability Cover',
    'Wealth Creation / ULIP',
];

// ── Share Message ─────────────────────────────────────────────
export const buildShareMessage = (score) =>
    `I just played Life Flight - a game that tests your financial preparedness! My score: ${score} hurdles crossed! Can you beat it? #LifeFlight #BajajLife`;
