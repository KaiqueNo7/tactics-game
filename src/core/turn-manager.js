export default class TurnManager {
  constructor(board, gameUI, playerId, gameManager) {
    this.board = board;
    this.gameUI = gameUI;
    this.startedPlayerId = playerId;

    this.gameManager = gameManager;
    this.gameState = gameManager.gameState;

    this.currentTurn = this.gameState.currentTurn;
  }

  markHeroAsMoved(hero) {
    this.currentTurn.movedHeroes.add(hero);
    this.triggerOnMoveSkills(this.gameManager.getPlayers());
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

  nextTurn(playerId) {
    this.gameManager.showGameState();
    const currentPlayer = this.gameManager.getPlayerById(playerId);
    this.triggerEndOfTurnSkills(currentPlayer);

    const isBackToStarter = (this.currentTurn.playerId === this.startedPlayerId);
    const numberTurn = this.currentTurn.numberTurn + (isBackToStarter ? 1 : 0);

    this.currentTurn = this.createNewTurn(currentPlayer.id, numberTurn);
    this.board.clearSelectedHero();
    this.board.clearHighlights();

    this.triggerStartOfTurnSkills(this.gameManager.getPlayers());

    const currentPlayerIndex = this.gameManager.getPlayers().findIndex(player => player.id === playerId);

    this.gameUI.updateTurnPanel(currentPlayerIndex, this.currentTurn.numberTurn);
    this.gameUI.showMessage(currentPlayer.name + ' - Sua vez!');

    const isMyTurn = this.currentTurn.playerId === sessionStorage.getItem('playerId');
    this.gameUI.setEndTurnButtonEnabled(isMyTurn);
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

  triggerEndOfTurnSkills(currentPlayer) {
    currentPlayer.heroes.forEach(hero => {
      if (hero.state.isAlive) {
        hero.endTurn();
      }
    });
  }

  getCurrentPlayer() {
   const player = this.gameManager.getPlayerById(this.currentTurn.playerId);

    return player;
  }
}
