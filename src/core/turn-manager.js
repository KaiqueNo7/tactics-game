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
      attackedHeroes: turnData.attackedHeroes || [],
      movedHeroes: turnData.movedHeroes || [],
      counterAttack: turnData.counterAttack ?? false
    };

    this.board.clearSelectedHero();
    this.board.clearHighlights();

    this.triggerStartOfTurnSkills(this.gameManager.getPlayers());

    const currentPlayerIndex = this.gameManager.getPlayers().findIndex(player => player.id === turnData.playerId);

    this.gameUI.updateTurnPanel(currentPlayerIndex, this.currentTurn.numberTurn);

    const isMyTurn = this.currentTurn.playerId === sessionStorage.getItem('playerId');

    if(isMyTurn){
      this.gameUI.showMessage('Sua vez!');
    }

    this.gameUI.setEndTurnButtonEnabled(isMyTurn);
    this.gameManager.updateCurrentTurn(this.currentTurn);
  }

  markHeroAsMoved(heroId) {
    this.currentTurn.movedHeroes.push(heroId);
    this.triggerOnMoveSkills(this.gameManager.getPlayers());
    this.gameManager.updateCurrentTurn(this.currentTurn);
  }
  
  markHeroAsAttacked(heroId) {
    this.currentTurn.attackedHeroes.push(heroId);
    this.gameManager.updateCurrentTurn(this.currentTurn);
  }
  
  canMoveHero(heroId) {
    return !this.currentTurn.movedHeroes.includes(heroId) &&
           !this.currentTurn.attackedHeroes.includes(heroId);
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
      attackedHeroes: [],
      movedHeroes: [],
      counterAttack: false,
    });
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
