import { Level1Puzzles, Level2State, Level3State, Level4State, InventoryItem } from './Types';

type StateListener = () => void;

class GameStateManager {
  private _currentLevel: 1 | 2 | 3 | 4 = 1;
  private _astha: number = 20;
  private _maxAstha: number = 50;
  private _inventory: Set<InventoryItem> = new Set();

  private _puzzles: Level1Puzzles = {
    noteExamined: false,
    lockerUnlocked: false,
    almirahOpened: false,
    matClueExamined: false,
    boxUnlocked: false,
    drawerUnlocked: false,
    panelOpened: false,
    doorUnlocked: false
  };

  private _level2State: Level2State = {
    diyaPickedUp: false,
    ganeshaPaintingExamined: false,
    flowerOfferingExamined: false,
    sacredShrineExamined: false,
    cluesFound: [false, false, false],
    vighnaEncountered: false,
    level2Complete: false
  };

  private _level3State: Level3State = {
    sofaExamined: false,
    pianoExamined: false,
    laptopExamined: false,
    trophyExamined: false,
    paintingsExamined: [false, false, false, false],
    boxUnlocked: false,
    doorUnlocked: false,
    level3Complete: false
  };

  private _level4State: Level4State = {
    artefactPlaced: false,
    mechanismActivated: false,
    imagePuzzleSolved: false,
    finalDoorOpened: false,
    gameComplete: false,
    shrineExamined: false,
    diyaAltarExamined: false,
    tridentBannerExamined: false,
    templeBellExamined: false,
    plaqueExamined: false
  };

  private _objective: string = "Find a way to open the door.";
  private listeners: StateListener[] = [];

  public get currentLevel(): 1 | 2 | 3 | 4 {
    return this._currentLevel;
  }

  public get astha(): number {
    return this._astha;
  }

  public get maxAstha(): number {
    return this._maxAstha;
  }

  public get level2State(): Level2State {
    return { ...this._level2State };
  }

  public get level3State(): Level3State {
    return { ...this._level3State };
  }

  public get level4State(): Level4State {
    return { ...this._level4State };
  }

  public get inventory(): InventoryItem[] {
    return Array.from(this._inventory);
  }

  public get puzzles(): Level1Puzzles {
    return { ...this._puzzles };
  }

  public get objective(): string {
    return this._objective;
  }

  public subscribe(fn: StateListener): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  public addItem(item: InventoryItem) {
    if (!this._inventory.has(item)) {
      this._inventory.add(item);
      this.updateObjective();
      this.notify();
    }
  }

  public removeItem(item: InventoryItem) {
    if (this._inventory.has(item)) {
      this._inventory.delete(item);
      this.updateObjective();
      this.notify();
    }
  }

  public hasItem(item: InventoryItem): boolean {
    return this._inventory.has(item);
  }

  // --- Level 1 Methods ---
  public setPuzzleState<K extends keyof Level1Puzzles>(key: K, value: boolean) {
    if (this._puzzles[key] !== value) {
      this._puzzles[key] = value;
      this.updateObjective();
      this.notify();
    }
  }

  public isPuzzleSolved(key: keyof Level1Puzzles): boolean {
    return this._puzzles[key];
  }

  // --- Level 2 Methods ---
  public startLevel2() {
    const hadArtifact = this._inventory.has('Artefact_Fragment');
    this._currentLevel = 2;
    this._maxAstha = 50;
    this._astha = 20;
    this._inventory.clear(); // Fresh inventory for level 2, preserving sacred fragment
    if (hadArtifact) {
      this._inventory.add('Artefact_Fragment');
    }
    this._level2State = {
      diyaPickedUp: false,
      ganeshaPaintingExamined: false,
      flowerOfferingExamined: false,
      sacredShrineExamined: false,
      cluesFound: [false, false, false],
      vighnaEncountered: false,
      level2Complete: false
    };
    this.updateObjective();
    this.notify();
  }

  public addAstha(amount: number): number {
    const oldAstha = this._astha;
    this._astha = Math.min(this._maxAstha, this._astha + amount);
    if (this._astha !== oldAstha) {
      this.updateObjective();
      this.notify();
    }
    return this._astha;
  }

  public reduceAstha(amount: number): number {
    const oldAstha = this._astha;
    this._astha = Math.max(0, this._astha - amount);
    if (this._astha !== oldAstha) {
      this.notify();
    }
    return this._astha;
  }

  public setLevel2Field<K extends keyof Level2State>(key: K, value: Level2State[K]) {
    this._level2State[key] = value;
    this.updateObjective();
    this.notify();
  }

  public setClueFound(index: 0 | 1 | 2) {
    if (!this._level2State.cluesFound[index]) {
      this._level2State.cluesFound[index] = true;
      this.notify();
    }
  }

  public isClueFound(index: 0 | 1 | 2): boolean {
    return this._level2State.cluesFound[index];
  }

  // --- Level 3 Methods ---
  public startLevel3() {
    this._currentLevel = 3;
    this._maxAstha = 80;
    // Retain existing Astha or default to 50
    if (this._astha < 50) {
      this._astha = 50;
    }
    // Ensure player carries the first artefact fragment from Level 1
    if (!this._inventory.has('Artefact_Fragment') && !this._inventory.has('Completed_Artefact')) {
      this._inventory.add('Artefact_Fragment');
    }
    this._level3State = {
      sofaExamined: false,
      pianoExamined: false,
      laptopExamined: false,
      trophyExamined: false,
      paintingsExamined: [false, false, false, false],
      boxUnlocked: false,
      doorUnlocked: false,
      level3Complete: false
    };
    this.updateObjective();
    this.notify();
  }

