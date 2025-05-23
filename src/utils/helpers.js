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