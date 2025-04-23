import { Gold, Vic, Dante, Ralph, Ceos, Blade } from '../../heroes/heroes.js'; 
import socket from '../../services/game-api-service.js';
import { SOCKET_EVENTS } from '../../../api/events.js';

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

    // Ordem personalizada de seleção
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
    
    this.myPlayer = players.find(p => p.id === socket.id);
    this.opponentPlayer = players.find(p => p.id !== socket.id);
    
    this.playerNumber = this.myPlayer.number;
  
    console.log(`Você é o Jogador ${this.playerNumber} na sala ${roomId}`);

    const { width } = this.scale;

    this.add.text(width / 2, 40, 'Selecione seus Heróis', {
      color: '#ffffff',
      fontFamily: 'Arial',
      fontSize: '40px'
    }).setOrigin(0.5);

    this.statusText = this.add.text(width / 2, 90, '', {
      color: '#dddddd',
      fontFamily: 'Arial',
      fontSize: '24px'
    }).setOrigin(0.5);

    this.drawHeroOptions();
    this.createHeroDetailUI();
    this.updateStatusText();
    this.setupSocketEvents();
    
    this.heroDisplayP1 = this.add.group();
    this.heroDisplayP2 = this.add.group();
    
    this.autoSelectHeroesForTesting();

    this.socket.on(SOCKET_EVENTS.START_GAME, ({ roomId, players, startedPlayerIndex }) => {
      this.scene.start('BoardScene', {
        myPlayerId: this.myPlayer.id,
        players,
        roomId,
        startedPlayerIndex
      });
    });
      
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

  autoSelectHeroesForTesting() {
    // Defina os nomes dos heróis que você quer selecionar por padrão
    const presetP1 = ['Gold', 'Vic', 'Blade'];
    const presetP2 = ['Ralph', 'Ceos', 'Dante'];
  
    // Mapeia os dados dos heróis
    const getHeroData = name => this.HERO_DATA.find(h => h.name === name);
  
    // Preenche a seleção para ambos os jogadores
    this.selectedHeroesP1 = presetP1;
    this.selectedHeroesP2 = presetP2;
  
    // Atualiza o display visual dos heróis (opcional)
    presetP1.forEach(name => this.updateSelectedHeroDisplay(1, getHeroData(name)));
    presetP2.forEach(name => this.updateSelectedHeroDisplay(2, getHeroData(name)));
  
    // Emite o evento para iniciar o jogo
    this.startGame();
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

      this.heroSprites.push({ highlight, name: hero.name, sprite });

      sprite.on('pointerdown', () => this.previewHero(hero));
    });
  }

  createHeroDetailUI() {
    const { width } = this.scale;

    this.detailBox = this.add.image(width / 2, 400, 'Hero-box')
      .setOrigin(0.5)
      .setVisible(false);

    this.heroNameText = this.add.text(width / 2, 340, '', {
      color: '#ffffff',
      fontFamily: 'Arial',
      fontSize: '22px'
    }).setOrigin(0.5).setVisible(false);

    this.abilitiesText = this.add.text(width / 2, 370, '', {
      align: 'center',
      color: '#dddddd',
      fontFamily: 'Arial',
      fontSize: '16px',
      wordWrap: { width: 280 }
    }).setOrigin(0.5).setVisible(false);

    this.confirmButton = this.add.text(width / 2, 430, 'Confirmar', {
      backgroundColor: '#00aa00',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontSize: '20px',
      padding: { x: 10, y: 5 }
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
        duration: 150,
        ease: 'Power1',
        scale: 2,
        targets: this.previewedSprite
      });
    }
  
    this.previewedHero = hero;
  
    const heroSpriteObj = this.heroSprites.find(h => h.name === hero.name);
    if (heroSpriteObj) {
      this.previewedSprite = heroSpriteObj.sprite;

      this.tweens.add({
        duration: 200,
        ease: 'Power2',
        scale: 2.5,
        targets: this.previewedSprite
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
        duration: 150,
        ease: 'Power1',
        scale: 2,
        targets: this.previewedSprite
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
    
    if (currentPlayer !== this.playerNumber) return;
    if (currentSelection.includes(hero.name)) return;

    console.log(`Jogador ${currentPlayer} selecionou: ${hero.name}`); 

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
      heroName: hero.name,
      player: currentPlayer,
      roomId: this.roomId,
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
    this.socket.off(SOCKET_EVENTS.HERO_SELECTED);
  
    const player1 = this.players.find(p => p.number === 1);
    const player2 = this.players.find(p => p.number === 2);
  
    player1.heros = this.selectedHeroesP1;
    player2.heros = this.selectedHeroesP2;
  
    this.socket.emit(SOCKET_EVENTS.SELECTION_COMPLETE, {
      heroes: {
        player1: this.selectedHeroesP1.map(h => h.toJSON()),
        player2: this.selectedHeroesP2.map(h => h.toJSON())
      },
      players: [player1.toJSON(), player2.toJSON()],
      roomId: this.roomId
    });
  }  
}
