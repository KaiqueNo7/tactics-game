export default class PreMatchScene extends Phaser.Scene {
  constructor() {
    super('PreMatchScene');
  }

  preload() {  
    this.load.spritesheet('heroes', 'assets/sprites/heroes.png', {
      frameWidth: 165,
      frameHeight: 231    
    });
    this.load.spritesheet('faces_heroes', 'assets/sprites/faces_heroes.png', {
      frameWidth: 165,
      frameHeight: 165    
    });
    this.load.image('background_game', 'assets/background/01.png');
    this.load.image('hexagon_blue', 'assets/sprites/hexagon_blue.png');
    this.load.image('hexagon_red', 'assets/sprites/hexagon_red.png');
    this.load.image('hex_highlight', 'assets/sprites/hexagon_free.png');
    this.load.image('hex_highlight_enemy', 'assets/sprites/hex_enemy.png');
    this.load.image('next_turn', 'assets/ui/next_turn.png');
    this.load.image('hexagon', 'assets/sprites/hexagon.png');
    this.load.image('hex_tile', 'assets/ui/hex_tile.png');
    this.load.image('hex_tile_p1', 'assets/ui/hex_tile_p1.png');
    this.load.image('hex_tile_p2', 'assets/ui/hex_tile_p2.png');
    this.load.image('heart', 'assets/ui/heart.png');
    this.load.image('swords', 'assets/ui/swords.png');
    this.load.spritesheet('poison_effect', 'assets/sprites/poison.png', {
      frameWidth: 180,
      frameHeight: 180
    });
    this.load.image('shield', 'assets/ui/shield.png');
    this.load.image('ui_box_brown', 'assets/ui/ui_box_brown.png');
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

    this.scene.start('GameScene', {
      gameState
    });
  }  
}
