import { warrior1, archer1, mage1, warrior2, archer2, mage2 } from '../../characters/characters.js';

export default class CharacterScene extends Phaser.Scene {
  constructor() {
      super('CharacterScene');
      this.characters = [];
      this.selectedCharacter = null;
      this.movableHexes = [];
  }

  preload() {
      // Load character assets
      this.load.atlas('characters', 'assets/characters/characters.png', 'assets/characters/characters.json');
      this.load.image('selection-indicator', 'assets/ui/selection.png');
  }

  create() {
    // Initialize characters
    this.initializeCharacters();
    
    // Communication with the board scene
    this.boardScene = this.scene.get('BoardScene');

    this.createEndTurnButton();
    
    // Remover listener anterior, se existir
    this.events.off('boardClicked', this.handleBoardClick, this);
    
    // Listen for board click events
    this.events.on('boardClicked', this.handleBoardClick, this);
    
    // Create selection indicator
    this.selectionIndicator = this.add.image(0, 0, 'selection-indicator').setVisible(false);
    
    // Listen for turn change events
    this.events.off('turnChanged', this.handleTurnChange, this);
    this.events.on('turnChanged', this.handleTurnChange, this);
}

    createEndTurnButton() {
        const gameManager = this.game.turnManager; // Agora você acessa o TurnManager global do jogo

        this.endTurnButton = this.add.text(700, 550, 'Finalizar Turno', {
            fontSize: '20px',
            fill: '#ff0000',
            backgroundColor: '#ffffff',
            padding: { x: 10, y: 5 }
        })
        .setInteractive()
        .on('pointerdown', () => {
            const turnEnded = gameManager.endTurn();

            if (!turnEnded) {
                console.log('Você precisa mover um personagem antes de finalizar o turno.');
            }
        });
    }

  initializeCharacters() {
      // Use the character instances from characters.js instead of creating new ones
      this.characters = [
          warrior1, archer1, mage1,  // Player 1 characters
          warrior2, archer2, mage2   // Player 2 characters
      ];
      
      // Create sprite representations for each character
      this.characters.forEach(character => {
          this.createCharacterSprite(character);
      });
  }

  createCharacterSprite(character) {
      // Get hex position from the board scene
      const hexPosition = this.boardScene.getHexByLabel(character.state.position);
      
      if (!hexPosition) return;
      
      // Create character sprite
      const sprite = this.add.image(
            hexPosition.x, 
            hexPosition.y, 
            'characters'
        ).setOrigin(0.5);
    
      
      // Set sprite properties
      sprite.setTint(this.getColorValue(character.color));
      sprite.setScale(0.75);
      
      // Store sprite reference in character object
      character.sprite = sprite;
      
      // Create health bar
      this.createHealthBar(character, hexPosition);
  }
  
  getCharacterFrame(character) {
      // Determine the appropriate character frame based on character type
      if (character.name.includes('Guerreiro')) return 'warrior';
      if (character.name.includes('Arqueiro')) return 'archer';
      if (character.name.includes('Mago')) return 'mage';
      return 'warrior'; // Default frame
  }
  
  getColorValue(colorName) {
      // Convert color string to hex value
      const colorMap = {
          'darkblue': 0x00008B,
          'royalblue': 0x4169E1,
          'lightblue': 0xADD8E6,
          'darkred': 0x8B0000,
          'crimson': 0xDC143C,
          'lightcoral': 0xF08080
      };
      
      return colorMap[colorName] || 0xFFFFFF;
  }
  
  createHealthBar(character, hexPosition) {
      const barWidth = 40;
      const barHeight = 6;
      
      // Background bar
      const bgBar = this.add.rectangle(
          hexPosition.x, 
          hexPosition.y + 25, 
          barWidth, 
          barHeight, 
          0x000000
      );
      
      // Health bar
      const healthBar = this.add.rectangle(
          hexPosition.x - barWidth/2, 
          hexPosition.y + 25, 
          barWidth * (character.stats.currentHealth / character.stats.maxHealth), 
          barHeight, 
          0x00FF00
      );
      
      healthBar.setOrigin(0, 0.5);
      
      // Store references
      character.healthBar = healthBar;
      character.healthBarBg = bgBar;
  }

