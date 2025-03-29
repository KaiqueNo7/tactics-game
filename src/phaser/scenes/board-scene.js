import { Board } from '../../core/board.js';

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
        // Criar o canvas virtual para o Board
        this.canvas = this.textures.createCanvas('boardCanvas', this.cameras.main.width, this.cameras.main.height);
        
        // Inicializar o Board do core
        this.board = new Board(this.canvas.canvas, 40);
        this.board.initializeBoard();
        
        // Renderizar hexágonos no Phaser
        this.createHexagons();
        
        // Comunicar com a cena de personagens
        this.events.emit('boardReady', this.board);
        
        // Permitir que esta cena receba input
        this.input.on('gameobjectdown', this.handleHexClick, this);
    }
    
    createHexagons() {
        // Limpar hexágonos existentes
        this.hexagons.forEach(hex => hex.destroy());
        this.hexagons = [];
        
        // Criar novos hexágonos baseados no board
        this.board.board.forEach(hex => {
            const points = this.calculateHexPoints(hex.x, hex.y);
            
            // Criar o polígono do hexágono
            const graphics = this.add.graphics();
            graphics.lineStyle(2, 0x000000, 1);
            graphics.fillStyle(0xcccccc, 1);
            
            // Desenhar o hexágono
            graphics.beginPath();
            graphics.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                graphics.lineTo(points[i].x, points[i].y);
            }
            graphics.closePath();
            graphics.strokePath();
            graphics.fillPath();
            
            // Adicionar texto do rótulo
            const text = this.add.text(hex.x, hex.y, hex.label, {
                fontSize: '16px',
                fill: '#000',
                align: 'center'
            }).setOrigin(0.5);
            
            // Criar um objeto interativo para o hexágono
            const hitArea = new Phaser.Geom.Polygon(points);
            const hexInteractive = this.add.zone(0, 0, this.cameras.main.width, this.cameras.main.height)
                .setInteractive(hitArea, Phaser.Geom.Polygon.Contains);
            
            // Armazenar dados do hexágono no objeto interativo
            hexInteractive.setData('hexData', hex);
            
            // Adicionar evento de clique
            hexInteractive.on('pointerdown', () => {
                this.handleHexClick(null, hexInteractive);
            });
            
            // Agrupar gráficos e interatividade
            this.hexagons.push({
                graphics,
                text,
                interactive: hexInteractive,
                hexData: hex
            });
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
        
        // Emitir evento para outras cenas
        this.events.emit('hexClicked', hexData);
        
        // Selecionar ou mover, dependendo do contexto
        if (this.selectedHex) {
            if (this.highlightedHexes.includes(hexData.label)) {
                // Mover para hexágono válido
                this.events.emit('moveTo', this.selectedHex, hexData);
                this.clearSelection();
            } else if (hexData.occupied) {
                // Selecionar outro hexágono
                this.selectHex(hexData);
            }
        } else if (hexData.occupied) {
            // Selecionar hexágono com personagem
            this.selectHex(hexData);
        }
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
        this.hexagons.forEach(item => {
            const isHighlighted = this.highlightedHexes.includes(item.hexData.label);
            const isSelected = this.selectedHex && this.selectedHex.label === item.hexData.label;
            
            // Atualizar aparência
            item.graphics.clear();
            item.graphics.lineStyle(2, isSelected ? 0x0000ff : 0x000000, 1);
            item.graphics.fillStyle(isHighlighted ? 0xadd8e6 : isSelected ? 0x87cefa : 0xcccccc, 1);
            
            // Redesenhar hexágono
            const points = this.calculateHexPoints(item.hexData.x, item.hexData.y);
            item.graphics.beginPath();
            item.graphics.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                item.graphics.lineTo(points[i].x, points[i].y);
            }
            item.graphics.closePath();
            item.graphics.strokePath();
            item.graphics.fillPath();
        });
    }
    
    update() {
        // Lógica de atualização, se necessário
    }
}