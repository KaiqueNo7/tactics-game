import { SOCKET_EVENTS } from "../../api/events";
import socket from "../services/game-api-service";
import { Server } from 'socket.io';

export default class TurnManager extends Phaser.Data.DataManager {
  constructor(scene, players, socket) {
    super(scene, 'TurnManager');
    this.scene = scene;
    this.players = players;
    this.socket = socket;
    this.currentPlayerIndex = 0;
    this.currentTurn = {
      attackedAll: false,
      attackedHeros: new Set(),
      counterAttack: false,
      movedAll: false,
      movedHeros: new Set(),
      phase: 'start',
      player: null,
      roundNumber: 1
    };
    this.gameState = {
      status: 'active',
      winner: null
    };

    this.setupSocketListeners();
    this.determineStartingPlayer();
  }

  setupSocketListeners() {
    this.socket.on(SOCKET_EVENTS.TURN_START, (data) => {
      this.currentTurn = this.createNewTurn(
        this.players.find(p => p.name === data.currentPlayer.name),
        data.roundNumber
      );
      this.scene.uiManager.updateTurnPanel(this.currentTurn.player, this.currentTurn.roundNumber);
      this.scene.gameUI.showMessage(`${data.currentPlayer.name} - Sua vez!`);
    });

    this.socket.on(SOCKET_EVENTS.TURN_END, () => {
      this.nextTurn(true);
    });
  }

  markHeroAsMoved(hero) {
    this.currentTurn.movedHeros.add(hero);
    this.triggerOnMoveSkills(this.players);
    if (this.currentTurn.movedHeros.size === this.currentTurn.player.heros.length) {
      this.currentTurn.movedAll = true;
    }
    this.socket.emit(SOCKET_EVENTS.HERO_MOVED, { heroId: hero.id, player: this.currentTurn.player.name });
  }

  markHeroAsAttacked(hero) {
    this.currentTurn.attackedHeros.add(hero);
    const aliveHeros = this.currentTurn.player.heros.filter(char => char.state.isAlive);
    if (this.currentTurn.attackedHeros.size === aliveHeros.length) {
      this.currentTurn.attackedAll = true;
    }
    this.socket.emit(SOCKET_EVENTS.HERO_ATTACKED, { heroId: hero.id, player: this.currentTurn.player.name });
  }

  canMoveHero(hero) {
    return !this.currentTurn.movedHeros.has(hero) &&
           !this.currentTurn.attackedHeros.has(hero) &&
           !this.currentTurn.movedAll;
  }

  determineStartingPlayer() {
    const startingPlayerIndex = Math.random() > 0.5 ? 0 : 1;

    this.currentPlayerIndex = startingPlayerIndex;
    this.currentTurn.player = this.players[startingPlayerIndex];
    this.whoStarted = startingPlayerIndex;

    this.socket.emit(SOCKET_EVENTS.TURN_DETERMINE_STARTING_PLAYER, {
      whoStarted: this.whoStarted,
    });
  }

  createNewTurn(player, roundNumber) {
    return {
      attackedAll: false,
      attackedHeros: new Set(),
      counterAttack: false,
      movedAll: false,
      movedHeros: new Set(),
      phase: 'start',
      player,
      roundNumber
    };
  }

  nextTurn(fromSocket = false) {
    this.triggerEndOfTurnSkills();
    this.currentTurn.movedHeros.clear();
    if (this.currentTurn.attackedHeros) {
      this.currentTurn.attackedHeros.clear();
    }

    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    const currentPlayer = this.players[this.currentPlayerIndex];
    const isBackToStarter = (this.currentPlayerIndex === this.whoStarted);
    const newRoundNumber = this.currentTurn.roundNumber + (isBackToStarter ? 1 : 0);

    this.currentTurn = this.createNewTurn(currentPlayer, newRoundNumber);
    this.scene.board.clearSelectedHero();
    this.checkGameState();
    this.scene.uiManager.updateTurnPanel(this.currentTurn.player, this.currentTurn.roundNumber);
    this.scene.board.clearHighlights();
    this.triggerStartOfTurnSkills(this.players);
    this.scene.gameUI.showMessage(currentPlayer.name + ' - Sua vez!');

    if (!fromSocket) {
      this.socket.emit(SOCKET_EVENTS.TURN_END_REQUEST, {
        currentPlayer: currentPlayer.name,
        roundNumber: newRoundNumber
      });
    }

    return this.currentTurn;
  }

  triggerStartOfTurnSkills(players) {
    players.forEach(player => {
      player.heros.forEach(hero => {
        if (hero.state.isAlive) {
          hero.startTurn();
        }
      });
    });
  }

  triggerOnMoveSkills(players) {
    players.forEach(player => {
      player.heros.forEach(hero => {
        if (hero.state.isAlive) {
          hero.triggerSkills('onMove');
        }
      });
    });
  }

  triggerEndOfTurnSkills() {
    const currentPlayer = this.players[this.currentPlayerIndex];
    currentPlayer.heros.forEach(hero => {
      if (hero.state.isAlive) {
        hero.endTurn();
      }
    });
  }

  checkGameState() {
    const alivePlayers = this.players.filter(player =>
      player.heros.some(char => char.state.isAlive)
    );

    if (alivePlayers.length === 1) {
      const winner = alivePlayers[0];
      this.scene.gameManager.setGameState({ status: 'finished', winner });
      this.scene.gameManager.finishGame();
      this.socket.emit(SOCKET_EVENTS.GAME_FINISHED, { winner: winner.name });
    }

    return this.gameState;
  }

  getCurrentPlayer() {
    return this.currentTurn.player;
  }

  toJSON() {
    return {
      currentPlayer: this.currentTurn.player.name,
      gameState: this.gameState,
      players: this.players.map(player => ({
        heros: player.heros.map(char => char.toJSON()),
        name: player.name
      })),
      roundNumber: this.currentTurn.roundNumber
    };
  }
}
