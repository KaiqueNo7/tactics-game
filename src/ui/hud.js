import { getSocket } from "../services/game-api-service.js";

export default class UIManager {
  constructor(scene, roomId) {
    this.scene = scene;
    this.roomId = roomId;
    this.socket = getSocket();

    this.victory;
    this.buttonEnabled = false;
  }

  heroTalk(hero, talk) {
    if (!hero || !talk) return;
  
    const matrix = hero.getWorldTransformMatrix();
    const worldX = matrix.tx;
    const worldY = matrix.ty;
  
    const talkText = this.scene.add.text(worldX, worldY - 30, talk, {
      align: 'center',
      fill: '#ffbe0b',
      fontSize: '12px',
      fontFamily: 'Fredoka',
      stroke: '#000',
      strokeThickness: 1
    }).setOrigin(0.5).setDepth(10);
  
    this.scene.tweens.add({
      duration: 2000,
      ease: 'Power1',
      targets: talkText,
      y: talkText.y,
      onComplete: () => {
        talkText.destroy();
      }
    });
  }
  

  showFloatingAmount(hero, amount, x = 0, color = '#FF6666') {
    if (!hero || !hero.add) return;
    
    const amountText = this.scene.add.text(x, 0, `${amount}`, {
      align: 'center',
      fill: color,
      fontSize: '40px',
      fontFamily: 'Fredoka',
      stroke: '#000000',
      strokeThickness: 1.5
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

  spriteAnimation(target, color = 0x00ff00) {
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


    sprite.setTint(color);
    this.scene.time.delayedCall(300, () => {
        sprite.clearTint();
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

    if(target.state.isAlive){
      sprite.setTint(0xff0000);
      this.scene.time.delayedCall(300, () => {
          sprite.clearTint();
      });
    }
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

  showVictoryUI(iWon, winner) {
    const resultText = iWon ? 'Vitória' : 'Derrota';
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
  
    const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);
    overlay.setDepth(99);
  
    const victoryText = this.scene.add.text(width / 2, height * 0.20, resultText, {
      fill: '#ffffff',
      fontSize: Math.round(width * 0.05) + 'px',
      fontFamily: 'Fredoka',
      stroke: '#000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(100);
  
    const winnerNameText = this.scene.add.text(width / 2, height * 0.30, `Vencedor: ${winner.name}`, {
      fill: '#ffffff',
      fontSize: Math.round(width * 0.035) + 'px',
      fontFamily: 'Fredoka',
      stroke: '#000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(100);

    const heroSprites = [];
  
    const heroCount = winner.heroes.length;
    const spacing = 70;
    const totalWidth = (heroCount - 1) * spacing;
    const startX = width / 2 - totalWidth / 2;
    const spriteY = height * 0.45;
  
    winner.heroes.forEach((hero, index) => {
      const x = startX + index * spacing;
      const sprite = this.scene.add.sprite(x, spriteY, 'heroes', hero.frameIndex);
      sprite.setOrigin(0.5).setScale(0.5).setDepth(100);
      heroSprites.push(sprite);
    });
  
    const playAgainBtn = this.scene.add.text(width / 2, height * 0.75, 'Jogar novamente', {
      backgroundColor: '#222',
      fill: '#00ff00',
      fontSize: Math.round(width * 0.035) + 'px',
      padding: { x: 15, y: 10 },
      fontFamily: 'Fredoka'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(100);
  
    playAgainBtn.on('pointerover', () => {
      playAgainBtn.setStyle({ backgroundColor: '#00aa00', fill: '#ffffff' });
    });
  
    playAgainBtn.on('pointerout', () => {
      playAgainBtn.setStyle({ backgroundColor: '#222', fill: '#00ff00' });
    });
  
    playAgainBtn.on('pointerdown', () => {
      this.scene.scene.stop('GameScene');
      this.scene.scene.start('MatchOnlineScene');
    });
  
    // Animação de entrada
    this.scene.tweens.add({
      alpha: { from: 0, to: 1 },
      delay: 100,
      duration: 500,
      ease: 'Power1',
      targets: [victoryText, winnerNameText, ...heroSprites, playAgainBtn],
      y: '+=20',
    });
  }  
}