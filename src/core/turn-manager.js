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
            hasMoved: false,
            movedCharacters: new Set() 
        };
        this.gameState = {
            status: 'active',
            winner: null
        };
        
        this.determineStartingPlayer(scene);
    }

    markCharacterAsMoved(character) {
        console.log(`${character.name} se moveu.`);
        this.currentTurn.movedCharacters.add(character);

        if(this.currentTurn.movedCharacters.size === this.currentTurn.player.characters.length) {
            this.currentTurn.hasMoved = true;
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
    }

    getCurrentCharacter() {
        const currentPlayer = this.currentTurn.player;
        if (!currentPlayer) return null;

        return currentPlayer.getAliveCharacters()[0] || null;
    }

    nextTurn() {
        if (!this.currentTurn.hasMoved) {
            this.scene.warningTextPlugin.showTemporaryMessage('Você deve mover um personagem antes de finalizar o turno.');
            return false;
        }

        this.currentTurn.movedCharacters.clear();

        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        const currentPlayer = this.players[this.currentPlayerIndex];
        
        this.currentTurn = {
            player: currentPlayer,
            phase: 'start',
            roundNumber: this.currentTurn.roundNumber + (this.currentPlayerIndex === 0 ? 1 : 0),
            hasMoved: false,
            movedCharacters: new Set()
        };
    
        this.checkGameState();

        this.warningTextPlugin.showTemporaryMessage(`Agora é a vez de ${this.currentTurn.player.name}.`);

        return this.currentTurn;
    }    

    resolveCombat(attacker, defender) {
        const baseDamage = Math.max(0, attacker.stats.attack - defender.stats.defense);
        const extraDamage = attacker.abilities.active.reduce((total, ability) => {
            return total + (ability.effect(defender) || 0);
        }, 0);

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
