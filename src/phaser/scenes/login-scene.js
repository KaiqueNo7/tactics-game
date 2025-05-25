import { createBackground, createText, login } from "../../utils/helpers";

export default class LoginScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'LoginScene',
      dom: { createContainer: true }
    });
  }

  preload() {
    this.load.image('background', 'assets/background/menu.png');
  }

  async create() {
    const { width, height } = this.scale;

    createBackground(this, height, width);
    await this.validateToken();

    // Ponto base central para alinhar tudo
    const baseY = height / 2 - 50;

    createText(this, width / 2, baseY - 80, 'Login', '24px', '#ffffff', 'bold');

    this.createLabel('Username', width / 2 - 40, baseY - 20);
    const usernameInput = this.createInput(width / 2, baseY, 'text', 'Digite seu nome de usuário');

    this.createLabel('Senha', width / 2 - 55, baseY + 50);
    const passwordInput = this.createInput(width / 2, baseY + 70, 'password', 'Digite sua senha');

    const errorMsg = createText(this, width / 2, baseY + 220, '', '16px');

    const loginBtn = this.createButton(width / 2 - 65, baseY + 130, 'Entrar');
;
    loginBtn.addListener('click');
    loginBtn.on('click', async () => {
      const username = usernameInput.node.value.trim();
      const password = passwordInput.node.value.trim();

      if (!username || !password) {
        errorMsg.setText('Preencha todos os campos.');
        return;
      }
      errorMsg.setText('');
      login(this, username, password);
    });

    const linkText = this.add.text(width / 2, baseY + 190, 'Não tem conta ainda? Cadastrar', {
      fontSize: '16px',
      color: '#00bcd4',
      fontFamily: 'Fredoka',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    linkText.on('pointerdown', () => {
      this.scene.start('RegisterScene');
    });
  }

  async validateToken() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch('http://localhost:3000/api/validate-token', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Token inválido');
        const data = await res.json();
        console.log('Token válido:', data);
        this.scene.start('MainMenuScene');
      } catch (err) {
        console.warn('Token inválido ou expirado:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('playerId');
      }
    }
  }

  createLabel(text, x, y) {
    createText(this, x, y, text, '16px', '#ffffff', 'bold');
  }

  createInput(x, y, type = 'text', placeholder = '') {
    const input = this.add.dom(x, y, 'input');

    Object.assign(input.node, {
      type,
      placeholder
    });

    Object.assign(input.node.style, {
      width: '200px',
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '14px',
      color: '#333',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      transition: 'border-color 0.3s, box-shadow 0.3s'
    });

    input.node.addEventListener('focus', () => {
      input.node.style.borderColor = '#00bcd4';
      input.node.style.boxShadow = '0 0 5px rgba(0, 188, 212, 0.5)';
    });

    input.node.addEventListener('blur', () => {
      input.node.style.borderColor = '#ccc';
      input.node.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    });

    return input;
  }

  createButton(x, y, text) {
    const button = this.add.dom(x, y, 'button', null, text);

    Object.assign(button.node.style, {
      width: '200px',
      padding: '10px',
      background: '#00bcd4',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      display: 'block',             
      boxSizing: 'border-box', 
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'background 0.3s, box-shadow 0.3s'
    });

    button.node.addEventListener('mouseenter', () => {
      button.node.style.background = '#0097a7';
      button.node.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    });

    button.node.addEventListener('mouseleave', () => {
      button.node.style.background = '#00bcd4';
      button.node.style.boxShadow = 'none';
    });

    return button;
  }
}
