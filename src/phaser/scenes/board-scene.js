import Board from '../../core/board.js';
import GameManager from '../../core/game.js';
import UIManager from '../../ui/hud.js';
import GameUI from '../../ui/game-ui.js';

export default class BoardScene extends Phaser.Scene {
    constructor() {
        super('BoardScene');
    }

    preload() {
        this.load.spritesheet('heroes', 'assets/sprites/heroes.png', {
            frameWidth: 59,
            frameHeight: 64
        });        
        this.load.image('background', 'assets/background/01.jpg')
        this.load.image('hexagon_blue', 'assets/sprites/hexagon_blue.png');
        this.load.image('hexagon_red', 'assets/sprites/hexagon_red.png');
        this.load.image('hex_highlight', 'assets/sprites/hexagon_free.png');
        this.load.image('hex_highlight_enemy', 'assets/sprites/hex_enemy.png');
        this.load.image('next_turn', 'assets/ui/next_turn.png')
        this.load.image('hexagon', 'assets/sprites/hexagon.png');
        this.load.image('hex_tile', 'assets/ui/hex_tile.png');
        this.load.image('hex_tile_p1', 'assets/ui/hex_tile_p1.png');
        this.load.image('hex_tile_p2', 'assets/ui/hex_tile_p2.png');
        this.load.image('heart', 'assets/ui/heart.png');
        this.load.image('swords', 'assets/ui/swords.png');
        this.load.image('poison', 'assets/ui/poison.png');
        this.load.image('shield', 'assets/ui/shield.png');
        this.load.image('ui_box_brown', 'assets/ui/ui_box_brown.png');
    }

    create() {
        const bg = this.add.image(0, 0, 'background');

        bg.setOrigin(0);
        bg.setDisplaySize(this.scale.width, this.scale.height);

        this.uiManager = new UIManager(this);
        this.gameUI = new GameUI(this);

        if (!this.textures.exists('boardCanvas')) {
            this.canvas = this.textures.createCanvas('boardCanvas', this.cameras.main.width, this.cameras.main.height);
        } else {
            this.canvas = this.textures.get('boardCanvas');
        }
        
        this.board = new Board(this, 45);  

        this.board.initializeBoard();
        this.board.createHexagons();

        this.gameManager = new GameManager(this, this.board, this.selectedHeroesP1, this.selectedHeroesP2);
        this.game.gameManager = this.gameManager;

        const turnManager = this.game.gameManager.getTurnManager();

        this.uiManager.createEndTurnButton(turnManager);
        this.uiManager.updateTurnPanel(turnManager.currentTurn.player, turnManager.currentTurn.roundNumber);
        this.uiManager.updateGamePanel(turnManager.players);

        this.gameUI.showMessage(turnManager.currentTurn.player.name + ' - Começa o jogo!');
    }  

    init(data) {
        this.selectedHeroesP1 = data.player1;
        this.selectedHeroesP2 = data.player2;
    }    
    
    update() {
        // Lógica de atualização, se necessário
    }
}