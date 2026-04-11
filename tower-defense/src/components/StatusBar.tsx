import type { GameMode, GameSnapshot } from '../../shared/game-data';

interface StatusBarProps {
  snapshot: GameSnapshot;
  mode: GameMode;
  roomId: string | null;
  connectionState: 'idle' | 'connecting' | 'connected' | 'error';
  connectionMessage: string | null;
  onStartWave: () => void;
  onLeaveSession: () => void;
}

export const StatusBar = ({
  snapshot,
  mode,
  roomId,
  connectionState,
  connectionMessage,
  onStartWave,
  onLeaveSession,
}: StatusBarProps) => {
  const healthPercent =
    (snapshot.coreHealth / snapshot.coreMaxHealth) * 100;

  return (
    <header className="status-shell">
      <div className="status-panel">
        <div className="status-topline">
          <div>
            <p className="eyebrow">Family Protection Core</p>
            <h1>Legacy Defenders</h1>
          </div>
          <div className="status-actions">
            <button
              className="primary-button"
              type="button"
              onClick={onStartWave}
              disabled={!snapshot.canStartWave}
            >
              {snapshot.activeWave
                ? 'Wave in progress'
                : snapshot.waveNumber === 0
                  ? 'Start wave 1'
                  : `Launch wave ${snapshot.waveNumber + 1}`}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={onLeaveSession}
            >
              Exit match
            </button>
          </div>
        </div>

        <div className="status-grid">
          <div className="status-card">
            <span className="stat-label">Resources</span>
            <strong>{snapshot.resources}</strong>
            <p>Shared pool for both defenders.</p>
          </div>

          <div className="status-card">
            <span className="stat-label">Core health</span>
            <strong>
              {snapshot.coreHealth}/{snapshot.coreMaxHealth}
            </strong>
            <div className="health-bar">
              <div
                className="health-fill"
                style={{ width: `${healthPercent}%` }}
              />
            </div>
          </div>

          <div className="status-card">
            <span className="stat-label">Wave status</span>
            <strong>
              {snapshot.waveNumber}/{snapshot.totalWaves}
            </strong>
            <p>
              {snapshot.activeWave
                ? snapshot.currentWaveLabel
                : snapshot.nextWaveIn > 0
                  ? `Next wave in ${Math.ceil(snapshot.nextWaveIn)}s`
                  : snapshot.currentWaveLabel}
            </p>
          </div>

          <div className="status-card">
            <span className="stat-label">Mode</span>
            <strong>{mode === 'single' ? 'Single player' : 'LAN co-op'}</strong>
            <p>
              {roomId ? `Room ${roomId}` : 'Local game loop'}
              {' | '}
              {connectionState}
            </p>
          </div>
        </div>

        <div className="player-strip">
          {snapshot.players.map((player) => (
            <div key={player.id} className="player-pill">
              <span className={player.connected ? 'online-dot' : 'offline-dot'} />
              <strong>{player.name}</strong>
              <small>{player.isHost ? 'Host' : 'Teammate'}</small>
            </div>
          ))}
        </div>

        {connectionMessage ? (
          <div className="notice-banner">{connectionMessage}</div>
        ) : null}
      </div>
    </header>
  );
};
