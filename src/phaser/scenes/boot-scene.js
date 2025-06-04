import { connectSocket, getSocket } from "../../services/game-api-service";
import { SOCKET_EVENTS } from "../../../api/events";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  async init() {
    const token = localStorage.getItem('token');

    if (!token) {
      this.scene.start('LoginScene');
      return;
    }

    try {
      await connectSocket();
    } catch (err) {
      console.error('Erro ao conectar ao socket:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.scene.start('LoginScene');
      return;
    }

    this.socket = getSocket();

    if (!this.socket) {
      console.error('Socket não está disponível');
      this.scene.start('LoginScene');
      return;
    }

    this.setupSocketEvents(this.socket, this);
  }

  setupSocketEvents(socket) {
    socket.once(SOCKET_EVENTS.SYNC_GAME_STATE, ({ gameState }) => {
      this.scene.start('ReconnectScene', {
        gameState,
        socket,
      });
    });

    socket.once('RECONNECT_FAILED', () => {
      this.scene.start('MainMenuScene', { socket });
    });
  }
}
