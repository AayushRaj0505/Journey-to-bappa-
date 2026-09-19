import Phaser from 'phaser';
import { Player } from '../components/Player';
import { Interactable } from '../components/Interactable';
import { InteractionManager } from '../systems/InteractionManager';
import { GameState } from '../state/GameState';
import { SoundManager } from '../systems/SoundManager';
import { LEVEL2_WALLS } from './Level2Walls';

export class Level2Scene extends Phaser.Scene {
  private player!: Player;
  private interactionManager!: InteractionManager;
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private soundManager!: SoundManager;
  
  // Darkness & Lighting
  private darknessCanvasTexture?: Phaser.Textures.CanvasTexture;
  private darknessImage?: Phaser.GameObjects.Image;
  private lightRadius = 140;
  private diyaPickupSprite?: Phaser.GameObjects.Image;
  private diyaPedestalGlow?: Phaser.GameObjects.Arc;
  private torchLights: { x: number; y: number; radius: number }[] = [];

  // Exit Gateway
  private exitBeaconGlow?: Phaser.GameObjects.Arc;
  private exitBanner?: Phaser.GameObjects.Text;
  private exitParticles: Phaser.GameObjects.Arc[] = [];
  private lastWhisperTime = 0;
  
  // Dynamic Vighna Roaming & Hazard
  private dynamicVighna?: Phaser.GameObjects.Image;
  private dynamicVighnaAura?: Phaser.GameObjects.Arc;
  private isVighnaAttacking = false;
  private isLevelCompleting = false;
  private vighnaPatrolTimer?: Phaser.Time.TimerEvent;
  private readonly VIGHNA_SPAWN_NODES = [
    { x: 744, y: 232 },  // North central corridor
    { x: 1150, y: 160 }, // North east corridor
    { x: 400, y: 200 },  // North west path
    { x: 300, y: 480 },  // West corridor junction
    { x: 248, y: 552 },  // South west corridor
    { x: 600, y: 480 },  // West center corridor
    { x: 900, y: 480 },  // East center corridor
    { x: 1180, y: 480 }, // East corridor
    { x: 1240, y: 728 }, // South east inner corridor
    { x: 1050, y: 880 }  // South corridor right
  ];

  constructor() {
    super('Level2Scene');
  }

  init() {
    this.isVighnaAttacking = false;
    this.isLevelCompleting = false;
    this.torchLights = [];
    this.exitParticles = [];
    this.lastWhisperTime = 0;
    this.lightRadius = 140;
    this.dynamicVighna = undefined;
    this.dynamicVighnaAura = undefined;
    this.diyaPickupSprite = undefined;
    this.diyaPedestalGlow = undefined;
    this.exitBeaconGlow = undefined;
    this.exitBanner = undefined;
    this.darknessCanvasTexture = undefined;
    this.darknessImage = undefined;
  }

  create() {
    this.soundManager = SoundManager.getInstance();
    this.soundManager.startDarkAmbientBGM();

    // Reset all instance state on every start/retry
    this.isVighnaAttacking = false;
    this.torchLights = [];
    this.exitParticles = [];
    this.lightRadius = 140;

    // Ensure GameState is in Level 2
    if (GameState.currentLevel !== 2) {
      GameState.startLevel2();
    }

    const worldWidth = 1536;
    const worldHeight = 1024;

    // 1. World Bounds & Physics Setup
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    // 2. Maze Background Artwork
    const mazeBg = this.add.image(worldWidth / 2, worldHeight / 2, 'maze_background');
    mazeBg.setDisplaySize(worldWidth, worldHeight);
    mazeBg.setDepth(0);

    // 3. Collision Obstacles from Handcrafted Grid
    this.obstacles = this.physics.add.staticGroup();
    this.createMazeColliders();

    // 4. Player Spawn (Bottom Entrance Hallway)
    this.player = new Player(this, 480, 910);
    this.player.setCustomScale(0.52);
    this.player.setDepth(20);
    this.physics.add.collider(this.player, this.obstacles);

    // Reset camera effects and immediately center camera on player
    this.cameras.main.resetFX();
    this.cameras.main.centerOn(this.player.x, this.player.y);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Restore diya status if already carried
    if (GameState.level2State.diyaPickedUp) {
      this.player.setCarryingDiya(true);
    }

    // 5. Interaction Manager
    this.interactionManager = new InteractionManager(this);
    this.interactionManager.onPromptChange((interactable) => {
      this.events.emit('interactable-changed', interactable);
    });

    // 6. Setup Lighting System (CanvasTexture Darkness Mask)
    this.setupLightingSystem(worldWidth, worldHeight);

    // 7. Setup Interactive World Objects
    this.setupDiyaPickup();
    this.setupCornerShrines();
    this.setupExitGateway();

    // Check discovered shrines to restore their lights if any
    this.updateDiscoveredShrineLights();

    // Initial prompt check on resume
    this.events.on('resume', () => {
      this.interactionManager.update(this.player.x, this.player.y);
    });

    // Clean up on shutdown
    this.events.once('shutdown', () => {
      if (this.vighnaPatrolTimer) {
        this.vighnaPatrolTimer.remove();
      }
      this.interactionManager.destroy();
    });

    // 8. Setup Dynamic Vighna Patrol Spawner
    this.time.delayedCall(4000, () => {
      this.spawnOrRelocateVighna();
    });

    this.vighnaPatrolTimer = this.time.addEvent({
      delay: 14000,
      callback: () => {
        this.spawnOrRelocateVighna();
      },
      loop: true
    });

    // Welcome toast notification
    this.time.delayedCall(500, () => {
      if (!GameState.level2State.diyaPickedUp) {
        this.events.emit('show-toast', 'The maze is pitch black. Pick up the sacred Diya [E] to light your way.', 5000);
      }
    });
  }

