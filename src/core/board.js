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
    
        if (character.sprite) {
            character.sprite.destroy();
        }
    
        character.sprite = this.scene.add.sprite(hex.x, hex.y, 'heroes', character.frameIndex);
        character.sprite.setScale(0.7);

        character.sprite.setInteractive();
        character.sprite.setInteractive();
        character.sprite.on('pointerdown', () => {
            if (this.selectedCharacter) {
                this.attackHero(this.selectedCharacter, character);
            } else {
                this.selectCharacter(character);
            }
        });
    
        hex.playerColor = playerColor;
        this.drawHexBorder(hex, playerColor);
    
        const { currentHealth, attack } = character.stats;
        if (character.statsText) {
            character.statsText.destroy();
        }
    
        character.statsText = this.scene.add.text(hex.x, hex.y + 25, `⚔ ${attack} ❤ ${currentHealth}`, {
            font: '12px Arial',
            fill: '#ffffff',
            align: 'center',
            backgroundColor: '#000000',
            padding: { x: 2, y: 2 }
        });
    
        character.statsText.setOrigin(0.5);
        character.statsText.setDepth(10);
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
            if (this.selectedCharacter && this.selectedCharacter.attackTarget) {
                this.attackHero(this.selectedCharacter, character);
            } else {
                this.scene.warningTextPlugin.showTemporaryMessage('Você só pode mover ou atacar com personagens do seu time.');
            }
            return;
        }
        
        this.selectedCharacter = character;
        this.clearHighlights();
        const movimentRange = 2;
        this.highlightedHexes = this.getMovableHexes(character, movimentRange);
        this.highlightHexes(this.highlightedHexes);
    }

    attackHero(attacker, target) {
        if (!attacker || !target || attacker === target) return;
    
        const gameManager = this.scene.game.gameManager;
        const turnManager = gameManager.getTurnManager();
        const currentPlayer = turnManager.getCurrentPlayer();
    
        if (!currentPlayer.characters.includes(attacker)) {
            this.scene.warningTextPlugin.showTemporaryMessage("Você só pode atacar com seus personagens.");
            return;
        }
    
        if (!turnManager.currentTurn.attackedCharacters) {
            turnManager.currentTurn.attackedCharacters = new Set();
        }
    
        if (turnManager.currentTurn.attackedCharacters.has(attacker)) {
            this.scene.warningTextPlugin.showTemporaryMessage("Este personagem já atacou neste turno.");
            this.selectedCharacter = null;
            this.clearHighlights();
            return;
        }
    
        if (currentPlayer.characters.includes(target)) {
            this.selectedCharacter = null;
            this.clearHighlights();
            return;
        }
    
        const attackerHex = this.getHexByLabel(attacker.state.position);
        const targetHex = this.getHexByLabel(target.state.position);
    
        if (!attackerHex || !targetHex) return;
    
        const distance = this.calculateDistance(attackerHex, targetHex);
    
        if (distance <= attacker.attackRange) {
            attacker.skills.forEach(skill => skill.apply(attacker, target));
    
            attacker.attackTarget(target, this);
    
            turnManager.markCharacterAsAttacked(attacker);
    
            this.updateCharacterStats(target);
    
            this.scene.warningTextPlugin.showTemporaryMessage(`${attacker.name} atacou ${target.name}!`);
    
            if (!target.state.isAlive) {
                this.handleCharacterDeath(target, targetHex);
                const gameState = turnManager.checkGameState();
                if (gameState.status === 'finished') {
                    this.scene.warningTextPlugin.showTemporaryMessage(`${gameState.winner.name} venceu o jogo!`);
                    return;
                }
            }
    
            if (!turnManager.currentTurn.counterAttack) {
                const distanceTarget = this.calculateDistance(targetHex, attackerHex);
    
                if (distanceTarget <= target.attackRange) {
                    target.counterAttack(attacker, target.attack, turnManager);
                    this.updateCharacterStats(attacker);
    
                    if (!attacker.state.isAlive) {
                        this.handleCharacterDeath(attacker, attackerHex);
                        const gameState = turnManager.checkGameState();
                        if (gameState.status === 'finished') {
                            this.scene.warningTextPlugin.showTemporaryMessage(`${gameState.winner.name} venceu o jogo!`);
                            return;
                        }
                    }
                }
            }
    
            const allCharactersAttacked = currentPlayer.characters.every(character => 
                turnManager.currentTurn.attackedCharacters.has(character)
            );
    
            if (allCharactersAttacked) {
                turnManager.currentTurn.attackedAll = true;
                turnManager.nextTurn();
            }
    
            this.selectedCharacter = null;
            this.clearHighlights();
        } else {
            this.scene.warningTextPlugin.showTemporaryMessage(`${target.name} está fora do alcance de ataque.`);
        }
    }    
    
    updateCharacterStats(character) {
        const hex = this.getHexByLabel(character.state.position);
        if (!hex || !character.statsText) return;
        
        const health = character.stats.currentHealth || character.hp;
        const attack = character.stats.attack || character.attack;
        
        character.statsText.setText(`⚔ ${attack} ❤ ${health}`);
    }
    
    handleCharacterDeath(character, hex) {
        hex.occupied = false;
        delete this.characters[hex.label];
        
        if (character.sprite) {
            character.sprite.destroy();
        }
        if (character.statsText) {
            character.statsText.destroy();
        }
        if (hex.borderGraphics) {
            hex.borderGraphics.clear();
            hex.borderGraphics.destroy();
            hex.borderGraphics = null;
        }
        
        this.scene.warningTextPlugin.showTemporaryMessage(`${character.name} foi derrotado!`);
    }
    
    calculateDistance(hex1, hex2) {
        const colDiff = Math.abs(hex1.col - hex2.col);
        const rowDiff = Math.abs(hex1.row - hex2.row);
    
        if (colDiff === 0) return rowDiff;
    
        if (hex1.col % 2 === 0) {
            return colDiff + Math.max(0, rowDiff - Math.floor(colDiff / 2));
        } else {
            return colDiff + Math.max(0, rowDiff - Math.ceil(colDiff / 2));
        }
    }    
    
    isPathClear(startHex, targetHex, maxSteps) {
        const directions = [
            { col: 1, row: 0 },   // Direita
            { col: -1, row: 0 },  // Esquerda
            { col: 0, row: 1 },   // Baixo
            { col: 0, row: -1 },  // Cima
            { col: 1, row: 1 },   // Diagonal direita-baixo
            { col: -1, row: 1 },  // Diagonal esquerda-baixo
            { col: 1, row: -1 },  // Diagonal direita-cima
            { col: -1, row: -1 }  // Diagonal esquerda-cima
        ];
        
        const visited = new Set();
        const queue = [{ col: startHex.col, row: startHex.row, steps: 0 }];
        
        while (queue.length > 0) {
            const { col, row, steps } = queue.shift();
            const key = `${col},${row}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
    
            if (col === targetHex.col && row === targetHex.row) {
                return true;
            }
            
            if (steps >= maxSteps) continue;
    
            for (const { col: dCol, row: dRow } of directions) {
                let nextCol = col + dCol;
                let nextRow = row + dRow;
    
                if (col % 2 === 1 && dCol !== 0) {
                    nextRow = row + Math.floor(dRow * 0.5);
                } else if (col % 2 === 0 && dCol !== 0) {
                    nextRow = row + Math.ceil(dRow * 0.5);
                }
    
                const intermediateHex = this.board.find(
                    hex => hex.col === nextCol && hex.row === nextRow
                );
    
                if (intermediateHex && !intermediateHex.occupied && !visited.has(`${nextCol},${nextRow}`)) {
                    queue.push({ col: nextCol, row: nextRow, steps: steps + 1 });
                }
            }
        }
        
        return false;
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

            let isPathClear = this.isPathClear(currentHex, hex, range);

            return distance <= range && isPathClear;
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
    
            // Apenas remove a borda se ninguém mais estiver lá
            if (!this.characters[currentHex.label] && currentHex.borderGraphics) {
                currentHex.borderGraphics.clear();
                currentHex.borderGraphics.destroy();
                currentHex.borderGraphics = null;
            }
        }
    
        targetHex.occupied = true;
        this.characters[targetHex.label] = character;
        character.state.position = targetHex.label;
    
        if (character.sprite) {
            character.sprite.setPosition(targetHex.x, targetHex.y);
        } else {
            character.sprite = this.scene.add.sprite(targetHex.x, targetHex.y, 'heroes', character.frameIndex);
            character.sprite.setScale(1.5);
        }
    
        if (!character.sprite.input) {
            character.sprite.setInteractive();
            character.sprite.on('pointerdown', () => this.selectCharacter(character));
        }
    
        if (character.statsText) {
            character.statsText.setPosition(targetHex.x, targetHex.y + 25);
            character.statsText.setDepth(10);
        }
    
        this.drawHexBorder(targetHex, currentPlayer.color);
    
        turnManager.markCharacterAsMoved(character);
    
        this.clearHighlights();
        this.selectedCharacter = null;
    }     
        
    getHexByLabel(label) {
        return this.board.find(hex => hex.label === label);
    }
}
