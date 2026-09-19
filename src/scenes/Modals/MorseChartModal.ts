import Phaser from 'phaser';
import { SoundManager } from '../../systems/SoundManager';

export class MorseChartModal extends Phaser.Scene {
  private soundManager!: SoundManager;

  // Complete International Morse Code Reference (A-Z & 0-9)
  private readonly MORSE_LETTERS: { char: string; code: string }[] = [
    { char: 'A', code: '• —' },
    { char: 'B', code: '— • • •' },
    { char: 'C', code: '— • — •' },
    { char: 'D', code: '— • •' },
    { char: 'E', code: '•' },
    { char: 'F', code: '• • — •' },
    { char: 'G', code: '— — •' },
    { char: 'H', code: '• • • •' },
    { char: 'I', code: '• •' },
    { char: 'J', code: '• — — —' },
    { char: 'K', code: '— • —' },
    { char: 'L', code: '• — • •' },
    { char: 'M', code: '— —' },
    { char: 'N', code: '— •' },
    { char: 'O', code: '— — —' },
    { char: 'P', code: '• — — •' },
    { char: 'Q', code: '— — • —' },
    { char: 'R', code: '• — •' },
    { char: 'S', code: '• • •' },
    { char: 'T', code: '—' },
    { char: 'U', code: '• • —' },
    { char: 'V', code: '• • • —' },
    { char: 'W', code: '• — —' },
    { char: 'X', code: '— • • —' },
    { char: 'Y', code: '— • — —' },
    { char: 'Z', code: '— — • •' }
  ];

  private readonly MORSE_NUMBERS: { char: string; code: string }[] = [
    { char: '0', code: '— — — — —' },
    { char: '1', code: '• — — — —' },
    { char: '2', code: '• • — — —' },
    { char: '3', code: '• • • — —' },
    { char: '4', code: '• • • • —' },
    { char: '5', code: '• • • • •' },
    { char: '6', code: '— • • • •' },
    { char: '7', code: '— — • • •' },
    { char: '8', code: '— — — • •' },
    { char: '9', code: '— — — — •' }
  ];

  constructor() {
    super('MorseChartModal');
  }

  create() {
    const { width, height } = this.cameras.main;
    this.soundManager = SoundManager.getInstance();
    this.soundManager.playInteraction();

    // Dark semi-transparent backdrop - click anywhere to close
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x050302, 0.9);
    overlay.setInteractive();
    overlay.on('pointerdown', () => this.closeModal());

    const container = this.add.container(width / 2, height / 2);

    // Main antique brass / leather chart housing (760 x 580)
    const modalW = 760;
    const modalH = 580;
    const panel = this.add.rectangle(0, 0, modalW, modalH, 0x1b1209, 0.98);
    panel.setStrokeStyle(3, 0xd49b3d, 0.95);
    panel.setInteractive(); // Stop clicks from penetrating to overlay
    container.add(panel);

    const innerPanel = this.add.rectangle(0, 0, modalW - 20, modalH - 20, 0x120a05, 0.9);
    innerPanel.setStrokeStyle(1.5, 0x8b6508, 0.65);
    container.add(innerPanel);

    // Header Title
    const title = this.add.text(0, -250, '📻  INTERNATIONAL MORSE CODE DECODER  📻', {
      fontFamily: 'Cinzel, serif',
      fontSize: '20px',
      color: '#ffd07b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const subtitle = this.add.text(0, -222, 'Reference Manual for Telegrams & Acoustic Signals (• = Dot, — = Dash)', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      color: '#d4b182'
    }).setOrigin(0.5);

