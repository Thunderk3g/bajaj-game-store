export enum Screen {
  INTRO   = 'intro',
  GAME    = 'game',
  DETAILS = 'details',
  SCORING = 'scoring',
}

export type MoleType = 'investment' | 'salary' | 'savings' | 'rental' | 'retirement' | 'heart' | 'death' | 'disability' | 'cancer' | 'hospitalization';

export interface GameResult {
  portfolio: number;
  molesSeen: number;
  molesWhacked: number;
  goodWhacks: number;
  badWhacks: number;
  timeSeconds: number;
  rawScore: number;
  gains: number;
  losses: number;
}

export interface PlayerInfo {
  name: string;
  mobile: string;
}
