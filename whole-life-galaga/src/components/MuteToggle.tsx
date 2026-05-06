import { useState, useEffect } from "react";
import { audioEngine } from "../audio";

export function MuteToggle() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(!audioEngine.getMusicEnabled());
  }, []);

  const toggle = () => {
    const isNowOn = audioEngine.toggleMusic();
    setMuted(!isNowOn);
  };

  return (
    <button 
      className={`mute-toggle ${muted ? 'muted' : ''}`} 
      onClick={toggle}
      title={muted ? "Unmute" : "Mute"}
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}