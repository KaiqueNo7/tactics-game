export default class Board {
    constructor(scene, hexRadius = 40) {
        this.scene = scene;
        this.hexRadius = hexRadius;
        this.hexWidth = hexRadius * 2;
        this.hexHeight = Math.sqrt(3) * hexRadius;
        this.board = [];
        this.characters = {};
        this.highlightedHexes = [];
        this.selectedCharacter = null;
    }

    initializeBoard() {
        this.board = [];
        let xOffset = 100;
        let yOffset = 100;

        for (let col = 0; col < 5; col++) {
            let currentYOffset = yOffset;

            if (col % 2 === 1) { 
                currentYOffset -= this.hexHeight / 2;
            }

            for (let row = 0; row < 7; row++) {
                let label = String.fromCharCode(65 + col) + (row + 1); // A1, B1, C1, etc.
                let hex = { 
                    x: xOffset, 
                    y: currentYOffset, 
                    occupied: false, 
                    label: label, 
                    col, 
                    row 
                };
                this.board.push(hex);
                currentYOffset += this.hexHeight;
            }
            xOffset += this.hexWidth * 0.75;
        }
    }

    placeCharacter(character, position) {
        const hex = this.getHexByLabel(position);

        if (!hex || !this.scene) return;

        hex.occupied = true;
        this.characters[position] = character;
        character.state.position = position;

        const graphics = this.scene.add.graphics();
        graphics.fillStyle(character.color || 0x6666ff, 1);
        graphics.fillCircle(hex.x, hex.y, 20);
        character.sprite = graphics;

        graphics.setInteractive(new Phaser.Geom.Circle(hex.x, hex.y, 20), Phaser.Geom.Circle.Contains);

        graphics.on('pointerdown', () => this.selectCharacter(character));
    }

    selectCharacter(character) {
        const gameManager = this.scene.game.gameManager;
        const turnManager = gameManager.getTurnManager();
        const currentPlayer = turnManager.getCurrentPlayer();
        
        if (!currentPlayer.characters.includes(character)) {
            console.log("Esse personagem não pertence ao jogador atual.");
            return;
        }
    
        if (turnManager.currentTurn.hasMoved) {
            console.log("Você já moveu um personagem neste turno.");
            return;
        }
    
        console.log(`Personagem ${character.name} selecionado.`);
        console.log('Características do personagem:', character);
        this.selectedCharacter = character;
    
        this.clearHighlights();
    
        this.highlightedHexes = this.getMovableHexes(character, 2);
        this.highlightHexes(this.highlightedHexes);
    }
    
    getMovableHexes(character, range) {
        const currentHex = this.getHexByLabel(character.state.position);

        if (!currentHex) return [];

        return this.board.filter(hex => {
            const distance = Math.abs(hex.col - currentHex.col) + Math.abs(hex.row - currentHex.row);
            return distance <= range && !hex.occupied;
        });
    }

    highlightHexes(hexes) {
        const gameManager = this.scene.game.gameManager;
        const turnManager = gameManager.getTurnManager();
    
        hexes.forEach(hex => {
            const graphics = this.scene.add.graphics();
            graphics.lineStyle(2, 0xffff00, 1);
            graphics.strokeCircle(hex.x, hex.y, 25);
    
            graphics.setInteractive(new Phaser.Geom.Circle(hex.x, hex.y, 25), Phaser.Geom.Circle.Contains);
    
            graphics.on('pointerdown', () => {
                if (!this.selectedCharacter) return;
    
                if (turnManager.currentTurn.hasMoved) {
                    console.log("Você já moveu um personagem neste turno.");
                    return;
                }
    
                this.moveCharacter(this.selectedCharacter, hex);
            });
    
            this.highlightedHexes.push(graphics);
        });
    }

    clearHighlights() {
        this.highlightedHexes.forEach(graphics => {
            if (graphics && graphics.destroy) {
                graphics.destroy(true);
            }
        });
        this.highlightedHexes = [];
    }    

    moveCharacter(character, targetHex) {   
        const gameManager = this.scene.game.gameManager;
        const turnManager = gameManager.getTurnManager();

        if (!character || !targetHex) return;
    
        console.log(`Movendo ${character.name} para ${targetHex.label}`);
    
        const currentHex = this.getHexByLabel(character.state.position);
        if (currentHex) currentHex.occupied = false;
        targetHex.occupied = true;
    
        character.state.position = targetHex.label;

        character.sprite.clear();
        character.sprite.fillStyle(character.color || 0x6666ff, 1);
        character.sprite.fillCircle(targetHex.x, targetHex.y, 20);

        turnManager.markCharacterAsMoved(character);
    
        this.clearHighlights();
        this.selectedCharacter = null;
    }
    
    getHexByLabel(label) {
        return this.board.find(hex => hex.label === label);
    }
}
