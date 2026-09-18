import Phaser from 'phaser';
import { GameState } from '../../state/GameState';
import { SoundManager } from '../../systems/SoundManager';

export class ArtefactBoxModal extends Phaser.Scene {
  private enteredLetters: string = '';
  private displaySlots: Phaser.GameObjects.Text[] = [];
  private slotBoxes: Phaser.GameObjects.Rectangle[] = [];
  private messageText!: Phaser.GameObjects.Text;
  private soundManager!: SoundManager;
  private isSolved: boolean = false;
  private animContainer!: Phaser.GameObjects.Container;

  constructor() {
    super('ArtefactBoxModal');
  }

  create() {
    const { width, height } = this.cameras.main;
    this.soundManager = SoundManager.getInstance();
    this.soundManager.playInteraction();
    this.enteredLetters = '';
    this.isSolved = false;

    // Dim background overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x070402, 0.88);
    overlay.setInteractive();

    this.animContainer = this.add.container(width / 2, height / 2);

    // Stone / antique brass housing
    const panel = this.add.rectangle(0, 0, 480, 520, 0x1f140b, 0.96);
    panel.setStrokeStyle(3, 0xd49b3d, 0.9);
    this.animContainer.add(panel);

    // Decorative inner border
    const innerBorder = this.add.rectangle(0, 0, 456, 496, 0x140c06, 0.7);
    innerBorder.setStrokeStyle(1.5, 0x8b6508, 0.6);
    this.animContainer.add(innerBorder);

    // Title
    const subtitle = this.add.text(0, -215, 'ROOM COMPARTMENT', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#d4b182',
      letterSpacing: 2
    }).setOrigin(0.5);

    const title = this.add.text(0, -185, '🔒 SECRET ROOM LOCKER', {
      fontFamily: 'Cinzel, serif',
      fontSize: '22px',
      color: '#ffd07b',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.animContainer.add([subtitle, title]);

    // Box Illustration / Stone Motif
    const boxGlow = this.add.circle(0, -115, 45, 0xd49b3d, 0.15);
    this.tweens.add({
      targets: boxGlow,
      scale: 1.15,
      alpha: 0.3,
      duration: 1200,
      yoyo: true,
      repeat: -1
    });
    const boxIcon = this.add.text(0, -115, '📦', {
      fontSize: '46px'
    }).setOrigin(0.5);
    this.animContainer.add([boxGlow, boxIcon]);

    // Letter slots (4 letters for SHIV)
    this.displaySlots = [];
    this.slotBoxes = [];
    const slotStartX = -120;
    const slotGap = 80;

    for (let i = 0; i < 4; i++) {
      const sx = slotStartX + i * slotGap;
      const box = this.add.rectangle(sx, -35, 62, 62, 0x2b1c11, 0.95);
      box.setStrokeStyle(2, 0xdaa520, 0.8);

      const letterTxt = this.add.text(sx, -35, '-', {
        fontFamily: 'Cinzel, serif',
        fontSize: '34px',
        color: '#ffdd88',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.slotBoxes.push(box);
      this.displaySlots.push(letterTxt);
      this.animContainer.add([box, letterTxt]);
    }

    // Status / feedback message
    this.messageText = this.add.text(0, 20, 'Enter the 4-Letter Word decoded from Morse clues', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#d4b182'
    }).setOrigin(0.5);
    this.animContainer.add(this.messageText);

    // On-screen letter keyboard (A-Z) + Clear / Enter for accessibility & mobile
    this.createVirtualKeyboard();

    // Top-Right Close button
    const closeBtn = this.add.text(215, -225, '✖', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '22px',
      color: '#ffc168'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeModal());
    this.animContainer.add(closeBtn);

    // Physical Keyboard Listener
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
        const key = event.key.toUpperCase();
        if (key >= 'A' && key <= 'Z' && key.length === 1) {
          this.handleLetterInput(key);
        } else if (event.key === 'Backspace') {
          this.handleBackspace();
        } else if (event.key === 'Enter') {
          this.validateCode();
        } else if (event.key === 'Escape') {
          this.closeModal();
        }
      });
    }

