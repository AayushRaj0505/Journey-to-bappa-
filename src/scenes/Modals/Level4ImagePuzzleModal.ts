import Phaser from 'phaser';
import { GameState } from '../../state/GameState';
import { SoundManager } from '../../systems/SoundManager';

interface PuzzleOption {
  id: string;
  textureKey: string;
}

export class Level4ImagePuzzleModal extends Phaser.Scene {
  private selectedSequence: string[] = [];
  private slotContainers: Phaser.GameObjects.Container[] = [];
  private slotImages: (Phaser.GameObjects.Image | null)[] = [null, null, null, null];
  private slotBoxes: Phaser.GameObjects.Rectangle[] = [];
  private feedbackText!: Phaser.GameObjects.Text;
  private soundManager!: SoundManager;
  private isSolved: boolean = false;
  private animContainer!: Phaser.GameObjects.Container;
  private buttonBackgrounds: Map<string, Phaser.GameObjects.Rectangle> = new Map();

  // The 8 available pure image options
  private readonly OPTIONS: PuzzleOption[] = [
    { id: 'elephant', textureKey: 'icon_elephant' },
    { id: 'diya', textureKey: 'icon_diya' },
    { id: 'trident', textureKey: 'icon_trident' },
    { id: 'temple', textureKey: 'icon_temple' },
    { id: 'flower', textureKey: 'icon_flower' },
    { id: 'mushak', textureKey: 'icon_mushak' },
    { id: 'bell', textureKey: 'icon_bell' },
    { id: 'lotus', textureKey: 'icon_lotus' }
  ];

  // The mandatory correct sequence: ELEPHANT -> DIYA -> TRIDENT -> TEMPLE
  private readonly CORRECT_SEQUENCE = ['elephant', 'diya', 'trident', 'temple'];

  constructor() {
    super('Level4ImagePuzzleModal');
  }

  create() {
    const { width, height } = this.cameras.main;
    this.soundManager = SoundManager.getInstance();
    this.soundManager.playInteraction();
    this.selectedSequence = [];
    this.isSolved = false;
    this.slotImages = [null, null, null, null];
    this.buttonBackgrounds.clear();

    // 1. Dark semi-transparent background overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x050201, 0.9);
    overlay.setInteractive();

    // 2. Main modal container (compact 600 x 510 to fit cleanly inside 768px height)
    this.animContainer = this.add.container(width / 2, height / 2);

    // Frame backdrop
    const modalW = 600;
    const modalH = 505;
    const panel = this.add.rectangle(0, 0, modalW, modalH, 0x180f08, 0.98);
    panel.setStrokeStyle(3, 0xd49b3d, 0.95);
    this.animContainer.add(panel);

    // Inner decorative border
    const innerBorder = this.add.rectangle(0, 0, modalW - 20, modalH - 20, 0x110904, 0.9);
    innerBorder.setStrokeStyle(1.5, 0x8b6508, 0.7);
    this.animContainer.add(innerBorder);

    // 3. Header Titles
    const title = this.add.text(0, -215, '🕉️ SACRED IMAGE MECHANISM', {
      fontFamily: 'Cinzel, serif',
      fontSize: '22px',
      color: '#ffd07b',
      fontStyle: 'bold',
      stroke: '#3b1c06',
      strokeThickness: 2
    }).setOrigin(0.5);

    const subtitle = this.add.text(0, -185, 'Enter the 4 sacred symbols in the divine order of your journey', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      color: '#d4b182'
    }).setOrigin(0.5);

    // Hint banner plaque
    const hintBg = this.add.rectangle(0, -152, 480, 28, 0x22140b, 0.85);
    hintBg.setStrokeStyle(1, 0xd49b3d, 0.5);
    const hintText = this.add.text(0, -152, '📜 “The light has shown me the way. Remember what you have seen.”', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#ffe5b4',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    this.animContainer.add([title, subtitle, hintBg, hintText]);

    // 4. Selected Sequence Sockets (4 slots)
    this.createSequenceSlots();

    // 5. Status / Feedback Message
    this.feedbackText = this.add.text(0, -32, 'Tap the sacred symbols below in order', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      color: '#e4c499',
      align: 'center'
    }).setOrigin(0.5);
    this.animContainer.add(this.feedbackText);

    // 6. 8 Pure Image Buttons (2 rows of 4) — No text labels on buttons
    this.createImageButtons();

    // 7. Action Buttons (Undo & Reset)
    this.createActionButtons();

