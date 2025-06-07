import { createButton, createBackground, createText } from '../../utils/helpers';

export default class MatchOnlineScene extends Phaser.Scene {
  constructor() {
    super('MatchOnlineScene');
  }

  preload() {
    this.load.image('background_match', 'assets/background/MenuScreen.jpg');
    this.load.image('button_bg', 'assets/ui/button_bg.png');
  }

  create() {
    const { width, height } = this.scale;

    createBackground(this, height, width, 'background_match');

    createText(this, width / 2, 100, 'PARTIDA ONLINE', 32);

    createButton(this, width / 2, height - 300, 'PROCURAR PARTIDA', () => {
      this.scene.start('FindingMatchScene');
    });
    
    createButton(this, width / 2, height - 100, 'VOLTAR', () => {
      this.scene.start('MainMenuScene');
    }); 
  }
}
