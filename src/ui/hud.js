export default class UIManager {
    constructor(scene) {
        this.scene = scene;

        this.turnPanel = this.scene.add.text(600, 150, '', { 
            font: '18px Arial', 
            fill: '#ffffff', 
            backgroundColor: '#333333',
            padding: { x: 10, y: 10 },
            wordWrap: { width: 300 }
        }).setScrollFactor(0);

        this.characterPanel = this.scene.add.text(600, 300, '', { 
            font: '16px Arial', 
            fill: '#ffffff', 
            backgroundColor: '#444444',
            padding: { x: 10, y: 10 }
        }).setScrollFactor(0);
    }

    updateTurnPanel(currentPlayer, roundNumber) {
        this.turnPanel.setText(
            `Turno Atual: ${roundNumber}\n` +
            `Jogador: ${currentPlayer.name}`
        );
    }

    updateCharacterPanel(players) {
        let panelText = '';
        
        players.forEach(player => {
            panelText += `\nJogador: ${player.name}\n`;

            player.characters.forEach(character => {
                const isAlive = character.state.isAlive;
                const statusIcon = isAlive ? '🟢' : '❌';
                panelText += `${statusIcon} ${character.name}\n`;
            });
        });

        this.characterPanel.setText(panelText);
    }
}
