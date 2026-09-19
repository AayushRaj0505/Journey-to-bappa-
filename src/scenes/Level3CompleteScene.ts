import Phaser from 'phaser';
import { SoundManager } from '../systems/SoundManager';
import { GameState } from '../state/GameState';

export class Level3CompleteScene extends Phaser.Scene {
  constructor() {
    super('Level3CompleteScene');
  }

  create() {
    const { width, height } = this.cameras.main;
    const sound = SoundManager.getInstance();
    sound.playLevelComplete();

    // Deep warm radial background
    this.add.rectangle(width / 2, height / 2, width, height, 0x090503, 1);

    // Warm golden ambient particle / halo
    const glow = this.add.circle(width / 2, height / 2 - 35, 250, 0xd49b3d, 0.22);
    this.tweens.add({
      targets: glow,
      scale: 1.2,
      alpha: 0.35,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const container = this.add.container(width / 2, height / 2);

    // Decorative victory frame
    const frame = this.add.rectangle(0, 0, 720, 560, 0x191008, 0.96);
    frame.setStrokeStyle(3, 0xd49b3d, 0.95);
    container.add(frame);

    // Subtitle & Title
    const subtitle = this.add.text(0, -230, 'LEVEL 3 COMPLETE: THE HIDDEN MESSAGE', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: '#d4b182',
      letterSpacing: 3
    }).setOrigin(0.5);

    const title = this.add.text(0, -195, 'THE PIECES ARE FINALLY BECOMING WHOLE', {
      fontFamily: 'Cinzel, serif',
      fontSize: '24px',
      color: '#ffd07b',
      fontStyle: 'bold',
      stroke: '#4a2608',
      strokeThickness: 3
    }).setOrigin(0.5);

    container.add([subtitle, title]);

    // Level 3 Completion Badge & Astha Summary
    const completeBadge = this.add.rectangle(0, -45, 340, 110, 0x120a04, 1);
    completeBadge.setStrokeStyle(2, 0xd49b3d, 0.85);

    const checkIcon = this.add.text(0, -68, '✨ 🔑 ✨', {
      fontSize: '28px'
    }).setOrigin(0.5);

    const asthaScore = this.add.text(0, -28, `ASTHA: ${GameState.astha} / ${GameState.maxAstha}`, {
      fontFamily: 'Cinzel, serif',
      fontSize: '18px',
      color: '#52e896',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5);

    const badgeSub = this.add.text(0, 2, 'THE SACRED SEAL IS READY FOR THE TEMPLE', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      color: '#ffd07b',
      letterSpacing: 1
    }).setOrigin(0.5);

    container.add([completeBadge, checkIcon, asthaScore, badgeSub]);

    // Story Lore & Emotion
    const lore = this.add.text(0, 115,
      'By decoding the subtle Morse whispers of the living room,\n' +
      'the secret locker opened, reuniting both halves of the ancient circular artefact.\n' +
      'Fused as one, the sacred medallion will serve as your master key in Level 4...', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#f5e4cb',
      align: 'center',
      lineSpacing: 6
    }).setOrigin(0.5);
    container.add(lore);

    // 1. Proceed to Level 4 (Primary)
    const nextBtn = this.add.rectangle(width / 2 - 240, height / 2 + 215, 210, 48, 0x6b3f1b, 1);
    nextBtn.setStrokeStyle(2.5, 0xffd07b, 1);
    nextBtn.setInteractive({ useHandCursor: true });
    nextBtn.setDepth(100);

    const nextTxt = this.add.text(width / 2 - 240, height / 2 + 215, '✨ PROCEED TO LVL 4', {
      fontFamily: 'Cinzel, serif',
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });

    const handleNext = () => {
      sound.playButtonClick();
      this.scene.stop('Level3CompleteScene');
      GameState.startLevel4();
      this.scene.start('Level4Scene');
      this.scene.launch('UIScene');
    };

    nextBtn.on('pointerdown', handleNext);
    nextTxt.on('pointerdown', handleNext);
    nextBtn.on('pointerover', () => {
      sound.playButtonHover();
      nextBtn.setFillStyle(0x8a5223);
      nextBtn.setStrokeStyle(3, 0xfff0b8);
    });
    nextBtn.on('pointerout', () => {
      nextBtn.setFillStyle(0x6b3f1b);
      nextBtn.setStrokeStyle(2.5, 0xffd07b, 1);
    });

    // 2. Replay Level 3
    const replayBtn = this.add.rectangle(width / 2, height / 2 + 215, 210, 48, 0x2b1c11, 1);
    replayBtn.setStrokeStyle(1.5, 0x9e7339, 0.8);
    replayBtn.setInteractive({ useHandCursor: true });
    replayBtn.setDepth(100);

    const replayTxt = this.add.text(width / 2, height / 2 + 215, '🔄 REPLAY LEVEL 3', {
      fontFamily: 'Cinzel, serif',
      fontSize: '13px',
      color: '#d4b182',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });

    const handleReplay = () => {
      sound.playButtonClick();
      this.scene.stop('Level3CompleteScene');
      GameState.startLevel3();
      this.scene.start('Level3Scene');
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
    const menuBtn = this.add.rectangle(width / 2 + 240, height / 2 + 215, 210, 48, 0x1d120a, 1);
    menuBtn.setStrokeStyle(1.5, 0x8b6508, 0.75);
    menuBtn.setInteractive({ useHandCursor: true });
    menuBtn.setDepth(100);

    const menuTxt = this.add.text(width / 2 + 240, height / 2 + 215, '🏠 MAIN MENU', {
      fontFamily: 'Cinzel, serif',
      fontSize: '13px',
      color: '#d4b182',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });

    const handleMenu = () => {
      sound.playButtonClick();
      this.scene.stop('Level3CompleteScene');
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

    // Smooth Entrance animation
    container.setAlpha(0);
    this.tweens.add({
      targets: [container, nextBtn, nextTxt, replayBtn, replayTxt, menuBtn, menuTxt],
      alpha: 1,
      duration: 350,
      ease: 'Power2.easeOut'
    });
  }
}
