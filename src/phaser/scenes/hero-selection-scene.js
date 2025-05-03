import { Gold, Vic, Dante, Ralph, Ceos, Blade } from '../../heroes/heroes.js'; 
import socket from '../../services/game-api-service.js';
import { SOCKET_EVENTS } from '../../../api/events.js';

const HERO_CLASSES = {
  Blade,
  Ceos,
  Dante,
  Gold,
  Ralph,
  Vic
};

export default class HeroSelectionScene extends Phaser.Scene {
  constructor() {
    super('HeroSelectionScene');

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

    this.selectionOrder = [
      { count: 1, player: 1 },
      { count: 2, player: 2 },
      { count: 2, player: 1 },
      { count: 1, player: 2 }
    ];
    this.currentStep = 0;
    this.currentStepCount = 0;
  }

  preload() {
    this.load.spritesheet('heroes', 'assets/sprites/heroes.png', {
      frameHeight: 64,
      frameWidth: 59
    });
    this.load.image('hexagon_empty', 'assets/ui/hex_tile.png');
  }

  create(data) {
    if (!data || !data.roomId || !data.players) {
      console.warn('Acesso inválido à HeroSelectionScene. Redirecionando...');
      this.scene.start('FindingMatchScene');
      return;
    }

    const { roomId, players } = data;

    this.roomId = roomId;
    this.players = players;

    this.socket = socket;
  
    console.log(`Você está na sala ${roomId}`);

    const padding = 100;
    const { width } = this.scale;

    const player1 = this.players.find(p => p.index === 1);
    const player2 = this.players.find(p => p.index === 2);

    this.player1NameText = this.add.text(padding, 40, player1.name, {
      color: '#ffffff',
      fontFamily: 'Arial',
      fontSize: '20px'
    }).setOrigin(0, 0.5);
    
    this.player2NameText = this.add.text(width - padding, 40, player2.name, {
      color: '#ffffff',
      fontFamily: 'Arial',
      fontSize: '20px'
    }).setOrigin(1, 0.5);
    
    this.add.text(width / 2, 40, 'VS', {
      color: '#ffffff',
      fontFamily: 'Arial',
      fontSize: '24px',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.namePlayerText = this.add.text(width / 2, 80, '', {
      color: '#dddddd',
      fontSize: '12px'
    }).setOrigin(0.5);

    this.turnInfoText = this.add.text(this.scale.width / 2,  this.scale.height / 2 + 275, '', {
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);    

    this.heroSlotsP1 = [];
    this.heroSlotsP2 = [];

    const spacing = 60;
    const baseY = 70;
    const offsetY = 50;
    const y = baseY + offsetY;

    const baseX_P1 = 60;
    const baseX_P2 = this.scale.width - 60;

    for (let i = 0; i < 3; i++) {
      const slotP1 = this.add.image(baseX_P1 + i * spacing, y, 'hexagon_empty').setScale(1.2);
      this.heroSlotsP1.push(slotP1);

      const slotP2 = this.add.image(baseX_P2 - i * spacing, y, 'hexagon_empty').setScale(1.2);
      this.heroSlotsP2.push(slotP2);
    }

    this.drawHeroOptions();
    this.createHeroDetailUI();
    this.updateNamePlayerText();
    this.setupSocketEvents();
    
    this.heroDisplayP1 = this.add.group();
    this.heroDisplayP2 = this.add.group();

    this.autoSelectHeroesForTesting();

    this.socket.on(SOCKET_EVENTS.START_GAME, ({ roomId, players, startedPlayerIndex }) => {
      const resolvedHeroes = heroNames => heroNames.map(name => this.HERO_DATA.find(h => h.name === name));

      const player1 = players.find(p => p.index === 1);
      const player2 = players.find(p => p.index === 2);

      this.scene.start('PreMatchScene', {
        players: [
          { ...player1, heroesData: resolvedHeroes(this.selectedHeroesP1) },
          { ...player2, heroesData: resolvedHeroes(this.selectedHeroesP2) }
        ],
        roomId: roomId,
        startedPlayerIndex
      });
    });
      
    this.input.on('pointerdown', (pointer) => {
      const clickedHero = this.heroSprites.some(heroObj =>
        heroObj.sprite.getBounds().contains(pointer.x, pointer.y)
      );
    
      if (!clickedHero && this.previewedHero) {
        this.hideHeroDetail();
      }
    });    
  }

  autoSelectHeroesForTesting() {
    const presetP1 = ['Gold', 'Vic', 'Blade'];
    const presetP2 = ['Ralph', 'Ceos', 'Dante'];
  
    // Preenche como se fosse a seleção feita manualmente
    this.selectedHeroesP1 = [];
    this.selectedHeroesP2 = [];
  
    presetP1.forEach(name => {
      const heroData = this.HERO_DATA.find(h => h.name === name);
      if (heroData) {
        this.selectedHeroesP1.push(name);
        this.updateSelectedHeroDisplay(1, heroData);
      }
    });
  
    presetP2.forEach(name => {
      const heroData = this.HERO_DATA.find(h => h.name === name);
      if (heroData) {
        this.selectedHeroesP2.push(name);
        this.updateSelectedHeroDisplay(2, heroData);
      }
    });
  
    // Marca seleção como completa e inicia o jogo
    this.currentStep = this.selectionOrder.length;
    this.currentStepCount = 0;
    this.startGame();
  }
     

  setupSocketEvents() {
    this.socket.on(SOCKET_EVENTS.HERO_SELECTED, ({ heroName, player, step }) => {
      console.log(`Recebi seleção do jogador ${player}: ${heroName} (step ${step})`);
  
      if (player === this.playerNumber) return;
  
      const heroData = this.HERO_DATA.find(h => h.name === heroName);
      if (!heroData) {
        console.warn(`Herói não encontrado: ${heroName}`);
        return;
      }
  
      const heroSpriteObj = this.heroSprites.find(h => h.name === heroName);
      if (heroSpriteObj && heroSpriteObj.hex) {
        const color = player === 1 ? 0x3344ff : 0xff3333;
        heroSpriteObj.hex.clear();
        heroSpriteObj.hex.fillStyle(color, 0.7);
        heroSpriteObj.hex.lineStyle(2, 0xffffff, 1);
      
        const size = 50;
        const x = heroSpriteObj.sprite.x;
        const y = heroSpriteObj.sprite.y;
      
        const points = [];
        for (let i = 0; i < 6; i++) {
          const angle = Phaser.Math.DegToRad(60 * i - 30);
          points.push({ x: x + size * Math.cos(angle), y: y + size * Math.sin(angle) });
        }
      
        heroSpriteObj.hex.beginPath();
        heroSpriteObj.hex.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          heroSpriteObj.hex.lineTo(points[i].x, points[i].y);
        }
        heroSpriteObj.hex.closePath();
        heroSpriteObj.hex.fillPath();
        heroSpriteObj.hex.strokePath();
      }

      const opponentSelection = player === 1 ? this.selectedHeroesP1 : this.selectedHeroesP2;
      opponentSelection.push(heroName);
  
      this.updateSelectedHeroDisplay(player, heroData);

      this.currentStep = step;
      this.currentStepCount = 0;
    
      this.updateNamePlayerText();
    });
  }

  drawHeroOptions() {
    const size = 50;
    const spacingX = size * 1;
    const spacingY = size * Math.sqrt(3);
    const offsetY = spacingY / 1;
  
    const totalHeroes = this.HERO_DATA.length;
    const totalWidth = spacingX * (totalHeroes - 1);
    const centerY = this.scale.height / 2 + 200;
    const startX = this.scale.width / 2 - totalWidth / 2;
  
    this.heroSprites = [];
  
    this.HERO_DATA.forEach((hero, index) => {
      const x = startX + index * spacingX;
      const y = centerY + ((index % 2) ? -offsetY : 0);
  
      // Criação do gráfico (hexágono)
      const hex = this.add.graphics();
      hex.fillStyle(0x4e5d6c, 0.6); // padrão
      hex.lineStyle(2, 0xaaaaaa, 0.8);
  
      const points = [];
      for (let i = 0; i < 6; i++) {
        const angle = Phaser.Math.DegToRad(60 * i - 30);
        points.push({
          x: x + size * Math.cos(angle),
          y: y + size * Math.sin(angle)
        });
      }
  
      hex.beginPath();
      hex.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        hex.lineTo(points[i].x, points[i].y);
      }
      hex.closePath();
      hex.fillPath();
      hex.strokePath();
  
      // Sprite do herói
      const sprite = this.add.sprite(x, y, 'heroes', hero.frame)
        .setInteractive()
        .setScale(1)
        .setData('heroName', hero.name);
  
      // Animação de hover
      sprite.on('pointerover', () => {
        if (!this.selectedHeroesP1.includes(hero.name) && !this.selectedHeroesP2.includes(hero.name)) {
          this.tweens.add({
            targets: sprite,
            scale: 1.2,
            duration: 150
          });
        }
      });
  
      sprite.on('pointerout', () => {
        if (!this.selectedHeroesP1.includes(hero.name) && !this.selectedHeroesP2.includes(hero.name)) {
          this.tweens.add({
            targets: sprite,
            scale: 1,
            duration: 150
          });
        }
      });
  
      // Highlight visível se selecionado
      const highlight = this.add.rectangle(x, y + 45, 20, 20, 0x00ff00)
        .setVisible(false);
  
      this.heroSprites.push({ highlight, name: hero.name, sprite, hex });
  
      // Clique no herói
      sprite.on('pointerdown', () => this.previewHero(hero));
    });
  }  

  createHeroDetailUI() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2 - 100;
  
    this.previewSprite = this.add.sprite(centerX - 80, centerY, 'heroes', 0)
      .setScale(2)
      .setOrigin(0.5)
      .setVisible(false);
  
      this.heroNameText = this.add.text(centerX - 80, centerY - 60, '', {
        fontSize: '32px',
        color: '#ccc',
        stroke: '#6e4c1e',
        strokeThickness: 3,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: '#000000',
          blur: 4,
          fill: true
        }
      })
      .setOrigin(0.5, 1) 
      .setVisible(false);  

