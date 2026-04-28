// Game data — classic bubble shooter style.
// Each colour is tied to a real-life risk theme + a Bajaj Life product.
// Match 3+ same-colour bubbles to clear them.

export const COLORS = {
  red:    { id: 'red',    color: '#EF4444', colorDeep: '#991B1B', glow: '#FCA5A5', theme: 'Health Risk',       product: 'Health Cover' },
  blue:   { id: 'blue',   color: '#3B82F6', colorDeep: '#1E40AF', glow: '#93C5FD', theme: 'Income Loss',       product: 'Term Insurance' },
  yellow: { id: 'yellow', color: '#FACC15', colorDeep: '#A16207', glow: '#FEF08A', theme: "Child's Education", product: 'Child Plan' },
  green:  { id: 'green',  color: '#10B981', colorDeep: '#065F46', glow: '#6EE7B7', theme: 'Wealth Goal',       product: 'Savings Plan' },
  purple: { id: 'purple', color: '#8B5CF6', colorDeep: '#5B21B6', glow: '#C4B5FD', theme: 'Inflation',         product: 'ULIP' },
  pink:   { id: 'pink',   color: '#EC4899', colorDeep: '#9D174D', glow: '#F9A8D4', theme: 'Retirement',        product: 'Pension Plan' },
};

export const COLOR_KEYS = Object.keys(COLORS);

export const LEVELS = [
  { id: 1, name: 'Life Basics',         subtitle: 'Cover the essentials',    colors: ['red', 'blue', 'yellow', 'green'],   rows: 6, shots: 25 },
  { id: 2, name: 'Family Protection',   subtitle: 'Shield those you love',   colors: ['red', 'blue', 'yellow', 'pink'],    rows: 7, shots: 25 },
  { id: 3, name: 'Wealth Building',     subtitle: 'Grow what you earn',      colors: ['green', 'purple', 'yellow', 'blue'], rows: 7, shots: 22 },
  { id: 4, name: 'Retirement',          subtitle: 'Secure tomorrow',          colors: ['pink', 'purple', 'blue', 'green'],   rows: 8, shots: 25 },
];
