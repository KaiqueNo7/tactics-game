import createButton from '../../utils/helpers';

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  preload() {
    this.load.image('background', 'assets/background/menu.png');
    this.load.image('title', 'assets/background/title.png');
  }

  create() {
    const { width, height } = this.scale;

    const bg = this.add.image(0, 0, 'background').setOrigin(0);
    const scaleX = width / bg.width;
    const scaleY = height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setOrigin(0);

    const text = this.add.image(width / 2, height * 0.25, 'title');
    const maxWidth = width * 1;
    const maxHeight = height * 0.5;
    const scaleFactor = Math.min(maxWidth / text.width, maxHeight / text.height);
    text.setScale(scaleFactor).setOrigin(0.5);

    createButton(this, width / 2, height * 0.70, 'BATALHA', () => {
      this.scene.start('MatchOnlineScene');
    });
  }
}
