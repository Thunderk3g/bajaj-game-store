import { CONFIG } from "../constants";

interface InstructionsScreenProps {
  onStart: () => void;
}

export function InstructionsScreen({ onStart }: InstructionsScreenProps) {
  return (
    <div className="instructions-screen">
      <h2>How to Play</h2>
      <div className="instruction-list">
        <div className="instruction-item">
          <div className="instruction-icon">🚀</div>
          <div className="instruction-text">
            <b>Move your Life Shield</b>
            <span>Use left/right arrows or tap to move</span>
          </div>
        </div>
        <div className="instruction-item">
          <div className="instruction-icon">🔫</div>
          <div className="instruction-text">
            <b>Auto-fire protection</b>
            <span>Ships fire automatically at threats</span>
          </div>
        </div>
        <div className="instruction-item">
          <div className="instruction-icon">💎</div>
          <div className="instruction-text">
            <b>Collect power-ups</b>
            <span>Blue = Savings | Gold = Coverage</span>
          </div>
        </div>
        <div className="instruction-item">
          <div className="instruction-icon">👾</div>
          <div className="instruction-text">
            <b>Destroy life risks</b>
            <span>Health issues, emergencies, early death</span>
          </div>
        </div>
      </div>
      <div className="instruction-note">
        <p>{CONFIG.copy.introHowToPlay}</p>
      </div>
      <button className="start-button" onClick={onStart}>
        Start Mission
      </button>
    </div>
  );
}