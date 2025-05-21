export default class RegisterScene extends Phaser.Scene {
  constructor() {
    super('RegisterScene');
  }

  preload() {
    // Pode carregar assets se quiser, como imagens de fundo ou logo
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2 - 120, 'Criar conta', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Username Label
    this.add.text(width / 2, height / 2 - 70, 'Nome de usuário', {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Username Input
    const usernameInput = this.add.dom(width / 2, height / 2 - 50, 'input', {
      type: 'text',
      style: 'width: 200px; padding: 10px;'
    });

    // Email Label
    this.add.text(width / 2, height / 2 - 30, 'Email', {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Email Input
    const emailInput = this.add.dom(width / 2, height / 2 - 10, 'input', {
      type: 'email',
      style: 'width: 200px; padding: 10px;'
    });

    // Password Label
    this.add.text(width / 2, height / 2 + 10, 'Senha', {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Password Input
    const passwordInput = this.add.dom(width / 2, height / 2 + 30, 'input', {
      type: 'password',
      style: 'width: 200px; padding: 10px;'
    });

    passwordInput.node.type = 'password';

    const registerBtn = this.add.dom(width / 2, height / 2 + 80, 'button', {
      style: 'width: 200px; padding: 10px; background: #00bcd4; color: white; border: none; cursor: pointer;'
    }, 'Registrar');

    const errorMsg = this.add.text(width / 2, height / 2 + 120, '', {
      color: '#ff6b6b',
      fontSize: '14px'
    }).setOrigin(0.5);

    const API_BASE = 'http://localhost:3000/api';

    registerBtn.addListener('click');
    registerBtn.on('click', async () => {
      const username = usernameInput.node.value.trim();
      const email = emailInput.node.value.trim();
      const password = passwordInput.node.value.trim();

      if (!username || !email || !password) {
        errorMsg.setText('Preencha todos os campos obrigatórios.');
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });

        if (!res.ok) {
          const errorData = await res.json();
          errorMsg.setText(errorData.error || 'Erro ao registrar.');
          return;
        }

        // Login automático após registro
        const loginRes = await fetch(`${API_BASE}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        if (!loginRes.ok) {
          errorMsg.setText('Erro ao fazer login após registro.');
          return;
        }

        const data = await loginRes.json();

        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('playerId', data.user.id);

        this.scene.start('MainMenuScene');
      } catch (err) {
        console.error(err);
        errorMsg.setText('Erro de conexão com o servidor.');
      }
    });

    // Link para ir para LoginScene
    const linkText = this.add.text(width / 2, height / 2 + 160, 'Já tem conta? Entrar', {
      fontSize: '12px',
      color: '#00bcd4'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    linkText.on('pointerdown', () => {
      this.scene.start('LoginScene');
    });
  }
}
