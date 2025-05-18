import { SOCKET_EVENTS } from "../../api/events";

function createTurn(startedPlayerId) {
  return {
    attackedHeroes: [],
    counterAttack: false,
    movedHeroes: [],
    playerId: startedPlayerId,
    numberTurn: 1,
  };
}

function buildGameState(roomId, players, currentTurn, startedPlayerId) {
  return {
    roomId,
    players,
    currentTurn,
    startedPlayerId,
    lastActionTimestamp: Date.now(),
    status: 'in_progress'
  };
}

export default function heroSelectionSocketListeners(socket, scene){
  socket.on(SOCKET_EVENTS.START_GAME, ({ roomId, startedPlayerId }) => {
    const resolveHeroes = (heroNames) => {
      return heroNames.map((name) => scene.HERO_DATA.find((h) => h.name === name));
    };
  
    const enrichHero = (hero) => ({
      id: hero.id,
      name: hero.name,
      frame: hero.frame,
      firstAttack: hero.firstAttack,
      stats: {
        attack: hero.stats.attack,
        currentHealth: hero.stats.hp,
      },
      state: {
        position: null,
        isAlive: true,
        statusEffects: [],
      },
    });
  
    const enrichPlayer = (player, selectedHeroes) => ({
      ...player,
      heroes: resolveHeroes(selectedHeroes).map(enrichHero),
    });
  
    const enrichedPlayers = [
      enrichPlayer(scene.player1, scene.selectedHeroesP1),
      enrichPlayer(scene.player2, scene.selectedHeroesP2),
    ];
  
    const setupHeroPositions = (heroes, positions) => {
      heroes.forEach((hero, index) => {
        if (positions[index]) {
          hero.state.position = positions[index];
        }
      });
    };
  
    setupHeroPositions(enrichedPlayers[0].heroes, ['B1', 'C1', 'D1']);
    setupHeroPositions(enrichedPlayers[1].heroes, ['B7', 'C6', 'D7']);
  
    const currentTurn = createTurn(startedPlayerId);
  
    const gameState = buildGameState(roomId, enrichedPlayers, currentTurn, startedPlayerId);

    socket.off(SOCKET_EVENTS.HERO_SELECTION_TICK);
    socket.off(SOCKET_EVENTS.HERO_SELECTION_TIMEOUT);
  
    scene.scene.start('PreMatchScene', { gameState });
  });
  
  socket.on(SOCKET_EVENTS.HERO_SELECTED, ({ heroName, player, step }) => {
    console.log(`Recebi seleção do jogador ${player}: ${heroName} (step ${step})`);

    if (player === scene.playerNumber) return;

    const heroData = scene.HERO_DATA.find(h => h.name === heroName);
    if (!heroData) {
      console.warn(`Herói não encontrado: ${heroName}`);
      return;
    }

    const heroSpriteObj = scene.heroSprites.find(h => h.name === heroName);
    if (heroSpriteObj && heroSpriteObj.hex) {
      const color = player === 1 ? 0x3344ff : 0xff3333;
      heroSpriteObj.hex.clear();
      heroSpriteObj.hex.fillStyle(color, 0.7);
      heroSpriteObj.hex.lineStyle(2, 0xffffff, 1);
    
      const size = 35;
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

    const opponentSelection = player === 1 ? scene.selectedHeroesP1 : scene.selectedHeroesP2;
    opponentSelection.push(heroName);

    scene.updateSelectedHeroDisplay(player, heroData);

    scene.currentStep = step;
    scene.currentStepCount = 0;
  
    scene.updateCurrentPlayerSelect();
  });

  socket.on(SOCKET_EVENTS.HERO_SELECTION_TICK, ({ timeLeft }) => {
    scene.updateSelectionTimer(timeLeft);
  });
  
  socket.on(SOCKET_EVENTS.HERO_SELECTION_TIMEOUT, ({ playerId, step }) => {
    scene.onHeroSelectionTimeout(playerId, step);
  });  

  socket.on(SOCKET_EVENTS.RETURN_TO_MATCH_ONLINE, () => {
    console.log("Retornando à tela de busca de partida...");
    scene.scene.stop('FindingMatchScene');
    scene.scene.start('MatchOnlineScene');
  });
}