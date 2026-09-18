import Phaser from 'phaser';
import { Player } from '../components/Player';
import { Interactable } from '../components/Interactable';
import { GameState } from '../state/GameState';
import { SoundManager } from '../systems/SoundManager';
import { Level3CloseupData } from './Modals/Level3CloseupModal';

export class Level3Scene extends Phaser.Scene {
  private player!: Player;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private interactables: Interactable[] = [];
  private currentInteractable: Interactable | null = null;
  private soundManager!: SoundManager;
  private eKey!: Phaser.Input.Keyboard.Key;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private examinedObjects: Set<string> = new Set();
  private lockerIcon?: Phaser.GameObjects.Text;
  private lockerGlow?: Phaser.GameObjects.Arc;

  constructor() {
    super('Level3Scene');
  }

  create() {
    this.soundManager = SoundManager.getInstance();
    this.interactables = [];
    this.currentInteractable = null;

    // Set world and physics bounds for 1536 x 1024 living room
    this.physics.world.setBounds(0, 0, 1536, 1024);

    // 1. Living room background
    const bg = this.add.image(1536 / 2, 1024 / 2, 'level3_livingroom');
    bg.setOrigin(0.5, 0.5);
    bg.setDepth(0);

    // 2. Setup collision geometry
    this.createColliders();

    // 3. Setup player at bottom "From Maze" entrance (755, 880)
    this.player = new Player(this, 755, 880);
    this.player.setCarryingDiya(false);
    this.player.facing = 'up';
    this.player.setDepth(15);

    // Reset camera effects and start follow with smooth lerp
    this.cameras.main.resetFX();
    this.cameras.main.setBounds(0, 0, 1536, 1024);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // Collision with static furniture/walls
    this.physics.add.collider(this.player, this.walls);

    // Floating subtle locker indicator above the Secret Locker (at 1190, 265)
    this.lockerGlow = this.add.circle(1190, 265, 15, 0xd49b3d, 0.3);
    this.lockerGlow.setDepth(10);
    this.lockerIcon = this.add.text(1190, 265, '🔒', { fontSize: '18px' }).setOrigin(0.5);
    this.lockerIcon.setDepth(11);
    this.tweens.add({
      targets: [this.lockerGlow, this.lockerIcon],
      y: 257,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 4. Register all interactables
    this.createInteractables();

    // 5. Setup keyboard input
    if (this.input.keyboard) {
      this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    // Start warm background music / ambient
    this.soundManager.startBGM();

    // Welcome toast
    this.time.delayedCall(400, () => {
      this.events.emit('show-toast', 'Welcome to the Living Room. Observe your surroundings carefully.', 3500);
    });

    // Make sure UI scene is running
    if (!this.scene.isActive('UIScene')) {
      this.scene.launch('UIScene');
    }
  }

  private createColliders() {
    this.walls = this.physics.add.staticGroup();

    // Helper to add invisible static collider boxes
    const addBox = (x: number, y: number, w: number, h: number) => {
      const zone = this.add.zone(x + w / 2, y + h / 2, w, h);
      this.physics.add.existing(zone, true);
      this.walls.add(zone);
    };

    // --- Perimeter & Wall Structures ---
    // Top-Left study top wall & bookshelves
    addBox(0, 0, 480, 120);
    // Study divider partition
    addBox(465, 0, 45, 345);
    // North wall (behind paintings & Ganesha console)
    addBox(510, 0, 560, 200);
    // Top-Right cupboard & quote wall
    addBox(1070, 0, 210, 150);
    // Exit door alcove top
    addBox(1280, 0, 256, 260);

    // Left outer wall
    addBox(0, 0, 65, 1024);

    // Right outer wall
    addBox(1460, 260, 76, 320);
    addBox(1380, 580, 156, 220);

    // Bottom outer wall (with doorway corridor at 710 to 800)
    addBox(0, 770, 700, 254);
    addBox(810, 770, 726, 254);
    // Entrance corridor left & right jambs
    addBox(670, 770, 40, 254);
    addBox(800, 770, 40, 254);
    // Bottom entrance limit
    addBox(670, 990, 170, 40);

    // --- Furniture Colliders ---
    // Piano & Bench on left wall
    addBox(65, 510, 80, 190);

    // Dining Table & 4 chairs
    addBox(290, 440, 180, 180);

    // Study Desk & Chair (top-left)
    addBox(180, 150, 130, 100);

    // L-Sofa in Center
    // Horizontal back section
    addBox(590, 360, 270, 90);
    // Vertical left section
    addBox(590, 360, 90, 210);

    // Centre Coffee Table
    addBox(705, 475, 160, 95);

    // Armchair
    addBox(690, 580, 95, 95);

    // TV Partition Wall & Console
    addBox(980, 350, 80, 320);

    // Trophy Cupboard & side table
    addBox(1015, 140, 230, 170);

    // North Console Table under paintings
    addBox(680, 235, 140, 50);

    // Bottom consoles & decorations
    addBox(190, 730, 170, 50);
    addBox(1070, 730, 170, 50);
    addBox(1330, 560, 85, 190);
  }

  private createInteractables() {
    // 1. SOFA (Morse Clue: '...' -> S)
    this.interactables.push(new Interactable({
      id: 'sofa',
      x: 730,
      y: 420,
      radius: 75,
      promptText: '[E] Inspect Sofa Cushion',
      onInteract: () => this.handleSofaInteraction()
    }));

    // 2. PIANO (Morse Clue: '....' -> H)
    this.interactables.push(new Interactable({
      id: 'piano',
      x: 130,
      y: 590,
      radius: 80,
      promptText: '[E] Examine Grand Piano',
      onInteract: () => this.handlePianoInteraction()
    }));

    // 3. STUDY DESK / LAPTOP (Morse Clue: '..' -> I)
    this.interactables.push(new Interactable({
      id: 'laptop',
      x: 240,
      y: 240,
      radius: 75,
      promptText: '[E] Inspect Laptop on Study Desk',
      onInteract: () => this.handleLaptopInteraction()
    }));

    // 4. TROPHY CUPBOARD (Morse Clue: '...-' -> V)
    this.interactables.push(new Interactable({
      id: 'trophy',
      x: 1090,
      y: 250,
      radius: 80,
      promptText: '[E] Inspect Trophy Cabinet',
      onInteract: () => this.handleTrophyInteraction()
    }));

    // 5. CENTRE COFFEE TABLE (Living Room Atmosphere)
    this.interactables.push(new Interactable({
      id: 'coffee_table',
      x: 785,
      y: 520,
      radius: 75,
      promptText: '[E] Examine Coffee Table',
      onInteract: () => this.handleCoffeeTableInteraction()
    }));

    // 6. SECRET ROOM LOCKER (Relic Cabinet under Good Thoughts plaque)
    this.interactables.push(new Interactable({
      id: 'secret_locker',
      x: 1190,
      y: 310,
      radius: 80,
      promptText: '[E] Inspect Secret Locker',
      onInteract: () => this.handleSecretLockerInteraction()
    }));

    // 7. TALL STORAGE LOCKER CUPBOARD (Lower right corridor by plant)
    this.interactables.push(new Interactable({
      id: 'storage_locker',
      x: 1320,
      y: 640,
      radius: 80,
      promptText: '[E] Inspect Storage Cupboard',
      onInteract: () => this.handleStorageLockerInteraction()
    }));

    // 6. WALL PORTRAITS (1 to 4: Morse 9, 2, 7, 7)
    this.interactables.push(new Interactable({
      id: 'painting_1',
      x: 585,
      y: 240,
      radius: 70,
      promptText: '[E] View Portrait: Samuel Morse',
      onInteract: () => this.handlePaintingInteraction(1, 'Samuel Morse', 'level3_painting1')
    }));

    this.interactables.push(new Interactable({
      id: 'painting_2',
      x: 700,
      y: 240,
      radius: 70,
      promptText: '[E] View Portrait: Isaac Newton',
      onInteract: () => this.handlePaintingInteraction(2, 'Isaac Newton', 'level3_painting2')
    }));

    this.interactables.push(new Interactable({
      id: 'painting_3',
      x: 820,
      y: 240,
      radius: 70,
      promptText: '[E] View Portrait: Albert Einstein',
      onInteract: () => this.handlePaintingInteraction(3, 'Albert Einstein', 'level3_painting3')
    }));

    this.interactables.push(new Interactable({
      id: 'painting_4',
      x: 940,
      y: 240,
      radius: 70,
      promptText: '[E] View Portrait: C.V. Raman',
      onInteract: () => this.handlePaintingInteraction(4, 'C.V. Raman', 'level3_painting4')
    }));

    // 7. MAIN EXIT DOOR (Password: 9277)
    this.interactables.push(new Interactable({
      id: 'exit_door',
      x: 1375,
      y: 330,
      radius: 80,
      promptText: '[E] Access Exit Door Keypad',
      onInteract: () => this.handleExitDoorInteraction()
    }));

    // 8. GANESHA SHRINE (Bappa Guidance)
    this.interactables.push(new Interactable({
      id: 'ganesha_shrine_top',
      x: 755,
      y: 250,
      radius: 65,
      promptText: '[E] Pray at Ganesha Shrine',
      onInteract: () => {
        this.soundManager.playAsthaIncrease();
        this.events.emit('show-toast', '🕉️ Bappa\'s whisper: "Look closely. Some messages are hidden in plain sight."', 4000);
      }
    }));

    // 9. TRIDENT FORESHADOWING (Wall Carving)
    this.interactables.push(new Interactable({
      id: 'trident_carving',
      x: 1220,
      y: 750,
      radius: 65,
      promptText: '[E] Inspect Sacred Trishula',
      onInteract: () => {
        this.events.emit('show-toast', '🔱 A quiet Trishula (Trident) motif rests upon the shelf... an ancient calling.', 3500);
      }
    }));
  }

  // --- Interaction Handlers ---

  private handleSofaInteraction() {
    this.examinedObjects.add('sofa');
    GameState.setLevel3Field('sofaExamined', true);
    this.openCloseupModal({
      textureKey: 'level3_sofa',
      title: 'Sofa Cushion'
    });
  }

  private handlePianoInteraction() {
    this.examinedObjects.add('piano');
    GameState.setLevel3Field('pianoExamined', true);
    this.openCloseupModal({
      textureKey: 'level3_piano',
      title: 'Grand Piano'
    });
  }

  private handleLaptopInteraction() {
    this.examinedObjects.add('laptop');
    GameState.setLevel3Field('laptopExamined', true);
    this.openCloseupModal({
      textureKey: 'level3_laptop',
      title: 'Study Desk'
    });
  }

  private handleTrophyInteraction() {
    this.examinedObjects.add('trophy');
    GameState.setLevel3Field('trophyExamined', true);
    this.openCloseupModal({
      textureKey: 'level3_trophy',
      title: 'Trophy Cabinet'
    });
  }

  private handleCoffeeTableInteraction() {
    this.openCloseupModal({
      textureKey: 'level3_sofa',
      title: 'Coffee Table'
    });
  }

  private handleSecretLockerInteraction() {
    const hasCompleted = GameState.hasItem('Completed_Artefact');

    if (hasCompleted) {
      // Inspect the Completed Circular Artefact up close
      this.openCloseupModal({
        textureKey: 'level3_art_full',
        title: 'Sacred Circular Artefact (Level 4 Key)'
      });
      return;
    }

    this.examinedObjects.add('secret_locker');
    // Open Secret Locker Modal (SHIV password)
    this.scene.pause();
    this.scene.launch('ArtefactBoxModal');
  }

  private handleStorageLockerInteraction() {
    const hasCompleted = GameState.hasItem('Completed_Artefact');

    if (hasCompleted) {
      this.openCloseupModal({
        textureKey: 'level3_art_full',
        title: 'Sacred Circular Artefact (Level 4 Key)'
      });
      return;
    }

    this.examinedObjects.add('storage_locker');
    // Open Locker Modal (SHIV password)
    this.scene.pause();
    this.scene.launch('ArtefactBoxModal');
  }

  private handlePaintingInteraction(index: number, name: string, textureKey: string) {
    this.examinedObjects.add(`painting_${index}`);
    const examined = [...GameState.level3State.paintingsExamined] as [boolean, boolean, boolean, boolean];
    examined[index - 1] = true;
    GameState.setLevel3Field('paintingsExamined', examined);

    // Show only the painting close up, no description text
    this.openCloseupModal({
      textureKey: textureKey,
      title: name
    });
  }

  private handleExitDoorInteraction() {
    if (GameState.level3State.doorUnlocked) {
      this.soundManager.playDoorOpen();
      this.scene.stop();
      this.scene.stop('UIScene');
      this.scene.start('Level3CompleteScene');
      return;
    }

    // Open Door Keypad
    this.scene.pause();
    this.scene.launch('Level3DoorKeypadModal');
  }

  private openCloseupModal(data: Level3CloseupData) {
    this.scene.pause();
    this.scene.launch('Level3CloseupModal', data);
  }

  update(time: number, delta: number) {
    this.player.update(time, delta);

    // Find closest interactable in range
    let closest: Interactable | null = null;
    let minDistance = Infinity;

    const hasKey = GameState.hasItem('Completed_Artefact');

    // Dynamically adjust Secret Locker prompts
    const lockerInteractable = this.interactables.find(i => i.id === 'secret_locker');
    if (lockerInteractable) {
      if (hasKey) {
        lockerInteractable.promptText = '[E] Inspect Complete Artefact (Level 4 Key)';
      } else if (GameState.level3State.boxUnlocked) {
        lockerInteractable.promptText = '[E] Secret Locker (Unlocked)';
      } else if (this.examinedObjects.has('secret_locker')) {
        lockerInteractable.promptText = '[E] Unlock Secret Locker';
      } else {
        lockerInteractable.promptText = '[E] Inspect Secret Locker';
      }
    }

    const storageInteractable = this.interactables.find(i => i.id === 'storage_locker');
    if (storageInteractable) {
      if (hasKey) {
        storageInteractable.promptText = '[E] Inspect Complete Artefact (Level 4 Key)';
      } else if (GameState.level3State.boxUnlocked) {
        storageInteractable.promptText = '[E] Storage Locker (Unlocked)';
      } else {
        storageInteractable.promptText = '[E] Unlock Storage Locker';
      }
    }

    // Update locker indicator marker if present
    if (this.lockerIcon && this.lockerGlow) {
      if (hasKey || GameState.level3State.boxUnlocked) {
        this.lockerIcon.setText('✨');
        this.lockerGlow.setFillStyle(0x4eed94, 0.4);
      } else {
        this.lockerIcon.setText('🔒');
        this.lockerGlow.setFillStyle(0xd49b3d, 0.35);
      }
    }

    for (const interactable of this.interactables) {
      if (interactable.isInRange(this.player.x, this.player.y)) {
        const d = interactable.getDistanceTo(this.player.x, this.player.y);
        if (d < minDistance) {
          minDistance = d;
          closest = interactable;
        }
      }
    }

    // Notify UI if interactable changed
    if (closest !== this.currentInteractable) {
      this.currentInteractable = closest;
      this.events.emit('interactable-changed', closest);
    }

    // Check interaction key press [E] or [SPACE]
    if (this.currentInteractable) {
      if (Phaser.Input.Keyboard.JustDown(this.eKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.currentInteractable.onInteract();
      }
    }
  }

  destroy() {
    this.interactables = [];
    this.currentInteractable = null;
  }
}
