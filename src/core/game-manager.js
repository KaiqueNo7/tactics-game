import TurnManager from './turn-manager.js';
import Player from './player.js';
import { getSocket } from '../services/game-api-service.js';
import { setupSocketListeners } from '../services/listener-socket-events.js';
import { SOCKET_EVENTS } from '../../api/events.js';
import { boardSocketListeners } from '../services/board-socket-events.js';
import { createHeroByName } from '../heroes/heroFactory.js';

export default class GameManager extends Phaser.Events.EventEmitter {
  constructor(scene, socket, user) {
    super();
    this.scene = scene;
    this.socket = getSocket() || socket;
    this.user = user;
  }

  checkGameState() {
    const alivePlayers = this.gameState.players.filter(player =>
      player.heroes.some(char => char.state.isAlive)
    );

    if (alivePlayers.length === 1) {
      const winner = alivePlayers[0];
      const roomId = this.gameState.roomId;

      this.gameState.status = 'finished';
      this.gameState.winnerId = winner.id;

      this.socket.emit(SOCKET_EVENTS.GAME_FINISHED_REQUEST, { 
        roomId,
        winner, 
        playerIds: [this.player1.id, this.player2.id] 
      });
    }
  }

 async buildFromGameState(state, board, gameUI) {
    this.gameState = state;
    this.board = board;
    this.gameUI = gameUI;
    this.roomId = state.roomId;
    this.startedPlayerId = state.startedPlayerId;

    const players = await Promise.all(state.players.map(async playerData => {
      const player = new Player(playerData.name, [], playerData.id);

      const heroes = await Promise.all(playerData.heroes.map(async heroData => {
        const hero = await createHeroByName(heroData.name, this.scene, 0, 0, this.socket);

        if (!hero.stats) {
          throw new Error(`Stats não definido para o herói ${heroData.name}`);
        }

        hero.stats.attack = heroData.stats.attack;
        hero.stats.currentHealth = heroData.stats.currentHealth;
        hero.state.position = heroData.state.position;
        hero.state.isAlive = heroData.state.isAlive;
        hero.state.statusEffects = heroData.state.statusEffects || [];
        hero.firstAttack = heroData.firstAttack;

        return hero;
      }));

      player.addHeroes(heroes);
      return player;
    }));

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
      if (!hero.state.isAlive) {
        hero.die();
      }

      if (hero.state.isAlive && hero.state.statusEffects.length > 0) {
        this.rehydrateStatusEffects(hero);
      }
    });

    this.setupMatch(state);
  } 

  setupMatch(gameState) {
    if(!gameState) {
      console.warn('Sem estado de jogo');
      return
    }

    this.turnManager = new TurnManager(
      this.board,
      this.gameUI,
      this.startedPlayerId,
      this,
      this.user
    );

    this.currentTurn = this.turnManager.currentTurn;

    setupSocketListeners(this.socket, this, this.scene);
    boardSocketListeners(this.board, this.socket, this);
  }
  
  getPlayerById(playerId) {
    return [this.player1, this.player2].find(p => p.id === playerId);
  }

  markGameStateAsChanged() {
    this.gameState.lastActionTimestamp = Date.now();
    this.gameState.stateVersion = (this.gameState.stateVersion || 0) + 1;
  
    this.sendGameStateUpdate();
  }

  sendGameStateUpdate() {
    if (this.gameState && this.roomId) {
      this.socket.emit(SOCKET_EVENTS.UPDATE_GAME_STATE, {
        roomId: this.roomId,
        gameState: this.gameState
      });
    }
  }

  async finishGame(winnerId) {
    const iWon = winnerId === this.user.id ? true : false;

    this.scene.uiManager.showVictoryUI(iWon);
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

  rehydrateStatusEffects(hero) {
    hero.state.statusEffects.forEach(effect => {
      switch (effect.type) {
        case 'poison':
          effect.effect = (target) => {
            console.log(`${target.name} recebe 1 de dano por veneno!`);
            target.takeDamage(1);
          };
  
          hero.addPoisonEffect();
          break;
      }
    });
  }
  
  showGameState() {
    console.log(this.gameState);
  }  

  updateCurrentTurn(currentTurn) {
    const { playerId, numberTurn, attackedHeroes = [], movedHeroes = [], counterAttack = false } = currentTurn;
  
    this.gameState.currentTurn = {
      playerId,
      numberTurn,
      attackedHeroes,
      movedHeroes,
      counterAttack
    };
  
    this.markGameStateAsChanged();
  }

  updateHeroStats(heroId, { currentHealth, isAlive, currentAttack, statusEffects, firstAttack }) {
    for (const player of this.gameState.players) {
      const hero = player.heroes.find(h => h.id === heroId);
      if (!hero) continue;
  
      if (currentHealth !== undefined) hero.stats.currentHealth = currentHealth;
      if (isAlive !== undefined) hero.state.isAlive = isAlive;
      if (currentAttack !== undefined) hero.stats.attack = currentAttack;
      if (statusEffects !== undefined) hero.state.statusEffects = statusEffects;
      if (firstAttack !== undefined) hero.firstAttack = firstAttack;
  
      this.markGameStateAsChanged();
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
  
      this.markGameStateAsChanged();
      return;
    }
  
    console.warn(`Herói com ID ${heroId} não encontrado para update de posição.`);
  }
}