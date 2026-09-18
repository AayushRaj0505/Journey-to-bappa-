import Phaser from 'phaser';
import { GameState } from '../../state/GameState';
import { SoundManager } from '../../systems/SoundManager';

export class KeypadModal extends Phaser.Scene {
  private enteredCode: string = '';
  private displayDigits: Phaser.GameObjects.Text[] = [];
  private messageText!: Phaser.GameObjects.Text;
  private soundManager!: SoundManager;
  private isSolved: boolean = false;

  constructor() {
    super('KeypadModal');
  }

  create() {
    const { width, height } = this.cameras.main;
    this.soundManager = SoundManager.getInstance();
    this.soundManager.playInteraction();
    this.enteredCode = '';
    this.isSolved = false;

    // Dim background
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75);
    overlay.setInteractive();

    const container = this.add.container(width / 2, height / 2);

    // Keypad housing panel
    const panel = this.add.rectangle(0, 0, 380, 480, 0x24180e, 0.96);
    panel.setStrokeStyle(3, 0xdaa520, 0.85);
    panel.isFilled = true;
    container.add(panel);

    // Title
    const title = this.add.text(0, -205, '🔒 CUPBOARD LOCKER', {
      fontFamily: 'Cinzel, serif',
      fontSize: '20px',
      color: '#ffd07b',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(title);

    // Display box
    const displayBg = this.add.rectangle(0, -145, 280, 60, 0x120c06, 1);
    displayBg.setStrokeStyle(2, 0xb8860b, 0.6);
    container.add(displayBg);

    // 3 Digit Slots
    this.displayDigits = [];
    [-70, 0, 70].forEach((dx) => {
      const slotBox = this.add.rectangle(dx, -145, 55, 48, 0x2c1f14, 0.9);
      slotBox.setStrokeStyle(1, 0x8b6508, 0.5);
      const digitTxt = this.add.text(dx, -145, '-', {
        fontFamily: 'Cinzel, serif',
        fontSize: '32px',
        color: '#ffdd88',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      this.displayDigits.push(digitTxt);
      container.add([slotBox, digitTxt]);
    });

    // Feedback message
    this.messageText = this.add.text(0, -95, 'Enter 3-Digit Code', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: '#d4b182'
    }).setOrigin(0.5);
    container.add(this.messageText);

    // Number Pad Grid (1-9, C, 0, ⮐)
    const buttons = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['CLEAR', '0', 'ENTER']
    ];

    const startX = -85;
    const startY = -45;
    const btnW = 75;
    const btnH = 46;
    const gapX = 85;
    const gapY = 56;

    buttons.forEach((row, rIdx) => {
      row.forEach((val, cIdx) => {
        const bx = startX + cIdx * gapX;
        const by = startY + rIdx * gapY;
        const isAction = val === 'CLEAR' || val === 'ENTER';

        const btnBg = this.add.rectangle(bx, by, btnW, btnH, isAction ? 0x3d2314 : 0x4a2e1b, 0.95);
        btnBg.setStrokeStyle(1.5, 0xd49b3d, 0.65);
        btnBg.setInteractive({ useHandCursor: true });

        const btnTxt = this.add.text(bx, by, val, {
          fontFamily: 'Outfit, sans-serif',
          fontSize: isAction ? '13px' : '22px',
          color: isAction ? '#ffcb6b' : '#ffffff',
          fontStyle: 'bold'
        }).setOrigin(0.5);

        btnBg.on('pointerover', () => {
          btnBg.setFillStyle(0x6b4428);
          btnBg.setStrokeStyle(2, 0xffd07b);
        });

        btnBg.on('pointerout', () => {
          btnBg.setFillStyle(isAction ? 0x3d2314 : 0x4a2e1b);
          btnBg.setStrokeStyle(1.5, 0xd49b3d, 0.65);
        });

        btnBg.on('pointerdown', () => this.handleInput(val));

        container.add([btnBg, btnTxt]);
      });
    });

    // Close button
    const closeBtn = this.add.text(160, -210, '✖', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '22px',
      color: '#ffc168'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeModal());
    container.add(closeBtn);

    // Keyboard support
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
        if (event.key >= '0' && event.key <= '9') {
          this.handleInput(event.key);
        } else if (event.key === 'Backspace') {
          this.handleInput('CLEAR');
        } else if (event.key === 'Enter') {
          this.handleInput('ENTER');
        } else if (event.key === 'Escape') {
          this.closeModal();
        }
      });
    }

    // Modal fade in
    container.setAlpha(0);
    this.tweens.add({
      targets: container,
      alpha: 1,
      duration: 160
    });
  }

  private handleInput(key: string) {
    if (this.isSolved) return;

    if (key === 'CLEAR') {
      this.soundManager.playInteraction();
      this.enteredCode = '';
      this.updateDisplay();
      this.messageText.setText('Enter 3-Digit Code').setColor('#d4b182');
      return;
    }

    if (key === 'ENTER') {
      this.validateCode();
      return;
    }

    // Add digit
    if (this.enteredCode.length < 3) {
      this.soundManager.playInteraction();
      this.enteredCode += key;
      this.updateDisplay();

      // Auto-submit on 3 digits
      if (this.enteredCode.length === 3) {
        this.time.delayedCall(160, () => this.validateCode());
      }
    }
  }

  private updateDisplay() {
    for (let i = 0; i < 3; i++) {
      if (i < this.enteredCode.length) {
        this.displayDigits[i].setText(this.enteredCode[i]);
      } else {
        this.displayDigits[i].setText('-');
      }
    }
  }

  private validateCode() {
    if (this.isSolved) return;

    if (this.enteredCode === '372') {
      // Success!
      this.isSolved = true;
      this.soundManager.playPuzzleSuccess();
      this.messageText.setText('✓ CORRECT CODE! UNLOCKED!').setColor('#4eed94');

      this.displayDigits.forEach(d => d.setColor('#4eed94'));

      this.time.delayedCall(400, () => {
        GameState.addItem('Almirah_Handle');
        GameState.setPuzzleState('lockerUnlocked', true);
        this.soundManager.playItemPickup();
        this.closeModal();
      });
    } else {
      // Failure
      this.soundManager.playInteraction();
      this.messageText.setText('✖ INCORRECT CODE').setColor('#ff5555');
      this.displayDigits.forEach(d => d.setColor('#ff5555'));

      this.cameras.main.shake(120, 0.005);

      this.time.delayedCall(500, () => {
        this.enteredCode = '';
        this.updateDisplay();
        this.displayDigits.forEach(d => d.setColor('#ffdd88'));
        this.messageText.setText('Enter 3-Digit Code').setColor('#d4b182');
      });
    }
  }

  private closeModal() {
    this.soundManager.playInteraction();
    this.scene.stop();
    this.scene.resume('Level1Scene');
  }
}
