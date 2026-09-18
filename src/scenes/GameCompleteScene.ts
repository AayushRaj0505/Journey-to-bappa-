import Phaser from 'phaser';
import { SoundManager } from '../systems/SoundManager';
import { GameState } from '../state/GameState';

export class GameCompleteScene extends Phaser.Scene {
  constructor() {
    super('GameCompleteScene');
  }

  create() {
    const { width, height } = this.cameras.main;
    const sound = SoundManager.getInstance();
    sound.playLevelComplete();

    // 1. Deep spiritual warm background
    this.add.rectangle(width / 2, height / 2, width, height, 0x070402, 1);

    // Warm golden ambient pulsing glow
    const halo = this.add.circle(width / 2, height / 2 - 30, 260, 0xd49b3d, 0.22);
    this.tweens.add({
      targets: halo,
      scale: 1.25,
      alpha: 0.38,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const container = this.add.container(width / 2, height / 2);

    // 2. Decorative victory frame
    const frame = this.add.rectangle(0, 0, 740, 580, 0x180f08, 0.96);
    frame.setStrokeStyle(3, 0xd49b3d, 0.95);
    container.add(frame);

    // Inner subtle gold filigree border
    const innerBorder = this.add.rectangle(0, 0, 712, 552, 0x110a05, 0.85);
    innerBorder.setStrokeStyle(1.5, 0x8b6508, 0.65);
    container.add(innerBorder);

    // 3. Titles
    const subtitle = this.add.text(0, -240, 'GAME COMPLETE — THE FINAL DOOR', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#d4b182',
      letterSpacing: 4
    }).setOrigin(0.5);

    const title = this.add.text(0, -205, 'THE JOURNEY TO BAPPA', {
      fontFamily: 'Cinzel, serif',
      fontSize: '28px',
      color: '#ffd07b',
      fontStyle: 'bold',
      stroke: '#4a2608',
      strokeThickness: 3
    }).setOrigin(0.5);

    container.add([subtitle, title]);

    // 4. Temporary Cinematic Placeholder Box
    const cutsceneBox = this.add.rectangle(0, -60, 360, 170, 0x0f0804, 1);
    cutsceneBox.setStrokeStyle(2, 0xd49b3d, 0.85);

    const cutsceneGlow = this.add.circle(0, -60, 70, 0xffd07b, 0.2);
    this.tweens.add({
      targets: cutsceneGlow,
      alpha: 0.45,
      scale: 1.15,
      duration: 1200,
      yoyo: true,
      repeat: -1
    });

    const cutsceneIcon = this.add.image(0, -75, 'icon_temple');
    cutsceneIcon.setDisplaySize(60, 60);

    const cutsceneTag = this.add.text(0, -32, '🎬 ENDING CUTSCENE', {
      fontFamily: 'Cinzel, serif',
      fontSize: '15px',
      color: '#4eed94',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const cutsceneSub = this.add.text(0, -8, '[ Cinematic video cutscene will be integrated here ]', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      color: '#cbb393',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    container.add([cutsceneBox, cutsceneGlow, cutsceneIcon, cutsceneTag, cutsceneSub]);

    // 5. Emotional Message / Lore
    const lore = this.add.text(0, 85,
      'Through keen observation, unwavering faith, courage, and perseverance,\n' +
      'every obstacle and shadow has been dissolved.\n' +
      'The child stands embraced in the peaceful golden warmth of Bappa’s divine blessing.', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: '#f5e4cb',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5);
    container.add(lore);

    // 6. Action Buttons
    // Replay Entire Journey (From Level 1)
    const replayAllBtn = this.add.rectangle(width / 2 - 145, height / 2 + 215, 250, 48, 0x6b3f1b, 1);
    replayAllBtn.setStrokeStyle(2.5, 0xffd07b, 1);
    replayAllBtn.setInteractive({ useHandCursor: true });
    replayAllBtn.setDepth(100);

    const replayAllTxt = this.add.text(width / 2 - 145, height / 2 + 215, '🔄 REPLAY FROM LEVEL 1', {
      fontFamily: 'Cinzel, serif',
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });

    const handleReplayAll = () => {
      sound.playInteraction();
      this.scene.stop('GameCompleteScene');
      GameState.reset();
      this.scene.start('Level1Scene');
      this.scene.launch('UIScene');
    };

    replayAllBtn.on('pointerdown', handleReplayAll);
    replayAllTxt.on('pointerdown', handleReplayAll);
    replayAllBtn.on('pointerover', () => {
      replayAllBtn.setFillStyle(0x8a5223);
      replayAllBtn.setStrokeStyle(3, 0xfff0b8);
    });
    replayAllBtn.on('pointerout', () => {
      replayAllBtn.setFillStyle(0x6b3f1b);
      replayAllBtn.setStrokeStyle(2.5, 0xffd07b, 1);
    });

    // Replay Level 4
    const replayLvl4Btn = this.add.rectangle(width / 2 + 145, height / 2 + 215, 250, 48, 0x2b1c11, 1);
    replayLvl4Btn.setStrokeStyle(1.5, 0x9e7339, 0.85);
    replayLvl4Btn.setInteractive({ useHandCursor: true });
    replayLvl4Btn.setDepth(100);

    const replayLvl4Txt = this.add.text(width / 2 + 145, height / 2 + 215, '✨ REPLAY LEVEL 4', {
      fontFamily: 'Cinzel, serif',
      fontSize: '13px',
      color: '#d4b182',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });

    const handleReplayLvl4 = () => {
      sound.playInteraction();
      this.scene.stop('GameCompleteScene');
      GameState.startLevel4();
      this.scene.start('Level4Scene');
      this.scene.launch('UIScene');
    };

    replayLvl4Btn.on('pointerdown', handleReplayLvl4);
    replayLvl4Txt.on('pointerdown', handleReplayLvl4);
    replayLvl4Btn.on('pointerover', () => {
      replayLvl4Btn.setFillStyle(0x4a2e1b);
      replayLvl4Btn.setStrokeStyle(2, 0xd49b3d);
      replayLvl4Txt.setColor('#ffffff');
    });
    replayLvl4Btn.on('pointerout', () => {
      replayLvl4Btn.setFillStyle(0x2b1c11);
      replayLvl4Btn.setStrokeStyle(1.5, 0x9e7339, 0.85);
      replayLvl4Txt.setColor('#d4b182');
    });

    // Entrance Tween
    container.setAlpha(0);
    this.tweens.add({
      targets: [container, replayAllBtn, replayAllTxt, replayLvl4Btn, replayLvl4Txt],
      alpha: 1,
      duration: 400,
      ease: 'Power2.easeOut'
    });
  }
}
