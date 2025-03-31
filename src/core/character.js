export default class Character extends Phaser.GameObjects.Graphics {
    constructor(scene, config) {
        const { 
            x = 0, 
            y = 0, 
            texture = 'defaultTexture', 
            name, 
            health = 100, 
            attack = 20, 
            defense = 10, 
            color = 'blue' 
        } = config;

        super(scene, x, y, texture);

        scene.add.existing(this);

        this.id = Date.now() + Math.random();
        this.name = name;
        this.color = color;

        this.stats = {
            maxHealth: health,
            currentHealth: health,
            attack: attack,
            defense: defense
        };

        this.abilities = {
            passive: [],
            active: [],
            specialSkills: [],
            movement: {
                baseRange: 2,
                sprint: false
            }
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
            this.destroy(); // Remove o sprite da cena quando morrer
        }
    }
}
