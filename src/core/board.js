export default class Board extends Phaser.GameObjects.GameObject {
    constructor(scene, hexRadius = 40) {
        super(scene, 'Board');
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
            let rows = 6;

            if (col % 2 === 1) { 
                currentYOffset -= this.hexHeight / 2;
                rows = 7;
            }

            for (let row = 0; row < rows; row++) {
                let label = String.fromCharCode(65 + col) + (row + 1);
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

    placeCharacter(character, position, playerColor) {
        const hex = this.getHexByLabel(position);

        if (!hex || !this.scene) {
            console.log('Hex ou cena não encontrados.');
            return;
        }

        hex.occupied = true;
        this.characters[position] = character;
        character.state.position = position;

        const graphics = this.scene.add.graphics();
        graphics.fillStyle(character.color || 0x6666ff, 1);
        graphics.fillCircle(hex.x, hex.y, 20);
        character.sprite = graphics;

        graphics.setInteractive(new Phaser.Geom.Circle(hex.x, hex.y, 20), Phaser.Geom.Circle.Contains);

        graphics.on('pointerdown', () => this.selectCharacter(character));

        let hoverTimer;

        graphics.on('pointerover', () => {
            hoverTimer = this.scene.time.delayedCall(1000, () => {
                this.scene.uiManager.showDetailedCharacterInfo(character);
            });
        });

        graphics.on('pointerout', () => {
            if (hoverTimer) {
                hoverTimer.remove();
                hoverTimer = null;
            }

            this.scene.uiManager.hideDetailedCharacterInfo();
        });

        hex.playerColor = playerColor;
        this.drawHexBorder(hex, playerColor);

        const { currentHealth, attack } = character.stats;

        const statsText = this.scene.add.text(hex.x, hex.y + 25, `❤ ${currentHealth}  ⚔ ${attack}`, {
            font: '12px Arial',
            fill: '#ffffff',
            align: 'center',
            backgroundColor: '#000000',
            padding: { x: 2, y: 2 }
        });

        statsText.setOrigin(0.5);

        graphics.setDepth(5);
        statsText.setDepth(10); 

        character.statsText = statsText;
    }

    drawHexBorder(hex, color) {
        if (hex.borderGraphics) {
            hex.borderGraphics.clear();
            hex.borderGraphics.destroy();
        }
    
        // Criar um novo gráfico para a borda
        const borderGraphics = this.scene.add.graphics();
        borderGraphics.lineStyle(3, color, 1);
        borderGraphics.strokeCircle(hex.x, hex.y, 30);
        
        hex.borderGraphics = borderGraphics;
    }
    
    selectCharacter(character) {
        const gameManager = this.scene.game.gameManager;
        const turnManager = gameManager.getTurnManager();
        const currentPlayer = turnManager.getCurrentPlayer();

        if (this.selectedCharacter === character) {
            this.selectedCharacter = null;
            this.clearHighlights();
            this.scene.uiManager.updategamePanel(null);
            return;
        }
    
        if (!currentPlayer.characters.includes(character)) {
            this.scene.warningTextPlugin.showTemporaryMessage('Você só pode mover personagens do seu time.');
            return;
        }

        if (turnManager.currentTurn.movedAll) {    
            this.scene.warningTextPlugin.showTemporaryMessage('Você já moveu todos os personagem neste turno.');
            this.clearHighlights();
            return;
        }

        this.selectedCharacter = character;
    
        this.clearHighlights();
    
        this.highlightedHexes = this.getMovableHexes(character, 2);
        this.highlightHexes(this.highlightedHexes);
    }    
    
    isPathClear(startHex, targetHex) {
        const colDiff = targetHex.col - startHex.col;
        const rowDiff = targetHex.row - startHex.row;
        const steps = Math.max(Math.abs(colDiff), Math.abs(rowDiff));

        if (steps <= 1) return true;

        const colStep = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);
        const rowStep = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);

        let currentCol = startHex.col;
        let currentRow = startHex.row;

        for (let i = 1; i < steps; i++) {
            currentCol += colStep;
            currentRow += rowStep;

            if (startHex.col % 2 === 1 && colStep !== 0) {
                currentRow = startHex.row + Math.floor(rowStep * i + 0.5);
            } else if (startHex.col % 2 === 0 && colStep !== 0) {
                currentRow = startHex.row + Math.ceil(rowStep * i - 0.5);
            }

            const intermediateHex = this.board.find(
                hex => hex.col === currentCol && hex.row === currentRow
            );

            if (intermediateHex && intermediateHex.occupied) {
                return false;
            }
        }
        return true;
    }

    getMovableHexes(character, range) {
        const currentHex = this.getHexByLabel(character.state.position);

        if (!currentHex) {
            console.log('Hex não encontrado.');
            return [];
        }

        return this.board.filter(hex => {
            if (hex.occupied || hex.label === currentHex.label) return false;

            const colDiff = Math.abs(hex.col - currentHex.col);
            const rowDiff = Math.abs(hex.row - currentHex.row);
            
            let distance;
            if (colDiff === 0) {
                distance = rowDiff;
            } else if (colDiff === 1) {
                if (currentHex.col % 2 === 0) {
                    distance = (hex.row >= currentHex.row) ? rowDiff : rowDiff + 1;
                } else {
                    distance = (hex.row <= currentHex.row) ? rowDiff : rowDiff + 1;
                }
            } else if (colDiff === 2) {
                distance = rowDiff <= 1 ? 2 : 3;
            } else {
                distance = colDiff + rowDiff;
            }

            return distance <= range && this.isPathClear(currentHex, hex);
        });
    }     
    
    highlightHexes(hexes) {
        hexes.forEach(hex => {
            const graphics = this.scene.add.graphics();
            graphics.lineStyle(2, 0xffff00, 1);
            graphics.strokeCircle(hex.x, hex.y, 25);
    
            graphics.setInteractive(new Phaser.Geom.Circle(hex.x, hex.y, 25), Phaser.Geom.Circle.Contains);
    
            graphics.on('pointerdown', () => {    
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
        const currentPlayer = turnManager.getCurrentPlayer();
    
        if (!character || !targetHex) {
            console.log('Personagem ou hex inválidos.');
            return;
        }
    
        if (!turnManager.canMoveCharacter(character)) {
            this.scene.warningTextPlugin.showTemporaryMessage("Este personagem já se moveu neste turno.");
            return;
        }
    
        console.log(`Movendo ${character.name} para ${targetHex.label}`);
    
        const currentHex = this.getHexByLabel(character.state.position);
        if (currentHex) {
            currentHex.occupied = false;
            delete this.characters[currentHex.label];
            
            if (currentHex.borderGraphics) {
                currentHex.borderGraphics.clear();
                currentHex.borderGraphics.destroy();
                currentHex.borderGraphics = null;
            }
        }
    
        targetHex.occupied = true;
        this.characters[targetHex.label] = character;
        character.state.position = targetHex.label;
    
        character.sprite.clear();
        character.sprite.destroy();
    
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(character.color || currentPlayer.color, 1);
        graphics.fillCircle(targetHex.x, targetHex.y, 20);
        character.sprite = graphics;
    
        graphics.setInteractive(new Phaser.Geom.Circle(targetHex.x, targetHex.y, 20), Phaser.Geom.Circle.Contains);
    
        graphics.on('pointerdown', () => this.selectCharacter(character));
        
        if (character.statsText) {
            character.statsText.setPosition(targetHex.x, targetHex.y + 25);
        }
        
        this.drawHexBorder(targetHex, currentPlayer.color);
        turnManager.markCharacterAsMoved(character);

        if(turnManager.currentTurn.movedAll) {
            turnManager.nextTurn();
        }
    
        this.clearHighlights();
        this.selectedCharacter = null;
    }        
        
    getHexByLabel(label) {
        return this.board.find(hex => hex.label === label);
    }
}
