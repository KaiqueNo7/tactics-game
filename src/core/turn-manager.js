export default class TurnManager {
  constructor(board, gameUI, playerId, gameManager) {
    this.board = board;
    this.gameUI = gameUI;
    this.startedPlayerId = playerId;

    this.gameManager = gameManager;
    this.gameState = gameManager.gameState;

    this.createNewTurn(this.gameState.currentTurn);
  }

  createNewTurn(turnData) {
    this.currentTurn = {
      playerId: turnData.playerId,
      numberTurn: turnData.numberTurn,
      attackedHeroes: new Set(Object.keys(turnData.attackedHeroes || {})),
      movedHeroes: new Set(Object.keys(turnData.movedHeroes || {})),
      counterAttack: turnData.counterAttack ?? false
    };

    this.gameManager.updateCurrentTurn(this.currentTurn);
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

  nextTurn(playerId) {
    this.gameManager.showGameState();
    const currentPlayer = this.gameManager.getPlayerById(playerId);
    this.triggerEndOfTurnSkills(currentPlayer);

    const isBackToStarter = (this.currentTurn.playerId === this.startedPlayerId);
    const numberTurn = this.currentTurn.numberTurn + (isBackToStarter ? 0 : 1);

    this.createNewTurn({
      playerId: currentPlayer.id, 
      numberTurn: numberTurn,
      attackedHeroes: {},
      movedHeroes: {},
      counterAttack: false,
    });

    this.board.clearSelectedHero();
    this.board.clearHighlights();

    this.triggerStartOfTurnSkills(this.gameManager.getPlayers());

    const currentPlayerIndex = this.gameManager.getPlayers().findIndex(player => player.id === playerId);

    this.gameUI.updateTurnPanel(currentPlayerIndex, this.currentTurn.numberTurn);

    const isMyTurn = this.currentTurn.playerId === sessionStorage.getItem('playerId');

    if(isMyTurn){
      this.gameUI.showMessage('Sua vez!');
    }

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
