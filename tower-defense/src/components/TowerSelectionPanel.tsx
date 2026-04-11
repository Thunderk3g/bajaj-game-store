import {
  TOWER_DEFINITIONS,
  TOWER_ORDER,
  type TowerType,
} from '../../shared/game-data';

interface TowerSelectionPanelProps {
  selectedTowerType: TowerType;
  resources: number;
  onSelectTower: (towerType: TowerType) => void;
}

export const TowerSelectionPanel = ({
  selectedTowerType,
  resources,
  onSelectTower,
}: TowerSelectionPanelProps) => (
  <section className="panel">
    <div className="panel-heading">
      <div>
        <p className="eyebrow">Tower menu</p>
        <h2>Insurance arsenal</h2>
      </div>
      <p className="panel-copy">
        Select a tower, then click an open deployment pad on the map.
      </p>
    </div>

    <div className="tower-grid">
      {TOWER_ORDER.map((towerType) => {
        const definition = TOWER_DEFINITIONS[towerType];
        const isSelected = towerType === selectedTowerType;
        const isAffordable = resources >= definition.cost;

        return (
          <button
            key={towerType}
            className={`tower-card${isSelected ? ' selected' : ''}`}
            type="button"
            onClick={() => onSelectTower(towerType)}
          >
            <span
              className="tower-swatch"
              style={{ backgroundColor: definition.color }}
            />
            <div className="tower-copy">
              <div className="tower-row">
                <strong>{definition.name}</strong>
                <span>{definition.cost}</span>
              </div>
              <p>{definition.description}</p>
              <small className={isAffordable ? 'affordable' : 'not-affordable'}>
                {isAffordable
                  ? definition.purpose
                  : 'Insufficient shared resources'}
              </small>
            </div>
          </button>
        );
      })}
    </div>
  </section>
);
