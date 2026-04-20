
export enum GameState {
  START = 'START',
  WORD_CHALLENGE = 'WORD_CHALLENGE',
  RETIREMENT_REVEAL = 'RETIREMENT_REVEAL',
  EDUCATIONAL = 'EDUCATIONAL',
  LEAD_GEN = 'LEAD_GEN',
  SUCCESS = 'SUCCESS'
}

export interface LeadData {
  fullName: string;
  mobile: string;
}

export interface WordStage {
  scrambled: string;
  answer: string;
  hint: string;
}

// Keeping these for potential future use or to avoid breaking other components if they are imported elsewhere
export type PuzzleSymbol = '₹' | '🏠' | '📜' | '💼' | null;
export interface PuzzleCell {
  value: PuzzleSymbol;
  isInitial: boolean;
  correctValue: PuzzleSymbol;
}
export interface GameObject {
  id: number;
  x: number;
  y: number;
  type: 'COIN' | 'BONUS' | 'RISK';
  speed: number;
}
