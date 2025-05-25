import { createButton, createBackground, createText, setUserData, getUserData } from '../../utils/helpers';

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  preload() {
    this.load.image('background', 'assets/background/menu.png');
    this.load.image('button_bg', 'assets/ui/button_bg.png');
  }

  async create() {
    const { width, height } = this.scale;

    createBackground(this, height, width);

    let user = getUserData();

    if (!user) {
      user = await setUserData();
    }

    const userName = user.username;

    createText(this, width / 2, height * 0.90, `Bem-vindo, ${userName}`);

    createButton(this, width / 2, height * 0.70, 'BATALHA', () => {
      this.scene.start('MatchOnlineScene');
    });
  }
}
