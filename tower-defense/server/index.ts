import { randomUUID, createHash } from 'node:crypto';
import { createServer } from 'node:http';
import type { Socket } from 'node:net';
import { networkInterfaces } from 'node:os';
import type {
  ClientMessage,
  ServerMessage,
} from '../shared/protocol.ts';
import type { PlayerPresence } from '../shared/game-data.ts';
import {
  attemptPlaceTower,
  createRuntimeState,
  createSnapshot,
  recordSystemEvent,
  setPlayers,
  startNextWave,
  stepRuntimeState,
  type RuntimeGameState,
} from '../src/game/engine.ts';

const PORT = Number(process.env.PORT ?? 3001);
const HOST = '0.0.0.0';
const TICK_RATE_MS = 50;
const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

interface ClientConnection {
  id: string;
  name: string;
  socket: Socket;
  buffer: Buffer;
  roomId: string | null;
  isHost: boolean;
  disconnected: boolean;
}

interface RoomSession {
  id: string;
  state: RuntimeGameState;
  clients: Map<string, ClientConnection>;
  interval: NodeJS.Timeout;
  lastTick: number;
}

const rooms = new Map<string, RoomSession>();

const encodeFrame = (payload: string, opcode = 0x1): Buffer => {
  const payloadBuffer = Buffer.from(payload);
  const payloadLength = payloadBuffer.length;

  if (payloadLength < 126) {
    return Buffer.concat([
      Buffer.from([0x80 | opcode, payloadLength]),
      payloadBuffer,
    ]);
  }

  if (payloadLength < 65536) {
    const header = Buffer.alloc(4);
    header[0] = 0x80 | opcode;
    header[1] = 126;
    header.writeUInt16BE(payloadLength, 2);
    return Buffer.concat([header, payloadBuffer]);
  }

  const header = Buffer.alloc(10);
  header[0] = 0x80 | opcode;
  header[1] = 127;
  header.writeBigUInt64BE(BigInt(payloadLength), 2);
  return Buffer.concat([header, payloadBuffer]);
};

const decodeFrames = (client: ClientConnection, chunk: Buffer): string[] => {
  client.buffer = Buffer.concat([client.buffer, chunk]);
  const messages: string[] = [];

  while (client.buffer.length >= 2) {
    const firstByte = client.buffer[0];
    const secondByte = client.buffer[1];
    const opcode = firstByte & 0x0f;
    const isMasked = (secondByte & 0x80) !== 0;
    let payloadLength = secondByte & 0x7f;
    let offset = 2;

    if (payloadLength === 126) {
      if (client.buffer.length < 4) {
        break;
      }
      payloadLength = client.buffer.readUInt16BE(2);
      offset = 4;
    } else if (payloadLength === 127) {
      if (client.buffer.length < 10) {
        break;
      }
      payloadLength = Number(client.buffer.readBigUInt64BE(2));
      offset = 10;
    }

    const maskOffset = offset;
    if (isMasked) {
      offset += 4;
    }

    if (client.buffer.length < offset + payloadLength) {
      break;
    }

    let payload = client.buffer.subarray(offset, offset + payloadLength);
    if (isMasked) {
      const mask = client.buffer.subarray(maskOffset, maskOffset + 4);
      payload = Buffer.from(payload.map((byte, index) => byte ^ mask[index % 4]));
    }

    client.buffer = client.buffer.subarray(offset + payloadLength);

    if (opcode === 0x8) {
      client.socket.write(encodeFrame('', 0x8));
      client.socket.end();
      break;
    }

    if (opcode === 0x9) {
      client.socket.write(encodeFrame(payload.toString('utf8'), 0xA));
      continue;
    }

    if (opcode === 0x1) {
      messages.push(payload.toString('utf8'));
    }
  }

  return messages;
};

const sendMessage = (client: ClientConnection, message: ServerMessage): void => {
  if (client.disconnected || client.socket.destroyed) {
    return;
  }

  client.socket.write(encodeFrame(JSON.stringify(message)));
};

const broadcast = (room: RoomSession, message: ServerMessage): void => {
  room.clients.forEach((client) => {
    sendMessage(client, message);
  });
};

const broadcastState = (room: RoomSession): void => {
  broadcast(room, {
    type: 'STATE_SYNC',
    payload: {
      snapshot: createSnapshot(room.state),
    },
  });
};

const toPlayerPresence = (room: RoomSession): PlayerPresence[] =>
  Array.from(room.clients.values()).map((client) => ({
    id: client.id,
    name: client.name,
    connected: !client.disconnected,
    isHost: client.isHost,
  }));

const syncPlayers = (room: RoomSession): void => {
  setPlayers(room.state, toPlayerPresence(room));
};

