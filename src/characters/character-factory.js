import Character from '../core/character.js';

export default class CharacterFactory {
    static createWarrior(scene, name, color) {
        return new Character(scene, {
            x: 100, y: 100, name, color,
            health: 120, attack: 25, defense: 15
        });
    }

    static createArcher(scene, name, color) {
        return new Character(scene, {
            x: 200, y: 100, name, color,
            health: 90, attack: 30, defense: 8
        });
    }

    static createMage(scene, name, color) {
        return new Character(scene, {
            x: 300, y: 100, name, color,
            health: 60, attack: 30, defense: 3
        });
    }
}
