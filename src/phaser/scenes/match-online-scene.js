import { createButton, createBackground, createText } from '../../utils/helpers';
import socket from '../../services/game-api-service.js';
import { SOCKET_EVENTS } from '../../../api/events.js';

export default class MatchOnlineScene extends Phaser.Scene {
  constructor() {
    super('MatchOnlineScene');
  }

  preload() {
    this.load.image('button_bg', 'assets/ui/button_bg.png');
  }

  create(user) {
    const { width, height } = this.scale;
    this.user = user;

    createBackground(this, height, width);

    createText(this, width / 2, 100, 'PARTIDA ONLINE', 32);

   createButton(this, width / 2, height - 300, 'PROCURAR PARTIDA', () => {
      this.scene.start('FindingMatchScene', {
        user: this.user
      });
    });
  
    createButton(this, width / 2, height - 100, 'VOLTAR', () => {
      this.scene.start('MainMenuScene');
    }); 
  }
}
