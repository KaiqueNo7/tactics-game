import { getSocket } from '../../services/game-api-service.js';
import { SOCKET_EVENTS } from '../../../api/events.js';
import heroSelectionSocketListeners from '../../services/hero-selection-socket-events.js';
import { 
  createBackground, 
  createText, 
  getHeroData, 
  getUserData } from '../../utils/helpers.js';
import createHeroDetailUI from '../../ui/hero-detail-ui.js';

export default class HeroSelectionScene extends Phaser.Scene {
  constructor() {
    super('HeroSelectionScene');
  }

  preload() {
    this.load.spritesheet('heroes', 'assets/sprites/heroes.png', {
      frameWidth: 165,
      frameHeight: 231
    });

    this.load.spritesheet('faces_heroes', 'assets/sprites/faces_heroes.png', {
      frameWidth: 165,
      frameHeight: 165    
    });

    this.load.image('hexagon_empty', 'assets/ui/hex_tile.png');
  }

  async create(data) {
    if (!data || !data.roomId || !data.players) {
      console.warn('Acesso inválido à HeroSelectionScene. Redirecionando...');
      this.scene.start('FindingMatchScene');
      return;
    }

    this.user = getUserData();

    this.HERO_DATA = await getHeroData();

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
    this.selecting = false;
    
    const { width, height } = this.scale;
    
    createBackground(this, height, width);
    
    const { roomId, players } = data;
    
    this.user = getUserData();
    this.roomId = roomId;
    this.players = players;

    this.socket = getSocket();

    const padding = 20;

    this.player1 = players[0];
    this.player2 = players[1];

    const currentPlayerId = this.user.id;

    if (currentPlayerId === this.player1.id) {
      this.playerNumber = 1;
    } else if (currentPlayerId === this.player2.id) {
      this.playerNumber = 2;
    } else {
      console.warn('ID do jogador atual não corresponde a nenhum jogador da sala!');
      this.scene.start('MainMenuScene');
    }

    this.player1NameText = createText(this, padding, 40, this.player1.name, 16, '#ffffff')
      .setOrigin(0, 0.5);
    createText(this, width / 2, 40, 'VS', 16, '#ffffff');
    this.player2NameText = createText(this, width - padding, 40, this.player2.name, 16, '#ffffff')
    .setOrigin(1, 0.5);
    this.namePlayerText = createText(this, width / 2, 80, '', 16, '#ffffff');

    this.turnInfoText = this.add.text(this.scale.width / 2,  this.scale.height / 2 + 260, '', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Fredoka',
    }).setOrigin(0.5);    

    this.turnInfoText = createText(this, width / 2, height / 2 + 260, '.', 16, '#ffffff');

    this.heroSlotsP1 = [];
    this.heroSlotsP2 = [];

    const spacing = 45;
    const baseY = 50;
    const offsetY = 50;
    const y = baseY + offsetY;

    const baseX_P1 = 35;
    const baseX_P2 = this.scale.width - 35;

    for (let i = 0; i < 3; i++) {
      const slotP1 = this.add.image(baseX_P1 + i * spacing, y, 'hexagon_empty').setScale(1.2);
      this.heroSlotsP1.push(slotP1);

      const slotP2 = this.add.image(baseX_P2 - i * spacing, y, 'hexagon_empty').setScale(1.2);
      this.heroSlotsP2.push(slotP2);
    }

    this.drawHeroOptions();
    this.updateCurrentPlayerSelect();

    this.heroDisplayP1 = this.add.group();
    this.heroDisplayP2 = this.add.group();

    this.autoSelectHeroesForTesting();

    this.input.on('pointerdown', (pointer) => {
      const clickedHero = this.heroSprites.some(heroObj =>
        heroObj.sprite.getBounds().contains(pointer.x, pointer.y)
      );
    
      if (!clickedHero && this.previewedHero) {
        this.hideHeroDetail();
      }
    });    

    heroSelectionSocketListeners(this.socket, this);
    this.heroDetailUI = createHeroDetailUI(this, true);    

