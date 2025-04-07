import { skills } from '../heroes/skills.js';

class Hero extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, frameIndex, name, attack, hp, ability, skillNames = []) {
        super(scene, x, y, 'heroes', frameIndex || 0);

        this.frameIndex = frameIndex || 0;
        this.name = name;
        this.attack = attack;
        this.hp = hp;
        this.ability = ability;
        this.skills = skillNames.map(skillName => skills[skillName]).filter(skill => skill !== undefined); 
        this.attackRange = ability === 'Ranged' ? 2 : 1;

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

        this.setInteractive();
    }

    attackTarget(target) {
        console.log(`${this.name} ataca ${target.name}!`);
        
        this.skills.forEach(skill => skill.apply(this, target));
        
        return true;
    }    
    
    takeDamage(amount) {
        let extraDamage = this.state.statusEffects.filter(effect => effect.type === 'wound').length;
        
        const totalDamage = amount + extraDamage;
        
        this.stats.currentHealth -= totalDamage;
    
        console.log(`${this.name} recebeu ${totalDamage} de dano. Vida restante: ${this.stats.currentHealth}`);
    
        if (this.stats.currentHealth <= 0) {
            this.die();
        }
        
        return totalDamage;
    }

    counterAttack(attacker, damage, turnManager) {
        if (!turnManager.currentTurn.counterAttack) {
            console.log(`${this.name} contra-ataca ${attacker.name}!`);
            attacker.takeDamage(damage);
            turnManager.currentTurn.counterAttack = true;
        } else {
            console.log(`Contra-ataque já foi usado neste turno.`);
        }
    }

    heal(amount) {
        this.stats.currentHealth = Math.min(this.stats.currentHealth + amount, this.stats.maxHealth);
    }

    increaseAttack(amount) {
        this.attack += amount;
    }

    die() {
        console.log(`${this.name} foi derrotado!`);
        this.state.isAlive = false;
    }

    applyStatusEffect(effect) {
        this.state.statusEffects.push(effect);
    }

    processStatusEffects() {
        this.state.statusEffects = this.state.statusEffects.filter(effect => {
            if (effect.effect) effect.effect(this);
            if (effect.duration > 1 || effect.duration === Infinity) {
                if (effect.duration !== Infinity) effect.duration--;
                return true;
            }
            return false;
        });
    }

    startTurn() {
        this.processStatusEffects();
    }
}

export default Hero;
