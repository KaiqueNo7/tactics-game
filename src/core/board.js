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

        // Adiciona interatividade ao personagem
        graphics.setInteractive(new Phaser.Geom.Circle(hex.x, hex.y, 20), Phaser.Geom.Circle.Contains);

        graphics.on('pointerdown', () => this.selectCharacter(character));
        
        this.scene.add.text(hex.x, hex.y - 30, character.name, {
            fontSize: '12px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }

    selectCharacter(character) {
        console.log(`Personagem ${character.name} selecionado.`);
        this.selectedCharacter = character;

        // Limpar os destaques anteriores
        this.clearHighlights();

        // Destacar hexágonos válidos para movimentação
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
        hexes.forEach(hex => {
            const graphics = this.scene.add.graphics();
            graphics.lineStyle(2, 0xffff00, 1);
            graphics.strokeCircle(hex.x, hex.y, 25);
            
            // Permitir movimento quando o hexágono destacado for clicado
            graphics.setInteractive(new Phaser.Geom.Circle(hex.x, hex.y, 25), Phaser.Geom.Circle.Contains);

            graphics.on('pointerdown', () => this.moveCharacter(this.selectedCharacter, hex));
            
            this.highlightedHexes.push(graphics);
        });
    }

    clearHighlights() {
        this.highlightedHexes.forEach(graphics => graphics.destroy());
        this.highlightedHexes = [];
    }

    moveCharacter(character, targetHex) {
        if (!character || !targetHex) return;

        console.log(`Movendo ${character.name} para ${targetHex.label}`);

        // Atualizar ocupação dos hexágonos
        const currentHex = this.getHexByLabel(character.state.position);
        if (currentHex) currentHex.occupied = false;
        targetHex.occupied = true;

        // Mover personagem para o novo hexágono
        character.state.position = targetHex.label;
        character.sprite.x = targetHex.x;
        character.sprite.y = targetHex.y;

        this.clearHighlights();
        this.selectedCharacter = null;
    }

    getHexByLabel(label) {
        return this.board.find(hex => hex.label === label);
    }
}
