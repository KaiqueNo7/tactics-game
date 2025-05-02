import { SOCKET_EVENTS } from "../../api/events.js";

export function setupSocketListeners(scene, socket, turnManager, gameManager) {
  socket.on(SOCKET_EVENTS.NEXT_TURN, ({ nextPlayerId }) => {
    turnManager.nextTurn();
    gameManager.updateCurrentTurn(nextPlayerId);
  });

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

