export const INITIAL_SPEED = 800; // ms
export const MIN_SPEED = 100;
export const SPEED_INCREMENT = 0.95; // speed *= 0.95 every level/line
export const GAME_DURATION = 120; // 2 minutes in seconds

export const GAME_STATUS = {
    IDLE: 'idle',
    TUTORIAL: 'tutorial',
    PLAYING: 'playing',
    PAUSED: 'paused',
    LOST: 'lost',
    WON: 'won',
    LINE_CLEARED: 'line-cleared',
    CLEARING: 'clearing'
};

export const POINT_VALUES = {
    SINGLE_LINE: 100,
    DOUBLE_LINE: 300,
    TRIPLE_LINE: 500,
    TETRIS: 800
};
