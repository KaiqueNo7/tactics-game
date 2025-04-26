import { skills } from '../heroes/skills.js';

class Hero extends Phaser.GameObjects.Container {
  constructor(scene, x, y, frameIndex, name, attack, hp, ability, skillNames = [], playerId = null, socket = null) {
    super(scene, x, y);

    this.scene = scene;
    scene.add.existing(this);

    this.socket = socket || scene.socket;

    this.playerId = playerId;

    const sprite = scene.add.sprite(0, 0, 'heroes', frameIndex || 0);
    sprite.setScale(0.8);
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
    this.applyTaunt();
    this.setInteractive();
    this.id = crypto.randomUUID();
  }

  addPlayerId(playerId) {
    this.playerId = playerId;
  }

  attackTarget(target) {
    console.log(`${this.name} ataca ${target.name}!`);
    this.triggerSkills('onAttack', target);
    this.updateHeroStats();
    return true;
  } 

  applyTaunt() {
    if (this.ability === 'Taunt') {
      this.addTauntEffect();
    }
  }

  addTauntEffect() {
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
    
  takeDamage(amount, attacker = null) {
    let extraDamage = this.state.statusEffects.filter(effect => effect.type === 'wound').length;
        
    const totalDamage = amount + extraDamage;
        
    this.stats.currentHealth -= totalDamage;

    this.scene.uiManager.showFloatingAmount(this, `-${totalDamage}`);
    
    console.log(`${this.name} recebeu ${totalDamage} de dano. Vida restante: ${this.stats.currentHealth}`);
        
    this.scene.uiManager.playDamageAnimation(this);
        
    if (this.stats.currentHealth <= 0) {
      this.die();
    }
        
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

    let color = amount > 0 ? '#87CEFA' : '#ff8080';
    let amountText = amount > 0 ? `+${amount}` : amount;

    this.scene.uiManager.showFloatingAmount(this, amountText, -20, color);
    this.updateHeroStats();
  }

  die() {
    console.log(`${this.name} foi derrotado!`);
    this.state.isAlive = false;
    const hexHeroDie = this.scene.board.getHexByLabel(this.state.position);
    this.scene.uiManager.updateGamePanel(this.scene.game.gameManager.turnManager.players);
    this.scene.board.handleHeroDeath(this, hexHeroDie);
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

  placeOnBoard(scene, hex, playerNumber, container) {
    this.setPosition(hex.x, hex.y);
    
    const hexColor = playerNumber === 1 ? 'hexagon_blue' : 'hexagon_red';
    
    this.hexBg = scene.add.image(0, 0, hexColor)
      .setDisplaySize(this.spriteSize || 92, this.spriteSize || 92)
      .setAngle(30);
    
    this.add(this.hexBg);
    
    scene.uiManager.createStatsUI(this);
    
    this.on('pointerdown', () => {
      if (scene.board.selectedHero) {
        scene.board.attackHero(scene.board.selectedHero, this);
      } else {
        scene.board.selectHero(this);
      }
    });
    
    container.add(this);
    
    this.setDepth(2);
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
    this.scene.time.delayedCall(1000, () => {
      console.log(`${this.name} realiza um contra-ataque em ${target.name}!`);
      target.takeDamage(this.stats.attack, this, true);
      this.updateHeroStats();
    });
  }

  addPoisonEffect() {
    if (this.effectSprites.poison) return;

    const poison = this.scene.add.image(20, -20, 'poison');
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
  }

  hasSkill(skillKey) {
    return this.skills.some(skill => skill.key === skillKey);
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
