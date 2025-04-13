import BoardScene from './scenes/board-scene.js';
import MainMenuScene from './scenes/main-menu-scene.js';
import CharacterSelectionScene from './scenes/character-selection-scene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignContent: 'center',
    // scene: [MainMenuScene, CharacterSelectionScene, BoardScene],
    scene: [BoardScene],
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

const game = new Phaser.Game(config);
