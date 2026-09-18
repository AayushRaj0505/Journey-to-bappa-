# 🛠️ Game Customization & Tuning Guide

This guide explains **how to customize and adjust everything in the game by yourself**, including:
1. Resizing the Character (Player)
2. Resizing Surrounding Objects & Furniture (Bed, Table, Cupboard, etc.)
3. Adjusting Collision Hitboxes (so you don't walk through walls/objects)
4. Adjusting Interaction Trigger Zones (where the `[E]` prompt appears)
5. Modifying Player Movement Speed & Footstep Timing
6. Changing Camera Zoom & World Framing
7. Modifying Puzzles, Secret Codes, & Objectives

---

## 1. 🧍 How to Resize the Player Character

The player character's appearance, size, physics, and animation are controlled inside:
📁 [`src/components/Player.ts`](file:///Work/Main-computer/Game-1/src/components/Player.ts)

### Changing Visual Size
Around line 28-30 of `src/components/Player.ts`, you will find:
```typescript
// Scale character sprite
this.setScale(1.25);
```
- **To make the character bigger**: Increase the number (e.g. `1.35` or `1.5`).
- **To make the character smaller**: Decrease the number (e.g. `1.1` or `0.9`).

### Updating the Physics Collision Hitbox (Feet)
In top-down 2.5D games, the collision box is placed at the character's feet so that their head and shoulders can overlap furniture in the background naturally.

Around lines 33-35 of `src/components/Player.ts`:
```typescript
const body = this.body as Phaser.Physics.Arcade.Body;
body.setSize(28, 16);                                      // width, height of foot collision box
body.setOffset((this.width - 28) / 2, this.height - 18);   // offsets it to bottom center
```
> [!TIP]
> If you make your character much bigger (e.g., `setScale(1.6)`), increase the `setSize(34, 20)` slightly so their feet match obstacles accurately.

---

## 2. 🪑 How to Resize & Reposition Objects & Furniture

All furniture sprites, positions, and collision blocks are defined inside:
📁 [`src/scenes/Level1Scene.ts`](file:///Work/Main-computer/Game-1/src/scenes/Level1Scene.ts) in the `createFurniture()` method (around lines 100–175).

Every piece of furniture follows this 3-step pattern:
```typescript
// Step A: Spawn sprite and set scale
const bed = this.add.image(X, Y, 'room_bed');
bed.setScale(0.135);     // <--- ADJUST SCALE HERE
bed.setDepth(200);

// Step B: Spawn invisible collision box
const bedObstacle = this.add.rectangle(X, Y_OFFSET, WIDTH, HEIGHT, 0x000000, 0);
this.physics.add.existing(bedObstacle, true);
this.obstacles.add(bedObstacle);
```

### Furniture Scale Reference Table

| Furniture Item | Image Key | File Location in `Level1Scene.ts` | Recommended Scale | Collision Box Dimensions |
| :--- | :--- | :--- | :--- | :--- |
| **Bed** | `room_bed` | `createFurniture()` | `0.135` | `150` width × `110` height |
| **Bed Mat (Rug)** | `room_mat` | `createFurniture()` | `0.105` | Non-blocking floor visual |
| **Study Desk / Table** | `room_table` | `createFurniture()` | `0.12` | `145` width × `100` height |
| **Desk Note** | `puzzle_note` | `createFurniture()` | `0.028` | Attached on study desk |
| **Almirah / Cupboard** | `room_cupboard` | `createFurniture()` | `0.13` | `130` width × `115` height |
| **Bedside Drawer** | `room_drawer` | `createFurniture()` | `0.085` | `85` width × `75` height |

---

## 3. 🎯 How to Adjust Interaction Zones ([E] Prompts)

When the player walks close to an object, the `[E] Examine ...` tooltip appears.
These interaction zones are registered in `src/scenes/Level1Scene.ts` inside `setupInteractables()`.

Each interactable looks like this:
```typescript
this.interactionManager.register(new Interactable({
  id: 'bedside_drawer',
  x: 160,              // Center X where player triggers it
  y: 550,              // Center Y where player triggers it
  radius: 75,          // Detection radius in pixels (how close player must stand)
  promptText: '[E] Bedside Drawer',
  onInteract: () => {
    // What happens when player presses [E] or [Space]
  }
}));
```

- **If you moved a piece of furniture**: Update its `x` and `y` in the interactable to match where you want the player to stand in front of it.
- **If the trigger is too hard to reach**: Increase the `radius` (e.g. from `75` to `90`).
- **If the trigger activates from too far away**: Decrease the `radius` (e.g. from `75` to `60`).

---

## 4. ⚡ How to Adjust Player Movement & Controls

All movement speeds and keyboard controls are in:
📁 [`src/components/Player.ts`](file:///Work/Main-computer/Game-1/src/components/Player.ts)

### Speed
Find line 15:
```typescript
private speed: number = 160; // Pixels per second
```
- Want the player to move faster? Change `160` to `200` or `220`.
- Want slower, stealthy movement? Change `160` to `120`.

### Footstep Sound Cadence
Find line 97:
```typescript
if (this.footstepTimer > 280) { // Milliseconds between footstep sounds
  this.soundManager.playFootstep();
  this.footstepTimer = 0;
}
```
- If you increase player speed, decrease `280` to `220` so footsteps match the faster running animation.

---

## 5. 🔍 How to Change Camera Zoom & Game Size

If you want the whole game to look closer (more zoomed in) or wider, you have two options:

### Option A: Scene Camera Zoom (Recommended for dramatic feel)
Inside [`src/scenes/Level1Scene.ts`](file:///Work/Main-computer/Game-1/src/scenes/Level1Scene.ts), inside `create()`:
```typescript
// Zoom in by 15% to see the room and character closer
this.cameras.main.setZoom(1.15);

// Keep camera centered on player:
this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
```

### Option B: Canvas Resolution
Inside [`src/main.ts`](file:///Work/Main-computer/Game-1/src/main.ts):
```typescript
const config: Phaser.Types.Core.GameConfig = {
  width: 1024,  // Canvas pixel width
  height: 768,  // Canvas pixel height
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};
```

---

## 6. 🧩 How to Customize Puzzles & Secret Codes

### Changing the Cupboard Keypad Code (Default: `372`)
1. Open [`src/scenes/Modals/KeypadModal.ts`](file:///Work/Main-computer/Game-1/src/scenes/Modals/KeypadModal.ts).
2. Look for the solution constant:
   ```typescript
   private targetCode: string = '372';
   ```
   Change it to any 3 digits you want (e.g. `'519'`).
3. Open [`src/scenes/Modals/NoteModal.ts`](file:///Work/Main-computer/Game-1/src/scenes/Modals/NoteModal.ts) and update the note lore text so the clue matches your new code!

### Changing the 4-Icon Puzzle Box Solution
1. Open [`src/scenes/Modals/IconPuzzleModal.ts`](file:///Work/Main-computer/Game-1/src/scenes/Modals/IconPuzzleModal.ts).
2. Find the target icon indexes:
   ```typescript
   private targetIndices: number[] = [0, 1, 2, 3]; // Corresponds to Lotus, Conch, Om, Mace
   ```
3. Open [`src/scenes/Modals/MatClueModal.ts`](file:///Work/Main-computer/Game-1/src/scenes/Modals/MatClueModal.ts) to update the clue displayed on the mat.

---

## 7. 🧪 Step-by-Step Example: Resizing an Object Yourself

Suppose you want to make the **Study Table** 20% larger:

1. Open [`src/scenes/Level1Scene.ts`](file:///Work/Main-computer/Game-1/src/scenes/Level1Scene.ts).
2. Scroll to `createFurniture()`:
   ```typescript
   // BEFORE:
   const table = this.add.image(845, 250, 'room_table');
   table.setScale(0.12);
   const tableObstacle = this.add.rectangle(845, 255, 145, 100, 0x000000, 0);

   // AFTER (20% larger):
   const table = this.add.image(845, 250, 'room_table');
   table.setScale(0.144); // 0.12 * 1.2 = 0.144
   const tableObstacle = this.add.rectangle(845, 255, 174, 120, 0x000000, 0); // scale obstacle width & height too!
   ```
3. Save the file. Vite will automatically hot-reload your browser!
