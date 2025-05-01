import createButton from "../../utils/helpers";

export default class MatchOnlineScene extends Phaser.Scene {
  constructor() {
    super('MatchOnlineScene');
  }

  preload() {
    //
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, 100, 'PARTIDA ONLINE', {
      color: '#ffffff',
      fontSize: '32px',
      fontFamily: '"Press Start 2P"',
    }).setOrigin(0.5);

    this.nameInput = document.createElement('input');
    this.nameInput.type = 'text';
    this.nameInput.placeholder = 'Digite seu nome';
    this.nameInput.style.position = 'absolute';
    this.nameInput.style.top = '30%';
    this.nameInput.style.left = '50%';
    this.nameInput.style.transform = 'translate(-50%, -50%)';
    this.nameInput.style.width = '300px';
    this.nameInput.style.fontSize = '18px';
    this.nameInput.style.padding = '10px';
    this.nameInput.style.zIndex = 1000;
    document.body.appendChild(this.nameInput);    

    // Criar botão
    const startMatchButton = createButton(this, width / 2, 270, 'PARTIDA ALEATÓRIA', () => {
      const playerName = this.nameInput.value.trim();
      let playerId = localStorage.getItem('playerId');

      playerId = crypto.randomUUID();

      this.registry.set('playerName', playerName);
      this.registry.set('playerId', playerId);

      if(playerName.length < 5){
        console.log('Nome deve ter 5 ou mais letras');
        return; 
      }

      this.nameInput.remove();
      startMatchButton.setInteractive(false);

      this.nameInput.remove();
      this.scene.start('FindingMatchScene');
    });

    startMatchButton.setInteractive(false);
    startMatchButton.alpha = 0.5;

    this.nameInput.addEventListener('input', () => {
      const value = this.nameInput.value.trim();
      if (value.length >= 5) {
        startMatchButton.setInteractive(true);
        startMatchButton.alpha = 1;
      } else {
        startMatchButton.setInteractive(false);
        startMatchButton.alpha = 0.5;
      }
    });

    createButton(this, width / 2, 370, 'VOLTAR', () => {
      this.nameInput.remove();
      this.scene.start('MainMenuScene');
    });
  }
}
