export const LIFE_ELEMENTS = {
    RETIREMENT: { id: 'ret', label: 'Retirement', category: 'wealth', color: 'var(--growth)' },
    EMERGENCY: { id: 'emg', label: 'Emergency', category: 'safety', color: 'var(--safety)' },
    EDUCATION: { id: 'edu', label: 'Education', category: 'resp', color: 'var(--resp)' },
    WEDDING: { id: 'wed', label: 'Wedding', category: 'resp', color: 'var(--resp)' },
    VACATION: { id: 'vac', label: 'Vacation', category: 'asset', color: 'var(--asset)' },
    HOME: { id: 'hom', label: 'Home', category: 'asset', color: 'var(--asset)' },
    STOCKS: { id: 'stk', label: 'Stocks', category: 'risk', color: 'var(--risk)' },
    MUTUAL_FUNDS: { id: 'mfd', label: 'Mutual Funds', category: 'risk', color: 'var(--risk)' },
    INSURANCE: { id: 'ins', label: 'Insurance', category: 'safety', color: 'var(--safety)' },
    SAVINGS: { id: 'sav', label: 'Savings', category: 'wealth', color: 'var(--growth)' },
};

export const LIFE_ELEMENTS_ARRAY = Object.values(LIFE_ELEMENTS);
