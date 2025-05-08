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
      this.scene.stop('FindingMatchScene');
      this.scene.start('MatchOnlineScene');
    });
  

    socket.on(SOCKET_EVENTS.SYNC_GAME_STATE, ({ gameState }) => {
      console.log('Reconectado com sucesso!');

      console.log('Estado do jogo recebido:', gameState);
      
      this.scene.stop('FindingMatchScene');
      this.scene.start('PreMatchScene', {
        gameState,
        reconnect: true,
      });
    });
  
    socket.once('RECONNECT_FAILED', () => {
      console.warn('Reconexão falhou: a partida não existe mais ou o outro jogador saiu.');
    
      setTimeout(() => {
        socket.emit(SOCKET_EVENTS.FINDING_MATCH, {
          player: player.toJSON()
        });
      }, 3000);
    });
    
  
    socket.emit(SOCKET_EVENTS.RECONNECTING_PLAYER, {
      playerId
    });
  
    socket.on(SOCKET_EVENTS.MATCH_FOUND, ({ roomId, players }) => {  
      this.scene.stop('FindingMatchScene');
      this.scene.start('HeroSelectionScene', {
        players,
        roomId
      });
    });
  }  
}