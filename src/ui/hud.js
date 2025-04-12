export default class UIManager {
    constructor(scene) {
        this.scene = scene;

        this.turnPanel = this.scene.add.text(600, 150, '', { 
            font: '18px Arial', 
            fill: '#ffffff',
            padding: { x: 10, y: 10 },
            wordWrap: { width: 300 }
        }).setScrollFactor(0);

        this.gamePanel = this.scene.add.text(600, 300, '', { 
            font: '16px Arial', 
            fill: '#ffffff',
            padding: { x: 10, y: 10 }
        }).setScrollFactor(0);

        this.characterPanel = this.scene.add.text(385, 300, '', { 
            font: '16px Arial', 
            fill: '#ffffff',
            padding: { x: 10, y: 10 }
        }).setScrollFactor(0);

        this.victory
    }

    showFloatingAmount(hero, amount, x = 30, color = '#ff0000') {
        if (!hero || !hero.add) return;
    
        const damageText = this.scene.add.text(x, 0, `-${amount}`, {
            font: '20px Arial',
            fill: color,
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(10);
    
        hero.add(damageText);
    
        this.scene.tweens.add({
            targets: damageText,
            y: damageText.y - 20,
            alpha: 0,
            duration: 3000,
            ease: 'Power1',
            onComplete: () => {
                damageText.destroy();
            }
        });
    } 
    
    createEndTurnButton(turnManager) {
        const buttonText = this.scene.add.text(this.scene.cameras.main.width - 150, 20, 'Próximo Turno', {
            fontFamily: 'Arial',
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#ccc',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();
    
        buttonText.on('pointerover', () => {
            buttonText.setStyle({ fill: '#ffcc00' });
        });
    
        buttonText.on('pointerout', () => {
            buttonText.setStyle({ fill: '#ffffff' });
        });
    
        buttonText.on('pointerdown', () => {
            turnManager.nextTurn();
        });
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
        const text = `Turno Atual: ${roundNumber}\n` + 
                     `Jogador: ${currentPlayer.name}`;
        
        this.setTextWithBackground(this.turnPanel, text);
        this.turnPanel.setStyle({ backgroundColor: '#333333' });
    }

    updategamePanel(players) {
        let panelText = '';
        
        players.forEach(player => {
            panelText += `\nJogador: ${player.name}\n`;
            
            player.heros.forEach(character => {
                const isAlive = character.state.isAlive;
                const statusIcon = isAlive ? '🟢' : '❌';
                panelText += `${statusIcon} ${character.name}\n`;
            });
        });
        
        this.setTextWithBackground(this.gamePanel, panelText);
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
    
        const playAgainBtn = this.scene.add.text(400, 300, '🔁 Jogar novamente', {
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
            this.scene.scene.start('CharacterSelectionScene');
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