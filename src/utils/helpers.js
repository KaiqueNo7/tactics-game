export default function createButton(scene, x, y, text, callback, disabled = false) {
  const btn = scene.add.text(x, y, text, {
    align: 'center',
    backgroundColor: disabled ? '#333' : '#555',
    color: disabled ? '#777' : '#fff',
    fontSize: '24px',
    padding: { x: 20, y: 10 }
  }).setOrigin(0.5).setInteractive();

  if (disabled) {
    btn.disableInteractive();
  } else if (callback) {
    btn.on('pointerdown', callback);
    btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#777' }));
    btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#555' }));
  }

  return btn;
}
