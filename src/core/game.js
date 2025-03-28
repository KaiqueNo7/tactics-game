import { Board } from './board-logic.js';
import { BoardRenderer } from '../ui/render.js';
import { TurnManager, Player } from './turn-manager.js';
import { DebugHUD } from '../ui/hud.js';
import { warrior1, warrior2, archer1, archer2, mage1, mage2 } from '../characters/characters.js';

export class GameController {
    constructor(canvas) {
        this.canvas = canvas;
        this.board = new Board(canvas);
        this.renderer = new BoardRenderer(this.board, canvas);
        this.selectedCharacter = null;
        this.highlightedHexes = [];

        // Criar jogadores com personagens
        const player1 = new Player("Jogador 1", [warrior1, archer1, mage1]);
        const player2 = new Player("Jogador 2", [warrior2, archer2, mage2]);
        
        // Definir posições iniciais para os personagens
        this.setupInitialPositions(player1, player2);

        this.turnManager = new TurnManager([player1, player2]);
        this.currentPlayer = this.turnManager.getCurrentCharacter();

        // Adicionar HUD de depuração
        this.debugHUD = new DebugHUD(canvas, this);

        // Configurar event listeners
        this.setupEventListeners();
    }

    // Adicionar o método setupInitialPositions
    setupInitialPositions(player1, player2) {
        // Posições de início para os personagens do jogador 1
        player1.characters[0].position = 'A1';
        player1.characters[1].position = 'B2';
        player1.characters[2].position = 'C1';

        // Posições de início para os personagens do jogador 2
        player2.characters[0].position = 'E6';
        player2.characters[1].position = 'D5';
        player2.characters[2].position = 'E4';
    }

    // Adicionar método setupEventListeners
    setupEventListeners() {
        this.canvas.addEventListener("click", (event) => this.handleCanvasClick(event));
        
        // Adicionar tecla de espaço para passar turno
        window.addEventListener("keydown", (event) => {
            if (event.code === "Space") {
                this.passTurn();
            }
        });
    }

    // Método para passar turno
    passTurn() {
        this.currentPlayer = this.turnManager.nextTurn();
        // Atualizar UI para mostrar turno atual
        this.renderer.drawBoard();
        this.renderer.drawCharacters([
            ...this.turnManager.players[0].characters, 
            ...this.turnManager.players[1].characters
        ]);
        this.debugHUD.update();
    }

    init() {
        this.board.initializeBoard();
        this.renderer.drawBoard();
        this.renderer.drawCharacters([
            ...this.turnManager.players[0].characters, 
            ...this.turnManager.players[1].characters
        ]);
        this.debugHUD.update();
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

    // Método de movimento de personagem
    moveCharacter(targetHex) {
        if (this.selectedCharacter) {
            // Lógica de movimento do personagem
            this.selectedCharacter.position = targetHex.label;
            this.selectedCharacter = null;
            this.highlightedHexes = [];
            this.renderer.drawBoard();
            this.renderer.drawCharacters([
                ...this.turnManager.players[0].characters, 
                ...this.turnManager.players[1].characters
            ]);
            this.debugHUD.update();
        }
    }

    // Método de seleção de personagem
    selectCharacter(hex) {
        const character = this.findCharacterAtHex(hex);
        if (character) {
            this.selectedCharacter = character;
            this.highlightedHexes = this.board.getMovableHexes(hex).map(h => h.label);
            this.renderer.drawBoard(this.highlightedHexes);
        }
    }

    // Método para encontrar personagem no hexágono
    findCharacterAtHex(hex) {
        for (let player of this.turnManager.players) {
            const character = player.characters.find(c => c.position === hex.label);
            if (character) return character;
        }
        return null;
    }
}

// Inicialização do jogo
window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    const gameController = new GameController(canvas);
    gameController.init();
});