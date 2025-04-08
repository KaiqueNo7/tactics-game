import TurnManager from './turn-manager.js';
import Player from './player.js';
import { GoldNugget, SnakeLady, BasicShooter, IronFist, ForestSpirit, GiantBlade } from '../heroes/heroes.js';

export default class GameManager extends Phaser.GameObjects.Container {
    constructor(scene, board) {  
        super(scene);
        this.scene = scene;
        this.board = board; 

        const hero1 = new GoldNugget(this.scene, 100, 100);
        const hero2 = new SnakeLady(this.scene, 200, 100);
        const hero3 = new BasicShooter(this.scene, 300, 100);
        const hero4 = new IronFist(this.scene, 100, 300);
        const hero5 = new ForestSpirit(this.scene, 200, 300);
        const hero6 = new GiantBlade(this.scene, 300, 300);

        this.player1 = new Player("Jogador 1", [hero1, hero2, hero3]);
        this.player2 = new Player("Jogador 2", [hero4, hero5, hero6]);        

        this.turnManager = new TurnManager(this.scene, [this.player1, this.player2]);
        this.currentTurn = this.turnManager.currentTurn;   

        this.setupInitialPositions();

        this.add([...this.player1.heros, ...this.player2.heros]);

        this.turnManager.triggerStartOfTurnSkills(this.turnManager.players);
    }
    
    setupInitialPositions() {
        this.player1.heros[0].state.position = 'D1';
        this.player1.heros[1].state.position = 'B1';
        this.player1.heros[2].state.position = 'C1';
        
        this.player2.heros[0].state.position = 'C6';
        this.player2.heros[1].state.position = 'D7';
        this.player2.heros[2].state.position = 'B7';

        this.player1.color = 0x0000ff;
        this.player2.color = 0xff0000;

        this.player1.heros.forEach(character => this.board.placeHero(
            character, 
            character.state.position, 
            this.player1.color
        ));

        this.player2.heros.forEach(character => this.board.placeHero(
            character, 
            character.state.position, 
            this.player2.color
        ));
   }

    getTurnManager() {
        return this.turnManager;
    }
}
