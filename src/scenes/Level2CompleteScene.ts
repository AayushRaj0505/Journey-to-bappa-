import Phaser from 'phaser';
import { SoundManager } from '../systems/SoundManager';
import { GameState } from '../state/GameState';

export class Level2CompleteScene extends Phaser.Scene {
  constructor() {
    super('Level2CompleteScene');
  }

  create() {
    const { width, height } = this.cameras.main;
    const sound = SoundManager.getInstance();
    sound.playPuzzleSuccess();

    // Dark temple radial background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0604, 1);

    // Warm golden ambient particle / halo
    const glow = this.add.circle(width / 2, height / 2 - 30, 240, 0xd49b3d, 0.2);
    this.tweens.add({
      targets: glow,
      scale: 1.18,
      alpha: 0.32,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const container = this.add.container(width / 2, height / 2);

    // Decorative victory frame
    const frame = this.add.rectangle(0, 0, 700, 540, 0x1a1109, 0.96);
    frame.setStrokeStyle(3, 0xd49b3d, 0.95);
    container.add(frame);

    // Subtitle & Title
    const subtitle = this.add.text(0, -220, 'LEVEL 2 COMPLETE: DARK DIYA MAZE', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: '#d4b182',
      letterSpacing: 3
    }).setOrigin(0.5);

    const title = this.add.text(0, -185, 'THE LIGHT SHOWED ME THE WAY', {
      fontFamily: 'Cinzel, serif',
      fontSize: '26px',
      color: '#ffd07b',
      fontStyle: 'bold',
      stroke: '#4a2608',
      strokeThickness: 3
    }).setOrigin(0.5);

    container.add([subtitle, title]);

    // Showcase Box for Sacred Diya
    const diyaBox = this.add.rectangle(0, -45, 170, 150, 0x130b05, 1);
    diyaBox.setStrokeStyle(2, 0xd49b3d, 0.85);

    const diyaImg = this.add.image(0, -45, 'diya_pickup');
    diyaImg.setScale(0.9);

    const diyaGlow = this.add.circle(0, -45, 65, 0xffd07b, 0.22);
    this.tweens.add({
      targets: diyaGlow,
      alpha: 0.45,
      scale: 1.15,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    const asthaScore = this.add.text(0, 48, `🪔 ASTHA: ${GameState.astha} / ${GameState.maxAstha} (FAITH RESTORED)`, {
      fontFamily: 'Cinzel, serif',
      fontSize: '15px',
      color: '#52e896',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    container.add([diyaBox, diyaGlow, diyaImg, asthaScore]);

    // Story Lore & Emotion (Fear -> Faith)
    const lore = this.add.text(0, 110,
      'Stepping into the unknown darkness, fear gave way to faith.\n' +
      'Guided by the holy Diya and Bappa\'s sacred wisdom, every shadow dissolved.\n' +
      'More of the journey awaits...', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: '#f5e4cb',
      align: 'center',
      lineSpacing: 6
    }).setOrigin(0.5);
    container.add(lore);

    // 1. Proceed to Level 3 (Primary)
    const proceedBtn = this.add.rectangle(width / 2 - 240, height / 2 + 205, 210, 48, 0x6b3f1b, 1);
    proceedBtn.setStrokeStyle(2.5, 0xffd07b, 1);
    proceedBtn.setInteractive({ useHandCursor: true });
    proceedBtn.setDepth(100);

    const proceedTxt = this.add.text(width / 2 - 240, height / 2 + 205, '✨ PROCEED TO LVL 3', {
      fontFamily: 'Cinzel, serif',
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });

    const handleProceed = () => {
      sound.playButtonClick();
      this.scene.stop('Level2CompleteScene');
      this.scene.start('CutsceneScene', {
        transitionId: 2,
        images: ['trans2_1', 'trans2_2', 'trans2_3', 'trans2_4'],
        targetLevel: 3,
        targetSceneKey: 'Level3Scene',
        targetStateInit: () => GameState.startLevel3(),
        title: 'CHAPTER 2: SECRETS OF THE SANCTUM'
      });
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

    // 2. Play Level 2 Again (Secondary)
    const replayLvl2Btn = this.add.rectangle(width / 2, height / 2 + 205, 210, 48, 0x2b1c11, 1);
    replayLvl2Btn.setStrokeStyle(1.5, 0x9e7339, 0.8);
    replayLvl2Btn.setInteractive({ useHandCursor: true });
    replayLvl2Btn.setDepth(100);

    const replayLvl2Txt = this.add.text(width / 2, height / 2 + 205, '🔄 REPLAY LEVEL 2', {
      fontFamily: 'Cinzel, serif',
      fontSize: '13px',
      color: '#d4b182',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });

    const handleReplayLvl2 = () => {
      sound.playButtonClick();
      this.scene.stop('Level2CompleteScene');
      GameState.startLevel2();
      this.scene.start('Level2Scene');
      this.scene.launch('UIScene');
    };

    replayLvl2Btn.on('pointerdown', handleReplayLvl2);
    replayLvl2Txt.on('pointerdown', handleReplayLvl2);
    replayLvl2Btn.on('pointerover', () => {
      sound.playButtonHover();
      replayLvl2Btn.setFillStyle(0x4a2e1b);
      replayLvl2Btn.setStrokeStyle(2, 0xd49b3d);
      replayLvl2Txt.setColor('#ffffff');
    });
    replayLvl2Btn.on('pointerout', () => {
      replayLvl2Btn.setFillStyle(0x2b1c11);
      replayLvl2Btn.setStrokeStyle(1.5, 0x9e7339, 0.8);
      replayLvl2Txt.setColor('#d4b182');
    });

    // 3. Return to Main Menu
    const menuBtn = this.add.rectangle(width / 2 + 240, height / 2 + 205, 210, 48, 0x1d120a, 1);
    menuBtn.setStrokeStyle(1.5, 0x8b6508, 0.75);
    menuBtn.setInteractive({ useHandCursor: true });
    menuBtn.setDepth(100);

    const menuTxt = this.add.text(width / 2 + 240, height / 2 + 205, '🏠 MAIN MENU', {
      fontFamily: 'Cinzel, serif',
      fontSize: '13px',
      color: '#d4b182',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });

    const handleMenu = () => {
      sound.playButtonClick();
      this.scene.stop('Level2CompleteScene');
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
      targets: [container, proceedBtn, proceedTxt, replayLvl2Btn, replayLvl2Txt, menuBtn, menuTxt],
      alpha: 1,
      duration: 350,
      ease: 'Power2.easeOut'
    });
  }
}
