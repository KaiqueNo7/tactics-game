import socket from '../../services/game-api-service.js'

export default class FindingMatchScene extends Phaser.Scene {
    constructor() {
        super('FindingMatchScene');
    }

    preload() {
        //
    }

    create() {
      const { width, height } = this.scale;

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
      
      socket.emit('finding_match');

      socket.on('match found', (data) => {
        console.log('Partida encontrada!', data);
  
        this.scene.start('CharacterSelectionScene', { roomId: data.roomId });
      });
    }

}