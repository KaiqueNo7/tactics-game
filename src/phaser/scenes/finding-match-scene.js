import { createButton, createBackground, createText } from '../../utils/helpers.js';
import Player from '../../core/player.js';
import socket from '../../services/game-api-service.js';
import { SOCKET_EVENTS } from '../../../api/events.js';

export default class FindingMatchScene extends Phaser.Scene {
  constructor() {
    super('FindingMatchScene');
  }

  preload() {
    this.load.image('background', 'assets/background/menu.png');
  }

  create() {
    const { width, height } = this.scale;

    createBackground(this, height, width);
  
    const player = new Player(
      this.registry.get('user').username?.trim().substring(0, 20) || 'Jogador_' + Math.floor(Math.random() * 1000),
      [],
      this.registry.get('user').id,
      null
    );

    console.log('player', player.toJSON());

    socket.emit(SOCKET_EVENTS.FINDING_MATCH, {
      player: player.toJSON()
    });
  
    this.procurandoText = createText(this, width / 2, 100, 'Procurando', 28);
  
    this.dots = '';
    this.time.addEvent({
      callback: () => {
        this.dots = this.dots.length < 3 ? this.dots + '.' : '';
        this.procurandoText.setText('Procurando' + this.dots);
      },
      delay: 500,
      loop: true
    });
  
    createButton(this, width / 2, 500, 'CANCELAR', () => {
      socket.emit(SOCKET_EVENTS.QUIT_QUEUE);
      this.scene.stop('FindingMatchScene');
      this.scene.start('MatchOnlineScene');
    });

    socket.on(SOCKET_EVENTS.QUIT_QUEUE, () => {
      this.scene.stop('FindingMatchScene');
      this.scene.start('MatchOnlineScene');
    });
  
    socket.on(SOCKET_EVENTS.MATCH_FOUND, ({ roomId, players }) => {  
      this.scene.stop('FindingMatchScene');
      this.scene.start('HeroSelectionScene', {
        players,
        roomId
      }, true);
    });

    this.events.once('shutdown', () => {
      socket.off(SOCKET_EVENTS.QUIT_QUEUE);
      socket.off(SOCKET_EVENTS.MATCH_FOUND);
    });
  }  
}