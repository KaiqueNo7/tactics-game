export default class PreMatchScene extends Phaser.Scene {
  constructor() {
    super('PreMatchScene');
  }

  create({ players, roomId, startedPlayerIndex }) {
    const { width, height } = this.scale;
  
    const player1 = players.find(p => p.index === 1);
    const player2 = players.find(p => p.index === 2);
  
    player1.heroesData.forEach((hero, i) => {
      this.add.sprite(100 + i * 70, height / 2, 'heroes', hero.frame).setScale(2);
    });
  
    player2.heroesData.forEach((hero, i) => {
      this.add.sprite(width - 100 - i * 70, height / 2, 'heroes', hero.frame).setScale(2);
    });
  
    const vsText = this.add.text(width / 2, height / 2, 'VS', {
      fontSize: '80px',
      fontFamily: 'Arial Black',
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
        players,
        roomId,
        startedPlayerIndex,
      });
    });
  }  
}
