import TurnManager from './turn-manager.js';
import Player from './player.js';
import { Gold, Vic, Dante, Ralph, Ceos, Blade } from '../heroes/heroes.js';
import socket from '../services/game-api-service.js';

const HERO_CLASSES = {
  Blade,
  Ceos,
  Dante,
  Gold,
  Ralph,
  Vic
};

export default class GameManager extends Phaser.GameObjects.Container {
  constructor(scene, board, player1Data, player2Data, roomId, startedPlayerIndex) {
    super(scene);

    this.scene = scene;
    this.board = board;
    this.socket = socket;
    this.roomId = roomId;
    this.startedPlayerIndex = startedPlayerIndex;

    this.player1 = new Player(player1Data.name, [], player1Data.id);
    this.player1.setNumber(player1Data.number);

    this.player2 = new Player(player2Data.name, [], player2Data.id);
    this.player2.setNumber(player2Data.number);

    const player1Heroes = player1Data.heros.map(name => new HERO_CLASSES[name](scene, 0, 0, this.socket));
    const player2Heroes = player2Data.heros.map(name => new HERO_CLASSES[name](scene, 0, 0, this.socket));

    this.player1.addHeroes(player1Heroes);
    this.player2.addHeroes(player2Heroes);

    this.turnManager = new TurnManager(this.scene, [this.player1, this.player2], this.socket, this.roomId, this.startedPlayerIndex);
    this.currentTurn = this.turnManager.currentTurn;

    this.setupInitialPositions();

    this.turnManager.triggerStartOfTurnSkills(this.turnManager.players);
  }

  setupInitialPositions() {
    this.player2.heros[0].state.position = 'B1';
    this.player2.heros[1].state.position = 'C1';
    this.player2.heros[2].state.position = 'D1';

    this.player1.heros[0].state.position = 'C6';
    this.player1.heros[1].state.position = 'D7';
    this.player1.heros[2].state.position = 'B7';

    this.player1.heros.forEach(hero => {
      this.board.placeHero(hero, hero.state.position, this.player1.number);
    });

    this.player2.heros.forEach(hero => {
      this.board.placeHero(hero, hero.state.position, this.player2.number);
    });
  }

  getPlayerById(id) {
    return [this.player1, this.player2].find(p => p.id === id);
  }

  setGameState(gameState) {
    this.gameState = gameState;
  }

  finishGame() {
    const { winner } = this.gameState;
    this.isGameOver = true;
    this.scene.uiManager.showVictoryUI(winner);
  }

  getTurnManager() {
    return this.turnManager;
  }
}
