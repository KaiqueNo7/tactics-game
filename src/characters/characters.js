import Character from '../core/character.js';

const warrior1 = new Character("Guerreiro 1", 100, 20, 10, "darkblue");
warrior1.abilities.taunt = true; // Tem a habilidade Taunt
warrior1.addSpecialSkill((character, context) => {
    // Exemplo de habilidade especial: Aumenta defesa quando saúde está baixa
    if (character.health / character.maxHealth < 0.3) {
        character.defense += 5;
    }
});

const archer1 = new Character("Arqueiro 1", 80, 25, 5, "royalblue");
archer1.abilities.ranged = true; // Tem a habilidade Ranged
archer1.abilities.sprint = true; // Também tem Sprint
archer1.addSpecialSkill((character, context) => {
    // Exemplo de habilidade especial: Dano extra em inimigos com baixa saúde
    const target = context.target;
    if (target.health / target.maxHealth < 0.2) {
        target.takeDamage(10);
    }
});

const mage1 = new Character("Mago 1", 60, 30, 3, "lightblue");
mage1.abilities.substitute = true; // Tem a habilidade Substitute
mage1.addSpecialSkill((character, context) => {
    // Exemplo de habilidade especial: Cura aliados quando entra em campo
    if (character.isSubstitute()) {
        context.allies.forEach(ally => {
            ally.health = Math.min(ally.maxHealth, ally.health + 15);
        });
    }
});

// Personagens do jogador 2 com habilidades diferentes
const warrior2 = new Character("Guerreiro 2", 100, 20, 10, "darkred");
warrior2.abilities.logistics = true; // Não pode atacar, mas pode ter outra função

const archer2 = new Character("Arqueiro 2", 80, 25, 5, "crimson");
archer2.abilities.ranged = true;
archer2.addSpecialSkill((character, context) => {
    // Exemplo: Reduz movimento de inimigos próximos
    context.enemies.forEach(enemy => {
        enemy.moveRange = Math.max(1, enemy.moveRange() - 1);
    });
});

const mage2 = new Character("Mago 2", 60, 30, 3, "lightcoral");
mage2.abilities.sprint = true;
mage2.addSpecialSkill((character, context) => {
    // Exemplo: Causa dano em área
    context.enemies.forEach(enemy => {
        if (Math.hypot(enemy.position.x - character.position.x, 
                       enemy.position.y - character.position.y) <= 2) {
            enemy.takeDamage(10);
        }
    });
});

export { warrior1, archer1, mage1, warrior2, archer2, mage2 };
