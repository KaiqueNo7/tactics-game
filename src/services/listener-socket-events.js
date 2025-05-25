import { SOCKET_EVENTS } from "../../api/events.js";

export function setupSocketListeners(socket, gameManager, scene) {
  socket.on(SOCKET_EVENTS.PLAYER_DISCONNECTED, () => {
    scene.scene.pause();

    const {width, height} = scene.scale;

    if (!scene.waitingText) {
      scene.waitingText = scene.add.text(width / 2, height / 2, 'Aguardando oponente reconectar', {
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
    removeGameSocketListeners(socket);
  });
}

export function removeGameSocketListeners(socket) {
  socket.removeAllListeners(SOCKET_EVENTS.HERO_MOVE_REQUEST);
  socket.removeAllListeners(SOCKET_EVENTS.HERO_ATTACK_REQUEST);
  socket.removeAllListeners(SOCKET_EVENTS.HERO_COUNTER_ATTACK_REQUEST);
  socket.removeAllListeners(SOCKET_EVENTS.UPDATE_GAME_STATE);
  socket.removeAllListeners(SOCKET_EVENTS.NEXT_TURN_REQUEST);
  socket.removeAllListeners(SOCKET_EVENTS.GAME_FINISHED_REQUEST);
  socket.removeAllListeners(SOCKET_EVENTS.PLAYER_DISCONNECTED);
  socket.removeAllListeners(SOCKET_EVENTS.RECONNECTING_PLAYER_SUCCESS);
  socket.removeAllListeners(SOCKET_EVENTS.RECONNECTING_PLAYER);
  socket.removeAllListeners(SOCKET_EVENTS.GAME_FINISHED);
  socket.removeAllListeners(SOCKET_EVENTS.TURN_TIMER_TICK);
  socket.removeAllListeners(SOCKET_EVENTS.TURN_TIMEOUT);
  socket.removeAllListeners('CHECK_GOOD_LUCK');
}
