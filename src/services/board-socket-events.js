import { SOCKET_EVENTS } from "../../api/events";

export function boardSocketListeners (board, socket, gameManager) {
  socket.on(SOCKET_EVENTS.HERO_MOVED, ({ heroId, targetLabel }) => {
    const realHero = gameManager.getHeroById(heroId);
    const targetHex = board.getHexByLabel(targetLabel);

    if (realHero && targetHex) {
      board.moveHero(realHero, targetHex, true);
    }
  });

  socket.on(SOCKET_EVENTS.HERO_ATTACKED, ({ heroAttackerId, heroTargetId }) => {
    const attacker = gameManager.getHeroById(heroAttackerId);
    const target = gameManager.getHeroById(heroTargetId);
  
    if (attacker && target) {
      board.attackHero(attacker, target, true);
    }
  });

  socket.on(SOCKET_EVENTS.HERO_COUNTER_ATTACK, ({ heroAttackerId, heroTargetId }) => {
    const attacker = gameManager.getHeroById(heroAttackerId);
    const target = gameManager.getHeroById(heroTargetId);
  
    if (attacker && target) {
      target.counterAttack(attacker);
    }
  });
}