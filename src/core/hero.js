import { skills } from '../heroes/skills.js';

class Hero extends Phaser.GameObjects.Container {
  constructor(scene, x, y, frameIndex, name, attack, hp, ability, skillNames = [], playerId = null, socket = null, id = null) {
    super(scene, x, y);

    this.scene = scene;
    scene.add.existing(this);

    this.socket = socket;

    this.playerId = playerId;

    const sprite = scene.add.sprite(0, -10, 'heroes', frameIndex);
    sprite.setScale(0.230);
    this.add(sprite);
    this.sprite = sprite;
        
    this.isSelected = false;
    this.frameIndex = frameIndex;
    this.name = name;
    this.attack = attack;
    this.hp = hp;
    this.ability = ability;
    this.skills = skillNames.map(skillName => skills[skillName]).filter(skill => skill !== undefined); 
    this.attackRange = ability === 'Ranged' ? 2 : 1;
    this.firstAttack = false;

    this.stats = {
      attack: attack,
      currentHealth: hp,
      maxHealth: hp
    };

    this.state = {
      isAlive: true,
      position: null,
      statusEffects: [],
    };

    this.effectSprites = {};
    this.setSize(sprite.displayWidth, sprite.displayHeight);
  
    this.setInteractive();
    this.id = id;

    if (this.ability === 'Taunt') {
      this.applyTaunt();
    }
  }

  addPlayerId(playerId) {
    this.playerId = playerId;
  }

  attackTarget(target) {
    console.log(`${this.name} ataca ${target.name}!`);

    this.damageApplied = false;

    this.triggerSkills('onAttack', target);

    if(!this.damageApplied){
      target.takeDamage(this.stats.attack, this);
    }
    
    this.firstAttack = true;
    this.updateHeroStats();
    return true;
  } 

  applyTaunt() {
    if (this.shieldSprite) return;
  
    const shield = this.scene.add.image(0, 0, 'shield');
    shield.setScale(0.5);
    shield.setDepth(15);
    shield.setY(-13);
    shield.setX(-13);
    shield.setOrigin(0.5, 0.5);
    
    this.add(shield);
    this.shieldSprite = shield;
  }

  applyStatusEffect(effect) {
    this.state.statusEffects.push(effect);

    if (effect.type === 'poison') {
      this.addPoisonEffect(this);
    }

    this.updateHeroStats();
  }
    
  setSelected(selected) {
    this.isSelected = selected;
  }   

  createStatsText(scene, hex) { 
    if (this.statsText) this.statsText.destroy();

    this.statsText = scene.add.text(hex.x, hex.y + 25, '', {
      align: 'center',
      backgroundColor: '#000000',
      fill: '#ffffff',
      font: '12px Arial',
      padding: { x: 2, y: 2 }
    });

    this.statsText.setOrigin(0.5);
    this.statsText.setDepth(10);
  }

  triggerSkills(triggerType, target = null, isCounterAttack = null) {
    if (!this.skills || this.skills.length === 0) return;
    if (!Array.isArray(this.skills)) return;

    this.skills.forEach(skill => {
      if (skill.triggers.includes(triggerType)) {
        skill.apply({
          hero: this, 
          target: target, 
          isCounterAttack: isCounterAttack, 
          scene: this.scene
        });
        this.updateHeroStats();
      }
    });
  }   
    
  takeDamage(amount, attacker = null) {
    let extraDamage = this.state.statusEffects.filter(effect => effect.type === 'wound').length;
        
    const totalDamage = amount + extraDamage;
        
    this.stats.currentHealth -= totalDamage;

    this.scene.uiManager.showFloatingAmount(this, `-${totalDamage}`);
    
    console.log(`${this.name} recebeu ${totalDamage} de dano. Vida restante: ${this.stats.currentHealth}`);
        
    
    if (this.stats.currentHealth <= 0) {
      this.die();
    }
    
    this.scene.uiManager.playDamageAnimation(this);
        
    this.triggerSkills('onDamage', attacker);
    
    this.updateHeroStats();
        
    return totalDamage;
  }

  heal(amount) {
    this.stats.currentHealth = Math.min(this.stats.currentHealth + amount, this.stats.maxHealth);
    this.scene.uiManager.showFloatingAmount(this, `+${amount}`, -20, '#80ff80');
    this.updateHeroStats();
  }

