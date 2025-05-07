import { SOCKET_EVENTS } from "../../api/events.js";

export default class GameUI extends Phaser.GameObjects.Container {
  constructor(scene, socket, roomId) {
    super(scene, socket, roomId)

    this.scene = scene;
    this.messageQueue = [];
    this.isShowingMessage = false;
    this.socket = socket;
    this.heroes = {};
    this.roomId = roomId;

    this.buttonEnabled = false;

    this.container = this.scene.add.container(this.scene.scale.width / 2, -50);
        
    this.background = this.scene.add.image(0, 0, 'ui_box_brown')
      .setOrigin(0.5)
      .setScale(2, 1);

    this.text = this.scene.add.text(0, 0, '', {
      color: '#000',
      fontSize: '16px',
      fontWeight: 'bold',
    }).setOrigin(0.5);

    this.container.add([this.background, this.text]);

    this.finalY = 150;
  }

  updateTurnTimer(seconds) {
    if (seconds > 30) {
      if (this.turnTimerText) {
        this.turnTimerText.setVisible(false);
      }
      return;
    }
  
    const color =
      seconds <= 10 ? '#FF6666' :
      seconds <= 30 ? '#FFFF00' :
      '#FFFFFF';
  
    if (this.turnTimerText) {
      this.turnTimerText.setText(`${seconds}`);
      this.turnTimerText.setColor(color);
      this.turnTimerText.setVisible(true);
    }
  }  

  createEndTurnButton() {
    this.endTurnButtonContainer = this.scene.add.container(
      this.scene.scale.width - 100,
      this.scene.scale.height / 2
    );
  
    this.endTurnBackground = this.scene.add.image(0, 0, 'next_turn')
      .setOrigin(0.5)
      .setScale(1.5)
      .setInteractive({ useHandCursor: true });
  
    this.endTurnBackground.on('pointerdown', () => {
      if (!this.buttonEnabled) return;
      this.socket.emit(SOCKET_EVENTS.NEXT_TURN_REQUEST, { 
        roomId: this.roomId, 
        playerId: sessionStorage.getItem('playerId')
      });
    });
  
    this.endTurnBackground.on('pointerover', () => {
      if (!this.buttonEnabled) return;
      this.endTurnBackground.setTint(0xaaaaaa);
    });
  
    this.endTurnBackground.on('pointerout', () => {
      if (!this.buttonEnabled) return;
      this.endTurnBackground.clearTint();
      this.endTurnBackground.setAlpha(1);
    });
  
    this.turnTimerText = this.scene.add.text(
      0, 
      55,
      '',
      {
        align: 'right',
        color: '#FFFFFF',
        fontSize: '18px',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 1.4
      }
    ).setOrigin(0.5);
  
    this.endTurnButtonContainer.add([this.endTurnBackground, this.turnTimerText]);
  }  

  setEndTurnButtonEnabled(enabled) {
    this.buttonEnabled = enabled;

    if (enabled) {
      this.endTurnBackground.setInteractive();
      this.endTurnBackground.setAlpha(1);
    } else {
      this.endTurnBackground.disableInteractive();
      this.endTurnBackground.clearTint();
      this.endTurnBackground.setAlpha(0.5);
    }
  }

  createBackground() {
    const bg = this.scene.add.image(0, 0, 'background_game');
    bg.setOrigin(0);
    bg.setDisplaySize(this.scene.scale.width, this.scene.scale.height);
  }

  createStatsUI(hero) {
    if (!hero.sprite) return;
  
    const offsetY = 20;
  
    hero.attackIcon = this.scene.add.image(-29, offsetY, 'swords');
    hero.attackIcon.setScale(0.8);
    hero.attackIcon.setDepth(1);
    hero.attackIcon.setOrigin(0, 0.5);
    hero.add(hero.attackIcon);
  
    const attackColor = hero.stats.attack > hero.attack ? '#87CEFA' : '#FFFFFF';
  
    hero.attackText = this.scene.add.text(-18, offsetY, `${hero.stats.attack}`, {
      align: 'center',
      color: attackColor,
      fontFamily: 'Arial',
      fontSize: '18px',
      fontStyle: 'bold',
      stroke: '#000000', 
      strokeThickness: 1.4
    }).setDepth(2).setOrigin(0.4, 0.5);
    hero.add(hero.attackText);
  
    hero.healthIcon = this.scene.add.image(28, offsetY, 'heart');
    hero.healthIcon.setScale(0.8);
    hero.healthIcon.setDepth(1);
    hero.healthIcon.setOrigin(1, 0.5);
    hero.add(hero.healthIcon);
  
    const healthColor = hero.stats.currentHealth < hero.hp ? '#FF6666' : '#FFFFFF';
  
    hero.healthText = this.scene.add.text(17, offsetY, `${hero.stats.currentHealth}`, {
      align: 'center',
      color: healthColor,
      fontFamily: 'Arial',
      fontSize: '18px',
      fontStyle: 'bold',
      stroke: '#000000', 
      strokeThickness: 1.4
    }).setDepth(2).setOrigin(0.6, 0.5);
    hero.add(hero.healthText);
  }     

