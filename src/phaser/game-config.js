import BoardScene from './scenes/board-scene.js';
import WarningTextPlugin from './plugins/warning-text-plugin.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignContent: 'center',
    scene: [BoardScene],
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
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
