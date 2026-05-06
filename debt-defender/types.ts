export enum Screen {
  INTRO = 'intro',
  HOW_TO_PLAY = 'how_to_play',
  GAME = 'game',
  DETAILS = 'details',
  SCORING = 'scoring',
  THANK_YOU = 'thank_you',
}

export type EnemyType = 'emi' | 'credit_card' | 'tax_notice' | 'market_crash' | 'loan_shark' | 'coverage_gap';

export interface GameResult {
  score: number;
  killCount: number;
  healthRemaining: number;
  maxHealth: number;
  timeSurvivedSeconds: number;
  rawScore: number;
}

export interface PlayerInfo {
  name: string;
  mobile: string;
}

export interface HowToPlayItem {
  icon: string;
  text: string;
}
