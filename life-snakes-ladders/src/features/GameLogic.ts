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
    99: { target: 80, label: 'Unexpected Death Before Retirement', category: 'life', description: 'Your family must restart financially.', impactMsg: 'Income stops. Family struggles.', shieldMsg: 'Term Insurance secures their future. Your journey continues through them.' },
    95: { target: 75, label: 'Market Crash Before Retirement', category: 'wealth', description: 'Portfolio value crashes. Retirement delayed.', impactMsg: 'Years of savings evaporate.', shieldMsg: 'Guaranteed return product stabilizes future income.' },
    92: { target: 88, label: 'Minor Stroke / Recovery Period', category: 'health', description: 'Temporary income pause. Lifestyle downgraded.', impactMsg: 'Treatment costs mount. Income paused.', shieldMsg: 'Income rider maintains household stability.' },
    89: { target: 68, label: 'Spouse Critical Illness', category: 'life', description: 'Dual income collapses. Children’s plans disrupted.', impactMsg: 'Medical bills rise. Second income gone.', shieldMsg: 'Family protection ensures continuity.' },
    74: { target: 53, label: 'Health Crisis at 50', category: 'health', description: 'Medical bills drain retirement corpus.', impactMsg: 'Savings drained.', shieldMsg: 'Health + Term rider safeguards savings.' },
    64: { target: 60, label: 'Sudden Family Emergency', category: 'wealth', description: 'Unplanned expenses disrupt momentum.', impactMsg: 'Unplanned costs absorb cash flows.', shieldMsg: 'Emergency cover cushions the shock.' },
    62: { target: 19, label: 'Major Financial Collapse', category: 'wealth', description: 'Business failure or debt crisis. Years of hard work erased.', impactMsg: 'Back to square one financially.', shieldMsg: 'Life + Liability cover protects assets. You recover without starting from zero.' },
    49: { target: 11, label: 'Critical Illness Diagnosis', category: 'health', description: 'Treatment expenses skyrocket. Investments liquidated. Goals delayed.', impactMsg: 'Goals derailed.', shieldMsg: 'Critical Illness Cover pays lump sum. Your life plans stay intact.' },
    46: { target: 25, label: 'Job Loss During EMIs', category: 'wealth', description: 'Income stops. Loans continue. EMIs pile up. Progress slows.', impactMsg: 'Stress mounts. EMIs default.', shieldMsg: 'Income Protection Rider provides stability. You stay financially afloat.' },
    16: { target: 6, label: 'Early Career Medical Emergency', category: 'health', description: 'Unexpected hospitalization. Savings wiped before they even begin. Your financial journey restarts.', impactMsg: 'Savings gone.', shieldMsg: 'Health rider absorbs treatment costs. Your savings remain untouched.' },
};

export const LADDERS: Record<number, Partial<Cell>> = {
    // Bottom rung → top rung (matching the board image)
    2: { target: 38, label: 'Started Early Investment Plan', category: 'wealth', description: 'Time in the market builds wealth.' },
    7: { target: 14, label: 'First Salary Increase', category: 'wealth', description: 'Momentum begins.' },
    8: { target: 31, label: 'Marriage & Financial Planning', category: 'life', description: 'Shared dreams grow faster.' },
    15: { target: 26, label: 'Emergency Fund Built', category: 'wealth', description: 'Preparedness reduces stress.' },
    21: { target: 42, label: 'Career Promotion', category: 'wealth', description: 'Income grows. Responsibility grows.' },
    28: { target: 84, label: 'Major Career Breakthrough', category: 'wealth', description: 'Leadership level achieved.' },
    //36: { target: 44, label: '', category: '', description: '' },
    51: { target: 67, label: 'Bought a Home', category: 'wealth', description: 'Stability established.' },
    71: { target: 91, label: 'Child’s Education Secured', category: 'retirement', description: 'Future protected.' },
    78: { target: 98, label: 'Retirement Planning Success', category: 'retirement', description: 'Freedom ahead.' },
    //87:{target:94,label:'',category:'',description:''}
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

