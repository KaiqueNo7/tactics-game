import Board from '../../core/board.js';
import GameManager from '../../core/game-manager.js';
import UIManager from '../../ui/hud.js';
import GameUI from '../../ui/game-ui.js';
import { getSocket } from '../../services/game-api-service.js';
import { getUserData } from '../../utils/helpers.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {     
    //
  }

  async create(state) {
    const { roomId } = state.gameState;
    const { height } = this.scale;

    const socket = getSocket();

    this.roomId = roomId;
    this.user = getUserData();

    if (!this.user) {
      console.error('Usuário não encontrado! Redirecionando para login...');
      this.scene.start('LoginScene');
      return;
    }

    this.gameUI = new GameUI(this, socket, this.roomId, this.user);
    this.gameUI.createBackground();
    this.gameUI.createEndTurnButton();
  
    this.uiManager = new UIManager(this, this.roomId);
    this.gameManager = new GameManager(this, socket, this.user);

    this.board = new Board(this, socket, this.roomId, this.gameManager, this.user);
    this.board.initializeBoard();
    this.board.createHexagons();

    await this.gameManager.buildFromGameState(state.gameState, this.board, this.gameUI);
    
    this.gameUI.updateGamePanel(this.gameManager.getPlayers());

    this.pingText = this.add.text(10, height - 30, 'ms', {
      fontSize: '16px',
      fill: '#FF0',
    });

    this.events.once('shutdown', () => {
      this.gameManager.turnManager.dispose();
      this.gameManager.dispose();
    });
  } 

  update() {

  }
}