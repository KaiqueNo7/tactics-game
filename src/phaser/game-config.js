import GameScene from './scenes/game-scene.js';
import MainMenuScene from './scenes/main-menu-scene.js';
import HeroSelectionScene from './scenes/hero-selection-scene.js';
import MatchOnlineScene from './scenes/match-online-scene.js';
import FindingMatchScene from './scenes/finding-match-scene.js';
import PreMatchScene from './scenes/pre-match-scene.js';

const config = {
  alignContent: 'center',
  backgroundColor: '#333333',
  justifyContent: 'center',
  parent: 'game-container',
  physics: {
    arcade: {
      debug: false,
    },
    default: 'arcade'
  },
  scale: {
    autoCenter: Phaser.Scale.CENTER_BOTH,
    mode: Phaser.Scale.FIT
  },
  scene: [FindingMatchScene, PreMatchScene, HeroSelectionScene, GameScene],
  type: Phaser.AUTO,
  width: 800
};

new Phaser.Game(config);
