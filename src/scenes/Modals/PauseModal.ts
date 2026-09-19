import Phaser from 'phaser';
import { GameState } from '../../state/GameState';
import { SoundManager } from '../../systems/SoundManager';

export class PauseModal extends Phaser.Scene {
  private parentSceneKey = 'Level1Scene';
  private soundBtnText!: Phaser.GameObjects.Text;
  private subGuideContainer?: Phaser.GameObjects.Container;

  constructor() {
    super('PauseModal');
  }

  init(data: { parentScene?: string }) {
    if (data?.parentScene) {
      this.parentSceneKey = data.parentScene;
    } else {
      // Find whichever level scene is currently active
      const levelScenes = ['Level1Scene', 'Level2Scene', 'Level3Scene', 'Level4Scene'];
      for (const key of levelScenes) {
        if (this.scene.isActive(key)) {
          this.parentSceneKey = key;
          break;
        }
      }
    }
  }

  create() {
    const { width, height } = this.cameras.main;
    const sound = SoundManager.getInstance();
    sound.playButtonClick();

    // Pause parent gameplay scene
    if (this.scene.isActive(this.parentSceneKey)) {
      this.scene.pause(this.parentSceneKey);
    }

    // 1. Dark semi-transparent backdrop
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.78);
    overlay.setInteractive();

    // 2. Pause Container
    const container = this.add.container(width / 2, height / 2);

    // Modal frame (enlarged height to fit Divine Hints button cleanly)
    const frame = this.add.rectangle(0, 0, 560, 520, 0x180f08, 0.96);
    frame.setStrokeStyle(2.5, 0xd49b3d, 0.95);
    container.add(frame);

    const innerBorder = this.add.rectangle(0, 0, 532, 492, 0x110904, 0.8);
    innerBorder.setStrokeStyle(1, 0x8b6508, 0.6);
    container.add(innerBorder);

    // Title
    const title = this.add.text(0, -210, '⏸  GAME PAUSED', {
      fontFamily: 'Cinzel, serif',
      fontSize: '25px',
      color: '#ffd07b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Level & Objective reminder
    const levelNameMap: Record<string, string> = {
      Level1Scene: 'LEVEL 1: THE BEDROOM',
      Level2Scene: 'LEVEL 2: THE DARK MAZE',
      Level3Scene: 'LEVEL 3: THE LIVING ROOM',
      Level4Scene: 'LEVEL 4: THE FINAL DOOR'
    };

    const currentLevelName = levelNameMap[this.parentSceneKey] || 'CURRENT QUEST';
    const levelLabel = this.add.text(0, -172, currentLevelName, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      color: '#d4b182',
      letterSpacing: 2
    }).setOrigin(0.5);

    const goalBox = this.add.rectangle(0, -138, 460, 30, 0x22140a, 0.9);
    goalBox.setStrokeStyle(1, 0x8b6508, 0.5);
    const goalText = this.add.text(0, -138, `Goal: ${GameState.objective}`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#ffc168'
    }).setOrigin(0.5);

    container.add([title, levelLabel, goalBox, goalText]);

    // 3. Menu Options
    const startY = -85;
    const gapY = 46;

    // [RESUME]
    this.createPauseButton(container, 0, startY, '▶  RESUME GAME', 0x6b3f1b, 0xffe29a, () => {
      this.resumeGame();
    }, true);

    // [DIVINE HINTS (Astha Revelations)]
    this.createPauseButton(container, 0, startY + gapY, '📜  VIEW DIVINE HINTS', 0x3d2310, 0xffd07b, () => {
      this.openDivineHints();
    });

    // [RESTART LEVEL]
    this.createPauseButton(container, 0, startY + gapY * 2, '🔄  RESTART LEVEL', 0x2b1c11, 0xe0c297, () => {
      this.restartCurrentLevel();
    });

    // [CONTROLS & HELP]
    this.createPauseButton(container, 0, startY + gapY * 3, '🎮  CONTROLS & HOW TO PLAY', 0x2b1c11, 0xe0c297, () => {
      this.toggleGuideOverlay(width, height);
    });

    // [SOUND TOGGLE]
    const isMuted = sound.isAudioMuted();
    const soundBtn = this.add.rectangle(0, startY + gapY * 4, 300, 38, 0x2b1c11, 0.95);
    soundBtn.setStrokeStyle(1.5, 0x9e7339, 0.9);
    soundBtn.setInteractive({ useHandCursor: true });

    this.soundBtnText = this.add.text(0, startY + gapY * 4, isMuted ? '🔇  SOUND: OFF' : '🔊  SOUND: ON', {
      fontFamily: 'Cinzel, serif',
      fontSize: '13px',
      color: isMuted ? '#a68266' : '#ffd07b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    soundBtn.on('pointerover', () => {
      sound.playButtonHover();
      soundBtn.setFillStyle(0x462d1a);
      soundBtn.setStrokeStyle(2, 0xffe29a);
    });
    soundBtn.on('pointerout', () => {
      soundBtn.setFillStyle(0x2b1c11);
      soundBtn.setStrokeStyle(1.5, 0x9e7339);
    });
    soundBtn.on('pointerdown', () => {
      sound.playButtonClick();
      const mutedNow = sound.toggleMute();
      this.soundBtnText.setText(mutedNow ? '🔇  SOUND: OFF' : '🔊  SOUND: ON');
      this.soundBtnText.setColor(mutedNow ? '#a68266' : '#ffd07b');
    });

    container.add([soundBtn, this.soundBtnText]);

    // [MAIN MENU]
    this.createPauseButton(container, 0, startY + gapY * 5, '🏠  RETURN TO MAIN MENU', 0x25140b, 0xd4b182, () => {
      this.returnToMainMenu();
    });

