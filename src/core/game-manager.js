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

  checkGameState() {
    const alivePlayers = this.gameState.players.filter(player =>
      player.heroes.some(char => char.state.isAlive)
    );

    if (alivePlayers.length === 1) {
      const winner = alivePlayers[0];
      this.finishGame(winner.id);
    }
  }

  buildFromGameState(state, board, gameUI) {
    this.gameState = state;
    this.board = board;
    this.gameUI = gameUI;
    this.roomId = state.roomId;
    this.startedPlayerId = state.startedPlayerId;

    console.log(state);
  
    const players = state.players.map(playerData => {
      const player = new Player(playerData.name, [], playerData.id);
  
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
  
    this.player1 = players[0];
    this.player2 = players[1];
  
    this.player1.heroes.forEach(hero => {
      this.scene.gameUI.placeHeroOnBoard(hero, hero.state.position, 'hexagon_blue');
    });

    this.player2.heroes.forEach(hero => {
      this.scene.gameUI.placeHeroOnBoard(hero, hero.state.position, 'hexagon_red');
    });

    const allHeroes = [...this.player1.heroes, ...this.player2.heroes];

    allHeroes.forEach(hero => {
      if(!hero.state.isAlive){
        hero.die();
      }
    });
  
    this.setupMatch(players, state);
  }  

  setupMatch(players, gameState) {
    if(!gameState) {
      console.warn('Sem estado de jogo');
      return
    }

    this.turnManager = new TurnManager(
      this.board,
      this.gameUI,
      this.startedPlayerId,
      this,
    );

    this.currentTurn = this.turnManager.currentTurn;

    this.turnManager.triggerStartOfTurnSkills(players);

    const playerIndex = players.findIndex(player => player.id === this.startedPlayerId);

    this.gameUI.updateTurnPanel(playerIndex, this.currentTurn.numberTurn);

    const isMyTurn = this.startedPlayerId === sessionStorage.getItem('playerId');
    this.gameUI.setEndTurnButtonEnabled(isMyTurn);

    setupSocketListeners(this.socket, this.turnManager, this);
    boardSocketListeners(this.board, this.socket, this);
  }
  
  getPlayerById(playerId) {
    return [this.player1, this.player2].find(p => p.id === playerId);
  }

  sendGameStateUpdate() {
    if (this.socket && this.roomId) {
      console.log(this.gameState);
      this.socket.emit(SOCKET_EVENTS.UPDATE_GAME_STATE, {
        roomId: this.roomId,
        gameState: this.gameState
      });
    }
  }

  finishGame(winnerId) {
    this.gameState.status = 'finished';
    this.gameState.winnerId = winnerId;

    const iWon = this.gameState.winnerId === sessionStorage.getItem('playerId');

    this.scene.uiManager.showVictoryUI(iWon);
    this.socket.emit(SOCKET_EVENTS.GAME_FINISHED, { winnerId });
    
    this.sendGameStateUpdate();
  }

  getTurnManager() {
    return this.turnManager;
  }

  getPlayers() {
    return [this.player1, this.player2];
  }

  getHeroById(heroId) {
    const allHeroes = [...this.player1.heroes, ...this.player2.heroes];
    return allHeroes.find(hero => hero.id === heroId);
  }

  getHeroByPosition(position) {
    const allHeroes = [...this.player1.heroes, ...this.player2.heroes];
    return allHeroes.find(hero => hero.state.position === position);
  }

  showGameState() {
    console.log(this.gameState);
  }  

  updateCurrentTurn(currentTurn) {
    const playerId = currentTurn.playerId;
    const numberTurn = currentTurn.numberTurn;
    const attackedHeroes = new Set(Object.keys(currentTurn.attackedHeroes || {}));
    const movedHeroes = new Set(Object.keys(currentTurn.movedHeroes || {}));
    const counterAttack = currentTurn.counterAttack;

    this.gameState.currentTurn = {
      playerId,
      numberTurn,
      attackedHeroes,
      movedHeroes,
      counterAttack
    };
  
    this.gameState.lastActionTimestamp = Date.now();
  
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