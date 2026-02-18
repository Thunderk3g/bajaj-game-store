export const JOURNEY_STEPS = {
    INTRO: 'intro',
    SCENARIO: 'scenario',
    LIFESTYLE: 'lifestyle',
    ESSENTIALS: 'essentials',
    ENGINE: 'engine',
    SURPRISES: 'surprises',
    RESULTS: 'results',
};

export const STEPS_DATA = [
    {
        id: JOURNEY_STEPS.SCENARIO,
        title: "Time to Retirement",
        description: "💡 How much time do you have to prepare and grow your retirement savings?",
        options: [
            { id: 'retired', label: 'Fully Retired', sublabel: 'Already retired or retiring very soon', icon: '🏖️', points: 4 },
            { id: 'soon', label: 'Very Soon', sublabel: '5-9 years', icon: '⏰', points: 8 },
            { id: 'medium', label: 'Medium Term', sublabel: '10-14 years', icon: '📅', points: 12 },
            { id: 'later', label: 'Later', sublabel: '15-19 years', icon: '🎯', points: 15 },
            { id: 'much_later', label: 'Much Later', sublabel: '20-24 years', icon: '🚀', points: 18 },
            { id: 'distant', label: 'Distant Future', sublabel: '30+ years', icon: '✨', points: 20 },
        ]
    },
    {
        id: JOURNEY_STEPS.LIFESTYLE,
        title: "Lifestyle Load",
        description: "💡 What kind of lifestyle are you aiming for in retirement?",
        options: [
            { id: 'simple', label: 'Simple Living', sublabel: 'Basic home, limited travel, controlled expenses', icon: '☘️', points: 25 },
            { id: 'comfortable', label: 'Comfortable', sublabel: 'Good home, regular leisure, moderate travel', icon: '🏠', points: 20 },
            { id: 'premium', label: 'Premium Living', sublabel: 'Luxury living, frequent travel, high spending', icon: '✨', points: 14 },
        ]
    },
    {
        id: JOURNEY_STEPS.ESSENTIALS,
        title: "Expense Protection",
        description: "💡 Which essential expenses have you planned to cover in retirement?",
        options: [
            { id: 'housing', label: 'Housing', sublabel: 'Rent, mortgage, property tax, maintenance', points: 4 },
            { id: 'food', label: 'Food & Daily Needs', sublabel: 'Groceries and household essentials', points: 3 },
            { id: 'medical', label: 'Medical Expenses', sublabel: 'Healthcare, insurance, medications', points: 4 },
            { id: 'utilities', label: 'Utilities', sublabel: 'Electricity, water, gas, internet', points: 2 },
            { id: 'transport', label: 'Transportation', sublabel: 'Car, fuel, public transit, maintenance', points: 2 },
        ]
    },
    {
        id: JOURNEY_STEPS.ENGINE,
        title: "Investment Strength",
        description: "💡 What types of investments are part of your retirement portfolio?",
        options: [
            { id: 'safety', label: 'Safety-Focused', sublabel: 'PPF, FD, guaranteed savings', points: 8 },
            { id: 'growth', label: 'Growth-Oriented', sublabel: 'Mutual funds, equity investments', points: 9 },
            { id: 'income', label: 'Income-Focused', sublabel: 'Pension, annuity, ULIP income', points: 8 },
        ]
    },
    {
        id: JOURNEY_STEPS.SURPRISES,
        title: "Inflation & Shock Readiness",
        description: "💡 How prepared are you for unexpected financial challenges?",
        categories: [
            {
                id: 'medical',
                title: 'Medical Crisis',
                description: 'Unexpected medical expenses',
                icon: '⏥',
                options: [
                    { id: 'income', label: 'USE PLANNED RETIREMENT INCOME', strength: 'STRONG', points: 15 },
                    { id: 'investments_adjusted', label: 'TAP INTO INVESTMENTS STRATEGICALLY', strength: 'STRONG', points: 12 },
                    { id: 'lifestyle_cut', label: 'CUT LIFESTYLE EXPENSES TEMPORARILY', strength: 'WEAK', points: 8 },
                ]
            },
            {
                id: 'inflation',
                title: 'Living Cost Inflation',
                description: 'Cost of living increases 25% over three years',
                icon: '📊',
                options: [
                    { id: 'income', label: 'INVESTMENT INCOME COVERS THE DIFFERENCE', strength: 'STRONG', points: 15 },
                    { id: 'withdrawal', label: 'ADJUST WITHDRAWAL RATE FROM PORTFOLIO', strength: 'STRONG', points: 12 },
                    { id: 'reduce', label: 'REDUCE SPENDING ON NON-ESSENTIALS', strength: 'WEAK', points: 8 },
                ]
            },
            {
                id: 'longer',
                title: 'Longer Life Expectancy',
                description: 'You live to 95 (longer than planned)',
                icon: '🎂',
                options: [
                    { id: 'steady', label: 'DIVERSIFIED INVESTMENTS PROVIDE STEADY RETURNS', strength: 'STRONG', points: 15 },
                    { id: 'planned_income', label: 'RELY ON PLANNED INCOME STREAMS', strength: 'STRONG', points: 12 },
                    { id: 'conservative', label: 'CONSERVATIVE SPENDING ADJUSTMENTS', strength: 'WEAK', points: 8 },
                ]
            }
        ]
    }
];

export const READINESS_BANDS = [
    { min: 85, label: 'Champion', description: "Congratulations! You've just aced the quiz!", color: '#DC2626', icon: '🏆' },
    { min: 70, label: 'Secure', description: "Great Job! You're on track with your retirement planning!", color: '#10B981', icon: '✓' },
    { min: 50, label: 'Builder', description: "Good Start! You have a foundation to build upon!", color: '#F59E0B', icon: '🏗️' },
    { min: 0, label: 'Explorer', description: "Time to Act! Your retirement journey begins now!", color: '#3B82F6', icon: '🗺️' },
];

