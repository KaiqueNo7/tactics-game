class Character {
    constructor(name, health, attack, defense, color) {
        this.name = name;
        this.health = health;
        this.maxHealth = health;
        this.attack = attack;
        this.defense = defense;
        this.color = color;
        this.position = null;
        
        // Novo sistema de habilidades
        this.abilities = {
            taunt: false,
            ranged: false,
            sprint: false,
            substitute: false,
            logistics: false
        };
        
        // Habilidades especiais únicas
        this.specialSkills = [];
    }

    // Métodos de habilidades
    hasTaunt() {
        return this.abilities.taunt;
    }

    isRanged() {
        return this.abilities.ranged;
    }

    hasSprint() {
        return this.abilities.sprint;
    }

    isSubstitute() {
        return this.abilities.substitute;
    }

    hasLogistics() {
        return this.abilities.logistics;
    }

    // Métodos de combate considerando habilidades
    canAttack(adjacentEnemies) {
        if (this.hasLogistics()) return false;
        
        if (this.isRanged()) {
            // Se tiver habilidade Ranged, verifica condições de ataque
            return adjacentEnemies.length === 0;
        }
        
        return true;
    }

    moveRange() {
        // Movimento base + Sprint se tiver
        return this.hasSprint() ? 3 : 2;
    }

    addSpecialSkill(skill) {
        this.specialSkills.push(skill);
    }

    // Método para verificar e aplicar habilidades especiais
    applySpecialSkills(battleContext) {
        this.specialSkills.forEach(skill => skill(this, battleContext));
    }
}
