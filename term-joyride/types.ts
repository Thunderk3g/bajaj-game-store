export enum Screen {
  INTRO   = 'intro',
  GAME    = 'game',
  DETAILS = 'details',
  SCORING = 'scoring',
}

export type ItemType =
  | 'deposits'
  | 'savings'
  | 'salary'
  | 'retirement'
  | 'hospitalization'
  | 'disability'
  | 'cancer'
  | 'accident';

export interface GameResult {
  portfolio: number;
  distance: number;
  coinsCollected: number;
  goodCollected: number;
  badHit: number;
  timeSeconds: number;
  rawScore: number;
  gains: number;
  losses: number;
}

export interface PlayerInfo {
  name: string;
  mobile: string;
}
