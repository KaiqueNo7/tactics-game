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
        // Carregar assets, se necessário
    }

    create() {
        this.canvas = this.textures.createCanvas('boardCanvas', this.cameras.main.width, this.cameras.main.height);
    
        this.board = new Board(this, 40);  
        this.board.initializeBoard();
        
        this.createHexagons();
        
        this.events.emit('boardReady', this.board);
        
        this.createInteractiveZone();

        this.gameManager = new GameManager(this, this.board); 
        this.game.gameManager = this.gameManager;

        const turnManager = this.game.gameManager.getTurnManager();

        this.createEndTurnButton(turnManager);
    }

    createEndTurnButton(turnManager) {
        const buttonText = this.add.text(this.cameras.main.width - 150, 20, 'Encerrar Turno', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#ff0000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();
    
        buttonText.on('pointerover', () => {
            buttonText.setStyle({ fill: '#ffcc00' });  // Mudar a cor do texto quando o mouse está sobre ele
        });
    
        buttonText.on('pointerout', () => {
            buttonText.setStyle({ fill: '#ffffff' });
        });
    
        buttonText.on('pointerdown', () => {
            turnManager.nextTurn();
        });
    }
    
    createInteractiveZone() {
        if (this.interactiveZone) {
            this.interactiveZone.off('pointerdown', this.handleHexClick, this);
        }
    
        this.interactiveZone = this.add.zone(0, 0, this.cameras.main.width, this.cameras.main.height);
        this.interactiveZone.setOrigin(0, 0);
        this.interactiveZone.setInteractive();
    
        this.interactiveZone.on('pointerdown', this.handleHexClick, this);
    }    
    
    createHexagons() {
        this.hexagons.forEach(hex => hex.graphics.destroy());
        this.hexagons = [];
        
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0x000000, 1);
        
        const interactiveZone = this.add.zone(0, 0, this.cameras.main.width, this.cameras.main.height);
        interactiveZone.setOrigin(0, 0);
        interactiveZone.setInteractive();
        interactiveZone.on('pointerdown', this.handleHexClick, this);
        
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
            
            this.hexagons.push({ hexData: hex, points });
            
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
    
    update() {
        // Lógica de atualização, se necessário
    }
}