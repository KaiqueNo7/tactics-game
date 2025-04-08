export default class Board extends Phaser.GameObjects.GameObject {
    constructor(scene, hexRadius = 40) {
        super(scene, 'Board');
        this.scene = scene;
        this.hexRadius = hexRadius;
        this.hexWidth = hexRadius * 2;
        this.hexHeight = Math.sqrt(3) * hexRadius;
        this.board = [];
        this.heros = {};
        this.highlightedHexes = [];
        this.selectedHero = null;
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

    placeHero(hero, position, playerColor) {
        const hex = this.getHexByLabel(position);
    
        if (!hex || !this.scene) return;
    
        hex.occupied = true;
        this.heros[position] = hero;
        hero.state.position = position;
    
        hex.playerColor = playerColor;
        this.drawHexBorder(hex, playerColor);
    
        // ✅ Agora o herói é responsável por se posicionar e atualizar seu próprio status visual
        hero.placeOnBoard(this.scene, hex);
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
    
    selectHero(hero) {
        const gameManager = this.scene.game.gameManager;
        const turnManager = gameManager.getTurnManager();
        const currentPlayer = turnManager.getCurrentPlayer();
    
        if (this.selectedHero === hero) {
            this.selectedHero = null;
            this.clearHighlights();
            this.scene.uiManager.updategamePanel(null);
            return;
        }
    
        if (!currentPlayer.heros.includes(hero)) {
            if (this.selectedHero && this.selectedHero.attackTarget) {
                if (!turnManager.currentTurn.attackedHeros) {
                    turnManager.currentTurn.attackedHeros = new Set();
                }
    
                if (turnManager.currentTurn.attackedHeros.has(this.selectedHero)) {
                    this.scene.warningTextPlugin.showTemporaryMessage('Este personagem já atacou neste turno.');
                } else {
                    this.attackHero(this.selectedHero, hero);
                    turnManager.markHeroAsAttacked(this.selectedHero);
                }
            } else {
                this.scene.warningTextPlugin.showTemporaryMessage('Você só pode mover ou atacar com heróis do seu time.');
            }

            return;
        }
        
        this.selectedHero = hero;
        this.clearHighlights();
        const movimentRange = 2;
        this.highlightedHexes = this.getMovableHexes(hero, movimentRange);
        this.highlightHexes(this.highlightedHexes);
    }

    attackHero(attacker, target) {
        if (!attacker || !target || attacker === target) return;
    
        const gameManager = this.scene.game.gameManager;
        const turnManager = gameManager.getTurnManager();
        const currentPlayer = turnManager.getCurrentPlayer();
    
        if (!currentPlayer.heros.includes(attacker)) {
            this.scene.warningTextPlugin.showTemporaryMessage("Você só pode atacar com seus heróis.");
            return;
        }
    
        if (!turnManager.currentTurn.attackedHeros) {
            turnManager.currentTurn.attackedHeros = new Set();
        }
    
        if (turnManager.currentTurn.attackedHeros.has(attacker)) {
            this.scene.warningTextPlugin.showTemporaryMessage("Este personagem já atacou neste turno.");
            this.selectedHero = null;
            this.clearHighlights();
            return;
        }
    
        if (currentPlayer.heros.includes(target)) {
            this.selectedHero = null;
            this.clearHighlights();
            return;
        }
    
        const attackerHex = this.getHexByLabel(attacker.state.position);
        const targetHex = this.getHexByLabel(target.state.position);
    
        if (!attackerHex || !targetHex) return;
    
        const distance = this.calculateDistance(attackerHex, targetHex);
    
        if (distance <= attacker.attackRange) {
            attacker.attackTarget(target);
    
            turnManager.markHeroAsAttacked(attacker);
    
            this.scene.warningTextPlugin.showTemporaryMessage(`${attacker.name} atacou ${target.name}!`);
    
            if (!target.state.isAlive) {
                this.handleHeroDeath(target, targetHex);
                const gameState = turnManager.checkGameState();
                if (gameState.status === 'finished') {
                    this.scene.warningTextPlugin.showTemporaryMessage(`${gameState.winner.name} venceu o jogo!`);
                    return;
                }
            }
    
            if (!turnManager.currentTurn.counterAttack) {
                const distanceTarget = this.calculateDistance(targetHex, attackerHex);
                if (distanceTarget <= target.attackRange) { 
                    target.counterAttack(attacker); 
                    turnManager.currentTurn.counterAttack = true;
    
                    if (!attacker.state.isAlive) {
                        this.handleHeroDeath(attacker, attackerHex);
                        const gameState = turnManager.checkGameState();
                        if (gameState.status === 'finished') {
                            this.scene.warningTextPlugin.showTemporaryMessage(`${gameState.winner.name} venceu o jogo!`);
                            return;
                        }
                    }
                }                
            }
    
            const allherosAttacked = currentPlayer.heros.every(hero => 
                turnManager.currentTurn.attackedHeros.has(hero)
            );
    
            if (allherosAttacked) {
                turnManager.currentTurn.attackedAll = true;
                turnManager.nextTurn();
            }
    
            this.selectedHero = null;
            this.clearHighlights();
        } else {
            this.scene.warningTextPlugin.showTemporaryMessage(`${target.name} está fora do alcance de ataque.`);
        }
    }
      
    
    handleHeroDeath(hero, hex) {
        hex.occupied = false;
        delete this.heros[hex.label];
        
        if (hero.sprite) {
            hero.sprite.destroy();
        }
        if (hero.statsText) {
            hero.statsText.destroy();
        }
        if (hex.borderGraphics) {
            hex.borderGraphics.clear();
            hex.borderGraphics.destroy();
            hex.borderGraphics = null;
        }
        
        this.scene.warningTextPlugin.showTemporaryMessage(`${hero.name} foi derrotado!`);
    }
    
    calculateDistance(attackerHex, targetHex) {
        const colDiff = Math.abs(attackerHex.col - targetHex.col);
        const rowDiff = Math.abs(attackerHex.row - targetHex.row);
    
        let distance;
        
        if (colDiff === 0) {
            distance = rowDiff;
        } else if (colDiff === 1) {
            if (attackerHex.col % 2 === 0) {
                distance = (targetHex.row >= attackerHex.row) ? rowDiff : rowDiff + 1;
            } else {
                distance = (targetHex.row <= attackerHex.row) ? rowDiff : rowDiff + 1;
            }
        } else if (colDiff === 2) {
            distance = rowDiff <= 1 ? 2 : 3;
        } else {
            distance = colDiff + rowDiff;
        }

        return distance;
    }    
    
    isPathClear(startHex, targetHex, maxSteps) {
        const directions = [
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
        
    getMovableHexes(hero, range) {
        const currentHex = this.getHexByLabel(hero.state.position);

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
    
    getHexesInLine(fromHex, toHex, maxSteps = 2) {
        const directions = [
            { col: 0, row: 1 },   // Baixo
            { col: 0, row: -1 },  // Cima
            { col: 1, row: 1 },   // Diagonal direita-baixo
            { col: -1, row: 1 },  // Diagonal esquerda-baixo
            { col: 1, row: -1 },  // Diagonal direita-cima
            { col: -1, row: -1 }  // Diagonal esquerda-cima
        ];        

        function getNeighborHex(fromHex, direction) {
            let col = fromHex.col + direction.col;
            let row = fromHex.row;
        
            if (direction.col !== 0) {
                if (fromHex.col % 2 === 0) {
                    row += Math.ceil(direction.row * 0.5);
                } else {
                    row += Math.floor(direction.row * 0.5);
                }
            } else {
                row += direction.row;
            }
        
            return { col, row };
        }        
    
        const deltaCol = toHex.col - fromHex.col;
        const deltaRow = toHex.row - fromHex.row;
    
        let direction = null;
        for (const d of directions) {
            const neighbor = getNeighborHex(fromHex, d);
            console.log(`Testando direção: col=${d.col}, row=${d.row} => esperado: col=${neighbor.col}, row=${neighbor.row}`);
            
            if (neighbor.col === toHex.col && neighbor.row === toHex.row) {
                direction = d;

                console.log("Direção detectada:", direction);
                break;
            }
        }
    
        if (!direction) {
            console.warn("Nenhuma direção encontrada.");
            return [];
        }
    
        const lineHexes = [];
        let currentCol = toHex.col;
        let currentRow = toHex.row;
    
        for (let i = 0; i < maxSteps; i++) {
            let nextCol = currentCol + direction.col;
            let nextRow = currentRow + direction.row;
    
            if (currentCol % 2 === 1 && direction.col !== 0) {
                nextRow = currentRow + Math.floor(direction.row * 0.5);
            } else if (currentCol % 2 === 0 && direction.col !== 0) {
                nextRow = currentRow + Math.ceil(direction.row * 0.5);
            }
    
            const nextHex = this.board.find(hex => hex.col === nextCol && hex.row === nextRow);
            console.log(`Verificando hex col=${nextCol}, row=${nextRow}`, nextHex);
    
            if (!nextHex) break;
    
            lineHexes.push(nextHex);
    
            currentCol = nextCol;
            currentRow = nextRow;
    
            if (!nextHex.occupied) break;
        }
    
        return lineHexes;
    }     
    
    highlightHexes(hexes) {
        hexes.forEach(hex => {
            const graphics = this.scene.add.graphics();
            graphics.lineStyle(2, 0xffff00, 1);
            graphics.strokeCircle(hex.x, hex.y, 25);
    
            graphics.setInteractive(new Phaser.Geom.Circle(hex.x, hex.y, 25), Phaser.Geom.Circle.Contains);
    
            graphics.on('pointerdown', () => {    
                this.moveHero(this.selectedHero, hex);
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

    moveHero(hero, targetHex) {   
        const gameManager = this.scene.game.gameManager;
        const turnManager = gameManager.getTurnManager();
        const currentPlayer = turnManager.getCurrentPlayer();
    
        if (!hero || !targetHex) return;
    
        if (!turnManager.canMoveHero(hero)) {
            this.scene.warningTextPlugin.showTemporaryMessage("Este personagem já se moveu neste turno.");
            this.clearHighlights();
            this.selectedHero = null;    
            return;
        }
    
        console.log(`Movendo ${hero.name} para ${targetHex.label}`);
    
        const currentHex = this.getHexByLabel(hero.state.position);
        if (currentHex) {
            currentHex.occupied = false;
            delete this.heros[currentHex.label];
    
            // Apenas remove a borda se ninguém mais estiver lá
            if (!this.heros[currentHex.label] && currentHex.borderGraphics) {
                currentHex.borderGraphics.clear();
                currentHex.borderGraphics.destroy();
                currentHex.borderGraphics = null;
            }
        }
    
        targetHex.occupied = true;
        this.heros[targetHex.label] = hero;
        hero.state.position = targetHex.label;
    
        if (hero.sprite) {
            hero.sprite.setPosition(targetHex.x, targetHex.y);
        } else {
            hero.sprite = this.scene.add.sprite(targetHex.x, targetHex.y, 'heroes', hero.frameIndex);
            hero.sprite.setScale(1.5);
        }
    
        if (!hero.sprite.input) {
            hero.sprite.setInteractive();
            hero.sprite.on('pointerdown', () => this.selectHero(hero));
        }
    
        if (hero.statsText) {
            hero.statsText.setPosition(targetHex.x, targetHex.y + 25);
            hero.statsText.setDepth(10);
        }
    
        this.drawHexBorder(targetHex, currentPlayer.color);
    
        turnManager.markHeroAsMoved(hero);
    
        this.clearHighlights();
        this.selectedHero = null;
    }     
        
    getHexByLabel(label) {
        return this.board.find(hex => hex.label === label);
    }
}
