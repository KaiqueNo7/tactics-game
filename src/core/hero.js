import { skills } from '../heroes/skills.js';

class Hero extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, frameIndex, name, attack, hp, ability, skillNames = []) {
        super(scene, x, y, 'heroes', frameIndex || 0);

        this.scene = scene;
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
            statusEffects: [],
        };

        this.setInteractive();
    }

    placeOnBoard(scene, hex) {
        this.setPosition(hex.x, hex.y);
        
        this.sprite = scene.add.sprite(hex.x, hex.y, 'heroes', this.frameIndex);
        this.sprite.setScale(0.7);
        this.sprite.setInteractive();
        
        this.sprite.on('pointerdown', () => {
            if (scene.board.selectedHero) {
                scene.board.attackHero(scene.board.selectedHero, this);
            } else {
                scene.board.selectHero(this);
            }
        });

        this.createStatsText(scene, hex);
        this.updateHeroStats();
    }

    createStatsText(scene, hex) { 
        if (this.statsText) this.statsText.destroy();

        this.statsText = scene.add.text(hex.x, hex.y + 25, '', {
            font: '12px Arial',
            fill: '#ffffff',
            align: 'center',
            backgroundColor: '#000000',
            padding: { x: 2, y: 2 }
        });

        this.statsText.setOrigin(0.5);
        this.statsText.setDepth(10);
    }

    triggerSkills(triggerType, target = null) {
        if (!this.skills || this.skills.length === 0) return;
        if (!Array.isArray(this.skills)) return;

        this.skills.forEach(skill => {
            if (skill.triggers.includes(triggerType)) {
                skill.apply(this, target);
                this.updateHeroStats();
            }
        });
    }

    attackTarget(target) {
        console.log(`${this.name} ataca ${target.name}!`);
        this.takeDamage(this.stats.attack, target);
        this.triggerSkills('onAttack', target);
        this.updateHeroStats();
        return true;
    }    
    
    takeDamage(amount, target = null) {
        let extraDamage = this.state.statusEffects.filter(effect => effect.type === 'wound').length;
        
        const totalDamage = amount + extraDamage;
        
        target.stats.currentHealth -= totalDamage;
    
        console.log(`${target.name} recebeu ${totalDamage} de dano. Vida restante: ${target.stats.currentHealth}`);
    
        if (target.stats.currentHealth <= 0) {
            target.die();
        }

        target.triggerSkills('onDamage', target);
        target.updateHeroStats();
        
        return totalDamage;
    }

    heal(amount) {
        this.stats.currentHealth = Math.min(this.stats.currentHealth + amount, this.stats.maxHealth);
        this.updateHeroStats();
    }

    increaseAttack(amount) {
        this.stats.attack += amount;
        this.updateHeroStats();
    }

    die() {
        console.log(`${this.name} foi derrotado!`);
        this.state.isAlive = false;
        this.updateHeroStats();
    }

    applyStatusEffect(effect) {
        this.state.statusEffects.push(effect);
        this.updateHeroStats();
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
        this.updateHeroStats();
    }

    startTurn() {
        this.processStatusEffects();
        this.triggerSkills('onTurnStart');
        this.updateHeroStats();
    }

    endTurn() {
        this.triggerSkills('onTurnEnd');
        this.updateHeroStats();
    }

    counterAttack(attacker) {
        console.log(`${this.name} realiza um contra-ataque em ${attacker.name}!`);
        this.takeDamage(this.stats.attack, attacker);
        this.updateHeroStats();
    }

    updateHeroStats() {
        if (!this.statsText) return;

        const { currentHealth, attack } = this.stats;

        this.statsText.setText(`⚔ ${attack} ❤ ${currentHealth}`);
        
        if (this.sprite) {
            this.statsText.setPosition(this.sprite.x, this.sprite.y + 25);
        }
    }
}

export default Hero;
