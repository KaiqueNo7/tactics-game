export default class TurnManager extends Phaser.Data.DataManager {
    constructor(scene, players) {
        super(scene, 'TurnManager');
        this.scene = scene;
        this.players = players;
        this.currentPlayerIndex = 0;
        this.currentTurn = {
            player: null,
            phase: 'start',
            roundNumber: 1,
            movedAll: false,
            attackedAll: false,
            counterAttack: false,
            movedHeros: new Set(),
            attackedHeros: new Set()
        };
        this.gameState = {
            status: 'active',
            winner: null
        };
        
        this.determineStartingPlayer();
    }

    markHeroAsMoved(hero) {
        console.log(`${hero.name} se moveu.`);
        this.currentTurn.movedHeros.add(hero);
        
        this.triggerOnMoveSkills(this.players);
        if(this.currentTurn.movedHeros.size === this.currentTurn.player.heros.length) {
            this.currentTurn.movedAll = true;
        }
    }

    markHeroAsAttacked(hero) {
        this.currentTurn.attackedHeros.add(hero);
        
        const aliveHeros = this.currentTurn.player.heros.filter(char => char.state.isAlive);
        
        if(this.currentTurn.attackedHeros.size === aliveHeros.length) {
            this.currentTurn.attackedAll = true;
        }
    }

    canMoveHero(hero) {
        if (this.currentTurn.movedHeros.has(hero)) {
            return false;
        }

        if (this.currentTurn.attackedHeros.has(hero)) {
            return false;
        }

        if (this.currentTurn.movedAll) {
            return false;
        }

        return true;
    }

    determineStartingPlayer() {
        const startingPlayerIndex = Math.random() > 0.5 ? 0 : 1;
        
        this.currentPlayerIndex = startingPlayerIndex;
        this.currentTurn.player = this.players[startingPlayerIndex];

        this.whoStarted = startingPlayerIndex;
    }

    createNewTurn(player, roundNumber) {
        return {
            player,
            phase: 'start',
            roundNumber,
            movedAll: false,
            attackedAll: false,
            counterAttack: false,
            movedHeros: new Set(),
            attackedHeros: new Set()
        };
    }    

    nextTurn() {    
        this.triggerEndOfTurnSkills();

        this.currentTurn.movedHeros.clear();
        
        if (this.currentTurn.attackedHeros) {
            this.currentTurn.attackedHeros.clear();
        }
    
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        const currentPlayer = this.players[this.currentPlayerIndex];
    
        const isBackToStarter = (this.currentPlayerIndex === this.whoStarted);
        const newRoundNumber = this.currentTurn.roundNumber + (isBackToStarter ? 1 : 0);
        
        this.currentTurn = this.createNewTurn(currentPlayer, newRoundNumber);
    
        this.scene.board.clearSelectedHero();
        this.checkGameState();
    
        this.scene.uiManager.updateTurnPanel(this.currentTurn.player, this.currentTurn.roundNumber);

        this.scene.board.clearHighlights();

        this.triggerStartOfTurnSkills(this.players);

        this.scene.gameUI.showMessage(currentPlayer.name + ' - Sua vez!');
    
        return this.currentTurn;
    }

    triggerStartOfTurnSkills(players) {
        players.forEach(player => {
            player.heros.forEach(hero => {
                if (hero.state.isAlive) {
                    hero.startTurn();
                }
            });
        });
    }

    triggerOnMoveSkills(players) {
        players.forEach(player => {
            player.heros.forEach(hero => {
                if (hero.state.isAlive) {
                    hero.triggerSkills('onMove');
                }
            });
        });
    }

    triggerEndOfTurnSkills() {
        const currentPlayer = this.players[this.currentPlayerIndex];
        currentPlayer.heros.forEach(hero => {
            if (hero.state.isAlive) {
                hero.endTurn();
            }
        });
    }

    checkGameState() {
        const alivePlayers = this.players.filter(player => 
            player.heros.some(char => char.state.isAlive)
        );

        if (alivePlayers.length === 1) {
            const winner = alivePlayers[0];
        
            this.scene.gameManager.setGameState({
                status: 'finished',
                winner
            });
        
            this.scene.gameManager.finishGame();
        }
        

        return this.gameState;
    }

    getCurrentPlayer() {
        return this.currentTurn.player;
    }
 
    toJSON() {
        return {
            currentPlayer: this.currentTurn.player.name,
            roundNumber: this.currentTurn.roundNumber,
            gameState: this.gameState,
            players: this.players.map(player => ({
                name: player.name,
                heros: player.heros.map(char => char.toJSON())
            }))
        };
    }
}
