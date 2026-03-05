export type CellCategory = 'health' | 'wealth' | 'life' | 'retirement' | 'none';

export interface Cell {
    id: number;
    type: 'normal' | 'snake' | 'ladder';
    target?: number;
    label?: string;
    category: CellCategory;
    description?: string;
    impactMsg?: string;
    shieldMsg?: string;
}

export type ScreenState =
    | 'welcome'
    | 'lead-capture-early'
    | 'shield-choice'
    | 'game'
    | 'event'
    | 'end'
    | 'lead-capture'
    | 'thank-you';

export interface GameState {
    playerPosition: number;
    isGameOver: boolean;
    hasShield: boolean;
    lastDiceValue: number;
    message: string;
    isMoving: boolean;
    currentScreen: ScreenState;
    activeEvent?: Cell;
    isShieldOffer: boolean;
    gameHistory: number[];
    hadShieldAtEnd: boolean;
}

export const BOARD_SIZE = 100;

export const SNAKES: Record<number, Partial<Cell>> = {
    // Head position → tail position (matching the board image)
    62: { target: 19, label: 'Unexpected Death of breadwinner', category: 'life', description: 'Your family must restart financially.', impactMsg: 'Your family must restart financially.', shieldMsg: 'Shield yourself with Term Insurance to secure your family’s future' },
    95: { target: 75, label: 'Accidental Death', category: 'life', description: 'Accidental death can impact your family financial future', impactMsg: 'Accidental death can impact your family financial future', shieldMsg: 'Opt for Accidental Death Benefit Rider to enhance your protection' },
    92: { target: 88, label: 'Minor Stroke / Recovery Period', category: 'health', description: 'Temporary income pause. Lifestyle downgraded.', impactMsg: 'Temporary income pause. Lifestyle downgraded', shieldMsg: 'Income rider maintains household stability' },
    89: { target: 68, label: 'Spouse Critical Illness', category: 'health', description: 'Dual income collapses. Children’s plans disrupted.', impactMsg: 'Dual income collapses. Children’s plans disrupted.', shieldMsg: 'Opt for Critical Illness Rider to avoid financial burden on family' },
    74: { target: 53, label: 'Health Crisis at 50', category: 'health', description: 'Medical bills drain retirement corpus.', impactMsg: 'Medical bills drain retirement corpus.', shieldMsg: 'Health + Term rider safeguards savings' },
    64: { target: 60, label: 'Sudden Family Emergency', category: 'wealth', description: 'Unplanned expenses disrupt momentum.', impactMsg: 'Unplanned expenses disrupt momentum.', shieldMsg: 'Emergency cover cushions the shock' },
    99: { target: 80, label: 'Major Financial Collapse', category: 'wealth', description: 'Business failure or debt crisis. Years of hard work erased.', impactMsg: 'Business failure or debt crisis. Years of hard work erased.', shieldMsg: 'Life + Liability cover protects assets. You recover without starting from zero' },
    49: { target: 11, label: 'Critical Illness Diagnosis', category: 'health', description: 'Treatment expenses skyrocket. Investments liquidated. Goals delayed.', impactMsg: 'Treatment expenses skyrocket. Investments liquidated. Goals delayed.', shieldMsg: 'Opt for Critical Illness Rider to avoid financial burden on family' },
    46: { target: 25, label: 'Disability due to accident', category: 'life', description: 'Disability puts your Financial Goals at Risk', impactMsg: 'Disability puts your Financial Goals at Risk', shieldMsg: 'Opt for Waiver of Premium Rider to secure your financial goals' },
    16: { target: 6, label: 'Medical Emergency at Young Age', category: 'health', description: 'Unexpected hospitalization. Savings wiped before they even begin. Your financial journey restarts.', impactMsg: 'Unexpected hospitalization. Savings wiped before they even begin. Your financial journey restarts.', shieldMsg: 'Shield yourself with Care Plus Rider to avoid such shocks' },
};

export const LADDERS: Record<number, Partial<Cell>> = {
    // Bottom rung → top rung (matching the board image)
    2: { target: 38, label: 'Started Early Investment Plan', category: 'wealth', description: 'Time in the market builds wealth.' },
    7: { target: 14, label: 'First Salary Increase', category: 'wealth', description: 'Momentum begins.' },
    8: { target: 31, label: 'Marriage & Financial Planning', category: 'life', description: 'Shared dreams grow faster.' },
    15: { target: 26, label: 'Emergency Fund Built', category: 'wealth', description: 'Preparedness reduces stress.' },
    21: { target: 42, label: 'Career Promotion', category: 'wealth', description: 'Income grows. Responsibility grows.' },
    28: { target: 84, label: 'Major Career Breakthrough', category: 'wealth', description: 'Leadership level achieved.' },
    36: { target: 44, label: 'Birth of a Child', category: 'life', description: 'New responsibilities, new joys, and new financial goals.' },
    51: { target: 67, label: 'Bought a Home', category: 'wealth', description: 'Stability established.' },
    71: { target: 91, label: 'Child’s Education Secured', category: 'retirement', description: 'Future protected.' },
    78: { target: 98, label: 'Retirement Planning Success', category: 'retirement', description: 'Freedom ahead.' },
    87: { target: 94, label: 'Investment Bonus Received', category: 'wealth', description: 'Unexpected bonus boosts your portfolio.' }
};

export const getCellData = (id: number): Cell => {
    if (SNAKES[id]) {
        return { id, type: 'snake', category: 'none', ...SNAKES[id] } as Cell;
    }
    if (LADDERS[id]) {
        return { id, type: 'ladder', category: 'none', ...LADDERS[id] } as Cell;
    }
    return { id, type: 'normal', category: 'none' };
};

export const getCellXY = (id: number) => {
    const index = id - 1;
    const row = Math.floor(index / 10);
    let col = index % 10;

    // Boustrophedon: odd rows go right-to-left
    if (row % 2 !== 0) {
        col = 9 - col;
    }

    // row 0 = bottom of the board (cells 1-10), row 9 = top (cells 91-100)
    // x = left%, y = bottom%
    return {
        x: col * 10,
        y: row * 10        // row 0 → bottom:0% (bottom-left), row 9 → bottom:90% (top)
    };
};

