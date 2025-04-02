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

        this.characterPanel = this.scene.add.text(400, 300, '', { 
            font: '16px Arial', 
            fill: '#ffffff',
            padding: { x: 10, y: 10 }
        }).setScrollFactor(0);
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
        this.turnPanel.setStyle({ backgroundColor: '#333333' }); // Cor específica para o painel de turno
    }

    updategamePanel(players) {
        let panelText = '';
        
        players.forEach(player => {
            panelText += `\nJogador: ${player.name}\n`;
            
            player.characters.forEach(character => {
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
}