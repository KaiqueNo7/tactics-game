import TurnManager from './turn-manager.js';
import Player from './player.js';
import { Gold, Vic, Dante, Ralph, Ceos, Blade } from '../heroes/heroes.js';
import socket from '../services/game-api-service.js';
import { setupSocketListeners } from '../services/listener-socket-events.js';
import { SOCKET_EVENTS } from '../../api/events.js';

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

    console.log(player1Data.heroes, player2Data.heroes);

    const player1Heroes = player1Data.heroes.map(name => new HERO_CLASSES[name](scene, 0, 0, this.socket));
    const player2Heroes = player2Data.heroes.map(name => new HERO_CLASSES[name](scene, 0, 0, this.socket));

    this.player1.addHeroes(player1Heroes);
    this.player2.addHeroes(player2Heroes);

    this.turnManager = new TurnManager(this.scene, [this.player1, this.player2], this.socket, this.roomId, this.startedPlayerIndex, this);
    this.currentTurn = this.turnManager.currentTurn;

    this.setupInitialPositions();

    this.turnManager.triggerStartOfTurnSkills(this.turnManager.players);

    this.gameState = {
      matchId: this.roomId,
      players: {
        player1: {
          id: this.player1.id,
          name: this.player1.name,
          heroes: this.player1.heroes.map(hero => hero.id)
        },
        player2: {
          id: this.player2.id,
          name: this.player2.name,
          heroes: this.player2.heroes.map(hero => hero.id)
        }
      },
      heroes: {},
      currentTurnPlayerId: this.turnManager.getCurrentPlayer().id,
      lastActionTimestamp: Date.now(),
      status: 'in_progress'
    };    

    this.player1.heroes.forEach(hero => {
      this.gameState.heroes[hero.id] = {
        id: hero.id,
        name: hero.name,
        position: hero.getBoardPosition(),
        currentAttack: hero.stats.attack,
        currentHealth: hero.stats.currentHealth,
        statusEffects: hero.state.statusEffects,
        isAlive: true
      };
    });

    this.player2.heroes.forEach(hero => {
      this.gameState.heroes[hero.id] = {
        id: hero.id,
        name: hero.name,
        position: hero.getBoardPosition(),
        currentAttack: hero.stats.attack,
        currentHealth: hero.stats.currentHealth,
        statusEffects: hero.state.statusEffects,
        isAlive: true
      };
    });

    setupSocketListeners(this.scene, this.socket, this.turnManager, this.board, this); 
  }

  setupInitialPositions() {
    this.player2.heroes[0].state.position = 'B1';
    this.player2.heroes[1].state.position = 'C1';
    this.player2.heroes[2].state.position = 'D1';

    this.player1.heroes[0].state.position = 'C6';
    this.player1.heroes[1].state.position = 'D7';
    this.player1.heroes[2].state.position = 'B7';

    this.player1.heroes.forEach(hero => {
      this.board.placeHero(hero, hero.state.position, this.player1.number);
    });

    this.player2.heroes.forEach(hero => {
      this.board.placeHero(hero, hero.state.position, this.player2.number);
    });
  }

  getPlayerById(id) {
    return [this.player1, this.player2].find(p => p.id === id);
  }

  setGameState(gameState) {
    this.gameState = gameState;
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

  showGameState() {
    console.log("====== ESTADO ATUAL DO JOGO ======");
    console.log("Turno do jogador:", this.gameState.currentTurnPlayerId);
    console.log("Heroes:");
  
    Object.entries(this.gameState.heroes).forEach(([heroId, heroData]) => {
      console.log(`- ID: ${heroId}`);
      console.log(`  - Nome: ${heroData.name}`);
      console.log(`  - Posição: ${heroData.position}`);
      console.log(`  - Vida: ${heroData.currentHealth}`);
      console.log(`  - Ataque: ${heroData.currentAttack}`);
      console.log(`  - Efeitos: ${heroData.statusEffects.length > 0 ? heroData.statusEffects.join(', ') : 'Nenhum'}`);
      console.log(`  - Vivo: ${heroData.isAlive}`);
    });
  
    if (this.gameState.lastActionTimestamp) {
      console.log("Última ação em:", new Date(this.gameState.lastActionTimestamp).toLocaleTimeString());
    } else {
      console.log("Última ação em: [Timestamp inválido]");
    }
  
    console.log("==================================");
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