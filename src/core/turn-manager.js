import { SOCKET_EVENTS } from "../../api/events.js";

export default class TurnManager extends Phaser.Data.DataManager {
  constructor(scene, players, socket, roomId, startedPlayerIndex, gameManager) {
    super(scene, 'TurnManager');
    this.scene = scene;
    this.players = players;
    this.socket = socket;
    this.roomId = roomId;
    this.currentPlayerIndex = startedPlayerIndex;
    this.startedPlayerIndex = startedPlayerIndex;

    this.gameManager = gameManager;
    
    this.currentTurn = this.createNewTurn(this.players[this.currentPlayerIndex], 1);
    this.gameState = {
      status: 'active',
      winner: null
    };

    this.determineStartingPlayer();
    this.setupSocketListeners();
  }

  determineStartingPlayer () {
    this.currentPlayerIndex = this.startedPlayerIndex;
    this.currentTurn.player = this.players[this.startedPlayerIndex];
  
    this.scene.gameUI.showMessage(`${this.currentTurn.player.name} começa o jogo!`);
  
    this.whoStarted = this.startedPlayerIndex;

    const isMyTurn = this.currentTurn.player.id === this.socket.id;
    this.scene.uiManager.setEndTurnButtonEnabled(isMyTurn);
  }

  setupSocketListeners() {
    this.socket.on(SOCKET_EVENTS.NEXT_TURN, ({ nextPlayerId }) => {
      this.nextTurn();
    
      if (this.gameManager) {
        this.gameManager.updateCurrentTurn(nextPlayerId);
      }
    });
  }

  markHeroAsMoved(hero) {
    this.currentTurn.movedHeros.add(hero);
    this.triggerOnMoveSkills(this.players);
    if (this.currentTurn.movedHeros.size === this.currentTurn.player.heros.length) {
      this.currentTurn.movedAll = true;
    }
  }

  markHeroAsAttacked(hero) {
    this.currentTurn.attackedHeros.add(hero);
    const aliveHeros = this.currentTurn.player.heros.filter(char => char.state.isAlive);
    if (this.currentTurn.attackedHeros.size === aliveHeros.length) {
      this.currentTurn.attackedAll = true;
    }
  }

  canMoveHero(hero) {
    return !this.currentTurn.movedHeros.has(hero) &&
           !this.currentTurn.attackedHeros.has(hero) &&
           !this.currentTurn.movedAll;
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

  nextTurn() {
    this.gameManager.showGameState();
    this.triggerEndOfTurnSkills();
    this.currentTurn.movedHeros.clear();
    if (this.currentTurn.attackedHeros) {
      this.currentTurn.attackedHeros.clear();
    }

    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    const currentPlayer = this.players[this.currentPlayerIndex];
    const isBackToStarter = (this.currentPlayerIndex === this.startedPlayerIndex);
    const newRoundNumber = this.currentTurn.roundNumber + (isBackToStarter ? 1 : 0);

    this.currentTurn = this.createNewTurn(currentPlayer, newRoundNumber);
    this.scene.board.clearSelectedHero();
    this.checkGameState();
    this.scene.uiManager.updateTurnPanel(this.currentTurn.player, this.currentTurn.roundNumber);
    this.scene.board.clearHighlights();
    this.triggerStartOfTurnSkills(this.players);
    this.scene.gameUI.showMessage(currentPlayer.name + ' - Sua vez!');

    const isMyTurn = this.currentTurn.player.id === this.socket.id;
    this.scene.uiManager.setEndTurnButtonEnabled(isMyTurn);

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
