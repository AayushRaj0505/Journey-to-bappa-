import Phaser from 'phaser';

export interface InteractableConfig {
  id: string;
  x: number;
  y: number;
  radius?: number;
  promptText: string;
  onInteract: () => void;
  isEnabled?: boolean;
}

export class Interactable {
  public id: string;
  public x: number;
  public y: number;
  public radius: number;
  public promptText: string;
  public onInteract: () => void;
  public isEnabled: boolean;

  constructor(config: InteractableConfig) {
    this.id = config.id;
    this.x = config.x;
    this.y = config.y;
    this.radius = config.radius ?? 80;
    this.promptText = config.promptText;
    this.onInteract = config.onInteract;
    this.isEnabled = config.isEnabled ?? true;
  }

  public getDistanceTo(targetX: number, targetY: number): number {
    return Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);
  }

  public isInRange(targetX: number, targetY: number): boolean {
    if (!this.isEnabled) return false;
    return this.getDistanceTo(targetX, targetY) <= this.radius;
  }
}
