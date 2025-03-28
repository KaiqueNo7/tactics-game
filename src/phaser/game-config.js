import BoardScene from './scenes/board-scene.js';
import CharacterScene from './scenes/character-scene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    scene: [BoardScene, CharacterScene],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    }
};

const game = new Phaser.Game(config);
export default game;