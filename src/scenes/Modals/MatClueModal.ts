import Phaser from 'phaser';
import { GameState } from '../../state/GameState';
import { SoundManager } from '../../systems/SoundManager';

export class MatClueModal extends Phaser.Scene {
  constructor() {
    super('MatClueModal');
  }

  create() {
    const { width, height } = this.cameras.main;
    const sound = SoundManager.getInstance();
    sound.playInteraction();

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    overlay.setInteractive();

    const container = this.add.container(width / 2, height / 2);

    // Modal background card
    const card = this.add.rectangle(0, 0, 560, 480, 0x21170f, 0.98);
    card.setStrokeStyle(3, 0xd49b3d, 0.8);
    container.add(card);

    // Title
    const title = this.add.text(0, -200, '🪡 BED MAT INSCRIPTION', {
      fontFamily: 'Cinzel, serif',
      fontSize: '22px',
      color: '#ffd07b',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(title);

    // Mat artwork thumbnail
    const matImg = this.add.image(0, -115, 'room_mat');
    matImg.setScale(0.24);
    container.add(matImg);

    // Description
    const desc = this.add.text(0, -25, 'Under the woven edge of the mat, ancient symbols are etched in order:', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: '#e5cbb1',
      align: 'center',
      wordWrap: { width: 480 }
    }).setOrigin(0.5);
    container.add(desc);

    // Symbol sequence display card
    const seqCard = this.add.rectangle(0, 75, 480, 100, 0x130b05, 1);
    seqCard.setStrokeStyle(2, 0xd49b3d, 0.6);
    container.add(seqCard);

    const steps = [
      { name: 'MUSHAK', symbol: '🐭', hint: 'Mouse' },
      { name: 'DIYA', symbol: '🪔', hint: 'Lamp' },
      { name: 'ELEPHANT', symbol: '🐘', hint: 'Ganesha' },
      { name: 'FLOWER', symbol: '🌸', hint: 'Lotus' }
    ];

    const startX = -170;
    steps.forEach((step, idx) => {
      const sx = startX + idx * 115;
      
      const symText = this.add.text(sx, 58, step.symbol, {
        fontSize: '28px'
      }).setOrigin(0.5);

      const nameText = this.add.text(sx, 90, step.name, {
        fontFamily: 'Cinzel, serif',
        fontSize: '12px',
        color: '#ffdd88',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      container.add([symText, nameText]);

      if (idx < 3) {
        const arrow = this.add.text(sx + 58, 68, '➔', {
          fontSize: '20px',
          color: '#d49b3d'
        }).setOrigin(0.5);
        container.add(arrow);
      }
    });

    // Close button
    const banner = this.add.rectangle(0, 195, 480, 42, 0x2e1d11, 0.9);
    banner.setStrokeStyle(1, 0xd49b3d, 0.5);
    const closeText = this.add.text(0, 195, 'Press [E] or [ESC] to close', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: '#ffd07b'
    }).setOrigin(0.5);
    container.add([banner, closeText]);

    const closeBtn = this.add.text(250, -210, '✖', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '22px',
      color: '#ffc168'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeModal());
    container.add(closeBtn);

    // Fade in
    container.setAlpha(0);
    this.tweens.add({ targets: container, alpha: 1, duration: 160 });

    GameState.setPuzzleState('matClueExamined', true);

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
