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

export function createBackground(scene, height, width) {
    const bg = scene.add.image(0, 0, 'background').setOrigin(0);
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


export function login(scene, username, password) {
  const API_BASE = 'http://localhost:3000/api';

  fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  }).then((res) => {
      if (!res.ok) {
        throw new Error('Login failed');
      }
      return res.json();
    })
    .then((data) => {
      localStorage.setItem('token', data.token);
      scene.scene.start('MainMenuScene');
      return data;
    });
}

export async function setUserData() {
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
  const response = await fetch('http://localhost:3000/api/heroes');
  if (!response.ok) throw new Error('Erro ao buscar dados dos heróis');

  const heroData = await response.json();
  return heroData;
}