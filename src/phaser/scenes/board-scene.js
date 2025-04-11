import Board from '../../core/board.js';
import GameManager from '../../core/game.js';
import UIManager from '../../ui/hud.js';

export default class BoardScene extends Phaser.Scene {
    constructor() {
        super('BoardScene');
    }

    preload() {
        this.load.spritesheet('heroes', 'assets/sprites/heroes.png', {
            frameWidth: 59,
            frameHeight: 64
        });        
        this.load.image('hexagon_blue', 'assets/sprites/hexagon_blue.png');
        this.load.image('hexagon_red', 'assets/sprites/hexagon_red.png');
        this.load.image('hex_highlight', 'assets/sprites/hexagon_free.png');
        this.load.image('hexagon', 'assets/sprites/hexagon.png');
        this.load.image('heart', 'assets/ui/heart.png');
        this.load.image('swords', 'assets/ui/swords.png');
        this.load.image('poison', 'assets/ui/poison.png');
        this.load.image('shield', 'assets/ui/shield.png');
    }

    create() {
        this.uiManager = new UIManager(this);

        if (!this.textures.exists('boardCanvas')) {
            this.canvas = this.textures.createCanvas('boardCanvas', this.cameras.main.width, this.cameras.main.height);
        } else {
            this.canvas = this.textures.get('boardCanvas');
        }
        
        this.board = new Board(this, 45);  
        this.board.initializeBoard();
        this.board.createHexagons();

        this.gameManager = new GameManager(this, this.board); 
        this.game.gameManager = this.gameManager;

        const turnManager = this.game.gameManager.getTurnManager();

        this.uiManager.createEndTurnButton(turnManager);
        this.uiManager.updateTurnPanel(turnManager.currentTurn.player, turnManager.currentTurn.roundNumber);
        this.uiManager.updategamePanel(turnManager.players);
    }  
    
    update() {
        // Lógica de atualização, se necessário
    }
}