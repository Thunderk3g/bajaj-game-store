export const JOURNEY_STEPS = {
    INTRO: 'intro',
    SCENARIO: 'scenario',
    LIFESTYLE: 'lifestyle',
    ESSENTIALS: 'essentials',
    ENGINE: 'engine',
    SURPRISES: 'surprises',
    LEAD: 'lead',
    RESULTS: 'results',
};

export const STEPS_DATA = [
    {
        id: JOURNEY_STEPS.SCENARIO,
        title: "Time for Retirement",
        description: " How much time do you have to prepare and grow your retirement savings?",
        options: [
            { id: 'retired', label: 'Fully Retired', sublabel: 'Already retired or retiring very soon', icon: '🏖️', points: 4, image: './assets/fully_retired.png' },
            { id: 'soon', label: 'Very Soon', sublabel: '5-9 years', icon: '🚀', points: 8, image: './assets/very soon.png' },
            { id: 'medium', label: 'Medium Term', sublabel: '10-14 years', icon: '🪴', points: 12, image: './assets/medium_term.png' },
            { id: 'later', label: 'Later', sublabel: '15-19 years', icon: '🏠', points: 15, image: './assets/later.png' },
            { id: 'much_later', label: 'Much Later', sublabel: '20-24 years', icon: '🌱', points: 18, image: './assets/Much_later.png' },
            { id: 'distant', label: 'Distant Future', sublabel: '30+ years', icon: '🌌', points: 20, image: './assets/distant_future.png' },
        ]
    },
    {
        id: JOURNEY_STEPS.LIFESTYLE,
        title: "Lifestyle Choice",
        description: " What kind of lifestyle are you aiming for in retirement?",
        options: [
            { id: 'simple', label: 'Simple Living', sublabel: 'Basic home, limited travel, controlled expenses', icon: '☘️', points: 25, image: './assets/simple_living.png' },
            { id: 'comfortable', label: 'Comfortable', sublabel: 'Good home, regular leisure, moderate travel', icon: '🏠', points: 20, image: './assets/Comfortable.png' },
            { id: 'premium', label: 'Premium Living', sublabel: 'Luxury living, frequent travel, high spending', icon: '✨', points: 14, image: './assets/premium_living.png' },
        ]
    },
    {
        id: JOURNEY_STEPS.ESSENTIALS,
        title: "Expense Protection",
        description: " Which essential expenses have you planned to cover in retirement?",
        options: [
            { id: 'housing', label: 'Housing', sublabel: 'Rent, mortgage, property tax, maintenance', icon: '🏠', points: 4, image: './assets/housing.png' },
            { id: 'food', label: 'Food & Daily Needs', sublabel: 'Groceries and household essentials', icon: '🧺', points: 3, image: './assets/food.png' },
            { id: 'medical', label: 'Medical Expenses', sublabel: 'Healthcare, insurance, medications', icon: '🏥', points: 4, image: './assets/medical_expenses.png' },
            { id: 'utilities', label: 'Utilities', sublabel: 'Electricity, water, gas, internet', icon: '⚡', points: 2, image: './assets/utilities.png' },
            { id: 'transport', label: 'Transportation', sublabel: 'Car, fuel, public transit, maintenance', icon: '🚗', points: 2, image: './assets/Transportation.png' },
        ]
    },
    {
        id: JOURNEY_STEPS.ENGINE,
        title: "Investment Strength",
        description: " What types of investments are part of your retirement portfolio?",
        options: [
            { id: 'safety', label: 'Safety-Focused', sublabel: 'PPF, FD, guaranteed savings', icon: '🛡️', points: 8, image: './assets/safety-focused.png' },
            { id: 'growth', label: 'Growth-Oriented', sublabel: 'Mutual funds, equity investments', icon: '📈', points: 9, image: './assets/growth-oriented.png' },
            { id: 'income', label: 'Income-Focused', sublabel: 'Pension, annuity, ULIP income', icon: '💰', points: 8, image: './assets/income-focused.png' },
        ]
    },
    {
        id: JOURNEY_STEPS.SURPRISES,
        title: "Inflation & Shock Readiness",
        description: " How prepared are you for unexpected financial challenges?",
        categories: [
            {
                id: 'medical',
                title: 'Medical Crisis',
                description: 'Unexpected medical expenses',
                icon: '🏥',
                options: [
                    { id: 'income', label: 'USE PLANNED RETIREMENT INCOME', icon: '💰', points: 15, image: 'https://emojicdn.elk.sh/💰' },
                    { id: 'investments_adjusted', label: 'TAP INTO INVESTMENTS STRATEGICALLY', icon: '📊', points: 12, image: 'https://emojicdn.elk.sh/📊' },
                    { id: 'lifestyle_cut', label: 'CUT LIFESTYLE EXPENSES TEMPORARILY', icon: '✂️', points: 8, image: 'https://emojicdn.elk.sh/✂️' },
                ]
            },
            {
                id: 'inflation',
                title: 'Living Cost Inflation',
                description: 'Cost of living increases 25% over three years',
                icon: '📊',
                options: [
                    { id: 'income', label: 'INVESTMENT INCOME COVERS THE DIFFERENCE', icon: '💹', points: 15, image: 'https://emojicdn.elk.sh/💹' },
                    { id: 'withdrawal', label: 'ADJUST WITHDRAWAL RATE FROM PORTFOLIO', icon: '🏧', points: 12, image: 'https://emojicdn.elk.sh/🏧' },
                    { id: 'reduce', label: 'REDUCE SPENDING ON NON-ESSENTIALS', icon: '📉', points: 8, image: 'https://emojicdn.elk.sh/📉' },
                ]
            },
            {
                id: 'longer',
                title: 'Longer Life Expectancy',
                description: 'You live to 95 (longer than planned)',
                icon: '🎂',
                options: [
                    { id: 'steady', label: 'DIVERSIFIED INVESTMENTS PROVIDE STEADY RETURNS', icon: '🏛️', points: 15, image: 'https://emojicdn.elk.sh/🏛️' },
                    { id: 'planned_income', label: 'RELY ON EXISTING INCOME', icon: '💸', points: 12, image: 'https://emojicdn.elk.sh/💸' },
                    { id: 'conservative', label: 'REDUCE SPENDING ON NON-ESSENTIALS', icon: '👛', points: 8, image: 'https://emojicdn.elk.sh/👛' },
                ]
            }
        ]
    }
];

export const READINESS_BANDS = [
    { min: 85, label: 'Champion', description: "Fantastic! You are ready for your retirement adventure!", color: '#DC2626', icon: '🏆' },
    { min: 70, label: 'Intermediate', description: "Good Job! You're on track with your retirement planning!", color: '#10B981', icon: './assets/badge.png' },
    { min: 50, label: 'Amateur', description: "Half way there! You have a foundation to build upon!", color: '#F59E0B', icon: './assets/newbie.png' },
    { min: 0, label: 'Rookie', description: "Attention Required! Start planning for your retirement now!", color: '#3B82F6', icon: './assets/egg.png' },
];

