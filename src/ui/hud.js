// src/ui/hud.js
export class DebugHUD {
    constructor(canvas, gameController) {
        this.canvas = canvas;
        this.gameController = gameController;
        this.ctx = canvas.getContext('2d');
    }

    drawDebugInfo() {
        const turnManager = this.gameController.turnManager;
        const currentCharacter = turnManager.getCurrentCharacter();
        
        this.ctx.fillStyle = 'black';
        this.ctx.font = '16px Arial';
        
        // Informações de depuração
        const debugInfo = [
            `Turno Atual: ${turnManager.currentPlayerIndex + 1}`,
            `Personagem: ${currentCharacter.name}`,
            `Saúde: ${currentCharacter.health}/${currentCharacter.maxHealth}`,
            `Posição: ${currentCharacter.position}`,
            `Ataque: ${currentCharacter.attack}`,
            `Defesa: ${currentCharacter.defense}`
        ];

        debugInfo.forEach((line, index) => {
            this.ctx.fillText(line, 10, 20 * (index + 1));
        });
    }

    update() {
        // Limpa a área de debug anterior
        this.ctx.clearRect(0, 0, 250, 200);
        this.drawDebugInfo();
    }
}