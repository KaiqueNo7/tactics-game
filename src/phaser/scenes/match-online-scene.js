export default class MatchOnlineScene extends Phaser.Scene {
  constructor() {
    super('MatchOnlineScene');
  }

  preload() {
    // 
  }

  create() {
    const { width } = this.scale;

    this.add.text(width / 2, 100, 'PARTIDA ONLINE', {
      fontSize: '48px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.createButton(width / 2, 200, 'PARTIDA PRIVADA (Em desenvolvimento)', null, false);

    this.createButton(width / 2, 270, 'PARTIDA ALEATÓRIA', () => {
      this.scene.start('FindingMatchScene');
    });
  }

  createButton(x, y, text, callback, disabled = false) {
    const btn = this.add.text(x, y, text, {
      fontSize: '28px',
      color: disabled ? '#777' : '#fff',
      backgroundColor: disabled ? '#333' : '#555',
      padding: { x: 20, y: 10 },
      align: 'center'
    }).setOrigin(0.5).setInteractive();

    if (disabled) {
      btn.disableInteractive();
    } else if (callback) {
      btn.on('pointerdown', callback);
      btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#777' }));
      btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#555' }));
    }
  }
}
