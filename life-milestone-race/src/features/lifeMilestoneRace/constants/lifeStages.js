/**
 * Life stages used throughout the race simulation.
 * Each stage represents a significant life milestone with age range.
 */

export const LIFE_STAGES = [
    {
        id: 'first-job',
        label: 'First Job',
        emoji: '💼',
        ageRange: '22–25',
        description: 'Starting your career journey',
        order: 1,
        color: '#0066B2',
    },
    {
        id: 'marriage',
        label: 'Marriage',
        emoji: '💑',
        ageRange: '25–30',
        description: 'Building a life together',
        order: 2,
        color: '#0066B2',
    },
    {
        id: 'parenthood',
        label: 'Parenthood',
        emoji: '👨‍👩‍👧',
        ageRange: '30–35',
        description: 'Welcoming a new life',
        order: 3,
        color: '#0066B2',
    },
    {
        id: 'mid-career',
        label: 'Mid-Career',
        emoji: '📈',
        ageRange: '35–50',
        description: 'Peak responsibilities',
        order: 4,
        color: '#0066B2',
    },
    {
        id: 'retirement',
        label: 'Approaching Retirement',
        emoji: '🏖️',
        ageRange: '55–60',
        description: 'Securing your golden years',
        order: 5,
        color: '#0066B2',
    },
];

/**
 * Number of events per stage (strictly enforced).
 */
export const EVENTS_PER_STAGE = 5;

/**
 * Score category thresholds for protection assessment.
 */
export const SCORE_CATEGORIES = {
    LOW: { min: 0, max: 35, label: 'Low Protection', color: '#EF4444' },
    MEDIUM: { min: 36, max: 70, label: 'Medium Protection', color: '#FF8C00' },
    HIGH: { min: 71, max: 100, label: 'High Protection', color: '#10B981' },
};

/**
 * Initial score baseline for all new games.
 */
export const INITIAL_SCORE = 50;

/**
 * Timer duration per event (in seconds).
 */
export const EVENT_TIMER_SECONDS = 5;

/**
 * Decision types.
 */
export const DECISIONS = {
    PROTECTED: 'protected',
    EXPOSED: 'exposed',
};

/**
 * Game phases for state machine.
 */
export const GAME_PHASES = {
    INTRO: 'intro',
    STAGE_SELECTION: 'stage_selection',
    RACING: 'racing',
    EVENT_FEEDBACK: 'event_feedback',
    FINISH: 'finish',
    SCORE_REVEAL: 'score_reveal',
    TIMELINE: 'timeline',
    CONVERSION: 'conversion',
    LEAD_FORM: 'lead_form',
    POST_GAME_LEAD: 'post_game_lead',
    THANK_YOU: 'thank_you',
};
