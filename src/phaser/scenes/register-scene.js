import { createBackground, login, createText } from "../../utils/helpers";

export default class RegisterScene extends Phaser.Scene {
  constructor() {
    super('RegisterScene');
  }

  preload() {
    this.load.image('background', 'assets/background/menu.png');
  }

  create() {
    const { width, height } = this.scale;

    createBackground(this, height, width);

    const baseY = height / 2 - 50;

    createText(this, width / 2, baseY - 80, 'Criar conta', '24px', '#ffffff', 'bold');

    this.createLabel('Username', width / 2 - 40, baseY - 20);
    const usernameInput = this.createInput(width / 2, baseY, 'text', 'Digite seu nome de usuário');

    this.createLabel('Senha', width / 2 - 55, baseY + 50);
    const passwordInput = this.createInput(width / 2, baseY + 70, 'password', 'Digite sua senha');

    const errorMsg = createText(this, width / 2, baseY + 200, '', '16px', '#ffffff');

    const registerBtn = this.createButton(width / 2 - 60, baseY + 130, 'Registrar');

    const API_BASE = process.env.API_BASE;

    registerBtn.addListener('click');
    registerBtn.on('click', async () => {
      const username = usernameInput.node.value.trim();
      const password = passwordInput.node.value.trim();

      if (!username || !password) {
        errorMsg.setText('Preencha todos os campos obrigatórios.');
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        if (!res.ok) {
          const errorData = await res.json();
          errorMsg.setText(errorData.error || 'Erro ao registrar.');
          return;
        }

        login(this, username, password);
      } catch (err) {
        console.error(err);
        errorMsg.setText('Erro de conexão com o servidor.');
      }
    });

    const linkText = this.add.text(width / 2, baseY + 190, 'Já tem conta? Entrar', {
      fontSize: '16px',
      color: '#00bcd4',
      fontFamily: 'Fredoka',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    linkText.on('pointerdown', () => {
      this.scene.start('LoginScene');
    });
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
      cursor: 'pointer',
      display: 'block',
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
