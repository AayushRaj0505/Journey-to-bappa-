# 🛠️ Game Customization & Tuning Guide

This comprehensive guide explains **how to customize, modify, and balance every part of The Journey to Bappa** on your own without writing complex code.

---

## 📑 Table of Contents
1. [Resizing & Repositioning the Player](#1-resizing--repositioning-the-player)
2. [Modifying Movement Speed & Footstep Timing](#2-modifying-movement-speed--footstep-timing)
3. [Level 1 Customization (Furniture, Bedroom Codes & Puzzles)](#3-level-1-customization-bedroom)
4. [Level 2 Customization (Maze, Wall Collisions, Idols & Astha)](#4-level-2-customization-dark-diya-maze)
5. [Level 3 Customization (Living Room, Morse Clues, Locker & Door)](#5-level-3-customization-the-living-room)
6. [Level 4 Customization (Sanctuary, Idol & Pedestal Hitboxes, Image Puzzle)](#6-level-4-customization-the-final-sanctuary)
7. [Astha System & Hint Timers Customization](#7-astha-system--hint-timers)
8. [Camera Zoom & Screen Framing](#8-camera-zoom--screen-framing)
9. [Audio & Sound Effect Tuning](#9-audio--sound-effect-tuning)
10. [Mobile Touch Joystick & Interaction Button Customization](#10-mobile-touch-joystick--interaction-button-customization)

---

## 1. Resizing & Repositioning the Player

The player character's appearance, size, physics hitbox, and animations are defined in:
📁 [`src/components/Player.ts`](file:///Work/Main-computer/Game-1/src/components/Player.ts)

### Visual Sprite Scale
Around line 30:
```typescript
this.setScale(1.25); // Default player visual scale
```
- **Bigger character**: Change `1.25` to `1.4` or `1.5`.
- **Smaller character**: Change `1.25` to `1.0` or `1.1`.

### Feet Collision Body (Hitbox)
In top-down 2.5D games, character collision occurs at the character's feet so their torso and head can overlap walls/furniture naturally:
```typescript
const body = this.body as Phaser.Physics.Arcade.Body;
body.setSize(28, 16);                                      // width, height of foot box
body.setOffset((this.width - 28) / 2, this.height - 18);   // center at bottom feet
```
- If you increase sprite scale to `1.5`, adjust `body.setSize(34, 20)` so the player collides with walls accurately.

---

## 2. Modifying Movement Speed & Footstep Timing

Inside [`src/components/Player.ts`](file:///Work/Main-computer/Game-1/src/components/Player.ts):

### Movement Speed
```typescript
private speed: number = 165; // Pixels per second
```
- **Faster movement**: Increase `165` to `200` or `220`.
- **Slower movement**: Decrease `165` to `130`.

### Footstep Cadence
```typescript
if (this.footstepTimer > 280) { // Milliseconds between footsteps
  this.soundManager.playFootstep();
  this.footstepTimer = 0;
}
```
- If you make the player move faster, reduce `280` to `220` so footsteps sync with running.

---

## 3. Level 1 Customization (Bedroom)

File: 📁 [`src/scenes/Level1Scene.ts`](file:///Work/Main-computer/Game-1/src/scenes/Level1Scene.ts)

### Moving or Resizing Bedroom Furniture
Inside `createFurniture()`:
```typescript
// Example: Study Table
const table = this.add.image(845, 250, 'room_table');
table.setScale(0.12); // Visual size

// Solid Obstacle Box (X, Y, Width, Height)
const tableObstacle = this.add.rectangle(845, 255, 145, 100, 0x000000, 0);
this.physics.add.existing(tableObstacle, true);
this.obstacles.add(tableObstacle);
```

### Changing Level 1 Passwords & Solutions
1. **Cupboard Keypad Code (Default: `372`)**:
   - In [`src/scenes/Modals/KeypadModal.ts`](file:///Work/Main-computer/Game-1/src/scenes/Modals/KeypadModal.ts):
     ```typescript
     private targetCode: string = '372';
     ```
   - In [`src/scenes/Modals/NoteModal.ts`](file:///Work/Main-computer/Game-1/src/scenes/Modals/NoteModal.ts): Update the note text clue to match your new code.
2. **4-Icon Rotating Lockbox**:
   - In [`src/scenes/Modals/IconPuzzleModal.ts`](file:///Work/Main-computer/Game-1/src/scenes/Modals/IconPuzzleModal.ts):
     ```typescript
     private targetIndices: number[] = [0, 1, 2, 3]; // [Lotus, Conch, Om, Mace]
     ```

---

## 4. Level 2 Customization (Dark Diya Maze)

Files:
- 📁 [`src/scenes/Level2Scene.ts`](file:///Work/Main-computer/Game-1/src/scenes/Level2Scene.ts)
- 📁 [`src/scenes/Level2Walls.ts`](file:///Work/Main-computer/Game-1/src/scenes/Level2Walls.ts)

### Adjusting Wall Hitboxes
`Level2Walls.ts` exports `LEVEL2_WALLS`, a pixel-accurate grid of solid rectangles matching `maze.png`.
- The stone wall headers extend from `y: 0` to `y: 96`.
- The 3 Bappa idol stands have dedicated obstacle boxes:
  - **NW Idol**: `{ x: 140, y: 75, w: 62, h: 80 }`
  - **SW Idol**: `{ x: 98, y: 825, w: 62, h: 80 }`
  - **SE Idol**: `{ x: 1374, y: 802, w: 62, h: 80 }`
  - **Central Altar**: `{ x: 716, y: 454, w: 68, h: 70 }`

### Level 2 Astha Rewards
Inside `setupCornerShrines()` in `Level2Scene.ts`:
```typescript
// NW Idol: First idol prayed to awards 10 Astha and unlocks Hint 2 for 5s
{ id: 'shrine_nw', name: "Bappa's North-West Shrine", x: 171, y: 140, standY: 175, asthaAward: 10 },

// SW & SE Idols award 5 Astha each (bringing Level 2 total to 40)
{ id: 'shrine_sw', name: "Bappa's South-West Shrine", x: 129, y: 890, standY: 925, asthaAward: 5 },
{ id: 'shrine_se', name: "Bappa's South-East Shrine", x: 1405, y: 868, standY: 905, asthaAward: 5 }
```

---

## 5. Level 3 Customization (The Living Room)

Files:
- 📁 [`src/scenes/Level3Scene.ts`](file:///Work/Main-computer/Game-1/src/scenes/Level3Scene.ts)
- 📁 [`src/scenes/Modals/ArtefactBoxModal.ts`](file:///Work/Main-computer/Game-1/src/scenes/Modals/ArtefactBoxModal.ts)
- 📁 [`src/scenes/Modals/Level3DoorKeypadModal.ts`](file:///Work/Main-computer/Game-1/src/scenes/Modals/Level3DoorKeypadModal.ts)
- 📁 [`src/scenes/Modals/MorseChartModal.ts`](file:///Work/Main-computer/Game-1/src/scenes/Modals/MorseChartModal.ts)

### Secret Room Locker Password (Default: `SHIV`)
Inside `ArtefactBoxModal.ts`:
```typescript
if (this.enteredLetters.toUpperCase() === 'SHIV') {
  // Solved! Awards Completed_Artefact and +10 Astha
}
```

### Exit Door Keypad Code (Default: `9277`)
Inside `Level3DoorKeypadModal.ts`:
```typescript
if (this.enteredCode === '9277') {
  // Solved! Unlocks door to Level 3 Complete Screen
}
```

### Morse Reference Chart
Inside `MorseChartModal.ts`, you will find `MORSE_LETTERS` and `MORSE_NUMBERS`. All letters and digits are rendered cleanly without spoiler highlights so the player can decode at their own pace.

---

## 6. Level 4 Customization (The Final Sanctuary)

Files:
- 📁 [`src/scenes/Level4Scene.ts`](file:///Work/Main-computer/Game-1/src/scenes/Level4Scene.ts)
- 📁 [`src/scenes/Modals/Level4ImagePuzzleModal.ts`](file:///Work/Main-computer/Game-1/src/scenes/Modals/Level4ImagePuzzleModal.ts)

### Solid Hitboxes for Idol & Pedestal
Inside `createColliders()` in `Level4Scene.ts`:
```typescript
// Central pedestal base collider (prevents stepping on artefact slot)
addBox(606, 490, 100, 60);

// Lord Ganesha idol solid base collider (prevents walking on idol)
addBox(606, 195, 100, 50);
```

### The 4-Image Journey Sequence (Solution)
Inside `Level4ImagePuzzleModal.ts`:
```typescript
private readonly CORRECT_SEQUENCE: string[] = [
  'seal_elephant', // 1. Elephant (Level 1 Bedroom)
  'seal_diya',     // 2. Diya (Level 2 Forest Maze)
  'seal_trident',  // 3. Trident (Level 3 Living Room)
  'seal_temple'    // 4. Temple (Level 4 Sanctuary)
];
```

---

## 7. Astha System & Hint Timers

File: 📁 [`src/state/GameState.ts`](file:///Work/Main-computer/Game-1/src/state/GameState.ts)

### Astha Progression Balance (Total: 100)
| Level | Source | Astha Points Awarded | Cumulative Astha | Unlocked Hint |
| :--- | :--- | :--- | :--- | :--- |
| **Level 1** | Pray to Bedroom Bappa Painting | **+20** | **20 / 100** | Hint 1: `ELEPHANT` |
| **Level 2** | Pray to 3 Maze Bappa Idols | **+10, +5, +5** | **40 / 100** | Hint 2: `DIYA` |
| **Level 3** | Find 2nd Artefact Fragment in Locker | **+10** | **50 / 100** | Hint 3: `TRIDENT` |
| **Level 4** | Pray to Lord Ganesha Sanctuary Idol | **+50** | **100 / 100** | Hint 4: `TEMPLE` & Full Pilgrimage Revelation |

### Changing the 5-Second Hint Auto-Close Timer
In `src/scenes/Modals/DivineHintModal.ts`, locate the countdown timer:
```typescript
private remainingSeconds: number = 5; // Change duration in seconds
```

---

## 8. Camera Zoom & Screen Framing

Inside any level scene's `create()` method:
```typescript
// Zoom in slightly (e.g. 1.15 = 15% zoom in, 1.0 = normal)
this.cameras.main.setZoom(1.0);

// Adjust camera follow lerp (lower numbers = smoother cinematic lag)
this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
```

---

## 9. Audio & Sound Effect Tuning

File: 📁 [`src/systems/SoundManager.ts`](file:///Work/Main-computer/Game-1/src/systems/SoundManager.ts)

### Muting / Unmuting Audio
```typescript
SoundManager.getInstance().toggleMute();
```

### Changing Tone Frequencies & Volumes
Inside `SoundManager.ts`:
- `playAsthaIncrease()`: Plays a four-tone ascending bell arpeggio (`C5 -> E5 -> G5 -> C6`).
- `playDoorOpen()`: Low-frequency resonant stone slide.
- `playPuzzleSuccess()`: Resonant brass victory fanfare.
- `playButtonHover()` & `playButtonClick()`: Crisp mechanical clicks.

---

## 10. Mobile Touch Joystick & Interaction Button Customization

The on-screen virtual joystick and action button are built in:
📁 [`src/scenes/UIScene.ts`](file:///Work/Main-computer/Game-1/src/scenes/UIScene.ts)

### Virtual Joystick Position & Size
Inside `createMobileControls(width, height)`:
```typescript
const joyX = 105;              // Distance from left screen edge
const joyY = height - 105;     // Distance from bottom screen edge
this.joystickRadius = 60;      // Outer base ring radius
this.joystickHandleMaxDist = 42; // Maximum drag travel distance
```
- **Move joystick further into corner**: Change `joyX = 85` and `joyY = height - 85`.
- **Make joystick larger**: Change `this.joystickRadius = 75` and `this.joystickHandleMaxDist = 55`.

### Virtual Interact Button Position & Size
```typescript
const btnX = width - 100;      // Distance from right screen edge
const btnY = height - 105;     // Distance from bottom screen edge
const btnBack = this.add.circle(0, 0, 42, 0x1d1108, 0.92); // Button radius (42px)
```
- **Move button higher**: Change `btnY = height - 120`.
- **Make button bigger**: Change `42` to `50`.

### Player Virtual Input Handling
Inside 📁 [`src/components/Player.ts`](file:///Work/Main-computer/Game-1/src/components/Player.ts):
- `this.moveInput` holds `{ x, y }` from `-1.0` to `1.0`.
- It combines with keyboard inputs and is capped to magnitude `1.0` so speed remains identical whether using keyboard or virtual joystick.

