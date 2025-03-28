export class TurnManager {
    constructor(players) {
        this.players = players;
        this.currentPlayerIndex = 0;
        this.currentTurn = {
            player: null,
            phase: 'start',
            roundNumber: 1
        };
        this.gameState = {
            status: 'active',
            winner: null
        };
    }

    // Avança para o próximo turno
    nextTurn() {
        // Lógica de progressão de turno
        this.currentPlayerIndex = 
            (this.currentPlayerIndex + 1) % this.players.length;
        
        const currentPlayer = this.players[this.currentPlayerIndex];
        
        this.currentTurn = {
            player: currentPlayer,
            phase: 'start',
            roundNumber: this.currentTurn.roundNumber + 
                (this.currentPlayerIndex === 0 ? 1 : 0)
        };

        this.checkGameState();
        return this.currentTurn;
    }

    // Realizar ação de combate
    resolveCombat(attacker, defender) {
        // Calcula dano considerando habilidades
        const baseDamage = Math.max(0, attacker.stats.attack - defender.stats.defense);
        
        // Verifica habilidades ativas do atacante
        const extraDamage = attacker.abilities.active.reduce((total, ability) => {
            return total + (ability.effect(defender) || 0);
        }, 0);

        const totalDamage = baseDamage + extraDamage;
        
        // Aplica danos e verifica efeitos passivos
        defender.takeDamage(totalDamage);
        
        return {
            attacker: attacker.name,
            defender: defender.name,
            damage: totalDamage,
            defenderHealthRemaining: defender.stats.currentHealth
        };
    }

    // Verificar estado do jogo
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

    // Exportar estado para serialização/rede
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

// Classe de Player atualizada
export class Player {
    constructor(name, characters = []) {
        this.id = Date.now() + Math.random();
        this.name = name;
        this.characters = characters;
        this.strategy = 'default'; // Para futuras implementações de IA
    }

    // Adicionar personagem
    addCharacter(character) {
        this.characters.push(character);
    }

    // Remover personagem
    removeCharacter(characterId) {
        this.characters = this.characters.filter(
            char => char.id !== characterId
        );
    }

    // Obter personagens vivos
    getAliveCharacters() {
        return this.characters.filter(char => char.state.isAlive);
    }
}