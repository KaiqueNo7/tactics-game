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
    this.load.spritesheet('heroes', 'assets/sprites/heroes.png', {
      frameHeight: 64,
      frameWidth: 59
    });        
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

  create(data) {
    const state = data.players ? data : data.gameState;

    console.log('GameScene create', state);

    const reconnect = data.reconnect ?? false;

    const { roomId, players, startedPlayerIndex } = state;

    console.log(roomId, players, startedPlayerIndex);
  
    this.roomId = roomId;
    this.players = players;
    this.startedPlayerIndex = startedPlayerIndex;
  
    this.gameUI = new GameUI(this, socket, this.roomId);
    this.gameUI.createBackground();
    this.gameUI.createEndTurnButton();
  
    this.board = new Board(this, 45, socket, this.roomId);
    this.board.initializeBoard();
    this.board.createHexagons();
  
    this.inputManager = new BoardInputManager(this, this.board, socket);
  
    const player1Data = players.find(p => p.index === 1);
    const player2Data = players.find(p => p.index === 2);
  
    this.uiManager = new UIManager(this, this.roomId);
  
    this.gameManager = new GameManager(this);

    if(reconnect) {
      this.gameManager.rebuildFromState(state, this.board);
    } else {
      this.gameManager.initFromMatch(
        player1Data,
        player2Data,
        this.roomId,
        this.startedPlayerIndex,
        this.board
      );
    }
  
    const turnManager = this.gameManager.getTurnManager();
    const currentTurnPlayer = turnManager.currentTurn.player;
    const currentTurnRoundNumber = turnManager.currentTurn.roundNumber;
  
    this.gameUI.updateTurnPanel(currentTurnPlayer, currentTurnRoundNumber);
    this.gameUI.updateGamePanel(turnManager.players);
  } 

  update() {
    //
  }
}