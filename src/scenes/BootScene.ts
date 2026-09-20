import Phaser from 'phaser';
import { GameState } from '../state/GameState';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Elegant loading bar with temple aesthetic
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x1a120c, 0.8);
    progressBox.fillRoundedRect(width / 2 - 160, height / 2 - 15, 320, 30, 6);
    progressBox.lineStyle(2, 0xe29d42, 0.6);
    progressBox.strokeRoundedRect(width / 2 - 160, height / 2 - 15, 320, 30, 6);

    const titleText = this.add.text(width / 2, height / 2 - 70, 'THE JOURNEY TO BAPPA', {
      fontFamily: 'Cinzel, serif',
      fontSize: '28px',
      color: '#ffd07b',
      stroke: '#4a2608',
      strokeThickness: 3
    }).setOrigin(0.5);

    const subtitleText = this.add.text(width / 2, height / 2 - 35, 'Level 1: The Bedroom', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      color: '#d4b182'
    }).setOrigin(0.5);

    const percentText = this.add.text(width / 2, height / 2 + 35, '0%', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#f5c369'
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xe29d42, 1);
      progressBar.fillRoundedRect(width / 2 - 156, height / 2 - 11, 312 * value, 22, 4);
      percentText.setText(`${Math.floor(value * 100)}%`);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      titleText.destroy();
      subtitleText.destroy();
      percentText.destroy();
    });

    // 1. Room environment & furniture (user provided art)
    this.load.image('room_floor', 'assets/room/bedroom.png');
    this.load.image('level1_bedroom', 'assets/room/bedroom.png');
    this.load.image('room_bed', 'assets/room/bed.png');
    this.load.image('room_table', 'assets/room/table.png');
    this.load.image('room_drawer', 'assets/room/drawer.png');
    this.load.image('room_cupboard', 'assets/room/cupboard.png');
    this.load.image('room_mat', 'assets/room/mat.png');
    this.load.image('bappa_painting', 'assets/level3/Painting1.png');

    // 2. Interactive items & puzzles (user provided art)
    this.load.image('item_handle', 'assets/items/handle.png');
    this.load.image('item_key', 'assets/items/key.png');
    this.load.image('item_screwdriver', 'assets/items/screwdriver.png');
    this.load.image('item_artifact', 'assets/items/artifact_fragment.png');

    this.load.image('puzzle_note', 'assets/puzzles/note.png');
    this.load.image('puzzle_small_box', 'assets/puzzles/small_box.png');
    this.load.image('puzzle_opend_box', 'assets/puzzles/opend_small_box.png');
    this.load.image('puzzle_keypad', 'assets/puzzles/keypad.png');

    // 3. Player sprites & frames (9 frames per direction from NormalWalking.png)
    const directions = ['down', 'up', 'left', 'right'];
    directions.forEach(dir => {
      this.load.image(`player_${dir}`, `assets/player/player_${dir}.png`);
      for (let i = 0; i < 9; i++) {
        this.load.image(`player_${dir}_${i}`, `assets/player/player_${dir}_${i}.png`);
      }
    });

    // 4. Level 2 assets
    this.load.image('maze_background', 'assets/level2/maze.png');
    this.load.image('vighna_shadow', 'assets/level2/vighna.png');
    this.load.image('diya_pickup', 'assets/level2/diya_pickup.png');

    // Player with Diya walking animations (7 frames per direction)
    directions.forEach(dir => {
      this.load.image(`player_diya_${dir}`, `assets/player/player_diya_${dir}.png`);
      for (let i = 0; i < 7; i++) {
        this.load.image(`player_diya_${dir}_${i}`, `assets/player/player_diya_${dir}_${i}.png`);
      }
    });

    // 5. Level 3 assets
    this.load.image('level3_livingroom', 'assets/level3/livingroom.png');
    this.load.image('level3_sofa', 'assets/level3/CloseupSofa.png');
    this.load.image('level3_piano', 'assets/level3/Closeuppaino.png');
    this.load.image('level3_laptop', 'assets/level3/closeupLaptop.png');
    this.load.image('level3_trophy', 'assets/level3/closeupTrophie.png');
    this.load.image('level3_painting1', 'assets/level3/Painting1.png');
    this.load.image('level3_painting2', 'assets/level3/Painting2.png');
    this.load.image('level3_painting3', 'assets/level3/Painting3.png');
    this.load.image('level3_painting4', 'assets/level3/Painting4.png');

    // Artefact fragment 2 & completed artefact
    this.load.image('item_artifact_2', 'assets/items/artifact_fragment_2.png');
    this.load.image('item_artifact_complete', 'assets/items/artifact_complete.png');
    this.load.image('level3_art_left', 'assets/level3/ArtLeft.png');
    this.load.image('level3_art_right', 'assets/level3/ArtRight.png');
    this.load.image('level3_art_full', 'assets/level3/ArtFull.png');

    // Level 4 assets & sacred image icons
    this.load.image('level4_room', 'assets/level4/level4_room.png');
    this.load.image('icon_elephant', 'assets/level4/icons/icon_elephant.png');
    this.load.image('icon_diya', 'assets/level4/icons/icon_diya.png');
    this.load.image('icon_trident', 'assets/level4/icons/icon_trident.png');
    this.load.image('icon_temple', 'assets/level4/icons/icon_temple.png');
    this.load.image('icon_flower', 'assets/level4/icons/icon_flower.png');
    this.load.image('icon_mushak', 'assets/level4/icons/icon_mushak.png');
    this.load.image('icon_bell', 'assets/level4/icons/icon_bell.png');
    this.load.image('icon_lotus', 'assets/level4/icons/icon_lotus.png');

    // 6. Level & Main Menu Background Music Audio Assets
    this.load.audio('mainmenu_bgm', 'assets/audio/mainmenu_bg.mp3');
    this.load.audio('level1_bgm', 'assets/audio/level1_bg.mp3');
    this.load.audio('level2_bgm', 'assets/audio/level2_bg.mp3');
    this.load.audio('level3_bgm', 'assets/audio/level3_bg.mp3');
    this.load.audio('level4_bgm', 'assets/audio/level4_bg.mp3');

    // 7. Cutscene Level Transition Images
    // Beginning Intro Cutscene
    this.load.image('intro_1', 'assets/intro/intro_1.png');
    this.load.image('intro_2', 'assets/intro/intro_2.png');
    this.load.image('intro_3', 'assets/intro/intro_3.png');
    this.load.image('intro_4', 'assets/intro/intro_4.png');
    this.load.image('intro_5', 'assets/intro/intro_5.png');
    this.load.image('intro_6', 'assets/intro/intro_6.png');

    // Transition 1 (Level 1 -> 2)
    this.load.image('trans1_1', 'assets/transitions/trans1_1.png');
    this.load.image('trans1_2', 'assets/transitions/trans1_2.png');
    this.load.image('trans1_3', 'assets/transitions/trans1_3.png');

    // Transition 2 (Level 2 -> 3)
    this.load.image('trans2_1', 'assets/transitions/trans2_1.png');
    this.load.image('trans2_2', 'assets/transitions/trans2_2.png');
    this.load.image('trans2_3', 'assets/transitions/trans2_3.png');
    this.load.image('trans2_4', 'assets/transitions/trans2_4.png');

    // Transition 3 (Level 3 -> 4)
    this.load.image('trans3_1', 'assets/transitions/trans3_1.png');
    this.load.image('trans3_2', 'assets/transitions/trans3_2.png');
    this.load.image('trans3_3', 'assets/transitions/trans3_3.png');

    // 8. Final Outro Cutscene Images & Audio Voiceovers
    this.load.image('final_1', 'assets/final/final_1.png');
    this.load.image('final_2', 'assets/final/final_2.png');
    this.load.image('final_3', 'assets/final/final_3.png');
    this.load.image('final_4', 'assets/final/final_4.png');
    this.load.image('final_screen', 'assets/final/final_screen.png');

    this.load.audio('final_vo_1', 'assets/final/final_audio_1.mp3');
    this.load.audio('final_vo_2', 'assets/final/final_audio_2.mp3');
    this.load.audio('final_vo_3', 'assets/final/final_audio_3.mp3');
    this.load.audio('final_vo_4_1', 'assets/final/final_audio_4_1.mp3');
    this.load.audio('final_vo_4_2', 'assets/final/final_audio_4_2.mp3');
    this.load.audio('final_vo_4_3', 'assets/final/final_audio_4_3.mp3');
    this.load.audio('final_sound', 'assets/final/final_sound.mp3');
  }

  create() {
    this.createCharacterAnimations();
    
    // Check if directly testing a specific level via query param ?level=N
    const params = new URLSearchParams(window.location.search);
    if (params.get('level') === '1') {
      GameState.reset();
      this.scene.start('Level1Scene');
      this.scene.launch('UIScene');
      return;
    }
    if (params.get('level') === '2') {
      GameState.startLevel2();
      this.scene.start('Level2Scene');
      this.scene.launch('UIScene');
      return;
    }
    if (params.get('level') === '3') {
      GameState.startLevel3();
      this.scene.start('Level3Scene');
      this.scene.launch('UIScene');
      return;
    }
    if (params.get('level') === '4') {
      GameState.startLevel4();
      this.scene.start('Level4Scene');
      this.scene.launch('UIScene');
      return;
    }

    // Default: Launch Title / Main Menu Screen
    this.scene.start('MainMenuScene');
  }

  private createCharacterAnimations() {
    const directions = ['down', 'up', 'left', 'right'];
    
    // Standard walking animations (9 frames from NormalWalking.png)
    directions.forEach(dir => {
      const frames = [];
      for (let i = 0; i < 9; i++) {
        frames.push({ key: `player_${dir}_${i}` });
      }
      this.anims.create({
        key: `walk_${dir}`,
        frames: frames,
        frameRate: 10,
        repeat: -1
      });
    });

    // Diya-carrying walking animations
    directions.forEach(dir => {
      const frames = [];
      for (let i = 0; i < 7; i++) {
        frames.push({ key: `player_diya_${dir}_${i}` });
      }
      this.anims.create({
        key: `walk_diya_${dir}`,
        frames: frames,
        frameRate: 9,
        repeat: -1
      });
    });
  }
}
