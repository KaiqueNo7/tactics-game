export default class UIManager {
  constructor(scene) {
    this.scene = scene;

    this.victory
  }

  showFloatingAmount(hero, amount, x = 0, color = '#FF6666') {
    if (!hero || !hero.add) return;
    
    const amountText = this.scene.add.text(x, 0, `${amount}`, {
      fontSize: '40px',
      fill: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 1.4,
      align: 'center'
    }).setOrigin(0.5).setDepth(10);
    
    hero.add(amountText);
    
    this.scene.tweens.add({
      targets: amountText,
      y: amountText.y - 20,
      alpha: 0,
      duration: 3000,
      ease: 'Power1',
      onComplete: () => {
        amountText.destroy();
      }
    });
  } 

  playDamageAnimation(target) {
    const sprite = target.sprite || target; // Ajuste se necessário
    
    // Tween de piscar
    this.scene.tweens.add({
      targets: sprite,
      alpha: 0.3,
      yoyo: true,
      repeat: 3,
      duration: 100,
      onComplete: () => {
        sprite.alpha = 1;
      }
    });
    
    // Efeito de cor vermelha
    // sprite.setTint(0xff0000);
    // this.scene.time.delayedCall(300, () => {
    //     sprite.clearTint();
    // });
  }
    
  createEndTurnButton(turnManager) {
    this.endTurnButtonContainer = this.scene.add.container(
      this.scene.scale.width - 145,
      this.scene.scale.height / 2
    );
    
    this.endTurnBackground = this.scene.add.image(0, 0, 'next_turn')
      .setOrigin(0.5)
      .setScale(1.5)
      .setInteractive({ useHandCursor: true });
    
    this.endTurnBackground.on('pointerdown', () => {
      turnManager.nextTurn();
    });
    
    this.endTurnBackground.on('pointerover', () => {
      this.endTurnBackground.setTint(0xaaaaaa);
    });
    
    this.endTurnBackground.on('pointerout', () => {
      this.endTurnBackground.clearTint();
    });
    
    this.endTurnButtonContainer.add(this.endTurnBackground);
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
      fontFamily: 'Arial',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 1.4, 
      align: 'center'
    }).setDepth(2).setOrigin(0.4, 0.5);
    hero.add(hero.attackText);
    
    hero.healthIcon = this.scene.add.image(28, offsetY, 'heart');
    hero.healthIcon.setScale(0.8);
    hero.healthIcon.setDepth(1);
    hero.healthIcon.setOrigin(1, 0.5);
    hero.add(hero.healthIcon);
    
    hero.healthText = this.scene.add.text(17, offsetY, `${hero.stats.currentHealth}`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 1.4, 
      align: 'center'
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
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 1.4,
      align: 'center'
    }).setOrigin(0.5);
    
    this.turnLabelText = this.scene.add.text(0, -40, 'Turno Atual', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 1.4,
      align: 'center'
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
      player.heros.forEach((character, index) => {
        const y = playerIndex === 0
          ? this.scene.scale.height / 2 + 120 + index * spacingY
          : this.scene.scale.height / 2 - 160 - index * spacingY;
    
        const isAlive = character.state.isAlive;
    
        // Cria container para agrupar tile + herói
        const heroContainer = this.scene.add.container(startX, y);
    
        // Tile de fundo
        const tile = this.scene.add.image(0, 0, 'hex_tile')
          .setOrigin(0.5)
          .setScale(tileSize / 64);
    
        if (!isAlive) {
          tile.setTint(0x808080);
        }
    
        // Sprite do herói
        const sprite = this.scene.add.sprite(0, 0, 'heroes', character.frameIndex)
          .setOrigin(0.5)
          .setScale(spriteScale);
    
        // Adiciona ambos ao container
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
      fontSize: '40px',
      fill: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4,
    }).setOrigin(0.5);
    victoryText.setDepth(100);
    
    const playAgainBtn = this.scene.add.text(400, 300, 'Jogar novamente', {
      fontSize: '28px',
      fill: '#00ff00',
      backgroundColor: '#222',
      padding: { x: 15, y: 10 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    playAgainBtn.setDepth(100);
    
    playAgainBtn.on('pointerover', () => {
      playAgainBtn.setStyle({ fill: '#ffffff', backgroundColor: '#00aa00' });
    });
    
    playAgainBtn.on('pointerout', () => {
      playAgainBtn.setStyle({ fill: '#00ff00', backgroundColor: '#222' });
    });
    
    playAgainBtn.on('pointerdown', () => {
      this.scene.scene.start('HeroSelectionScene');
    });
    
    this.scene.tweens.add({
      targets: [victoryText, playAgainBtn],
      alpha: { from: 0, to: 1 },
      y: '+=20',
      ease: 'Power1',
      duration: 500,
      delay: 100,
    });
  }    
}