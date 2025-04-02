import Character from '../core/character.js';

export default class CharacterFactory {
    static createWarrior(scene, name, color) {
        return new Character(scene, {
            x: 100, y: 100, name, color,
            health: 10, 
            attack: 3,
            abilities: {
                passive: ['melee'],
                specialSkills: ['shieldBlock']
            }
        });
    }

    static createArcher(scene, name, color) {
        return new Character(scene, {
            x: 200, y: 100, name, color,
            health: 10, 
            attack: 4,
            abilities: {
                passive: ['ranged'],
                specialSkills: ['piercingShot']
            }
        });
    }

    static createMage(scene, name, color) {
        return new Character(scene, {
            x: 300, y: 100, 
            name, 
            color,
            health: 13, 
            attack: 2,
            abilities: {
                passive: ['ranged'],
                specialSkills: ['fireball']
            }
        });
    }
}
