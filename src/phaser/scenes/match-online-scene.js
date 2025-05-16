import { createButton, createBackground } from '../../utils/helpers';
import socket from '../../services/game-api-service.js';
import { SOCKET_EVENTS } from '../../../api/events.js';

export default class MatchOnlineScene extends Phaser.Scene {
  constructor() {
    super('MatchOnlineScene');
  }

  preload() {
    this.load.image('button_bg', 'assets/ui/button_bg.png');
  }

  create() {
    const { width, height } = this.scale;

    createBackground(this, height, width);

    this.add.text(width / 2, 100, 'PARTIDA ONLINE', {
      color: '#ffffff',
      fontSize: '32px',
    }).setOrigin(0.5);

    this.nameInput = document.createElement('input');
    this.nameInput.type = 'text';
    this.nameInput.placeholder = 'Digite um nome';
    this.nameInput.style.position = 'absolute';
    this.nameInput.style.top = '30%';
    this.nameInput.style.left = '50%';
    this.nameInput.style.transform = 'translate(-50%, -50%)';
    this.nameInput.style.width = '260px';
    this.nameInput.style.fontSize = '16px';
    this.nameInput.style.padding = '10px';
    this.nameInput.style.zIndex = 1000;
    document.body.appendChild(this.nameInput);    

    const startMatchButton = createButton(this, width / 2, height - 300, 'PROCURAR PARTIDA', () => {
      const playerName = this.nameInput.value.trim();
      let playerId = localStorage.getItem('playerId');
    
      playerId = crypto.randomUUID();
    
      this.registry.set('playerName', playerName);
      this.registry.set('playerId', playerId);
    
      if (playerName.length < 3) {
        console.log('Nome deve ter 5 ou mais letras');
        return;
      }
    
      this.nameInput.remove();
      startMatchButton.background.disableInteractive();
      this.scene.start('FindingMatchScene');
    });
    
    startMatchButton.background.disableInteractive();
    startMatchButton.alpha = 0.5;
    
    this.nameInput.addEventListener('input', () => {
      const value = this.nameInput.value.trim();
      if (value.length >= 3) {
        startMatchButton.background.setInteractive({ useHandCursor: true });
        startMatchButton.alpha = 1;
      } else {
        startMatchButton.background.disableInteractive();
        startMatchButton.alpha = 0.5;
      }
    });
    
    createButton(this, width / 2, height - 100, 'VOLTAR', () => {
      this.nameInput.remove();
      this.scene.start('MainMenuScene');
    });
    
  }
}
