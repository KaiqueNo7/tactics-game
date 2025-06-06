import { SOCKET_EVENTS } from "../../api/events.js";
import { getSocket } from "./game-api-service.js";

function onPlayerDisconnected(scene) {
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
}

function onPlayerReconnectingSuccess(scene) {
    scene.scene.resume(); 

    if (scene.waitingText) {
      scene.waitingText.destroy();
      scene.waitingText = null;
    }
}

function onGameFinished(gameManager, scene, winnerId){
    if (scene.scene.isPaused('GameScene')) {
      scene.scene.resume('GameScene');
    }

    gameManager.finishGame(winnerId);
}

export function registerSetupSocketListeners(gameManager, scene){
  const socket = getSocket();

  if (!socket) {
    console.warn('Socket não está conectado!');
    return;
  }

  socket.on(SOCKET_EVENTS.PLAYER_DISCONNECTED, () => onPlayerDisconnected(scene));
  socket.on(SOCKET_EVENTS.RECONNECTING_PLAYER_SUCCESS, () => onPlayerReconnectingSuccess(scene));
  socket.on(SOCKET_EVENTS.GAME_FINISHED, ({ winnerId }) => onGameFinished(gameManager, scene, winnerId));
}

export function unRegisterSetupSocketListeners(){
  const socket = getSocket();

  if (!socket) {
    console.warn('Socket não está conectado!');
    return;
  }

  socket.off(SOCKET_EVENTS.PLAYER_DISCONNECTED);
  socket.off(SOCKET_EVENTS.RECONNECTING_PLAYER_SUCCESS);
  socket.off(SOCKET_EVENTS.GAME_FINISHED);
}