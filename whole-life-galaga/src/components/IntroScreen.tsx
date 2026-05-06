import { CONFIG } from "../constants";

interface IntroScreenProps {
  onPlay: () => void;
}

export function IntroScreen({ onPlay }: IntroScreenProps) {
  return (
    <div className="intro-screen">
      <div className="intro-art">
        <div className="art-shield">🛡️</div>
        <div className="art-stars">
          <span>★</span><span>★</span><span>★</span>
        </div>
      </div>
      <div className="intro-content">
        <p className="eyebrow">Whole Life Insurance</p>
        <h1>{CONFIG.copy.introTitle}</h1>
        <p className="subtitle">{CONFIG.copy.introHookLine}</p>
        <div className="key-points">
          <div className="key-point">
            <span>∞</span>
            <p>Coverage up to 100 years</p>
          </div>
          <div className="key-point">
            <span>💰</span>
            <p>Build cash value over time</p>
          </div>
          <div className="key-point">
            <span>👨‍👩‍👧</span>
            <p>Family gets money when you're gone</p>
          </div>
        </div>
        <button className="play-button" onClick={onPlay}>
          Play Now
        </button>
      </div>
    </div>
  );
}