import Phaser from 'phaser';
import { SoundManager } from '../systems/SoundManager';
import { GameState } from '../state/GameState';

export class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super('LevelCompleteScene');
  }

  create() {
    const { width, height } = this.cameras.main;
    const sound = SoundManager.getInstance();
    sound.playPuzzleSuccess();

    // Dark radial background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0c0703, 1);

    // Golden ambient particle / glow
    const glow = this.add.circle(width / 2, height / 2 - 30, 220, 0xd49b3d, 0.18);
    this.tweens.add({
      targets: glow,
      scale: 1.15,
      alpha: 0.28,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const container = this.add.container(width / 2, height / 2);

    // Decorative victory frame
    const frame = this.add.rectangle(0, 0, 680, 520, 0x1f140b, 0.95);
    frame.setStrokeStyle(3, 0xd49b3d, 0.9);
    container.add(frame);

    // Title
    const subtitle = this.add.text(0, -210, 'LEVEL 1 COMPLETE', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      color: '#d4b182',
      letterSpacing: 4
    }).setOrigin(0.5);

    const title = this.add.text(0, -175, 'THE JOURNEY TO BAPPA', {
      fontFamily: 'Cinzel, serif',
      fontSize: '32px',
      color: '#ffd07b',
      fontStyle: 'bold',
      stroke: '#4a2608',
      strokeThickness: 3
    }).setOrigin(0.5);

    container.add([subtitle, title]);

    // Astha & Quest Complete Banner
    const victoryBadge = this.add.rectangle(0, -45, 260, 110, 0x180f08, 0.95);
    victoryBadge.setStrokeStyle(2, 0xd49b3d, 0.9);

    const victoryIcon = this.add.text(0, -68, '🚪✨', {
      fontSize: '32px'
    }).setOrigin(0.5);

    const victoryLabel = this.add.text(0, -32, 'BEDROOM SANCTUARY UNLOCKED', {
      fontFamily: 'Cinzel, serif',
      fontSize: '13px',
      color: '#ffd07b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const asthaLabel = this.add.text(0, -10, `🪔 ASTHA: ${GameState.astha} / ${GameState.maxAstha} (1st Divine Clue Unlocked)`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#4eed94',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    container.add([victoryBadge, victoryIcon, victoryLabel, asthaLabel]);

    // Story Text
    const lore = this.add.text(0, 75, 
      'With keen observation and wits, the bedroom door swings open.\n' +
      'Holding your holy faith close, you take your first brave step forward.\n' +
      'Bappa\'s blessings guide the path ahead...', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: '#f5e4cb',
      align: 'center',
      lineSpacing: 6
    }).setOrigin(0.5);
    container.add(lore);

    // 1. Proceed to Level 2 (Primary)
    const proceedBtn = this.add.rectangle(width / 2 - 240, height / 2 + 195, 210, 48, 0x6b3f1b, 1);
    proceedBtn.setStrokeStyle(2.5, 0xffd07b, 1);
    proceedBtn.setInteractive({ useHandCursor: true });
    proceedBtn.setDepth(100);

    const proceedTxt = this.add.text(width / 2 - 240, height / 2 + 195, '✨ PROCEED TO LVL 2', {
      fontFamily: 'Cinzel, serif',
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });

    const handleProceed = () => {
      sound.playButtonClick();
      this.scene.stop('LevelCompleteScene');
      GameState.startLevel2();
      this.scene.start('Level2Scene');
      this.scene.launch('UIScene');
    };

    proceedBtn.on('pointerdown', handleProceed);
    proceedTxt.on('pointerdown', handleProceed);
    proceedBtn.on('pointerover', () => {
      sound.playButtonHover();
      proceedBtn.setFillStyle(0x8a5223);
      proceedBtn.setStrokeStyle(3, 0xfff0b8);
    });
    proceedBtn.on('pointerout', () => {
      proceedBtn.setFillStyle(0x6b3f1b);
      proceedBtn.setStrokeStyle(2.5, 0xffd07b, 1);
    });

    // 2. Play Level 1 Again (Secondary)
    const replayBtn = this.add.rectangle(width / 2, height / 2 + 195, 210, 48, 0x2b1c11, 1);
    replayBtn.setStrokeStyle(1.5, 0x9e7339, 0.8);
    replayBtn.setInteractive({ useHandCursor: true });
    replayBtn.setDepth(100);

    const replayTxt = this.add.text(width / 2, height / 2 + 195, '🔄 REPLAY LEVEL 1', {
      fontFamily: 'Cinzel, serif',
      fontSize: '13px',
      color: '#d4b182',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });

    const handleReplay = () => {
      sound.playButtonClick();
      this.scene.stop('LevelCompleteScene');
      GameState.reset();
      this.scene.start('Level1Scene');
      this.scene.launch('UIScene');
    };

    replayBtn.on('pointerdown', handleReplay);
    replayTxt.on('pointerdown', handleReplay);
    replayBtn.on('pointerover', () => {
      sound.playButtonHover();
      replayBtn.setFillStyle(0x4a2e1b);
      replayBtn.setStrokeStyle(2, 0xd49b3d);
      replayTxt.setColor('#ffffff');
    });
    replayBtn.on('pointerout', () => {
      replayBtn.setFillStyle(0x2b1c11);
      replayBtn.setStrokeStyle(1.5, 0x9e7339, 0.8);
      replayTxt.setColor('#d4b182');
    });

    // 3. Return to Main Menu
    const menuBtn = this.add.rectangle(width / 2 + 240, height / 2 + 195, 210, 48, 0x1d120a, 1);
    menuBtn.setStrokeStyle(1.5, 0x8b6508, 0.75);
    menuBtn.setInteractive({ useHandCursor: true });
    menuBtn.setDepth(100);

    const menuTxt = this.add.text(width / 2 + 240, height / 2 + 195, '🏠 MAIN MENU', {
      fontFamily: 'Cinzel, serif',
      fontSize: '13px',
      color: '#d4b182',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });

    const handleMenu = () => {
      sound.playButtonClick();
      this.scene.stop('LevelCompleteScene');
      GameState.reset();
      this.scene.start('MainMenuScene');
    };

    menuBtn.on('pointerdown', handleMenu);
    menuTxt.on('pointerdown', handleMenu);
    menuBtn.on('pointerover', () => {
      sound.playButtonHover();
      menuBtn.setFillStyle(0x352011);
      menuBtn.setStrokeStyle(2, 0xd49b3d);
      menuTxt.setColor('#ffffff');
    });
    menuBtn.on('pointerout', () => {
      menuBtn.setFillStyle(0x1d120a);
      menuBtn.setStrokeStyle(1.5, 0x8b6508, 0.75);
      menuTxt.setColor('#d4b182');
    });

    // Entrance tween for container
    container.setAlpha(0);
    this.tweens.add({
      targets: [container, proceedBtn, proceedTxt, replayBtn, replayTxt, menuBtn, menuTxt],
      alpha: 1,
      duration: 350,
      ease: 'Power2.easeOut'
    });
  }
}
