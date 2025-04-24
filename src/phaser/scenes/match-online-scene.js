import createButton from "../../utils/helpers";

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
      color: '#ffffff',
      fontSize: '48px',
    }).setOrigin(0.5);

    createButton(this, width / 2, 270, 'PARTIDA ALEATÓRIA', () => {
      this.scene.start('FindingMatchScene');
    });

    createButton(this, width / 2, 370, 'VOLTAR', () => {
      this.scene.start('MainMenuScene');
    });
  }
}
