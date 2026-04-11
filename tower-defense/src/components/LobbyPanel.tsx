import { useState } from 'react';

interface RoomConnectOptions {
  playerName: string;
  roomId: string;
  serverUrl: string;
}

interface LobbyPanelProps {
  connectionState: 'idle' | 'connecting' | 'connected' | 'error';
  connectionMessage: string | null;
  onStartSingle: (playerName: string) => void;
  onHostMatch: (options: RoomConnectOptions) => void;
  onJoinMatch: (options: RoomConnectOptions) => void;
}

const generateRoomCode = (): string =>
  Math.random().toString(36).slice(2, 6).toUpperCase();

export const LobbyPanel = ({
  connectionState,
  connectionMessage,
  onStartSingle,
  onHostMatch,
  onJoinMatch,
}: LobbyPanelProps) => {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const defaultServerUrl = `${protocol}://${window.location.hostname || 'localhost'}:3001`;

  const [playerName, setPlayerName] = useState('Defender One');
  const [roomId, setRoomId] = useState(generateRoomCode());
  const [serverUrl, setServerUrl] = useState(defaultServerUrl);

  const normalizedRoomId = roomId.trim().toUpperCase();

  return (
    <main className="lobby-shell">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Co-op tower defense</p>
          <h1>Legacy Defenders</h1>
          <p className="hero-description">
            Protect the Family Protection Core from debt, inflation, job loss,
            and medical crises. Build a lean insurance-themed defense that works
            in solo mode or over the same WiFi using a simple LAN WebSocket
            server.
          </p>
        </div>

        <div className="summary-grid">
          <article className="summary-card">
            <strong>Simple build pads</strong>
            <p>Players click fixed deployment pads instead of managing a grid.</p>
          </article>
          <article className="summary-card">
            <strong>Shared economy</strong>
            <p>Both players spend from one resource pool and defend one core.</p>
          </article>
          <article className="summary-card">
            <strong>Authoritative sync</strong>
            <p>The LAN server owns enemy waves, damage, and shared state.</p>
          </article>
        </div>
      </section>

      <section className="panel lobby-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Game modes</p>
            <h2>Deploy your defense</h2>
          </div>
          <p className="panel-copy">
            Use the default LAN server URL when both browsers are on the same
            machine or connected over the same WiFi network.
          </p>
        </div>

        <label className="field">
          <span>Player name</span>
          <input
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
            placeholder="Defender name"
          />
        </label>

        <label className="field">
          <span>LAN server</span>
          <input
            value={serverUrl}
            onChange={(event) => setServerUrl(event.target.value)}
            placeholder="ws://192.168.x.x:3001"
          />
        </label>

        <label className="field">
          <span>Room code</span>
          <div className="field-row">
            <input
              value={roomId}
              onChange={(event) => setRoomId(event.target.value.toUpperCase())}
              placeholder="ABCD"
            />
            <button
              className="secondary-button"
              type="button"
              onClick={() => setRoomId(generateRoomCode())}
            >
              Regenerate
            </button>
          </div>
        </label>

        <div className="lobby-actions">
          <button
            className="primary-button"
            type="button"
            onClick={() => onStartSingle(playerName)}
          >
            Start single player
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={() =>
              onHostMatch({
                playerName,
                roomId: normalizedRoomId,
                serverUrl,
              })
            }
          >
            Host LAN lobby
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={() =>
              onJoinMatch({
                playerName,
                roomId: normalizedRoomId,
                serverUrl,
              })
            }
          >
            Join lobby
          </button>
        </div>

        <div className="notice-banner">
          Connection: {connectionState}
          {connectionMessage ? ` | ${connectionMessage}` : ''}
        </div>
      </section>
    </main>
  );
};
