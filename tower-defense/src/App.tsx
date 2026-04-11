import { EventFeed } from './components/EventFeed';
import { GameCanvas } from './components/GameCanvas';
import { LobbyPanel } from './components/LobbyPanel';
import { StatusBar } from './components/StatusBar';
import { TowerSelectionPanel } from './components/TowerSelectionPanel';
import { TOWER_DEFINITIONS } from '../shared/game-data';
import { useGameSession } from './hooks/useGameSession';

const App = () => {
  const {
    snapshot,
    mode,
    roomId,
    selectedTowerType,
    connectionState,
    connectionMessage,
    startSinglePlayer,
    hostMultiplayer,
    joinMultiplayer,
    leaveSession,
    placeTower,
    startWave,
    setSelectedTowerType,
  } = useGameSession();

  if (!snapshot || !mode) {
    return (
      <LobbyPanel
        connectionState={connectionState}
        connectionMessage={connectionMessage}
        onStartSingle={startSinglePlayer}
        onHostMatch={hostMultiplayer}
        onJoinMatch={joinMultiplayer}
      />
    );
  }

  const selectedTower = TOWER_DEFINITIONS[selectedTowerType];

  return (
    <div className="app-shell">
      <StatusBar
        snapshot={snapshot}
        mode={mode}
        roomId={roomId}
        connectionState={connectionState}
        connectionMessage={connectionMessage}
        onStartWave={startWave}
        onLeaveSession={leaveSession}
      />

      <main className="battlefield">
        <section className="arena-shell">
          {snapshot.status === 'won' ? (
            <div className="state-banner success">
              All waves survived. Legacy secured.
            </div>
          ) : null}
          {snapshot.status === 'lost' ? (
            <div className="state-banner failure">
              The core was breached. Rebuild and try again.
            </div>
          ) : null}
          <GameCanvas
            snapshot={snapshot}
            selectedTowerType={selectedTowerType}
            onPadClick={placeTower}
          />
        </section>

        <aside className="control-column">
          <TowerSelectionPanel
            selectedTowerType={selectedTowerType}
            resources={snapshot.resources}
            onSelectTower={setSelectedTowerType}
          />

          <section className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Selected tower</p>
                <h2>{selectedTower.name}</h2>
              </div>
            </div>
            <div className="detail-grid">
              <div className="detail-card">
                <span>Cost</span>
                <strong>{selectedTower.cost}</strong>
              </div>
              <div className="detail-card">
                <span>Role</span>
                <strong>{selectedTower.shortLabel}</strong>
              </div>
            </div>
            <p className="detail-copy">{selectedTower.purpose}</p>
          </section>

          <EventFeed events={snapshot.eventFeed} />
        </aside>
      </main>
    </div>
  );
};

export default App;
