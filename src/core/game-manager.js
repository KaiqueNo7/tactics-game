import TurnManager from './turn-manager.js';
import Player from './player.js';
import socket from '../services/game-api-service.js';
import { setupSocketListeners } from '../services/listener-socket-events.js';
import { SOCKET_EVENTS } from '../../api/events.js';
import { boardSocketListeners } from '../services/board-socket-events.js';
import { createHeroByName } from '../heroes/heroFactory.js';

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
      createHeroByName(name, this.scene, 0, 0, this.socket)
    );
    
    const player2Heroes = player2Data.heroes.map(name =>
      createHeroByName(name, this.scene, 0, 0, this.socket)
    );

    this.player1.addHeroes(player1Heroes);
    this.player2.addHeroes(player2Heroes);

    this.setupMatch([this.player1, this.player2]);
  }

  rebuildFromState(gameState, board) {
    this.board = board;
    this.roomId = gameState.roomId;
  
    const players = gameState.players.map(playerData => {
      const player = new Player(playerData.name, [], playerData.id, playerData.number);
      
      const heroes = playerData.heroes.map(heroData => {
        const hero = createHeroByName(heroData.name, this.scene, 0, 0, this.socket);
  
        hero.stats.attack = heroData.stats.attack;
        hero.stats.currentHealth = heroData.stats.currentHealth;
        hero.state.position = heroData.state.position;
        hero.state.isAlive = heroData.state.isAlive;
        hero.state.statusEffects = heroData.state.statusEffects || [];
  
        return hero;
      });
  
      player.addHeroes(heroes);
      return player;
    });
  
    this.player1 = players.find(p => p.number === 1);
    this.player2 = players.find(p => p.number === 2);
  
    this.player1.heroes.forEach(hero => {
      this.scene.gameUI.placeHeroOnBoard(hero, hero.state.position, 'hexagon_blue');
    });
  
    this.player2.heroes.forEach(hero => {
      this.scene.gameUI.placeHeroOnBoard(hero, hero.state.position, 'hexagon_red');
    });
  
    this.setupMatch(players, gameState);
  }  

  setupMatch(players, gameState = null) {
    let currentTurnIndex = false;

    if(gameState) {
      currentTurnIndex = players.findIndex(player => player.id === gameState.currentTurnPlayerId);
    }

    this.turnManager = new TurnManager(
      this.scene,
      players,
      this.socket,
      this.roomId,
      this.startedPlayerIndex,
      this,
      currentTurnIndex
    );

    this.currentTurn = this.turnManager.currentTurn;

    if (!gameState) {
      this.setupInitialPositions();
      this.turnManager.determineStartingPlayer();
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
        number: p.number,
        heroes: p.heroes.map(hero => ({
          id: hero.id,
          name: hero.name,
          stats: {
            attack: hero.stats.attack,
            currentHealth: hero.stats.currentHealth,
          },
          state: {
            position: hero.state.position,
            isAlive: hero.state.isAlive,
            statusEffects: hero.state.statusEffects || [],
          }
        })),
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
    for (const player of this.gameState.players) {
      const hero = player.heroes.find(h => h.id === heroId);
      if (!hero) continue;
  
      if (currentHealth !== undefined) hero.stats.currentHealth = currentHealth;
      if (isAlive !== undefined) hero.state.isAlive = isAlive;
      if (currentAttack !== undefined) hero.stats.attack = currentAttack;
      if (statusEffects !== undefined) hero.state.statusEffects = statusEffects;
  
      this.gameState.lastActionTimestamp = Date.now();
      this.sendGameStateUpdate();
      return;
    }
  
    console.warn(`Herói com ID ${heroId} não encontrado para update de stats.`);
  }
  
  updateHeroPosition(heroId, newPosition) {
    for (const player of this.gameState.players) {
      const hero = player.heroes.find(h => h.id === heroId);
      console.log(hero);

      if (!hero) continue;
  
      console.log(`Atualizando posição do herói ${hero.name} para ${newPosition}`);
      hero.state.position = newPosition;
      this.gameState.lastActionTimestamp = Date.now();
      this.sendGameStateUpdate();
      return;
    }
  
    console.warn(`Herói com ID ${heroId} não encontrado para update de posição.`);
  }  
}