import { SOCKET_EVENTS } from "../../api/events.js";

export function setupSocketListeners(socket, gameManager) {
  socket.on(SOCKET_EVENTS.GAME_FINISHED, ({ winner }) => {
    const winnerId = winner.id;
    gameManager.finishGame(winnerId);
    removeSocketListenersByRoom(socket);
  });
}

export function removeSocketListenersByRoom(socket) {
  socket.off(SOCKET_EVENTS.NEXT_TURN);
  socket.off(SOCKET_EVENTS.TURN_TIMEOUT);
  socket.off(SOCKET_EVENTS.TURN_TIMER_TICK);
  socket.off(SOCKET_EVENTS.HERO_MOVED);
  socket.off(SOCKET_EVENTS.HERO_ATTACKED);
  socket.off(SOCKET_EVENTS.HERO_COUNTER_ATTACK);
  socket.off(SOCKET_EVENTS.UPDATE_GAME_STATE);
  socket.off(SOCKET_EVENTS.GAME_FINISHED);
}