import { useState } from "react";
import { Lead, GameResult } from "../types";
import { CONFIG, DISCLAIMER_TEXT } from "../constants";
import { audioEngine } from "../audio";

interface ScoringScreenProps {
  lead: Lead;
  result: GameResult;
  onBookSlot: () => void;
  onPlayAgain: () => void;
}

export function ScoringScreen({ lead, result, onBookSlot, onPlayAgain }: ScoringScreenProps) {
  const score = Math.min(100, Math.floor(result.score / 50));
  const [copied, setCopied] = useState(false);

  const handleCallNow = () => {
    audioEngine.playSound("click");
    window.location.href = `tel:${CONFIG.contact.callNowNumber}`;
  };

  const handleShare = async () => {
    audioEngine.playSound("click");
    const text = `I scored ${score}/100 in ${CONFIG.meta.gameName}! Can you beat my score?`;
    
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="scoring-screen">
      <p className="greeting">Hi {lead.name.trim()}!</p>
      <h2>Your Guardian Score</h2>
      
      <div className="score-ring">
        <span className="score-number">{score}</span>
        <span className="score-max">/ 100</span>
      </div>

      <div className="score-stats">
        <div className="stat-item">
          <b>{result.coveragePercent}%</b>
          <span>Life Coverage</span>
        </div>
        <div className="stat-item">
          <b>₹{result.savingsBuilt.toLocaleString()}</b>
          <span>Savings Built</span>
        </div>
        <div className="stat-item">
          <b>{result.enemiesDestroyed}</b>
          <span>Threats Stopped</span>
        </div>
        <div className="stat-item">
          <b>{formatTime(result.timeElapsed)}</b>
          <span>Time</span>
        </div>
      </div>

      <div className="green-zone">
        <h3>Great Progress!</h3>
        <p>You successfully protected your family's future and built valuable savings. Whole life insurance provides lifelong coverage and grows cash value over time.</p>
      </div>

      <div className="red-zone">
        <p className="product-tagline">{CONFIG.copy.scoringTagline}</p>
        <p className="cta-text">{CONFIG.copy.scoringCtaLine}</p>
        <p className="disclaimer">{DISCLAIMER_TEXT}</p>
      </div>

      <div className="action-buttons">
        <button className="secondary-btn" onClick={handleShare}>
          {copied ? "Copied!" : "Share"}
        </button>
        <button className="secondary-btn" onClick={handleCallNow}>
          Call Now
        </button>
        <button className="primary-btn" onClick={onBookSlot}>Book a Slot</button>
        <button className="ghost-btn" onClick={onPlayAgain}>Play Again</button>
      </div>
    </div>
  );
}