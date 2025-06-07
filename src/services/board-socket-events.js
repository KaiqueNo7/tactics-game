import { SOCKET_EVENTS } from "../../api/events";
import { getSocket } from "./game-api-service.js";


function heroMoved(gameManager, board, heroId, targetLabel) {
  const realHero = gameManager.getHeroById(heroId);
  const targetHex = board.getHexByLabel(targetLabel);

  if (realHero && targetHex) {
    board.moveHero(realHero, targetHex);
  }
}

function heroAttacked(gameManager, board, heroAttackerId, heroTargetId, isCounterAttack = false) {
  const attacker = gameManager.getHeroById(heroAttackerId);
  const target = gameManager.getHeroById(heroTargetId);

  if (attacker && target && !isCounterAttack) {
    board.attackHero(attacker, target);
  }

  console.log(target.state);

  if (attacker && target && isCounterAttack && target.state.isAlive) {
    target.counterAttack(attacker, target);
  }
}


export function registerBoardSocketListeners (board, gameManager) {
  const socket = getSocket();

  if (!socket) {
    console.warn('Socket não está conectado!');
    return;
  }

  socket.on(SOCKET_EVENTS.HERO_MOVED, ({ heroId, targetLabel }) => heroMoved(gameManager, board, heroId, targetLabel));

  socket.on(SOCKET_EVENTS.HERO_ATTACKED, ({ heroAttackerId, heroTargetId }) => heroAttacked(
    gameManager, 
    board,
    heroAttackerId, 
    heroTargetId
  ));

  socket.on(SOCKET_EVENTS.HERO_COUNTER_ATTACK, ({ heroAttackerId, heroTargetId }) => heroAttacked(
    gameManager, 
    board,
    heroAttackerId, 
    heroTargetId,
    true
  ));
}

export function unRegisterBoardSocketListeners() {
  const socket = getSocket();

  if (!socket) {
    console.warn('Socket não está conectado!');
    return;
  }  

  socket.off(SOCKET_EVENTS.HERO_MOVED);
  socket.off(SOCKET_EVENTS.HERO_ATTACKED);
  socket.off(SOCKET_EVENTS.HERO_COUNTER_ATTACK);
}