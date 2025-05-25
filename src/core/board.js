import { SOCKET_EVENTS } from "../../api/events.js";

export default class Board extends Phaser.GameObjects.GameObject {
  constructor(scene, socket, roomId, gameManager, user) {
    super(scene, 'Board');
    this.scene = scene;
    this.socket = socket;
    this.roomId = roomId;
    this.gameManager = gameManager;
    this.hexRadius = 35;
    this.hexWidth = this.hexRadius * 2;
    this.hexHeight = Math.sqrt(3) * this.hexRadius;
    this.board = [];
    this.heroes = {};
    this.highlightedHexes = [];
    this.selectedHero = null;
    this.hexagons = [];
    this.user = user;
  }

  initializeBoard() {
    this.boardContainer = this.scene.add.container(0, 0);

    this.board = [];
    let xOffset = 0;
    let yOffset = 0;

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
          col, 
          label: label, 
          occupied: false, 
          occupiedBy: null,
          row, 
          x: xOffset, 
          y: currentYOffset 
        };
        this.board.push(hex);
        currentYOffset += this.hexHeight;
      }
      xOffset += this.hexWidth * 0.75;
    }
  }
    
  selectHero(hero) {
    if(!hero.state.isAlive) return;

    if (hero.playerId !== this.user.id) return;   

    const turnManager = this.gameManager.getTurnManager();
    const currentPlayer = turnManager.getCurrentPlayer();
    
    if (this.selectedHero === hero) {
      this.selectedHero.setSelected(false);
      this.selectedHero = null;
      this.clearHighlights();
      return;
    }
    
    if (!currentPlayer.heroes.includes(hero)) {
      this.scene.gameUI.showMessage('Aguarde a sua vez!');
    
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

  clearBoard() {
    this.board.forEach(hex => {
      hex.occupied = false;
      hex.occupiedBy = null;
    });
    this.heroes = {};
  
    if (this.boardContainer) {
      this.boardContainer.removeAll(true);
    }
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
        borderSprite,
        hexData: hex,
        image
      });            
    });

    const bounds = this.boardContainer.getBounds();

    const centerX = (this.scene.scale.width - bounds.width) / 2 - bounds.x;
    const centerY = (this.scene.scale.height - bounds.height) / 2 + 30 - bounds.y;

    this.boardContainer.setPosition(centerX, centerY);

  }   

  attackHero(attacker, target) {
    if (!attacker || !target || attacker === target) return;
  
    const gameManager = this.scene.gameManager;
    const turnManager = gameManager.getTurnManager();
    const currentPlayer = turnManager.getCurrentPlayer();
  
    if (!currentPlayer.heroes.includes(attacker)) {
      this.scene.gameUI.showMessage("Você só pode atacar com seus heróis.");
      return;
    }

    if (turnManager.currentTurn.attackedHeroes.includes(attacker.id)) {
      this.scene.gameUI.showMessage("Este herói já atacou neste turno.");
      this.selectedHero = null;
      this.clearHighlights();
      return;
    }
  
    if (currentPlayer.heroes.includes(target)) {
      this.selectedHero = null;
      this.clearHighlights();
      return;
    }
  
    const attackerHex = this.getHexByLabel(attacker.state.position);
    const targetHex = this.getHexByLabel(target.state.position);
    if (!attackerHex || !targetHex) return;
  
    const enemyHexes = this.getEnemiesInRange(attacker, attacker.attackRange);
    const tauntEnemies = enemyHexes
      .map(hex => this.gameManager.getHeroByPosition(hex.label))
      .filter(enemy => enemy && enemy.state.isAlive && enemy.ability === 'Taunt');

    if (tauntEnemies.length > 0 && target.ability !== 'Taunt') {
      const tauntHero = tauntEnemies[0];
      this.scene.uiManager.heroTalk(tauntHero, "Bloqueado (TAUNT)");
      this.clearSelectedHero();
      this.clearHighlights();
      return;
    }

    attacker.attackTarget(target);
    turnManager.markHeroAsAttacked(attacker.id);

    console.log(`${attacker.name} atacou ${target.name}!`);

    if (!turnManager.currentTurn.counterAttack && target.state.isAlive) {
      const distanceTarget = this.calculateDistance(targetHex, attackerHex);
      if (distanceTarget <= target.attackRange) {
        this.socket.emit(SOCKET_EVENTS.HERO_COUNTER_ATTACK_REQUEST, {
            roomId: this.roomId,
            heroAttackerId: attacker.id,
            heroTargetId: target.id
        });

        turnManager.currentTurn.counterAttack = true;
      }
    }

    this.clearSelectedHero();
    this.clearHighlights();
  }
      
  handleHeroDeath(hero, hex) {
    this.scene.gameManager.checkGameState();
    
    delete this.heroes[this.gameManager.getHeroByPosition(hex.label)];
    
    if (hero.healthIcon) hero.healthIcon.destroy();
    if (hero.healthText) hero.healthText.destroy();
    if (hero.attackIcon) hero.attackIcon.destroy();
    if (hero.attackText) hero.attackText.destroy();

    if (hero.sprite) {
      hero.sprite.setScale(0.23);
      hero.sprite.setTint(0x808080);
    } 

    if (hero.shieldSprite){
      hero.shieldSprite.destroy();
    }

    if (hero.effectSprites.poison){
      hero.effectSprites.poison.destroy();
    }

    if (hero.hexBg) {
      hero.hexBg.destroy();
    }
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
    return this.getHexesInRange(
      hero,
      range,
      (hex) => {
        if (!hex.occupied || !hex.occupiedBy) return false;
        if(!hex.occupiedBy.state.isAlive) return false;
        return hex.occupiedBy.playerId !== hero.playerId;
      },
      true,
      true 
    );
  }     

  getAlliesInRange(hero, range) {
    return this.getHexesInRange(
      hero,
      range,
      (hex) => {
        if (!hex.occupied || !hex.occupiedBy) return false;
        if(!hex.occupiedBy.state.isAlive) return false;
        return hex.occupiedBy.playerId === hero.playerId;
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
    const selectedHero = this.selectedHero;
  
    hexEntries.forEach(({ hex, type }) => {
      const texture = type === 'enemy' ? 'hex_highlight_enemy' : 'hex_highlight';
  
      const highlight = this.scene.add.image(hex.x, hex.y, texture)
        .setOrigin(0.5)
        .setDepth(1)
        .setDisplaySize(this.spriteSize || 80, this.spriteSize || 80)
        .setAlpha(0.4)
        .setAngle(30)
        .setInteractive();
  
      highlight.on('pointerover', () => highlight.setAlpha(0.6));
      highlight.on('pointerout', () => highlight.setAlpha(0.4));
  
      highlight.on('pointerdown', () => {
        if (!selectedHero) return;
  
        if (type === 'move') {
          this.socket.emit(SOCKET_EVENTS.HERO_MOVE_REQUEST, {
            roomId: this.roomId,
            heroId: selectedHero.id,
            targetLabel: hex.label
          });
        } else if (type === 'enemy') {
          const target = this.gameManager.getHeroByPosition(hex.label);
          if (target) {
            console.log('Atacando inimigo:', target.name);
            this.socket.emit(SOCKET_EVENTS.HERO_ATTACK_REQUEST, {
              roomId: this.roomId,
              heroAttackerId: selectedHero.id,
              heroTargetId: target.id
            });
          }
        }
      });
  
      this.boardContainer.add(highlight);
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
      const gameManager = this.scene.gameManager;
      const turnManager = gameManager.getTurnManager();
      const heroId = hero.id;

      if (!hero || !targetHex){
        console.log('Herói ou hexágono alvo inválido.');
        return;
      } 
    
      if (!turnManager.canMoveHero(heroId)) {
        this.scene.gameUI.showMessage("Este herói não pode se mover.");
        this.clearHighlights();
        this.selectedHero = null;    
        return;
      }
    
      console.log(`Movendo ${hero.name} para ${targetHex.label}`);
    
      const currentHex = this.getHexByLabel(hero.state.position);
      if (currentHex) {
        currentHex.occupied = false;
        delete this.heroes[currentHex.label];
    
        if (!this.heroes[currentHex.label] && currentHex.borderGraphics) {
          currentHex.borderGraphics.clear();
          currentHex.borderGraphics.destroy();
          currentHex.borderGraphics = null;
        }
      }
    
      targetHex.occupied = true;
      targetHex.occupiedBy = hero;
    
      this.heroes[targetHex.label] = hero;
      hero.state.position = targetHex.label;
    
      hero.setPosition(targetHex.x, targetHex.y);
    
      turnManager.markHeroAsMoved(hero.id);
    
      this.clearHighlights();
      this.selectedHero = null;

      gameManager.updateHeroPosition(heroId, targetHex.label);
  }      
        
  getHexByLabel(label) {
    return this.board.find(hex => hex.label === label);
  }
}
