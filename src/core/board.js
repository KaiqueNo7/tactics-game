const columns = [6, 7, 6, 7, 6]; // Quantidade de hexágonos por coluna
const columnLabels = ["A", "B", "C", "D", "E"]; // Rótulos das colunas

export class Board {
    constructor(canvas, hexRadius = 40) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.hexRadius = hexRadius;
        this.hexWidth = hexRadius * 2;
        this.hexHeight = Math.sqrt(3) * hexRadius;
        this.columns = columns;
        this.columnLabels = columnLabels;

        this.boardWidth = (this.columns.length - 1) * (this.hexWidth * 0.75) + this.hexWidth;
        this.boardHeight = Math.max(...this.columns) * this.hexHeight;

        this.startX = (canvas.width - this.boardWidth) / 2;
        this.startY = (canvas.height - this.boardHeight) / 2;

        this.board = [];
        this.highlightedHexes = [];
    }

    initializeBoard() {
        this.board = [];
        let xOffset = this.startX;
        for (let col = 0; col < this.columns.length; col++) {
            let yOffset = this.startY;
            if (col % 2 !== 0) { 
                yOffset -= this.hexHeight / 2;
            }
            for (let row = 0; row < this.columns[col]; row++) {
                let label = this.columnLabels[col] + (row + 1);
                let hex = { 
                    x: xOffset, 
                    y: yOffset, 
                    occupied: false, 
                    label: label, 
                    col, 
                    row 
                };
                this.board.push(hex);
                yOffset += this.hexHeight;
            }
            xOffset += this.hexWidth * 0.75;
        }
        return this.board;
    }

    getHexByLabel(label) {
        return this.board.find(hex => hex.label === label);
    }

    isWithinBoard(hex) {
        return hex.col >= 0 && hex.col < this.columns.length && 
               hex.row >= 0 && hex.row < this.columns[hex.col];
    }

    getMovableHexes(hex, moveRange = 2) {
        return this.board.filter(h => {
            if (h.occupied || h.label === hex.label) return false;
            
            let colDiff = Math.abs(h.col - hex.col);
            let rowDiff = Math.abs(h.row - hex.row);
            
            let distance;
            if (colDiff === 0) {
                distance = rowDiff;
            } else if (colDiff === 1) {
                if (hex.col % 2 === 0) { 
                    distance = (h.row >= hex.row) ? rowDiff : rowDiff + 1;
                } else { 
                    distance = (h.row <= hex.row) ? rowDiff : rowDiff + 1;
                }
            } else {
                distance = colDiff + rowDiff;
            }
            
            return distance <= moveRange;
        });
    }
}