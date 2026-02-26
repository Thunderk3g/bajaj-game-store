class AudioService {
    private ctx: AudioContext | null = null;

    private initCtx() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    private playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + startTime);
        osc.stop(this.ctx.currentTime + startTime + duration);
    }

    playDiceRoll() {
        this.initCtx();
        const freqs = [300, 400, 500];
        freqs.forEach((f, i) => {
            this.playTone(f, 'sine', 0.1, i * 0.08);
        });
    }

    playSnakeBite() {
        this.initCtx();
        this.playTone(200, 'sawtooth', 0.5);
        this.playTone(120, 'sawtooth', 0.5, 0.1);
    }

    playLadderClimb() {
        this.initCtx();
        const freqs = [400, 500, 600, 800];
        freqs.forEach((f, i) => {
            this.playTone(f, 'sine', 0.2, i * 0.1);
        });
    }

    playShieldSave() {
        this.initCtx();
        const freqs = [500, 700, 900];
        freqs.forEach((f, i) => {
            this.playTone(f, 'triangle', 0.3, i * 0.12);
        });
    }

    playWin() {
        this.initCtx();
        const freqs = [400, 500, 600, 700, 800];
        freqs.forEach((f, i) => {
            this.playTone(f, 'sine', 0.5, i * 0.12);
        });
    }
}

export const audioService = new AudioService();