  private createMazeColliders() {
    for (const wall of LEVEL2_WALLS) {
      // Wall coordinates are top-left, Phaser static rectangle takes center
      const centerX = wall.x + wall.w / 2;
      const centerY = wall.y + wall.h / 2;
      const rect = this.add.rectangle(centerX, centerY, wall.w, wall.h, 0x000000, 0);
      this.physics.add.existing(rect, true);
      this.obstacles.add(rect);
    }
  }

  private setupLightingSystem(_worldW: number, _worldH: number) {
    const { width, height } = this.cameras.main;
    const darknessKey = 'darkness_overlay_texture';

    if (!this.textures.exists(darknessKey)) {
      this.darknessCanvasTexture = this.textures.createCanvas(darknessKey, width, height) as Phaser.Textures.CanvasTexture;
    } else {
      this.darknessCanvasTexture = this.textures.get(darknessKey) as Phaser.Textures.CanvasTexture;
    }

    this.darknessImage = this.add.image(0, 0, darknessKey);
    this.darknessImage.setOrigin(0, 0);
    this.darknessImage.setScrollFactor(0);
    this.darknessImage.setDepth(800);
  }

  private setupDiyaPickup() {
    if (GameState.level2State.diyaPickedUp) return;

    // Stone pedestal with glowing holy Diya at (540, 910)
    const px = 540;
    const py = 910;

    // Pedestal base
    const base = this.add.rectangle(px, py + 10, 24, 14, 0x3d3025);
    base.setStrokeStyle(1.5, 0xd49b3d);
    base.setDepth(5);

    // Warm radiant beacon aura behind diya
    this.diyaPedestalGlow = this.add.circle(px, py - 4, 32, 0xffbb44, 0.35);
    this.tweens.add({
      targets: this.diyaPedestalGlow,
      scaleX: 1.35,
      scaleY: 1.35,
      alpha: 0.55,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Diya item sprite
    this.diyaPickupSprite = this.add.image(px, py - 4, 'diya_pickup');
    this.diyaPickupSprite.setScale(0.38);
    this.diyaPickupSprite.setDepth(6);

    // Hover bobbing
    this.tweens.add({
      targets: this.diyaPickupSprite,
      y: py - 8,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Floating embers rising from the Diya flame
    for (let i = 0; i < 4; i++) {
      const ember = this.add.circle(px + (Math.random() * 12 - 6), py - 6, 2, 0xffe280, 0.9);
      ember.setDepth(7);
      this.tweens.add({
        targets: ember,
        y: py - 26 - Math.random() * 14,
        x: px + (Math.random() * 16 - 8),
        alpha: 0,
        scale: 0.3,
        duration: 1200 + Math.random() * 600,
        repeat: -1,
        delay: i * 300
      });
    }

    // Interaction Zone
    this.interactionManager.register(new Interactable({
      id: 'pickup_diya',
      x: px,
      y: py,
      radius: 70,
      promptText: '[E] Pick up Sacred Diya',
      onInteract: () => {
        this.soundManager.playItemPickup();
        GameState.addItem('Diya');
        GameState.setLevel2Field('diyaPickedUp', true);
        this.player.setCarryingDiya(true);

        // Flash of sacred illumination bursting outward
        const { width, height } = this.cameras.main;
        const flash = this.add.rectangle(width / 2, height / 2, width, height, 0xffe4a0, 0.5);
        flash.setScrollFactor(0).setDepth(850);
        this.tweens.add({
          targets: flash,
          alpha: 0,
          duration: 650,
          onComplete: () => flash.destroy()
        });

        // Visual pickup fade
        if (this.diyaPickupSprite) {
          this.tweens.add({
            targets: [this.diyaPickupSprite, this.diyaPedestalGlow],
            alpha: 0,
            scale: 0.1,
            duration: 350,
            onComplete: () => {
              this.diyaPickupSprite?.destroy();
              this.diyaPedestalGlow?.destroy();
            }
          });
        }

        // Unregister interaction zone
        this.interactionManager.unregister('pickup_diya');

        // Uplifting story prompt
        this.events.emit('show-toast', 'You hold the holy Diya! Use its light to navigate the dark maze and find the way out.', 4500);
      }
    }));
  }

  private setupCornerShrines() {
    // In Level 2, praying to Lord Ganesha's sacred idols grants Astha points.
    // The maze features 3 sacred Bappa idols directly drawn in the chambers:
    // 1) North-West Chamber Idol at (171, 140) -> grants +10 Astha (unlocks Hint 2 for 5s)
    // 2) South-West Chamber Idol at (129, 890) -> grants +5 Astha
    // 3) South-East Chamber Idol at (1405, 868) -> grants +5 Astha
    // Total Level 2 Astha = 40 (20 from Level 1 + 20 from Level 2 idols).
    const shrines = [
      {
        id: 'idol_nw',
        index: 0 as const,
        x: 171,
        y: 140,
        standY: 175,
        name: 'Lord Ganesha Shrine (North-West)',
        asthaAward: 10
      },
      {
        id: 'idol_sw',
        index: 1 as const,
        x: 129,
        y: 890,
        standY: 925,
        name: 'Lord Ganesha Shrine (South-West)',
        asthaAward: 5
      },
      {
        id: 'idol_se',
        index: 2 as const,
        x: 1405,
        y: 868,
        standY: 905,
        name: 'Lord Ganesha Shrine (South-East)',
        asthaAward: 5
      }
    ];

    shrines.forEach((c) => {
      // Golden aura breathing around the sacred idol
      const aura = this.add.circle(c.x, c.y - 10, 32, 0xffd07b, 0.3);
      aura.setDepth(6);
      this.tweens.add({
        targets: aura,
        scale: 1.3,
        alpha: 0.5,
        duration: 1300 + c.index * 150,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Subtle prayer prompt icon
      const icon = this.add.text(c.x, c.y - 32, '✨', {
        fontSize: '18px'
      }).setOrigin(0.5).setDepth(8);

      const label = this.add.text(c.x, c.y + 26, c.name, {
        fontFamily: 'Cinzel, serif',
        fontSize: '9.5px',
        color: '#ffc168',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(8);

      // Dedicated solid obstacle for each idol so the player CANNOT climb on it
      const idolObstacle = this.add.rectangle(c.x, c.y, 60, 75, 0x000000, 0);
      this.physics.add.existing(idolObstacle, true);
      this.obstacles.add(idolObstacle);

      // Interaction zone in front of the idol stand
      this.interactionManager.register(new Interactable({
        id: c.id,
        x: c.x,
        y: c.standY,
        radius: 65,
        promptText: `[E] Pray before ${c.name}`,
        onInteract: () => {
          if (!GameState.isCornerShrineExamined(c.index)) {
            this.soundManager.playAsthaIncrease();
            GameState.setCornerShrineExamined(c.index);
            GameState.addAstha(c.asthaAward);
            this.events.emit('astha-gained');
            this.updateDiscoveredShrineLights();

            // When praying to an idol that unlocks Hint 2 (or reaches Astha milestone)
            if (!GameState.isHintUnlocked(2)) {
              GameState.unlockHint(2);
              this.events.emit('show-toast', '✨ Sacred blessing! 2nd Divine Key (DIYA) revealed for 5 seconds!', 4000);

              // Launch Divine Hint Modal with 5-second auto-close
              this.player.freeze();
              this.scene.pause();
              this.scene.launch('DivineHintModal', {
                newHintIndex: 2,
                returnScene: 'Level2Scene'
              });
            } else if (GameState.astha >= 40) {
              this.events.emit('show-toast', `✨ All Bappa idols blessed! Full Astha reached (${GameState.astha}/40)!`, 3500);
            } else {
              this.events.emit('show-toast', `Bappa's blessing received! (+${c.asthaAward} ASTHA: ${GameState.astha}/40)`, 3200);
            }
          } else {
            this.soundManager.playButtonClick();
            this.player.freeze();
            this.scene.pause();
            this.scene.launch('DivineHintModal', {
              returnScene: 'Level2Scene'
            });
          }
        }
      }));
    });

    // Central Altar / Sacred Shrine (Center Courtyard)
    const shrineX = 750;
    const shrineY = 487;

    // Solid collision for central altar so player cannot walk on top of it
    const altarObstacle = this.add.rectangle(shrineX, shrineY, 68, 70, 0x000000, 0);
    this.physics.add.existing(altarObstacle, true);
    this.obstacles.add(altarObstacle);

    const shrineFlameGlow = this.add.circle(shrineX, shrineY, 36, 0xffd07b, 0.28);
    shrineFlameGlow.setDepth(6);
    this.tweens.add({
      targets: shrineFlameGlow,
      scale: 1.35,
      alpha: 0.45,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    this.interactionManager.register(new Interactable({
      id: 'astha_shrine',
      x: shrineX,
      y: shrineY + 45,
      radius: 70,
      promptText: '[E] Inspect Central Flame Altar',
      onInteract: () => {
        this.soundManager.playInteraction();
        this.events.emit('show-toast', 'The sacred central flame burns warm and steadfast, sheltering you from shadows.');
      }
    }));
  }

  private setupExitGateway() {
    const exitX = 1385;
    const exitY = 140;

    // Radiant golden archway aura
    this.exitBeaconGlow = this.add.circle(exitX, exitY, 55, 0xffeb99, 0.4);
    this.tweens.add({
      targets: this.exitBeaconGlow,
      scale: 1.35,
      alpha: 0.6,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Floating golden blessing particles
    this.exitParticles = [];
    for (let i = 0; i < 6; i++) {
      const p = this.add.circle(exitX + (Math.random() * 40 - 20), exitY + (Math.random() * 30 - 15), 2.5, 0xfff0aa, 0.85);
      p.setDepth(16);
      this.tweens.add({
        targets: p,
        y: exitY - 35 - Math.random() * 20,
        alpha: 0,
        scale: 0.4,
        duration: 1500 + Math.random() * 800,
        repeat: -1,
        delay: i * 250
      });
      this.exitParticles.push(p);
    }

    // Overhead sacred archway banner
    this.exitBanner = this.add.text(exitX, exitY - 38, '⛩️ EXIT GATEWAY', {
      fontFamily: 'Cinzel, serif',
      fontSize: '11px',
      color: '#ffe08a',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(16);

    this.tweens.add({
      targets: this.exitBanner,
      alpha: 0.6,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    this.interactionManager.register(new Interactable({
      id: 'maze_exit',
      x: exitX,
      y: exitY + 10,
      radius: 80,
      promptText: '[E] Step into the Light (Exit Maze)',
      onInteract: () => {
        if (GameState.level2State.diyaPickedUp) {
          this.triggerLevelCompletion();
        } else {
          this.soundManager.playInteraction();
          this.events.emit('show-toast', 'You need the holy Diya to pierce the darkness and exit.', 3500);
        }
      }
    }));
  }

  public updateDiscoveredShrineLights() {
    this.torchLights = [];

    // The 3 Bappa Idols remain illuminated as landmarks once blessed
    const cornerPositions = [
      { x: 171, y: 140 },  // NW Idol
      { x: 129, y: 890 },  // SW Idol
      { x: 1405, y: 868 }  // SE Idol
    ];

    cornerPositions.forEach((pos, idx) => {
      if (GameState.isCornerShrineExamined(idx as 0 | 1 | 2)) {
        this.torchLights.push({ x: pos.x, y: pos.y, radius: 95 });
      }
    });

    // Central Altar light
    this.torchLights.push({ x: 750, y: 487, radius: 85 });
  }

  private spawnOrRelocateVighna() {
    if (this.isVighnaAttacking || GameState.level2State.level2Complete) return;

    // Filter candidate nodes that are at least 280px away from the player
    const availableNodes = this.VIGHNA_SPAWN_NODES.filter(node => {
      const d = Phaser.Math.Distance.Between(node.x, node.y, this.player.x, this.player.y);
      return d >= 280;
    });

    if (availableNodes.length === 0) return;

    const targetNode = Phaser.Utils.Array.GetRandom(availableNodes);

    if (!this.dynamicVighna) {
      // First manifestation
      this.dynamicVighna = this.add.image(targetNode.x, targetNode.y, 'vighna_shadow');
      this.dynamicVighna.setScale(0.52);
      this.dynamicVighna.setAlpha(0);
      this.dynamicVighna.setDepth(200);

      this.dynamicVighnaAura = this.add.circle(targetNode.x, targetNode.y, 45, 0x4a0a22, 0.35);
      this.dynamicVighnaAura.setAlpha(0);
      this.dynamicVighnaAura.setDepth(199);

      // Fade in and bobbing float
      this.tweens.add({
        targets: [this.dynamicVighna, this.dynamicVighnaAura],
        alpha: 0.9,
        duration: 800,
        ease: 'Sine.easeOut'
      });

      this.tweens.add({
        targets: this.dynamicVighna,
        y: targetNode.y - 12,
        duration: 850,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.soundManager.playVighnaWhisper();
      this.events.emit('show-toast', 'A dark obstacle stirs in the maze...', 2800);
    } else {
      // Smooth floating patrol to new corridor branch
      this.tweens.killTweensOf([this.dynamicVighna, this.dynamicVighnaAura]);

      this.tweens.add({
        targets: [this.dynamicVighna, this.dynamicVighnaAura],
        x: targetNode.x,
        y: targetNode.y,
        duration: 4500,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          if (!this.dynamicVighna || this.isVighnaAttacking) return;
          this.tweens.add({
            targets: this.dynamicVighna,
            y: targetNode.y - 12,
            duration: 850,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
        }
      });
    }
  }

  private checkVighnaProximity(time: number) {
    if (!this.dynamicVighna || !this.dynamicVighna.active || this.isVighnaAttacking) return;

    // Keep aura tracking vighna position
    if (this.dynamicVighnaAura) {
      this.dynamicVighnaAura.setPosition(this.dynamicVighna.x, this.dynamicVighna.y);
    }

    const dist = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.dynamicVighna.x,
      this.dynamicVighna.y
    );

    // Horror Warning Range (Whisper, aura pulses, camera micro-tremor)
    if (dist < 230 && time - this.lastWhisperTime > 2800) {
      this.lastWhisperTime = time;
      this.soundManager.playVighnaWhisper();
      if (this.dynamicVighnaAura) {
        this.tweens.add({
          targets: this.dynamicVighnaAura,
          scale: 1.45,
          alpha: 0.75,
          duration: 350,
          yoyo: true
        });
      }
      if (dist < 140) {
        // Monster is extremely close: screen micro-tremor
        this.cameras.main.shake(180, 0.005);
      }
    }

    // Proximity attack trigger (<= 65px)
    if (dist <= 65) {
      this.triggerVighnaAttack();
    }
  }

  private triggerVighnaAttack() {
    if (this.isVighnaAttacking || !this.dynamicVighna) return;
    this.isVighnaAttacking = true;

    // Freeze player & stop all movement
    this.player.freeze();
    this.tweens.killTweensOf([this.dynamicVighna, this.dynamicVighnaAura]);

    // Play attack screech & hit sound
    this.soundManager.playVighnaAttack();

    // Camera shake
    this.cameras.main.shake(450, 0.02);

    // Rapid lunge directly into player
    this.tweens.add({
      targets: this.dynamicVighna,
      x: this.player.x,
      y: this.player.y,
      scaleX: 0.72,
      scaleY: 0.72,
      duration: 200,
      ease: 'Power3.easeIn'
    });

    if (this.dynamicVighnaAura) {
      this.tweens.add({
        targets: this.dynamicVighnaAura,
        x: this.player.x,
        y: this.player.y,
        scale: 1.8,
        alpha: 0.9,
        duration: 200
      });
    }

    // Red screen flash
    const { width, height } = this.cameras.main;
    const flash = this.add.rectangle(width / 2, height / 2, width, height, 0x540612, 0);
    flash.setScrollFactor(0);
    flash.setDepth(999);

    this.tweens.add({
      targets: flash,
      alpha: 0.92,
      duration: 250,
      ease: 'Power2.easeIn'
    });

    this.events.emit('show-toast', 'Vighna struck! Your light was extinguished.', 2500);

    // Drop Astha to 0
    GameState.reduceAstha(50);

    // Transition to Game Over screen
    this.time.delayedCall(700, () => {
      this.scene.stop('Level2Scene');
      this.scene.stop('UIScene');
      this.scene.start('Level2GameOverScene');
    });
  }

  private triggerLevelCompletion() {
    if (this.isLevelCompleting) return;
    this.isLevelCompleting = true;
    this.player.freeze();
    this.soundManager.playLevelComplete();
    GameState.setLevel2Field('level2Complete', true);

    // Screen flash to golden white
    const { width, height } = this.cameras.main;
    const flash = this.add.rectangle(width / 2, height / 2, width, height, 0xfff3d4, 0);
    flash.setScrollFactor(0);
    flash.setDepth(999);

    this.events.emit('show-toast', 'THE LIGHT SHOWED ME THE WAY.', 3500);

    this.tweens.add({
      targets: flash,
      alpha: 1,
      duration: 1000,
      ease: 'Power2.easeIn',
      onComplete: () => {
        this.scene.stop('Level2Scene');
        this.scene.stop('UIScene');
        this.scene.start('Level2CompleteScene');
      }
    });
  }

  update(time: number, delta: number) {
    if (this.player) {
      this.player.update(time, delta);
      this.interactionManager.update(this.player.x, this.player.y);
      this.checkVighnaProximity(time);
      this.renderDarknessOverlay(time);
    }
  }

  private renderDarknessOverlay(time: number) {
    if (!this.darknessCanvasTexture) return;

    const ctx = this.darknessCanvasTexture.getContext();
    if (!ctx) return;

    const { width, height } = this.cameras.main;
    const cam = this.cameras.main;

    // 1. Paint 100% solid pitch black over the whole screen
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // 2. Cut out light holes using destination-out
    ctx.globalCompositeOperation = 'destination-out';

    const isDiyaPickedUp = GameState.level2State.diyaPickedUp;

    if (!isDiyaPickedUp) {
      // Warm glowing beacon for the holy Diya on the pedestal
      if (this.diyaPickupSprite && this.diyaPickupSprite.active) {
        const dx = this.diyaPickupSprite.x - cam.scrollX;
        const dy = this.diyaPickupSprite.y - cam.scrollY;
        const beaconRadius = 145;
        const grad = ctx.createRadialGradient(dx, dy, 0, dx, dy, beaconRadius);
        grad.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
        grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.95)');
        grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.5)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(dx, dy, beaconRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Faint silhouette aura around player child so they see themselves at spawn
      const px = this.player.x - cam.scrollX;
      const py = this.player.y - cam.scrollY;
      const playerRad = 55;
      const pGrad = ctx.createRadialGradient(px, py, 0, px, py, playerRad);
      pGrad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
      pGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.4)');
      pGrad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.arc(px, py, playerRad, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // The child holding the Diya is the LIGHT SOURCE!
      const playerScreenX = this.player.x - cam.scrollX;
      const playerScreenY = this.player.y - cam.scrollY;

      // Realistic oil lamp flame flicker (+/- 3.5%)
      const flicker = 1 + Math.sin(time * 0.012) * 0.035;
      const currentRadius = this.lightRadius * flicker;

      const grad = ctx.createRadialGradient(playerScreenX, playerScreenY, 0, playerScreenX, playerScreenY, currentRadius);
      grad.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
      grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.95)');
      grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.45)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(playerScreenX, playerScreenY, currentRadius, 0, Math.PI * 2);
      ctx.fill();

      // Discovered shrines that were prayed at keep a small landmark light
      for (const torch of this.torchLights) {
        const tx = torch.x - cam.scrollX;
        const ty = torch.y - cam.scrollY;
        if (tx >= -torch.radius && tx <= width + torch.radius && ty >= -torch.radius && ty <= height + torch.radius) {
          const tGrad = ctx.createRadialGradient(tx, ty, 0, tx, ty, torch.radius);
          tGrad.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
          tGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.55)');
          tGrad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
          ctx.fillStyle = tGrad;
          ctx.beginPath();
          ctx.arc(tx, ty, torch.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Reset composite operation back to source-over
    ctx.globalCompositeOperation = 'source-over';

    // Upload canvas to WebGL texture
    this.darknessCanvasTexture.refresh();
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
    if (this.vighnaPatrolTimer) {
      this.vighnaPatrolTimer.remove();
    }
    this.interactionManager.destroy();
  }
}
