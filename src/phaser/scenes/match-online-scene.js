import { createButton, createBackground, createText } from '../../utils/helpers';
import { i18n } from '../../../i18n';

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

  createText(this, width / 2, 100, i18n.match_online, 32);

    createButton(this, width / 2, height - 300, i18n.find_match, () => {
      this.scene.start('FindingMatchScene');
    });
    
    createButton(this, width / 2, height - 100, i18n.back, () => {
      this.scene.start('MainMenuScene');
    }); 
  }
}
