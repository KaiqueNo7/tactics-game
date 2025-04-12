import Hero from '../core/hero.js';
import { skills } from './skills.js';

export class Ralph extends Hero {
    static data = {
        name: 'Ralph',
        frame: 2,
        stats: { attack: 3, hp: 17, ability: null },
        abilities: [
            {
                key: 'firstPunch',
                name: skills.firstPunch.name,
                description: skills.firstPunch.description
            }
        ]
    };

    constructor(scene, x, y) {
        super(
            scene,
            x,
            y,
            Ralph.data.frame,
            Ralph.data.name,
            Ralph.data.stats.attack,
            Ralph.data.stats.hp,
            Ralph.data.stats.ability,
            Ralph.data.abilities.map(a => a.key)
        );
        this.state.hasPunched = false;
        this.state.firstPunchApplied = false;
    }

    counterAttack(target) {
        console.log(`${this.name} realiza um contra-ataque em ${target.name}!`);
        target.takeDamage(this.stats.attack, this);

        if (!this.state.hasPunched) {
            this.increaseAttack(-2);
            this.state.hasPunched = true;
        }

        this.updateHeroStats();
    }
}

export class Vic extends Hero {
    static data = {
        name: 'Vic',
        frame: 1,
        stats: { attack: 1, hp: 19, ability: null },
        abilities: [
            {
                key: 'poisonAttack',
                name: skills.poisonAttack.name,
                description: skills.poisonAttack.description
            }
        ]
    };

    constructor(scene, x, y) {
        super(
            scene,
            x,
            y,
            Vic.data.frame,
            Vic.data.name,
            Vic.data.stats.attack,
            Vic.data.stats.hp,
            Vic.data.stats.ability,
            Vic.data.abilities.map(a => a.key)
        );
    }
}

export class Gold extends Hero {
    static data = {
        name: 'Gold',
        frame: 0,
        stats: { attack: 1, hp: 18, ability: 'Sprint' },
        abilities: [
            {
                key: 'goodLuck',
                name: skills.goodLuck.name,
                description: skills.goodLuck.description
            }
        ]
    };

    constructor(scene, x, y) {
        super(
            scene,
            x,
            y,
            Gold.data.frame,
            Gold.data.name,
            Gold.data.stats.attack,
            Gold.data.stats.hp,
            Gold.data.stats.ability,
            Gold.data.abilities.map(a => a.key)
        );
    }
}

export class Blade extends Hero {
    static data = {
        name: 'Blade',
        frame: 4,
        stats: { attack: 4, hp: 16, ability: null },
        abilities: [
            {
                key: 'beyondFront',
                name: skills.beyondFront.name,
                description: skills.beyondFront.description
            }
        ]
    };

    constructor(scene, x, y) {
        super(
            scene,
            x,
            y,
            Blade.data.frame,
            Blade.data.name,
            Blade.data.stats.attack,
            Blade.data.stats.hp,
            Blade.data.stats.ability,
            Blade.data.abilities.map(a => a.key)
        );
    }
}

export class Dante extends Hero {
    static data = {
        name: 'Dante',
        frame: 5,
        stats: { attack: 2, hp: 18, ability: 'Ranged' },
        abilities: [
            {
                key: 'beyondFront',
                name: skills.beyondFront.name,
                description: skills.beyondFront.description
            }
        ]
    };

    constructor(scene, x, y) {
        super(
            scene,
            x,
            y,
            Dante.data.frame,
            Dante.data.name,
            Dante.data.stats.attack,
            Dante.data.stats.hp,
            Dante.data.stats.ability,
            Dante.data.abilities.map(a => a.key)
        );
    }
}

export class Ceos extends Hero {
    static data = {
        name: 'Ceos',
        frame: 3,
        stats: { attack: 1, hp: 26, ability: 'Taunt' },
        abilities: [
            {
                key: 'absorbRoots',
                name: skills.absorbRoots.name,
                description: skills.absorbRoots.description
            }
        ]
    };

    constructor(scene, x, y) {
        super(
            scene,
            x,
            y,
            Ceos.data.frame,
            Ceos.data.name,
            Ceos.data.stats.attack,
            Ceos.data.stats.hp,
            Ceos.data.stats.ability,
            Ceos.data.abilities.map(a => a.key)
        );
    }
}
