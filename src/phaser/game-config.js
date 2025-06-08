import GameScene from './scenes/game-scene.js';
import MainMenuScene from './scenes/main-menu-scene.js';
import HeroSelectionScene from './scenes/hero-selection-scene.js';
import MatchOnlineScene from './scenes/match-online-scene.js';
import FindingMatchScene from './scenes/finding-match-scene.js';
import PreMatchScene from './scenes/pre-match-scene.js';
import LoginScene from './scenes/login-scene.js';
import RegisterScene from './scenes/register-scene.js';
import { BootScene } from './scenes/boot-scene.js';
import { ReconnectScene } from './scenes/reconnect-scene.js';

export const config = {
  type: Phaser.CANVAS,
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
    width: 430,
    height: 700,
    min: {
      width: 360,
      height: 640
    },
    max: {
      width: 1080,
      height: 1920
    }
  },
  dom: {
    createContainer: true
  },
  render: {
    pixelArt: false,
    antialias: true,
    antialiasGL: false
  },
  fps: {
    target: 60,
    forceSetTimeOut: false,
    min: 10,
    deltaHistory: 10,
  },
  scene: [
    BootScene,
    ReconnectScene,
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
