export enum Screen {
  INTRO        = 'intro',
  GAME         = 'game',
  DETAILS      = 'details',
  SCORING      = 'scoring',
}

export interface GameResult {
  bricksCleared: number;
  totalBricks: number;
  ballsLost: number;
  livesRemaining: number;
  timeSeconds: number;
  rawScore: number;
  won: boolean;
  positiveBricksHit: number;
  negativeBricksHit: number;
  gainPts: number;
  drainPts: number;
}

export interface PlayerInfo {
  name: string;
  mobile: string;
}
