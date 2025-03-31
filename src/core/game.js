import TurnManager from './turn-manager.js';
import Player from '../characters/player.js';
import CharacterFactory from '../characters/character-factory.js';

export default class GameManager extends Phaser.GameObjects.Container {
    constructor(scene, board) {  
        super(scene);
        this.scene = scene;
        this.board = board; 

        this.scene.add.existing(this);

        const warrior1 = CharacterFactory.createWarrior(scene, "Guerreiro 1", 0x1E90FF);
        const archer1 = CharacterFactory.createArcher(scene, "Arqueiro 1", 0x32CD32);
        const mage1 = CharacterFactory.createMage(scene, "Mago 1", 0x4B0082);

        const warrior2 = CharacterFactory.createWarrior(scene, "Guerreiro 2", 0xDC143C);
        const archer2 = CharacterFactory.createArcher(scene, "Arqueiro 2", 0xFFD700);
        const mage2 = CharacterFactory.createMage(scene, "Mago 2", 0xFF4500);

        this.player1 = new Player("Jogador 1", [warrior1, archer1, mage1]);
        this.player2 = new Player("Jogador 2", [warrior2, archer2, mage2]);

        this.turnManager = new TurnManager(this.scene, [this.player1, this.player2]);
        this.currentTurn = this.turnManager.currentTurn;   

        this.setupInitialPositions();

        this.add([...this.player1.characters, ...this.player2.characters]);
    }
    
    setupInitialPositions() {
        this.player1.characters[0].state.position = 'A1';
        this.player1.characters[1].state.position = 'B1';
        this.player1.characters[2].state.position = 'C1';
        
        this.player2.characters[0].state.position = 'E7';
        this.player2.characters[1].state.position = 'D7';
        this.player2.characters[2].state.position = 'C7';

        this.player1.color = 0x0000ff;
        this.player2.color = 0xff0000;

        this.player1.characters.forEach(character => this.board.placeCharacter(
            character, 
            character.state.position, 
            this.player1.color
        ));

        this.player2.characters.forEach(character => this.board.placeCharacter(
            character, 
            character.state.position, 
            this.player2.color
        ));
   }

    getTurnManager() {
        return this.turnManager;
    }
}
