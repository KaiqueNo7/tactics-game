import GameScene from './scenes/game-scene.js';
import MainMenuScene from './scenes/main-menu-scene.js';
import HeroSelectionScene from './scenes/hero-selection-scene.js';
import MatchOnlineScene from './scenes/match-online-scene.js';
import FindingMatchScene from './scenes/finding-match-scene.js';
import PreMatchScene from './scenes/pre-match-scene.js';
import LoginScene from './scenes/login-scene.js';
import RegisterScene from './scenes/register-scene.js';

export const config = {
  type: Phaser.AUTO,
  backgroundColor: '#333333',
  parent: 'game-container',
  audio: {
    noAudio: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight,
    min: {
      width: 320,
      height: 480
    },
    max: {
      width: 1600,
      height: 1200
    }
  },
  dom: {
    createContainer: true
  },
  render: {
    pixelArt: false,
    antialias: true,
    antialiasGL: true,
  },
  fps: {
    target: 60,
    forceSetTimeOut: true
  },
  scene: [
    LoginScene,
    RegisterScene,
    MainMenuScene,
    MatchOnlineScene,
    FindingMatchScene,
    PreMatchScene,
    HeroSelectionScene,
    GameScene
  ]
};

export const game = new Phaser.Game(config);
