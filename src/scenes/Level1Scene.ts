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
  private screwedPanelSprite!: Phaser.GameObjects.Rectangle;
  private screwedPanelGlow?: Phaser.Tweens.Tween;
  private isLevelCompleting: boolean = false;

  constructor() {
    super('Level1Scene');
  }

  create() {
    this.isLevelCompleting = false;
    this.soundManager = SoundManager.getInstance();
    this.soundManager.startBGM();

    const { width, height } = this.cameras.main;

    // 1. Room Background Shell (scaled to 1024x768)
    const floor = this.add.image(width / 2, height / 2, 'room_floor');
    floor.setDisplaySize(width, height);
    floor.setDepth(0);

    // 2. Obstacles static group
    this.obstacles = this.physics.add.staticGroup();

    // Create room boundary walls with strict collisions matching the visual baseboards
    this.createBoundaries(width, height);

    // 3. Furniture Placement
    this.createFurniture();

    // 4. Player Spawn (open area in bedroom center)
    this.player = new Player(this, 460, 420);

    // Collide player with all walls and furniture obstacles
    this.physics.add.collider(this.player, this.obstacles);

    // 5. Interaction Manager
    this.interactionManager = new InteractionManager(this);

    // Forward prompt updates to UIScene
    this.interactionManager.onPromptChange((interactable) => {
      this.events.emit('interactable-changed', interactable);
    });

    // Register all interactable objects in the bedroom
    this.setupInteractables();

    // Listen for scene resume to re-evaluate interactable prompts
    this.events.on('resume', () => {
      this.interactionManager.update(this.player.x, this.player.y);
      this.updateFurnitureVisuals();
    });

    // Welcome toast notification
    this.time.delayedCall(400, () => {
      this.events.emit('show-toast', 'Explore your bedroom and find a way out!');
    });
  }

  private createBoundaries(width: number, height: number) {
    // Left Wall: baseboard boundary at x = 90
    const leftWall = this.add.rectangle(45, height / 2, 90, height, 0x000000, 0);
    this.physics.add.existing(leftWall, true);
    this.obstacles.add(leftWall);

    // Right Wall: baseboard boundary at x = 934
    const rightWall = this.add.rectangle(979, height / 2, 90, height, 0x000000, 0);
    this.physics.add.existing(rightWall, true);
    this.obstacles.add(rightWall);

    // Bottom Wall: baseboard boundary at y = 705
    const bottomWall = this.add.rectangle(width / 2, 735, width, 66, 0x000000, 0);
    this.physics.add.existing(bottomWall, true);
    this.obstacles.add(bottomWall);

    // Top Wall Left Segment (left of door): spans x=0..445, y=0..196
    const topWallLeft = this.add.rectangle(222, 98, 445, 196, 0x000000, 0);
    this.physics.add.existing(topWallLeft, true);
    this.obstacles.add(topWallLeft);

    // Top Wall Right Segment (right of door): spans x=579..1024, y=0..196
    const topWallRight = this.add.rectangle(801, 98, 445, 196, 0x000000, 0);
    this.physics.add.existing(topWallRight, true);
    this.obstacles.add(topWallRight);

    // Bedroom Door obstacle (centered at top, x: 512, width: 134, y=0..196)
    // Prevents player from passing through door frame until unlocked
    this.doorObstacle = this.add.rectangle(512, 98, 134, 196, 0x000000, 0);
    this.physics.add.existing(this.doorObstacle, true);
    this.obstacles.add(this.doorObstacle);
  }

  private createFurniture() {
    // 1. Bed (upper-left, flush with top-left baseboard)
    const bed = this.add.image(190, 250, 'room_bed');
    bed.setScale(0.135);
    bed.setDepth(200);

    // Bed collision box (protects mattress and headboard)
    const bedObstacle = this.add.rectangle(190, 260, 150, 110, 0x000000, 0);
    this.physics.add.existing(bedObstacle, true);
    this.obstacles.add(bedObstacle);

    // 2. Ornate Mat (beside bed)
    const mat = this.add.image(190, 365, 'room_mat');
    mat.setScale(0.105);
    mat.setDepth(5);

    // 3. Study Table / Desk (upper-right)
    const table = this.add.image(845, 250, 'room_table');
    table.setScale(0.12);
    table.setDepth(190);

    const tableObstacle = this.add.rectangle(845, 255, 145, 100, 0x000000, 0);
    this.physics.add.existing(tableObstacle, true);
    this.obstacles.add(tableObstacle);

    // Parchment note lying visibly on study desk
    const tableNote = this.add.image(830, 230, 'puzzle_note');
    tableNote.setScale(0.028);
    tableNote.setDepth(195);
    tableNote.setAngle(-8);

    // 4. Tall Almirah / Cupboard (top wall right of door)
    const cupboard = this.add.image(665, 225, 'room_cupboard');
    cupboard.setScale(0.13);
    cupboard.setDepth(160);

    const cupboardObstacle = this.add.rectangle(665, 235, 130, 115, 0x000000, 0);
    this.physics.add.existing(cupboardObstacle, true);
    this.obstacles.add(cupboardObstacle);

    // 5. Bedside Locked Drawer (lower-left)
    const drawer = this.add.image(160, 560, 'room_drawer');
    drawer.setScale(0.085);
    drawer.setDepth(540);

    const drawerObstacle = this.add.rectangle(160, 565, 85, 75, 0x000000, 0);
    this.physics.add.existing(drawerObstacle, true);
    this.obstacles.add(drawerObstacle);

    // 6. Screwed Panel on Right Wall (skirting board level)
    this.screwedPanelSprite = this.add.rectangle(926, 510, 22, 46, 0x3d2b1f, 0.9);
    this.screwedPanelSprite.setStrokeStyle(1.5, 0x8a6332);
    this.screwedPanelSprite.setDepth(490);

    // Screws indication
    const screw1 = this.add.circle(926, 495, 2.5, 0xcccccc);
    const screw2 = this.add.circle(926, 525, 2.5, 0xcccccc);
    screw1.setDepth(491);
    screw2.setDepth(491);

    // Decorative gentle pulsing glow on panel
    this.screwedPanelGlow = this.tweens.add({
      targets: this.screwedPanelSprite,
      alpha: 0.6,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private setupInteractables() {
    // 1. Note on Study Desk
    this.interactionManager.register(new Interactable({
      id: 'desk_note',
      x: 830,
      y: 295,
      radius: 75,
      promptText: '[E] Examine Note',
      onInteract: () => {
        this.player.freeze();
        this.scene.pause();
        this.scene.launch('NoteModal');
      }
    }));

    // 2. Bed Mat (Symbol sequence clue)
    this.interactionManager.register(new Interactable({
      id: 'bed_mat',
      x: 190,
      y: 365,
      radius: 75,
      promptText: '[E] Inspect Carpet',
      onInteract: () => {
        this.player.freeze();
        this.scene.pause();
        this.scene.launch('MatClueModal');
      }
    }));

    // 3. Cupboard Locker (Enter 372)
    this.interactionManager.register(new Interactable({
      id: 'cupboard_locker',
      x: 635,
      y: 275,
      radius: 75,
      promptText: '[E] Cupboard Locker',
      onInteract: () => {
        if (!GameState.isPuzzleSolved('lockerUnlocked')) {
          this.player.freeze();
          this.scene.pause();
          this.scene.launch('KeypadModal');
        } else {
          this.events.emit('show-toast', 'The locker is already unlocked. You got the Almirah Handle!');
        }
      }
    }));

    // 4. Almirah Upper Doors (Requires Handle -> Reveals 4-Icon Puzzle Box)
    this.interactionManager.register(new Interactable({
      id: 'almirah_doors',
      x: 685,
      y: 275,
      radius: 75,
      promptText: '[E] Almirah',
      onInteract: () => {
        if (!GameState.isPuzzleSolved('almirahOpened')) {
          if (GameState.hasItem('Almirah_Handle')) {
            // Attach handle and open
            this.soundManager.playCupboardOpen();
            GameState.setPuzzleState('almirahOpened', true);
            this.events.emit('show-toast', 'You attach the handle and open the almirah! Inside is a puzzle box!');
            this.time.delayedCall(700, () => {
              this.player.freeze();
              this.scene.pause();
              this.scene.launch('IconPuzzleModal');
            });
          } else {
            this.soundManager.playInteraction();
            this.events.emit('show-toast', 'The almirah doors are locked tight. A handle is missing.');
          }
        } else {
          // Already opened: open puzzle box modal
          this.player.freeze();
          this.scene.pause();
          this.scene.launch('IconPuzzleModal');
        }
      }
    }));

    // 5. Bedside Drawer (Requires Key 1 -> Screwdriver)
    this.interactionManager.register(new Interactable({
      id: 'bedside_drawer',
      x: 160,
      y: 550,
      radius: 75,
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
            this.soundManager.playInteraction();
            this.events.emit('show-toast', 'The drawer is locked with a brass keyhole.');
          }
        } else {
          this.events.emit('show-toast', 'The drawer is empty. You already took the Screwdriver.');
        }
      }
    }));

    // 6. Screwed Wall Panel (Requires Screwdriver -> Bedroom Door Key + Artefact Fragment)
    this.interactionManager.register(new Interactable({
      id: 'screwed_panel',
      x: 905,
      y: 510,
      radius: 75,
      promptText: '[E] Screwed Wall Panel',
      onInteract: () => {
        if (!GameState.isPuzzleSolved('panelOpened')) {
          if (GameState.hasItem('Screwdriver')) {
            this.soundManager.playInteraction();
            GameState.setPuzzleState('panelOpened', true);
            GameState.addItem('Bedroom_Door_Key');
            GameState.addItem('Artefact_Fragment');
            this.soundManager.playPuzzleSuccess();
            this.events.emit('show-toast', 'Unscrewed panel! Found the Bedroom Door Key & Artefact Fragment!');
            this.screwedPanelSprite.setFillStyle(0x18100a);
          } else {
            this.soundManager.playInteraction();
            this.events.emit('show-toast', 'A metal wall panel secured tightly with screws.');
          }
        } else {
          this.events.emit('show-toast', 'The panel compartment is open and empty.');
        }
      }
    }));

    // 7. Bedroom Door (Requires Bedroom Door Key -> Complete Level)
    this.interactionManager.register(new Interactable({
      id: 'bedroom_door',
      x: 512,
      y: 205,
      radius: 85,
      promptText: '[E] Bedroom Door',
      onInteract: () => {
        if (!GameState.isPuzzleSolved('doorUnlocked')) {
          if (GameState.hasItem('Bedroom_Door_Key')) {
            this.soundManager.playDoorOpen();
            GameState.setPuzzleState('doorUnlocked', true);
            this.events.emit('show-toast', 'Door unlocked! Stepping through...');

            // Remove door obstacle so player can step through
            if (this.doorObstacle) {
              this.doorObstacle.destroy();
            }

            this.time.delayedCall(700, () => {
              if (this.isLevelCompleting) return;
              this.isLevelCompleting = true;
              this.scene.stop('UIScene');
              this.scene.stop('Level1Scene');
              this.scene.start('LevelCompleteScene');
            });
          } else {
            this.soundManager.playInteraction();
            this.events.emit('show-toast', 'The bedroom door is locked. Find the key to escape.');
          }
        } else {
          // Door already open
          if (this.isLevelCompleting) return;
          this.isLevelCompleting = true;
          this.scene.stop('UIScene');
          this.scene.stop('Level1Scene');
          this.scene.start('LevelCompleteScene');
        }
      }
    }));
  }

  private updateFurnitureVisuals() {
    // Update visual appearance based on game state
    if (GameState.isPuzzleSolved('panelOpened')) {
      this.screwedPanelSprite.setFillStyle(0x18100a);
    }
  }

  update(time: number, delta: number) {
    if (this.player && !this.isLevelCompleting) {
      this.player.update(time, delta);
      this.interactionManager.update(this.player.x, this.player.y);

      // If door is unlocked and player steps through door threshold (y < 190)
      if (GameState.isPuzzleSolved('doorUnlocked') && this.player.y < 190) {
        this.isLevelCompleting = true;
        this.player.freeze();
        this.scene.stop('UIScene');
        this.scene.stop('Level1Scene');
        this.scene.start('LevelCompleteScene');
      }
    }
  }

  destroy() {
    this.interactionManager.destroy();
  }
}
