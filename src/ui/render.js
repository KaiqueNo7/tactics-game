export class BoardRenderer {
    constructor(board, canvas) {
        this.board = board;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    }

    drawHexagon(x, y, label, highlight = false) {
        const hexRadius = this.board.hexRadius;
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            let angle = (Math.PI / 3) * i + Math.PI / 3;
            let xOffset = x + hexRadius * Math.cos(angle);
            let yOffset = y + hexRadius * Math.sin(angle);
            this.ctx.lineTo(xOffset, yOffset);
        }
        this.ctx.closePath();
        this.ctx.strokeStyle = highlight ? "blue" : "black";
        this.ctx.lineWidth = highlight ? 3 : 1;
        this.ctx.stroke();
        this.ctx.fillStyle = highlight ? "lightblue" : "#ccc";
        this.ctx.fill();
        
        // Adicionar rótulo
        this.ctx.fillStyle = "black";
        this.ctx.font = "16px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText(label, x, y + 5);
    }

    drawCharacter(x, y, color = "red") {
        const hexRadius = this.board.hexRadius;
        this.ctx.beginPath();
        this.ctx.arc(x, y, hexRadius / 3, 0, 2 * Math.PI);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawBoard(highlightedHexes = []) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.board.board.forEach(hex => {
            this.drawHexagon(hex.x, hex.y, hex.label, highlightedHexes.includes(hex.label));
        });
    }

    drawheros(heros) {
        this.board.board.forEach(hex => hex.occupied = false);

        heros.forEach(character => {
            if (character.position) {
                const hex = this.board.getHexByLabel(character.position);
                if (hex) {
                    hex.occupied = true;
                    this.drawCharacter(hex.x, hex.y, character.color);
                }
            }
        });
    }
}