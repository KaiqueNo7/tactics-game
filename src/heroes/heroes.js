import Hero from '../core/hero.js';

export class Ralph extends Hero {
    constructor(scene, x, y) {
        super(scene, x, y, 2, 'Ralph', 3, 17, null, ['firstPunch']);
        this.state.hasPunched = false;
        this.state.firstPunchApplied = false    
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
    constructor(scene, x, y) {
        super(scene, x, y, 1, 'Vic', 1, 19, null, ['poisonAttack']);
    }
}

export class Gold extends Hero {
    constructor(scene, x, y) {
        super(scene, x, y, 0, 'Gold', 1, 18, 'Sprint', ['goodLuck']);
    }
}

export class Blade extends Hero {
    constructor(scene, x, y) {
        super(scene, x, y, 4, 'Blade', 4, 16, null, ['beyondFront']);
    }
}

export class Dante extends Hero {
    constructor(scene, x, y) {
        super(scene, x, y, 5, 'Dante', 2, 18, 'Ranged', ['brokenDefense']);
    }
}

export class Ceos extends Hero {
    constructor(scene, x, y) {
        super(scene, x, y, 3, 'Ceos', 1, 26, 'Taunt', ['absorbRoots']);
    }
}