    this.heroStatsText = this.add.text(centerX - 20, centerY - 60, '', {
      color: '#ffffff',
      fontSize: '16px',
    }).setOrigin(0, 0).setVisible(false);

    this.heroAbilitiesText = this.add.text(centerX - 20, centerY - 90, '', {
      color: '#ffffff',
      fontSize: '16px',
    }).setOrigin(0, 0).setVisible(false);
  
    this.heroSkillsText = this.add.text(centerX - 20, centerY - 25, '', {
      fontSize: '16px',
      wordWrap: { width: 260 }
    }).setOrigin(0, 0).setVisible(false);

    this.confirmButton = this.add.text(centerX - 20, centerY + 100, 'Selecionar', {
      backgroundColor: '#8b4513',
      color: '#fff8dc',
      fontSize: '18px',
      fontFamily: 'Arial',
      padding: { x: 12, y: 6 },
      border: 1,
      align: 'center'
    }).setOrigin(0)
      .setInteractive()
      .setVisible(false);
  
    this.confirmButton.on('pointerdown', () => {
      if (this.previewedHero) {
        this.confirmSelection(this.previewedHero);
        this.hideHeroDetail();
      }
    });
  }  
  
  previewHero(hero) {
    if (
      this.selectedHeroesP1.includes(hero.name) ||
      this.selectedHeroesP2.includes(hero.name)
    ) return;
  
    if (this.previewedSprite) {
      this.tweens.add({
        duration: 150,
        ease: 'Power1',
        scale: 1,
        targets: this.previewedSprite
      });
    }
  
    this.previewedHero = hero;
  
    const heroSpriteObj = this.heroSprites.find(h => h.name === hero.name);
    if (heroSpriteObj) {
      this.previewedSprite = heroSpriteObj.sprite;
      this.tweens.add({ duration: 200, ease: 'Power2', scale: 1, targets: this.previewedSprite });
    }
  
    const abilitiesFormatted = hero.abilities.map(a => `${a.description}`).join('\n');
  
    this.previewSprite.setTexture('heroes', hero.frame).setVisible(true);
    this.heroNameText.setText(`${hero.name}`).setVisible(true);
    this.heroStatsText.setText(`attack: ${hero.stats.attack} hp: ${hero.stats.hp}`).setVisible(true);
    if(hero.stats.ability) {
      this.heroAbilitiesText.setText(`${hero.stats.ability}`).setVisible(true);
    } else {
      this.heroAbilitiesText.setText(``).setVisible(true);
    }
    this.heroSkillsText.setText(`${abilitiesFormatted}`).setVisible(true);
    this.confirmButton.setVisible(this.isCurrentPlayerTurn());
  }  

  hideHeroDetail() {
    this.previewSprite.setVisible(false);
    this.heroNameText.setVisible(false);
    this.heroStatsText.setVisible(false);
    this.heroAbilitiesText.setVisible(false);
    this.heroSkillsText.setVisible(false);
    this.confirmButton.setVisible(false);
    this.previewedHero = null;
  }  

  isCurrentPlayerTurn() {
    const currentStep = this.selectionOrder[this.currentStep];
    return currentStep && currentStep.player === this.playerNumber;
  }  
  
  confirmSelection(hero) {
    const currentPlayer = this.selectionOrder[this.currentStep].player;
    const currentSelection = currentPlayer === 1 ? this.selectedHeroesP1 : this.selectedHeroesP2;
    
    if (currentPlayer !== this.playerNumber) return;
    if (currentSelection.includes(hero.name)) return;

    console.log(`Jogador ${currentPlayer} selecionou: ${hero.name}`); 

    currentSelection.push(hero.name);

    this.updateSelectedHeroDisplay(currentPlayer, hero);

    const heroSpriteObj = this.heroSprites.find(h => h.name === hero.name);

    if (heroSpriteObj && heroSpriteObj.hex) {
      const color = currentPlayer === 1 ? 0x3344ff : 0xff3333;
      heroSpriteObj.hex.clear();
      heroSpriteObj.hex.fillStyle(color, 0.7);
      heroSpriteObj.hex.lineStyle(2, 0xffffff, 1);
    
      const size = 50;
      const x = heroSpriteObj.sprite.x;
      const y = heroSpriteObj.sprite.y;
    
      const points = [];
      for (let i = 0; i < 6; i++) {
        const angle = Phaser.Math.DegToRad(60 * i - 30);
        points.push({ x: x + size * Math.cos(angle), y: y + size * Math.sin(angle) });
      }
    
      heroSpriteObj.hex.beginPath();
      heroSpriteObj.hex.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        heroSpriteObj.hex.lineTo(points[i].x, points[i].y);
      }
      heroSpriteObj.hex.closePath();
      heroSpriteObj.hex.fillPath();
      heroSpriteObj.hex.strokePath();
    }

    this.currentStepCount++;
    const expectedCount = this.selectionOrder[this.currentStep].count;

    if (this.currentStepCount >= expectedCount) {
      this.currentStep++;
      this.currentStepCount = 0;
    }

    this.socket.emit(SOCKET_EVENTS.HERO_SELECTED, {
      heroName: hero.name,
      player: currentPlayer,
      roomId: this.roomId,
      step: this.currentStep
    }); 

    if (this.currentStep >= this.selectionOrder.length) {
      this.startGame();
    } else {
      this.updateNamePlayerText();
    }  
  }

  updateNamePlayerText() {
    const current = this.selectionOrder[this.currentStep];
    if (!current) return;

    if (current.player === this.playerNumber) {
      this.turnInfoText.setText('É a sua vez de escolher um herói').setStyle({ color: '#ffd700' });
    } else {
      this.turnInfoText.setText('Aguardando o oponente escolher...').setStyle({ color: '#cccccc' });
    }    
  
    this.player1NameText.setStyle({
      color: current.player === 1 ? '#ffd700' : '#ffffff',
      fontStyle: current.player === 1 ? 'bold' : 'normal'
    });
  
    this.player2NameText.setStyle({
      color: current.player === 2 ? '#ffd700' : '#ffffff',
      fontStyle: current.player === 2 ? 'bold' : 'normal'
    });
  }
  
  updateSelectedHeroDisplay(player, hero) {
    const index = player === 1 ? this.selectedHeroesP1.length - 1 : this.selectedHeroesP2.length - 1;
  
    let slot;
    if (player === 1) {
      slot = this.heroSlotsP1[index];
    } else {
      slot = this.heroSlotsP2[index];
    }
  
    if (slot) {
      slot.destroy();

      const sprite = this.add.sprite(slot.x, slot.y, 'heroes', hero.frame).setScale(1.2);
  
      if (player === 1) {
        this.heroDisplayP1.add(sprite);
      } else {
        this.heroDisplayP2.add(sprite);
      }
    }
  }
  
  startGame() {
    this.socket.off(SOCKET_EVENTS.HERO_SELECTED);
  
    const player1 = this.players.find(p => p.index === 1);
    const player2 = this.players.find(p => p.index === 2);
  
    player1.heroes = this.selectedHeroesP1;
    player2.heroes = this.selectedHeroesP2;
  
    this.socket.emit(SOCKET_EVENTS.SELECTION_COMPLETE, {
      heroes: {
        player1: this.selectedHeroesP1,
        player2: this.selectedHeroesP2
      },
      players: [player1, player2],
      roomId: this.roomId
    });
  }  
}