    // Smooth entry animation
    this.animContainer.setAlpha(0);
    this.animContainer.setScale(0.96);
    this.tweens.add({
      targets: this.animContainer,
      alpha: 1,
      scale: 1,
      duration: 180,
      ease: 'Power2.easeOut'
    });
  }

  private createVirtualKeyboard() {
    const rows = [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['CLEAR', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'ENTER']
    ];

    const startY = 70;
    const rowGap = 42;
    const keyH = 34;

    rows.forEach((row, rIdx) => {
      const y = startY + rIdx * rowGap;
      const keyW = 38;
      const keyGap = 42;
      const totalRowW = (row.length - 1) * keyGap;
      const startX = -totalRowW / 2;

      row.forEach((keyVal, cIdx) => {
        const isAction = keyVal === 'CLEAR' || keyVal === 'ENTER';
        const w = isAction ? 66 : keyW;
        const x = startX + cIdx * keyGap + (isAction ? (keyVal === 'ENTER' ? 14 : -14) : 0);

        const btnBg = this.add.rectangle(x, y, w, keyH, isAction ? 0x3d2314 : 0x2e1e13, 0.95);
        btnBg.setStrokeStyle(1, 0xd49b3d, 0.6);
        btnBg.setInteractive({ useHandCursor: true });

        const btnTxt = this.add.text(x, y, keyVal, {
          fontFamily: 'Outfit, sans-serif',
          fontSize: isAction ? '11px' : '15px',
          color: isAction ? '#ffd07b' : '#ffffff',
          fontStyle: 'bold'
        }).setOrigin(0.5);

        btnBg.on('pointerover', () => {
          btnBg.setFillStyle(0x5a3820);
          btnBg.setStrokeStyle(1.5, 0xffd07b);
        });

        btnBg.on('pointerout', () => {
          btnBg.setFillStyle(isAction ? 0x3d2314 : 0x2e1e13);
          btnBg.setStrokeStyle(1, 0xd49b3d, 0.6);
        });

        btnBg.on('pointerdown', () => {
          if (keyVal === 'CLEAR') {
            this.handleBackspace();
          } else if (keyVal === 'ENTER') {
            this.validateCode();
          } else {
            this.handleLetterInput(keyVal);
          }
        });

        this.animContainer.add([btnBg, btnTxt]);
      });
    });
  }

  private handleLetterInput(letter: string) {
    if (this.isSolved) return;
    if (this.enteredLetters.length < 4) {
      this.soundManager.playInteraction();
      this.enteredLetters += letter;
      this.updateDisplay();

      if (this.enteredLetters.length === 4) {
        this.time.delayedCall(160, () => this.validateCode());
      }
    }
  }

  private handleBackspace() {
    if (this.isSolved) return;
    this.soundManager.playInteraction();
    this.enteredLetters = this.enteredLetters.slice(0, -1);
    this.updateDisplay();
    this.messageText.setText('Enter the 4-Letter Word decoded from Morse clues').setColor('#d4b182');
  }

  private updateDisplay() {
    for (let i = 0; i < 4; i++) {
      if (i < this.enteredLetters.length) {
        this.displaySlots[i].setText(this.enteredLetters[i]);
      } else {
        this.displaySlots[i].setText('-');
      }
    }
  }

  private validateCode() {
    if (this.isSolved) return;

    if (this.enteredLetters.toUpperCase() === 'SHIV') {
      // Puzzle Solved!
      this.isSolved = true;
      this.soundManager.playPuzzleSuccess();
      this.messageText.setText('✓ CORRECT! THE SECRET LOCKER CLICKS OPEN!').setColor('#4eed94');

      this.displaySlots.forEach(slot => slot.setColor('#4eed94'));
      this.slotBoxes.forEach(box => box.setStrokeStyle(2, 0x4eed94));

      // Celebration & Artefact fusion ceremony
      this.time.delayedCall(500, () => {
        this.soundManager.playItemPickup();
        GameState.addItem('Artefact_Fragment_2');
        GameState.combineArtefacts();
        GameState.setLevel3Field('boxUnlocked', true);

        // Notify parent level scene
        const lvl3 = this.scene.get('Level3Scene');
        if (lvl3) {
          lvl3.events.emit('show-toast', '✨ Both fragments fuse into the Complete Circular Artefact (Level 4 Key)!', 4000);
        }

        this.time.delayedCall(900, () => {
          this.closeModal();
        });
      });
    } else {
      // Incorrect code
      this.soundManager.playInteraction();
      this.messageText.setText('✖ The sacred lock does not budge. Try again!').setColor('#ff6666');
      this.displaySlots.forEach(slot => slot.setColor('#ff6666'));
      this.slotBoxes.forEach(box => box.setStrokeStyle(2, 0xff6666));

      this.cameras.main.shake(140, 0.005);

      this.time.delayedCall(600, () => {
        this.enteredLetters = '';
        this.updateDisplay();
        this.displaySlots.forEach(slot => slot.setColor('#ffdd88'));
        this.slotBoxes.forEach(box => box.setStrokeStyle(2, 0xdaa520, 0.8));
        this.messageText.setText('Enter the 4-Letter Word decoded from Morse clues').setColor('#d4b182');
      });
    }
  }

  private closeModal() {
    this.soundManager.playInteraction();
    this.scene.stop();
    this.scene.resume('Level3Scene');
  }
}
