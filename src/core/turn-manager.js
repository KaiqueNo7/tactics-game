export default class TurnManager {
    constructor(players) {
        this.players = players;
        this.currentPlayerIndex = 0;
        this.currentTurn = {
            player: this.players[0], // Inicializa com o primeiro jogador
            phase: 'start',
            roundNumber: 1
        };
        this.gameState = {
            status: 'active',
            winner: null
        };
    }

    // Método para obter o personagem atual (novo método)
    getCurrentCharacter() {
        const currentPlayer = this.currentTurn.player;
        if (!currentPlayer) return null;

        // Assumindo que o personagem atual é o primeiro personagem vivo do jogador
        return currentPlayer.getAliveCharacters()[0] || null;
    }

    // Avança para o próximo turno
    nextTurn() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        const currentPlayer = this.players[this.currentPlayerIndex];
        
        this.currentTurn = {
            player: currentPlayer,
            phase: 'start',
            roundNumber: this.currentTurn.roundNumber + (this.currentPlayerIndex === 0 ? 1 : 0)
        };

        this.checkGameState();
        return this.currentTurn;
    }

    // Realizar ação de combate
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
