import BoardScene from './scenes/board-scene.js';
import MainMenuScene from './scenes/main-menu-scene.js';
import HeroSelectionScene from './scenes/hero-selection-scene.js';
import MatchOnlineScene from './scenes/match-online-scene.js';
import FindingMatchScene from './scenes/finding-match-scene.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#333333',
  justifyContent: 'center',
  alignContent: 'center',
  scene: [MainMenuScene, MatchOnlineScene, FindingMatchScene, HeroSelectionScene, BoardScene],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);
