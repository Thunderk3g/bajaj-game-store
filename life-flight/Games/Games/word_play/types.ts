
export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  WON = 'WON',
  LOST = 'LOST',
  LEAD_FORM = 'LEAD_FORM',
  SUCCESS = 'SUCCESS'
}

export interface WordData {
  word: string;
  hint: string;
  fact: string;
}

export interface UserLead {
  fullName: string;
  mobile: string;
}