    handleBoardClick(hexData) {
        if (this.selectedCharacter && this.movableHexes.includes(hexData.label)) {
            this.moveCharacter(this.selectedCharacter, hexData);
        } else {
            const character = this.findCharacterAtHex(hexData.label);
            
            if (character) {
                this.selectCharacter(character);
            } else {
                this.clearSelection();
            }
        }
    }
  
  findCharacterAtHex(hexLabel) {
      return this.characters.find(char => char.state.position === hexLabel);
  }
  
  selectCharacter(character) {
      const currentPlayer = this.scene.get('GameScene').turnManager.currentTurn.player;
      const isCurrentPlayerCharacter = currentPlayer.characters.includes(character);
      
      if (!isCurrentPlayerCharacter) return;

        if (currentPlayer.hasMoved) {
            console.log('Você já moveu um personagem neste turno.');
            return;
        }
      
        this.selectedCharacter = character;
        this.selectionIndicator.setPosition(character.sprite.x, character.sprite.y);
        this.selectionIndicator.setVisible(true);
      
        const characterHex = this.boardScene.getHexByLabel(character.state.position);
        const moveRange = character.getMovementRange();
        this.movableHexes = this.boardScene.getMovableHexes(characterHex, moveRange)
            .map(hex => hex.label);
    
        this.boardScene.highlightHexes(this.movableHexes);
  }
  
  clearSelection() {
      this.selectedCharacter = null;
      this.selectionIndicator.setVisible(false);
      this.movableHexes = [];
      this.boardScene.clearHighlights();
      this.events.emit('characterSelected', null);
  }
  
  moveCharacter(character, targetHex) {
    const gameManager = this.scene.get('GameScene').turnManager;
    const currentPlayer = gameManager.currentTurn.player;

    if (gameManager.currentTurn.hasMoved) {
        console.log('Você já moveu um personagem neste turno.');
        return;
    }

    character.state.position = targetHex.label;
    this.tweens.add({
        targets: character.sprite,
        x: targetHex.x,
        y: targetHex.y,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
            this.boardScene.updateCharacterPosition(character, targetHex);
            this.clearSelection();

            // Marca que o jogador atual já fez sua jogada
            gameManager.currentTurn.hasMoved = true;
        }
    });
}
 
  checkCombatOpportunities(character) {
      // Get adjacent hexes
      const currentHex = this.boardScene.getHexByLabel(character.state.position);
      const adjacentHexes = this.boardScene.getAdjacentHexes(currentHex);
      
      // Check for enemies in adjacent hexes
      const currentPlayer = this.scene.get('GameScene').turnManager.currentTurn.player;
      const enemies = this.characters.filter(char => 
          !currentPlayer.characters.includes(char) && 
          adjacentHexes.some(hex => hex.label === char.state.position)
      );
      
      if (enemies.length > 0) {
          // Emit event to handle combat options
          this.events.emit('combatOpportunity', { attacker: character, targets: enemies });
      }
  }
  
  handleTurnChange(turnData) {
      // Clear any selections when turn changes
      this.clearSelection();
      
      // You could add visual indicators for whose turn it is
      // For example, highlight current player's characters
      const currentPlayer = turnData.player;
      
      this.characters.forEach(character => {
          const isCurrentPlayerCharacter = currentPlayer.characters.includes(character);
          
          if (character.sprite) {
              character.sprite.setAlpha(isCurrentPlayerCharacter ? 1 : 0.7);
          }
      });
  }
  
  updateHealthBars() {
      // Update all health bars to reflect current health
      this.characters.forEach(character => {
          if (character.healthBar) {
              const healthPercent = character.stats.currentHealth / character.stats.maxHealth;
              character.healthBar.width = 40 * healthPercent;
              
              // Change color based on health percentage
              if (healthPercent > 0.6) {
                  character.healthBar.fillColor = 0x00FF00; // Green
              } else if (healthPercent > 0.3) {
                  character.healthBar.fillColor = 0xFFFF00; // Yellow
              } else {
                  character.healthBar.fillColor = 0xFF0000; // Red
              }
          }
      });
  }

  update() {
      // Update health bars
      this.updateHealthBars();
      
      // Update character states based on their abilities
      this.characters.forEach(character => {
          if (character.state.isAlive) {
              // Apply passive abilities
              character.abilities.passive.forEach(ability => {
                  if (typeof ability.effect === 'function') {
                      ability.effect(character);
                  }
              });
          }
      });
  }
}