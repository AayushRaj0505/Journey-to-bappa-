import Phaser from 'phaser';
import { GameState } from '../../state/GameState';
import { SoundManager } from '../../systems/SoundManager';

export class NoteModal extends Phaser.Scene {
  constructor() {
    super('NoteModal');
  }

  create() {
    const { width, height } = this.cameras.main;
    const sound = SoundManager.getInstance();
    sound.playInteraction();

    // Dark semi-transparent modal overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75);
    overlay.setInteractive();

    // Container for smooth entry
    const container = this.add.container(width / 2, height / 2);

    // Note graphic (original user parchment artwork)
    const noteImg = this.add.image(0, 0, 'puzzle_note');
    // Scale nicely to fit modal
    noteImg.setScale(Math.min(540 / noteImg.width, 420 / noteImg.height));
    container.add(noteImg);

    // Caption banner below note
    const banner = this.add.rectangle(0, 240, 480, 44, 0x1c120a, 0.9);
    banner.setStrokeStyle(1, 0xdaa520, 0.6);
    const caption = this.add.text(0, 240, 'Press [E] or [ESC] to close', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      color: '#ffd07b'
    }).setOrigin(0.5);
    container.add([banner, caption]);

    // Close button top-right
    const closeBtn = this.add.text(230, -210, '✖', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '24px',
      color: '#ffc168'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    closeBtn.on('pointerdown', () => this.closeModal());
    container.add(closeBtn);

    // Fade in animation
    container.setAlpha(0);
    container.setScale(0.95);
    this.tweens.add({
      targets: container,
      alpha: 1,
      scale: 1,
      duration: 180,
      ease: 'Power2'
    });

    // Mark puzzle state
    GameState.setPuzzleState('noteExamined', true);

    // Keyboard listeners
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