  increaseAttack(amount) {
    this.stats.attack += amount;

    let color = amount > 0 ? '#87CEFA' : '#FFFF00';
    let amountText = amount > 0 ? `+${amount}` : amount;

    this.scene.uiManager.showFloatingAmount(this, amountText, -20, color);
    this.updateHeroStats();
  }

  die() {
    console.log(`${this.name} foi derrotado!`);
    this.state.isAlive = false;
  
    const gameState = this.scene?.gameManager?.gameState;
    const heroId = this.id;
  
    if (gameState?.players) {
      for (const player of gameState.players) {
        const hero = player.heroes.find(h => h.id === heroId);
        if (hero) {
          hero.state.isAlive = false;
          break;
        }
      }
    } else {
      console.warn(`gameState.players não está disponível ao matar ${this.name}`);
    }
  
    const hexHeroDie = this.state.position
      ? this.scene.board?.getHexByLabel(this.state.position)
      : null;
  
    if (hexHeroDie) {
      this.scene.board?.handleHeroDeath(this, hexHeroDie);
    }
  
    this.scene.gameUI?.updateGamePanel(this.scene.gameManager?.turnManager?.players ?? []);
  }  

  processStatusEffects() {
    this.state.statusEffects = this.state.statusEffects.filter(effect => {
      if (effect.effect) effect.effect(this);
  
      const stillActive = effect.duration > 1 || effect.duration === Infinity;
  
      if (!stillActive) {
        if (effect.type === 'poison' && this.effectSprites.poison) {
          this.effectSprites.poison.destroy();
          delete this.effectSprites.poison;
        }
      } else {
        if (effect.duration !== Infinity) effect.duration--;
  
        if (effect.type === 'poison' && this.effectSprites.poison) {
          if (!this.effectSprites.poison) return;

          let frame = 0; 
        
          if (effect.duration === 2) frame = 1;
          else if (effect.duration === 1) frame = 2; 
        
          this.effectSprites.poison.setFrame(frame);
        }
      }
  
      return stillActive;
    });
  
    this.updateHeroStats();
  }

  startTurn() {
      this.triggerSkills('onTurnStart');
      this.updateHeroStats();
  }

  endTurn() {
      this.processStatusEffects();
      this.triggerSkills('onTurnEnd');
      this.updateHeroStats();
  }

  counterAttack(target) {
    this.scene.time.delayedCall(1000, () => {
      console.log(`${this.name} realiza um contra-ataque em ${target.name}!`);
      this.damageApplied = false;

      this.triggerSkills('onCounterAttack', target, true);

      if(!this.damageApplied){
        target.takeDamage(this.stats.attack, this, true);
      }

      this.scene.uiManager.heroTalk(this, 'contra-ataque!');
      this.firstAttack = true;
      this.updateHeroStats();
    });
  }

  addPoisonEffect() {
    if (this.effectSprites.poison) {
      this.effectSprites.poison.setFrame(0);
      return;
    }
  
    const poison = this.scene.add.sprite(20, -20, 'poison_effect', 0);
    poison.setScale(0.1);
    poison.setDepth(10);
    this.add(poison);
  
    this.effectSprites.poison = poison;
  }
    
  updateHeroStats() {
    if (!this.state.isAlive) return;
    
    const health = this.hp;
    const attackBase = this.attack;
    const { currentHealth, attack } = this.stats;
    
    if (this.attackText) {
      this.attackText.setText(`${attack}`);

      if (attack > attackBase) {
        this.attackText.setColor('#87CEFA');
      } else {
        this.attackText.setColor('#FFFFFF');
      }
    }
    
    if (this.healthText) {
      this.healthText.setText(`${currentHealth}`);
    
      if (currentHealth < health) {
        this.healthText.setColor('#FF6666');
      } else {
        this.healthText.setColor('#FFFFFF');
      }
    }

    this.scene.gameManager.updateHeroStats(this.id, {
      currentHealth: this.stats.currentHealth,
      isAlive: this.state.isAlive,
      currentAttack: this.stats.attack,
      statusEffects: this.state.statusEffects,
      firstAttack: this.firstAttack
    });
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      stats: {
        attack: this.stats?.attack ?? this.attack ?? 1,
        maxHealth: this.stats?.maxHealth ?? this.hp ?? 5,
        ability: this.ability ?? null
      },
      state: this.state,
      abilities: this.skills?.map(skill => skill?.key).filter(Boolean) || [],
      position: this.state?.position ?? null,
      frame: this.frameIndex ?? 0,
      playerId: this.playerId
    };
  }  
}

export default Hero;
