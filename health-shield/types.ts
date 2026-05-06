export enum Screen {
  INTRO        = 'intro',
  HOW_TO_PLAY  = 'how_to_play',
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
}

export interface PlayerInfo {
  name: string;
  mobile: string;
}
