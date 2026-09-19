import Phaser from 'phaser';
import { Player } from '../components/Player';
import { Interactable } from '../components/Interactable';
import { InteractionManager } from '../systems/InteractionManager';
import { GameState } from '../state/GameState';
import { SoundManager } from '../systems/SoundManager';

export class Level1Scene extends Phaser.Scene {
  private player!: Player;
  private interactionManager!: InteractionManager;
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private soundManager!: SoundManager;
  private doorObstacle?: Phaser.GameObjects.Rectangle;
  private openedPanelIndicator?: Phaser.GameObjects.Container;
  private isLevelCompleting: boolean = false;

  // Background room dimensions
  private readonly roomWidth = 1466;
  private readonly roomHeight = 1073;

  constructor() {
    super('Level1Scene');
  }

  create() {
    this.isLevelCompleting = false;
    this.soundManager = SoundManager.getInstance();
    this.soundManager.startBGM();

    // 1. World & Camera Bounds
    this.physics.world.setBounds(0, 0, this.roomWidth, this.roomHeight);
    this.cameras.main.setBounds(0, 0, this.roomWidth, this.roomHeight);

    // 2. Room Background Artwork (User uploaded bedroom.png)
    const background = this.add.image(this.roomWidth / 2, this.roomHeight / 2, 'room_floor');
    background.setDisplaySize(this.roomWidth, this.roomHeight);
    background.setDepth(0);

    // 3. Obstacles Static Group
    this.obstacles = this.physics.add.staticGroup();
    this.createCollisionBoundaries();

    // 4. Player Spawn (Open area in bedroom center)
    this.player = new Player(this, 705, 570);
    this.player.setCustomScale(1.75);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // Collide player with all walls and furniture obstacles
    this.physics.add.collider(this.player, this.obstacles);

    // 5. Visual Indicator for Opened Panel
    this.createPanelIndicator();

    // 6. Interaction Manager
    this.interactionManager = new InteractionManager(this);

    // Forward prompt updates to UIScene
    this.interactionManager.onPromptChange((interactable) => {
      this.events.emit('interactable-changed', interactable);
    });

    // Register all interactable objects across the bedroom
    this.setupInteractables();

    // Listen for scene resume to re-evaluate interactable prompts
    this.events.on('resume', () => {
      this.interactionManager.update(this.player.x, this.player.y);
      this.updateVisualState();
    });

    // Initial Welcome Toast
    this.time.delayedCall(400, () => {
      this.events.emit('show-toast', 'Explore your bedroom and find a way to unlock the door!');
    });
  }

