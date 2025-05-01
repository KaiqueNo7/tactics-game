import socket from '../../services/game-api-service.js';
import { SOCKET_EVENTS } from '../../../api/events.js';
import createButton from '../../utils/helpers.js';
import Player from '../../core/player.js';

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
      color: '#ffffff',
      fontSize: '48px',
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
      this.scene.start('MatchOnlineScene');
    });

    const player = new Player(
      this.registry.get('playerName')?.trim().substring(0, 20) || 'Jogador_' + Math.floor(Math.random() * 1000),
      [],
      this.registry.get('playerId') || crypto.randomUUID(),
      null
    );    

    localStorage.setItem('playerId', player.id);

    socket.emit(SOCKET_EVENTS.FINDING_MATCH, {
      player: player.toJSON()
    });

    socket.on(SOCKET_EVENTS.MATCH_FOUND, ({ roomId, players }) => {
      const mySocketId = socket.id;
      const myPlayer = players.find(p => p.id === mySocketId);
      const opponentPlayer = players.find(p => p.id !== mySocketId);
      
      this.scene.start('HeroSelectionScene', {
        myPlayer,
        opponentPlayer,
        players,
        roomId
      });
    });      
  }

}