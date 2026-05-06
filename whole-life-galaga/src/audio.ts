import { CONFIG } from "./constants";

type SoundType = "score" | "powerup" | "hit" | "gameover" | "click";

class AudioEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicOscillators: OscillatorNode[] = [];
  private isPlaying = false;
  private musicEnabled: boolean;
  private sfxEnabled: boolean;
  
  constructor() {
    this.musicEnabled = CONFIG.audio.musicEnabledByDefault;
    this.sfxEnabled = CONFIG.audio.sfxEnabledByDefault;
  }
  
  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.musicGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.15;
    this.sfxGain.gain.value = 0.3;
    this.musicGain.connect(this.ctx.destination);
    this.sfxGain.connect(this.ctx.destination);
  }
  
  resume() {
    if (this.ctx?.state === "suspended") {
      this.ctx.resume();
    }
  }
  
  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (this.musicGain) {
      this.musicGain.gain.setValueAtTime(enabled ? 0.15 : 0, this.ctx!.currentTime);
    }
  }
  
  setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
    if (this.sfxGain) {
      this.sfxGain.gain.setValueAtTime(enabled ? 0.3 : 0, this.ctx!.currentTime);
    }
  }
  
  getMusicEnabled() { return this.musicEnabled; }
  getSfxEnabled() { return this.sfxEnabled; }
  
  toggleMusic() {
    this.setMusicEnabled(!this.musicEnabled);
    return this.musicEnabled;
  }
  
  toggleSfx() {
    this.setSfxEnabled(!this.sfxEnabled);
    return this.sfxEnabled;
  }
  
  startMusic() {
    if (!this.ctx || !this.musicEnabled || this.isPlaying) return;
    this.isPlaying = true;
    this.playBackgroundMusic();
  }
  
  stopMusic() {
    this.isPlaying = false;
    this.musicOscillators.forEach(osc => {
      try { osc.stop(); } catch {}
    });
    this.musicOscillators = [];
  }
  
  private playBackgroundMusic() {
    if (!this.ctx || !this.isPlaying) return;
    
    const notes = [261.63, 329.63, 392.00, 329.63];
    const noteLength = 0.3;
    let noteIndex = 0;
    
    const playNote = () => {
      if (!this.isPlaying || !this.ctx) return;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.value = notes[noteIndex];
      
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + noteLength);
      
      osc.connect(gain);
      gain.connect(this.musicGain!);
      
      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + noteLength);
      
      noteIndex = (noteIndex + 1) % notes.length;
      
      setTimeout(playNote, noteLength * 1000);
    };
    
    playNote();
  }
  
  playSound(type: SoundType) {
    if (!this.ctx || !this.sfxEnabled) return;
    
    switch (type) {
      case "score":
        this.playTone(880, 0.08, "square", 0.1);
        break;
      case "powerup":
        this.playTone(523.25, 0.1, "sine", 0.15);
        setTimeout(() => this.playTone(659.25, 0.1, "sine", 0.15), 80);
        setTimeout(() => this.playTone(783.99, 0.15, "sine", 0.2), 160);
        break;
      case "hit":
        this.playTone(220, 0.15, "sawtooth", 0.1);
        break;
      case "gameover":
        this.playTone(392, 0.2, "sine", 0.15);
        setTimeout(() => this.playTone(329.63, 0.3, "sine", 0.15), 200);
        break;
      case "click":
        this.playTone(600, 0.05, "sine", 0.08);
        break;
    }
  }
  
  private playTone(freq: number, duration: number, type: OscillatorType = "sine", volume: number = 0.1) {
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration);
  }
  
  destroy() {
    this.stopMusic();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

export const audioEngine = new AudioEngine();