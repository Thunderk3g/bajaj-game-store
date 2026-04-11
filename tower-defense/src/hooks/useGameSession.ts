import { startTransition, useEffect, useRef, useState } from 'react';
import {
  TOWER_DEFINITIONS,
  type GameMode,
  type GameSnapshot,
  type PlayerPresence,
  type TowerType,
} from '../../shared/game-data';
import type { ServerMessage } from '../../shared/protocol';
import {
  attemptPlaceTower,
  createRuntimeState,
  createSnapshot,
  recordSystemEvent,
  startNextWave,
  stepRuntimeState,
  type RuntimeGameState,
} from '../game/engine';
import { LanClient } from '../network/client';

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'error';

interface RoomConnectOptions {
  playerName: string;
  roomId: string;
  serverUrl: string;
}

const LOCAL_PLAYER_ID = 'local-defender';

export const useGameSession = () => {
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);
  const [mode, setMode] = useState<GameMode | null>(null);
  const [selectedTowerType, setSelectedTowerType] =
    useState<TowerType>('savings');
  const [connectionState, setConnectionState] =
    useState<ConnectionState>('idle');
  const [connectionMessage, setConnectionMessage] = useState<string | null>(
    null,
  );
  const [roomId, setRoomId] = useState<string | null>(null);
  const [localPlayerName, setLocalPlayerName] = useState('Planner');

  const engineRef = useRef<RuntimeGameState | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const networkClientRef = useRef<LanClient | null>(null);
  const disconnectingRef = useRef(false);

  const stopLocalLoop = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    engineRef.current = null;
  };

  const stopNetwork = () => {
    if (!networkClientRef.current) {
      return;
    }

    disconnectingRef.current = true;
    networkClientRef.current.close();
    networkClientRef.current = null;
  };

  const resetSession = () => {
    stopLocalLoop();
    stopNetwork();
    setSnapshot(null);
    setMode(null);
    setConnectionState('idle');
    setConnectionMessage(null);
    setRoomId(null);
  };

  const publishSnapshot = (nextSnapshot: GameSnapshot) => {
    startTransition(() => {
      setSnapshot(nextSnapshot);
    });
  };

  const startSinglePlayer = (playerName: string) => {
    stopNetwork();
    stopLocalLoop();

    const normalizedName = playerName.trim() || 'Solo Planner';
    const players: PlayerPresence[] = [
      {
        id: LOCAL_PLAYER_ID,
        name: normalizedName,
        connected: true,
        isHost: true,
      },
    ];

    const runtimeState = createRuntimeState('single', null, players);
    recordSystemEvent(
      runtimeState,
      'PLAYER_JOIN',
      `${normalizedName} entered single-player command.`,
    );

    engineRef.current = runtimeState;
    setMode('single');
    setRoomId(null);
    setLocalPlayerName(normalizedName);
    setConnectionState('connected');
    setConnectionMessage(null);
    publishSnapshot(createSnapshot(runtimeState));

    lastFrameRef.current = performance.now();

    const runFrame = (timestamp: number) => {
      const currentState = engineRef.current;
      if (!currentState) {
        return;
      }

      const deltaTime = Math.min(
        (timestamp - lastFrameRef.current) / 1000,
        0.1,
      );
      lastFrameRef.current = timestamp;
      stepRuntimeState(currentState, deltaTime);
      publishSnapshot(createSnapshot(currentState));
      animationFrameRef.current = requestAnimationFrame(runFrame);
    };

    animationFrameRef.current = requestAnimationFrame(runFrame);
  };

  const handleServerMessage = (message: ServerMessage) => {
    switch (message.type) {
      case 'CONNECTED': {
        return;
      }
      case 'ROOM_JOINED': {
        setMode('multiplayer');
        setRoomId(message.payload.roomId);
        setConnectionState('connected');
        setConnectionMessage(null);
        publishSnapshot(message.payload.snapshot);
        return;
      }
      case 'STATE_SYNC': {
        setConnectionState('connected');
        publishSnapshot(message.payload.snapshot);
        return;
      }
      case 'GAME_EVENT': {
        setConnectionMessage(message.payload.event.message);
        return;
      }
      case 'ACTION_REJECTED': {
        setConnectionMessage(message.payload.reason);
        return;
      }
      case 'ROOM_CLOSED': {
        setConnectionState('error');
        setConnectionMessage(message.payload.reason);
        setSnapshot(null);
      }
    }
  };

  const connectToRoom = (
    action: 'CREATE_ROOM' | 'JOIN_ROOM',
    options: RoomConnectOptions,
  ) => {
    stopLocalLoop();
    stopNetwork();

    const normalizedName = options.playerName.trim() || 'LAN Defender';
    const normalizedRoomId = options.roomId.trim().toUpperCase();
    setMode('multiplayer');
    setRoomId(normalizedRoomId);
    setLocalPlayerName(normalizedName);
    setConnectionState('connecting');
    setConnectionMessage(`Connecting to ${options.serverUrl} ...`);

    const client = new LanClient(options.serverUrl, {
      onOpen: () => {
        if (action === 'CREATE_ROOM') {
          client.send({
            type: 'CREATE_ROOM',
            payload: {
              playerName: normalizedName,
              roomId: normalizedRoomId,
            },
          });
          return;
        }

        client.send({
          type: 'JOIN_ROOM',
          payload: {
            playerName: normalizedName,
            roomId: normalizedRoomId,
          },
        });
      },
      onMessage: handleServerMessage,
      onError: (nextMessage) => {
        setConnectionState('error');
        setConnectionMessage(nextMessage);
      },
      onClose: () => {
        if (disconnectingRef.current) {
          disconnectingRef.current = false;
          return;
        }

        setConnectionState('error');
        setConnectionMessage('The LAN session closed unexpectedly.');
      },
    });

    networkClientRef.current = client;
    client.connect();
  };

  const hostMultiplayer = (options: RoomConnectOptions) => {
    connectToRoom('CREATE_ROOM', options);
  };

  const joinMultiplayer = (options: RoomConnectOptions) => {
    connectToRoom('JOIN_ROOM', options);
  };

  const placeTower = (padId: string) => {
    if (!snapshot) {
      return;
    }

    if (mode === 'single') {
      const currentState = engineRef.current;
      if (!currentState) {
        return;
      }

      const result = attemptPlaceTower(
        currentState,
        padId,
        selectedTowerType,
        localPlayerName,
      );

      if (!result.accepted) {
        setConnectionMessage(result.reason ?? 'Tower placement failed.');
        return;
      }

      publishSnapshot(createSnapshot(currentState));
      return;
    }

    networkClientRef.current?.send({
      type: 'PLACE_TOWER',
      payload: {
        padId,
        towerType: selectedTowerType,
      },
    });
  };

  const startWave = () => {
    if (!snapshot) {
      return;
    }

    if (mode === 'single') {
      const currentState = engineRef.current;
      if (!currentState) {
        return;
      }

      const result = startNextWave(currentState, localPlayerName);
      if (!result.accepted) {
        setConnectionMessage(result.reason ?? 'Unable to start the wave.');
        return;
      }

      publishSnapshot(createSnapshot(currentState));
      return;
    }

    networkClientRef.current?.send({ type: 'START_WAVE' });
  };

  const leaveSession = () => {
    if (mode === 'multiplayer') {
      networkClientRef.current?.send({ type: 'LEAVE_ROOM' });
    }

    resetSession();
  };

  useEffect(
    () => () => {
      stopLocalLoop();
      stopNetwork();
    },
    [],
  );

  const canAffordSelectedTower = snapshot
    ? snapshot.resources >= TOWER_DEFINITIONS[selectedTowerType].cost
    : false;

  return {
    snapshot,
    mode,
    roomId,
    localPlayerName,
    selectedTowerType,
    connectionState,
    connectionMessage,
    canAffordSelectedTower,
    startSinglePlayer,
    hostMultiplayer,
    joinMultiplayer,
    leaveSession,
    placeTower,
    startWave,
    setSelectedTowerType,
  };
};
