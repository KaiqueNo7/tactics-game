import { Gold, Vic, Dante, Ralph, Ceos, Blade } from '../../heroes/heroes.js';

export default class CharacterSelectionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CharacterSelectionScene' });

    this.HERO_DATA = [
      Gold.data,
      Vic.data,
      Ralph.data,
      Ceos.data,
      Blade.data,
      Dante.data
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
    const { width, height } = this.scale;

    // Título
    this.add.text(width / 2, 40, 'Selecione seus Heróis', {
      fontSize: '40px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Status do jogador
    this.statusText = this.add.text(width / 2, 90, `Jogador 1: escolha seu herói (0/3)`, {
      fontSize: '24px',
      color: '#dddddd',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.drawHeroOptions();
    this.createHeroDetailUI();
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

      sprite.on('pointerdown', () => this.previewHero(hero));
    });
  }

  createHeroDetailUI() {
    const { width, height } = this.scale;

    // Caixa de detalhes personalizada
    this.detailBox = this.add.image(width / 2, 400, 'character-box').setOrigin(0.5).setVisible(false);

    // Nome do herói
    this.heroNameText = this.add.text(width / 2, 340, '', {
      fontSize: '22px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setVisible(false);

    // Habilidades
    this.abilitiesText = this.add.text(width / 2, 370, '', {
      fontSize: '16px',
      color: '#dddddd',
      align: 'center',
      wordWrap: { width: 280 },
      fontFamily: 'Arial'
    }).setOrigin(0.5).setVisible(false);

    // Botão de confirmar
    this.confirmButton = this.add.text(width / 2, 430, 'Confirmar', {
      fontSize: '20px',
      backgroundColor: '#00aa00',
      padding: { x: 10, y: 5 },
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setInteractive().setVisible(false);

    this.confirmButton.on('pointerdown', () => {
      if (this.previewedHero) {
        this.confirmSelection(this.previewedHero);
        this.hideHeroDetail();
      }
    });
  }

  previewHero(hero) {
    // Evita re-selecionar um já escolhido
    if (
      this.selectedHeroesP1.includes(hero.name) ||
      this.selectedHeroesP2.includes(hero.name)
    ) return;

    this.previewedHero = hero;

    this.heroNameText.setText(hero.name).setVisible(true);
    this.abilitiesText.setText(`Habilidades:\n- ${hero.abilities.map(a => `${a.name}: ${a.description}`).join('\n- ')}`).setVisible(true);
    this.confirmButton.setVisible(true);
  }

  hideHeroDetail() {
    this.heroNameText.setVisible(false);
    this.abilitiesText.setVisible(false);
    this.confirmButton.setVisible(false);
    this.previewedHero = null;
  }

  confirmSelection(hero) {
    const currentSelection = this.currentPlayer === 1 ? this.selectedHeroesP1 : this.selectedHeroesP2;

    if (currentSelection.length >= 3) return;
    currentSelection.push(hero.name);

    this.updateStatusText();

    const heroSpriteObj = this.heroSprites.find(h => h.name === hero.name);
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
