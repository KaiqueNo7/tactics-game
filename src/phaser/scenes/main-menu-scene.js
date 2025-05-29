import { createButton, createBackground, createText, setUserData, getUserData } from '../../utils/helpers';

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  preload() {
    this.load.image('background_main_menu', 'assets/background/menu.png');
    this.load.image('button_bg', 'assets/ui/button_bg.png');
    this.load.image('title_game', 'assets/ui/title_game.png');
  }

  async create() {
    const { width, height } = this.scale;

    createBackground(this, height, width, 'background_main_menu');

    const titleGame = this.add.image(width / 2, height * 0.20, 'title_game');
    titleGame.setOrigin(0.5);
    titleGame.setScale(0.4);
    titleGame.setDepth(1);

    let user = await setUserData();

    const userName = user.username;

    createText(this, 20, 125, `${userName}`, '14px', '#fff', 'bold').setOrigin(0, 0);

    createText(this, 20, 20, `Coins: ${user.coins}`, '14px', '#fff', 'bold').setOrigin(0, 0);
    createText(this, 20, 45, `Level: ${user.level}`, '14px', '#fff', 'bold').setOrigin(0, 0);
    createText(this, 20, 70, `W: ${user.wins}`, '14px', '#fff').setOrigin(0, 0);
    createText(this, 20, 95, `L: ${user.losses}`, '14px', '#fff').setOrigin(0, 0);

    // Botão principal de batalha
    const buttonY = height * 0.55;

    const battleButton = createButton(this, width / 2, buttonY, 'BATALHA', () => {
      this.scene.start('MatchOnlineScene');
    });

    createText(this, width / 2, buttonY - 60, `alpha`, '14px', '#fff').setOrigin(0, 0);
  }
}