const createRoomCode = (): string =>
  Math.random().toString(36).slice(2, 6).toUpperCase();

const normalizeRoomId = (roomId?: string): string => {
  const normalized = (roomId ?? createRoomCode())
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6);
  return normalized || createRoomCode();
};

const destroyRoom = (roomId: string): void => {
  const room = rooms.get(roomId);
  if (!room) {
    return;
  }

  clearInterval(room.interval);
  rooms.delete(roomId);
};

const createRoom = (roomId: string): RoomSession => {
  const room: RoomSession = {
    id: roomId,
    state: createRuntimeState('multiplayer', roomId, []),
    clients: new Map(),
    interval: setInterval(() => {
      const currentRoom = rooms.get(roomId);
      if (!currentRoom) {
        return;
      }

      if (currentRoom.clients.size === 0) {
        destroyRoom(roomId);
        return;
      }

      const now = Date.now();
      const deltaTime = Math.min((now - currentRoom.lastTick) / 1000, 0.1);
      currentRoom.lastTick = now;
      const events = stepRuntimeState(currentRoom.state, deltaTime);

      events.forEach((event) => {
        broadcast(currentRoom, {
          type: 'GAME_EVENT',
          payload: { event },
        });
      });

      broadcastState(currentRoom);
    }, TICK_RATE_MS),
    lastTick: Date.now(),
  };

  rooms.set(roomId, room);
  return room;
};

const removeClientFromRoom = (client: ClientConnection): void => {
  if (!client.roomId) {
    return;
  }

  const room = rooms.get(client.roomId);
  if (!room) {
    client.roomId = null;
    return;
  }

  const departingName = client.name;
  const departingWasHost = client.isHost;
  room.clients.delete(client.id);
  client.roomId = null;
  client.isHost = false;

  if (room.clients.size === 0) {
    destroyRoom(room.id);
    return;
  }

  if (departingWasHost) {
    const nextHost = room.clients.values().next().value as
      | ClientConnection
      | undefined;
    if (nextHost) {
      nextHost.isHost = true;
    }
  }

  syncPlayers(room);
  const event = recordSystemEvent(
    room.state,
    'PLAYER_LEAVE',
    `${departingName} left room ${room.id}.`,
  );

  broadcast(room, {
    type: 'GAME_EVENT',
    payload: { event },
  });
  broadcastState(room);
};

const rejectAction = (client: ClientConnection, reason: string): void => {
  sendMessage(client, {
    type: 'ACTION_REJECTED',
    payload: { reason },
  });
};

const handleCreateRoom = (
  client: ClientConnection,
  message: Extract<ClientMessage, { type: 'CREATE_ROOM' }>,
): void => {
  const roomId = normalizeRoomId(message.payload.roomId);
  const playerName = message.payload.playerName.trim() || 'Host';

  if (rooms.has(roomId)) {
    rejectAction(client, `Room ${roomId} already exists.`);
    return;
  }

  removeClientFromRoom(client);
  const room = createRoom(roomId);
  client.name = playerName;
  client.roomId = roomId;
  client.isHost = true;
  room.clients.set(client.id, client);
  syncPlayers(room);

  const event = recordSystemEvent(
    room.state,
    'PLAYER_JOIN',
    `${playerName} opened room ${roomId}.`,
  );

  sendMessage(client, {
    type: 'ROOM_JOINED',
    payload: {
      roomId,
      playerId: client.id,
      isHost: true,
      snapshot: createSnapshot(room.state),
    },
  });

  broadcast(room, {
    type: 'GAME_EVENT',
    payload: { event },
  });
  broadcastState(room);
};

const handleJoinRoom = (
  client: ClientConnection,
  message: Extract<ClientMessage, { type: 'JOIN_ROOM' }>,
): void => {
  const roomId = normalizeRoomId(message.payload.roomId);
  const room = rooms.get(roomId);
  const playerName = message.payload.playerName.trim() || 'Guest';

  if (!room) {
    rejectAction(client, `Room ${roomId} was not found.`);
    return;
  }

  if (room.clients.size >= 2) {
    rejectAction(client, `Room ${roomId} is already full.`);
    return;
  }

  removeClientFromRoom(client);
  client.name = playerName;
  client.roomId = roomId;
  client.isHost = false;
  room.clients.set(client.id, client);
  syncPlayers(room);

  const event = recordSystemEvent(
    room.state,
    'PLAYER_JOIN',
    `${playerName} joined room ${roomId}.`,
  );

  sendMessage(client, {
    type: 'ROOM_JOINED',
    payload: {
      roomId,
      playerId: client.id,
      isHost: false,
      snapshot: createSnapshot(room.state),
    },
  });

  broadcast(room, {
    type: 'GAME_EVENT',
    payload: { event },
  });
  broadcastState(room);
};

