export default class TurnManager {
  constructor(scene, players, socket, roomId, startedPlayerIndex, gameManager, currentPlayerIndex = null) {
    this.scene = scene;
    this.players = players;
    this.socket = socket;
    this.roomId = roomId;
    this.currentPlayerIndex = currentPlayerIndex ?? startedPlayerIndex;
    this.startedPlayerIndex = startedPlayerIndex;

    this.gameManager = gameManager;
    
    this.currentTurn = this.createNewTurn(this.players[this.currentPlayerIndex], 1);
  }

  determineStartingPlayer () {
    this.currentPlayerIndex = this.startedPlayerIndex;
    this.currentTurn.player = this.players[this.startedPlayerIndex];
  
    this.scene.gameUI.showMessage(`${this.currentTurn.player.name} começa o jogo!`);

    const isMyTurn = this.currentTurn.player.id === this.socket.id;
    this.scene.gameUI.setEndTurnButtonEnabled(isMyTurn);
  }

  markHeroAsMoved(hero) {
    this.currentTurn.movedHeroes.add(hero);
    this.triggerOnMoveSkills(this.players);
  }

  markHeroAsAttacked(hero) {
    this.currentTurn.attackedHeroes.add(hero);
  }

  canMoveHero(hero) {
    return !this.currentTurn.movedHeroes.has(hero) &&
           !this.currentTurn.attackedHeroes.has(hero)
  }

  createNewTurn(playerId, numberTurn) {
    return {
      attackedHeroes: new Set(),
      counterAttack: false,
      movedHeroes: new Set(),
      playerId: playerId,
      numberTurn: numberTurn,
    };
  }

  nextTurn() {
    this.gameManager.showGameState();
    this.triggerEndOfTurnSkills();
    this.currentTurn.movedHeroes.clear();
    this.currentTurn.attackedHeroes.clear();

    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    const currentPlayer = this.players[this.currentPlayerIndex];
    const isBackToStarter = (this.currentPlayerIndex === this.startedPlayerIndex);
    const newRoundNumber = this.currentTurn.roundNumber + (isBackToStarter ? 1 : 0);

    this.currentTurn = this.createNewTurn(currentPlayer, newRoundNumber);
    this.scene.board.clearSelectedHero();
    this.scene.gameUI.updateTurnPanel(this.currentTurn.player, this.currentTurn.roundNumber);
    this.scene.board.clearHighlights();
    this.triggerStartOfTurnSkills(this.players);
    this.scene.gameUI.showMessage(currentPlayer.name + ' - Sua vez!');

    const isMyTurn = this.currentTurn.player.id === this.socket.id;
    this.scene.gameUI.setEndTurnButtonEnabled(isMyTurn);
  }

  triggerStartOfTurnSkills(players) {
    players.forEach(player => {
      player.heroes.forEach(hero => {
        if (hero.state.isAlive) {
          hero.startTurn();
        }
      });
    });
  }

  triggerOnMoveSkills(players) {
    players.forEach(player => {
      player.heroes.forEach(hero => {
        if (hero.state.isAlive) {
          hero.triggerSkills('onMove');
        }
      });
    });
  }

  triggerEndOfTurnSkills() {
    const currentPlayer = this.players[this.currentPlayerIndex];
    currentPlayer.heroes.forEach(hero => {
      if (hero.state.isAlive) {
        hero.endTurn();
      }
    });
  }

  getCurrentPlayer() {
    return this.currentTurn.player;
  }
}
