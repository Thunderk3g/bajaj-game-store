export enum Screen {
  INTRO = 'intro',
  GAME = 'game',
  DETAILS = 'details',
  SCORING = 'scoring',
  THANK_YOU = 'thank-you'
}

export interface GameResult {
  rawScore: number;
  movesUsed: number;
  correctTiles: number;
  totalTiles: number;
  timeSeconds: number;
  solved: boolean;
}

export interface PlayerInfo {
  name: string;
  mobile: string;
}
