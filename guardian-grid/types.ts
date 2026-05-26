export enum Screen {
  INTRO   = 'intro',
  GAME    = 'game',
  DETAILS = 'details',
  SCORING = 'scoring',
}

export interface GameResult {
  score: number;
  maxScore: number;
  puzzlesSolved: number;
  totalPuzzles: number;
  mistakes: number;
  hintsUsed: number;
  accuracy: number;
  timeSeconds: number;
  timeRemaining: number;
  levelReached: number;
  rawScore: number;
}

export interface PlayerInfo {
  name: string;
  mobile: string;
}
