import TurnManager from './turn-manager.js';
import Player from './player.js';
import { Gold, Vic, Dante, Ralph, Ceos, Blade } from '../heroes/heroes.js';

const HERO_CLASSES = {
    Ralph,
    Vic,
    Gold,
    Blade,
    Dante,
    Ceos,
};

export default class GameManager extends Phaser.GameObjects.Container {
    constructor(scene, board, selectedHeroesP1, selectedHeroesP2) {  
        super(scene);

        this.scene = scene;
        this.board = board; 

        this.player1 = new Player("Jogador 1");
        this.player1.setNumber(1);
        this.player2 = new Player("Jogador 2");
        this.player2.setNumber(2);   

        this.player1.addHeroes(selectedHeroesP1);
        this.player2.addHeroes(selectedHeroesP2);
       

        this.turnManager = new TurnManager(this.scene, [this.player1, this.player2]);
        this.currentTurn = this.turnManager.currentTurn;   

        this.setupInitialPositions();

        this.turnManager.triggerStartOfTurnSkills(this.turnManager.players);
    }
    
    setupInitialPositions() {
        this.player2.heros[0].state.position = 'B1';
        this.player2.heros[1].state.position = 'C1';
        this.player2.heros[2].state.position = 'D1';
        
        this.player1.heros[0].state.position = 'C6';
        this.player1.heros[1].state.position = 'D7';
        this.player1.heros[2].state.position = 'B7';

        this.player1.heros.forEach(hero => this.board.placeHero(
            hero, 
            hero.state.position, 
            this.player1.number
        ));

        this.player2.heros.forEach(hero => this.board.placeHero(
            hero, 
            hero.state.position, 
            this.player2.number
        ));
   }

    setGameState(gameState) {
        this.gameState = gameState;
    }

   finishGame() {
        const { winner } = this.gameState;
        this.isGameOver = true;
        this.scene.uiManager.showVictoryUI(winner);
    }

    getTurnManager() {
        return this.turnManager;
    }
}
