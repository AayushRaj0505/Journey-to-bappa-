/**
 * SoundManager provides synthesized audio hooks for:
 * - footsteps
 * - interaction
 * - item pickup
 * - cupboard opening
 * - drawer opening
 * - puzzle success
 * - door opening
 * - background ambient music
 */
export class SoundManager {
  private static instance: SoundManager;
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;

  private constructor() {
    // Initialized on first user gesture
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  public isAudioMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.currentBgmSound && 'setVolume' in this.currentBgmSound) {
      (this.currentBgmSound as Phaser.Sound.WebAudioSound).setVolume(this.isMuted ? 0 : 0.4);
    }
    if (this.isMuted && this.ctx && this.bgmGain) {
      this.bgmGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    } else if (!this.isMuted && this.ctx && this.bgmGain && this.isBgmPlaying) {
      this.bgmGain.gain.setValueAtTime(0.03, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.currentBgmSound && 'setVolume' in this.currentBgmSound) {
      (this.currentBgmSound as Phaser.Sound.WebAudioSound).setVolume(this.isMuted ? 0 : 0.4);
    }
    if (this.isMuted && this.ctx && this.bgmGain) {
      this.bgmGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    } else if (!this.isMuted && this.ctx && this.bgmGain && this.isBgmPlaying) {
      this.bgmGain.gain.setValueAtTime(0.03, this.ctx.currentTime);
    }
  }

