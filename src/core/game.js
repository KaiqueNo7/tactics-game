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

        console.log('Player 1:', selectedHeroesP1);
        console.log('Player 2:', selectedHeroesP2);

        this.scene = scene;
        this.board = board; 

        const player1Heroes = selectedHeroesP1.map((name, i) => {
            return new HERO_CLASSES[name](scene, 0, 0);
        });
    
        const player2Heroes = selectedHeroesP2.map((name, i) => {
            return new HERO_CLASSES[name](scene, 0, 0);
        });

        this.player1 = new Player("Jogador 1", player1Heroes);
        this.player2 = new Player("Jogador 2", player2Heroes);        

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

        this.player1.color = 0x0000ff;
        this.player2.color = 0xff0000;

        this.player1.heros.forEach(hero => this.board.placeHero(
            hero, 
            hero.state.position, 
            1
        ));

        this.player2.heros.forEach(hero => this.board.placeHero(
            hero, 
            hero.state.position, 
            2
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
