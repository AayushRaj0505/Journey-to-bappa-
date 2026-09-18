import Phaser from 'phaser';
import { GameState } from '../../state/GameState';
import { SoundManager } from '../../systems/SoundManager';

interface SymbolOption {
  id: string;
  name: string;
  icon: string;
}

export class IconPuzzleModal extends Phaser.Scene {
  private selectedSequence: string[] = [];
  private readonly targetSequence: string[] = ['mushak', 'diya', 'elephant', 'flower'];
  private slotIndicators: Phaser.GameObjects.Text[] = [];
  private messageText!: Phaser.GameObjects.Text;
  private boxImage!: Phaser.GameObjects.Image;
  private isSolved: boolean = false;
  private soundManager!: SoundManager;
  private buttonContainer!: Phaser.GameObjects.Container;

  private readonly symbols: SymbolOption[] = [
    { id: 'mushak', name: 'Mushak (Mouse)', icon: '🐭' },
    { id: 'diya', name: 'Diya (Lamp)', icon: '🪔' },
    { id: 'elephant', name: 'Elephant (Ganesha)', icon: '🐘' },
    { id: 'flower', name: 'Flower (Lotus)', icon: '🌸' }
  ];

  constructor() {
    super('IconPuzzleModal');
  }

  create() {
    const { width, height } = this.cameras.main;
    this.soundManager = SoundManager.getInstance();
    this.soundManager.playInteraction();
    this.selectedSequence = [];
    this.isSolved = GameState.isPuzzleSolved('boxUnlocked');

    // Overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.82);
    overlay.setInteractive();

    const container = this.add.container(width / 2, height / 2);

    // Frame Card
    const card = this.add.rectangle(0, 0, 620, 530, 0x1f140c, 0.98);
    card.setStrokeStyle(3, 0xd49b3d, 0.85);
    container.add(card);

    // Title
    const title = this.add.text(0, -225, '📦 4-SYMBOL PUZZLE BOX', {
      fontFamily: 'Cinzel, serif',
      fontSize: '22px',
      color: '#ffd07b',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(title);

    // Box image display
    const currentBoxKey = this.isSolved ? 'puzzle_opend_box' : 'puzzle_small_box';
    this.boxImage = this.add.image(0, -115, currentBoxKey);
    this.boxImage.setScale(Math.min(360 / this.boxImage.width, 170 / this.boxImage.height));
    container.add(this.boxImage);

    // Sequence Slots Card
    const slotCard = this.add.rectangle(0, 10, 480, 52, 0x130b05, 1);
    slotCard.setStrokeStyle(1.5, 0xd49b3d, 0.6);
    container.add(slotCard);

    this.slotIndicators = [];
    const slotXStarts = [-150, -50, 50, 150];
    for (let i = 0; i < 4; i++) {
      const slotBox = this.add.rectangle(slotXStarts[i], 10, 80, 38, 0x27190e, 0.9);
      slotBox.setStrokeStyle(1, 0x8b6508, 0.5);
      const slotTxt = this.add.text(slotXStarts[i], 10, '•', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '24px',
        color: '#7a5a3a'
      }).setOrigin(0.5);
      this.slotIndicators.push(slotTxt);
      container.add([slotBox, slotTxt]);
    }

    // Message
    const defaultMsg = this.isSolved
      ? 'The puzzle box is unlocked! Key 1 has been retrieved.'
      : 'Press the sacred symbols in the sequence revealed by the mat:';
    this.messageText = this.add.text(0, 54, defaultMsg, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: '#d4b182',
      align: 'center'
    }).setOrigin(0.5);
    container.add(this.messageText);

    // Buttons Container
    this.buttonContainer = this.add.container(0, 110);
    container.add(this.buttonContainer);

    if (!this.isSolved) {
      this.renderButtons();
    } else {
      this.renderSolvedState();
    }

    // Reset & Close Buttons
    const resetBtn = this.add.rectangle(-110, 205, 160, 38, 0x3d2314, 0.95);
    resetBtn.setStrokeStyle(1.5, 0xd49b3d, 0.65);
    resetBtn.setInteractive({ useHandCursor: true });
    const resetTxt = this.add.text(-110, 205, 'RESET CODE', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#ffcb6b',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    resetBtn.on('pointerdown', () => this.resetSequence());
    container.add([resetBtn, resetTxt]);

    const closeBtnCard = this.add.rectangle(110, 205, 160, 38, 0x3d2314, 0.95);
    closeBtnCard.setStrokeStyle(1.5, 0xd49b3d, 0.65);
    closeBtnCard.setInteractive({ useHandCursor: true });
    const closeTxt = this.add.text(110, 205, 'CLOSE [ESC]', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#ffcb6b',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    closeBtnCard.on('pointerdown', () => this.closeModal());
    container.add([closeBtnCard, closeTxt]);

    // Top Right Close Cross
    const cross = this.add.text(280, -235, '✖', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '22px',
      color: '#ffc168'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    cross.on('pointerdown', () => this.closeModal());
    container.add(cross);

    // Keyboard handlers
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ESC', () => this.closeModal());
      this.input.keyboard.on('keydown-E', () => this.closeModal());
      this.input.keyboard.on('keydown-ONE', () => this.handleSymbolClick('mushak'));
      this.input.keyboard.on('keydown-TWO', () => this.handleSymbolClick('diya'));
      this.input.keyboard.on('keydown-THREE', () => this.handleSymbolClick('elephant'));
      this.input.keyboard.on('keydown-FOUR', () => this.handleSymbolClick('flower'));
    }

    // Modal entrance tween
    container.setAlpha(0);
    this.tweens.add({ targets: container, alpha: 1, duration: 160 });
  }

  private renderButtons() {
    this.buttonContainer.removeAll(true);
    const startX = -210;
    const spacing = 140;

    this.symbols.forEach((sym, idx) => {
      const bx = startX + idx * spacing;
      const btnBg = this.add.rectangle(bx, 15, 126, 68, 0x2f1e13, 0.95);
      btnBg.setStrokeStyle(1.5, 0xd49b3d, 0.65);
      btnBg.setInteractive({ useHandCursor: true });

      const iconText = this.add.text(bx, 0, sym.icon, {
        fontSize: '26px'
      }).setOrigin(0.5);

      const label = this.add.text(bx, 28, sym.name.split(' ')[0], {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '13px',
        color: '#ffd07b',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      btnBg.on('pointerover', () => {
        btnBg.setFillStyle(0x523420);
        btnBg.setStrokeStyle(2, 0xffd07b);
      });

      btnBg.on('pointerout', () => {
        btnBg.setFillStyle(0x2f1e13);
        btnBg.setStrokeStyle(1.5, 0xd49b3d, 0.65);
      });

      btnBg.on('pointerdown', () => this.handleSymbolClick(sym.id));

      this.buttonContainer.add([btnBg, iconText, label]);
    });
  }

  private renderSolvedState() {
    this.buttonContainer.removeAll(true);
    const solvedBanner = this.add.text(0, 20, '✨ Key 1 Collected ✨', {
      fontFamily: 'Cinzel, serif',
      fontSize: '20px',
      color: '#4eed94',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.buttonContainer.add(solvedBanner);

    this.slotIndicators.forEach((slot, i) => {
      const sym = this.symbols.find(s => s.id === this.targetSequence[i]);
      if (sym) {
        slot.setText(sym.icon).setColor('#4eed94');
      }
    });
  }

  private handleSymbolClick(id: string) {
    if (this.isSolved) return;
    if (this.selectedSequence.length >= 4) return;

    this.soundManager.playInteraction();
    this.selectedSequence.push(id);
    this.updateSlots();

    if (this.selectedSequence.length === 4) {
      this.time.delayedCall(200, () => this.validateSequence());
    }
  }

  private updateSlots() {
    for (let i = 0; i < 4; i++) {
      if (i < this.selectedSequence.length) {
        const sym = this.symbols.find(s => s.id === this.selectedSequence[i]);
        this.slotIndicators[i].setText(sym ? sym.icon : '?').setColor('#ffd07b');
      } else {
        this.slotIndicators[i].setText('•').setColor('#7a5a3a');
      }
    }
  }

  private resetSequence() {
    if (this.isSolved) return;
    this.soundManager.playInteraction();
    this.selectedSequence = [];
    this.updateSlots();
    this.messageText.setText('Sequence reset. Enter the 4 sacred symbols:').setColor('#d4b182');
  }

  private validateSequence() {
    if (this.isSolved) return;

    const isMatch = this.selectedSequence.every((val, idx) => val === this.targetSequence[idx]);

    if (isMatch) {
      this.isSolved = true;
      this.soundManager.playPuzzleSuccess();
      this.messageText.setText('✓ CLICK! The puzzle box unlocked! Key 1 revealed!').setColor('#4eed94');
      this.slotIndicators.forEach(s => s.setColor('#4eed94'));

      // Switch to opened box image
      this.boxImage.setTexture('puzzle_opend_box');
      this.boxImage.setScale(Math.min(360 / this.boxImage.width, 170 / this.boxImage.height));

      this.renderSolvedState();

      this.time.delayedCall(450, () => {
        GameState.addItem('Key_1');
        GameState.setPuzzleState('boxUnlocked', true);
        this.soundManager.playItemPickup();
      });
    } else {
      this.soundManager.playInteraction();
      this.messageText.setText('✖ INCORRECT SYMBOL SEQUENCE. Try again.').setColor('#ff5555');
      this.slotIndicators.forEach(s => s.setColor('#ff5555'));

      this.cameras.main.shake(140, 0.006);

      this.time.delayedCall(600, () => {
        this.resetSequence();
      });
    }
  }

  private closeModal() {
    this.soundManager.playInteraction();
    this.scene.stop();
    this.scene.resume('Level1Scene');
  }
}
