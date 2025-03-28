// src/core/turnManager.js
import { Character } from './rules.js';

export class TurnManager {
    constructor(players) {
        this.players = players;
        this.currentPlayerIndex = 0;
        this.currentCharacterIndex = 0;
        this.gamePhase = 'setup';
    }

    nextTurn() {
        // Avança para o próximo personagem ou próximo jogador
        this.currentCharacterIndex++;
        
        const currentPlayer = this.players[this.currentPlayerIndex];
        
        if (this.currentCharacterIndex >= currentPlayer.characters.length) {
            // Reinicia os personagens do jogador atual e passa para o próximo jogador
            this.currentCharacterIndex = 0;
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        }
        
        return this.getCurrentCharacter();
    }

    getCurrentCharacter() {
        const currentPlayer = this.players[this.currentPlayerIndex];
        return currentPlayer.characters[this.currentCharacterIndex];
    }

    combat(attacker, defender) {
        // Lógica básica de combate considerando ataque, defesa e habilidades
        const baseDamage = Math.max(0, attacker.attack - defender.defense);
        
        // Verifica habilidades especiais antes do dano
        const battleContext = {
            attacker: attacker,
            defender: defender,
            damage: baseDamage
        };
        
        attacker.applySpecialSkills(battleContext);
        defender.applySpecialSkills(battleContext);
        
        // Aplica dano final
        defender.health = Math.max(0, defender.health - battleContext.damage);
        
        return {
            damage: battleContext.damage,
            defenderRemainingHealth: defender.health
        };
    }

    isGameOver() {
        // Verifica se algum jogador perdeu todos os personagens
        return this.players.some(player => 
            player.characters.every(character => character.health <= 0)
        );
    }
}

export class Player {
    constructor(name, characters) {
        this.name = name;
        this.characters = characters;
    }
}