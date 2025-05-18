import { SOCKET_EVENTS } from "../../api/events.js";

export function setupSocketListeners(socket, gameManager, scene) {
  socket.on(SOCKET_EVENTS.PLAYER_DISCONNECTED, () => {
    scene.scene.pause();

    if (!scene.waitingText) {
      scene.waitingText = scene.add.text(400, 300, 'Aguardando oponente reconectar', {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Fredoka',
        backgroundColor: '#000000',
        padding: { x: 10, y: 10 },
      }).setOrigin(0.5);
    }
  });

  socket.on(SOCKET_EVENTS.RECONNECTING_PLAYER_SUCCESS, () => {
    console.log('Reconexão feita com sucesso!');
    scene.scene.resume(); 

    if (scene.waitingText) {
      scene.waitingText.destroy();
      scene.waitingText = null;
    }
  });

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
  socket.off(SOCKET_EVENTS.PLAYER_DISCONNECTED);
  socket.off(SOCKET_EVENTS.RECONNECTING_PLAYER);
}