const getRoomForClient = (client: ClientConnection): RoomSession | null => {
  if (!client.roomId) {
    rejectAction(client, 'Join or create a room first.');
    return null;
  }

  const room = rooms.get(client.roomId);
  if (!room) {
    rejectAction(client, 'The selected room is no longer active.');
    return null;
  }

  return room;
};

const handlePlaceTower = (
  client: ClientConnection,
  message: Extract<ClientMessage, { type: 'PLACE_TOWER' }>,
): void => {
  const room = getRoomForClient(client);
  if (!room) {
    return;
  }

  const result = attemptPlaceTower(
    room.state,
    message.payload.padId,
    message.payload.towerType,
    client.name,
  );

  if (!result.accepted) {
    rejectAction(client, result.reason ?? 'Unable to place that tower.');
    return;
  }

  if (result.event) {
    broadcast(room, {
      type: 'GAME_EVENT',
      payload: { event: result.event },
    });
  }
  broadcastState(room);
};

const handleStartWave = (client: ClientConnection): void => {
  const room = getRoomForClient(client);
  if (!room) {
    return;
  }

  const result = startNextWave(room.state, client.name);
  if (!result.accepted) {
    rejectAction(client, result.reason ?? 'Unable to start the next wave.');
    return;
  }

  if (result.event) {
    broadcast(room, {
      type: 'GAME_EVENT',
      payload: { event: result.event },
    });
  }
  broadcastState(room);
};

const handleParsedMessage = (client: ClientConnection, rawMessage: string): void => {
  let message: ClientMessage;

  try {
    message = JSON.parse(rawMessage) as ClientMessage;
  } catch {
    rejectAction(client, 'Could not parse the incoming message.');
    return;
  }

  switch (message.type) {
    case 'CREATE_ROOM':
      handleCreateRoom(client, message);
      return;
    case 'JOIN_ROOM':
      handleJoinRoom(client, message);
      return;
    case 'PLACE_TOWER':
      handlePlaceTower(client, message);
      return;
    case 'START_WAVE':
      handleStartWave(client);
      return;
    case 'LEAVE_ROOM':
      removeClientFromRoom(client);
      sendMessage(client, {
        type: 'ROOM_CLOSED',
        payload: { reason: 'You left the room.' },
      });
      client.socket.end();
      return;
    case 'PING':
      return;
  }
};

const handleDisconnect = (client: ClientConnection): void => {
  if (client.disconnected) {
    return;
  }

  client.disconnected = true;
  removeClientFromRoom(client);
};

const announceLanAddresses = (): void => {
  const interfaces = networkInterfaces();
  const addresses = Object.values(interfaces)
    .flat()
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .filter((entry) => entry.family === 'IPv4' && !entry.internal)
    .map((entry) => entry.address);

  const uniqueAddresses = Array.from(new Set(addresses));
  const externalEndpoints = uniqueAddresses.map(
    (address) => `ws://${address}:${PORT}`,
  );

  console.log('[Legacy Defenders] LAN server ready');
  console.log(`[Legacy Defenders] Local endpoint: ws://localhost:${PORT}`);
  externalEndpoints.forEach((endpoint) => {
    console.log(`[Legacy Defenders] LAN endpoint: ${endpoint}`);
  });
};

const server = createServer((_, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(
    JSON.stringify({
      name: 'Legacy Defenders LAN server',
      port: PORT,
      rooms: Array.from(rooms.keys()),
    }),
  );
});

server.on('upgrade', (request, socket) => {
  const websocketKey = request.headers['sec-websocket-key'];
  if (!websocketKey || Array.isArray(websocketKey)) {
    socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
    socket.destroy();
    return;
  }

  const acceptKey = createHash('sha1')
    .update(websocketKey + WS_GUID)
    .digest('base64');

  socket.write(
    [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${acceptKey}`,
      '',
      '',
    ].join('\r\n'),
  );

  const client: ClientConnection = {
    id: randomUUID().slice(0, 8),
    name: 'Player',
    socket,
    buffer: Buffer.alloc(0),
    roomId: null,
    isHost: false,
    disconnected: false,
  };

  sendMessage(client, {
    type: 'CONNECTED',
    payload: {
      playerId: client.id,
    },
  });

  socket.on('data', (chunk) => {
    decodeFrames(client, chunk).forEach((message) => {
      handleParsedMessage(client, message);
    });
  });

  socket.on('close', () => {
    handleDisconnect(client);
  });

  socket.on('error', () => {
    handleDisconnect(client);
  });
});

server.on('error', (error) => {
  console.error(`[Legacy Defenders] Server failed to start: ${error.message}`);
  process.exit(1);
});

server.listen(PORT, HOST, announceLanAddresses);
