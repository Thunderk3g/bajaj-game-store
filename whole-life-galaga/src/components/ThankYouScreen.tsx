import { Lead } from "../types";
import { CONFIG } from "../constants";

interface ThankYouScreenProps {
  lead: Lead;
  onPlayAgain: () => void;
}

export function ThankYouScreen({ lead, onPlayAgain }: ThankYouScreenProps) {
  return (
    <div className="thankyou-screen">
      <div className="thankyou-content">
        <h1>THANK YOU!</h1>
        <p className="lead-name">{lead.name.toUpperCase()}</p>
        <p className="thankyou-text">{CONFIG.copy.thankYouBody}</p>
        <button className="play-again-btn" onClick={onPlayAgain}>
          Play Again
        </button>
      </div>
    </div>
  );
}