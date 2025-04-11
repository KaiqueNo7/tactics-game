import BoardScene from './scenes/board-scene.js';
import MainMenuScene from './scenes/main-menu-scene.js';
import CharacterSelectionScene from './scenes/character-selection-scene.js';
import WarningTextPlugin from './plugins/warning-text-plugin.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignContent: 'center',
    scene: [MainMenuScene, CharacterSelectionScene, BoardScene],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    plugins: {
        scene: [
            { key: 'WarningTextPlugin', plugin: WarningTextPlugin, mapping: 'warningTextPlugin' }
        ]
    }
};

const game = new Phaser.Game(config);
