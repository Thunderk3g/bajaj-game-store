
export enum GameState {
  START = 'START',
  PUZZLE = 'PUZZLE',
  RETIREMENT_REVEAL = 'RETIREMENT_REVEAL',
  EDUCATIONAL = 'EDUCATIONAL',
  LEAD_GEN = 'LEAD_GEN',
  SUCCESS = 'SUCCESS'
}

export interface LeadData {
  fullName: string;
  mobile: string;
}

export type PuzzleSymbol = '₹' | '🏠' | '📜' | '💼' | null;

export interface PuzzleCell {
  value: PuzzleSymbol;
  isInitial: boolean;
  correctValue: PuzzleSymbol;
}

// Define GameObject interface for the catch game logic used in components/CatchGame.tsx
export interface GameObject {
  id: number;
  x: number;
  y: number;
  type: 'COIN' | 'BONUS' | 'RISK';
  speed: number;
}
