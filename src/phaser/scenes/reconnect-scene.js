export class ReconnectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ReconnectScene' });
  }

  init({ gameState, socket }) {
    this.socket = socket;
    this.gameState = gameState;
  }

  create() {
    const gameState = this.gameState;

    this.scene.start('PreMatchScene', {
      gameState,
      reconnect: true,
    });
  }
}
