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
    this.load.image('arrow', 'assets/attacks/arrow.png');
    this.load.image('spell', 'assets/attacks/spell.png');
    this.load.image('default', 'assets/attacks/default.png');
    this.load.image('knife_slash', 'assets/attacks/knife_slash.png');
    this.load.image('sword_slash', 'assets/attacks/sword_slash.png');
    this.load.image('poison', 'assets/attacks/poison.png');
    this.load.image('boxing_glove', 'assets/attacks/boxing_glove.png');
    this.load.image('rip', 'assets/ui/rip.png');
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
    this.load.image('sprint', 'assets/ui/sprint.png');
    this.load.image('ranged', 'assets/ui/ranged.png');
    this.load.image('taunt', 'assets/ui/taunt.png');
    this.load.spritesheet('poison_effect', 'assets/sprites/poison.png', {
      frameWidth: 180,
      frameHeight: 180
    });
    this.load.image('shield', 'assets/ui/shield.png');
    this.load.image('ui_box_brown', 'assets/ui/ui_box_brown.png');
  }
  
  create({ gameState }) {
    this.scene.start('GameScene', {
      gameState
    });
  }  
}
