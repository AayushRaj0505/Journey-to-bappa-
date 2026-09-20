import Phaser from 'phaser';
import { SoundManager } from '../systems/SoundManager';

export interface CutsceneData {
  transitionId: number;
  images: string[];
  audios?: (string | string[])[];
  targetLevel: number;
  targetSceneKey: string;
  targetStateInit?: () => void;
  title?: string;
}

export class CutsceneScene extends Phaser.Scene {
  private dataConfig!: CutsceneData;
  private currentImageIndex: number = 0;
  private currentImageSprite?: Phaser.GameObjects.Image;
  private currentVoSound?: Phaser.Sound.BaseSound;
  private counterText!: Phaser.GameObjects.Text;
  private titleText!: Phaser.GameObjects.Text;
  private autoAdvanceTimer?: Phaser.Time.TimerEvent;
  private isTransitioning: boolean = false;
  private soundManager!: SoundManager;

  constructor() {
    super('CutsceneScene');
  }

  init(data: CutsceneData) {
    this.dataConfig = data;
    this.currentImageIndex = 0;
    this.isTransitioning = false;
    this.currentVoSound = undefined;
  }

  create() {
    const { width, height } = this.cameras.main;
    this.soundManager = SoundManager.getInstance();
    this.soundManager.stopBGM();
    this.soundManager.playLevelComplete();

    // 1. Black background
    this.add.rectangle(width / 2, height / 2, width, height, 0x050302, 1);

    // 2. Interactive full-screen touch listener (tap anywhere to advance)
    const touchOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.001);
    touchOverlay.setInteractive({ useHandCursor: true });
    touchOverlay.on('pointerdown', () => this.advanceCutscene());

    // 3. Header & Footer Bars (Cinematic framing)
    const headerBar = this.add.rectangle(width / 2, 30, width, 60, 0x0e0804, 0.92);
    headerBar.setStrokeStyle(1, 0xd49b3d, 0.6);
    headerBar.setDepth(50);

    const footerBar = this.add.rectangle(width / 2, height - 35, width, 70, 0x0e0804, 0.92);
    footerBar.setStrokeStyle(1, 0xd49b3d, 0.6);
    footerBar.setDepth(50);

