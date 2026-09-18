import Phaser from 'phaser';
import { SoundManager } from '../systems/SoundManager';
import { GameState } from '../state/GameState';

export class Level2GameOverScene extends Phaser.Scene {
  constructor() {
    super('Level2GameOverScene');
  }

  create() {
    const { width, height } = this.cameras.main;
    const sound = SoundManager.getInstance();
    sound.playVighnaWhisper();

    // Dark moody background
    this.add.rectangle(width / 2, height / 2, width, height, 0x070204, 1);

    // Eerie pulsing red/purple halo
    const shadowHalo = this.add.circle(width / 2, height / 2 - 30, 240, 0x3d0b28, 0.35);
    this.tweens.add({
      targets: shadowHalo,
      scale: 1.22,
      alpha: 0.55,
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const container = this.add.container(width / 2, height / 2);

    // Defeat frame
    const frame = this.add.rectangle(0, 0, 680, 520, 0x160a0f, 0.96);
    frame.setStrokeStyle(3, 0x8a2034, 0.9);
    container.add(frame);

    // Title & Subtitle
    const subtitle = this.add.text(0, -210, 'LEVEL 2: DARK DIYA MAZE', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: '#c97787',
      letterSpacing: 3
    }).setOrigin(0.5);

    const title = this.add.text(0, -175, 'CONSUMED BY SHADOWS', {
      fontFamily: 'Cinzel, serif',
      fontSize: '28px',
      color: '#ff6978',
      fontStyle: 'bold',
      stroke: '#3b060d',
      strokeThickness: 3
    }).setOrigin(0.5);

    container.add([subtitle, title]);

    // Showcase Box for Vighna silhouette
    const vighnaBox = this.add.rectangle(0, -45, 170, 150, 0x0d0307, 1);
    vighnaBox.setStrokeStyle(2, 0x8a2034, 0.8);

    const vighnaImg = this.add.image(0, -45, 'vighna_shadow');
    vighnaImg.setScale(0.65);

    const vighnaGlow = this.add.circle(0, -45, 60, 0xaa1830, 0.25);
    this.tweens.add({
      targets: vighnaGlow,
      alpha: 0.5,
      scale: 1.15,
      duration: 900,
      yoyo: true,
      repeat: -1
    });

    const statusText = this.add.text(0, 48, '⚡ FAITH OVERCOME BY FEAR', {
      fontFamily: 'Cinzel, serif',
      fontSize: '14px',
      color: '#ff8a98',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    container.add([vighnaBox, vighnaGlow, vighnaImg, statusText]);

    // Story Lore
    const lore = this.add.text(0, 110,
      'The obstacles of the dark maze overwhelmed your courage.\n' +
      'Hold the holy Diya close, listen for the shadows, and try again.\n' +
      'Bappa\'s light will never abandon you...', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: '#f5d3db',
      align: 'center',
      lineSpacing: 6
    }).setOrigin(0.5);
    container.add(lore);

    // 1. Try Again (Primary)
    const retryBtn = this.add.rectangle(width / 2 - 140, height / 2 + 195, 230, 48, 0x661826, 1);
    retryBtn.setStrokeStyle(2.5, 0xff7080, 1);
    retryBtn.setInteractive({ useHandCursor: true });
    retryBtn.setDepth(100);

    const retryTxt = this.add.text(width / 2 - 140, height / 2 + 195, '🔄 TRY AGAIN', {
      fontFamily: 'Cinzel, serif',
      fontSize: '15px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });

    const handleRetry = () => {
      sound.playInteraction();
      GameState.startLevel2();
      this.scene.stop('Level2GameOverScene');
      this.scene.start('Level2Scene');
      this.scene.launch('UIScene');
    };

    retryBtn.on('pointerdown', handleRetry);
    retryTxt.on('pointerdown', handleRetry);

    retryBtn.on('pointerover', () => {
      retryBtn.setFillStyle(0x8a2034);
      retryBtn.setStrokeStyle(3, 0xffa0b0);
    });
    retryBtn.on('pointerout', () => {
      retryBtn.setFillStyle(0x661826);
      retryBtn.setStrokeStyle(2.5, 0xff7080, 1);
    });

    // 2. Return to Bedroom (Level 1)
    const returnLvl1Btn = this.add.rectangle(width / 2 + 140, height / 2 + 195, 230, 48, 0x240d14, 1);
    returnLvl1Btn.setStrokeStyle(1.5, 0x6e2b38, 0.8);
    returnLvl1Btn.setInteractive({ useHandCursor: true });
    returnLvl1Btn.setDepth(100);

    const returnLvl1Txt = this.add.text(width / 2 + 140, height / 2 + 195, '🏠 REPLAY LEVEL 1', {
      fontFamily: 'Cinzel, serif',
      fontSize: '14px',
      color: '#c97787',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });

    const handleReturnLvl1 = () => {
      sound.playInteraction();
      this.scene.stop('Level2GameOverScene');
      GameState.reset();
      this.scene.start('Level1Scene');
      this.scene.launch('UIScene');
    };

    returnLvl1Btn.on('pointerdown', handleReturnLvl1);
    returnLvl1Txt.on('pointerdown', handleReturnLvl1);

    returnLvl1Btn.on('pointerover', () => {
      returnLvl1Btn.setFillStyle(0x401622);
      returnLvl1Btn.setStrokeStyle(2, 0xa63a4c);
      returnLvl1Txt.setColor('#ffffff');
    });
    returnLvl1Btn.on('pointerout', () => {
      returnLvl1Btn.setFillStyle(0x240d14);
      returnLvl1Btn.setStrokeStyle(1.5, 0x6e2b38, 0.8);
      returnLvl1Txt.setColor('#c97787');
    });

    // Entrance tween
    container.setAlpha(0);
    this.tweens.add({
      targets: [container, retryBtn, retryTxt, returnLvl1Btn, returnLvl1Txt],
      alpha: 1,
      duration: 350,
      ease: 'Power2.easeOut'
    });
  }
}
