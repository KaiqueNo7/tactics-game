import { createButton, createBackground, createText, setUserData, getUserData } from '../../utils/helpers';

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  preload() {
    this.load.image('background', 'assets/background/menu.png');
    this.load.image('button_bg', 'assets/ui/button_bg.png');
    this.load.image('title_game', 'assets/ui/title_game.png');
  }

  async create() {
    const { width, height } = this.scale;

    createBackground(this, height, width);

    const titleGame = this.add.image(width / 2, height * 0.15, 'title_game');
    titleGame.setOrigin(0.5, 0.5);
    titleGame.setScale(0.2);
    titleGame.setDepth(1);

    let user = getUserData();

    if (!user) {
      user = await setUserData();
    }

    const userName = user.username;

    createText(this, width / 2, height * 0.90, `${userName}`);
    createText(this, width / 2, height * 0.95, `${user.wins} VITÓRIAS`);
    createText(this, width / 2, height * 0.98, `${user.losses} DERROTAS`);
    createText(this, 40, height * 0.15, `coins: ${user.coins}`);
    createText(this, 40, height * 0.20, `level: ${user.level}`);

    createButton(this, width / 2, height * 0.70, 'BATALHA', () => {
      this.scene.start('MatchOnlineScene');
    });
  }
}
