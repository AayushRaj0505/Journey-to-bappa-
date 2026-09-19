import Phaser from 'phaser';
import { GameState } from '../../state/GameState';
import { SoundManager } from '../../systems/SoundManager';

export class DivineHintModal extends Phaser.Scene {
  private returnSceneKey: string = 'Level1Scene';
  private newHintIndex?: number;

  constructor() {
    super('DivineHintModal');
  }

  init(data: { newHintIndex?: number; returnScene?: string }) {
    this.newHintIndex = data?.newHintIndex;
    if (data?.returnScene) {
      this.returnSceneKey = data.returnScene;
    } else {
      // Auto-detect active scene
      const levelScenes = ['Level1Scene', 'Level2Scene', 'Level3Scene', 'Level4Scene'];
      for (const key of levelScenes) {
        if (this.scene.isActive(key)) {
          this.returnSceneKey = key;
          break;
        }
      }
    }
  }

  create() {
    const { width, height } = this.cameras.main;
    const sound = SoundManager.getInstance();
    sound.playPuzzleSuccess();

    // Pause the active gameplay scene
    if (this.scene.isActive(this.returnSceneKey)) {
      this.scene.pause(this.returnSceneKey);
    }

    // 1. Dark semi-transparent modal overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.82);
    overlay.setInteractive();

    // 2. Modal Container
    const container = this.add.container(width / 2, height / 2);

    // Decorative outer frame (700 x 560)
    const frame = this.add.rectangle(0, 0, 700, 560, 0x180f08, 0.98);
    frame.setStrokeStyle(3, 0xd49b3d, 0.95);
    container.add(frame);

    const innerBorder = this.add.rectangle(0, 0, 672, 532, 0x110904, 0.85);
    innerBorder.setStrokeStyle(1.5, 0x8b6508, 0.65);
    container.add(innerBorder);

    // Header Title
    const title = this.add.text(0, -240, '✨  DIVINE ASTHA REVELATIONS  ✨', {
      fontFamily: 'Cinzel, serif',
      fontSize: '22px',
      color: '#ffd07b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const subtitle = this.add.text(0, -210, 'Sacred Keys to the Final Door (View anytime from Pause Menu)', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      color: '#d4b182',
      letterSpacing: 1
    }).setOrigin(0.5);

    // Close 'X' button
    const closeX = this.add.text(315, -240, '✖', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '22px',
      color: '#ffc168'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeX.on('pointerdown', () => this.closeModal());
    closeX.on('pointerover', () => closeX.setColor('#ffffff'));
    closeX.on('pointerout', () => closeX.setColor('#ffc168'));

    container.add([title, subtitle, closeX]);

    // 3. Four Hint Cards (One for each symbol in Level 4)
    const hints = [
      {
        index: 1,
        levelName: 'LEVEL 1 (20 ASTHA)',
        symbolName: 'ELEPHANT (Gaja)',
        iconKey: 'icon_elephant',
        desc: '“The wise Elephant Lord of beginnings who removes all obstacles. Found at the start of your journey.”',
        isUnlocked: GameState.isHintUnlocked(1)
      },
      {
        index: 2,
        levelName: 'LEVEL 2 (40 ASTHA)',
        symbolName: 'DIYA (Sacred Flame)',
        iconKey: 'icon_diya',
        desc: '“The sacred diya whose golden flame dispelled darkness in the forest maze. Carried through fear into faith.”',
        isUnlocked: GameState.isHintUnlocked(2)
      },
      {
        index: 3,
        levelName: 'LEVEL 3 (50 ASTHA)',
        symbolName: 'TRIDENT (Trishula)',
        iconKey: 'icon_trident',
        desc: '“The divine trishula of willpower, strength, and sacred wisdom discovered in the living room relic.”',
        isUnlocked: GameState.isHintUnlocked(3)
      },
      {
        index: 4,
        levelName: 'LEVEL 4 (100 ASTHA)',
        symbolName: 'TEMPLE (Mandir Sanctum)',
        iconKey: 'icon_temple',
        desc: '“Look back upon your steps: each level gave you one divine symbol in the exact order of your pilgrimage.”',
        isUnlocked: GameState.isHintUnlocked(4)
      }
    ];

    const cardStartY = -136;
    const cardGapY = 72;

    hints.forEach((h, idx) => {
      const cy = cardStartY + idx * cardGapY;
      const isNew = this.newHintIndex === h.index;

      const cardBg = this.add.rectangle(0, cy, 630, 64, h.isUnlocked ? 0x24160b : 0x160c06, 0.92);
      cardBg.setStrokeStyle(isNew ? 2.5 : 1.5, isNew ? 0x4eed94 : (h.isUnlocked ? 0xd49b3d : 0x5a3d24), 0.9);
      container.add(cardBg);

      if (isNew) {
        // Pulsing highlight for freshly unlocked hint
        this.tweens.add({
          targets: cardBg,
          alpha: 0.8,
          duration: 600,
          yoyo: true,
          repeat: -1
        });
      }

      // Slot index pill
      const numBadge = this.add.circle(-285, cy, 18, h.isUnlocked ? 0x6b3f1b : 0x22130a);
      numBadge.setStrokeStyle(1.5, h.isUnlocked ? 0xffd07b : 0x553c2a);
      const numText = this.add.text(-285, cy, `${h.index}`, {
        fontFamily: 'Cinzel, serif',
        fontSize: '15px',
        color: h.isUnlocked ? '#ffffff' : '#8a6a4e',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      container.add([numBadge, numText]);

      if (h.isUnlocked) {
        // Unlocked icon
        const icon = this.add.image(-235, cy, h.iconKey);
        icon.setDisplaySize(42, 42);

        const cardTitle = this.add.text(-195, cy - 13, `STAGE #${h.index}: ${h.symbolName}`, {
          fontFamily: 'Cinzel, serif',
          fontSize: '14px',
          color: '#ffd07b',
          fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        const cardDesc = this.add.text(-195, cy + 12, h.desc, {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '12px',
          color: '#f5e4cb',
          wordWrap: { width: 370 }
        }).setOrigin(0, 0.5);

        const badge = this.add.rectangle(250, cy, 84, 26, 0x142b17, 0.9);
        badge.setStrokeStyle(1.5, 0x4eed94, 0.9);
        const badgeTxt = this.add.text(250, cy, isNew ? '✨ NEW!' : '✓ REVEALED', {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '11px',
          color: '#4eed94',
          fontStyle: 'bold'
        }).setOrigin(0.5);

        container.add([icon, cardTitle, cardDesc, badge, badgeTxt]);
      } else {
        // Locked slot
        const lockIcon = this.add.text(-235, cy, '🔒', {
          fontSize: '20px'
        }).setOrigin(0.5);

        const lockTitle = this.add.text(-195, cy - 12, `STAGE #${h.index}: ??? (SEALED)`, {
          fontFamily: 'Cinzel, serif',
          fontSize: '13px',
          color: '#8a6a4e',
          fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        const lockReq = this.add.text(-195, cy + 12, `Unlock Condition: Reach full Astha in ${h.levelName}`, {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '12px',
          color: '#a68266'
        }).setOrigin(0, 0.5);

        container.add([lockIcon, lockTitle, lockReq]);
      }
    });

    // Pilgrimage Journey Banner (reveals how the entire password sequence maps across levels)
    if (GameState.isHintUnlocked(4)) {
      const bannerBg = this.add.rectangle(0, 166, 630, 32, 0x2e1a0c, 0.95);
      bannerBg.setStrokeStyle(1.5, 0xffd07b, 0.9);
      const bannerTxt = this.add.text(
        0,
        166,
        '✨ PILGRIMAGE CLUE: The password order follows your journey — Bedroom ➔ Maze ➔ Living Room ➔ Sanctum ✨',
        {
          fontFamily: 'Cinzel, serif',
          fontSize: '10.5px',
          color: '#ffd07b',
          fontStyle: 'bold'
        }
      ).setOrigin(0.5);
      container.add([bannerBg, bannerTxt]);
    } else {
      const bannerBg = this.add.rectangle(0, 166, 630, 28, 0x180f08, 0.8);
      bannerBg.setStrokeStyle(1, 0x5a3d24, 0.6);
      const bannerTxt = this.add.text(
        0,
        166,
        '✨ "Each sacred realm holds one seal of the Final Door. Gather Astha to reveal Bappa\'s truth."',
        {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '11.5px',
          color: '#d4b182',
          fontStyle: 'italic'
        }
      ).setOrigin(0.5);
      container.add([bannerBg, bannerTxt]);
    }

    // Bottom Action Button: [ CONTINUE JOURNEY ]
    const contBtn = this.add.rectangle(0, 222, 260, 42, 0x6b3f1b, 1);
    contBtn.setStrokeStyle(2, 0xffd07b, 0.95);
    contBtn.setInteractive({ useHandCursor: true });

    const btnLabel = this.newHintIndex ? 'CONTINUE (AUTO: 5s)' : 'CONTINUE JOURNEY';
    const contTxt = this.add.text(0, 222, btnLabel, {
      fontFamily: 'Cinzel, serif',
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    contBtn.on('pointerdown', () => this.closeModal());
    contBtn.on('pointerover', () => {
      sound.playButtonHover();
      contBtn.setFillStyle(0x8a5223);
      contBtn.setStrokeStyle(2.5, 0xfff0b8);
    });
    contBtn.on('pointerout', () => {
      contBtn.setFillStyle(0x6b3f1b);
      contBtn.setStrokeStyle(2, 0xffd07b, 0.95);
    });

    container.add([contBtn, contTxt]);

    // If opened upon finding a new hint, auto-close in 5 seconds with countdown timer
    if (this.newHintIndex) {
      let secondsLeft = 5;
      const countdownEvent = this.time.addEvent({
        delay: 1000,
        repeat: 4,
        callback: () => {
          secondsLeft--;
          if (secondsLeft > 0) {
            contTxt.setText(`CONTINUE (AUTO: ${secondsLeft}s)`);
          } else {
            this.closeModal();
          }
        }
      });

      // Also clean up countdown if user closes early
      this.events.once('shutdown', () => {
        countdownEvent.remove();
      });
    }

    // Entrance Animation
    container.setAlpha(0);
    container.setScale(0.96);
    this.tweens.add({
      targets: container,
      alpha: 1,
      scale: 1,
      duration: 220,
      ease: 'Power2.easeOut'
    });

    // Keyboard Shortcuts
    if (this.input.keyboard) {
      this.input.keyboard.once('keydown-E', () => this.closeModal());
      this.input.keyboard.once('keydown-ESC', () => this.closeModal());
      this.input.keyboard.once('keydown-SPACE', () => this.closeModal());
    }
  }

  private closeModal() {
    SoundManager.getInstance().playButtonClick();
    if (this.scene.isPaused(this.returnSceneKey)) {
      this.scene.resume(this.returnSceneKey);
    }
    this.scene.stop('DivineHintModal');
  }
}
