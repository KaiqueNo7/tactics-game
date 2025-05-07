import Board from '../../core/board.js';
import GameManager from '../../core/game-manager.js';
import UIManager from '../../ui/hud.js';
import GameUI from '../../ui/game-ui.js';
import socket from '../../services/game-api-service.js';
import BoardInputManager from '../../ui/board-input-manager.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {     
    this.load.image('background_game', 'assets/background/01.png');
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

  async create(state) {
    const { roomId } = state.gameState

    this.roomId = roomId;

    this.gameUI = new GameUI(this, socket, this.roomId);
    this.gameUI.createBackground();
    this.gameUI.createEndTurnButton();
  
    this.uiManager = new UIManager(this, this.roomId);
    this.gameManager = new GameManager(this);

    this.board = new Board(this, socket, this.roomId, this.gameManager);
    this.board.initializeBoard();
    this.board.createHexagons();
  
    this.inputManager = new BoardInputManager(this, this.board, socket);

    await this.gameManager.buildFromGameState(state.gameState, this.board, this.gameUI);
    
    this.gameUI.updateGamePanel(this.gameManager.getPlayers());
  } 

  update() {
    //
  }
}