    // Header Title
    const defaultTitle = `CHAPTER ${this.dataConfig.transitionId}: THE SACRED PATH`;
    this.titleText = this.add.text(width / 2, 30, this.dataConfig.title || defaultTitle, {
      fontFamily: 'Cinzel, serif',
      fontSize: '18px',
      color: '#ffd07b',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(51);

    // Header Main Menu Button (Top Right)
    const menuBtn = this.add.rectangle(width - 90, 30, 130, 34, 0x3d200e, 0.95);
    menuBtn.setStrokeStyle(1.5, 0xffd07b, 0.9);
    menuBtn.setInteractive({ useHandCursor: true }).setDepth(51);

    const menuTxt = this.add.text(width - 90, 30, '🏠 MAIN MENU', {
      fontFamily: 'Cinzel, serif',
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(52);

    menuBtn.on('pointerdown', (e: Phaser.Input.Pointer) => {
      e.event.stopPropagation();
      this.soundManager.playButtonClick();
      this.stopCurrentAudio();
      this.scene.stop('CutsceneScene');
      this.scene.start('MainMenuScene');
    });

    menuBtn.on('pointerover', () => menuBtn.setFillStyle(0x6e3919));
    menuBtn.on('pointerout', () => menuBtn.setFillStyle(0x3d200e));

    // Footer Counter Badge
    this.counterText = this.add.text(45, height - 35, `1 / ${this.dataConfig.images.length}`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: '#ffd07b',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5).setDepth(51);

    // Footer Hint
    this.add.text(width / 2, height - 35, 'Tap screen or press SPACE to continue', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#d4b182'
    }).setOrigin(0.5).setDepth(51);

    // Footer Controls: Next & Skip Buttons
    const nextBtn = this.add.rectangle(width - 140, height - 35, 100, 36, 0x543217, 0.95);
    nextBtn.setStrokeStyle(1.5, 0xffd07b, 0.9);
    nextBtn.setInteractive({ useHandCursor: true }).setDepth(51);

    const nextTxt = this.add.text(width - 140, height - 35, 'NEXT ➔', {
      fontFamily: 'Cinzel, serif',
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(52);

    nextBtn.on('pointerdown', (e: Phaser.Input.Pointer) => {
      e.event.stopPropagation();
      this.advanceCutscene();
    });

    const skipBtn = this.add.rectangle(width - 45, height - 35, 70, 36, 0x24150b, 0.9);
    skipBtn.setStrokeStyle(1, 0x8b6508, 0.7);
    skipBtn.setInteractive({ useHandCursor: true }).setDepth(51);

    const skipTxt = this.add.text(width - 45, height - 35, 'SKIP ⏭', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      color: '#d4b182'
    }).setOrigin(0.5).setDepth(52);

    skipBtn.on('pointerdown', (e: Phaser.Input.Pointer) => {
      e.event.stopPropagation();
      this.finishCutscene();
    });

    // Keyboard navigation
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-SPACE', () => this.advanceCutscene());
      this.input.keyboard.on('keydown-ENTER', () => this.advanceCutscene());
      this.input.keyboard.on('keydown-RIGHT', () => this.advanceCutscene());
      this.input.keyboard.on('keydown-ESC', () => this.finishCutscene());
    }

    // Load first cutscene image
    this.displayCurrentImage(true);
  }

  private stopCurrentAudio() {
    if (this.currentVoSound) {
      this.currentVoSound.stop();
      this.currentVoSound.destroy();
      this.currentVoSound = undefined;
    }
  }

  private playVoiceoversForCurrentFrame(onAudioComplete?: () => void) {
    this.stopCurrentAudio();

    if (!this.dataConfig.audios || !this.dataConfig.audios[this.currentImageIndex]) {
      if (onAudioComplete) onAudioComplete();
      return;
    }

    const audioEntry = this.dataConfig.audios[this.currentImageIndex];

    if (Array.isArray(audioEntry)) {
      // Play a sequence of audio clips for this frame (e.g. 4.mp3 -> 4-1.mp3 -> 4-2.mp3)
      let clipIndex = 0;
      const playNextClip = () => {
        if (clipIndex >= audioEntry.length || !this.scene.isActive('CutsceneScene')) return;
        const key = audioEntry[clipIndex];
        if (this.cache.audio.exists(key)) {
          this.currentVoSound = this.sound.add(key, { volume: 0.95 });
          this.currentVoSound.once('complete', () => {
            clipIndex++;
            if (clipIndex < audioEntry.length) {
              playNextClip();
            } else {
              if (onAudioComplete) onAudioComplete();
            }
          });
          this.currentVoSound.play();
        } else {
          clipIndex++;
          if (clipIndex < audioEntry.length) {
            playNextClip();
          } else if (onAudioComplete) {
            onAudioComplete();
          }
        }
      };
      playNextClip();
    } else if (typeof audioEntry === 'string') {
      if (this.cache.audio.exists(audioEntry)) {
        this.currentVoSound = this.sound.add(audioEntry, { volume: 0.95 });
        this.currentVoSound.once('complete', () => {
          if (onAudioComplete) onAudioComplete();
        });
        this.currentVoSound.play();
      } else if (onAudioComplete) {
        onAudioComplete();
      }
    } else if (onAudioComplete) {
      onAudioComplete();
    }
  }

  private displayCurrentImage(isInitial = false) {
    if (this.currentImageIndex >= this.dataConfig.images.length) {
      this.finishCutscene();
      return;
    }

    const { width, height } = this.cameras.main;
    const imgKey = this.dataConfig.images[this.currentImageIndex];

    // Clear any previous auto-advance timer
    if (this.autoAdvanceTimer) {
      this.autoAdvanceTimer.remove();
      this.autoAdvanceTimer = undefined;
    }

    // Update counter
    this.counterText.setText(`${this.currentImageIndex + 1} / ${this.dataConfig.images.length}`);

    // Play voiceover audio for this frame and auto-advance ONLY AFTER all clips complete!
    const frameIndex = this.currentImageIndex;
    this.playVoiceoversForCurrentFrame(() => {
      if (this.currentImageIndex === frameIndex && this.scene.isActive('CutsceneScene')) {
        this.autoAdvanceTimer = this.time.delayedCall(1500, () => {
          this.advanceCutscene();
        });
      }
    });

    // Fallback timer for frames without audio voiceovers (7.5s)
    if (!this.dataConfig.audios || !this.dataConfig.audios[this.currentImageIndex]) {
      this.autoAdvanceTimer = this.time.delayedCall(7500, () => {
        this.advanceCutscene();
      });
    }

    // Create new image sprite
    const newSprite = this.add.image(width / 2, height / 2, imgKey);
    newSprite.setDepth(10);

    // Scale image to fit screen within cinematic bounds (leave header/footer clean)
    const availableH = height - 120;
    const scaleX = width / newSprite.width;
    const scaleY = availableH / newSprite.height;
    const baseScale = Math.min(scaleX, scaleY);

    newSprite.setScale(baseScale);

    // Slide/Throw animation entrance effect
    if (!isInitial && this.currentImageSprite) {
      const oldSprite = this.currentImageSprite;
      this.isTransitioning = true;

      // Throw old image out to left with rotation
      this.tweens.add({
        targets: oldSprite,
        x: -width * 0.5,
        rotation: -0.15,
        alpha: 0,
        duration: 450,
        ease: 'Power2.easeIn',
        onComplete: () => oldSprite.destroy()
      });

      // Throw new image in from right with scale pop
      newSprite.setPosition(width * 1.4, height / 2);
      newSprite.setScale(baseScale * 0.85);
      newSprite.setRotation(0.12);

      this.tweens.add({
        targets: newSprite,
        x: width / 2,
        rotation: 0,
        scaleX: baseScale,
        scaleY: baseScale,
        duration: 500,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.isTransitioning = false;
          this.startKenBurnsAnimation(newSprite, baseScale);
        }
      });
    } else {
      // First image entrance pop
      newSprite.setAlpha(0);
      newSprite.setScale(baseScale * 0.94);
      this.tweens.add({
        targets: newSprite,
        alpha: 1,
        scaleX: baseScale,
        scaleY: baseScale,
        duration: 400,
        ease: 'Sine.easeOut',
        onComplete: () => {
          this.startKenBurnsAnimation(newSprite, baseScale);
        }
      });
    }

    this.currentImageSprite = newSprite;
  }

  private startKenBurnsAnimation(sprite: Phaser.GameObjects.Image, baseScale: number) {
    if (!sprite || !sprite.active) return;
    this.tweens.add({
      targets: sprite,
      scaleX: baseScale * 1.04,
      scaleY: baseScale * 1.04,
      duration: 6000,
      ease: 'Sine.easeInOut'
    });
  }

  private advanceCutscene() {
    if (this.isTransitioning) return;
    this.soundManager.playButtonClick();

    this.currentImageIndex++;
    if (this.currentImageIndex < this.dataConfig.images.length) {
      this.displayCurrentImage(false);
    } else {
      this.finishCutscene();
    }
  }

  private finishCutscene() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.soundManager.playButtonClick();
    this.stopCurrentAudio();

    if (this.autoAdvanceTimer) {
      this.autoAdvanceTimer.remove();
    }

    // Fade out and launch target scene
    this.cameras.main.fadeOut(350, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop('CutsceneScene');
      if (this.dataConfig.targetStateInit) {
        this.dataConfig.targetStateInit();
      }
      this.scene.start(this.dataConfig.targetSceneKey);
      if (this.dataConfig.targetSceneKey !== 'GameCompleteScene' && this.dataConfig.targetSceneKey !== 'MainMenuScene') {
        this.scene.launch('UIScene');
      }
    });
  }
}
