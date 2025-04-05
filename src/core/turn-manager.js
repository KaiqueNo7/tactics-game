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
            movedCharacters: new Set(),
            attackedCharacters: new Set()
        };
        this.gameState = {
            status: 'active',
            winner: null
        };
        
        this.determineStartingPlayer();
    }

    markCharacterAsMoved(character) {
        console.log(`${character.name} se moveu.`);
        this.currentTurn.movedCharacters.add(character);

        if(this.currentTurn.movedCharacters.size === this.currentTurn.player.characters.length) {
            this.currentTurn.movedAll = true;
        }
    }

    markCharacterAsAttacked(character) {
        console.log(`${character.name} atacou.`);
        this.currentTurn.attackedCharacters.add(character);
        
        const aliveCharacters = this.currentTurn.player.characters.filter(char => char.isAlive);
        
        if(this.currentTurn.attackedCharacters.size === aliveCharacters.length) {
            this.currentTurn.attackedAll = true;
        }
    }

    canMoveCharacter(character) {
        return !this.currentTurn.movedCharacters.has(character);
    }

    determineStartingPlayer() {
        const startingPlayerIndex = Math.random() > 0.5 ? 0 : 1;
        this.currentPlayerIndex = startingPlayerIndex;
        this.currentTurn.player = this.players[startingPlayerIndex];

        this.scene.warningTextPlugin.showTemporaryMessage(`${this.currentTurn.player.name} começa o jogo!`);

        this.whoStarted = startingPlayerIndex;
    }

    getCurrentCharacter() {
        const currentPlayer = this.currentTurn.player;
        if (!currentPlayer) return null;

        return currentPlayer.getAliveCharacters()[0] || null;
    }

    nextTurn() {    
        this.currentTurn.movedCharacters.clear();
        
        if (this.currentTurn.attackedCharacters) {
            this.currentTurn.attackedCharacters.clear();
        }
    
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        const currentPlayer = this.players[this.currentPlayerIndex];
    
        const isBackToStarter = (this.currentPlayerIndex === this.whoStarted);
        const newRoundNumber = this.currentTurn.roundNumber + (isBackToStarter ? 1 : 0);
        
        this.currentTurn = {
            player: currentPlayer,
            phase: 'start',
            roundNumber: newRoundNumber,
            movedAll: false,
            movedCharacters: new Set(),
            attackedCharacters: new Set()
        };
    
        this.checkGameState();
    
        this.scene.uiManager.updateTurnPanel(this.currentTurn.player, this.currentTurn.roundNumber);
        
        this.scene.warningTextPlugin.showTemporaryMessage(`Turno de ${currentPlayer.name}!`);

        this.scene.board.selectedCharacter = null;
        this.scene.board.clearHighlights();
    
        return this.currentTurn;
    }

    resolveCombat(attacker, defender) {
        const baseDamage = attacker.stats.attack - defender.stats.defense;
        const extraDamage = attacker.abilities && attacker.abilities.active 
            ? attacker.abilities.active.reduce((total, ability) => {
                return total + (ability.effect(defender) || 0);
            }, 0)
            : 0;
    
        const totalDamage = baseDamage + extraDamage;
        defender.takeDamage(totalDamage);
    
        return {
            attacker: attacker.name,
            defender: defender.name,
            damage: totalDamage,
            defenderHealthRemaining: defender.stats.currentHealth
        };
    }

    checkGameState() {
        const alivePlayers = this.players.filter(player => 
            player.characters.some(char => char.state.isAlive)
        );

        if (alivePlayers.length === 1) {
            this.gameState = {
                status: 'finished',
                winner: alivePlayers[0]
            };
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
                characters: player.characters.map(char => char.toJSON())
            }))
        };
    }
}