  private createCollisionBoundaries() {
    // 1. Outer Boundary Walls
    // Left Wall (x: 0..115)
    const leftWall = this.add.rectangle(55, this.roomHeight / 2, 115, this.roomHeight, 0x000000, 0);
    this.physics.add.existing(leftWall, true);
    this.obstacles.add(leftWall);

    // Right Wall (x: 1380..1466)
    const rightWall = this.add.rectangle(1423, this.roomHeight / 2, 90, this.roomHeight, 0x000000, 0);
    this.physics.add.existing(rightWall, true);
    this.obstacles.add(rightWall);

    // Top Wall Left of Door (x: 0..635, y: 0..205)
    const topWallLeft = this.add.rectangle(317, 102, 635, 205, 0x000000, 0);
    this.physics.add.existing(topWallLeft, true);
    this.obstacles.add(topWallLeft);

    // Top Wall Right of Door (x: 770..1466, y: 0..205)
    const topWallRight = this.add.rectangle(1118, 102, 700, 205, 0x000000, 0);
    this.physics.add.existing(topWallRight, true);
    this.obstacles.add(topWallRight);

    // Bottom Wall Left (x: 0..540, y: 910..1073)
    const botWallLeft = this.add.rectangle(270, 990, 540, 165, 0x000000, 0);
    this.physics.add.existing(botWallLeft, true);
    this.obstacles.add(botWallLeft);

    // Bottom Wall Right (x: 925..1466, y: 910..1073)
    const botWallRight = this.add.rectangle(1195, 990, 540, 165, 0x000000, 0);
    this.physics.add.existing(botWallRight, true);
    this.obstacles.add(botWallRight);

    // Bottom Step Boundary (x: 540..925, y: 960..1073)
    const botStep = this.add.rectangle(732, 1015, 390, 115, 0x000000, 0);
    this.physics.add.existing(botStep, true);
    this.obstacles.add(botStep);

    // 2. Door Obstacle Barrier (centered at top, x: 705, y: 100)
    // Prevents player from passing through door frame until unlocked
    this.doorObstacle = this.add.rectangle(705, 100, 135, 200, 0x000000, 0);
    this.physics.add.existing(this.doorObstacle, true);
    this.obstacles.add(this.doorObstacle);

    // 3. Furniture Collisions
    // Bed & Nightstand (upper left: x: 110..435, y: 205..530)
    const bedObstacle = this.add.rectangle(275, 370, 310, 240, 0x000000, 0);
    this.physics.add.existing(bedObstacle, true);
    this.obstacles.add(bedObstacle);

    // Bedside Drawer (lower left: x: 130..325, y: 700..835)
    const drawerObstacle = this.add.rectangle(225, 770, 185, 110, 0x000000, 0);
    this.physics.add.existing(drawerObstacle, true);
    this.obstacles.add(drawerObstacle);

    // Almirah / Cupboard (upper right of door: x: 860..1060, y: 205..430)
    const cupboardObstacle = this.add.rectangle(960, 320, 190, 210, 0x000000, 0);
    this.physics.add.existing(cupboardObstacle, true);
    this.obstacles.add(cupboardObstacle);

    // Study Desk & Chair (x: 1080..1380, y: 250..440)
    const deskObstacle = this.add.rectangle(1230, 345, 290, 170, 0x000000, 0);
    this.physics.add.existing(deskObstacle, true);
    this.obstacles.add(deskObstacle);

    // 4-Icon Puzzle Chest & Extension Shelf (x: 1085..1365, y: 475..645)
    const chestObstacle = this.add.rectangle(1225, 560, 270, 140, 0x000000, 0);
    this.physics.add.existing(chestObstacle, true);
    this.obstacles.add(chestObstacle);

    // Screwed Panel Box (lower right: x: 1180..1285, y: 655..770)
    const panelObstacle = this.add.rectangle(1232, 715, 100, 90, 0x000000, 0);
    this.physics.add.existing(panelObstacle, true);
    this.obstacles.add(panelObstacle);

    // Bottom Right Plant Pot (x: 1310..1380, y: 720..830)
    const plantRightObstacle = this.add.rectangle(1345, 780, 65, 80, 0x000000, 0);
    this.physics.add.existing(plantRightObstacle, true);
    this.obstacles.add(plantRightObstacle);

    // Middle Left Plant Pot (x: 110..155, y: 600..680)
    const plantLeftObstacle = this.add.rectangle(132, 645, 50, 60, 0x000000, 0);
    this.physics.add.existing(plantLeftObstacle, true);
    this.obstacles.add(plantLeftObstacle);
  }

