export default class PreMatchScene extends Phaser.Scene {
  constructor() {
    super('PreMatchScene');
  }

  create({ gameState }) {
    const { width, height } = this.scale;
  
    const player1 = gameState.players[0];
    const player2 = gameState.players[1];
  
    player1.heroes.forEach((hero, i) => {
      this.add.sprite(100 + i * 50, height / 2, 'heroes', hero.frame).setScale(0.5);
    });
  
    player2.heroes.forEach((hero, i) => {
      this.add.sprite(width - 100 - i * 50, height / 2, 'heroes', hero.frame).setScale(0.5);
    });
  
    const vsText = this.add.text(width / 2, height / 2, 'VS', {
      fontSize: '65px',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setScale(0);
  
    this.tweens.add({
      targets: vsText,
      scale: 1,
      duration: 500,
      ease: 'Back.Out',
      yoyo: false
    });
  
    this.time.delayedCall(2500, () => {
      this.scene.start('GameScene', {
        gameState
      });
    });
  }  
}
