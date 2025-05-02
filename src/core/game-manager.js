import TurnManager from './turn-manager.js';
import Player from './player.js';
import { Gold, Vic, Dante, Ralph, Ceos, Blade } from '../heroes/heroes.js';
import socket from '../services/game-api-service.js';
import { setupSocketListeners } from '../services/listener-socket-events.js';
import { SOCKET_EVENTS } from '../../api/events.js';
import { boardSocketListeners } from '../services/board-socket-events.js';

const HERO_CLASSES = {
  Blade,
  Ceos,
  Dante,
  Gold,
  Ralph,
  Vic
};

export default class GameManager extends Phaser.Events.EventEmitter {
  constructor(scene) {
    super();
    this.scene = scene;
    this.socket = socket;
  }

  initFromMatch(player1Data, player2Data, roomId, startedPlayerIndex, board) {
    this.board = board;
    this.roomId = roomId;
    this.startedPlayerIndex = startedPlayerIndex;

    this.player1 = new Player(player1Data.name, [], player1Data.id);
    this.player1.setNumber(player1Data.number);

    this.player2 = new Player(player2Data.name, [], player2Data.id);
    this.player2.setNumber(player2Data.number);

    const player1Heroes = player1Data.heroes.map(name =>
      new HERO_CLASSES[name](this.scene, 0, 0, this.socket)
    );
    const player2Heroes = player2Data.heroes.map(name =>
      new HERO_CLASSES[name](this.scene, 0, 0, this.socket)
    );

    this.player1.addHeroes(player1Heroes);
    this.player2.addHeroes(player2Heroes);

    this.setupMatch([this.player1, this.player2]);
  }

  rebuildFromState(gameState, board) {
    this.board = board;
    this.roomId = gameState.matchId;

    const players = gameState.players.map(playerData => {
      const player = new Player(playerData.name, [], playerData.id);
      player.setNumber(playerData.number);
      return player;
    });

    players.forEach(player => {
      const heroInstances = player.heroes.map(heroId => {
        const heroData = gameState.heroes[heroId];
        const HeroClass = HERO_CLASSES[heroData.name];
        const hero = new HeroClass(this.scene, 0, 0, this.socket);

        hero.setId(heroData.id);
        hero.setBoardPosition(heroData.position);
        hero.stats.attack = heroData.currentAttack;
        hero.stats.currentHealth = heroData.currentHealth;
        hero.state.statusEffects = heroData.statusEffects || [];

        return hero;
      });

      player.addHeroes(heroInstances);
    });

    this.player1 = players.find(p => p.number === 1);
    this.player2 = players.find(p => p.number === 2);

    this.setupMatch([this.player1, this.player2], gameState);
  }

  setupMatch(players, gameState = null) {
    this.turnManager = new TurnManager(
      this.scene,
      players,
      this.socket,
      this.roomId,
      this.startedPlayerIndex,
      this
    );

    this.currentTurn = this.turnManager.currentTurn;

    if (!gameState) {
      this.setupInitialPositions();
      this.turnManager.triggerStartOfTurnSkills(players);
    }

    this.buildGameState(gameState);
    setupSocketListeners(this.scene, this.socket, this.turnManager, this);
    boardSocketListeners(this.board, this.socket, this);
  }

  buildGameState(existingState) {
    if (existingState) {
      this.gameState = existingState;
      return;
    }

    this.gameState = {
      roomId: this.roomId,
      players: [this.player1, this.player2].map(p => ({
        id: p.id,
        name: p.name,
        heroes: p.heroes.map(hero => ({
          id: hero.id,
          name: hero.name,
        })),
        // heroesData: p.heroes.map(hero => ({
        number: p.number
      })),
      currentTurnPlayerId: this.turnManager.getCurrentPlayer().id,
      lastActionTimestamp: Date.now(),
      status: 'in_progress'
    };

  }

  setupInitialPositions() {
    this.player2.heroes[0].state.position = 'B1';
    this.player2.heroes[1].state.position = 'C1';
    this.player2.heroes[2].state.position = 'D1';

    this.player1.heroes[0].state.position = 'C6';
    this.player1.heroes[1].state.position = 'D7';
    this.player1.heroes[2].state.position = 'B7';

    this.player1.heroes.forEach(hero => {
      this.scene.gameUI.placeHeroOnBoard(hero, hero.state.position, 'hexagon_blue');
    });

    this.player2.heroes.forEach(hero => {
      this.scene.gameUI.placeHeroOnBoard(hero, hero.state.position, 'hexagon_red');
    });
  }

  getPlayerById(id) {
    return [this.player1, this.player2].find(p => p.id === id);
  }

  sendGameStateUpdate() {
    if (this.socket && this.roomId) {
      this.socket.emit(SOCKET_EVENTS.UPDATE_GAME_STATE, {
        roomId: this.roomId,
        gameState: this.gameState
      });
    }
  }

  finishGame() {
    const { winner } = this.gameState;
    this.isGameOver = true;
    this.scene.uiManager.showVictoryUI(winner);
  }

  getTurnManager() {
    return this.turnManager;
  }

  getHeroById(heroId) {
    const allHeroes = [...this.player1.heroes, ...this.player2.heroes];
    return allHeroes.find(hero => hero.id === heroId);
  }

  showGameState() {
    console.log(this.gameState);
  }  

  updateCurrentTurn(playerId) {
    this.gameState.currentTurnPlayerId = playerId;
    this.gameState.lastActionTimestamp = new Date().getTime();

    this.sendGameStateUpdate();
  }  

  updateHeroStats(heroId, { currentHealth, isAlive, currentAttack, statusEffects }) {
    const hero = this.gameState.heroes[heroId];
    
    if (!hero) {
      console.warn(`Hero ID ${heroId} não encontrado para atualização.`);
      return;
    }
  
    if (currentHealth !== undefined) hero.currentHealth = currentHealth;
    if (isAlive !== undefined) hero.isAlive = isAlive;
    if (currentAttack !== undefined) hero.currentAttack = currentAttack;
    if (statusEffects !== undefined) hero.statusEffects = statusEffects;

    console.log(`Atualizando stats do herói ${heroId}:`);
    console.log(`- Vida: ${hero.currentHealth}`);
  
    this.gameState.lastActionTimestamp = Date.now();

    this.sendGameStateUpdate();
  }
  
  updateHeroPosition(heroId, newPosition) {
    const hero = this.gameState.heroes[heroId];
    
    if (!hero) {
      console.warn(`Hero ID ${heroId} não encontrado para atualização de posição.`);
      return;
    }
  
    console.log(`Atualizando posição do herói ${heroId} para ${newPosition}`);

    hero.position = newPosition;
    this.gameState.lastActionTimestamp = Date.now();

    this.sendGameStateUpdate();
  }
}