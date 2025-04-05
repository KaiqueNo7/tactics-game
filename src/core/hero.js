class Hero extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, frameIndex, name, attack, hp, ability, skill) {
        super(scene, x, y, 'heroes', frameIndex || 0);

        this.frameIndex = frameIndex || 0;
        this.name = name;
        this.attack = attack;
        this.hp = hp;
        this.ability = ability;
        this.skill = skill;

        this.attackRange = ability === 'Ranged' ? 2 : 1;

        this.statusEffects = [];
        this.taunt = ability === 'Taunt';

        this.stats = {
            maxHealth: hp,
            currentHealth: hp,
            attack: attack
        };

        this.state = {
            position: null,
            isAlive: true,
            statusEffects: []
        };
    }

    attackTarget(target, board) {
        const attackerHex = board.getHexByLabel(this.state.position);
        const targetHex = board.getHexByLabel(target.state.position);
    
        if (!attackerHex || !targetHex) {
            console.log('Hex do atacante ou do alvo não encontrado.');
            return;
        }
    
        const distance = board.calculateDistance(attackerHex, targetHex);
    
        if (distance <= this.attackRange) {
            console.log(`${this.name} ataca ${target.name} dentro do alcance!`);
            target.takeDamage(this.attack);
            this.useSkill(target);
        } else {
            console.log(`${this.name} tentou atacar ${target.name}, mas está fora do alcance.`);
        }
    }
    
    takeDamage(amount) {
        let extraDamage = this.statusEffects.filter(effect => effect.type === 'wound').length;
        this.hp -= amount + extraDamage;

        if (this.hp <= 0) {
            this.die();
        }
    }

    heal(amount) {
        this.hp = Math.min(this.hp + amount, this.stats.maxHealth);
    }

    increaseAttack(amount) {
        this.attack += amount;
    }

    die() {
        console.log(`${this.name} has been defeated!`);
        this.destroy();
    }

    useSkill(target) {
        if (this.skill) {
            this.skill(this, target);
        }
    }

    applyStatusEffect(effect) {
        this.statusEffects.push(effect);
    }

    processStatusEffects() {
        this.statusEffects = this.statusEffects.filter(effect => {
            if (effect.effect) {
                effect.effect(this);
            }
            if (effect.duration > 1 || effect.duration === Infinity) {
                if (effect.duration !== Infinity) {
                    effect.duration--;
                }
                return true;
            }
            return false;
        });
    }

    startTurn() {
        this.processStatusEffects();
    }
}

// =======================
// === CLASSES DOS HERÓIS ===
// =======================

class GoldNugget extends Hero {
    constructor(scene, x, y) {
        super(scene, x, y, 0, 'Gold Nugget', 2, 18, 'Sprint', (hero) => {
            console.log(`${hero.name} discovers a Gold!`);
            hero.heal(3);
            hero.increaseAttack(1);
        });
    }

    startTurn() {
        super.startTurn();
        this.useSkill();
    }
}

class SnakeLady extends Hero {
    constructor(scene, x, y) {
        super(scene, x, y, 1, 'Snake Lady', 1, 20, 'None', (hero, target) => {
            if (target) {
                console.log(`${hero.name} poisons ${target.name}!`);
                target.applyStatusEffect({
                    type: 'poison',
                    duration: Infinity,
                    effect: (target) => {
                        target.takeDamage(1);
                        console.log(`${target.name} takes 1 poison damage!`);
                    }
                });
            }
        });
    }

    attackTarget(target) {
        target.takeDamage(this.attack);
        this.useSkill(target);
    }
}

class IronFist extends Hero {
    constructor(scene, x, y) {
        super(scene, x, y, 2, 'Iron Fist', 3, 16, 'Punch Boost', null);
    }

    attackTarget(target) {
        target.takeDamage(this.attack);
        console.log(`${this.name} punches ${target.name} with boosted strength!`);
    }
}

class ForestSpirit extends Hero {
    constructor(scene, x, y) {
        super(scene, x, y, 3, 'Forest Spirit', 1, 22, 'Regeneration', (hero) => {
            console.log(`${hero.name} regenerates 2 HP.`);
            hero.heal(2);
        });
    }

    startTurn() {
        super.startTurn();
        this.useSkill();
    }
}

class GiantBlade extends Hero {
    constructor(scene, x, y) {
        super(scene, x, y, 4, 'Giant Blade', 2, 20, 'Taunt', (hero, target) => {
            if (target) {
                console.log(`${hero.name} wounds ${target.name}, increasing damage taken!`);
                target.applyStatusEffect({
                    type: 'wound',
                    duration: 1,
                    effect: () => {}
                });
            }
        });
    }

    attackTarget(target) {
        target.takeDamage(this.attack);
        this.useSkill(target);
    }
}

class BasicShooter extends Hero {
    constructor(scene, x, y) {
        super(scene, x, y, 5, 'Basic Shooter', 2, 14, 'Ranged', null);
    }

    attackTarget(target) {
        console.log(`${this.name} shoots an arrow at ${target.name}`);
        target.takeDamage(this.attack);
    }
}

// ========================
// === EXPORTAÇÃO DOS HERÓIS ===
// ========================
export default {
    GoldNugget,
    SnakeLady,
    IronFist,
    ForestSpirit,
    GiantBlade,
    BasicShooter
};