    // 8. Close button (Top-Right)
    const closeBtn = this.add.text(modalW / 2 - 32, -modalH / 2 + 28, '✖', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '22px',
      color: '#ffc168'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => this.closeModal());
    closeBtn.on('pointerover', () => closeBtn.setColor('#ffffff'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#ffc168'));
    this.animContainer.add(closeBtn);

    // Keyboard ESC to close
    if (this.input.keyboard) {
      this.input.keyboard.once('keydown-ESC', () => {
        if (!this.isSolved) this.closeModal();
      });
    }

    // Modal Entrance Animation
    this.animContainer.setAlpha(0);
    this.animContainer.setScale(0.96);
    this.tweens.add({
      targets: this.animContainer,
      alpha: 1,
      scale: 1,
      duration: 200,
      ease: 'Power2.easeOut'
    });
  }

  private createSequenceSlots() {
    this.slotContainers = [];
    this.slotBoxes = [];
    const slotCount = 4;
    const boxW = 68;
    const boxH = 68;
    const spacing = 18;
    const startX = -((slotCount - 1) * (boxW + spacing)) / 2;
    const slotY = -92;

    for (let i = 0; i < slotCount; i++) {
      const sx = startX + i * (boxW + spacing);
      const slotCont = this.add.container(sx, slotY);

      // Slot background
      const box = this.add.rectangle(0, 0, boxW, boxH, 0x221309, 0.95);
      box.setStrokeStyle(2, 0xd49b3d, 0.7);
      slotCont.add(box);
      this.slotBoxes.push(box);

      // Slot number label
      const num = this.add.text(0, 0, `${i + 1}`, {
        fontFamily: 'Cinzel, serif',
        fontSize: '18px',
        color: '#6e4c2b',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      slotCont.add(num);

      this.animContainer.add(slotCont);
      this.slotContainers.push(slotCont);
    }
  }

  private createImageButtons() {
    // 8 options placed in 2 rows of 4
    const cols = 4;
    const btnSize = 78;
    const gapX = 18;
    const gapY = 16;
    const startX = -((cols - 1) * (btnSize + gapX)) / 2;
    const startY = 32;

    this.OPTIONS.forEach((opt, idx) => {
      const c = idx % cols;
      const r = Math.floor(idx / cols);
      const bx = startX + c * (btnSize + gapX);
      const by = startY + r * (btnSize + gapY);

      const btnContainer = this.add.container(bx, by);

      // Button background tile
      const btnBg = this.add.rectangle(0, 0, btnSize, btnSize, 0x2b180d, 0.95);
      btnBg.setStrokeStyle(2, 0xd49b3d, 0.8);
      btnBg.setInteractive({ useHandCursor: true });
      this.buttonBackgrounds.set(opt.id, btnBg);

      // Pure Image Icon (60x60) — NO written text on buttons
      const iconImg = this.add.image(0, 0, opt.textureKey);
      iconImg.setDisplaySize(60, 60);

      // Interactive hover & press effects
      btnBg.on('pointerover', () => {
        if (this.isSolved) return;
        btnBg.setFillStyle(0x4a2a16);
        btnBg.setStrokeStyle(2.5, 0xffd07b);
        btnContainer.setScale(1.05);
      });

      btnBg.on('pointerout', () => {
        if (this.isSolved) return;
        btnBg.setFillStyle(0x2b180d);
        btnBg.setStrokeStyle(2, 0xd49b3d, 0.8);
        btnContainer.setScale(1);
      });

      btnBg.on('pointerdown', () => {
        this.selectOption(opt.id);
      });

      btnContainer.add([btnBg, iconImg]);
      this.animContainer.add(btnContainer);
    });
  }

  private createActionButtons() {
    const actionY = 188;

    // 1. Undo Button
    const undoBtn = this.add.rectangle(-85, actionY, 130, 36, 0x331e11, 0.95);
    undoBtn.setStrokeStyle(1.5, 0xd49b3d, 0.7);
    undoBtn.setInteractive({ useHandCursor: true });

    const undoTxt = this.add.text(-85, actionY, '↩ UNDO', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      color: '#ffc168',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    undoBtn.on('pointerdown', () => this.undoSelection());
    undoBtn.on('pointerover', () => {
      undoBtn.setFillStyle(0x4d2e1a);
      undoBtn.setStrokeStyle(2, 0xffd07b);
    });
    undoBtn.on('pointerout', () => {
      undoBtn.setFillStyle(0x331e11);
      undoBtn.setStrokeStyle(1.5, 0xd49b3d, 0.7);
    });

    // 2. Reset Button
    const resetBtn = this.add.rectangle(85, actionY, 130, 36, 0x331e11, 0.95);
    resetBtn.setStrokeStyle(1.5, 0xd49b3d, 0.7);
    resetBtn.setInteractive({ useHandCursor: true });

    const resetTxt = this.add.text(85, actionY, '⟲ RESET', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      color: '#ffc168',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    resetBtn.on('pointerdown', () => this.resetSelections());
    resetBtn.on('pointerover', () => {
      resetBtn.setFillStyle(0x4d2e1a);
      resetBtn.setStrokeStyle(2, 0xffd07b);
    });
    resetBtn.on('pointerout', () => {
      resetBtn.setFillStyle(0x331e11);
      resetBtn.setStrokeStyle(1.5, 0xd49b3d, 0.7);
    });

    this.animContainer.add([undoBtn, undoTxt, resetBtn, resetTxt]);
  }

  private selectOption(optId: string) {
    if (this.isSolved) return;
    if (this.selectedSequence.length >= 4) return;

    this.soundManager.playKeypadBeep();
    const slotIdx = this.selectedSequence.length;
    this.selectedSequence.push(optId);

    // Display icon cleanly fitted inside slot box (no overflow)
    const opt = this.OPTIONS.find(o => o.id === optId);
    if (opt) {
      const slotCont = this.slotContainers[slotIdx];
      const iconImg = this.add.image(0, 0, opt.textureKey);
      
      // Target display size is 52x52 to cleanly fit inside 68x68 box with 8px margin
      // 128x128 texture scaled to 52px -> scale = 52 / 128 = 0.40625
      const targetScale = 52 / 128;
      iconImg.setScale(0);
      slotCont.add(iconImg);
      this.slotImages[slotIdx] = iconImg;

      // Pop-in tween to targetScale (fixes the overflow bug!)
      this.tweens.add({
        targets: iconImg,
        scale: targetScale,
        duration: 150,
        ease: 'Back.easeOut'
      });
      this.slotBoxes[slotIdx].setStrokeStyle(2, 0xffd07b, 1);
      this.slotBoxes[slotIdx].setFillStyle(0x2f1b0e, 0.95);
    }

    // Check if 4 choices made
    if (this.selectedSequence.length === 4) {
      this.time.delayedCall(220, () => this.validateSequence());
    }
  }

  private undoSelection() {
    if (this.isSolved || this.selectedSequence.length === 0) return;

    this.soundManager.playInteraction();
    const lastIdx = this.selectedSequence.length - 1;
    this.selectedSequence.pop();

    const img = this.slotImages[lastIdx];
    if (img) {
      img.destroy();
      this.slotImages[lastIdx] = null;
    }
    this.slotBoxes[lastIdx].setStrokeStyle(2, 0xd49b3d, 0.7);
    this.slotBoxes[lastIdx].setFillStyle(0x221309, 0.95);
    this.feedbackText.setText('Tap the sacred symbols below in order').setColor('#e4c499');
  }

  private resetSelections() {
    if (this.isSolved) return;

    this.soundManager.playInteraction();
    this.selectedSequence = [];
    for (let i = 0; i < 4; i++) {
      const img = this.slotImages[i];
      if (img) {
        img.destroy();
        this.slotImages[i] = null;
      }
      this.slotBoxes[i].setStrokeStyle(2, 0xd49b3d, 0.7);
      this.slotBoxes[i].setFillStyle(0x221309, 0.95);
    }
    this.feedbackText.setText('Tap the sacred symbols below in order').setColor('#e4c499');
  }

  private validateSequence() {
    if (this.isSolved) return;

    const isCorrect = this.selectedSequence.every(
      (val, idx) => val === this.CORRECT_SEQUENCE[idx]
    );

    if (isCorrect) {
      // SUCCESS!
      this.isSolved = true;
      this.soundManager.playPuzzleSuccess();
      this.feedbackText.setText('✓ THE SACRED MECHANISM AWAKENS!').setColor('#4eed94');

      // Highlight all slots with emerald glow
      this.slotBoxes.forEach(box => {
        box.setStrokeStyle(3, 0x4eed94, 1);
        box.setFillStyle(0x16331e, 0.95);
      });

      // Update game state
      GameState.setLevel4Field('imagePuzzleSolved', true);
      GameState.setLevel4Field('finalDoorOpened', true);

      // Notify parent Level4Scene and smoothly close modal
      const lvl4 = this.scene.get('Level4Scene') as any;
      if (lvl4 && lvl4.onPuzzleSuccess) {
        lvl4.onPuzzleSuccess();
      }

      this.time.delayedCall(1200, () => {
        this.closeModal();
      });
    } else {
      // INCORRECT — gentle feedback, no penalty
      this.soundManager.playKeypadBeep();
      this.feedbackText.setText("That doesn't seem to be the way.").setColor('#ff7080');

      // Shake animation
      this.cameras.main.shake(160, 0.006);

      this.slotBoxes.forEach(box => {
        box.setStrokeStyle(2, 0xff5566, 1);
      });

      // Auto-clear after brief pause so player can retry immediately
      this.time.delayedCall(750, () => {
        if (!this.isSolved) {
          this.resetSelections();
        }
      });
    }
  }

  private closeModal() {
    this.soundManager.playInteraction();
    this.scene.stop();
    this.scene.resume('Level4Scene');
  }
}
