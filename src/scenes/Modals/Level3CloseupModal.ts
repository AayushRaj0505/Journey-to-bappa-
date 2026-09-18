import Phaser from 'phaser';
import { SoundManager } from '../../systems/SoundManager';

export interface Level3CloseupData {
  textureKey: string;
  title?: string;
}

export class Level3CloseupModal extends Phaser.Scene {
  private dataPayload!: Level3CloseupData;
  private soundManager!: SoundManager;

  constructor() {
    super('Level3CloseupModal');
  }

  init(data: Level3CloseupData) {
    this.dataPayload = data;
  }

  create() {
    const { width, height } = this.cameras.main;
    this.soundManager = SoundManager.getInstance();

    // Dark semi-transparent background - clicking ANYWHERE closes the modal as requested
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x070402, 0.88);
    overlay.setInteractive({ useHandCursor: true });
    overlay.on('pointerdown', () => this.closeModal());

    const container = this.add.container(width / 2, height / 2);

    // Decorative frame behind the close-up image
    const maxImgW = 760;
    const maxImgH = 500;
    
    // Close-up image
    const img = this.add.image(0, 0, this.dataPayload.textureKey);
    const scale = Math.min(maxImgW / img.width, maxImgH / img.height);
    img.setScale(scale);

    const frameW = img.width * scale + 14;
    const frameH = img.height * scale + 14;

    const frame = this.add.rectangle(0, 0, frameW, frameH, 0x1f140b, 0.95);
    frame.setStrokeStyle(3, 0xd49b3d, 0.85);

    // Subtle bottom prompt
    const hintBg = this.add.rectangle(0, frameH / 2 + 24, 340, 30, 0x180f08, 0.92);
    hintBg.setStrokeStyle(1, 0xdaa520, 0.6);
    const hintTxt = this.add.text(0, frameH / 2 + 24, 'Click anywhere or press [E] / [ESC] to return', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      color: '#ffdd88'
    }).setOrigin(0.5);

    container.add([frame, img, hintBg, hintTxt]);

    // Top-Right close cross button
    const closeBtn = this.add.text(frameW / 2 + 8, -frameH / 2 + 6, '✖', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '22px',
      color: '#ffc168'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      this.closeModal();
    });
    container.add(closeBtn);

    // Fade-in animation
    container.setAlpha(0);
    container.setScale(0.96);
    this.tweens.add({
      targets: container,
      alpha: 1,
      scale: 1,
      duration: 180,
      ease: 'Power2.easeOut'
    });

    // Keyboard dismiss listeners
    if (this.input.keyboard) {
      this.input.keyboard.once('keydown-E', () => this.closeModal());
      this.input.keyboard.once('keydown-ESC', () => this.closeModal());
      this.input.keyboard.once('keydown-SPACE', () => this.closeModal());
    }
  }

  private closeModal() {
    this.soundManager.playInteraction();
    this.scene.stop();
    this.scene.resume('Level3Scene');
  }
}
