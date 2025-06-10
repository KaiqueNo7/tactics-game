import { connectSocket } from "../../services/game-api-service";
import { createBackground, login, registerSyncGameStateListener } from "../../utils/helpers";

export default class LoginScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'LoginScene',
      dom: { createContainer: true }
    });
  }

  preload() {
    this.load.image('background', 'assets/background/MenuScreen.jpg');
  }

  create() {
    const { width, height } = this.scale;

    createBackground(this, height, width);

    // Criando container principal
    const container = document.createElement('div');

    // Aplicando estilos de centralização
    Object.assign(container.style, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
      width: '300px',
      padding: '20px',
      background: 'rgba(0,0,0,0.5)',
      borderRadius: '10px'
    });

    // Título
    const title = document.createElement('h2');
    title.textContent = 'Login';
    title.style.color = '#fff';
    title.style.marginBottom = '10px';
    container.appendChild(title);

    // Username label + input
    const usernameLabel = document.createElement('label');
    usernameLabel.textContent = 'Username';
    usernameLabel.style.color = '#fff';
    usernameLabel.style.alignSelf = 'flex-start';

    container.appendChild(usernameLabel);

    const usernameInput = document.createElement('input');
    Object.assign(usernameInput, {
      type: 'text',
      placeholder: 'Digite seu nome de usuário'
    });
    this.styleInput(usernameInput);
    container.appendChild(usernameInput);

    // Password label + input
    const passwordLabel = document.createElement('label');
    passwordLabel.textContent = 'Senha';
    passwordLabel.style.color = '#fff';
    passwordLabel.style.alignSelf = 'flex-start';

    container.appendChild(passwordLabel);

    const passwordInput = document.createElement('input');
    Object.assign(passwordInput, {
      type: 'password',
      placeholder: 'Digite sua senha'
    });
    this.styleInput(passwordInput);
    container.appendChild(passwordInput);

    // Mensagem de erro
    const errorMsg = document.createElement('div');
    errorMsg.style.color = '#ff0000';
    errorMsg.style.fontFamily = 'Fredoka';
    errorMsg.style.fontSize = '14px';
    errorMsg.textContent = '';
    container.appendChild(errorMsg);

    // Botão de login
    const loginBtn = document.createElement('button');
    loginBtn.textContent = 'Entrar';
    Object.assign(loginBtn.style, {
      width: '100%',
      padding: '10px',
      marginTop: '10px',
      marginBottom: '10px',
      background: '#00bcd4',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'background 0.3s'
    });
    loginBtn.addEventListener('mouseenter', () => {
      loginBtn.style.background = '#0097a7';
    });
    loginBtn.addEventListener('mouseleave', () => {
      loginBtn.style.background = '#00bcd4';
    });

    loginBtn.addEventListener('click', async () => {
      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();

      if (!username || !password) {
        errorMsg.textContent = 'Preencha todos os campos.';
        return;
      }

      const result = await login(this, username, password);

      if (typeof result === 'string') {
        errorMsg.textContent = result;
      }
    });

    container.appendChild(loginBtn);

    const registerLink = document.createElement('a');
    registerLink.textContent = 'Não tem conta ainda? Cadastrar';
    Object.assign(registerLink.style, {
      color: '#00bcd4',
      fontFamily: 'Fredoka',
      fontSize: '14px',
      cursor: 'pointer',
      textDecoration: 'underline'
    });
    registerLink.addEventListener('click', () => {
      this.scene.start('RegisterScene');
    });

    container.appendChild(registerLink);

    this.add.dom(width / 2, height / 2, container);
  }

  styleInput(input) {
    Object.assign(input.style, {
      width: '100%',
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      marginTop: '5px',
      marginBottom: '10px',
      fontSize: '14px',
      color: '#333',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      transition: 'border-color 0.3s, box-shadow 0.3s'
    });

    input.addEventListener('focus', () => {
      input.style.borderColor = '#00bcd4';
      input.style.boxShadow = '0 0 5px rgba(0, 188, 212, 0.5)';
    });

    input.addEventListener('blur', () => {
      input.style.borderColor = '#ccc';
      input.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    });
  }

  init(){
    this.validateToken();
  }

  async validateToken() {
    const token = localStorage.getItem('token');
    if (token) {
      this.scene.start('MainMenuScene');
    }
  }
}
