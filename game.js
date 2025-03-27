const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 500;
canvas.height = 700;

const hexRadius = 40; // Raio do hexágono
const hexWidth = hexRadius * 2;
const hexHeight = Math.sqrt(3) * hexRadius;

const columns = [6, 7, 6, 7, 6]; // Quantidade de hexágonos por coluna
const columnLabels = ["A", "B", "C", "D", "E"]; // Rótulos das colunas

const boardWidth = (columns.length - 1) * (hexWidth * 0.75) + hexWidth;
const boardHeight = Math.max(...columns) * hexHeight;

const startX = (canvas.width - boardWidth) / 2;
const startY = (canvas.height - boardHeight) / 2;

let board = [];
let selectedCharacter = null;
let moveRange = 2;
let highlightedHexes = [];

function drawHexagon(x, y, label, highlight = false) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        let angle = (Math.PI / 3) * i + Math.PI / 3;
        let xOffset = x + hexRadius * Math.cos(angle);
        let yOffset = y + hexRadius * Math.sin(angle);
        ctx.lineTo(xOffset, yOffset);
    }
    ctx.closePath();
    ctx.strokeStyle = highlight ? "blue" : "black";
    ctx.lineWidth = highlight ? 3 : 1;
    ctx.stroke();
    ctx.fillStyle = highlight ? "lightblue" : "#ccc";
    ctx.fill();
    
    // Adicionar rótulo
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(label, x, y + 5);
}

function drawCharacter(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, hexRadius / 3, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.stroke();
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let xOffset = startX;
    for (let col = 0; col < columns.length; col++) {
        let yOffset = startY;
        if (col % 2 !== 0) { 
            yOffset -= hexHeight / 2; // Eleva a segunda e a quarta coluna
        }
        for (let row = 0; row < columns[col]; row++) {
            let label = columnLabels[col] + (row + 1);
            let hex = { x: xOffset, y: yOffset, occupied: false, label: label, col, row };
            board.push(hex);
            drawHexagon(xOffset, yOffset, label, highlightedHexes.includes(label));
            yOffset += hexHeight;
        }
        xOffset += hexWidth * 0.75;
    }

    // Agora que o tabuleiro foi desenhado, desenha os personagens nas posições ocupadas
    board.forEach(hex => {
        if (hex.occupied) {
            console.log(`Hex ${hex.label} is occupied`); // Verifique se o personagem está sendo desenhado
            drawCharacter(hex.x, hex.y);
        }
    });
}

function getMovableHexes(hex) {
    return board.filter(h => {
        if (h.occupied || h.label === hex.label) return false;
        
        let colDiff = Math.abs(h.col - hex.col);
        let rowDiff = Math.abs(h.row - hex.row);
        
        // Distância para grid offset
        let distance;
        if (colDiff === 0) {
            distance = rowDiff;
        } else if (colDiff === 1) {
            // Ajuste para colunas offset
            if (hex.col % 2 === 0) { // Coluna par
                distance = (h.row >= hex.row) ? rowDiff : rowDiff + 1;
            } else { // Coluna ímpar
                distance = (h.row <= hex.row) ? rowDiff : rowDiff + 1;
            }
        } else if (colDiff === 2) {
            distance = rowDiff <= 1 ? 2 : 3;
        } else {
            distance = colDiff + rowDiff; // Para distâncias maiores
        }
        
        return distance <= moveRange;
    });
}


function highlightMovableHexes(hex) {
    highlightedHexes = getMovableHexes(hex).map(h => h.label);
    drawBoard();
}

function placeCharacter(label) {
    // Verifique se o label está correto
    console.log(`Placing character at ${label}`);
    let hex = board.find(h => h.label === label);
    if (hex && !hex.occupied) { // Adiciona a condição de que a casa não pode estar ocupada
        hex.occupied = true;
        selectedCharacter = hex;
        drawBoard(); // Redesenha o tabuleiro com o personagem colocado
    }
}

canvas.addEventListener("click", function(event) {
    let clickX = event.offsetX;
    let clickY = event.offsetY;
    let clickedHex = board.find(hex => Math.hypot(hex.x - clickX, hex.y - clickY) < hexRadius);
    
    if (clickedHex) {
        if (selectedCharacter && highlightedHexes.includes(clickedHex.label)) {
            selectedCharacter.occupied = false;
            clickedHex.occupied = true;
            selectedCharacter = clickedHex;
            highlightedHexes = [];
            drawBoard();
        } else if (clickedHex.occupied) {
            selectedCharacter = clickedHex;
            highlightMovableHexes(clickedHex);
        }
    }
});

drawBoard();
placeCharacter("A1");
