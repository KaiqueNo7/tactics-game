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

    // Fundo
    createBackground(this, height, width, 'background_main_menu');

    // Título do jogo
    const titleGame = this.add.image(width / 2, height * 0.15, 'title_game');
    titleGame.setOrigin(0.5);
    titleGame.setScale(0.6);  // ligeiramente maior para foco mobile
    titleGame.setDepth(1);

    // Dados do usuário
    let user = getUserData();
    if (!user) {
      user = await setUserData();
    }

    const userName = user.username;

    // Container de stats
    const statsY = height * 0.8;
    const statsSpacing = 25;

    createText(this, width / 2, statsY, `${userName}`, '20px', '#fff', 'bold').setOrigin(0.5);
    createText(this, width / 2, statsY + statsSpacing, `${user.wins} VITÓRIAS`, '16px', '#fff').setOrigin(0.5);
    createText(this, width / 2, statsY + statsSpacing * 2, `${user.losses} DERROTAS`, '16px', '#fff').setOrigin(0.5);

    // Coins e Level no topo
    createText(this, 20, 20, `Coins: ${user.coins}`, '14px', '#fff', 'bold').setOrigin(0, 0);
    createText(this, 20, 45, `Level: ${user.level}`, '14px', '#fff', 'bold').setOrigin(0, 0);

    // Botão principal de batalha
    const buttonY = height * 0.55;

    const battleButton = createButton(this, width / 2, buttonY, 'BATALHA', () => {
      this.scene.start('MatchOnlineScene');
    });
  }
}
