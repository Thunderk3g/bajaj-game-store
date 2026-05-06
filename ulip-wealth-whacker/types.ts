export enum Screen {
  INTRO   = 'intro',
  GAME    = 'game',
  DETAILS = 'details',
  SCORING = 'scoring',
}

export type MoleType = 'equity' | 'debt' | 'balanced' | 'bullrun' | 'crash' | 'charges';

export interface GameResult {
  portfolio: number;
  molesSeen: number;
  molesWhacked: number;
  goodWhacks: number;
  badWhacks: number;
  timeSeconds: number;
  rawScore: number;
}

export interface PlayerInfo {
  name: string;
  mobile: string;
}
