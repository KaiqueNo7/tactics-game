import { getSocket } from "../services/game-api-service";
import { SOCKET_EVENTS } from "../../api/events";

export default class BotPlayer {
  constructor(board, gameManager, roomId, turnManager) {
    this.board = board;
    this.turnManager = turnManager;
    this.gameManager = gameManager;
    this.socket = getSocket();
    this.roomId = roomId;
  }

  async playTurn() {
    const currentPlayer = this.turnManager.getCurrentPlayer();
    const plannedMoves = new Set();
  
    for (const hero of currentPlayer.heroes) {
      if (!hero.state.isAlive) continue;
  
      const alreadyMoved = this.turnManager.currentTurn.movedHeroes.includes(hero.id);
      const alreadyAttacked = this.turnManager.currentTurn.attackedHeroes.includes(hero.id);
  
      if (!alreadyMoved) {
        const movableHexes = this.board.getMovableHexes(hero, hero.ability === 'Sprint' ? 3 : 2);
  
        if (movableHexes.length > 0) {
          const targetHex = this.chooseClosestToEnemy(movableHexes, hero, plannedMoves);
  
          if (targetHex) {
            await this.moveHeroTo(hero, targetHex.label);
            plannedMoves.add(targetHex.label);
            await this.delay(800);
          }
        }
      }
  
      if (!alreadyAttacked) {
        const enemiesInRange = this.board.getEnemiesInRange(hero, hero.attackRange);

        const tauntTargets = enemiesInRange.filter(hex => {
          const target = hex.occupiedBy;
          return target?.state?.isAlive && target.ability == 'Taunt';
        });

        const fallbackTargets = enemiesInRange.filter(hex => {
          const target = hex.occupiedBy;
          return target?.state?.isAlive && !target.ability != 'Taunt';
        });

        const prioritizedTargets = [...tauntTargets, ...fallbackTargets];

        for (const hex of prioritizedTargets) {
          const target = hex.occupiedBy;
          if (target?.state?.isAlive) {
            await this.board.attackHero(hero, target);
            await this.delay(800);
            break;
          }
        }
      }
    }
  
    this.socket.emit(SOCKET_EVENTS.NEXT_TURN_REQUEST, {
      roomId: this.roomId,
      playerId: currentPlayer.id
    });
  }
  
  chooseClosestToEnemy(hexes, hero, plannedMoves) {
    const enemies = this.gameManager.getEnemyHeroes(hero.playerId).filter(e => e.state.isAlive);
    if (enemies.length === 0) return null;

    const filteredHexes = hexes.filter(h => !plannedMoves.has(h.label));
    if (filteredHexes.length === 0) return null;

    const weakestEnemy = enemies.reduce((lowest, curr) => {
      return curr.stats.hp < lowest.stats.currentHealth ? curr : lowest;
    }, enemies[0]);

    const enemyHex = this.board.getHexByLabel(weakestEnemy.state.position);
    if (!enemyHex) return null;

    let closestHex = null;
    let minDistance = Infinity;

    for (const hex of filteredHexes) {
      const distance = this.board.calculateDistance(hex, enemyHex);
      if (distance < minDistance) {
        minDistance = distance;
        closestHex = hex;
      }
    }

    return closestHex;
  }

  async moveHeroTo(hero, hexLabel) {
    this.socket.emit(SOCKET_EVENTS.HERO_MOVE_REQUEST, {
      roomId: this.roomId,
      heroId: hero.id,
      targetLabel: hexLabel
    });

    await this.delay(500);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
