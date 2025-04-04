export default class Character extends Phaser.GameObjects.Graphics {
    constructor(scene, x, y, texture, name, attack, hp, ability, skill) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.name = name;
        this.attack = attack;
        this.hp = hp;
        this.ability = ability;
        this.skill = skill;

        this.statusEffects = [];
        this.taunt = ability === 'Taunt';

        // Adiciona os atributos compatíveis com seu sistema antigo
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

    takeDamage(amount) {
        this.stats.currentHealth = Math.max(0, this.stats.currentHealth - amount);

        if (this.stats.currentHealth === 0) {
            this.state.isAlive = false;
            this.destroy();
        }
    }
}
