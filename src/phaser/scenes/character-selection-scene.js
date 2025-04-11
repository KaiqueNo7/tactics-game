// src/scenes/CharacterSelectionScene.js

export default class CharacterSelectionScene extends Phaser.Scene {
  constructor() {
      super({ key: 'CharacterSelectionScene' });

      this.HERO_DATA = [
          { name: 'Ralph', frame: 0 },
          { name: 'Vic', frame: 1 },
          { name: 'Gold', frame: 2 },
          { name: 'Blade', frame: 3 },
          { name: 'Dante', frame: 4 },
          { name: 'Ceos', frame: 5 },
      ];

      this.selectedHeroesP1 = [];
      this.selectedHeroesP2 = [];
      this.currentPlayer = 1;
  }

  preload() {
      this.load.spritesheet('heroes', 'assets/sprites/heroes.png', {
          frameWidth: 59,
          frameHeight: 64
      });
  }

  create() {
      const { width } = this.scale;

      this.add.text(width / 2, 40, 'Selecione seus Heróis', {
          fontSize: '32px',
          color: '#ffffff'
      }).setOrigin(0.5);

      this.statusText = this.add.text(width / 2, 90, `Jogador 1: escolha seu herói (0/3)`, {
          fontSize: '24px',
          color: '#dddddd'
      }).setOrigin(0.5);

      this.drawHeroOptions();
  }

  drawHeroOptions() {
      const startX = 100;
      const spacing = 100;
      const y = 200;

      this.heroSprites = [];

      this.HERO_DATA.forEach((hero, index) => {
          const sprite = this.add.sprite(startX + index * spacing, y, 'heroes', hero.frame)
              .setInteractive()
              .setScale(2)
              .setData('heroName', hero.name);

          const highlight = this.add.rectangle(sprite.x, sprite.y + 45, 20, 20, 0x00ff00)
              .setVisible(false);

          this.heroSprites.push({ name: hero.name, sprite, highlight });

          sprite.on('pointerdown', () => this.selectHero(hero.name));
      });
  }

  selectHero(heroName) {
      const currentSelection = this.currentPlayer === 1 ? this.selectedHeroesP1 : this.selectedHeroesP2;

      if (currentSelection.length >= 3) return;

      // Impede seleção duplicada
      if (this.selectedHeroesP1.includes(heroName) || this.selectedHeroesP2.includes(heroName)) return;

      currentSelection.push(heroName);
      this.updateStatusText();

      // Aplica efeito visual
      const heroSpriteObj = this.heroSprites.find(h => h.name === heroName);
      if (heroSpriteObj) {
          heroSpriteObj.sprite.setTint(0x555555).disableInteractive();
          heroSpriteObj.highlight.setVisible(true);
      }

      if (currentSelection.length === 3) {
          if (this.currentPlayer === 1) {
              this.currentPlayer = 2;
              this.updateStatusText();
          } else {
              this.startGame();
          }
      }
  }

  updateStatusText() {
      const currentSelection = this.currentPlayer === 1 ? this.selectedHeroesP1 : this.selectedHeroesP2;
      this.statusText.setText(`Jogador ${this.currentPlayer}: escolha seu herói (${currentSelection.length}/3)`);
  }

  startGame() {
      this.scene.start('BoardScene', {
          player1: this.selectedHeroesP1,
          player2: this.selectedHeroesP2
      });
  }
}
