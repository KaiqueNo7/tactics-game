import { createButton, createBackground, createText } from '../../utils/helpers';

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

    if (!this.registry.get('user')) {
      await this.setUserData();
    }

    const userName = this.registry.get('user').username;

    createText(this, width / 2, height * 0.90, `Bem-vindo, ${userName}`);

    createButton(this, width / 2, height * 0.70, 'BATALHA', () => {
      this.scene.start('MatchOnlineScene');
    });
  }

  async setUserData() {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:3000/api/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Sessão expirada. Faça login novamente.');
        } else {
          throw new Error('Erro ao buscar dados do usuário.');
        }
      }

      const userData = await response.json();

      this.registry.set('user', userData);
    } catch (err) {
      console.error(err.message);
    }
  }
}
