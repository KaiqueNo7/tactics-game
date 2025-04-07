import Board from '../../core/board.js';
import GameManager from '../../core/game.js';
import UIManager from '../../ui/hud.js';

export default class BoardScene extends Phaser.Scene {
    constructor() {
        super('BoardScene');
        this.selectedHex = null;
        this.highlightedHexes = [];
        this.hexagons = [];
    }

    preload() {
        this.load.spritesheet('heroes', 'assets/sprites/heroes.png', {
            frameWidth: 59,
            frameHeight: 64
        });        
        this.load.image('hexagon', 'assets/sprites/hexagon.png');
    }

    create() {
        this.uiManager = new UIManager(this);

        this.canvas = this.textures.createCanvas('boardCanvas', this.cameras.main.width, this.cameras.main.height);
        
        this.board = new Board(this, 45);  
        this.board.initializeBoard();
        
        this.createHexagons();
        
        this.createInteractiveZone();

        this.gameManager = new GameManager(this, this.board); 
        this.game.gameManager = this.gameManager;

        const turnManager = this.game.gameManager.getTurnManager();

        this.createEndTurnButton(turnManager);
        this.uiManager.updateTurnPanel(turnManager.currentTurn.player, turnManager.currentTurn.roundNumber);
        this.uiManager.updategamePanel(turnManager.players);
    }

    createEndTurnButton(turnManager) {
        const buttonText = this.add.text(this.cameras.main.width - 150, 20, 'Próximo Turno', {
            fontFamily: 'Arial',
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#ccc',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();
    
        buttonText.on('pointerover', () => {
            buttonText.setStyle({ fill: '#ffcc00' });
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
        this.hexagons.forEach(hex => {
            if (hex.image) {
                hex.image.destroy();
            }
        });
        this.hexagons = [];
    
        this.board.board.forEach(hex => {
            const image = this.add.image(hex.x, hex.y, 'hexagon')
                .setOrigin(0.5)
                .setDisplaySize(this.board.hexRadius * 2.3, this.board.hexRadius * 2.3)
                .setAngle(30)
                .setInteractive();
    
            image.setData('hexData', hex);
    
            this.hexagons.push({ hexData: hex, image });
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
        if(!hexData) {
            console.log('Clique fora do hexágono');
            return;
        } 
    
        console.log(`Hexágono ${hexData.label} foi clicado`);
    
        this.scene.get('heroscene').events.emit('boardClicked', hexData);
    }  
    
    update() {
        // Lógica de atualização, se necessário
    }
}