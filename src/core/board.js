const columns = [6, 7, 6, 7, 6];
const columnLabels = ["A", "B", "C", "D", "E"];

export default class Board {
    constructor(scene, hexRadius = 40) {
        this.scene = scene; // Referência para a cena Phaser
        this.hexRadius = hexRadius;
        this.hexWidth = hexRadius * 2;
        this.hexHeight = Math.sqrt(3) * hexRadius;
        this.columns = columns;
        this.columnLabels = columnLabels;

        this.board = [];
        this.characters = {}; // Armazena os personagens posicionados
    }

    initializeBoard() {
        this.board = [];
        let xOffset = 100; // Posição inicial X do tabuleiro
        let yOffset = 100; // Posição inicial Y do tabuleiro

        for (let col = 0; col < this.columns.length; col++) {
            let currentYOffset = yOffset;
            if (col % 2 !== 0) { 
                currentYOffset += this.hexHeight / 2;
            }

            for (let row = 0; row < this.columns[col]; row++) {
                let label = this.columnLabels[col] + (row + 1);
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

    drawBoard() {
        this.graphics.clear();
        this.graphics.lineStyle(2, 0x000000, 1);

        this.board.forEach(hex => {
            const points = this.calculateHexPoints(hex.x, hex.y);
            
            this.graphics.beginPath();
            this.graphics.moveTo(points[0].x, points[0].y);

            for (let i = 1; i < points.length; i++) {
                this.graphics.lineTo(points[i].x, points[i].y);
            }

            this.graphics.closePath();
            this.graphics.strokePath();
            this.graphics.fillStyle(0xcccccc, 1);
            this.graphics.fillPath();

            // Adiciona texto com o rótulo do hexágono
            this.scene.add.text(hex.x, hex.y, hex.label, {
                fontSize: '14px',
                color: '#000'
            }).setOrigin(0.5);
        });
    }

    calculateHexPoints(x, y) {
        const points = [];
        for (let i = 0; i < 6; i++) {
            const angle = Phaser.Math.DegToRad(60 * i);
            points.push({
                x: x + this.hexRadius * Math.cos(angle),
                y: y + this.hexRadius * Math.sin(angle)
            });
        }
        return points;
    }

    getHexByLabel(label) {
        return this.board.find(hex => hex.label === label);
    }

    placeCharacter(character, position) {
        const hex = this.getHexByLabel(position);
    
        if (!hex) {
            console.warn(`Hexágono inválido: ${position}`);
            return;
        }
    
        if (hex.occupied) {
            console.warn(`Hexágono ${position} já está ocupado.`);
            return;
        }
    
        if (!this.scene || !this.scene.add) {  // Verifica se a cena foi inicializada
            console.error("A cena Phaser não está definida ou não foi inicializada corretamente.");
            return;
        }
    
        if (!character) {
            console.error("O personagem é undefined. Verifique a inicialização.");
            return;
        }
    
        hex.occupied = true;
        this.characters[position] = character;
        character.state.position = position;
    
        console.log(`Renderizando personagem ${character.name} no hexágono ${position}`);
    
        // Renderiza o personagem usando gráficos Phaser
        const graphics = this.scene.add.graphics(); // Certifique-se que a cena Phaser foi inicializada
        graphics.fillStyle(character.color || 0x6666ff, 1); // Cor do personagem
        graphics.fillCircle(hex.x, hex.y, 20); // Desenha o círculo do personagem
    
        // Salva o objeto Graphics como "sprite" do personagem para futuras referências
        character.sprite = graphics;
    
        // Adiciona um texto acima do círculo com o nome do personagem
        this.scene.add.text(hex.x, hex.y - 30, character.name || 'Personagem', {
            fontSize: '12px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }     

    getCharacterAt(position) {
        return this.characters[position] || null;
    }
}