    // Sub-text
    const escHint = this.add.text(0, 228, 'Press [ESC] or [P] to Resume', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#9e7b57'
    }).setOrigin(0.5);
    container.add(escHint);

    // Entrance animation
    container.setAlpha(0);
    container.setScale(0.96);
    this.tweens.add({
      targets: container,
      alpha: 1,
      scale: 1,
      duration: 180,
      ease: 'Power2.easeOut'
    });

    // Keyboard shortcuts
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ESC', () => this.resumeGame());
      this.input.keyboard.on('keydown-P', () => this.resumeGame());
    }
  }

  private createPauseButton(
    container: Phaser.GameObjects.Container,
    x: number,
    y: number,
    text: string,
    bgColor: number,
    textColor: number,
    onClick: () => void,
    isPrimary = false
  ) {
    const sound = SoundManager.getInstance();
    const btn = this.add.rectangle(x, y, 300, 42, bgColor, 0.95);
    btn.setStrokeStyle(isPrimary ? 2 : 1.5, isPrimary ? 0xffd07b : 0x9e7339, 0.9);
    btn.setInteractive({ useHandCursor: true });

    const btnText = this.add.text(x, y, text, {
      fontFamily: 'Cinzel, serif',
      fontSize: '14px',
      color: Phaser.Display.Color.IntegerToColor(textColor).rgba,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    btn.on('pointerover', () => {
      sound.playButtonHover();
      btn.setFillStyle(isPrimary ? 0x8a5223 : 0x462d1a);
      btn.setStrokeStyle(2, 0xffe29a);
      btnText.setColor('#ffffff');
      btnText.setScale(1.03);
    });

    btn.on('pointerout', () => {
      btn.setFillStyle(bgColor);
      btn.setStrokeStyle(isPrimary ? 2 : 1.5, isPrimary ? 0xffd07b : 0x9e7339);
      btnText.setColor(Phaser.Display.Color.IntegerToColor(textColor).rgba);
      btnText.setScale(1);
    });

    btn.on('pointerdown', () => {
      sound.playButtonClick();
      onClick();
    });

    container.add([btn, btnText]);
  }

  private toggleGuideOverlay(width: number, height: number) {
    if (this.subGuideContainer) {
      this.subGuideContainer.destroy();
      this.subGuideContainer = undefined;
      return;
    }

    const modal = this.add.container(width / 2, height / 2);
    this.subGuideContainer = modal;

    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.85);
    overlay.setInteractive();

    const box = this.add.rectangle(0, 0, 600, 400, 0x180f08, 0.98);
    box.setStrokeStyle(2, 0xd49b3d, 0.95);

    const title = this.add.text(0, -160, 'CONTROLS & NAVIGATION', {
      fontFamily: 'Cinzel, serif',
      fontSize: '20px',
      color: '#ffd07b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const closeBtn = this.add.text(260, -160, '✖', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '20px',
      color: '#ffc168'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => {
      SoundManager.getInstance().playButtonClick();
      modal.destroy();
      this.subGuideContainer = undefined;
    });

    const info = this.add.text(0, 0,
      '• Move: W, A, S, D  or  Arrow Keys\n\n' +
      '• Interact: Press [E] or Click on interactive objects\n\n' +
      '• Inventory: Click bottom item slots to inspect them\n\n' +
      '• Astha: In dark maze (Level 2), stay near light\n\n' +
      '• Puzzles: Read clues, rotate dials, enter combinations', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#f5e4cb',
      lineSpacing: 10
    }).setOrigin(0.5);

    const okBtn = this.add.rectangle(0, 140, 140, 36, 0x6b3f1b, 1);
    okBtn.setStrokeStyle(1.5, 0xffd07b, 0.9);
    okBtn.setInteractive({ useHandCursor: true });
    const okTxt = this.add.text(0, 140, 'BACK', {
      fontFamily: 'Cinzel, serif',
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    okBtn.on('pointerdown', () => {
      SoundManager.getInstance().playButtonClick();
      modal.destroy();
      this.subGuideContainer = undefined;
    });

    modal.add([overlay, box, title, closeBtn, info, okBtn, okTxt]);
  }

  private resumeGame() {
    SoundManager.getInstance().playButtonClick();
    if (this.scene.isPaused(this.parentSceneKey)) {
      this.scene.resume(this.parentSceneKey);
    }
    this.scene.stop('PauseModal');
  }

  private restartCurrentLevel() {
    SoundManager.getInstance().playButtonClick();
    this.scene.stop('PauseModal');

    // Reset state according to current level
    if (this.parentSceneKey === 'Level1Scene') {
      GameState.reset();
      this.scene.stop('Level1Scene');
      this.scene.start('Level1Scene');
    } else if (this.parentSceneKey === 'Level2Scene') {
      GameState.startLevel2();
      this.scene.stop('Level2Scene');
      this.scene.start('Level2Scene');
    } else if (this.parentSceneKey === 'Level3Scene') {
      GameState.startLevel3();
      this.scene.stop('Level3Scene');
      this.scene.start('Level3Scene');
    } else if (this.parentSceneKey === 'Level4Scene') {
      GameState.startLevel4();
      this.scene.stop('Level4Scene');
      this.scene.start('Level4Scene');
    }
    this.scene.launch('UIScene');
  }

  private openDivineHints() {
    SoundManager.getInstance().playButtonClick();
    this.scene.launch('DivineHintModal', {
      returnScene: 'PauseModal'
    });
  }

  private returnToMainMenu() {
    SoundManager.getInstance().playButtonClick();
    // Stop all gameplay and UI scenes
    this.scene.stop(this.parentSceneKey);
    this.scene.stop('UIScene');
    this.scene.stop('PauseModal');
    // Launch title screen
    this.scene.start('MainMenuScene');
  }
}
