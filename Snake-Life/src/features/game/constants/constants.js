export const GRID_SIZE = 18;
export const INITIAL_SPEED = 220;
export const MIN_SPEED = 120;
export const GAME_DURATION = 120; // 120 seconds

export const SPEED_INCREMENT_TIME = 3000; // 3 seconds
export const SPEED_DECREMENT_TIME_VAL = 3;
export const SPEED_DECREMENT_PELLET_VAL = 6;

export const INITIAL_SNAKE = [
    { x: 9, y: 15 },
    { x: 9, y: 16 },
    { x: 9, y: 17 },
];

export const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
};

export const LIFE_MILESTONES = [
    { id: 'marriage', name: 'Marriage', icon: '💍', once: true },
    { id: 'child', name: 'Child Born', icon: '👶', once: true },
    { id: 'home_loan', name: 'Home Loan', icon: '🏠', once: false },
    { id: 'promotion', name: 'Promotion', icon: '📈', once: false },
    { id: 'car', name: 'Car Purchase', icon: '🚗', once: false },
    { id: 'foreign_tour', name: 'First Foreign Tour', icon: '🏥', once: false },
    { id: 'business', name: 'Business Expansion', icon: '🏢', once: false },
    { id: 'education_loan', name: 'Education Loan', icon: '🎓', once: false },
    { id: 'investment', name: 'Investment Upgrade', icon: '💰', once: false },
    { id: 'retirement', name: 'Retirement Planning', icon: '🌅', once: false },
];
