import { createButton, createBackground } from '../../utils/helpers';

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  preload() {
    this.load.image('background', 'assets/background/menu.png');
  }

  create() {
    const { width, height } = this.scale;

    createBackground(this, height, width);

    createButton(this, width / 2, height * 0.70, 'BATALHA', () => {
      this.scene.start('MatchOnlineScene');
    });
  }
}
