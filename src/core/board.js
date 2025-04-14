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
        this.hexagons = [];
    }

    initializeBoard() {
        this.boardContainer = this.scene.add.container(0, 0);

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
                    occupiedBy: null,
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

    placeHero(hero, position, playerNumber) {
        const hex = this.getHexByLabel(position);
        if (!hex || !this.scene) return;
    
        hex.occupied = true;
        hex.occupiedBy = playerNumber;
        this.heros[position] = hero;
        hero.state.position = position;
        hero.state.playerId = playerNumber;

        hero.placeOnBoard(this.scene, hex, playerNumber, this.boardContainer);
    }
    
    selectHero(hero) {
        const gameManager = this.scene.game.gameManager;
        const turnManager = gameManager.getTurnManager();
        const currentPlayer = turnManager.getCurrentPlayer();
    
        if (this.selectedHero === hero) {
            this.selectedHero.setSelected(false);
            this.selectedHero = null;
            this.clearHighlights();
            return;
        }
    
        if (!currentPlayer.heros.includes(hero)) {
            if (this.selectedHero && this.selectedHero.attackTarget) {
                if (turnManager.currentTurn.attackedHeros.has(this.selectedHero)) {
                    this.scene.gameUI.showMessage('Este personagem já atacou neste turno.');
                } else {
                    this.attackHero(this.selectedHero, hero);
                    turnManager.markHeroAsAttacked(this.selectedHero);
    
                    // Desseleciona depois de atacar
                    this.selectedHero.setSelected(false);
                    this.selectedHero = null;
                    this.clearHighlights();
                }
            } else {
                this.scene.gameUI.showMessage('Esse herói não é seu.');
            }
    
            return;
        }
    
        if (this.selectedHero) {
            this.selectedHero.setSelected(false);
        }
    
        this.selectedHero = hero;
        this.selectedHero.setSelected(true);
        this.clearHighlights();
    
        const movimentRange = hero.ability == 'Sprint' ? 3 : 2;
        const rangeHero = hero.attackRange;
        const movableHexes = this.getMovableHexes(hero, movimentRange);
        const enemyHexes = this.getEnemiesInRange(hero, rangeHero);
        
        const allHexes = [...movableHexes.map(hex => ({ hex, type: 'move' })), 
                          ...enemyHexes.map(hex => ({ hex, type: 'enemy' }))];
        
        const uniqueHexes = allHexes.filter((item, index, self) =>
            index === self.findIndex(h => h.hex.label === item.hex.label)
        );
        
        this.highlightedHexes = uniqueHexes;
        this.highlightHexes(this.highlightedHexes);
        
    }    

    clearSelectedHero() {
        if (this.selectedHero) {
            this.selectedHero.setSelected(false);
            this.clearHighlights();
            this.selectedHero = null;
        }
    }    

    createHexagons() {
        this.hexagons.forEach(hex => {
            if (hex.image) hex.image.destroy();
            if (hex.borderSprite) hex.borderSprite.destroy();
        });

        this.hexagons = [];
    
        this.board.forEach(hex => {
            const image = this.scene.add.image(0, 0, 'hexagon')
                .setOrigin(0.5)
                .setDisplaySize(this.hexRadius * 2.3, this.hexRadius * 2.3)
                .setAngle(30)
                .setInteractive();
            image.setPosition(hex.x, hex.y);
            this.boardContainer.add(image);
        
            const borderSprite = this.scene.add.image(0, 0, 'hexagon_blue')
                .setOrigin(0.5)
                .setDisplaySize(this.hexRadius * 2.3, this.hexRadius * 2.3)
                .setAngle(30)
                .setVisible(false);
            borderSprite.setPosition(hex.x, hex.y);
            this.boardContainer.add(borderSprite);
        
            this.hexagons.push({
                hexData: hex,
                image,
                borderSprite
            });            
        });

        const bounds = this.boardContainer.getBounds();

        const centerX = (this.scene.scale.width - bounds.width) / 2 - bounds.x;
        const centerY = (this.scene.scale.height - bounds.height) / 2 - bounds.y;

        this.boardContainer.setPosition(centerX, centerY);

    }   

    attackHero(attacker, target) {
        if (!attacker || !target || attacker === target) return;
    
        const gameManager = this.scene.game.gameManager;
        const turnManager = gameManager.getTurnManager();
        const currentPlayer = turnManager.getCurrentPlayer();
    
        if (!currentPlayer.heros.includes(attacker)) {
            this.scene.gameUI.showMessage("Você só pode atacar com seus heróis.");
            return;
        }
    
        if (!turnManager.currentTurn.attackedHeros) {
            turnManager.currentTurn.attackedHeros = new Set();
        }
    
        if (turnManager.currentTurn.attackedHeros.has(attacker)) {
            this.scene.gameUI.showMessage("Este personagem já atacou neste turno.");
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
            const enemyHexes = this.getEnemiesInRange(attacker, attacker.attackRange);
            const tauntEnemies = enemyHexes
                .map(hex => this.heros[hex.label])
                .filter(enemy => enemy && enemy.state.isAlive && enemy.ability === 'Taunt');
            
            if (tauntEnemies.length > 0 && target.ability !== 'Taunt') {
                this.scene.gameUI.showMessage("Você deve atacar o inimigo com TAUNT");
                this.clearSelectedHero();
                this.clearHighlights();
                return;
            }

            attacker.attackTarget(target);
            turnManager.markHeroAsAttacked(attacker);
    
            console.log(`${attacker.name} atacou ${target.name}!`);
    
            if (!turnManager.currentTurn.counterAttack) {
                const distanceTarget = this.calculateDistance(targetHex, attackerHex);
                if (distanceTarget <= target.attackRange) { 
                    target.counterAttack(attacker); 
                    turnManager.currentTurn.counterAttack = true;
                }                
            }
    
            const allHerosAttacked = currentPlayer.heros
            .filter(hero => hero.state.isAlive)
            .every(hero => turnManager.currentTurn.attackedHeros.has(hero));        

            if (allHerosAttacked) {
                turnManager.currentTurn.attackedAll = true;
                turnManager.nextTurn();
            }
            
            this.clearSelectedHero();
            this.clearHighlights();
        } else {
            this.scene.gameUI.showMessage(`${target.name} está fora do alcance de ataque.`);
        }
    }
      
    handleHeroDeath(hero, hex) {
        this.scene.gameManager.turnManager.checkGameState();

        hex.occupied = false;
        delete this.heros[hex.label];
        
        if (hero.sprite) {
            hero.destroy();
        }
        
        this.scene.gameUI.showMessage(`${hero.name} foi derrotado!`);
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
    
    isPathClear(startHex, targetHex, maxSteps, allowTargetOccupied = false) {
        const directions = [
            { col: 0, row: 1 },
            { col: 0, row: -1 },
            { col: 1, row: 1 },
            { col: -1, row: 1 },
            { col: 1, row: -1 },
            { col: -1, row: -1 }
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
    
                const neighbor = this.board.find(
                    hex => hex.col === nextCol && hex.row === nextRow
                );
    
                const isTarget = (nextCol === targetHex.col && nextRow === targetHex.row);
                const isBlocked = neighbor?.occupied && (!isTarget || !allowTargetOccupied);
    
                if (neighbor && !isBlocked && !visited.has(`${nextCol},${nextRow}`)) {
                    queue.push({ col: nextCol, row: nextRow, steps: steps + 1 });
                }
            }
        }
    
        return false;
    }
    
    getHexesInRange(hero, range, filterFn = () => true, checkPath = false, allowTargetOccupied = false) {
        const currentHex = this.getHexByLabel(hero.state.position);
    
        if (!currentHex) {
            console.log('Hex não encontrado.');
            return [];
        }
    
        return this.board.filter(hex => {
            if (hex.label === currentHex.label) return false;
    
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
            } else if (colDiff === 3) {
                distance = rowDiff <= 2 ? 3 : 4;
            } else {
                distance = colDiff + rowDiff;
            }

            if (distance > range) return false;
    
            if (checkPath && !this.isPathClear(currentHex, hex, range, allowTargetOccupied)) return false;
            
            return filterFn(hex, currentHex);
        });
    }    
        
    getMovableHexes(hero, range) {
        return this.getHexesInRange(
            hero,
            range,
            (hex) => !hex.occupied,
            true
        );
    }
    
    getEnemiesInRange(hero, range) {
        const turnManager = this.scene.game.gameManager.getTurnManager();

        return this.getHexesInRange(
            hero,
            range,
            (hex) => {
                if (!hex.occupied || !hex.occupiedBy) return false;
                return hex.occupiedBy !== hero.state.playerId;
            },
            true,
            true 
        );
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
            
            if (neighbor.col === toHex.col && neighbor.row === toHex.row) {
                direction = d;

                break;
            }
        }
    
        if (!direction) {
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
    
            if (!nextHex) break;
    
            lineHexes.push(nextHex);
    
            currentCol = nextCol;
            currentRow = nextRow;
    
            if (!nextHex.occupied) break;
        }
    
        return lineHexes;
    }     
    
    highlightHexes(hexEntries) {
        hexEntries.forEach(({ hex, type }) => {
            const texture = type === 'enemy' ? 'hex_highlight_enemy' : 'hex_highlight';
    
            const highlight = this.scene.add.image(hex.x, hex.y, texture);
            highlight.setOrigin(0.5);
            highlight.setDepth(1);
            highlight.setDisplaySize(this.spriteSize || 92, this.spriteSize || 92);
            highlight.setAlpha(0.4);
            highlight.setAngle(30);
            highlight.setInteractive();
    
            this.boardContainer.add(highlight);
    
            if (type === 'move') {
                highlight.on('pointerover', () => {
                    highlight.setAlpha(0.6);
                });
    
                highlight.on('pointerout', () => {
                    highlight.setAlpha(0.4);
                });
    
                highlight.on('pointerdown', () => {
                    this.moveHero(this.selectedHero, hex);
                });
            }
    
            if (type === 'enemy') {
                highlight.on('pointerover', () => {
                    highlight.setAlpha(0.6);
                });
    
                highlight.on('pointerout', () => {
                    highlight.setAlpha(0.4);
                });
    
                highlight.on('pointerdown', () => {
                    this.attackHero(this.selectedHero, this.heros[hex.label]);
                });
            }
    
            this.highlightedHexes.push(highlight);
        });
    }
    
        
    clearHighlights() {
        this.highlightedHexes.forEach(h => {
            if (h && typeof h.destroy === 'function') {
                h.destroy();
            }
        });
        this.highlightedHexes = [];
    }     

    moveHero(hero, targetHex) {   
        const gameManager = this.scene.game.gameManager;
        const turnManager = gameManager.getTurnManager();
    
        if (!hero || !targetHex) return;
    
        if (!turnManager.canMoveHero(hero)) {
            this.scene.gameUI.showMessage("Este héroi não pode se mover.");
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
        targetHex.occupiedBy = hero.state.playerId;

        this.heros[targetHex.label] = hero;
        hero.state.position = targetHex.label;
    
        hero.setPosition(targetHex.x, targetHex.y);
    
        turnManager.markHeroAsMoved(hero);
        this.clearHighlights();
        this.selectedHero = null;
    }     
        
    getHexByLabel(label) {
        return this.board.find(hex => hex.label === label);
    }
}
