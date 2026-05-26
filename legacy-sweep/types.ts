export enum Screen {
  INTRO   = 'intro',
  GAME    = 'game',
  DETAILS = 'details',
  SCORING = 'scoring',
}

export type BenefitType =
  | 'family_shield'
  | 'savings_vault'
  | 'retirement_fund'
  | 'life_bonus'
  | 'coverage_key';

export interface GameResult {
  score: number;          // 0-100
  cellsRevealed: number;  // safe cells revealed
  totalSafe: number;      // total safe cells on grid
  minesFound: number;     // correctly flagged mines
  totalMines: number;     // total mines on grid
  timeSeconds: number;    // elapsed seconds
  won: boolean;           // true = swept all safe cells
  gains: number;          // points earned
  losses: number;         // penalty
}

export interface PlayerInfo {
  name: string;
  mobile: string;
}
