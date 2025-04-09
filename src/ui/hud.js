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

    createStatsUI(hero) {
        if (!hero.sprite) return;
    
        const offsetY = 20;
    
        hero.attackIcon = this.scene.add.image(-30, offsetY, 'swords');
        hero.attackIcon.setScale(0.2);
        hero.attackIcon.setDepth(1);
        hero.attackIcon.setOrigin(0, 0.5);
        hero.add(hero.attackIcon);
    
        // Texto de ataque
        hero.attackText = this.scene.add.text(-18, offsetY, `${hero.stats.attack}`, {
            fontFamily: 'Verdana',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: {
                offsetX: 1,
                offsetY: 1,
                color: '#000000',
                blur: 2,
                fill: true
            },
            align: 'center'
        }).setDepth(2).setOrigin(0.4, 0.5);
        hero.add(hero.attackText);
    
        // Ícone do coração (vida)
        hero.healthIcon = this.scene.add.image(30, offsetY, 'heart');
        hero.healthIcon.setScale(1.9);
        hero.healthIcon.setDepth(1);
        hero.healthIcon.setOrigin(1, 0.5);
        hero.add(hero.healthIcon);
    
        // Texto de vida
        hero.healthText = this.scene.add.text(17, offsetY, `${hero.stats.currentHealth}`, {
            fontFamily: 'Verdana',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: {
                offsetX: 1,
                offsetY: 1,
                color: '#000000',
                blur: 2,
                fill: true
            },
            align: 'center'
        }).setDepth(2).setOrigin(0.6, 0.5);
        hero.add(hero.healthText);
    }       

    // Métodos auxiliares para configurar o estilo do texto com ou sem fundo
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
            this.scene.scene.restart(); // Aqui sim, agora reinicia a cena atual corretamente
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