  private createPanelIndicator() {
    this.openedPanelIndicator = this.add.container(1232, 715);
    this.openedPanelIndicator.setDepth(15);
    this.openedPanelIndicator.setVisible(false);

    const glow = this.add.circle(0, 0, 18, 0x4eed94, 0.4);
    this.tweens.add({
      targets: glow,
      alpha: 0.15,
      scale: 1.25,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    const badge = this.add.circle(0, 0, 9, 0x1a0f07, 0.9);
    badge.setStrokeStyle(1.5, 0x4eed94);
    const check = this.add.text(0, 0, '✓', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      color: '#4eed94'
    }).setOrigin(0.5);

    this.openedPanelIndicator.add([glow, badge, check]);
    this.updateVisualState();
  }

  private setupInteractables() {
    // 1. Parchment Note on Study Table
    this.interactionManager.register(new Interactable({
      id: 'desk_note',
      x: 1180,
      y: 440,
      radius: 95,
      promptText: '[E] Examine Study Note',
      onInteract: () => {
        this.player.freeze();
        this.scene.pause();
        this.scene.launch('NoteModal');
      }
    }));

    // 2. Bedside Carpet (Symbol sequence clue)
    this.interactionManager.register(new Interactable({
      id: 'bed_mat',
      x: 300,
      y: 605,
      radius: 110,
      promptText: '[E] Inspect Carpet Pattern',
      onInteract: () => {
        this.player.freeze();
        this.scene.pause();
        this.scene.launch('MatClueModal');
      }
    }));

    // 3. Cupboard Locker Keypad (Enter 372 -> Almirah Handle)
    this.interactionManager.register(new Interactable({
      id: 'cupboard_locker',
      x: 910,
      y: 440,
      radius: 90,
      promptText: '[E] Cupboard Keypad',
      onInteract: () => {
        if (!GameState.isPuzzleSolved('lockerUnlocked')) {
          this.player.freeze();
          this.scene.pause();
          this.scene.launch('KeypadModal');
        } else {
          this.soundManager.playButtonClick();
          this.events.emit('show-toast', 'The locker is open. You already obtained the Almirah Handle!');
        }
      }
    }));

    // 4. Almirah Upper Doors (Requires Handle)
    this.interactionManager.register(new Interactable({
      id: 'almirah_doors',
      x: 980,
      y: 440,
      radius: 90,
      promptText: '[E] Almirah Doors',
      onInteract: () => {
        if (!GameState.isPuzzleSolved('almirahOpened')) {
          if (GameState.hasItem('Almirah_Handle')) {
            this.soundManager.playCupboardOpen();
            GameState.setPuzzleState('almirahOpened', true);
            this.events.emit('show-toast', 'Attached the handle and unlocked the almirah! Inside is a clue for the puzzle chest!');
          } else {
            this.soundManager.playButtonClick();
            this.events.emit('show-toast', 'The almirah doors are locked tight. A brass handle is missing.');
          }
        } else {
          this.soundManager.playButtonClick();
          this.events.emit('show-toast', 'The almirah is unlocked. Notice the 4 sacred symbols on the puzzle chest!');
        }
      }
    }));

    // 5. 4-Icon Puzzle Chest (Symbol dials -> Key 1)
    this.interactionManager.register(new Interactable({
      id: 'puzzle_chest',
      x: 1185,
      y: 600,
      radius: 95,
      promptText: '[E] 4-Icon Puzzle Chest',
      onInteract: () => {
        if (!GameState.isPuzzleSolved('boxUnlocked')) {
          this.player.freeze();
          this.scene.pause();
          this.scene.launch('IconPuzzleModal');
        } else {
          this.soundManager.playButtonClick();
          this.events.emit('show-toast', 'The puzzle chest is open. You already retrieved Key 1!');
        }
      }
    }));

    // 6. Bedside Drawer (Requires Key 1 -> Screwdriver)
    this.interactionManager.register(new Interactable({
      id: 'bedside_drawer',
      x: 230,
      y: 715,
      radius: 95,
      promptText: '[E] Bedside Drawer',
      onInteract: () => {
        if (!GameState.isPuzzleSolved('drawerUnlocked')) {
          if (GameState.hasItem('Key_1')) {
            this.soundManager.playDrawerOpen();
            GameState.setPuzzleState('drawerUnlocked', true);
            GameState.addItem('Screwdriver');
            this.soundManager.playItemPickup();
            this.events.emit('show-toast', 'Unlocked drawer with Key 1! Found a Screwdriver!');
          } else {
            this.soundManager.playButtonClick();
            this.events.emit('show-toast', 'The bedside drawer is locked with a brass keyhole. Find Key 1.');
          }
        } else {
          this.soundManager.playButtonClick();
          this.events.emit('show-toast', 'The drawer is open. You already took the Screwdriver.');
        }
      }
    }));

    // 7. Screwed Panel Box (Requires Screwdriver -> Bedroom Door Key & Artefact Fragment)
    this.interactionManager.register(new Interactable({
      id: 'screwed_panel',
      x: 1210,
      y: 715,
      radius: 95,
      promptText: '[E] Screwed Panel Box',
      onInteract: () => {
        if (!GameState.isPuzzleSolved('panelOpened')) {
          if (GameState.hasItem('Screwdriver')) {
            this.soundManager.playPuzzleSuccess();
            GameState.setPuzzleState('panelOpened', true);
            GameState.addItem('Bedroom_Door_Key');
            GameState.addItem('Artefact_Fragment');
            this.updateVisualState();
            this.events.emit('show-toast', 'Unscrewed the box! Found Bedroom Door Key & 1st Artefact Fragment!');
          } else {
            this.soundManager.playButtonClick();
            this.events.emit('show-toast', 'A wooden box tightly secured with 4 screws. You need a tool to open it.');
          }
        } else {
          this.soundManager.playButtonClick();
          this.events.emit('show-toast', 'The box is opened. You already collected the Bedroom Door Key and Artefact Fragment.');
        }
      }
    }));

    // 8. Bedroom Door (Requires Bedroom Door Key -> Complete Level)
    this.interactionManager.register(new Interactable({
      id: 'bedroom_door',
      x: 705,
      y: 235,
      radius: 100,
      promptText: '[E] Bedroom Door',
      onInteract: () => {
        if (!GameState.isPuzzleSolved('doorUnlocked')) {
          if (GameState.hasItem('Bedroom_Door_Key')) {
            this.soundManager.playDoorOpen();
            GameState.setPuzzleState('doorUnlocked', true);
            this.events.emit('show-toast', 'Door unlocked! Stepping through into the hallway...');

            // Destroy door barrier obstacle so player can step through
            if (this.doorObstacle) {
              this.doorObstacle.destroy();
            }

            this.time.delayedCall(700, () => {
              this.completeLevel();
            });
          } else {
            this.soundManager.playButtonClick();
            this.events.emit('show-toast', 'The bedroom door is locked. Find the key to escape!');
          }
        } else {
          this.completeLevel();
        }
      }
    }));

    // 9. Bed & Lamp (Atmospheric / Lore Interaction)
    this.interactionManager.register(new Interactable({
      id: 'bed_lore',
      x: 440,
      y: 370,
      radius: 85,
      promptText: '[E] Inspect Bed',
      onInteract: () => {
        this.soundManager.playButtonClick();
        this.events.emit('show-toast', 'Your cozy bed. Under the quilt you made a vow to reach Bappa’s sanctum tonight.');
      }
    }));

    // 10. Study Desk & Lantern
    this.interactionManager.register(new Interactable({
      id: 'study_desk_lore',
      x: 1280,
      y: 440,
      radius: 85,
      promptText: '[E] Inspect Desk',
      onInteract: () => {
        this.soundManager.playButtonClick();
        this.events.emit('show-toast', 'A glowing brass lantern and prayer scriptures. The calendar above notes Ganesh Chaturthi.');
      }
    }));

    // 11. Ganesh Chaturthi Calendar
    this.interactionManager.register(new Interactable({
      id: 'calendar_lore',
      x: 1305,
      y: 300,
      radius: 85,
      promptText: '[E] View Calendar',
      onInteract: () => {
        this.soundManager.playButtonClick();
        this.events.emit('show-toast', 'Calendar: “Ganesh Chaturthi — May the Remover of Obstacles bless your journey.”');
      }
    }));

    // 12. Ganesha Wall Painting
    this.interactionManager.register(new Interactable({
      id: 'ganesha_mural',
      x: 260,
      y: 270,
      radius: 85,
      promptText: '[E] Sacred Mural',
      onInteract: () => {
        this.soundManager.playButtonClick();
        this.events.emit('show-toast', '॥ गणपति बाप्पा ॥ The divine portrait radiates a warm, comforting light.');
      }
    }));

    // 13. Bottom Ganesha Rug
    this.interactionManager.register(new Interactable({
      id: 'bottom_rug',
      x: 705,
      y: 835,
      radius: 85,
      promptText: '[E] Sacred Rug',
      onInteract: () => {
        this.soundManager.playButtonClick();
        this.events.emit('show-toast', 'A rich red rug woven with the emblem of Lord Ganesha. Standing here fills you with courage.');
      }
    }));
  }

  private updateVisualState() {
    if (this.openedPanelIndicator) {
      this.openedPanelIndicator.setVisible(GameState.isPuzzleSolved('panelOpened'));
    }
  }

  private completeLevel() {
    if (this.isLevelCompleting) return;
    this.isLevelCompleting = true;
    this.player.freeze();
    this.scene.stop('UIScene');
    this.scene.stop('Level1Scene');
    this.scene.start('LevelCompleteScene');
  }

  update(time: number, delta: number) {
    if (this.player && !this.isLevelCompleting) {
      this.player.update(time, delta);
      this.interactionManager.update(this.player.x, this.player.y);

      // If door is unlocked and player steps through doorway threshold (y < 210)
      if (GameState.isPuzzleSolved('doorUnlocked') && this.player.y < 210) {
        this.completeLevel();
      }
    }
  }

  destroy() {
    this.interactionManager.destroy();
  }
}
