export default class ReconnectionScene extends Phaser.Scene {
  constructor() {
    super('ReconnectionScene');
  }

  create({ gameState }) {
    const { width, height } = this.scale;

    this.add.image(width / 2, height / 2, 'background_game').setScale(1.5);

    const reconnectText = this.add.text(width / 2, height / 2 - 50, 'Reconectando...', {
      fontSize: '40px',
      fontFamily: 'Arial Black',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    const loadingText = this.add.text(width / 2, height / 2 + 50, 'Carregando...', {
      fontSize: '40px',
      fontFamily: 'Arial Black',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.tweens.add({
      targets: reconnectText,
      alpha: { from: 1, to: 0 },
      duration: 1000,
      ease: 'Power1',
      yoyo: true,
      repeat: -1
    });

    this.tweens.add({
      targets: loadingText,
      alpha: { from: 1, to: 0 },
      duration: 1000,
      ease: 'Power1',
      yoyo: true,
      repeat: -1
    });

    this.time.delayedCall(5000, () => { 
      this.scene.start('GameScene', {
        gameState,
        reconnect: true,
      });
    });
  }
}