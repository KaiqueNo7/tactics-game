import TurnManager from './turn-manager.js';
import Player from '../characters/player.js';
import { warrior1, archer1, mage1, warrior2, archer2, mage2 } from '../characters/characters.js';

console.log('Personagens Importados:', warrior1, archer1, mage1, warrior2, archer2, mage2);

export default class GameManager {
    constructor(board) {  
        this.board = board; 
        console.log('GameManager Board:', this.board);

        // Cria jogadores e associa personagens
        this.player1 = new Player("Jogador 1", [warrior1, archer1, mage1]);
        this.player2 = new Player("Jogador 2", [warrior2, archer2, mage2]);

        console.log('Personagens do Jogador 1:', this.player1.characters);
        console.log('Personagens do Jogador 2:', this.player2.characters);

        // Inicializa o TurnManager e armazena como parte do GameManager
        this.turnManager = new TurnManager([this.player1, this.player2]);
        this.currentTurn = this.turnManager.currentTurn;        

        // Define posições iniciais dos personagens
        this.setupInitialPositions();
    }
    
    setupInitialPositions() {
        if (!this.board) {
            console.error("Board não foi inicializado corretamente!");
            return;
        }

        console.log('Definindo posições iniciais dos personagens...');

        if (!this.player1.characters || !this.player2.characters) {
            console.error('Personagens não foram carregados corretamente.');
            return;
        }

        this.player1.characters[0].state.position = 'A1';
        this.player1.characters[1].state.position = 'B2';
        this.player1.characters[2].state.position = 'C1';
        
        this.player2.characters[0].state.position = 'E6';
        this.player2.characters[1].state.position = 'D5';
        this.player2.characters[2].state.position = 'E4';

        this.player1.characters.forEach(character => this.board.placeCharacter(character, character.state.position));
        this.player2.characters.forEach(character => this.board.placeCharacter(character, character.state.position));
    }

    getTurnManager() {
        return this.turnManager;
    }
}
