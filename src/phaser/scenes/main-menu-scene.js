import {
  createButton,
  createBackground,
  createText,
  setUserData,
  getUserData
} from '../../utils/helpers';

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

    const userName = user.username;

    createText(this, width / 2, 40, userName, '18px', '#fff', 'bold').setOrigin(0.5);

    this.add.image(width / 2 - 100, 80, 'coin_icon').setScale(0.5);
    createText(this, width / 2 - 80, 80, `${user.coins}`, '14px', '#fff').setOrigin(0, 0.5);

    this.add.image(width / 2, 80, 'trophy_icon').setScale(0.5);
    createText(this, width / 2 + 20, 80, `${user.wins}W`, '14px', '#fff').setOrigin(0, 0.5);

    this.add.image(width / 2 + 80, 80, 'skull_icon').setScale(0.5);
    createText(this, width / 2 + 100, 80, `${user.losses}L`, '14px', '#fff').setOrigin(0, 0.5);

    const settingsBtn = this.add.image(width - 40, 40, 'settings_icon').setInteractive();
    settingsBtn.setScale(0.5);
    settingsBtn.on('pointerdown', () => {
      this.cleanDataAndRedirectToLogin();
    });

    // Botão principal de batalha
    const battleButton = createButton(this, width / 2, height * 0.60, 'BATALHA', () => {
      this.scene.start('MatchOnlineScene');
    });

    // Painel inferior com outros botões
    // const inventoryBtn = createButton(this, width / 2 - 120, height - 80, 'INVENTÁRIO', () => {
    //   console.log('Abrir inventário');
    // });

    // const heroesBtn = createButton(this, width / 2, height - 80, 'HERÓIS', () => {
    //   console.log('Abrir seleção de heróis');
    // });

    // const shopBtn = createButton(this, width / 2 + 120, height - 80, 'LOJA', () => {
    //   console.log('Abrir loja');
    // });
  }

  cleanDataAndRedirectToLogin() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.scene.start('LoginScene');
  }
}
