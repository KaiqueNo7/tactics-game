import socket from '../../services/game-api-service.js';
import { SOCKET_EVENTS } from '../../../api/events.js';

export default class FindingMatchScene extends Phaser.Scene {
  constructor() {
    super('FindingMatchScene');
  }

  preload() {
    //
  }

  create() {
    const { width } = this.scale;

    this.procurandoText = this.add.text(width / 2, 100, 'PROCURANDO', {
      fontSize: '48px',
      color: '#ffffff',
    }).setOrigin(0.5);
      
    this.dots = '';
    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        this.dots = this.dots.length < 3 ? this.dots + '.' : '';
        this.procurandoText.setText('PROCURANDO' + this.dots);
      }
    });    
      
    socket.emit(SOCKET_EVENTS.FINDING_MATCH);

    socket.on(SOCKET_EVENTS.MATCH_FOUND, ({ roomId, players }) => {
      const mySocketId = socket.id;
      const myPlayer = players.find(p => p.id === mySocketId);
      const opponentPlayer = players.find(p => p.id !== mySocketId);
      
      this.scene.start('HeroSelectionScene', {
        roomId,
        players,
        myPlayer,
        opponentPlayer
      });
    });      
  }

}