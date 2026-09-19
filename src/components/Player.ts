import Phaser from 'phaser';
import { SoundManager } from '../systems/SoundManager';

export type FacingDirection = 'down' | 'up' | 'left' | 'right';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  public facing: FacingDirection = 'down';
  public carryingDiya: boolean = false;
  public moveInput: { x: number; y: number } = { x: 0, y: 0 };
  private speed: number = 165;
  private footstepTimer: number = 0;
  private stepTimer: number = 0;
  private soundManager: SoundManager;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player_down');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.soundManager = SoundManager.getInstance();

    // Scale character sprite to a well-proportioned size in 1024x768 world
    this.setScale(1.25);
    this.setDepth(10);

    // Physics body at feet for proper 2.5D depth and collision against walls & furniture
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(28, 16);
    body.setOffset((this.width - 28) / 2, this.height - 18);
    body.setCollideWorldBounds(true);

    // Setup input keys
    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasd = {
        up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
      };
    }
  }

  public setCustomScale(scale: number) {
    this.setScale(scale);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      const bw = Math.max(12, Math.round(26 * (scale / 1.25)));
      const bh = Math.max(8, Math.round(14 * (scale / 1.25)));
      body.setSize(bw, bh);
      body.setOffset((this.width - bw) / 2, this.height - bh - 2);
    }
  }

  public setCarryingDiya(carrying: boolean) {
    this.carryingDiya = carrying;
    const tex = this.carryingDiya ? `player_diya_${this.facing}` : `player_${this.facing}`;
    if (this.scene.textures.exists(tex)) {
      this.setTexture(tex);
    }
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setOffset((this.width - body.width) / 2, this.height - body.height - 2);
    }
  }

  update(time: number, delta: number) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body || !this.cursors) return;

    let vx = 0;
    let vy = 0;

    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const up = this.cursors.up.isDown || this.wasd.up.isDown;
    const down = this.cursors.down.isDown || this.wasd.down.isDown;

    if (left) vx -= 1;
    if (right) vx += 1;
    if (up) vy -= 1;
    if (down) vy += 1;

    // Combine with virtual touch joystick input
    vx += this.moveInput.x;
    vy += this.moveInput.y;

    // Cap magnitude to 1 for normalized multi-directional speed
    const mag = Math.sqrt(vx * vx + vy * vy);
    if (mag > 1) {
      vx /= mag;
      vy /= mag;
    }

    body.setVelocity(vx * this.speed, vy * this.speed);

    // Update facing and animations
    const isMoving = mag > 0.05;

    if (Math.abs(vx) > Math.abs(vy)) {
      if (vx < -0.1) {
        this.facing = 'left';
      } else if (vx > 0.1) {
        this.facing = 'right';
      }
    } else {
      if (vy < -0.1) {
        this.facing = 'up';
      } else if (vy > 0.1) {
        this.facing = 'down';
      }
    }

    const animKey = this.carryingDiya ? `walk_diya_${this.facing}` : `walk_${this.facing}`;
    const idleTex = this.carryingDiya ? `player_diya_${this.facing}` : `player_${this.facing}`;

    if (isMoving) {
      if (this.anims.currentAnim?.key !== animKey && this.scene.anims.exists(animKey)) {
        this.anims.play(animKey, true);
      } else if (!this.anims.isPlaying && this.scene.anims.exists(animKey)) {
        this.anims.play(animKey, true);
      }

      // Organic walking weight shift and sway
      this.stepTimer += delta * 0.012;
      this.setAngle(Math.sin(this.stepTimer) * 2.2);

      // Footstep sound cadence
      this.footstepTimer += delta;
      if (this.footstepTimer > 280) {
        this.soundManager.playFootstep();
        this.footstepTimer = 0;
      }
    } else {
      this.anims.stop();
      if (this.scene.textures.exists(idleTex)) {
        this.setTexture(idleTex);
      }
      this.setAngle(0);
      this.stepTimer = 0;
      this.footstepTimer = 220;
    }

    // Dynamic depth sorting by Y position
    this.setDepth(Math.floor(this.y));
  }

  public freeze() {
    this.moveInput = { x: 0, y: 0 };
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(0, 0);
      this.anims.stop();
      const idleTex = this.carryingDiya ? `player_diya_${this.facing}` : `player_${this.facing}`;
      if (this.scene.textures.exists(idleTex)) {
        this.setTexture(idleTex);
      }
      this.setAngle(0);
      this.stepTimer = 0;
    }
  }
}
