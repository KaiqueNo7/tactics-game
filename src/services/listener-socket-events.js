import { SOCKET_EVENTS } from "../../api/events.js";

export function setupSocketListeners(socket, gameManager) {
  socket.on(SOCKET_EVENTS.GAME_FINISHED, ({ winnerId }) => {
    gameManager.finishGame(winnerId);
    removeSocketListenersByRoom();
  });
}

export function removeSocketListenersByRoom(roomId) {
  const sockets = io.sockets.adapter.rooms.get(roomId);

  if (!sockets) return;

  for (const socketId of sockets) {
    const socket = io.sockets.sockets.get(socketId);

    if (socket) {
      socket.off(SOCKET_EVENTS.HERO_MOVE_REQUEST);
      socket.off(SOCKET_EVENTS.HERO_ATTACK_REQUEST);
      socket.off(SOCKET_EVENTS.HERO_COUNTER_ATTACK_REQUEST);
      socket.off(SOCKET_EVENTS.NEXT_TURN_REQUEST);
      socket.off(SOCKET_EVENTS.UPDATE_GAME_STATE);
      socket.off(SOCKET_EVENTS.GAME_FINISHED);
    }
  }
}

