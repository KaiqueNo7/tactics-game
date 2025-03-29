export default class Character {
  constructor(config) {
      const {
          name, 
          health = 100, 
          attack = 20, 
          defense = 10, 
          color = 'blue'
      } = config;

      // Atributos básicos
      this.id = Date.now() + Math.random(); // Identificador único
      this.name = name;
      this.color = color;
      
      // Sistema de vida e combate
      this.stats = {
          maxHealth: health,
          currentHealth: health,
          attack: attack,
          defense: defense
      };

      // Sistema de habilidades avançado
      this.abilities = {
          passive: [],
          active: [],
          specialSkills: [],
          movement: {
              baseRange: 2,
              sprint: false
          }
      };

      // Estado de jogo
      this.state = {
          position: null,
          isAlive: true,
          statusEffects: []
      };
  }

  // Métodos de combate
  takeDamage(amount) {
      this.stats.currentHealth = Math.max(
          0, 
          this.stats.currentHealth - amount
      );
      
      if (this.stats.currentHealth === 0) {
          this.state.isAlive = false;
      }
  }

  heal(amount) {
      this.stats.currentHealth = Math.min(
          this.stats.maxHealth, 
          this.stats.currentHealth + amount
      );
  }

  // Gerenciamento de habilidades
  addPassiveAbility(ability) {
      this.abilities.passive.push(ability);
  }

  addActiveAbility(ability) {
      this.abilities.active.push(ability);
  }

  addSpecialSkill(skill) {
        this.abilities.specialSkills.push(skill);
    }

  // Cálculo de movimento
  getMovementRange() {
      return this.abilities.movement.sprint 
          ? this.abilities.movement.baseRange + 1 
          : this.abilities.movement.baseRange;
  }

  // Método de ataque
  attack(target) {
      const damage = Math.max(
          0, 
          this.stats.attack - target.stats.defense
      );
      
      target.takeDamage(damage);
      return damage;
  }

  // Serialização para comunicação/salvamento
  toJSON() {
      return {
          id: this.id,
          name: this.name,
          stats: this.stats,
          state: this.state,
          abilities: {
              passive: this.abilities.passive.map(a => a.name),
              active: this.abilities.active.map(a => a.name)
          }
      };
  }
}

// Fábrica de personagens com preset de tipos
export class CharacterFactory {
  static createWarrior(name, color = 'darkblue') {
      const warrior = new Character({
          name, 
          health: 120, 
          attack: 25, 
          defense: 15,
          color
      });

      warrior.addPassiveAbility({
          name: 'Resistência',
          effect: (character) => {
              // Exemplo: Reduz dano recebido quando saúde está baixa
              if (character.stats.currentHealth / character.stats.maxHealth < 0.3) {
                  character.stats.defense += 5;
              }
          }
      });

      return warrior;
  }

  static createArcher(name, color = 'royalblue') {
      const archer = new Character({
          name, 
          health: 90, 
          attack: 30, 
          defense: 8,
          color
      });

      archer.abilities.movement.sprint = true;

      archer.addActiveAbility({
          name: 'Tiro Preciso',
          effect: (target) => {
              // Dano extra em inimigos com baixa saúde
              if (target.stats.currentHealth / target.stats.maxHealth < 0.2) {
                  return 15;
              }
              return 0;
          }
      });

      return archer;
  }
}