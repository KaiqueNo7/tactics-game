import { i18n } from "../../i18n";
import { registerTurnManagerSocketEvents, unregisterTurnManagerSocketEvents } from "../services/turn-manager-socket-events";
import BotPlayer from "./botPlayer";

export default class TurnManager {
  constructor(board, gameUI, playerId, gameManager, user) {
    this.board = board;
    this.gameUI = gameUI;
    this.startedPlayerId = playerId;
    this.user = user;

    this.gameManager = gameManager;
    this.gameState = gameManager.gameState;

    this.createNewTurn(this.gameState.currentTurn);

    registerTurnManagerSocketEvents(this);
  }

  async createNewTurn(turnData) {
    this.currentTurn = {
      playerId: turnData.playerId,
      numberTurn: turnData.numberTurn,
      attackedHeroes: turnData.attackedHeroes || [],
      movedHeroes: turnData.movedHeroes || [],
      counterAttack: turnData.counterAttack ?? false
    };

    this.board.clearSelectedHero();
    this.board.clearHighlights();

    const currentPlayerIndex = this.gameManager.getPlayers().findIndex(player => player.id === turnData.playerId);
    const currentPlayer = this.gameManager.getPlayerById(turnData.playerId);

    this.gameUI.updateTurnPanel(currentPlayerIndex, this.currentTurn.numberTurn);

    this.triggerStartOfTurnSkills(this.gameManager.getPlayers());

    const isMyTurn = this.currentTurn.playerId === this.user.id;

    if(isMyTurn){
      this.gameUI.showMessage(i18n.your_turn);
    }

    if(this.currentTurn.numberTurn == 15){
      this.gameUI.showMessage(i18n.sudden_death);
    }

    if(this.currentTurn.numberTurn >= 20){
      this.suddenDeath(this.gameManager.getPlayers());
    }

    this.gameUI.setEndTurnButtonEnabled(isMyTurn);
    this.gameManager.updateCurrentTurn(this.currentTurn);

    if (currentPlayer.isBot) {
      const bot = new BotPlayer(this.board, this.gameManager, this.gameState.roomId, this);
      await bot.playTurn();
    }    
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

  suddenDeath(players) {
    players.forEach(player => {
      player.heroes.forEach(hero => {
        if (hero.state.isAlive) {
          hero.takeDamage(1);
        }
      });
    });
  }

  nextTurn(playerId) {
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

  dispose() {
    unregisterTurnManagerSocketEvents();
  }
}