  public setLevel3Field<K extends keyof Level3State>(key: K, value: Level3State[K]) {
    this._level3State[key] = value;
    this.updateObjective();
    this.notify();
  }

  // --- Level 4 Methods ---
  public startLevel4() {
    this._currentLevel = 4;
    this._maxAstha = 100;
    this._astha = 100; // Peaceful full faith in the sanctuary
    // Ensure player carries the completed circular artefact
    if (!this._inventory.has('Completed_Artefact')) {
      this._inventory.add('Completed_Artefact');
    }
    this._level4State = {
      artefactPlaced: false,
      mechanismActivated: false,
      imagePuzzleSolved: false,
      finalDoorOpened: false,
      gameComplete: false,
      shrineExamined: false,
      diyaAltarExamined: false,
      tridentBannerExamined: false,
      templeBellExamined: false,
      plaqueExamined: false
    };
    this.updateObjective();
    this.notify();
  }

  public setLevel4Field<K extends keyof Level4State>(key: K, value: Level4State[K]) {
    this._level4State[key] = value;
    this.updateObjective();
    this.notify();
  }

  public combineArtefacts() {
    this._inventory.delete('Artefact_Fragment');
    this._inventory.delete('Artefact_Fragment_2');
    this._inventory.add('Completed_Artefact');
    this.updateObjective();
    this.notify();
  }

  private updateObjective() {
    if (this._currentLevel === 1) {
      if (this._puzzles.doorUnlocked) {
        this._objective = "Level Complete! Step through the open door.";
      } else if (this._inventory.has('Bedroom_Door_Key')) {
        this._objective = "Use the Bedroom Door Key to unlock the door.";
      } else if (this._inventory.has('Screwdriver')) {
        this._objective = "Look around the room for a screwed panel to open.";
      } else if (this._inventory.has('Key_1')) {
        this._objective = "Use Key 1 to unlock the bedside drawer.";
      } else if (this._puzzles.almirahOpened) {
        this._objective = "Examine the 4-icon puzzle box inside the almirah.";
      } else if (this._inventory.has('Almirah_Handle')) {
        this._objective = "Attach the handle to open the locked almirah.";
      } else if (this._puzzles.noteExamined) {
        this._objective = "Find a locker or safe that matches the note's code.";
      } else {
        this._objective = "Find a way to open the door.";
      }
    } else if (this._currentLevel === 2) {
      if (this._level2State.level2Complete) {
        this._objective = "You found the way out! Step into the radiant light.";
      } else if (this._level2State.diyaPickedUp) {
        this._objective = "Use the Diya as your light source to find the way out.";
      } else {
        this._objective = "Pick up the holy Diya ahead to illuminate your path.";
      }
    } else if (this._currentLevel === 3) {
      if (this._level3State.level3Complete) {
        this._objective = "The exit door is unlocked! Step through into the light.";
      } else if (this._level3State.doorUnlocked) {
        this._objective = "Step through the open exit door.";
      } else if (this._inventory.has('Completed_Artefact')) {
        this._objective = "Sacred Key assembled! Enter door code 9277.";
      } else if (this._level3State.boxUnlocked) {
        this._objective = "The secret locker is open! Artefact fragments have fused.";
      } else {
        this._objective = "Explore the room and decode Morse clues to unlock the Secret Locker.";
      }
    } else if (this._currentLevel === 4) {
      if (this._level4State.gameComplete) {
        this._objective = "The Journey to Bappa is Complete.";
      } else if (this._level4State.finalDoorOpened) {
        this._objective = "The sanctuary is open! Step into Bappa's divine light.";
      } else if (this._level4State.artefactPlaced) {
        this._objective = "Solve the sacred image sequence (Remember what you have seen).";
      } else {
        this._objective = "Approach the central pedestal and place the Complete Sacred Artefact.";
      }
    }
  }

  public reset() {
    this._currentLevel = 1;
    this._maxAstha = 50;
    this._astha = 20;
    this._inventory.clear();
    this._puzzles = {
      noteExamined: false,
      lockerUnlocked: false,
      almirahOpened: false,
      matClueExamined: false,
      boxUnlocked: false,
      drawerUnlocked: false,
      panelOpened: false,
      doorUnlocked: false
    };
    this._level2State = {
      diyaPickedUp: false,
      ganeshaPaintingExamined: false,
      flowerOfferingExamined: false,
      sacredShrineExamined: false,
      cluesFound: [false, false, false],
      vighnaEncountered: false,
      level2Complete: false
    };
    this._level3State = {
      sofaExamined: false,
      pianoExamined: false,
      laptopExamined: false,
      trophyExamined: false,
      paintingsExamined: [false, false, false, false],
      boxUnlocked: false,
      doorUnlocked: false,
      level3Complete: false
    };
    this._level4State = {
      artefactPlaced: false,
      mechanismActivated: false,
      imagePuzzleSolved: false,
      finalDoorOpened: false,
      gameComplete: false,
      shrineExamined: false,
      diyaAltarExamined: false,
      tridentBannerExamined: false,
      templeBellExamined: false,
      plaqueExamined: false
    };
    this._objective = "Find a way to open the door.";
    this.notify();
  }
}

export const GameState = new GameStateManager();


