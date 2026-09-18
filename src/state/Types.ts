export type InventoryItem = 
  | 'Almirah_Handle'
  | 'Key_1'
  | 'Screwdriver'
  | 'Bedroom_Door_Key'
  | 'Artefact_Fragment'
  | 'Diya'
  | 'Artefact_Fragment_2'
  | 'Completed_Artefact';

export interface Level1Puzzles {
  noteExamined: boolean;
  lockerUnlocked: boolean;
  almirahOpened: boolean;
  matClueExamined: boolean;
  boxUnlocked: boolean;
  drawerUnlocked: boolean;
  panelOpened: boolean;
  doorUnlocked: boolean;
}

export interface Level2State {
  diyaPickedUp: boolean;
  ganeshaPaintingExamined: boolean;
  flowerOfferingExamined: boolean;
  sacredShrineExamined: boolean;
  cluesFound: [boolean, boolean, boolean];
  vighnaEncountered: boolean;
  level2Complete: boolean;
}

export interface Level3State {
  sofaExamined: boolean;
  pianoExamined: boolean;
  laptopExamined: boolean;
  trophyExamined: boolean;
  paintingsExamined: [boolean, boolean, boolean, boolean];
  boxUnlocked: boolean;
  doorUnlocked: boolean;
  level3Complete: boolean;
}

export interface Level4State {
  artefactPlaced: boolean;
  mechanismActivated: boolean;
  imagePuzzleSolved: boolean;
  finalDoorOpened: boolean;
  gameComplete: boolean;
  shrineExamined: boolean;
  diyaAltarExamined: boolean;
  tridentBannerExamined: boolean;
  templeBellExamined: boolean;
  plaqueExamined: boolean;
}

export interface ItemInfo {
  id: InventoryItem;
  name: string;
  icon: string;
  assetKey: string;
  description: string;
}

export const ITEM_REGISTRY: Record<InventoryItem, ItemInfo> = {
  Almirah_Handle: {
    id: 'Almirah_Handle',
    name: 'Almirah Handle',
    icon: '🚪',
    assetKey: 'item_handle',
    description: 'An antique brass handle that fits the bedroom almirah.'
  },
  Key_1: {
    id: 'Key_1',
    name: 'Key 1',
    icon: '🗝️',
    assetKey: 'item_key',
    description: 'A small brass key retrieved from the 4-icon puzzle box.'
  },
  Screwdriver: {
    id: 'Screwdriver',
    name: 'Screwdriver',
    icon: '🪛',
    assetKey: 'item_screwdriver',
    description: 'A sturdy flathead screwdriver found in the locked drawer.'
  },
  Bedroom_Door_Key: {
    id: 'Bedroom_Door_Key',
    name: 'Bedroom Door Key',
    icon: '🔑',
    assetKey: 'item_key',
    description: 'The golden master key to the bedroom door.'
  },
  Artefact_Fragment: {
    id: 'Artefact_Fragment',
    name: 'Circular Artefact (Left Half)',
    icon: '🧩',
    assetKey: 'item_artifact',
    description: 'The left half of the sacred circular stone medallion (inscribed with "9-2").'
  },
  Diya: {
    id: 'Diya',
    name: 'Sacred Diya',
    icon: '🪔',
    assetKey: 'diya_pickup',
    description: 'A glowing clay diya radiating spiritual warmth and courage.'
  },
  Artefact_Fragment_2: {
    id: 'Artefact_Fragment_2',
    name: 'Circular Artefact (Right Half)',
    icon: '🧩',
    assetKey: 'item_artifact_2',
    description: 'The right half of the sacred circular stone medallion (inscribed with "7-7") retrieved from the secret locker.'
  },
  Completed_Artefact: {
    id: 'Completed_Artefact',
    name: 'Complete Sacred Artefact (Level 4 Key)',
    icon: '✨',
    assetKey: 'item_artifact_complete',
    description: 'Both halves are fused into the sacred circular medallion. Inscribed with "9-2 7-7". This serves as the Key to Level 4.'
  }
};

