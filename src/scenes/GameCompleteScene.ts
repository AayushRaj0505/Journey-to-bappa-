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
    const halo = this.add.circle(width / 2, height / 2 - 40, 280, 0xd49b3d, 0.22);
    this.tweens.add({
      targets: halo,
      scale: 1.25,
      alpha: 0.38,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Floating blessing particles
    for (let i = 0; i < 20; i++) {
      const px = Phaser.Math.Between(50, width - 50);
      const py = Phaser.Math.Between(50, height - 50);
      const p = this.add.circle(px, py, Phaser.Math.FloatBetween(1.5, 3), 0xffd07b, Phaser.Math.FloatBetween(0.3, 0.8));
      this.tweens.add({
        targets: p,
        y: py - Phaser.Math.Between(40, 120),
        alpha: 0.1,
        duration: Phaser.Math.Between(3000, 6000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    const container = this.add.container(width / 2, height / 2);

    // 2. Decorative victory frame (800 x 620)
    const frame = this.add.rectangle(0, 0, 800, 620, 0x180f08, 0.96);
    frame.setStrokeStyle(3, 0xd49b3d, 0.95);
    container.add(frame);

    const innerBorder = this.add.rectangle(0, 0, 772, 592, 0x110a05, 0.85);
    innerBorder.setStrokeStyle(1.5, 0x8b6508, 0.65);
    container.add(innerBorder);

    // 3. Titles
    const subtitle = this.add.text(0, -260, '✨ OUTRO & CELEBRATION — THE FINAL DOOR REACHED ✨', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      color: '#d4b182',
      letterSpacing: 3
    }).setOrigin(0.5);

    const title = this.add.text(0, -225, 'THE JOURNEY TO BAPPA', {
      fontFamily: 'Cinzel, serif',
      fontSize: '30px',
      color: '#ffd07b',
      fontStyle: 'bold',
      stroke: '#4a2608',
      strokeThickness: 3
    }).setOrigin(0.5);

    container.add([subtitle, title]);

    // 4. Interactive Ending Cutscene Card
    const cutsceneBox = this.add.rectangle(0, -100, 440, 140, 0x0f0804, 1);
    cutsceneBox.setStrokeStyle(2, 0xd49b3d, 0.85);
    cutsceneBox.setInteractive({ useHandCursor: true });

    const cutsceneGlow = this.add.circle(0, -100, 60, 0xffd07b, 0.2);
    this.tweens.add({
      targets: cutsceneGlow,
      alpha: 0.45,
      scale: 1.15,
      duration: 1200,
      yoyo: true,
      repeat: -1
    });

    const cutsceneTag = this.add.text(0, -118, '🎬 REPLAY ENDING CUTSCENE', {
      fontFamily: 'Cinzel, serif',
      fontSize: '15px',
      color: '#ffd07b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const cutsceneSub = this.add.text(0, -90, 'Experience the final story cutscene & voiceovers', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#cbb393',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    const playCutsceneBtn = this.add.rectangle(0, -58, 240, 34, 0x6b3f1b, 1);
    playCutsceneBtn.setStrokeStyle(1.5, 0xffd07b);
    playCutsceneBtn.setInteractive({ useHandCursor: true });

    const playCutsceneTxt = this.add.text(0, -58, '▶  WATCH CUTSCENE', {
      fontFamily: 'Cinzel, serif',
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const replayAction = () => {
      sound.playButtonClick();
      this.scene.stop('GameCompleteScene');
      this.scene.start('CutsceneScene', {
        transitionId: 4,
        images: ['final_1', 'final_2', 'final_3', 'final_4', 'final_screen'],
        audios: [
          'final_vo_1',
          'final_vo_2',
          'final_vo_3',
          ['final_vo_4_1', 'final_vo_4_2', 'final_vo_4_3'],
          'final_sound'
        ],
        targetLevel: 4,
        targetSceneKey: 'GameCompleteScene',
        title: 'EPILOGUE: THE DIVINE BLESSING'
      });
    };

    cutsceneBox.on('pointerdown', replayAction);
    playCutsceneBtn.on('pointerdown', replayAction);
    playCutsceneTxt.on('pointerdown', replayAction);

    playCutsceneBtn.on('pointerover', () => {
      playCutsceneBtn.setFillStyle(0x8a5223);
    });
    playCutsceneBtn.on('pointerout', () => {
      playCutsceneBtn.setFillStyle(0x6b3f1b);
    });

    container.add([cutsceneBox, cutsceneGlow, cutsceneTag, cutsceneSub, playCutsceneBtn, playCutsceneTxt]);

    // 5. Emotional Message / Lore Outro
    const lore = this.add.text(0, 20,
      'Through unwavering observation, pure faith, courage, and perseverance,\n' +
      'every locked door has opened, and every wandering shadow of doubt has dissolved.\n' +
      'Holding the completed sacred artefact at the sanctum,\n' +
      'the child is bathed in the peaceful golden light of Bappa’s eternal blessing.', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#f5e4cb',
      align: 'center',
      lineSpacing: 6
    }).setOrigin(0.5);

    const mantra = this.add.text(0, 105, '॥ गणपति बप्पा मोरया • मंगल मूर्ति मोरया ॥', {
      fontFamily: 'Cinzel, serif',
      fontSize: '17px',
      color: '#ffc168',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 6. Journey Milestones summary badges
    const milestones = [
      { icon: '🗝️', label: 'Bedroom Escape' },
      { icon: '🪔', label: 'Astha Preserved' },
      { icon: '🧩', label: 'Artefact Reunited' },
      { icon: '🛕', label: 'Sanctum Blessed' }
    ];

    const startBadgeX = -270;
    const badgeGapX = 180;
    milestones.forEach((m, idx) => {
      const bx = startBadgeX + idx * badgeGapX;
      const bY = 158;
      const bBox = this.add.rectangle(bx, bY, 160, 36, 0x22130a, 0.85);
      bBox.setStrokeStyle(1, 0x8b6508, 0.6);
      const bTxt = this.add.text(bx, bY, `${m.icon} ${m.label}`, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '12px',
        color: '#ffd07b'
      }).setOrigin(0.5);
      container.add([bBox, bTxt]);
    });

    container.add([lore, mantra]);

    // 7. Action Buttons (Bottom Row)
    const btnY = height / 2 + 235;

    // [🔄 PLAY AGAIN (FROM START)]
    this.createActionButton(width / 2 - 250, btnY, '🔄  PLAY AGAIN', 0x6b3f1b, 0xffffff, () => {
      sound.playButtonClick();
      this.scene.stop('GameCompleteScene');
      GameState.reset();
      this.scene.start('Level1Scene');
      this.scene.launch('UIScene');
    }, true);

    // [✨ REPLAY LEVEL 4]
    this.createActionButton(width / 2, btnY, '✨  REPLAY LEVEL 4', 0x2b1c11, 0xd4b182, () => {
      sound.playButtonClick();
      this.scene.stop('GameCompleteScene');
      GameState.startLevel4();
      this.scene.start('Level4Scene');
      this.scene.launch('UIScene');
    });

    // [🏠 MAIN MENU]
    this.createActionButton(width / 2 + 250, btnY, '🏠  MAIN MENU', 0x25140b, 0xd4b182, () => {
      sound.playButtonClick();
      this.scene.stop('GameCompleteScene');
      GameState.reset();
      this.scene.start('MainMenuScene');
    });

    // Entrance Tween
    container.setAlpha(0);
    this.tweens.add({
      targets: container,
      alpha: 1,
      duration: 400,
      ease: 'Power2.easeOut'
    });
  }

  private createActionButton(
    x: number,
    y: number,
    text: string,
    bgColor: number,
    textColor: number,
    onClick: () => void,
    isPrimary = false
  ) {
    const sound = SoundManager.getInstance();
    const btn = this.add.rectangle(x, y, 220, 46, bgColor, 1);
    btn.setStrokeStyle(isPrimary ? 2.5 : 1.5, isPrimary ? 0xffd07b : 0x9e7339, 1);
    btn.setInteractive({ useHandCursor: true });
    btn.setDepth(100);

    const btnText = this.add.text(x, y, text, {
      fontFamily: 'Cinzel, serif',
      fontSize: '13px',
      color: Phaser.Display.Color.IntegerToColor(textColor).rgba,
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });

    const handleAction = () => {
      sound.playButtonClick();
      onClick();
    };

    btn.on('pointerdown', handleAction);
    btnText.on('pointerdown', handleAction);

    btn.on('pointerover', () => {
      sound.playButtonHover();
      btn.setFillStyle(isPrimary ? 0x8a5223 : 0x4a2e1b);
      btn.setStrokeStyle(2, 0xffd07b);
      btnText.setColor('#ffffff');
    });

    btn.on('pointerout', () => {
      btn.setFillStyle(bgColor);
      btn.setStrokeStyle(isPrimary ? 2.5 : 1.5, isPrimary ? 0xffd07b : 0x9e7339, 1);
      btnText.setColor(Phaser.Display.Color.IntegerToColor(textColor).rgba);
    });
  }
}
