import './style.css';
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { Level1Scene } from './scenes/Level1Scene';
import { UIScene } from './scenes/UIScene';
import { NoteModal } from './scenes/Modals/NoteModal';
import { KeypadModal } from './scenes/Modals/KeypadModal';
import { MatClueModal } from './scenes/Modals/MatClueModal';
import { IconPuzzleModal } from './scenes/Modals/IconPuzzleModal';
import { OpendBoxModal } from './scenes/Modals/OpendBoxModal';
import { LevelCompleteScene } from './scenes/LevelCompleteScene';
import { Level2Scene } from './scenes/Level2Scene';
import { Level2CompleteScene } from './scenes/Level2CompleteScene';
import { Level2GameOverScene } from './scenes/Level2GameOverScene';
import { Level3Scene } from './scenes/Level3Scene';
import { Level3CompleteScene } from './scenes/Level3CompleteScene';
import { Level3CloseupModal } from './scenes/Modals/Level3CloseupModal';
import { ArtefactBoxModal } from './scenes/Modals/ArtefactBoxModal';
import { Level3DoorKeypadModal } from './scenes/Modals/Level3DoorKeypadModal';
import { Level4Scene } from './scenes/Level4Scene';
import { Level4ImagePuzzleModal } from './scenes/Modals/Level4ImagePuzzleModal';
import { DivineHintModal } from './scenes/Modals/DivineHintModal';
import { MorseChartModal } from './scenes/Modals/MorseChartModal';
import { PauseModal } from './scenes/Modals/PauseModal';
import { MainMenuScene } from './scenes/MainMenuScene';
import { GameCompleteScene } from './scenes/GameCompleteScene';
import { CutsceneScene } from './scenes/CutsceneScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  parent: 'game-container',
  backgroundColor: '#0a0604',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1024,
    height: 768
  },
  scene: [
    BootScene,
    MainMenuScene,
    Level1Scene,
    Level2Scene,
    Level3Scene,
    Level4Scene,
    UIScene,
    CutsceneScene,
    PauseModal,
    NoteModal,
    KeypadModal,
    MatClueModal,
    IconPuzzleModal,
    OpendBoxModal,
    Level3CloseupModal,
    ArtefactBoxModal,
    Level3DoorKeypadModal,
    Level4ImagePuzzleModal,
    DivineHintModal,
    MorseChartModal,
    LevelCompleteScene,
    Level2CompleteScene,
    Level2GameOverScene,
    Level3CompleteScene,
    GameCompleteScene
  ]
};

window.addEventListener('load', () => {
  const game = new Phaser.Game(config);

  // Helper to request fullscreen and lock landscape orientation
  const requestLandscape = async () => {
    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Ignored if user interaction requirement or permissions fail
    }

    try {
      if (screen.orientation && 'lock' in screen.orientation) {
        await (screen.orientation as any).lock('landscape');
      }
    } catch {
      // Ignored if orientation lock not supported on browser/iOS Safari
    }

    setTimeout(() => {
      game.scale.refresh();
    }, 200);
  };

  // Wire rotate button and touch on rotate prompt
  const rotateBtn = document.getElementById('rotate-btn');
  if (rotateBtn) {
    rotateBtn.addEventListener('click', requestLandscape);
    rotateBtn.addEventListener('touchend', requestLandscape);
  }

  // Refresh scale when orientation changes or screen resizes
  window.addEventListener('resize', () => {
    setTimeout(() => {
      game.scale.refresh();
    }, 150);
  });

  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      game.scale.refresh();
    }, 250);
  });

  if (screen.orientation) {
    screen.orientation.addEventListener('change', () => {
      setTimeout(() => {
        game.scale.refresh();
      }, 200);
    });
  }

  // Attempt orientation lock on first touch interaction anywhere
  window.addEventListener('touchstart', function tryLockOnFirstTouch() {
    try {
      if (screen.orientation && 'lock' in screen.orientation) {
        (screen.orientation as any).lock('landscape').catch(() => {});
      }
    } catch {}
    window.removeEventListener('touchstart', tryLockOnFirstTouch);
  }, { passive: true });
});

