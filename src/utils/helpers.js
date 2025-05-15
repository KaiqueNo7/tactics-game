export function createButton(scene, x, y, text, callback, disabled = false) {
  const container = scene.add.container(x, y);

  const background = scene.add.image(0, 0, 'button_bg').setScale(1.3, 0.8);

  if (disabled) {
    background.setTint(0x555555);
  } else {
    background.setInteractive({ useHandCursor: true });
    background.on('pointerdown', callback);
    background.on('pointerover', () => background.setTint(0xaaaaaa));
    background.on('pointerout', () => background.clearTint());
  }

  const label = scene.add.text(0, 0, text, {
    fontSize: '24px',
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
