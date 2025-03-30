import Board from '../../core/board.js';
import GameManager from '../../core/game.js';

export default class BoardScene extends Phaser.Scene {
    constructor() {
        super('BoardScene');
        this.selectedHex = null;
        this.highlightedHexes = [];
        this.hexagons = [];
    }

    preload() {
        // Carregar assets se necessário
    }

    create() {
        this.canvas = this.textures.createCanvas('boardCanvas', this.cameras.main.width, this.cameras.main.height);
    
        this.board = new Board(this, 40);  
        this.board.initializeBoard();
        
        this.createHexagons();
        
        this.events.emit('boardReady', this.board);
        
        this.createInteractiveZone();

        this.gameManager = new GameManager(this.board); 
    }
    
    createInteractiveZone() {
        if (this.interactiveZone) {
            this.interactiveZone.off('pointerdown', this.handleHexClick, this);
        }
    
        this.interactiveZone = this.add.zone(0, 0, this.cameras.main.width, this.cameras.main.height);
        this.interactiveZone.setOrigin(0, 0);
        this.interactiveZone.setInteractive();
    
        // Registrar o evento de clique
        this.interactiveZone.on('pointerdown', this.handleHexClick, this);
    }    
    
    createHexagons() {
        // Limpar hexágonos existentes
        this.hexagons.forEach(hex => hex.graphics.destroy());
        this.hexagons = [];
        
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0x000000, 1);
        
        // Criar um único zone para interação com clique
        const interactiveZone = this.add.zone(0, 0, this.cameras.main.width, this.cameras.main.height);
        interactiveZone.setOrigin(0, 0);
        interactiveZone.setInteractive();
        interactiveZone.on('pointerdown', this.handleHexClick, this);
        
        // Renderizar todos os hexágonos no mesmo Graphics
        this.board.board.forEach(hex => {
            const points = this.calculateHexPoints(hex.x, hex.y);
            
            graphics.fillStyle(0xcccccc, 1);
            graphics.beginPath();
            graphics.moveTo(points[0].x, points[0].y);
            
            for (let i = 1; i < points.length; i++) {
                graphics.lineTo(points[i].x, points[i].y);
            }
            
            graphics.closePath();
            graphics.strokePath();
            graphics.fillPath();
            
            // Armazenar os hexágonos na lista
            this.hexagons.push({ hexData: hex, points });
            
            // Adicionar texto do rótulo (opcional)
            this.add.text(hex.x, hex.y, hex.label, {
                fontSize: '16px',
                fill: '#000',
                align: 'center'
            }).setOrigin(0.5);
        });
    }
    
    calculateHexPoints(x, y) {
        const points = [];
        const radius = this.board.hexRadius;
        
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i + Math.PI / 3;
            points.push({
                x: x + radius * Math.cos(angle),
                y: y + radius * Math.sin(angle)
            });
        }
        
        return points;
    }
    
    handleHexClick(pointer, gameObject) {
        if (!gameObject || !gameObject.getData) return;
    
        const hexData = gameObject.getData('hexData');
        if (!hexData) return;
    
        console.log(`Hexágono ${hexData.label} foi clicado`);
    
        this.scene.get('CharacterScene').events.emit('boardClicked', hexData);
    }
            
    selectHex(hexData) {
        this.clearSelection();
        this.selectedHex = hexData;
        
        // Obter hexágonos movíveis
        const movableHexes = this.board.getMovableHexes(hexData);
        this.highlightedHexes = movableHexes.map(h => h.label);
        
        // Destacar hexágonos
        this.updateHexHighlights();
    }
    
    clearSelection() {
        this.selectedHex = null;
        this.highlightedHexes = [];
        this.updateHexHighlights();
    }
    
    updateHexHighlights() {
        const graphics = this.add.graphics();
        graphics.clear();
    
        this.hexagons.forEach(item => {
            const isHighlighted = this.highlightedHexes.includes(item.hexData.label);
            const isSelected = this.selectedHex && this.selectedHex.label === item.hexData.label;
            
            const color = isSelected ? 0x87cefa : isHighlighted ? 0xadd8e6 : 0xcccccc;
            graphics.lineStyle(2, isSelected ? 0x0000ff : 0x000000, 1);
            graphics.fillStyle(color, 1);
            
            graphics.beginPath();
            graphics.moveTo(item.points[0].x, item.points[0].y);
            
            for (let i = 1; i < item.points.length; i++) {
                graphics.lineTo(item.points[i].x, item.points[i].y);
            }
            
            graphics.closePath();
            graphics.strokePath();
            graphics.fillPath();
        });
    }    

    updateCharacterPosition(character, targetHex) {
        this.board.board.forEach(hex => {
            if (hex.label === targetHex.label) {
                hex.occupied = true; // Marcar o hexágono como ocupado
                hex.character = character;
            } else if (hex.character === character) {
                hex.occupied = false; // Liberar o hexágono anterior
                delete hex.character;
            }
        });
    }    
    
    update() {
        // Lógica de atualização, se necessário
    }
}