  updateTurnPanel(playerIndex, turnNumber) {
    this.turnPanelContainer = this.scene.add.container(
      this.scene.scale.width - 100,
      this.scene.scale.height / 2 - 60
    );
    
    const hexTile = playerIndex == 0 ? 'hex_tile_p1' : 'hex_tile_p2';
    
    this.turnPanelBackground = this.scene.add.image(0, 0, hexTile)
      .setOrigin(0.5)
      .setScale(1.5)
      .setInteractive({ useHandCursor: true });
    
    this.turnNumberText = this.scene.add.text(0, 0, turnNumber, {
      align: 'center',
      color: '#FFFFFF',
      fontSize: '18px',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 1.4
    }).setOrigin(0.5);
    
    this.turnLabelText = this.scene.add.text(0, -40, 'Turno Atual', {
      align: 'center',
      color: '#FFFFFF',
      fontSize: '14px',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 1.4
    }).setOrigin(0.5);
    
    this.turnPanelContainer.add(this.turnPanelBackground);
    this.turnPanelContainer.add(this.turnLabelText);
    this.turnPanelContainer.add(this.turnNumberText);
  }    

  placeHeroOnBoard(hero, position, hexColor) {
    const hex = this.scene.board.getHexByLabel(position);
  
    if (!hex || !this.scene) {
      console.error('Invalid hex or scene');
      return;
    }
  
    hex.occupied = true;
    hex.occupiedBy = hero;
    this.heroes[position] = hero;
    hero.state.position = position;
  
    hero.setPosition(hex.x, hex.y);

    if (!hero.hexBg) {
      hero.hexBg = this.scene.add.image(0, 0, hexColor)
        .setDisplaySize(hero.spriteSize || 92, hero.spriteSize || 92)
        .setAngle(30)
        .setOrigin(0.5);
      hero.addAt(hero.hexBg, 0); 
    }
  
    this.createStatsUI(hero);
  
    hero.setInteractive();
  
    hero.on('pointerdown', () => {
      this.scene.board.selectHero(hero);
    });
  
    this.scene.board.boardContainer.add(hero);
    hero.setDepth(2);
  }    

  updateGamePanel(players) {
    const tileSize = 100;
    const spriteScale = 0.5;
    const spacingY = 60;
    const startX = this.scene.scale.width - 100;
  
    players.forEach((player, playerIndex) => {
      const playerNameY = playerIndex === 0
        ? 35
        : this.scene.scale.height - 35;
  
     this.scene.add.text(this.scene.scale.width / 2 - 50, playerNameY, player.name, {
        color: '#FFD700',
        fontSize: '14px',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0, 0.5);
  
      player.heroes.forEach((hero, index) => {
        const y = playerIndex === 0
          ? this.scene.scale.height / 2 + 120 + index * spacingY
          : this.scene.scale.height / 2 - 160 - index * spacingY;
  
        const isAlive = hero.state.isAlive;
  
        const heroContainer = this.scene.add.container(startX, y);
  
        const tile = this.scene.add.image(0, 0, 'hex_tile')
          .setOrigin(0.5)
          .setScale(tileSize / 64);
  
        if (!isAlive) {
          tile.setTint(0x808080);
        }
  
        const sprite = this.scene.add.sprite(0, 0, 'heroes', hero.frameIndex)
          .setOrigin(0.5)
          .setScale(0.115);
  
        heroContainer.add([tile, sprite]);
      });
    });
  }       

  showMessage(message) {
    this.messageQueue.push(message);
    if (!this.isShowingMessage) {
      this.displayNextMessage();
    }
  }

  displayNextMessage() {
    if (this.messageQueue.length === 0) {
      this.isShowingMessage = false;
      return;
    }

    const message = this.messageQueue.shift();
    this.isShowingMessage = true;

    this.text.setText(message);
    this.container.setY(-50);
    this.container.setAlpha(0);
    this.container.setDepth(100);

    this.scene.tweens.add({
      alpha: 1,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        this.scene.time.delayedCall(1200, () => {
          this.scene.tweens.add({
            alpha: 0,
            duration: 400,
            ease: 'Power2',
            onComplete: () => {
              this.isShowingMessage = false;
              this.displayNextMessage();
            },
            targets: this.container,
            y: this.finalY - 20
          });
        });
      },
      targets: this.container,
      y: this.finalY
    });
  }
}
