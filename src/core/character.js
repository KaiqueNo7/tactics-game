export default class Character extends Phaser.GameObjects.Graphics {
    constructor(scene, config) {
        const { 
            x = 0, 
            y = 0, 
            texture = 'defaultTexture', 
            name, 
            health = 30, 
            attack = 20, 
            color = 'blue',
            abilities = {
                passive: [],
                specialSkills: [],
                movement: {
                    baseRange: 2,
                    sprint: false
                }
            }
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
        };

        this.abilities = abilities;

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
