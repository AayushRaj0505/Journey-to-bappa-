import Phaser from 'phaser';
import { GameState } from '../../state/GameState';
import { SoundManager } from '../../systems/SoundManager';

export class Level3DoorKeypadModal extends Phaser.Scene {
  private enteredCode: string = '';
  private displayDigits: Phaser.GameObjects.Text[] = [];
  private slotBoxes: Phaser.GameObjects.Rectangle[] = [];
  private messageText!: Phaser.GameObjects.Text;
  private soundManager!: SoundManager;
  private isSolved: boolean = false;
  private animContainer!: Phaser.GameObjects.Container;

  constructor() {
    super('Level3DoorKeypadModal');
  }

  create() {
    const { width, height } = this.cameras.main;
    this.soundManager = SoundManager.getInstance();
    this.soundManager.playInteraction();
    this.enteredCode = '';
    this.isSolved = false;

    // Dark semi-transparent backdrop
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x060402, 0.88);
    overlay.setInteractive();

    this.animContainer = this.add.container(width / 2, height / 2);

    // Modern electronic keypad security housing
    const panel = this.add.rectangle(0, 0, 390, 500, 0x1b130b, 0.96);
    panel.setStrokeStyle(3, 0xd49b3d, 0.9);
    this.animContainer.add(panel);

    const innerPanel = this.add.rectangle(0, 0, 368, 478, 0x100a05, 0.7);
    innerPanel.setStrokeStyle(1.5, 0x8b6508, 0.5);
    this.animContainer.add(innerPanel);

    // Title
    const subtitle = this.add.text(0, -215, 'SECURITY ACCESS TERMINAL', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#d4b182',
      letterSpacing: 2
    }).setOrigin(0.5);

    const title = this.add.text(0, -185, '🚪 EXIT DOOR KEYPAD', {
      fontFamily: 'Cinzel, serif',
      fontSize: '20px',
      color: '#ffd07b',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.animContainer.add([subtitle, title]);

    // Digital Screen Box
    const displayBg = this.add.rectangle(0, -125, 290, 56, 0x090603, 1);
    displayBg.setStrokeStyle(2, 0xdaa520, 0.7);
    this.animContainer.add(displayBg);

    // 4 Digit Slots
    this.displayDigits = [];
    this.slotBoxes = [];
    const slotStartX = -90;
    const slotGap = 60;

    for (let i = 0; i < 4; i++) {
      const sx = slotStartX + i * slotGap;
      const slotBox = this.add.rectangle(sx, -125, 48, 44, 0x1f140c, 0.9);
      slotBox.setStrokeStyle(1, 0x8b6508, 0.6);

      const digitTxt = this.add.text(sx, -125, '-', {
        fontFamily: 'Courier, monospace',
        fontSize: '28px',
        color: '#ffdd88',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.slotBoxes.push(slotBox);
      this.displayDigits.push(digitTxt);
      this.animContainer.add([slotBox, digitTxt]);
    }

    // Feedback message
    this.messageText = this.add.text(0, -75, 'Enter 4-Digit Door Code', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#d4b182'
    }).setOrigin(0.5);
    this.animContainer.add(this.messageText);

    // Keypad Grid: 1-9, CLEAR, 0, ENTER
    const buttons = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['CLEAR', '0', 'ENTER']
    ];

    const startX = -85;
    const startY = -25;
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
          fontSize: isAction ? '12px' : '22px',
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

        this.animContainer.add([btnBg, btnTxt]);
      });
    });

    // Close button
    const closeBtn = this.add.text(170, -220, '✖', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '22px',
      color: '#ffc168'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeModal());
    this.animContainer.add(closeBtn);

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

    // Modal fade-in
    this.animContainer.setAlpha(0);
    this.animContainer.setScale(0.96);
    this.tweens.add({
      targets: this.animContainer,
      alpha: 1,
      scale: 1,
      duration: 160,
      ease: 'Power2.easeOut'
    });
  }

  private handleInput(key: string) {
    if (this.isSolved) return;

    if (key === 'CLEAR') {
      this.soundManager.playKeypadBeep();
      this.enteredCode = '';
      this.updateDisplay();
      this.messageText.setText('Enter 4-Digit Door Code').setColor('#d4b182');
      return;
    }

    if (key === 'ENTER') {
      this.validateCode();
      return;
    }

    if (this.enteredCode.length < 4) {
      this.soundManager.playKeypadBeep();
      this.enteredCode += key;
      this.updateDisplay();

      if (this.enteredCode.length === 4) {
        this.time.delayedCall(160, () => this.validateCode());
      }
    }
  }

  private updateDisplay() {
    for (let i = 0; i < 4; i++) {
      if (i < this.enteredCode.length) {
        this.displayDigits[i].setText(this.enteredCode[i]);
      } else {
        this.displayDigits[i].setText('-');
      }
    }
  }

  private validateCode() {
    if (this.isSolved) return;

    if (this.enteredCode === '9277') {
      // Success!
      this.isSolved = true;
      this.soundManager.playDoorOpen();
      this.soundManager.playPuzzleSuccess();
      this.messageText.setText('✓ ACCESS GRANTED! DOOR UNLOCKED!').setColor('#4eed94');

      this.displayDigits.forEach(d => d.setColor('#4eed94'));
      this.slotBoxes.forEach(b => b.setStrokeStyle(2, 0x4eed94));

      GameState.setLevel3Field('doorUnlocked', true);
      GameState.setLevel3Field('level3Complete', true);

      this.time.delayedCall(700, () => {
        this.scene.stop();
        this.scene.stop('Level3Scene');
        this.scene.stop('UIScene');
        this.scene.start('Level3CompleteScene');
      });
    } else {
      // Incorrect code
      this.soundManager.playKeypadBeep();
      this.messageText.setText('✖ ACCESS DENIED — Check wall portraits').setColor('#ff5555');
      this.displayDigits.forEach(d => d.setColor('#ff5555'));
      this.slotBoxes.forEach(b => b.setStrokeStyle(2, 0xff5555));

      this.cameras.main.shake(140, 0.006);

      this.time.delayedCall(600, () => {
        this.enteredCode = '';
        this.updateDisplay();
        this.displayDigits.forEach(d => d.setColor('#ffdd88'));
        this.slotBoxes.forEach(b => b.setStrokeStyle(1, 0x8b6508, 0.6));
        this.messageText.setText('Enter 4-Digit Door Code').setColor('#d4b182');
      });
    }
  }

  private closeModal() {
    this.soundManager.playInteraction();
    this.scene.stop();
    this.scene.resume('Level3Scene');
  }
}
