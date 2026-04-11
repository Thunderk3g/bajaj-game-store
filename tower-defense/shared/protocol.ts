import type {
  GameEvent,
  GameSnapshot,
  TowerType,
} from './game-data';

export type ClientMessage =
  | {
      type: 'CREATE_ROOM';
      payload: {
        playerName: string;
        roomId?: string;
      };
    }
  | {
      type: 'JOIN_ROOM';
      payload: {
        playerName: string;
        roomId: string;
      };
    }
  | {
      type: 'PLACE_TOWER';
      payload: {
        padId: string;
        towerType: TowerType;
      };
    }
  | {
      type: 'START_WAVE';
    }
  | {
      type: 'LEAVE_ROOM';
    }
  | {
      type: 'PING';
    };

export type ServerMessage =
  | {
      type: 'CONNECTED';
      payload: {
        playerId: string;
      };
    }
  | {
      type: 'ROOM_JOINED';
      payload: {
        roomId: string;
        playerId: string;
        isHost: boolean;
        snapshot: GameSnapshot;
      };
    }
  | {
      type: 'STATE_SYNC';
      payload: {
        snapshot: GameSnapshot;
      };
    }
  | {
      type: 'GAME_EVENT';
      payload: {
        event: GameEvent;
      };
    }
  | {
      type: 'ACTION_REJECTED';
      payload: {
        reason: string;
      };
    }
  | {
      type: 'ROOM_CLOSED';
      payload: {
        reason: string;
      };
    };
