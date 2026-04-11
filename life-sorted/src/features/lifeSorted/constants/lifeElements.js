export const LIFE_ELEMENTS = {
    INVESTMENTS: { id: 'inv', label: 'Investments', category: 'growth', color: '#22C55E', emoji: '📈' },
    RETIREMENT: { id: 'ret', label: 'Retirement', category: 'growth', color: '#22C55E', emoji: '🌅' },
    EMERGENCY: { id: 'emg', label: 'Emergency Fund', category: 'safety', color: '#3B82F6', emoji: '🛡️' },
    FIXED_INCOME: { id: 'fix', label: 'Fixed Income Plan', category: 'safety', color: '#3B82F6', emoji: '💰' },
    EDUCATION: { id: 'edu', label: "Child's Education", category: 'resp', color: '#F59E0B', emoji: '🎓' },
    LIFESTYLE: { id: 'lif', label: 'Lifestyle Expenses', category: 'resp', color: '#F59E0B', emoji: '🏠' },
    CRITICAL_ILLNESS: { id: 'cri', label: 'Critical Illness Cover', category: 'risk', color: '#EF4444', emoji: '🩺' },
    TERM_LIFE: { id: 'trm', label: 'Term Life Cover', category: 'risk', color: '#EF4444', emoji: '🛡️' },
    HOSPITALISATION: { id: 'hos', label: 'Hospitalisation', category: 'risk', color: '#EF4444', emoji: '🏥' },
    ASSETS: { id: 'ast', label: 'Home / Car', category: 'asset', color: '#A855F7', emoji: '🚗' },
};

export const LIFE_ELEMENTS_ARRAY = Object.values(LIFE_ELEMENTS);
