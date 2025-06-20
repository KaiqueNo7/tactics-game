import { i18n } from "../../i18n.js";
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

  showVictoryUI(iWon) {
    const resultText = iWon ? i18n.victory : i18n.defeat;
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
  
    const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);
    overlay.setDepth(99);
  
    const victoryText = this.scene.add.text(width / 2, height * 0.15, resultText, {
      fill: '#ffffff',
      fontSize: Math.round(width * 0.05) + 'px',
      fontFamily: 'Fredoka',
      stroke: '#000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(100);
  
    const playAgainBtn = this.scene.add.text(width / 2, height * 0.80, i18n.continue, {
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