    this.events.once('shutdown', () => {
      this.socket.off(SOCKET_EVENTS.HERO_SELECTION_TICK);
      this.socket.off(SOCKET_EVENTS.HERO_SELECTION_TIMEOUT);
      this.socket.off(SOCKET_EVENTS.HERO_SELECTED);
      this.socket.off(SOCKET_EVENTS.RETURN_TO_MATCH_ONLINE);
      this.socket.off(SOCKET_EVENTS.HERO_SELECTED_REQUEST);
      this.socket.off(SOCKET_EVENTS.HERO_SELECTED);
    });
  }

  autoSelectHeroesForTesting() {
    const presetP1 = ['Ralph', 'Ceos', 'Blade'];
    const presetP2 = ['Noctin', 'Vic', 'Bramm'];
  
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
  
    this.currentStep = this.selectionOrder.length;
    this.currentStepCount = 0;
    this.startGame();
  }

  drawHeroOptions() {
    const size = 35;
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
  
      const hex = this.add.graphics();
      hex.fillStyle(0x4e5d6c, 0.6); 
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
  
      const sprite = this.add.sprite(x, y, 'heroes', hero.frame)
        .setInteractive()
        .setScale(0.220)
        .setData('heroName', hero.name);
  
      sprite.on('pointerover', () => {
        if (!this.selectedHeroesP1.includes(hero.name) && !this.selectedHeroesP2.includes(hero.name)) {
          this.tweens.add({
            targets: sprite,
            scale: 0.3,
            duration: 150
          });
        }
      });
  
      sprite.on('pointerout', () => {
        if (!this.selectedHeroesP1.includes(hero.name) && !this.selectedHeroesP2.includes(hero.name)) {
          this.tweens.add({
            targets: sprite,
            scale: 0.250,
            duration: 150
          });
        }
      });
  
      const highlight = this.add.rectangle(x, y + 45, 20, 20, 0x00ff00)
        .setVisible(false);
  
      this.heroSprites.push({ highlight, name: hero.name, sprite, hex });

      sprite.on('pointerdown', () => this.previewHero(hero));
    });
  }  

  isCurrentPlayerTurn() {
    const currentStep = this.selectionOrder[this.currentStep];
    return currentStep && currentStep.player === this.playerNumber;
  }  

  previewHero(hero) {
    if (
      this.selectedHeroesP1.includes(hero.name) ||
      this.selectedHeroesP2.includes(hero.name)
    ) return;
  
    this.previewedHero = hero;

    hero = this.HERO_DATA.find(h => h.name === hero.name);
  
    this.heroDetailUI.show(hero);
  }  

  hideHeroDetail() {
    this.heroDetailUI.hide();
  }  

  drawHeroSelectionHex(heroSpriteObj, color = 0x3344ff) {
    const hex = heroSpriteObj.hex;
    hex.clear();
    hex.fillStyle(color, 0.7);
    hex.lineStyle(2, 0xffffff, 1);
  
    const size = 35;
    const x = heroSpriteObj.sprite.x;
    const y = heroSpriteObj.sprite.y;
  
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = Phaser.Math.DegToRad(60 * i - 30);
      points.push({ x: x + size * Math.cos(angle), y: y + size * Math.sin(angle) });
    }
  
    hex.beginPath();
    hex.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      hex.lineTo(points[i].x, points[i].y);
    }
    hex.closePath();
    hex.fillPath();
    hex.strokePath();
  }  
  
  confirmSelection(hero) {
    const currentPlayer = this.selectionOrder[this.currentStep].player;

    if (currentPlayer !== this.playerNumber) {
      console.warn('Não é sua vez de selecionar!');
      return;
    }

    if(this.selecting == false){
      this.socket.emit(SOCKET_EVENTS.HERO_SELECTED_REQUEST, {
        heroName: hero.name,
        player: currentPlayer,
        roomId: this.roomId,
        step: this.currentStep
      }); 

      this.selecting = true;
    }
  }

  updateCurrentPlayerSelect() {
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

    this.selecting = false;
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

      const sprite = this.add.sprite(slot.x, slot.y, 'heroes', hero.frame).setScale(0.2);
  
      if (player === 1) {
        this.heroDisplayP1.add(sprite);
      } else {
        this.heroDisplayP2.add(sprite);
      }
    }
  }

  updateSelectionTimer(timeLeft) {
    if (!this.timerText) {
      this.timerText = this.add.text(this.scale.width / 2, 100, '', {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'Fredoka'
      }).setOrigin(0.5);
    }

    this.timerText.setText(timeLeft);
  }

  onHeroSelectionTimeout() {
    const playerNumber = this.playerNumber;
    const currentPlayerNumber = this.selectionOrder[this.currentStep].player;

    if (playerNumber === currentPlayerNumber) {
      const allSelected = [...this.selectedHeroesP1, ...this.selectedHeroesP2];
      const availableHeroes = this.HERO_DATA.filter(h => !allSelected.includes(h.name));
      if (availableHeroes.length > 0) {
        const randomHero = Phaser.Utils.Array.GetRandom(availableHeroes);
        this.confirmSelection(randomHero);
      }
    }
  }
  
  startGame() {
    if (this.timerText) this.timerText.setVisible(false);
  
    const player1 = this.player1;
    const player2 = this.player2;
  
    player1.heroes = this.selectedHeroesP1;
    player2.heroes = this.selectedHeroesP2;

    this.socket.emit(SOCKET_EVENTS.SELECTION_COMPLETE, {
      roomId: this.roomId,
      selectedHeroes: {
        [this.player1.id]: this.selectedHeroesP1,
        [this.player2.id]: this.selectedHeroesP2
      }
    });
  }  
}