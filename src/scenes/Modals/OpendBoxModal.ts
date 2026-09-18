import Phaser from 'phaser';
import { SoundManager } from '../../systems/SoundManager';

export class OpendBoxModal extends Phaser.Scene {
  constructor() {
    super('OpendBoxModal');
  }

  create() {
    const { width, height } = this.cameras.main;
    const sound = SoundManager.getInstance();

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    overlay.setInteractive();

    const container = this.add.container(width / 2, height / 2);

    // Box Open Image (original user artwork)
    const boxImg = this.add.image(0, -30, 'puzzle_opend_box');
    boxImg.setScale(Math.min(560 / boxImg.width, 380 / boxImg.height));
    container.add(boxImg);

    // Notification banner
    const banner = this.add.rectangle(0, 190, 520, 64, 0x1f140b, 0.95);
    banner.setStrokeStyle(2, 0xd49b3d, 0.85);

    const title = this.add.text(0, 175, '✨ PUZZLE BOX OPENED! OBTAINED KEY 1', {
      fontFamily: 'Cinzel, serif',
      fontSize: '17px',
      color: '#4eed94',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const hint = this.add.text(0, 202, 'Key 1 added to your backpack! Press [E] or [ESC] to continue.', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#ffd07b'
    }).setOrigin(0.5);

    container.add([banner, title, hint]);

    // Close button
    const closeBtn = this.add.text(250, -200, '✖', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '22px',
      color: '#ffc168'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeModal());
    container.add(closeBtn);

    container.setAlpha(0);
    this.tweens.add({ targets: container, alpha: 1, duration: 160 });

    if (this.input.keyboard) {
      this.input.keyboard.once('keydown-E', () => this.closeModal());
      this.input.keyboard.once('keydown-ESC', () => this.closeModal());
      this.input.keyboard.once('keydown-SPACE', () => this.closeModal());
    }
  }

  private closeModal() {
    SoundManager.getInstance().playInteraction();
    this.scene.stop();
    this.scene.resume('Level1Scene');
  }
}
