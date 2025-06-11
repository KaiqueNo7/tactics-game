import { SOCKET_EVENTS } from "../../api/events.js";
import { i18n } from "../../i18n.js";
import createHeroDetailUI from "./hero-detail-ui.js";

export default class GameUI extends Phaser.GameObjects.Container {
  constructor(scene, socket, roomId, user) {
    super(scene)

    this.scene = scene;
    this.socket = socket;
    this.roomId = roomId;
    this.user = user;

    this.messageQueue = [];
    this.isShowingMessage = false;
    this.heroes = {};

    this.buttonEnabled = false;

    this.container = this.scene.add.container(this.scene.scale.width / 2, -50);
        
    this.background = this.scene.add.image(0, 0, 'ui_box_brown')
    .setOrigin(0.5)
    .setScale(1.5, 1);

    this.text = this.scene.add.text(0, 0, '', {
      color: '#000',
      fontSize: '16px',
      fontFamily: 'Fredoka'
    }).setOrigin(0.5);

    this.container.add([this.background, this.text]);

    this.finalY = 150;
    this.heroDetailUI = createHeroDetailUI(this.scene);
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
      this.scene.scale.width - 40,
      this.scene.scale.height - 30
    );
  
    this.endTurnBackground = this.scene.add.image(0, 0, 'next_turn')
      .setOrigin(0.5)
      .setScale(1.5)
      .setInteractive({ useHandCursor: true });
  
    this.endTurnBackground.on('pointerdown', () => {
      if (!this.buttonEnabled) return;
      this.socket.emit(SOCKET_EVENTS.NEXT_TURN_REQUEST, { 
        roomId: this.roomId, 
        playerId: this.user.id
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
  
    this.endTurnButtonContainer.add(this.endTurnBackground);
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
      fontFamily: 'Fredoka',
      fontSize: '18px',
      fontStyle: 'bold',
      stroke: '#000000', 
      strokeThickness: 1.5
    }).setDepth(2).setOrigin(0.4, 0.5);
    hero.add(hero.attackText);
  
    hero.healthIcon = this.scene.add.image(28, offsetY, 'heart');
    hero.healthIcon.setScale(0.8);
    hero.healthIcon.setDepth(1);
    hero.healthIcon.setOrigin(1, 0.5);
    hero.add(hero.healthIcon);
  
    const healthColor = hero.stats.currentHealth < hero.hp ? '#FF6666' : '#FFFFFF';

    if (hero.ability) {
      // Decide a textura do ícone com base na habilidade
      let texture = null;
      switch (hero.ability) {
        case 'Sprint':
          texture = 'sprint';
          break;
        case 'Ranged':
          texture = 'ranged';
          break;
        case 'Taunt':
          texture = 'taunt';
          break;
      }

      if (texture) {
        hero.abilitySymbol = this.scene.add.image(7, offsetY - 10, texture);
        hero.abilitySymbol.setScale(0.280);
        hero.abilitySymbol.setDepth(3);
        hero.abilitySymbol.setOrigin(1, 0.5);
        hero.add(hero.abilitySymbol);
      }
    }
  
    hero.healthText = this.scene.add.text(17, offsetY, `${hero.stats.currentHealth}`, {
      align: 'center',
      color: healthColor,
      fontFamily: 'Fredoka',
      fontSize: '18px',
      fontStyle: 'bold',
      stroke: '#000000', 
      strokeThickness: 1.5
    }).setDepth(2).setOrigin(0.6, 0.5);
    hero.add(hero.healthText);
  }     

  updateTurnPanel(playerIndex, turnNumber) {
    this.turnPanelContainer = this.scene.add.container(
      this.scene.scale.width / 2,
      60
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
      fontFamily: 'Fredoka',
      strokeThickness: 1.5
    }).setOrigin(0.5);
    
    this.turnLabelText = this.scene.add.text(0, - 40, i18n.turn, {
      align: 'center',
      color: '#FFFFFF',
      fontSize: '12px',
      fontStyle: 'bold',
      stroke: '#000000',
      fontFamily: 'Fredoka',
      strokeThickness: 1.5
    }).setOrigin(0.5);

    if(!this.turnTimerText){
      this.turnTimerText = this.scene.add.text(
        0, 
        40,
        '',
        {
          align: 'center',
          color: '#FFFFFF',
          fontSize: '18px',
          fontFamily: 'Fredoka',
          stroke: '#000000',
          strokeThickness: 1.5
        }
      ).setOrigin(0.5);
    }
    
    this.turnPanelContainer.add([
      this.turnPanelBackground, 
      this.turnLabelText, 
      this.turnNumberText,
      this.turnTimerText
    ]);
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
        .setDisplaySize(hero.spriteSize || 72, hero.spriteSize || 72)
        .setAngle(30)
        .setOrigin(0.5)
        .setDepth(0);
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

  showHeroDetails(hero) {
    this.heroDetailOverlay = this.scene.add.rectangle(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      this.scene.scale.width,
      this.scene.scale.height,
      0x000000,
      0.6
    ).setDepth(100).setInteractive();
    
    this.heroDetailOverlay.setDepth(98);
    this.heroDetailOverlay.setInteractive();
    this.heroDetailUI.show(hero);

    this.heroDetailOverlay.on('pointerdown', () => {
      this.hideHeroDetails();
    });
  }

  hideHeroDetails() {
    if (this.heroDetailOverlay) {
      this.heroDetailOverlay.destroy();
      this.heroDetailOverlay = null;
    }
  
    if (this.heroDetailUI) {
      this.heroDetailUI.hide();
    }
  }
  
  updateGamePanel(players) {
    const tileSize = 75;
    const spacingY = 40;
    const startY = 50;
  
    players.forEach((player, playerIndex) => {
      const playerNameY = 20;
      const isLeft = playerIndex === 0;
      const playerNameX = isLeft ? 10 : this.scene.scale.width - 10;
      
      this.scene.add.text(playerNameX, playerNameY, player.name, {
        color: '#FFD700',
        fontSize: '12px',
        fontFamily: 'Fredoka',
        stroke: '#000000',
        strokeThickness: 1.5
      }).setOrigin(isLeft ? 0 : 1, 0.5);
      
      player.heroes.forEach((hero, index) => {
        let frame = hero.frameIndex || hero.frame; 
        const x = playerIndex !== 0
          ? this.scene.scale.width / 2 + 75 + index * spacingY
          : this.scene.scale.width / 2 - 70 - index * spacingY;
  
        const isAlive = hero.state.isAlive;
  
        const heroContainer = this.scene.add.container(x, startY + 10);
  
        const tile = this.scene.add.image(0, 0, 'hex_tile')
          .setOrigin(0.5)
          .setScale(tileSize / 64);
  
        if (!isAlive) {
          tile.setTint(0x808080);
        }
  
        const sprite = this.scene.add.sprite(0, 0, 'heroes', frame)
          .setOrigin(0.5)
          .setScale(0.100);
  
        heroContainer.add([tile, sprite]);
        heroContainer.setSize(tileSize, tileSize).setInteractive();

        heroContainer.on('pointerdown', () => {
          this.showHeroDetails(hero);
        });
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
            y: this.finalY + 20,
            targets: this.container,
          });
        });
      },
      targets: this.container,
      y: this.finalY
    });
  }
}
