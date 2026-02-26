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
    99: { target: 6, label: 'Sudden Hospitalization', category: 'health', description: 'High medical expenses drain savings.', impactMsg: 'Savings drained. Financial plans disrupted.', shieldMsg: 'Insurance rider cushions the shock. Family savings stay protected.' },
    92: { target: 88, label: 'Accidental Injury', category: 'health', description: 'Unexpected accident sets you back.', impactMsg: 'Recovery costs mount.', shieldMsg: 'Accident Cover ensures quick recovery without financial stress.' },
    87: { target: 24, label: 'Critical Illness', category: 'health', description: 'Serious diagnosis hits at peak career.', impactMsg: 'Treatment costs rise. Investments liquidated.', shieldMsg: 'Critical Illness Cover absorbs treatment costs. Core wealth stays intact.' },
    73: { target: 19, label: 'Permanent Disability', category: 'life', description: 'Income stops unexpectedly.', impactMsg: 'Income stops. Responsibilities continue.', shieldMsg: 'Accident Disability Rider ensures continued income support.' },
    63: { target: 60, label: 'Job Loss', category: 'wealth', description: 'Sudden unemployment impacts finances.', impactMsg: 'Savings dip. EMIs continue.', shieldMsg: 'Income Protection Rider bridges the gap.' },
    58: { target: 42, label: 'Market Crash', category: 'wealth', description: 'Wipes out equity savings.', impactMsg: 'Years of savings evaporate overnight.', shieldMsg: 'Guaranteed Savings Plan absorbs the shock.' },
    54: { target: 34, label: 'Spouse Health Emergency', category: 'life', description: 'Spouse diagnosed with critical illness.', impactMsg: 'Second income gone. Medical bills mount.', shieldMsg: 'Critical Illness Rider covers treatment costs.' },
    47: { target: 16, label: 'Accidental Death', category: 'life', description: 'One moment changes everything.', impactMsg: 'Your family\'s journey resets to the start.', shieldMsg: 'Term Insurance ensures your family continues forward.' },
    32: { target: 12, label: 'Major Loan Burden', category: 'wealth', description: 'Unpaid loan traps the family.', impactMsg: 'Family forced to sell assets.', shieldMsg: 'Life Insurance helps clear liabilities. Assets protected.' },
    16: { target: 6, label: 'Health Emergency at 30s', category: 'health', description: 'Early health event disrupts plans.', impactMsg: 'High costs derail savings goals.', shieldMsg: 'Health Cover + Income Protection keeps lifestyle secure.' },
};

export const LADDERS: Record<number, Partial<Cell>> = {
    // Bottom rung → top rung (matching the board image)
    2: { target: 23, label: 'First ULIP Started', category: 'wealth', description: 'Early investing builds momentum.' },
    7: { target: 14, label: 'Got Health Check-up', category: 'health', description: 'Preventive care leads to better outcomes.' },
    15: { target: 25, label: 'Built Emergency Fund', category: 'wealth', description: 'Safety net keeps you moving forward.' },
    22: { target: 37, label: 'Got Married', category: 'life', description: 'New beginnings. Plan together, grow together.' },
    36: { target: 44, label: 'Career Promotion!', category: 'wealth', description: 'Hard work pays off - income doubles.' },
    46: { target: 67, label: 'Bought Second Home', category: 'wealth', description: 'Financially growing deeper roots.' },
    65: { target: 85, label: 'Child Education Plan', category: 'retirement', description: 'Investing early secures your child\'s future.' },
    72: { target: 91, label: 'Business Milestone', category: 'wealth', description: 'Smart planning accelerates wealth building.' },
    83: { target: 97, label: 'Retirement Corpus Ready', category: 'retirement', description: 'Disciplined saving reaches its peak.' },
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

export const getSVGCoords = (id: number) => {
    const { x, y } = getCellXY(id);
    // Center of cell in 0-100 viewBox
    return {
        cx: x + 5,
        cy: y + 5
    };
};
