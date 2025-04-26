import { SOCKET_EVENTS } from "../../api/events.js";
import socket from "../services/game-api-service.js";

export default class UIManager {
  constructor(scene, roomId) {
    this.scene = scene;
    this.roomId = roomId;
    this.socket = socket;

    this.victory;
    this.buttonEnabled = false;
  }

  showFloatingAmount(hero, amount, x = 0, color = '#FF6666') {
    if (!hero || !hero.add) return;
    
    const amountText = this.scene.add.text(x, 0, `${amount}`, {
      align: 'center',
      fill: color,
      fontSize: '40px',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 1.4
    }).setOrigin(0.5).setDepth(10);
    
    hero.add(amountText);
    
    this.scene.tweens.add({
      alpha: 0,
      duration: 3000,
      ease: 'Power1',
      onComplete: () => {
        amountText.destroy();
      },
      targets: amountText,
      y: amountText.y - 20
    });
  } 

  playDamageAnimation(target) {
    const sprite = target.sprite || target;
    
    this.scene.tweens.add({
      alpha: 0.3,
      duration: 100,
      onComplete: () => {
        sprite.alpha = 1;
      },
      repeat: 3,
      targets: sprite,
      yoyo: true
    });
    
    // Efeito de cor vermelha
    // sprite.setTint(0xff0000);
    // this.scene.time.delayedCall(300, () => {
    //     sprite.clearTint();
    // });
  }
    
  createEndTurnButton() {
    this.endTurnButtonContainer = this.scene.add.container(
      this.scene.scale.width - 145,
      this.scene.scale.height / 2
    );

    this.endTurnBackground = this.scene.add.image(0, 0, 'next_turn')
      .setOrigin(0.5)
      .setScale(1.5)
      .setInteractive({ useHandCursor: true });

    this.endTurnBackground.on('pointerdown', () => {
      if (!this.buttonEnabled) return;
      this.socket.emit(SOCKET_EVENTS.NEXT_TURN_REQUEST, { roomId: this.roomId });
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

  createStatsUI(hero) {
    if (!hero.sprite) return;
    
    const offsetY = 20;
    
    hero.attackIcon = this.scene.add.image(-29, offsetY, 'swords');
    hero.attackIcon.setScale(0.8);
    hero.attackIcon.setDepth(1);
    hero.attackIcon.setOrigin(0, 0.5);
    hero.add(hero.attackIcon);
    
    hero.attackText = this.scene.add.text(-18, offsetY, `${hero.stats.attack}`, {
      align: 'center',
      color: '#FFFFFF',
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
    
    hero.healthText = this.scene.add.text(17, offsetY, `${hero.stats.currentHealth}`, {
      align: 'center',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      fontSize: '18px',
      fontStyle: 'bold',
      stroke: '#000000', 
      strokeThickness: 1.4
    }).setDepth(2).setOrigin(0.6, 0.5);
    hero.add(hero.healthText);
  }       

  setTextWithBackground(textObject, content) {
    textObject.setText(content);
    if (content && content.trim() !== '') {
      textObject.setStyle({ backgroundColor: '#444444' });
    } else {
      textObject.setStyle({ backgroundColor: null });
    }

    this.characterPanel.setVisible(true);
  }

  updateTurnPanel(currentPlayer, roundNumber) {
    this.turnPanelContainer = this.scene.add.container(
      this.scene.scale.width - 145,
      this.scene.scale.height / 2 - 60
    );
    
    const hexTile = currentPlayer.number == 1 ? 'hex_tile_p1' : 'hex_tile_p2';
    
    this.turnPanelBackground = this.scene.add.image(0, 0, hexTile)
      .setOrigin(0.5)
      .setScale(1.5)
      .setInteractive({ useHandCursor: true });
    
    this.roundNumberText = this.scene.add.text(0, 0, roundNumber, {
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
    this.turnPanelContainer.add(this.roundNumberText);
  }    

  updateGamePanel(players) {
    const tileSize = 90;
    const spriteScale = 0.4;
    const spacingY = 50;
    const startX = this.scene.scale.width - 145;
  
    players.forEach((player, playerIndex) => {
      const playerNameY = playerIndex === 0
        ? this.scene.scale.height / 2 + 170
        : this.scene.scale.height / 2 - 210;
  
     this.scene.add.text(startX + 30, playerNameY, player.name, {
        color: '#FFD700',
        fontSize: '14px',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0, 0.5);
  
      player.heros.forEach((character, index) => {
        const y = playerIndex === 0
          ? this.scene.scale.height / 2 + 120 + index * spacingY
          : this.scene.scale.height / 2 - 160 - index * spacingY;
  
        const isAlive = character.state.isAlive;
  
        const heroContainer = this.scene.add.container(startX, y);
  
        const tile = this.scene.add.image(0, 0, 'hex_tile')
          .setOrigin(0.5)
          .setScale(tileSize / 64);
  
        if (!isAlive) {
          tile.setTint(0x808080);
        }
  
        const sprite = this.scene.add.sprite(0, 0, 'heroes', character.frameIndex)
          .setOrigin(0.5)
          .setScale(spriteScale);
  
        heroContainer.add([tile, sprite]);
      });
    });
  }       

  showDetailedCharacterInfo(character) {
    const text = `Personagem: ${character.name}\n` +
                     `Vida: ${character.stats.currentHealth}\n` +
                     `Ataque: ${character.stats.attack}\n` +
                     `Passiva: ${character.abilities.passive}\n` +
                     `Habilidades: ${character.abilities.specialSkills}`;
        
    this.setTextWithBackground(this.characterPanel, text);
  }

  hideDetailedCharacterInfo() {
    this.setTextWithBackground(this.characterPanel, '');
    this.characterPanel.setVisible(false);
  }

  showVictoryUI(winner) {
    const overlay = this.scene.add.rectangle(400, 300, 800, 600, 0x000000, 0.6);
    overlay.setDepth(99);
    
    const victoryText = this.scene.add.text(400, 200, `${winner.name} venceu!`, {
      fill: '#ffffff',
      fontSize: '40px',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4,
    }).setOrigin(0.5);
    victoryText.setDepth(100);
    
    const playAgainBtn = this.scene.add.text(400, 300, 'Jogar novamente', {
      backgroundColor: '#222',
      fill: '#00ff00',
      fontSize: '28px',
      padding: { x: 15, y: 10 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    playAgainBtn.setDepth(100);
    
    playAgainBtn.on('pointerover', () => {
      playAgainBtn.setStyle({ backgroundColor: '#00aa00', fill: '#ffffff' });
    });
    
    playAgainBtn.on('pointerout', () => {
      playAgainBtn.setStyle({ backgroundColor: '#222', fill: '#00ff00' });
    });
    
    playAgainBtn.on('pointerdown', () => {
      this.scene.scene.start('MatchOnlineScene');
    });
    
    this.scene.tweens.add({
      alpha: { from: 0, to: 1 },
      delay: 100,
      duration: 500,
      ease: 'Power1',
      targets: [victoryText, playAgainBtn],
      y: '+=20',
    });
  }    
}