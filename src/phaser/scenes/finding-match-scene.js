import { createButton, createBackground, createText, getUserData } from '../../utils/helpers.js';
import Player from '../../core/player.js';
import { getSocket } from '../../services/game-api-service.js';
import { SOCKET_EVENTS } from '../../../api/events.js';

export default class FindingMatchScene extends Phaser.Scene {
  constructor() {
    super('FindingMatchScene');
  }

  preload() {
    this.load.image('background', 'assets/background/all.png');
  }

  create() {
    const { width, height } = this.scale;
    const socket = getSocket();
    this.user = getUserData();

    createBackground(this, height, width);
  
    const player = new Player(
      this.user.username?.trim().substring(0, 20) || 'Jogador_' + Math.floor(Math.random() * 1000),
      [],
      this.user.id,
      null
    );

    socket.emit(SOCKET_EVENTS.FINDING_MATCH, {
      player: player.toJSON(),
    });
  
    this.procurandoText = createText(this, width / 2, 100, 'PROCURANDO', 28);
  
    this.dots = '';
    this.time.addEvent({
      callback: () => {
        this.dots = this.dots.length < 3 ? this.dots + '.' : '';
        this.procurandoText.setText('PROCURANDO' + this.dots);
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