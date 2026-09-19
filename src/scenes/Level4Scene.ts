import Phaser from 'phaser';
import { Player } from '../components/Player';
import { Interactable } from '../components/Interactable';
import { InteractionManager } from '../systems/InteractionManager';
import { GameState } from '../state/GameState';
import { SoundManager } from '../systems/SoundManager';

export class Level4Scene extends Phaser.Scene {
  private player!: Player;
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private interactionManager!: InteractionManager;
  private soundManager!: SoundManager;
  private eKey!: Phaser.Input.Keyboard.Key;
  private spaceKey!: Phaser.Input.Keyboard.Key;

  // Central Pedestal visuals
  private pedestalGlow?: Phaser.GameObjects.Arc;
  private placedArtefactSprite?: Phaser.GameObjects.Image;
  private pedestalInteractable?: Interactable;
  private isInsertingArtefact: boolean = false;

  // Sanctum light portal visuals
  private sanctumBeam?: Phaser.GameObjects.Rectangle;
  private sanctumHalo?: Phaser.GameObjects.Arc;
  private sanctumEmbers: Phaser.GameObjects.Arc[] = [];
  private isTransitioningToEnd: boolean = false;

  constructor() {
    super('Level4Scene');
  }

  create() {
    this.soundManager = SoundManager.getInstance();
    this.isInsertingArtefact = false;
    this.isTransitioningToEnd = false;
    this.sanctumEmbers = [];

    const worldW = 1312;
    const worldH = 1199;

    // 1. World & Physics Bounds
    this.physics.world.setBounds(0, 0, worldW, worldH);

    // 2. Temple Room Background
    const bg = this.add.image(worldW / 2, worldH / 2, 'level4_room');
    bg.setOrigin(0.5, 0.5);
    bg.setDepth(0);

    // 3. Collision Geometry
    this.createColliders(worldW, worldH);

    // 4. Player Setup (Spawns at bottom entrance walkway)
    this.player = new Player(this, 656, 1100);
    this.player.setCarryingDiya(false);
    this.player.facing = 'up';
    this.player.setDepth(20);

    // Collide player with walls/obstacles
    this.physics.add.collider(this.player, this.obstacles);

    // Camera follow with smooth lerp
    this.cameras.main.resetFX();
    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.centerOn(this.player.x, this.player.y);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // 5. Interaction Manager
    this.interactionManager = new InteractionManager(this);
    this.interactionManager.onPromptChange((interactable: Interactable | null) => {
      this.events.emit('interactable-changed', interactable);
    });

    // 6. Interactive Temple Objects
    this.createInteractables();

    // 7. Ambient Temple Lighting & Particles
    this.createAmbientAtmosphere(worldW, worldH);

    // 8. Keyboard Input
    if (this.input.keyboard) {
      this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    // 9. Audio: Start peaceful BGM
    this.soundManager.startBGM();

    // 10. Check if already solved (on resume/debug)
    if (GameState.level4State.finalDoorOpened) {
      this.activateSanctumPortal(false);
    }

    // Welcome toast notification
    this.time.delayedCall(450, () => {
      this.events.emit('show-toast', 'Welcome to the Sacred Temple. Peace and blessings fill the air.', 4000);
    });

    // Ensure UI is active
    if (!this.scene.isActive('UIScene')) {
      this.scene.launch('UIScene');
    }

    // Re-evaluate interactables on resume
    this.events.on('resume', () => {
      this.interactionManager.update(this.player.x, this.player.y);
    });

    // Clean up on shutdown
    this.events.once('shutdown', () => {
      this.interactionManager.destroy();
    });
  }

  private createColliders(_worldW: number, _worldH: number) {
    this.obstacles = this.physics.add.staticGroup();

    const addBox = (x: number, y: number, w: number, h: number) => {
      const zone = this.add.zone(x + w / 2, y + h / 2, w, h);
      this.physics.add.existing(zone, true);
      this.obstacles.add(zone);
    };

    // Left outer wall
    addBox(0, 0, 160, 1199);

    // Right outer wall
    addBox(1152, 0, 160, 1199);

    // Top outer wall (shrine back wall)
    addBox(160, 0, 992, 195);

    // Top shrine left & right wings
    addBox(160, 195, 320, 110);
    addBox(832, 195, 320, 110);

    // Bottom left room wall
    addBox(160, 890, 360, 309);

    // Bottom right room wall
    addBox(792, 890, 360, 309);

    // Walkway side railings
    addBox(500, 940, 25, 259);
    addBox(787, 940, 25, 259);

    // Central pedestal base collider (expanded so player cannot walk over artefact slot)
    addBox(606, 490, 100, 60);

    // Lord Ganesha idol solid base collider (prevents walking/climbing on idol)
    addBox(606, 195, 100, 50);
  }

  private createInteractables() {
    // 1. CENTRAL PEDESTAL (Sacred Artefact Slot & Image Mechanism)
    const px = 656;
    const py = 518;

    // If artefact was already placed previously
    if (GameState.level4State.artefactPlaced) {
      this.renderPlacedArtefact(px, py);
    }

    this.pedestalInteractable = new Interactable({
      id: 'central_pedestal',
      x: px,
      y: py + 20,
      radius: 85,
      promptText: GameState.level4State.artefactPlaced 
        ? '[E] Sacred Image Mechanism' 
        : '[E] Central Pedestal: Sacred Artefact Slot',
      onInteract: () => this.handlePedestalInteraction()
    });
    this.interactionManager.register(this.pedestalInteractable);

    // 2. LORD GANESHA IDOL (Final Astha Quest & The Sacred Journey Mystery)
    this.interactionManager.register(new Interactable({
      id: 'ganesha_shrine',
      x: 656,
      y: 250,
      radius: 85,
      promptText: '[E] Pray before Lord Ganesha\'s Idol',
      onInteract: () => this.handleIdolPrayer()
    }));

    // 3. SACRED TEMPLE DIYAS ALTAR (Diya Clue)
    this.interactionManager.register(new Interactable({
      id: 'temple_diyas',
      x: 520,
      y: 260,
      radius: 70,
      promptText: '[E] Examine Temple Diyas',
      onInteract: () => {
        this.soundManager.playInteraction();
        GameState.setLevel4Field('diyaAltarExamined', true);
        this.events.emit(
          'show-toast',
          '🪔 Sacred Diyas: The golden flames that guided you through the dark maze, turning fear into faith.',
          4000
        );
      }
    }));

    // 4. TRISHULA EMBLEM / BANNER (Trident Clue)
    this.interactionManager.register(new Interactable({
      id: 'trident_banner',
      x: 395,
      y: 200,
      radius: 70,
      promptText: '[E] Inspect Trishula Carving',
      onInteract: () => {
        this.soundManager.playInteraction();
        GameState.setLevel4Field('tridentBannerExamined', true);
        this.events.emit(
          'show-toast',
          '🔱 Trishula Emblem: The sacred trident of divine strength, focus, and purity.',
          4000
        );
      }
    }));

    // 5. INNER MANDIR SANCTUM (Temple Clue)
    this.interactionManager.register(new Interactable({
      id: 'mandir_sanctum',
      x: 915,
      y: 200,
      radius: 70,
      promptText: '[E] View Mandir Architecture',
      onInteract: () => {
        this.soundManager.playInteraction();
        this.events.emit(
          'show-toast',
          '🛕 Holy Mandir: The sacred temple sanctuary where your long search finally finds peace.',
          4000
        );
      }
    }));

    // 6. INSCRIBED STONE PLAQUE (Subtle hint for the image sequence)
    this.interactionManager.register(new Interactable({
      id: 'inscribed_plaque',
      x: 656,
      y: 690,
      radius: 70,
      promptText: '[E] Read Inscribed Floor Plaque',
      onInteract: () => {
        this.soundManager.playInteraction();
        GameState.setLevel4Field('plaqueExamined', true);
        this.events.emit(
          'show-toast',
          '📜 Plaque: “The light has shown me the way. Remember what you have seen.”',
          4500
        );
      }
    }));

    // 7. TEMPLE BELLS
    this.interactionManager.register(new Interactable({
      id: 'temple_bell_left',
      x: 310,
      y: 180,
      radius: 65,
      promptText: '[E] Ring Temple Bell',
      onInteract: () => {
        this.soundManager.playInteraction();
        GameState.setLevel4Field('templeBellExamined', true);
        this.events.emit(
          'show-toast',
          '🔔 A sweet brass chime resonates throughout the sacred sanctuary.',
          3000
        );
      }
    }));

    // 8. LOTUS MANDALA FLOOR
    this.interactionManager.register(new Interactable({
      id: 'lotus_mandala',
      x: 520,
      y: 540,
      radius: 65,
      promptText: '[E] Observe Lotus Mandala',
      onInteract: () => {
        this.soundManager.playInteraction();
        this.events.emit(
          'show-toast',
          '🪷 Lotus Mandala: The blooming petals signify devotion, purity, and spiritual awakening.',
          3500
        );
      }
    }));
  }

  private handlePedestalInteraction() {
    if (this.isInsertingArtefact) return;

    // Case 1: Artefact NOT yet placed
    if (!GameState.level4State.artefactPlaced) {
      if (GameState.hasItem('Completed_Artefact')) {
        // Player possesses the completed artefact — trigger placement sequence!
        this.triggerArtefactInsertion();
      } else {
        // Missing key
        this.soundManager.playInteraction();
        this.events.emit('show-toast', 'Something is missing... The slot requires the Completed Artefact.', 3500);
      }
      return;
    }

    // Case 2: Artefact placed, image puzzle NOT yet solved
    if (!GameState.level4State.imagePuzzleSolved) {
      this.openImagePuzzleModal();
      return;
    }

    // Case 3: Already solved
    this.soundManager.playInteraction();
    this.events.emit('show-toast', 'The mechanism is active and aligned. Step into the sanctum light!', 3500);
  }

  private handleIdolPrayer() {
    if (GameState.level4State.idolPrayed) {
      this.events.emit(
        'show-toast',
        '✨ You have offered your prayers before Bappa\'s idol. Your pilgrimage through all realms guides your steps.',
        4000
      );
      return;
    }

    // Mark idol prayed & shrine examined
    GameState.setLevel4Field('idolPrayed', true);
    GameState.setLevel4Field('shrineExamined', true);

    // Grant 50 Astha (50 carried from Level 3 + 50 = 100/100 Total Astha)
    GameState.addAstha(50);

    // Unlock Hint 4
    GameState.unlockHint(4);

    // Audio
    this.soundManager.playAsthaIncrease();
    this.soundManager.playPuzzleSuccess();

    // Floating sanctum sparkles
    for (let i = 0; i < 18; i++) {
      const sparkle = this.add.circle(
        656 + Phaser.Math.Between(-40, 40),
        235 + Phaser.Math.Between(-35, 35),
        Phaser.Math.Between(2, 6),
        0xfff0a0,
        1
      );
      sparkle.setDepth(30);
      this.tweens.add({
        targets: sparkle,
        y: sparkle.y - Phaser.Math.Between(40, 80),
        x: sparkle.x + Phaser.Math.Between(-25, 25),
        alpha: 0,
        scale: 0.2,
        duration: Phaser.Math.Between(800, 1400),
        ease: 'Cubic.easeOut',
        onComplete: () => sparkle.destroy()
      });
    }

    this.events.emit(
      'show-toast',
      '✨ Divine Illumination! (+50 Astha, 100/100 Total) Full Pilgrimage sequence revealed for 5 seconds!',
      4500
    );

    // Launch DivineHintModal showing newly unlocked Hint 4 and full journey revelation
    this.time.delayedCall(400, () => {
      this.scene.pause();
      this.scene.launch('DivineHintModal', { newHintIndex: 4, returnScene: 'Level4Scene' });
    });
  }

  private triggerArtefactInsertion() {
    this.isInsertingArtefact = true;
    this.player.freeze();
    this.soundManager.playDoorOpen();

    const px = 656;
    const py = 518;

    // 1. Render glowing artefact sprite starting elevated above pedestal
    this.placedArtefactSprite = this.add.image(px, py - 35, 'item_artifact_complete');
    this.placedArtefactSprite.setDisplaySize(140, 132);
    this.placedArtefactSprite.setAlpha(0);
    this.placedArtefactSprite.setDepth(15);

    // 2. Expanding golden burst
    const burst = this.add.circle(px, py, 20, 0xffd07b, 0.8);
    burst.setDepth(14);

    this.tweens.add({
      targets: burst,
      scale: 3,
      alpha: 0,
      duration: 700,
      ease: 'Power2.easeOut',
      onComplete: () => burst.destroy()
    });

    // 3. Artefact aligns, rotates 360, and descends directly into the circular pedestal slot (74 x 70 px)
    this.tweens.add({
      targets: this.placedArtefactSprite,
      alpha: 1,
      y: py,
      displayWidth: 74,
      displayHeight: 70,
      angle: 360,
      duration: 1000,
      ease: 'Cubic.easeInOut',
      onComplete: () => {
        // Soft lock-in breathing glow
        this.tweens.add({
          targets: this.placedArtefactSprite,
          scaleX: (74 / 1243) * 1.06,
          scaleY: (70 / 1173) * 1.06,
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        // Update Game State
        GameState.removeItem('Completed_Artefact');
        GameState.setLevel4Field('artefactPlaced', true);
        GameState.setLevel4Field('mechanismActivated', true);

        if (this.pedestalInteractable) {
          this.pedestalInteractable.promptText = '[E] Sacred Image Mechanism';
        }

        this.soundManager.playPuzzleSuccess();
        this.events.emit('show-toast', '✨ The Sacred Artefact locks into the pedestal! The mechanism awakens.', 3500);

        this.time.delayedCall(700, () => {
          this.isInsertingArtefact = false;
          this.openImagePuzzleModal();
        });
      }
    });
  }

  private renderPlacedArtefact(x: number, y: number) {
    if (!this.placedArtefactSprite) {
      this.placedArtefactSprite = this.add.image(x, y, 'item_artifact_complete');
      this.placedArtefactSprite.setDisplaySize(74, 70);
      this.placedArtefactSprite.setDepth(15);

      // Gentle subtle breathing glow inside pedestal slot
      this.tweens.add({
        targets: this.placedArtefactSprite,
        scaleX: (74 / 1243) * 1.06,
        scaleY: (70 / 1173) * 1.06,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private openImagePuzzleModal() {
    this.scene.pause();
    this.scene.launch('Level4ImagePuzzleModal');
  }

  public onPuzzleSuccess() {
    this.activateSanctumPortal(true);
  }

  private activateSanctumPortal(withAnimation: boolean) {
    if (this.sanctumBeam) return;

    const sx = 656;
    const sy = 240;

    // 1. Divine golden beam of light pouring down from the sanctum
    this.sanctumBeam = this.add.rectangle(sx, sy - 40, 110, 200, 0xffea9f, 0.4);
    this.sanctumBeam.setDepth(6);

    // Pulsing halo at the shrine threshold
    this.sanctumHalo = this.add.circle(sx, sy, 70, 0xffd07b, 0.45);
    this.sanctumHalo.setDepth(7);

    this.tweens.add({
      targets: this.sanctumHalo,
      scaleX: 1.25,
      scaleY: 1.25,
      alpha: 0.7,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.tweens.add({
      targets: this.sanctumBeam,
      alpha: 0.65,
      scaleX: 1.1,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Floating sanctum embers
    for (let i = 0; i < 8; i++) {
      const ember = this.add.circle(sx + (Math.random() * 80 - 40), sy + (Math.random() * 60 - 30), 3, 0xfff0b8, 0.9);
      ember.setDepth(8);
      this.tweens.add({
        targets: ember,
        y: sy - 120 - Math.random() * 40,
        x: sx + (Math.random() * 100 - 50),
        alpha: 0,
        scale: 0.4,
        duration: 1600 + Math.random() * 800,
        repeat: -1,
        delay: i * 200
      });
      this.sanctumEmbers.push(ember);
    }

    if (withAnimation) {
      this.soundManager.playLevelComplete();
      this.events.emit('show-toast', 'The final sanctuary opens! Step forward into Bappa’s divine light.', 4500);
    }
  }

  private createAmbientAtmosphere(worldW: number, worldH: number) {
    // Gentle golden dust floating throughout the temple
    for (let i = 0; i < 16; i++) {
      const px = Phaser.Math.Between(200, worldW - 200);
      const py = Phaser.Math.Between(250, worldH - 300);
      const ember = this.add.circle(px, py, Phaser.Math.Between(2, 3), 0xffe280, 0.5);
      ember.setDepth(12);

      this.tweens.add({
        targets: ember,
        y: py - Phaser.Math.Between(30, 70),
        x: px + Phaser.Math.Between(-25, 25),
        alpha: { from: 0.2, to: 0.7 },
        duration: Phaser.Math.Between(2500, 4500),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: i * 150
      });
    }
  }

  update(time: number, delta: number) {
    if (this.player && !this.isInsertingArtefact && !this.isTransitioningToEnd) {
      this.player.update(time, delta);
      this.interactionManager.update(this.player.x, this.player.y);

      // Check Ending Area Trigger
      // When final door/sanctum is opened and player steps into the top shrine sanctum (y < 280)
      if (
        GameState.level4State.finalDoorOpened &&
        this.player.y < 280 &&
        this.player.x > 580 &&
        this.player.x < 732
      ) {
        this.triggerGameComplete();
      }
    }
  }

  private triggerGameComplete() {
    this.isTransitioningToEnd = true;
    this.player.freeze();
    this.soundManager.playLevelComplete();
    GameState.setLevel4Field('gameComplete', true);

    // Screen flash to pure golden white
    const { width, height } = this.cameras.main;
    const flash = this.add.rectangle(width / 2, height / 2, width, height, 0xfff6dd, 0);
    flash.setScrollFactor(0);
    flash.setDepth(999);

    this.events.emit('show-toast', '“You have completed the journey.”', 3500);

    this.tweens.add({
      targets: flash,
      alpha: 1,
      duration: 1100,
      ease: 'Power2.easeIn',
      onComplete: () => {
        this.scene.stop('Level4Scene');
        this.scene.stop('UIScene');
        this.scene.start('GameCompleteScene');
      }
    });
  }

  public getPlayer(): Player | undefined {
    return this.player;
  }

  public triggerInteraction(): void {
    if (this.interactionManager) {
      this.interactionManager.interact();
    }
  }

  destroy() {
    this.interactionManager.destroy();
  }
}
