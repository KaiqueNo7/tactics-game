import { SOCKET_EVENTS } from "../../api/events.js";

export function setupSocketListeners(socket, turnManager, gameManager) {
  socket.on(SOCKET_EVENTS.NEXT_TURN, ({ nextPlayerId }) => {
    turnManager.nextTurn(nextPlayerId);
  });

  socket.on(SOCKET_EVENTS.GAME_FINISHED, ({ winnerId }) => {
    gameManager.finishGame(winnerId);
    removeSocketListeners();
  });
}

export function removeSocketListeners(socket) {
  socket.off(SOCKET_EVENTS.HERO_MOVED);
  socket.off(SOCKET_EVENTS.HERO_ATTACKED);
  socket.off(SOCKET_EVENTS.HERO_COUNTER_ATTACK);
  socket.off(SOCKET_EVENTS.NEXT_TURN);
  socket.off(SOCKET_EVENTS.GAME_FINISHED);
}

