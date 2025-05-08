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
    //
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