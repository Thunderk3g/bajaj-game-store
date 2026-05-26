export enum Screen {
  INTRO   = 'intro',
  GAME    = 'game',
  DETAILS = 'details',
  SCORING = 'scoring',
}

export interface GameResult {
  portfolio: number;        // normalised score 0-100 (ScoringScreen dial)
  distance: number;         // virtual metres run
  coinsCollected: number;   // savings coins picked up
  obstaclesDodged: number;  // obstacles avoided
  livesRemaining: number;
  shieldsUsed: number;
  timeSeconds: number;
  gains: number;            // coinsCollected * 500
  losses: number;           // livesLost * 400
  rawScore: number;
}

export interface PlayerInfo {
  name: string;
  mobile: string;
}

