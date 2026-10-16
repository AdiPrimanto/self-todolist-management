// Web Audio API Synthesizer (tidak butuh file eksternal mp3, zero latency)

class SoundManager {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    const saved = localStorage.getItem('zentask_sound_enabled') || localStorage.getItem('toscatask_sound_enabled');
    this.isEnabled = saved !== null ? saved === 'true' : true;
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  isSoundEnabled(): boolean {
    return this.isEnabled;
  }

  toggleSound(): boolean {
    this.isEnabled = !this.isEnabled;
    localStorage.setItem('zentask_sound_enabled', String(this.isEnabled));
    if (this.isEnabled) {
      this.playChime();
    }
    return this.isEnabled;
  }

  // Chime santai saat task diselesaikan
  playSuccess() {
    if (!this.isEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      // Harmonic chord: E6 to B6
      osc1.frequency.setValueAtTime(1318.51, now);
      osc1.frequency.exponentialRampToValueAtTime(1975.53, now + 0.12);

      osc2.frequency.setValueAtTime(659.25, now);
      osc2.frequency.exponentialRampToValueAtTime(987.77, now + 0.12);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.4);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  playPop() {
    if (!this.isEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.06);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // ignore
    }
  }

  playChime() {
    this.playSuccess();
  }
}

export const soundManager = new SoundManager();
