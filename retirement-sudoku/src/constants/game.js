export const INCOME_PILLARS = [
    {
        id: 'pension',
        label: 'Pension',
        shortLabel: 'PEN',
        emoji: '🏦',
        color: 'bg-pillar-pension',
        textColor: 'text-white',
        borderColor: 'border-pillar-pension',
        bgLight: 'bg-pillar-pension/15',
        description: 'Regular retirement pension income',
    },
    {
        id: 'rental',
        label: 'Rental Income',
        shortLabel: 'REN',
        emoji: '🏠',
        color: 'bg-pillar-rental',
        textColor: 'text-white',
        borderColor: 'border-pillar-rental',
        bgLight: 'bg-pillar-rental/15',
        description: 'Income from property rentals',
    },
    {
        id: 'savings',
        label: 'Savings',
        shortLabel: 'SAV',
        emoji: '💲',
        color: 'bg-pillar-savings',
        textColor: 'text-sudoku-bg',
        borderColor: 'border-pillar-savings',
        bgLight: 'bg-pillar-savings/15',
        description: 'Personal savings and investments',
    },
    {
        id: 'medical',
        label: 'Medical Fund',
        shortLabel: 'MED',
        emoji: '🏥',
        color: 'bg-pillar-medical',
        textColor: 'text-white',
        borderColor: 'border-pillar-medical',
        bgLight: 'bg-pillar-medical/15',
        description: 'Healthcare and medical reserve',
    },
    {
        id: 'leisure',
        label: 'Leisure',
        shortLabel: 'LEI',
        emoji: '✈️',
        color: 'bg-pillar-leisure',
        textColor: 'text-white',
        borderColor: 'border-pillar-leisure',
        bgLight: 'bg-pillar-leisure/15',
        description: 'Leisure and lifestyle spending',
    },
];

export const PILLAR_MAP = INCOME_PILLARS.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
}, {});

export const GRID_SIZE = 5;
export const GAME_DURATION = 120; // seconds (2 minutes)
export const PREFILL_RATIO = 0.5;
export const WARNING_THRESHOLD = 20; // seconds
