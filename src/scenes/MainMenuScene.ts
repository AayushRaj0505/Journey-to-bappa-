import Phaser from 'phaser';
import { GameState } from '../state/GameState';
import { SoundManager } from '../systems/SoundManager';

export class MainMenuScene extends Phaser.Scene {
  private particles: Phaser.GameObjects.Arc[] = [];
  private activeModal: Phaser.GameObjects.Container | null = null;
  private soundBtnText!: Phaser.GameObjects.Text;

  constructor() {
    super('MainMenuScene');
  }

  create() {
    const { width, height } = this.cameras.main;
    const sound = SoundManager.getInstance();
    sound.playLevelBGM(this, 'mainmenu_bgm');

    // 1. Deep atmospheric background
    this.add.rectangle(width / 2, height / 2, width, height, 0x090503, 1);

    // Decorative soft radial glow
    const centerGlow = this.add.circle(width / 2, height / 2 - 40, 360, 0xd49b3d, 0.14);
    this.tweens.add({
      targets: centerGlow,
      scale: 1.18,
      alpha: 0.24,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 2. Rotating sacred mandala / ray graphics
    const mandala = this.add.graphics();
    mandala.setPosition(width / 2, height / 2 - 50);
    this.drawMandala(mandala);
    this.tweens.add({
      targets: mandala,
      angle: 360,
      duration: 90000,
      repeat: -1,
      ease: 'Linear'
    });

    // 3. Floating golden embers & blessing specks
    this.createFloatingEmbers(width, height);

    // 4. Main Menu Frame
    const mainContainer = this.add.container(width / 2, height / 2);

    // Header / Title card
    const titleGlow = this.add.text(0, -220, 'THE JOURNEY TO BAPPA', {
      fontFamily: 'Cinzel, serif',
      fontSize: '40px',
      color: '#ffa630',
      fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0.3);

    const title = this.add.text(0, -220, 'THE JOURNEY TO BAPPA', {
      fontFamily: 'Cinzel, serif',
      fontSize: '38px',
      color: '#ffd07b',
      fontStyle: 'bold',
      stroke: '#4a2608',
      strokeThickness: 4
    }).setOrigin(0.5);

    const subtitle = this.add.text(0, -172, 'A Devotional Quest of Courage, Light & Faith', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      color: '#e4bf8c',
      letterSpacing: 2
    }).setOrigin(0.5);

    // Sacred central icon badge
    const badgeBg = this.add.circle(0, -108, 38, 0x221308, 0.95);
    badgeBg.setStrokeStyle(2, 0xd49b3d, 0.9);
    const badgeIcon = this.add.text(0, -108, '🪔', {
      fontSize: '28px'
    }).setOrigin(0.5);

    mainContainer.add([titleGlow, title, subtitle, badgeBg, badgeIcon]);

    // 5. Menu Buttons
    const btnStartY = -30;
    const btnSpacing = 54;

    // [PLAY GAME]
    this.createMenuButton(mainContainer, 0, btnStartY, '▶  START JOURNEY', 0x804515, 0xffe29a, () => {
      sound.playButtonClick();
      sound.stopBGM();
      GameState.reset();
      this.scene.start('CutsceneScene', {
        transitionId: 0,
        images: ['intro_1', 'intro_2', 'intro_3', 'intro_4', 'intro_5', 'intro_6'],
        targetLevel: 1,
        targetSceneKey: 'Level1Scene',
        title: 'PROLOGUE: THE BEGINNING'
      });
    }, true);

    // [LEVEL SELECT]
    this.createMenuButton(mainContainer, 0, btnStartY + btnSpacing, '📜  LEVEL SELECT', 0x2b1c11, 0xe0c297, () => {
      sound.playButtonClick();
      this.openLevelSelectModal(width, height);
    });

    // [HOW TO PLAY / CONTROLS]
    this.createMenuButton(mainContainer, 0, btnStartY + btnSpacing * 2, '🎮  HOW TO PLAY', 0x2b1c11, 0xe0c297, () => {
      sound.playButtonClick();
      this.openHowToPlayModal(width, height);
    });

    // [STORY / PROLOGUE]
    this.createMenuButton(mainContainer, 0, btnStartY + btnSpacing * 3, '📖  STORY & LORE', 0x2b1c11, 0xe0c297, () => {
      sound.playButtonClick();
      this.openStoryModal(width, height);
    });

    // Bottom utility row: Sound Toggle and Credits
    this.createUtilityButtons(width, height);

    // Soft footer note
    this.add.text(width / 2, height - 24, 'Crafted with devotion • Ganpati Bappa Morya', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      color: '#7b5e3f'
    }).setOrigin(0.5);

    // Entrance Animation
    mainContainer.setAlpha(0);
    mainContainer.setScale(0.96);
    this.tweens.add({
      targets: mainContainer,
      alpha: 1,
      scale: 1,
      duration: 600,
      ease: 'Power2.easeOut'
    });
  }

  private drawMandala(g: Phaser.GameObjects.Graphics) {
    g.clear();
    g.lineStyle(1.5, 0xd49b3d, 0.12);
    
    // Concentric circles
    g.strokeCircle(0, 0, 120);
    g.strokeCircle(0, 0, 200);
    g.strokeCircle(0, 0, 290);
    g.strokeCircle(0, 0, 380);

    // 16 radial rays
    const rays = 16;
    for (let i = 0; i < rays; i++) {
      const angle = (i * Math.PI * 2) / rays;
      const x1 = Math.cos(angle) * 80;
      const y1 = Math.sin(angle) * 80;
      const x2 = Math.cos(angle) * 400;
      const y2 = Math.sin(angle) * 400;
      g.lineBetween(x1, y1, x2, y2);
    }
  }

  private createFloatingEmbers(width: number, height: number) {
    for (let i = 0; i < 28; i++) {
      const x = Phaser.Math.Between(40, width - 40);
      const y = Phaser.Math.Between(40, height - 40);
      const radius = Phaser.Math.FloatBetween(1.2, 2.8);
      const ember = this.add.circle(x, y, radius, 0xffd373, Phaser.Math.FloatBetween(0.2, 0.7));
      this.particles.push(ember);

      this.tweens.add({
        targets: ember,
        y: y - Phaser.Math.Between(60, 160),
        x: x + Phaser.Math.Between(-30, 30),
        alpha: { from: ember.alpha, to: 0.1 },
        duration: Phaser.Math.Between(3500, 7500),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 2000)
      });
    }
  }