  public playButtonHover() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.045);
    } catch {
      // Audio context may not have been unlocked yet
    }
  }

  public playButtonClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.07);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.085);
    } catch {
      // Audio context may not have been unlocked yet
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playFootstep() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90 + Math.random() * 20, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  public playInteraction() {
    // Commented out for now per user request (was producing a weird noise on interaction)
    /*
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(680, this.ctx.currentTime + 0.09);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
    */
  }

  public playItemPickup() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.06 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.25);
    });
  }

  public playCupboardOpen() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Heavy wooden door creak
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(180, now + 0.2);
    osc.frequency.linearRampToValueAtTime(120, now + 0.45);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  public playDrawerOpen() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Sliding wooden drawer sound
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.3);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.33);
  }

  public playPuzzleSuccess() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Harmonic celebration chime (Indian sitar/tanpura inspired pentatonic chord)
    const now = this.ctx.currentTime;
    const freqs = [329.63, 392.00, 493.88, 587.33, 659.25, 987.77];
    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.12, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.65);
    });
  }

  public playDoorOpen() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Deep heavy latch release + door swing
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.linearRampToValueAtTime(165, now + 0.2);
    osc.frequency.linearRampToValueAtTime(80, now + 0.6);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.7);
  }

  private currentBgmSound?: Phaser.Sound.BaseSound;
  private currentBgmKey?: string;

  public playLevelBGM(scene: Phaser.Scene, audioKey: string, volume: number = 0.4) {
    if (this.currentBgmKey === audioKey && this.currentBgmSound && this.currentBgmSound.isPlaying) {
      return;
    }

    this.stopBGM();

    if (scene.cache.audio.exists(audioKey)) {
      this.currentBgmSound = scene.sound.add(audioKey, {
        loop: true,
        volume: this.isMuted ? 0 : volume
      });
      this.currentBgmSound.play();
      this.currentBgmKey = audioKey;
      this.isBgmPlaying = true;
    } else {
      this.startBGM();
    }
  }

  public startBGM() {
    if (this.isBgmPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    this.isBgmPlaying = true;
    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(0.03, this.ctx.currentTime);
    this.bgmGain.connect(this.ctx.destination);

    // Warm ambient tanpura-like drone
    const droneFreqs = [146.83, 220.00, 293.66]; // D3, A3, D4
    droneFreqs.forEach(f => {
      if (!this.ctx || !this.bgmGain) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);
      osc.connect(this.bgmGain);
      osc.start();
    });
  }

  public startDarkAmbientBGM() {
    this.stopBGM();
    this.initContext();
    if (!this.ctx) return;

    this.isBgmPlaying = true;
    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(0.035, this.ctx.currentTime);
    this.bgmGain.connect(this.ctx.destination);

    // Deep, mysterious spiritual drone (Low C2, G2, C3 + soft shimmer)
    const darkFreqs = [65.41, 98.00, 130.81, 196.00];
    darkFreqs.forEach((f, idx) => {
      if (!this.ctx || !this.bgmGain) return;
      const osc = this.ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(this.bgmGain);
      osc.start();
    });
  }

  public playAsthaIncrease() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Resonant Ghanti / Temple Bell chime (Harmonics 880Hz, 1320Hz, 1760Hz, 2640Hz)
    const now = this.ctx.currentTime;
    const freqs = [880, 1320, 1760, 2640];
    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.12 / (idx + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.25);
    });
  }

  public playClueDiscovered() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Sacred golden chime / harp pluck (E5, B5, E6 arpeggio)
    const now = this.ctx.currentTime;
    const notes = [659.25, 987.77, 1318.51];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.15, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.55);
    });
  }

  public playVighnaWhisper() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Low sub-bass rumble + eerie airy shadow whoosh
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, now);
    osc.frequency.linearRampToValueAtTime(75, now + 0.8);
    osc.frequency.linearRampToValueAtTime(40, now + 1.8);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, now);
    filter.frequency.linearRampToValueAtTime(260, now + 0.8);
    filter.frequency.linearRampToValueAtTime(80, now + 1.8);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.4);
    gain.gain.linearRampToValueAtTime(0.15, now + 1.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.9);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 2.0);
  }

  public playLevelComplete() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Triumphant, meditative Indian temple progression (Sa-Re-Ga-Pa-Dha-Sa)
    const now = this.ctx.currentTime;
    const ragaChords = [
      [261.63, 329.63, 392.00], // C4 major
      [293.66, 369.99, 440.00], // D
      [329.63, 415.30, 493.88], // E
      [392.00, 493.88, 587.33], // G
      [523.25, 659.25, 783.99, 1046.50] // C5 octave bloom
    ];

    ragaChords.forEach((chord, chordIdx) => {
      const time = now + chordIdx * 0.22;
      chord.forEach(freq => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.85);
      });
    });
  }

  public playVighnaAttack() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Heavy shadowy impact thud
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(120, now);
    osc1.frequency.exponentialRampToValueAtTime(30, now + 0.5);

    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.6);

    // Eerie dissonant screech
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(340, now);
    osc2.frequency.linearRampToValueAtTime(180, now + 0.4);

    gain2.gain.setValueAtTime(0.18, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.5);
  }

  public playMorseBeep(isDash: boolean) {
    // Commented out for now per user request
    /*
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const duration = isDash ? 0.22 : 0.08;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.008);
    gain.gain.setValueAtTime(0.12, now + duration - 0.008);
    gain.gain.linearRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.01);
    */
  }

  public playKeypadBeep() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  public pauseBGM() {
    if (this.currentBgmSound && this.currentBgmSound.isPlaying) {
      this.currentBgmSound.pause();
    }
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    }
  }

  public resumeBGM() {
    if (this.isMuted) return;
    if (this.currentBgmSound && this.currentBgmSound.isPaused) {
      this.currentBgmSound.resume();
    }
    if (this.bgmGain && this.ctx && this.isBgmPlaying) {
      this.bgmGain.gain.setValueAtTime(0.03, this.ctx.currentTime);
    }
  }

  public stopBGM() {
    if (this.currentBgmSound) {
      this.currentBgmSound.stop();
      this.currentBgmSound.destroy();
      this.currentBgmSound = undefined;
      this.currentBgmKey = undefined;
    }
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
    }
    this.isBgmPlaying = false;
  }
}

