import {
  createButton,
  createBackground,
  createText,
  setUserData,
} from '../../utils/helpers';
import { i18n } from '../../../i18n';

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  preload() {
    this.load.image('background_main_menu', 'assets/background/MenuScreen.jpg');
    this.load.image('button_bg', 'assets/ui/button_bg.png');
    this.load.image('title_game', 'assets/ui/title_game.png');

    // Ícones
    this.load.image('coin_icon', 'assets/ui/coin_icon.png');
    this.load.image('trophy_icon', 'assets/ui/trophy_icon.png');
    this.load.image('skull_icon', 'assets/ui/skull_icon.png');
    this.load.image('settings_icon', 'assets/ui/settings_icon.png');
  }

  async create() {
    const { width, height } = this.scale;

    createBackground(this, height, width, 'background_main_menu');

    const titleGame = this.add.image(width / 2, height * 0.24, 'title_game');
    titleGame.setOrigin(0.5);
    titleGame.setScale(0.4);
    titleGame.setDepth(1);

    let user = await setUserData();

    if (!user) {
      this.cleanDataAndRedirectToLogin();
    }

    createText(this, width / 2, 40, `${user.username}`, '18px', '#fff', 'bold').setOrigin(0.5);

    this.add.image(width / 2 - 100, 80, 'coin_icon').setScale(0.5);
    createText(this, width / 2 - 80, 80, `${user.coins}`, '14px', '#fff').setOrigin(0, 0.5);

    this.add.image(width / 2, 80, 'trophy_icon').setScale(0.5);
    createText(this, width / 2 + 20, 80, `${user.wins}W`, '14px', '#fff').setOrigin(0, 0.5);

    this.add.image(width / 2 + 80, 80, 'skull_icon').setScale(0.5);
    createText(this, width / 2 + 100, 80, `${user.losses}L`, '14px', '#fff').setOrigin(0, 0.5);

    createText(this, 40, 40, `Lvl: ${user.level}`, '14px', '#fff').setOrigin(0, 0.5);

    const leaverBtn = createText(this, width - 40, height - 40, i18n.exit, '12px', '#fff', 'bold').setInteractive();
    leaverBtn.setScale(1);
    leaverBtn.setOrigin(0.5);
    leaverBtn.on('pointerdown', () => {
      this.cleanDataAndRedirectToLogin();
    });

    const battleButton = createButton(this, width / 2, height * 0.60, i18n.battle, () => {
      this.scene.start('MatchOnlineScene');
    });
  }

  cleanDataAndRedirectToLogin() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.scene.start('LoginScene');
  }
}