  private createMenuButton(
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
    const btnWidth = isPrimary ? 320 : 300;
    const btnHeight = isPrimary ? 48 : 44;

    const btn = this.add.rectangle(x, y, btnWidth, btnHeight, bgColor, 0.95);
    btn.setStrokeStyle(isPrimary ? 2.5 : 1.5, isPrimary ? 0xffd07b : 0x9e7339, 0.9);
    btn.setInteractive({ useHandCursor: true });

    const btnText = this.add.text(x, y, text, {
      fontFamily: 'Cinzel, serif',
      fontSize: isPrimary ? '16px' : '14px',
      color: Phaser.Display.Color.IntegerToColor(textColor).rgba,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    btn.on('pointerover', () => {
      sound.playButtonHover();
      btn.setFillStyle(isPrimary ? 0x9e5720 : 0x462d1a);
      btn.setStrokeStyle(isPrimary ? 3 : 2, 0xffe29a, 1);
      btnText.setScale(1.04);
      btnText.setColor('#ffffff');
    });

    btn.on('pointerout', () => {
      btn.setFillStyle(bgColor);
      btn.setStrokeStyle(isPrimary ? 2.5 : 1.5, isPrimary ? 0xffd07b : 0x9e7339, 0.9);
      btnText.setScale(1);
      btnText.setColor(Phaser.Display.Color.IntegerToColor(textColor).rgba);
    });

    btn.on('pointerdown', onClick);

    container.add([btn, btnText]);
  }

  private createUtilityButtons(width: number, height: number) {
    const sound = SoundManager.getInstance();

    // Sound toggle (bottom-left)
    const soundBg = this.add.rectangle(110, height - 60, 160, 36, 0x1d120a, 0.9);
    soundBg.setStrokeStyle(1.5, 0x8b6508, 0.7);
    soundBg.setInteractive({ useHandCursor: true });

    const isMuted = sound.isAudioMuted();
    this.soundBtnText = this.add.text(110, height - 60, isMuted ? '🔇 SOUND: OFF' : '🔊 SOUND: ON', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      color: isMuted ? '#a68266' : '#ffd07b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const toggleSound = () => {
      sound.playButtonClick();
      const mutedNow = sound.toggleMute();
      this.soundBtnText.setText(mutedNow ? '🔇 SOUND: OFF' : '🔊 SOUND: ON');
      this.soundBtnText.setColor(mutedNow ? '#a68266' : '#ffd07b');
    };

    soundBg.on('pointerdown', toggleSound);
    soundBg.on('pointerover', () => {
      soundBg.setFillStyle(0x352011);
      soundBg.setStrokeStyle(2, 0xd49b3d);
    });
    soundBg.on('pointerout', () => {
      soundBg.setFillStyle(0x1d120a);
      soundBg.setStrokeStyle(1.5, 0x8b6508, 0.7);
    });

    // Credits button (bottom-right)
    const creditsBg = this.add.rectangle(width - 110, height - 60, 160, 36, 0x1d120a, 0.9);
    creditsBg.setStrokeStyle(1.5, 0x8b6508, 0.7);
    creditsBg.setInteractive({ useHandCursor: true });

    const creditsText = this.add.text(width - 110, height - 60, '✨ CREDITS', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      color: '#d4b182',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    creditsBg.on('pointerdown', () => {
      sound.playButtonClick();
      this.openCreditsModal(width, height);
    });
    creditsBg.on('pointerover', () => {
      creditsBg.setFillStyle(0x352011);
      creditsBg.setStrokeStyle(2, 0xd49b3d);
      creditsText.setColor('#ffffff');
    });
    creditsBg.on('pointerout', () => {
      creditsBg.setFillStyle(0x1d120a);
      creditsBg.setStrokeStyle(1.5, 0x8b6508, 0.7);
      creditsText.setColor('#d4b182');
    });
  }

  // ================= MODALS =================

  private openLevelSelectModal(width: number, height: number) {
    if (this.activeModal) this.closeActiveModal();
    const modal = this.add.container(width / 2, height / 2);
    this.activeModal = modal;

    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.85);
    overlay.setInteractive();

    const box = this.add.rectangle(0, 0, 780, 560, 0x160c06, 0.98);
    box.setStrokeStyle(2.5, 0xd49b3d, 0.95);

    const title = this.add.text(0, -240, 'SELECT A CHAPTER', {
      fontFamily: 'Cinzel, serif',
      fontSize: '24px',
      color: '#ffd07b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const closeBtn = this.createCloseButton(350, -240, () => this.closeActiveModal());

    modal.add([overlay, box, title, closeBtn]);

    // 4 Level Cards
    const levels = [
      {
        num: 1,
        title: 'LEVEL 1: THE BEDROOM',
        desc: 'Escape the locked room. Find hidden notes, assemble the drawer handle, and discover the 1st Artefact Fragment.',
        icon: '🗝️',
        action: () => {
          GameState.reset();
          this.scene.start('Level1Scene');
          this.scene.launch('UIScene');
        }
      },
      {
        num: 2,
        title: 'LEVEL 2: THE DARK MAZE',
        desc: 'Navigate the pitch-black labyrinth with the sacred Diya. Protect your Astha from the wandering Vighna shadows.',
        icon: '🪔',
        action: () => {
          GameState.startLevel2();
          this.scene.start('Level2Scene');
          this.scene.launch('UIScene');
        }
      },
      {
        num: 3,
        title: 'LEVEL 3: THE LIVING ROOM',
        desc: 'Examine sacred family memories, uncover the 2nd Artefact Fragment, solve painting riddles, and complete the disc.',
        icon: '🧩',
        action: () => {
          GameState.startLevel3();
          this.scene.start('Level3Scene');
          this.scene.launch('UIScene');
        }
      },
      {
        num: 4,
        title: 'LEVEL 4: THE FINAL DOOR',
        desc: 'Place the completed artefact onto the temple pedestal, deduce the sacred 4-image sequence, and enter Bappa’s sanctum.',
        icon: '🛕',
        action: () => {
          GameState.startLevel4();
          this.scene.start('Level4Scene');
          this.scene.launch('UIScene');
        }
      }
    ];

    const cardStartX = -260;
    const cardStartY = -140;
    const cardGapY = 95;

    levels.forEach((lvl, idx) => {
      const cardY = cardStartY + idx * cardGapY;
      const cardBg = this.add.rectangle(0, cardY, 700, 80, 0x22130a, 0.9);
      cardBg.setStrokeStyle(1.5, 0x8b6508, 0.75);
      cardBg.setInteractive({ useHandCursor: true });

      const icon = this.add.text(-310, cardY, lvl.icon, { fontSize: '28px' }).setOrigin(0.5);

      const lvlTitle = this.add.text(-260, cardY - 14, lvl.title, {
        fontFamily: 'Cinzel, serif',
        fontSize: '15px',
        color: '#ffc168',
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);

      const lvlDesc = this.add.text(-260, cardY + 14, lvl.desc, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '12px',
        color: '#d4b182',
        wordWrap: { width: 440 }
      }).setOrigin(0, 0.5);

      const playBtn = this.add.rectangle(285, cardY, 90, 36, 0x6b3f1b, 1);
      playBtn.setStrokeStyle(1.5, 0xffd07b, 0.9);
      const playTxt = this.add.text(285, cardY, 'PLAY', {
        fontFamily: 'Cinzel, serif',
        fontSize: '13px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      const triggerPlay = () => {
        SoundManager.getInstance().playButtonClick();
        lvl.action();
      };

      cardBg.on('pointerdown', triggerPlay);
      cardBg.on('pointerover', () => {
        SoundManager.getInstance().playButtonHover();
        cardBg.setFillStyle(0x351f11);
        cardBg.setStrokeStyle(2, 0xffd07b);
        playBtn.setFillStyle(0x8a5223);
      });
      cardBg.on('pointerout', () => {
        cardBg.setFillStyle(0x22130a);
        cardBg.setStrokeStyle(1.5, 0x8b6508, 0.75);
        playBtn.setFillStyle(0x6b3f1b);
      });

      modal.add([cardBg, icon, lvlTitle, lvlDesc, playBtn, playTxt]);
    });

    this.animateModalIn(modal);
  }

  private openHowToPlayModal(width: number, height: number) {
    if (this.activeModal) this.closeActiveModal();
    const modal = this.add.container(width / 2, height / 2);
    this.activeModal = modal;

    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.85);
    overlay.setInteractive();

    const box = this.add.rectangle(0, 0, 720, 540, 0x160c06, 0.98);
    box.setStrokeStyle(2.5, 0xd49b3d, 0.95);

    const title = this.add.text(0, -225, 'CONTROLS & GUIDE', {
      fontFamily: 'Cinzel, serif',
      fontSize: '24px',
      color: '#ffd07b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const closeBtn = this.createCloseButton(320, -225, () => this.closeActiveModal());

    modal.add([overlay, box, title, closeBtn]);

    const guides = [
      {
        icon: '🕹️',
        title: 'MOVEMENT',
        desc: 'Use W, A, S, D or the Arrow Keys to walk and guide the child through the rooms.'
      },
      {
        icon: '✨',
        title: 'INTERACTION',
        desc: 'Approach furniture, notes, or items and press [E] or click the interaction prompt banner.'
      },
      {
        icon: '⏸️',
        title: 'PAUSE ANYTIME',
        desc: 'Press [ESC], [P], or click the [⏸] button in the top right to pause, restart, or adjust sound.'
      },
      {
        icon: '🎒',
        title: 'INVENTORY',
        desc: 'Items you collect appear in your bottom inventory bar. Click them anytime to inspect them.'
      },
      {
        icon: '🪔',
        title: 'ASTHA (FAITH & LIGHT)',
        desc: 'In the dark maze of Level 2, hold the sacred Diya. Keep away from shadows to maintain your Astha.'
      },
      {
        icon: '🧩',
        title: 'SOLVE PUZZLES',
        desc: 'Examine your surroundings for visual clues, dates, and sacred symbols to crack the locks.'
      }
    ];

    const startY = -140;
    const gapY = 56;

    guides.forEach((g, idx) => {
      const y = startY + idx * gapY;
      const gBg = this.add.rectangle(0, y, 640, 48, 0x22130a, 0.85);
      gBg.setStrokeStyle(1, 0x8b6508, 0.6);

      const gIcon = this.add.text(-295, y, g.icon, { fontSize: '22px' }).setOrigin(0.5);

      const gTitle = this.add.text(-265, y, g.title, {
        fontFamily: 'Cinzel, serif',
        fontSize: '13px',
        color: '#ffc168',
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);

      const gDesc = this.add.text(-120, y, g.desc, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '12px',
        color: '#d4b182',
        wordWrap: { width: 420 }
      }).setOrigin(0, 0.5);

      modal.add([gBg, gIcon, gTitle, gDesc]);
    });

    this.animateModalIn(modal);
  }

  private openStoryModal(width: number, height: number) {
    if (this.activeModal) this.closeActiveModal();
    const modal = this.add.container(width / 2, height / 2);
    this.activeModal = modal;

    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.85);
    overlay.setInteractive();

    const box = this.add.rectangle(0, 0, 680, 500, 0x160c06, 0.98);
    box.setStrokeStyle(2.5, 0xd49b3d, 0.95);

    const title = this.add.text(0, -210, 'PROLOGUE', {
      fontFamily: 'Cinzel, serif',
      fontSize: '24px',
      color: '#ffd07b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const closeBtn = this.createCloseButton(300, -210, () => this.closeActiveModal());

    const storyText = this.add.text(0, -20,
      'On a quiet, auspicious night filled with devotion,\n' +
      'a child awakens to a sacred calling to reach the sanctum of Lord Bappa.\n\n' +
      'The path is hidden behind ancient locks, forgotten memories,\n' +
      'and the creeping shadows of doubt known as Vighna.\n\n' +
      'Legend speaks of a divine circular artefact, split into sacred fragments.\n' +
      'Only one with pure observation, courage to carry the holy Diya,\n' +
      'and unbroken faith (Astha) can reunite the pieces.\n\n' +
      'With Bappa’s blessings in your heart,\n' +
      'embark upon the journey and open the Final Door!', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: '#f5e4cb',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5);

    const mantra = this.add.text(0, 160, '॥ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ ॥\n॥ निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥', {
      fontFamily: 'Cinzel, serif',
      fontSize: '15px',
      color: '#ffc168',
      align: 'center',
      lineSpacing: 6
    }).setOrigin(0.5);

    modal.add([overlay, box, title, closeBtn, storyText, mantra]);
    this.animateModalIn(modal);
  }

  private openCreditsModal(width: number, height: number) {
    if (this.activeModal) this.closeActiveModal();
    const modal = this.add.container(width / 2, height / 2);
    this.activeModal = modal;

    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.85);
    overlay.setInteractive();

    const box = this.add.rectangle(0, 0, 640, 460, 0x160c06, 0.98);
    box.setStrokeStyle(2.5, 0xd49b3d, 0.95);

    const title = this.add.text(0, -180, 'CREDITS & DEDICATION', {
      fontFamily: 'Cinzel, serif',
      fontSize: '24px',
      color: '#ffd07b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const closeBtn = this.createCloseButton(280, -180, () => this.closeActiveModal());

    const creditsContent = this.add.text(0, 0,
      'THE JOURNEY TO BAPPA\n\n' +
      'Inspired by eternal devotion to Lord Ganesha (Vighnaharta)\n\n' +
      'Engine & Systems: Phaser 3 + TypeScript\n' +
      'Audio & Synthesis: Web Audio API Synthesizer\n' +
      'Original Artwork & Level Design: Journey to Bappa Team\n\n' +
      'Special thanks to everyone playing and sharing this experience.\n' +
      'May Bappa remove all obstacles from your journey in life!', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#e8d1b4',
      align: 'center',
      lineSpacing: 7
    }).setOrigin(0.5);

    modal.add([overlay, box, title, closeBtn, creditsContent]);
    this.animateModalIn(modal);
  }

  private createCloseButton(x: number, y: number, onClose: () => void) {
    const btn = this.add.text(x, y, '✖', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '22px',
      color: '#ffc168'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerdown', () => {
      SoundManager.getInstance().playButtonClick();
      onClose();
    });
    btn.on('pointerover', () => btn.setColor('#ffffff'));
    btn.on('pointerout', () => btn.setColor('#ffc168'));

    return btn;
  }

  private animateModalIn(modal: Phaser.GameObjects.Container) {
    modal.setAlpha(0);
    modal.setScale(0.95);
    this.tweens.add({
      targets: modal,
      alpha: 1,
      scale: 1,
      duration: 200,
      ease: 'Power2.easeOut'
    });

    if (this.input.keyboard) {
      this.input.keyboard.once('keydown-ESC', () => {
        if (this.activeModal === modal) {
          this.closeActiveModal();
        }
      });
    }
  }

  private closeActiveModal() {
    if (!this.activeModal) return;
    SoundManager.getInstance().playButtonClick();
    this.activeModal.destroy();
    this.activeModal = null;
  }
}
