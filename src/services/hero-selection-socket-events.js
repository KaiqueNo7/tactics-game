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

    const heroData = scene.HERO_DATA.find(h => h.name === heroName);
    if (!heroData) {
      console.warn(`Herói não encontrado: ${heroName}`);
      return;
    }
    
    const playerSelection = player === 1 ? scene.selectedHeroesP1 : scene.selectedHeroesP2;
    
    if (playerSelection.includes(heroName)) return;
    
    console.log(`Jogador ${player} selecionou: ${heroName}`); 
    
    playerSelection.push(heroName);
    
    scene.updateSelectedHeroDisplay(player, heroData);

    const heroSpriteObj = scene.heroSprites.find(h => h.name === heroName);

    scene.drawHeroSelectionHex(heroSpriteObj, player === 1 ? 0x3344ff : 0xff3333);

    scene.currentStepCount++;
    const expectedCount = scene.selectionOrder[scene.currentStep].count;

    if (scene.currentStepCount >= expectedCount) {
      scene.currentStep++;
      scene.currentStepCount = 0;
    }

    if (scene.currentStep >= scene.selectionOrder.length) {
      scene.startGame();
    } else {
      scene.updateCurrentPlayerSelect();
    }  
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