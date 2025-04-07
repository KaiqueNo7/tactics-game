import Hero from '../core/hero.js';
import { skills } from './skills.js';

export class IronFist extends Hero {
    constructor(scene, x, y) {
        super(scene, x, y, 2, 'Iron Fist', 3, 16, null, ['firstPunch']);
    }
}

export class SnakeLady extends Hero {
    constructor(scene, x, y) {
        super(scene, x, y, 1, 'Snake Lady', 1, 20, null, ['poisonAttack']);
    }
}

export class GoldNugget extends Hero {
    constructor(scene, x, y) {
        super(scene, x, y, 0, 'Gold Nugget', 2, 18, 'Sprint', []);
    }
}

export class GiantBlade extends Hero {
    constructor(scene, x, y) {
        super(scene, x, y, 4, 'Giant Blade', 4, 12, 'Taunt', []);
    }
}

export class BasicShooter extends Hero {
    constructor(scene, x, y) {
        super(scene, x, y, 5, 'Basic Shooter', 2, 14, 'Ranged', []);
    }
}

export class ForestSpirit extends Hero {
    constructor(scene, x, y) {
        super(scene, x, y, 3, 'Forest Spirit', 1, 13, null, []);
    }
}
