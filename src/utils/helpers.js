import { SOCKET_EVENTS } from "../../api/events";
import { connectSocket, getSocket } from "../services/game-api-service";

const API_BASE = import.meta.env.VITE_API_BASE;

export function createButton(scene, x, y, text, callback, disabled = false) {
  const container = scene.add.container(x, y);

  const background = scene.add.image(0, 0, 'button_bg').setScale(1, 0.5);

  if (disabled) {
    background.setTint(0x555555);
  } else {
    background.setInteractive({ useHandCursor: true });
    background.on('pointerdown', callback);
    background.on('pointerover', () => background.setTint(0xaaaaaa));
    background.on('pointerout', () => background.clearTint());
  }

  const label = scene.add.text(0, 0, text, {
    fontSize: '16px',
    fontFamily: 'Fredoka',
    color: disabled ? '#888' : '#fff',
  }).setOrigin(0.5);

  container.add([background, label]);

  container.background = background;

  return container;
}

export function createBackground(scene, height, width, imageKey = 'background') {
    const bg = scene.add.image(0, 0, imageKey).setOrigin(0);
    const scaleX = width / bg.width;
    const scaleY = height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setOrigin(0);
}

export function createText(scene, x, y, text, fontSize = '16px', color = '#fff') {
  return scene.add.text(x, y, text, {
    fontSize: fontSize,
    fontFamily: 'Fredoka',
    color: color,
  }).setOrigin(0.5);
}

export async function login(scene, username, password) {
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      return 'Login ou senha inválidos.';
    }

    const data = await res.json();

    localStorage.setItem('token', data.token);

    await connectSocket();
    const socket = getSocket();

    if (!socket) {
      console.error('Erro ao conectar ao socket');
      return 'Erro de conexão. Tente novamente mais tarde.';
    }

    registerSyncGameStateListener(socket);

    scene.scene.start('MainMenuScene');

    return data;
  } catch (err) {
    console.error(err);
    return 'Erro de rede. Tente novamente mais tarde.';
  }
}


export async function setUserData() {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`${API_BASE}/me`, {
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

    localStorage.setItem('user', JSON.stringify(userData));

    return userData;
  } catch (err) {
    console.error('Erro ao buscar dados do usuário:', err.message);
    return null;
  }
}

export function getUserData() {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
}

export async function getHeroData() {
  const response = await fetch(`${API_BASE}/heroes`);
  if (!response.ok) throw new Error('Erro ao buscar dados dos heróis');

  const heroData = await response.json();
  return heroData;
}

export function registerSyncGameStateListener(socket, scene) {
  if (socket) {
    socket.on(SOCKET_EVENTS.SYNC_GAME_STATE, ({ gameState }) => {
      scene.scene.start('PreMatchScene', {
        gameState,
        reconnect: true,
      });
    });

    socket.once('RECONNECT_FAILED', () => {
      console.warn('Reconexão falhou: a partida não existe mais ou o outro jogador saiu.');
    });

    socket.hasSyncGameStateListener = true;
  }
}