import { skills } from '../heroes/skills.js';

class Hero extends Phaser.GameObjects.Container {
    constructor(scene, x, y, frameIndex, name, attack, hp, ability, skillNames = []) {
        super(scene, x, y);

        this.scene = scene;
        scene.add.existing(this);

        const sprite = scene.add.sprite(0, 0, 'heroes', frameIndex || 0);
        sprite.setScale(0.7);
        this.add(sprite);

        this.sprite = sprite;

        this.isSelected = false;
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

        this.effectSprites = {};
        this.setSize(sprite.displayWidth, sprite.displayHeight);
        this.setInteractive();
    }

    placeOnBoard(scene, hex) {
        this.setPosition(hex.x, hex.y);
    
        scene.uiManager.createStatsUI(this);
    
        this.on('pointerdown', () => {
            if (scene.board.selectedHero) {
                scene.board.attackHero(scene.board.selectedHero, this);
            } else {
                scene.board.selectHero(this);
            }
        });

        if (!this.scene.children.list.includes(this)) {
            scene.add.existing(this);
        }
    }
    

    setSelected(selected) {
        this.isSelected = selected;
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
        this.triggerSkills('onAttack', target);
        this.updateHeroStats();
        return true;
    }    
    
    takeDamage(amount, attacker = null) {
        let extraDamage = this.state.statusEffects.filter(effect => effect.type === 'wound').length;
        
        const totalDamage = amount + extraDamage;
        
        this.stats.currentHealth -= totalDamage;
    
        console.log(`${this.name} recebeu ${totalDamage} de dano. Vida restante: ${this.stats.currentHealth}`);
        
        if (this.stats.currentHealth <= 0) {
            this.die();
        }
        
        this.triggerSkills('onDamage', attacker);
        this.updateHeroStats();
        
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
        const hexHeroDie = this.scene.board.getHexByLabel(this.state.position);
        this.scene.board.handleHeroDeath(this, hexHeroDie);
    }

    applyStatusEffect(effect) {
        this.state.statusEffects.push(effect);

        if (effect.type === 'poison') {
            this.addPoisonEffect(this);
        }

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

    counterAttack(target) {
        console.log(`${this.name} realiza um contra-ataque em ${target.name}!`);
        target.takeDamage(this.stats.attack, this);
        this.updateHeroStats();
    }

    addPoisonEffect() {
        if (this.effectSprites.poison) return;

        const poison = this.scene.add.image(0, -40, 'poison');
        poison.setScale(0.5);
        poison.setDepth(10);
        this.add(poison);
        this.effectSprites.poison = poison;
    }
    
    updateHeroStats() {
        if (!this.state.isAlive) return;
    
        const { currentHealth, attack } = this.stats;
    
        if (this.attackText) {
            this.attackText.setText(`${attack}`);
        }
    
        if (this.healthText) {
            this.healthText.setText(`${currentHealth}`);
        }
    }
}

export default Hero;