    // Close button (Top-Right)
    const closeBtn = this.add.text(modalW / 2 - 30, -modalH / 2 + 28, '✖', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '22px',
      color: '#ffc168'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => this.closeModal());
    closeBtn.on('pointerover', () => closeBtn.setColor('#ffffff'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#ffc168'));

    container.add([title, subtitle, closeBtn]);

    // Render Letters in 3 Columns (9, 9, 8)
    const colCount = 3;
    const itemsPerCol = 9;
    const startX = -320;
    const colWidth = 215;
    const startY = -185;
    const rowHeight = 33;

    this.MORSE_LETTERS.forEach((item, idx) => {
      const col = Math.floor(idx / itemsPerCol);
      const row = idx % itemsPerCol;
      const x = startX + col * colWidth;
      const y = startY + row * rowHeight;

      const cellBg = this.add.rectangle(x + 95, y, 198, 28, 0x1f140b, 0.95);
      cellBg.setStrokeStyle(1, 0x5a3c24, 0.6);

      const charText = this.add.text(x + 16, y, item.char, {
        fontFamily: 'Cinzel, serif',
        fontSize: '15px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      const codeText = this.add.text(x + 55, y, item.code, {
        fontFamily: 'Courier New, monospace',
        fontSize: '15px',
        color: '#e4c499',
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);

      container.add([cellBg, charText, codeText]);
    });

    // Render Numbers section along bottom
    const numY = 142;
    const numHeader = this.add.text(0, numY - 20, '— NUMERALS (0–9) —', {
      fontFamily: 'Cinzel, serif',
      fontSize: '13px',
      color: '#d4b182',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(numHeader);

    const numStartX = -305;
    const numColWidth = 125;
    this.MORSE_NUMBERS.forEach((item, idx) => {
      const col = idx % 5;
      const row = Math.floor(idx / 5);
      const x = numStartX + col * numColWidth;
      const y = numY + 8 + row * 28;

      const cellBg = this.add.rectangle(x + 50, y, 115, 24, 0x1f140b, 0.9);
      cellBg.setStrokeStyle(1, 0x5a3c24, 0.5);

      const charText = this.add.text(x + 10, y, item.char, {
        fontFamily: 'Cinzel, serif',
        fontSize: '13px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      const codeText = this.add.text(x + 32, y, item.code, {
        fontFamily: 'Courier New, monospace',
        fontSize: '12px',
        color: '#e4c499',
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);

      container.add([cellBg, charText, codeText]);
    });

    // Close Action Button: [ RETURN TO ROOM ]
    const closeBtnBg = this.add.rectangle(0, 240, 240, 38, 0x6b3f1b, 1);
    closeBtnBg.setStrokeStyle(2, 0xffd07b, 0.95);
    closeBtnBg.setInteractive({ useHandCursor: true });

    const closeBtnTxt = this.add.text(0, 240, 'RETURN TO ROOM', {
      fontFamily: 'Cinzel, serif',
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    closeBtnBg.on('pointerdown', () => this.closeModal());
    closeBtnBg.on('pointerover', () => {
      this.soundManager.playButtonHover();
      closeBtnBg.setFillStyle(0x8a5223);
      closeBtnBg.setStrokeStyle(2, 0xfff0b8);
    });
    closeBtnBg.on('pointerout', () => {
      closeBtnBg.setFillStyle(0x6b3f1b);
      closeBtnBg.setStrokeStyle(2, 0xffd07b, 0.95);
    });

    container.add([closeBtnBg, closeBtnTxt]);

    // Keyboard Shortcuts
    if (this.input.keyboard) {
      this.input.keyboard.once('keydown-E', () => this.closeModal());
      this.input.keyboard.once('keydown-ESC', () => this.closeModal());
      this.input.keyboard.once('keydown-SPACE', () => this.closeModal());
    }

    // Entrance Animation
    container.setAlpha(0);
    container.setScale(0.96);
    this.tweens.add({
      targets: container,
      alpha: 1,
      scale: 1,
      duration: 180,
      ease: 'Power2.easeOut'
    });
  }

  private closeModal() {
    this.soundManager.playButtonClick();
    if (this.scene.isPaused('Level3Scene')) {
      this.scene.resume('Level3Scene');
    }
    this.scene.stop('MorseChartModal');
  }
}
