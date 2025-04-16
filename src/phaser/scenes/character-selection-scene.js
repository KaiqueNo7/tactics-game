import { Gold, Vic, Dante, Ralph, Ceos, Blade } from '../../heroes/heroes.js'; 
import socket from '../../services/game-api-service.js';
import { SOCKET_EVENTS } from '../../../api/events.js';

export default class CharacterSelectionScene extends Phaser.Scene {
  constructor() {
    super('CharacterSelectionScene');

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

    // Ordem personalizada de seleção
    this.selectionOrder = [
      { player: 1, count: 1 },
      { player: 2, count: 2 },
      { player: 1, count: 2 },
      { player: 2, count: 1 }
    ];
    this.currentStep = 0;
    this.currentStepCount = 0;
  }

  preload() {
    this.load.spritesheet('heroes', 'assets/sprites/heroes.png', {
      frameWidth: 59,
      frameHeight: 64
    });
  }

  create(data) {
    if (!data || !data.roomId || !data.players) {
      console.warn('Acesso inválido à CharacterSelectionScene. Redirecionando...');
      this.scene.start('FindingMatchScene');
      return;
    }

    const { roomId, players } = data;
    this.roomId = roomId;
    this.players = players;
    this.socket = socket;
    this.playerNumber = socket.id === players[0] ? 1 : 2;
  
    console.log(`Você é o Jogador ${this.playerNumber} na sala ${roomId}`);

    const { width } = this.scale;

    this.add.text(width / 2, 40, 'Selecione seus Heróis', {
      fontSize: '40px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.statusText = this.add.text(width / 2, 90, '', {
      fontSize: '24px',
      color: '#dddddd',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.drawHeroOptions();
    this.createHeroDetailUI();
    this.updateStatusText();
    this.setupSocketEvents();

    this.heroDisplayP1 = this.add.group();
    this.heroDisplayP2 = this.add.group();
  }

  setupSocketEvents() {
    this.socket.on(SOCKET_EVENTS.HERO_SELECTED, ({ roomId, heroName, player, step }) => {
      console.log(`Recebi seleção do jogador ${player}: ${heroName} (step ${step})`);
  
      if (player === this.playerNumber) return;
  
      const heroData = this.HERO_DATA.find(h => h.name === heroName);
      if (!heroData) {
        console.warn(`Herói não encontrado: ${heroName}`);
        return;
      }
  
      const heroSpriteObj = this.heroSprites.find(h => h.name === heroName);
      if (heroSpriteObj) {
        heroSpriteObj.sprite.setTint(0x555555).disableInteractive();
        heroSpriteObj.highlight.setVisible(true);
      }
  
      // Atualiza a lista de seleção do outro jogador
      const opponentSelection = player === 1 ? this.selectedHeroesP1 : this.selectedHeroesP2;
      opponentSelection.push(heroName);
  
      this.updateSelectedHeroDisplay(player, heroData);

      this.currentStep = step;
      this.currentStepCount = 0;
    
      this.updateStatusText();
    });
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
    const { width } = this.scale;

    this.detailBox = this.add.image(width / 2, 400, 'character-box')
      .setOrigin(0.5)
      .setVisible(false);

    this.heroNameText = this.add.text(width / 2, 340, '', {
      fontSize: '22px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setVisible(false);

    this.abilitiesText = this.add.text(width / 2, 370, '', {
      fontSize: '16px',
      color: '#dddddd',
      align: 'center',
      wordWrap: { width: 280 },
      fontFamily: 'Arial'
    }).setOrigin(0.5).setVisible(false);

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
    if (!this.isCurrentPlayerTurn()) {
      console.log('Não é sua vez!');
      return;
    }
  
    if (
      this.selectedHeroesP1.includes(hero.name) ||
      this.selectedHeroesP2.includes(hero.name)
    ) return;

    if (
      this.selectedHeroesP1.includes(hero.name) ||
      this.selectedHeroesP2.includes(hero.name)
    ) return;
  
    if (this.previewedSprite) {
      this.tweens.add({
        targets: this.previewedSprite,
        scale: 2,
        duration: 150,
        ease: 'Power1'
      });
    }
  
    this.previewedHero = hero;
  
    const heroSpriteObj = this.heroSprites.find(h => h.name === hero.name);
    if (heroSpriteObj) {
      this.previewedSprite = heroSpriteObj.sprite;

      this.tweens.add({
        targets: this.previewedSprite,
        scale: 2.5,
        duration: 200,
        ease: 'Power2'
      });
    }
  
    const abilitiesFormatted = hero.abilities.map(a => `${a.name}: ${a.description}`).join('\n');
  
    this.heroNameText
      .setText(`${hero.name}  |  🧡 ${hero.stats.hp}  |  ⚔️ ${hero.stats.attack}`)
      .setVisible(true)
      .setY(330);
  
    this.abilitiesText
      .setText(`Habilidades:\n${abilitiesFormatted}`)
      .setVisible(true)
      .setY(420);
  
    this.confirmButton
      .setVisible(true)
      .setY(500);
  }  

  hideHeroDetail() {
    this.heroNameText.setVisible(false);
    this.abilitiesText.setVisible(false);
    this.confirmButton.setVisible(false);
    this.previewedHero = null;
  
    if (this.previewedSprite) {
      this.tweens.add({
        targets: this.previewedSprite,
        scale: 2,
        duration: 150,
        ease: 'Power1'
      });
      this.previewedSprite = null;
    }
  }

  isCurrentPlayerTurn() {
    const currentStep = this.selectionOrder[this.currentStep];
    return currentStep && currentStep.player === this.playerNumber;
  }  
  
  confirmSelection(hero) {
    const currentPlayer = this.selectionOrder[this.currentStep].player;
    const currentSelection = currentPlayer === 1 ? this.selectedHeroesP1 : this.selectedHeroesP2;

    console.log(`Jogador ${currentPlayer} selecionou: ${hero.name}`); 

    if (currentSelection.includes(hero.name)) return;

    currentSelection.push(hero.name);

    this.updateSelectedHeroDisplay(currentPlayer, hero);

    const heroSpriteObj = this.heroSprites.find(h => h.name === hero.name);
    if (heroSpriteObj) {
      heroSpriteObj.sprite.setTint(0x555555).disableInteractive();
      heroSpriteObj.highlight.setVisible(true);
    }

    this.currentStepCount++;
    const expectedCount = this.selectionOrder[this.currentStep].count;

    if (this.currentStepCount >= expectedCount) {
      this.currentStep++;
      this.currentStepCount = 0;
    }

    this.socket.emit(SOCKET_EVENTS.HERO_SELECTED, {
      roomId: this.roomId,
      heroName: hero.name,
      player: currentPlayer,
      step: this.currentStep
    }); 

    if (this.currentStep >= this.selectionOrder.length) {
      this.startGame();
    } else {
      this.updateStatusText();
    }  
  }

  updateStatusText() {
    const current = this.selectionOrder[this.currentStep];
    if (!current) return;

    const currentSelection = current.player === 1 ? this.selectedHeroesP1 : this.selectedHeroesP2;
    const selected = currentSelection.length;
    const total = current.count;
  
    this.statusText.setText(`Jogador ${current.player}: escolha seu herói (${selected}/${total})`);
  }
  

  updateSelectedHeroDisplay(player, hero) {
    const spacing = 60;
    const baseY = 550;
    const baseX_P1 = 60;
    const baseX_P2 = this.scale.width - 60;

    const index = player === 1 ? this.selectedHeroesP1.length - 1 : this.selectedHeroesP2.length - 1;
    const x = player === 1 ? baseX_P1 + index * spacing : baseX_P2 - index * spacing;

    const sprite = this.add.sprite(x, baseY, 'heroes', hero.frame).setScale(1.2);
    if (player === 1) {
      this.heroDisplayP1.add(sprite);
    } else {
      this.heroDisplayP2.add(sprite);
    }
  }

  startGame() {
    this.socket.off('hero_selected');
    this.scene.start('BoardScene', {
      player1: this.selectedHeroesP1,
      player2: this.selectedHeroesP2
    });
  }
}
