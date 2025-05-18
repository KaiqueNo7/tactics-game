import { createButton, createBackground } from '../../utils/helpers.js';
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
  
    let playerId = sessionStorage.getItem('playerId');
  
    if (!playerId) {
      playerId = crypto.randomUUID();
      sessionStorage.setItem('playerId', playerId);
    }  

    const player = new Player(
      this.registry.get('playerName')?.trim().substring(0, 20) || 'Jogador_' + Math.floor(Math.random() * 1000),
      [],
      playerId,
      null
    );

    console.log(player.toJSON);

    socket.emit(SOCKET_EVENTS.FINDING_MATCH, {
      player: player.toJSON()
    });
  
    this.procurandoText = this.add.text(width / 2, 100, 'PROCURANDO', {
      color: '#ffffff',
      fontSize: '28px',
      fontFamily: 'Fredoka',
    }).setOrigin(0.5);
  
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