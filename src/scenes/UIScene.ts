import Phaser from 'phaser';
import { GameState } from '../state/GameState';
import { ITEM_REGISTRY } from '../state/Types';
import { Interactable } from '../components/Interactable';

export class UIScene extends Phaser.Scene {
  private objectiveContainer!: Phaser.GameObjects.Container;
  private objectiveText!: Phaser.GameObjects.Text;
  private asthaContainer!: Phaser.GameObjects.Container;
  private asthaText!: Phaser.GameObjects.Text;
  private asthaBarGraphics!: Phaser.GameObjects.Graphics;
  private inventorySlotsContainer!: Phaser.GameObjects.Container;
  private promptContainer!: Phaser.GameObjects.Container;
  private promptBg!: Phaser.GameObjects.Rectangle;
  private promptText!: Phaser.GameObjects.Text;
  private toastContainer!: Phaser.GameObjects.Container;
  private toastBg!: Phaser.GameObjects.Rectangle;
  private toastText!: Phaser.GameObjects.Text;
  private toastTimer?: Phaser.Time.TimerEvent;
  private unsubscribeGameState?: () => void;
  private currentActiveInteractable: Interactable | null = null;

  constructor() {
    super('UIScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    // 1. Astha HUD (Level 2)
    this.createAsthaHUD();

    // 2. Top Objective HUD
    this.createObjectiveHUD(width);

    // 3. Bottom Inventory Bar
    this.createInventoryHUD(width, height);

    // 4. Interaction Prompt
    this.createInteractionPrompt(width, height);

    // 5. Toast Notification System
    this.createToastSystem(width, height);

    // 6. Controls Helper (Bottom-Left)
    this.createControlsGuide(height);

    // 7. Pause Button HUD (Top-Right)
    this.createPauseButton(width);

    // Subscribe to GameState changes
    this.unsubscribeGameState = GameState.subscribe(() => {
      this.updateHUD();
    });

    // Listen for level scene prompt updates
    this.hookLevelEvents('Level1Scene');
    this.hookLevelEvents('Level2Scene');
    this.hookLevelEvents('Level3Scene');
    this.hookLevelEvents('Level4Scene');

    this.events.once('shutdown', () => {
      this.cleanupHooks('Level1Scene');
      this.cleanupHooks('Level2Scene');
      this.cleanupHooks('Level3Scene');
      this.cleanupHooks('Level4Scene');
      if (this.unsubscribeGameState) {
        this.unsubscribeGameState();
      }
    });

    this.updateHUD();
  }

  private hookLevelEvents(sceneKey: string) {
    const sceneObj = this.scene.get(sceneKey);
    if (sceneObj) {
      sceneObj.events.on('interactable-changed', this.onInteractableChanged, this);
      sceneObj.events.on('show-toast', this.onShowToast, this);
      sceneObj.events.on('astha-gained', this.onAsthaGained, this);
    }
  }

  private cleanupHooks(sceneKey: string) {
    const sceneObj = this.scene.get(sceneKey);
    if (sceneObj) {
      sceneObj.events.off('interactable-changed', this.onInteractableChanged, this);
      sceneObj.events.off('show-toast', this.onShowToast, this);
      sceneObj.events.off('astha-gained', this.onAsthaGained, this);
    }
  }

  private onInteractableChanged(interactable: Interactable | null) {
    this.setInteractionPrompt(interactable);
  }

  private onShowToast(message: string, duration?: number) {
    this.showToast(message, duration);
  }

  private onAsthaGained() {
    this.pulseAsthaHUD();
  }

  private createAsthaHUD() {
    this.asthaContainer = this.add.container(125, 34);

    const bg = this.add.rectangle(0, 0, 190, 44, 0x18100a, 0.92);
    bg.setStrokeStyle(1.5, 0xd49b3d, 0.85);

    const icon = this.add.text(-75, 0, '🪔', {
      fontSize: '20px'
    }).setOrigin(0.5);

    const label = this.add.text(-50, -8, 'ASTHA', {
      fontFamily: 'Cinzel, serif',
      fontSize: '11px',
      color: '#ffc168',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0, 0.5);

    this.asthaText = this.add.text(-50, 10, `${GameState.astha} / ${GameState.maxAstha}`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    this.asthaBarGraphics = this.add.graphics();

    this.asthaContainer.add([bg, icon, label, this.asthaText, this.asthaBarGraphics]);
    this.renderAsthaBar();
  }

  private renderAsthaBar() {
    this.asthaBarGraphics.clear();
    const ratio = Math.min(1, Math.max(0, GameState.astha / GameState.maxAstha));
    const barX = 25;
    const barY = -4;
    const barW = 55;
    const barH = 8;

    // Track
    this.asthaBarGraphics.fillStyle(0x3a2414, 0.9);
    this.asthaBarGraphics.fillRoundedRect(barX, barY, barW, barH, 2);

    // Fill
    if (ratio > 0) {
      this.asthaBarGraphics.fillStyle(0xf5c369, 1);
      this.asthaBarGraphics.fillRoundedRect(barX, barY, barW * ratio, barH, 2);
    }
  }

  public pulseAsthaHUD() {
    if (!this.asthaContainer) return;
    this.tweens.add({
      targets: this.asthaContainer,
      scaleX: 1.12,
      scaleY: 1.12,
      duration: 180,
      yoyo: true,
      ease: 'Back.easeOut'
    });
  }

  private createObjectiveHUD(width: number) {
    this.objectiveContainer = this.add.container(width / 2, 34);

    // Backdrop (sized to 520 for clean side-by-side with Astha & Compass)
    const bg = this.add.rectangle(0, 0, 520, 44, 0x18100a, 0.88);
    bg.setStrokeStyle(1.5, 0xd49b3d, 0.7);

    const icon = this.add.text(-235, 0, '🕉️', {
      fontSize: '18px'
    }).setOrigin(0.5);

    const titlePrefix = this.add.text(-210, 0, 'GOAL:', {
      fontFamily: 'Cinzel, serif',
      fontSize: '13px',
      color: '#ffc168',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    this.objectiveText = this.add.text(-155, 0, GameState.objective, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0, 0.5);

    this.objectiveContainer.add([bg, icon, titlePrefix, this.objectiveText]);
  }

  private createInventoryHUD(width: number, height: number) {
    this.inventorySlotsContainer = this.add.container(width / 2, height - 42);

    const bgWidth = 380;
    const bg = this.add.rectangle(0, 0, bgWidth, 54, 0x140d07, 0.92);
    bg.setStrokeStyle(1.5, 0xd49b3d, 0.65);
    this.inventorySlotsContainer.add(bg);

    const invTitle = this.add.text(-bgWidth / 2 + 15, 0, 'ITEMS', {
      fontFamily: 'Cinzel, serif',
      fontSize: '12px',
      color: '#e2a348',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    this.inventorySlotsContainer.add(invTitle);

    this.renderInventoryItems();
  }

  private renderInventoryItems() {
    // Clear previous item slots except background & title
    const childrenToKeep = this.inventorySlotsContainer.list.slice(0, 2);
    this.inventorySlotsContainer.removeAll();
    childrenToKeep.forEach(c => this.inventorySlotsContainer.add(c));

    const maxSlots = 5;
    const startX = -70;
    const slotGap = 52;
    const items = GameState.inventory;

    for (let i = 0; i < maxSlots; i++) {
      const sx = startX + i * slotGap;
      const slotBox = this.add.rectangle(sx, 0, 42, 42, 0x24160d, 0.9);
      slotBox.setStrokeStyle(1, 0x8b6508, 0.5);
      this.inventorySlotsContainer.add(slotBox);

      if (i < items.length) {
        const itemKey = items[i];
        const info = ITEM_REGISTRY[itemKey];

        const itemIcon = this.add.text(sx, 0, info.icon, {
          fontSize: '22px'
        }).setOrigin(0.5);

        // Tooltip on pointer over & inspect on click
        slotBox.setInteractive({ useHandCursor: true });
        slotBox.on('pointerover', () => {
          slotBox.setStrokeStyle(2, 0xffd07b);
          this.showToast(`${info.name}: ${info.description}`, 3000);
        });
        slotBox.on('pointerout', () => {
          slotBox.setStrokeStyle(1, 0x8b6508, 0.5);
        });
        slotBox.on('pointerdown', () => {
          if (this.scene.isActive('Level3Scene')) {
            if (itemKey === 'Completed_Artefact') {
              this.scene.pause('Level3Scene');
              this.scene.launch('Level3CloseupModal', {
                textureKey: 'level3_art_full',
                title: 'Sacred Circular Artefact (Level 4 Key)'
              });
            } else if (itemKey === 'Artefact_Fragment') {
              this.scene.pause('Level3Scene');
              this.scene.launch('Level3CloseupModal', {
                textureKey: 'level3_art_left',
                title: 'Artefact Fragment (Left Half)'
              });
            } else if (itemKey === 'Artefact_Fragment_2') {
              this.scene.pause('Level3Scene');
              this.scene.launch('Level3CloseupModal', {
                textureKey: 'level3_art_right',
                title: 'Artefact Fragment (Right Half)'
              });
            }
          }
        });

        this.inventorySlotsContainer.add(itemIcon);
      } else {
        const emptyDot = this.add.text(sx, 0, '·', {
          fontSize: '18px',
          color: '#553c2a'
        }).setOrigin(0.5);
        this.inventorySlotsContainer.add(emptyDot);
      }
    }
  }

  private createInteractionPrompt(width: number, height: number) {
    this.promptContainer = this.add.container(width / 2, height - 90);
    this.promptContainer.setVisible(false);

    this.promptBg = this.add.rectangle(0, 0, 320, 38, 0x1f140c, 0.96);
    this.promptBg.setStrokeStyle(2, 0xffd07b, 0.9);
    this.promptBg.setInteractive({ useHandCursor: true });

    this.promptBg.on('pointerdown', () => {
      if (this.currentActiveInteractable) {
        this.currentActiveInteractable.onInteract();
      }
    });

    this.promptText = this.add.text(0, 0, '[E] Interact', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: '#ffd07b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.promptContainer.add([this.promptBg, this.promptText]);

    // Floating micro-animation
    this.tweens.add({
      targets: this.promptContainer,
      y: height - 95,
      duration: 750,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  public setInteractionPrompt(interactable: Interactable | null) {
    this.currentActiveInteractable = interactable;
    if (!interactable) {
      this.promptContainer.setVisible(false);
      return;
    }

    this.promptText.setText(interactable.promptText);
    const textWidth = this.promptText.width;
    this.promptBg.setSize(Math.max(260, textWidth + 50), 38);
    this.promptContainer.setVisible(true);
  }

  private createToastSystem(width: number, height: number) {
    this.toastContainer = this.add.container(width / 2, 85);
    this.toastContainer.setAlpha(0);

    this.toastBg = this.add.rectangle(0, 0, 480, 40, 0x221308, 0.95);
    this.toastBg.setStrokeStyle(1.5, 0xd49b3d, 0.8);

    this.toastText = this.add.text(0, 0, '', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#ffdd88',
      align: 'center'
    }).setOrigin(0.5);

    this.toastContainer.add([this.toastBg, this.toastText]);
  }

  public showToast(message: string, duration = 2500) {
    this.toastText.setText(message);
    const textWidth = this.toastText.width;
    this.toastBg.setSize(Math.max(340, textWidth + 40), 40);

    if (this.toastTimer) {
      this.toastTimer.remove();
    }

    this.tweens.killTweensOf(this.toastContainer);
    this.toastContainer.setAlpha(1);
    this.toastContainer.setScale(1);

    this.toastTimer = this.time.delayedCall(duration, () => {
      this.tweens.add({
        targets: this.toastContainer,
        alpha: 0,
        scale: 0.95,
        duration: 300,
        ease: 'Power2'
      });
    });
  }

  private createControlsGuide(height: number) {
    this.add.text(20, height - 25, 'WASD / Arrows: Move  •  [E]: Interact  •  [ESC]: Pause  •  Click supported', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#9e7b57'
    }).setOrigin(0, 0.5);
  }

  private createPauseButton(width: number) {
    const pauseBtn = this.add.rectangle(width - 55, 34, 86, 44, 0x18100a, 0.92);
    pauseBtn.setStrokeStyle(1.5, 0xd49b3d, 0.85);
    pauseBtn.setInteractive({ useHandCursor: true });

    const pauseIcon = this.add.text(width - 80, 34, '⏸', {
      fontSize: '15px'
    }).setOrigin(0.5);

    const pauseLabel = this.add.text(width - 66, 34, 'PAUSE', {
      fontFamily: 'Cinzel, serif',
      fontSize: '11px',
      color: '#ffc168',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    const triggerPause = () => {
      // Don't open pause if another modal is active
      const modalKeys = [
        'PauseModal', 'NoteModal', 'KeypadModal', 'MatClueModal',
        'IconPuzzleModal', 'OpendBoxModal', 'Level3CloseupModal',
        'ArtefactBoxModal', 'Level3DoorKeypadModal', 'Level4ImagePuzzleModal'
      ];
      for (const key of modalKeys) {
        if (this.scene.isActive(key)) {
          return;
        }
      }

      // Check which level scene is active
      const levelScenes = ['Level1Scene', 'Level2Scene', 'Level3Scene', 'Level4Scene'];
      for (const lvl of levelScenes) {
        if (this.scene.isActive(lvl)) {
          this.scene.launch('PauseModal', { parentScene: lvl });
          break;
        }
      }
    };

    pauseBtn.on('pointerdown', triggerPause);
    pauseBtn.on('pointerover', () => {
      pauseBtn.setFillStyle(0x352011);
      pauseBtn.setStrokeStyle(2, 0xffd07b);
      pauseLabel.setColor('#ffffff');
    });
    pauseBtn.on('pointerout', () => {
      pauseBtn.setFillStyle(0x18100a);
      pauseBtn.setStrokeStyle(1.5, 0xd49b3d, 0.85);
      pauseLabel.setColor('#ffc168');
    });

    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ESC', triggerPause);
      this.input.keyboard.on('keydown-P', triggerPause);
    }
  }

  private updateHUD() {
    const showAstha = GameState.currentLevel === 2 || GameState.currentLevel === 3 || GameState.currentLevel === 4;

    // Toggle Astha HUD visibility
    if (this.asthaContainer) {
      this.asthaContainer.setVisible(showAstha);
      if (showAstha) {
        this.asthaText.setText(`${GameState.astha} / ${GameState.maxAstha}`);
        this.renderAsthaBar();
      }
    }

    // Keep Objective HUD cleanly centered
    if (this.objectiveContainer) {
      this.objectiveContainer.setPosition(this.cameras.main.width / 2, 34);
    }

    if (this.objectiveText) {
      this.objectiveText.setText(GameState.objective);
    }
    this.renderInventoryItems();
  }

  shutdown() {
    if (this.unsubscribeGameState) {
      this.unsubscribeGameState();
    }
  }
}

