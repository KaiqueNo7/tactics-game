import { createButton, login } from "../../utils/helpers";

export default class LoginScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'LoginScene',
      dom: {
        createContainer: true
      }
    });
  }

  preload() {

  }

  create() {
    const { width, height } = this.scale;

    const token = localStorage.getItem('token');

    if (token) {
      fetch('http://localhost:3000/api/validate-token', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => {
        if (!res.ok) throw new Error('Token inválido');
        return res.json();
      })
      .then(data => {
        console.log('Token válido:', data);
        this.scene.start('MainMenuScene');
      })
      .catch(err => {
        console.warn('Token inválido ou expirado:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('playerId');
      });
    }    

    this.add.text(width / 2, height / 2 - 90, 'Login', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const linkText = this.add.text(width / 2, height / 2 + 160, 'Não tem conta ainda? Cadastrar', {
      fontSize: '12px',
      color: '#00bcd4'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    linkText.on('pointerdown', () => {
      this.scene.start('RegisterScene');
    });

    // username Label
    this.add.text(width / 2 - 75, height / 2 - 50, 'Username', {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0, 0.5);

    // username Input
    const usernameInput = this.add.dom(width / 2, height / 2 - 30, 'input', {
      type: 'username',
      style: 'width: 200px; padding: 10px;'
    });

    // Password Label
    this.add.text(width / 2 - 75, height / 2, 'Senha', {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0, 0.5);

    // Password Input
    const passwordInput = this.add.dom(width / 2, height / 2 + 20, 'input', {
      type: 'password',
      style: 'width: 200px; padding: 10px;'
    });

    passwordInput.node.type = 'password';

    const loginBtn = this.add.dom(width / 2, height / 2 + 60, 'button', {
      style: 'width: 200px; padding: 10px; background: #00bcd4; color: white; border: none; cursor: pointer;'
    }, 'Entrar');

    const errorMsg = this.add.text(width / 2, height / 2 + 100, '', {
      color: '#ff6b6b',
      fontSize: '14px'
    }).setOrigin(0.5);

    const API_BASE = 'http://localhost:3000/api';

    loginBtn.addListener('click');
    loginBtn.on('click', async () => {
      const username = usernameInput.node.value.trim();
      const password = passwordInput.node.value.trim();

      if (!username || !password) {
        errorMsg.setText('Preencha todos os campos.');
        return;
      }

      login(this, username, password);
    });
  }
}
