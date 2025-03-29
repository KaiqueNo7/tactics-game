import Character, { CharacterFactory } from '../core/character.js';

// Personagens do Jogador 1
const warrior1 = CharacterFactory.createWarrior("Guerreiro 1", 0x1E90FF);
const archer1 = CharacterFactory.createArcher("Arqueiro 1", 0x32CD32);
const mage1 = new Character({
    name: "Mago 1", 
    health: 60, 
    attack: 30, 
    defense: 3,
    color: 0x4B0082
});
mage1.addActiveAbility({
    name: 'Substituição',
    effect: (context) => {
        context.allies.forEach(ally => {
            ally.heal(15);
        });
    }
});

// Personagens do Jogador 2
const warrior2 = CharacterFactory.createWarrior("Guerreiro 2", 0xDC143C);
const archer2 = CharacterFactory.createArcher("Arqueiro 2", 0xFFD700);
const mage2 = new Character({
    name: "Mago 2", 
    health: 60, 
    attack: 30, 
    defense: 3,
    color: 0xFF4500
});
mage2.addActiveAbility({
    name: 'Explosão Arcana',
    effect: (context) => {
        context.enemies.forEach(enemy => {
            enemy.takeDamage(10);
        });
    }
});

export { warrior1, archer1, mage1, warrior2, archer2, mage2 };
