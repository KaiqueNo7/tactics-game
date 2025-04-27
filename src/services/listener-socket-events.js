// services/socket-listeners.js
import { SOCKET_EVENTS } from "../../api/events.js";

export default function setupSocketListeners(scene, socket) {
  const { board, gameManager, turnManager } = scene; 

  socket.on(SOCKET_EVENTS.HERO_MOVED, ({ heroId, targetLabel }) => {
    const realHero = board.getHeroById(heroId);
    const targetHex = board.getHexByLabel(targetLabel);
  
    if (realHero && targetHex) {
      board.moveHero(realHero, targetHex, true);
      gameManager.updateHeroPosition(heroId, targetLabel);
    }
  });

  socket.on(SOCKET_EVENTS.HERO_ATTACKED, ({ heroAttackerId, heroTargetId }) => {
    const attacker = board.getHeroById(heroAttackerId);
    const target = board.getHeroById(heroTargetId);
  
    if (attacker && target) {
      board.attackHero(attacker, target, true);
    }
  });

  socket.on(SOCKET_EVENTS.HERO_COUNTER_ATTACK, ({ heroAttackerId, heroTargetId }) => {
    const attacker = board.getHeroById(heroAttackerId);
    const target = board.getHeroById(heroTargetId);
  
    if (attacker && target) {
      target.counterAttack(attacker);
    }
  });

  // Eventos de turno
  socket.on(SOCKET_EVENTS.NEXT_TURN, ({ nextPlayerId }) => {
    turnManager.nextTurn();
    gameManager.updateCurrentTurn(nextPlayerId);
  });

  // Evento de fim de jogo
  socket.on(SOCKET_EVENTS.GAME_FINISHED, ({ winnerId }) => {
    console.log('Game finished event received:', winnerId);
    const winner = gameManager.getPlayerById(winnerId);

    gameManager.setGameState({ winner });
    gameManager.finishGame();
  });
}

export function removeSocketListeners(socket) {
  socket.off(SOCKET_EVENTS.HERO_MOVED);
  socket.off(SOCKET_EVENTS.HERO_ATTACKED);
  socket.off(SOCKET_EVENTS.HERO_COUNTER_ATTACK);
  socket.off(SOCKET_EVENTS.NEXT_TURN);
  socket.off(SOCKET_EVENTS.GAME_FINISHED);
}

