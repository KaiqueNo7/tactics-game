import { Board } from './board.js';
import { BoardRenderer } from '../ui/render.js';

export class GameController {
    constructor(canvas) {
        this.canvas = canvas;
        this.board = new Board(canvas);
        this.renderer = new BoardRenderer(this.board, canvas);
        this.selectedCharacter = null;
        this.highlightedHexes = [];
        this.players = [];

        this.setupEventListeners();
    }

    init() {
        this.board.initializeBoard();
        this.renderer.drawBoard();
    }

    setupEventListeners() {
        this.canvas.addEventListener("click", (event) => this.handleCanvasClick(event));
    }

    handleCanvasClick(event) {
        const clickX = event.offsetX;
        const clickY = event.offsetY;
        const clickedHex = this.board.board.find(hex => 
            Math.hypot(hex.x - clickX, hex.y - clickY) < this.board.hexRadius
        );
        
        if (clickedHex) {
            if (this.selectedCharacter && this.highlightedHexes.includes(clickedHex.label)) {
                this.moveCharacter(clickedHex);
            } else if (clickedHex.occupied) {
                this.selectCharacter(clickedHex);
            }
        }
    }

    selectCharacter(hex) {
        // Lógica para selecionar personagem
        const character = this.findCharacterAtHex(hex);
        if (character) {
            this.selectedCharacter = character;
            this.highlightedHexes = this.board.getMovableHexes(hex).map(h => h.label);
            this.renderer.drawBoard(this.highlightedHexes);
        }
    }

    moveCharacter(targetHex) {
        if (this.selectedCharacter) {
            // Lógica de movimento do personagem
            this.selectedCharacter.position = targetHex.label;
            this.selectedCharacter = null;
            this.highlightedHexes = [];
            this.renderer.drawBoard();
        }
    }

    findCharacterAtHex(hex) {
        // Encontra personagem na posição do hexágono
        for (let player of this.players) {
            const character = player.characters.find(c => c.position === hex.label);
            if (character) return character;
        }
        return null;
    }

    addPlayer(player) {
        this.players.push(player);
    }
}