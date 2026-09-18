import Phaser from 'phaser';
import { Interactable } from '../components/Interactable';

export class InteractionManager {
  private interactables: Map<string, Interactable> = new Map();
  private currentActive: Interactable | null = null;
  private scene: Phaser.Scene;
  private onPromptChangeCallback?: (interactable: Interactable | null) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Listen to E key for interaction
    if (this.scene.input.keyboard) {
      this.scene.input.keyboard.on('keydown-E', () => {
        this.interact();
      });
      this.scene.input.keyboard.on('keydown-SPACE', () => {
        this.interact();
      });
    }
  }

  public onPromptChange(callback: (interactable: Interactable | null) => void) {
    this.onPromptChangeCallback = callback;
  }

  public register(interactable: Interactable) {
    this.interactables.set(interactable.id, interactable);
  }

  public unregister(id: string) {
    this.interactables.delete(id);
    if (this.currentActive?.id === id) {
      this.currentActive = null;
      this.onPromptChangeCallback?.(null);
    }
  }

  public get(id: string): Interactable | undefined {
    return this.interactables.get(id);
  }

  public update(playerX: number, playerY: number) {
    let closest: Interactable | null = null;
    let minDistance = Infinity;

    for (const interactable of this.interactables.values()) {
      if (!interactable.isEnabled) continue;

      const dist = interactable.getDistanceTo(playerX, playerY);
      if (dist <= interactable.radius && dist < minDistance) {
        minDistance = dist;
        closest = interactable;
      }
    }

    if (closest !== this.currentActive) {
      this.currentActive = closest;
      this.onPromptChangeCallback?.(closest);
    }
  }

  public interact() {
    if (this.currentActive && this.currentActive.isEnabled) {
      this.currentActive.onInteract();
    }
  }

  public getCurrentActive(): Interactable | null {
    return this.currentActive;
  }

  public destroy() {
    this.interactables.clear();
    this.currentActive = null;
  }
}
