import { SOCKET_EVENTS } from "../../api/events";

export default function heroSelectionSocketListeners(socket, scene){
  socket.on(SOCKET_EVENTS.START_GAME, (gameState) => {
    scene.scene.start('PreMatchScene', { gameState });
  
    socket.off(SOCKET_EVENTS.HERO_SELECTION_TICK);
    socket.off(SOCKET_EVENTS.HERO_SELECTION_TIMEOUT);
  });
  
  socket.on(SOCKET_EVENTS.HERO_SELECTED, ({ heroName, player, step }) => {
    console.log(`Recebi seleção do jogador ${player}: ${heroName} (step ${step})`);

    const heroData = scene.HERO_DATA.find(h => h.name === heroName);

    if (!heroData) {
      console.warn(`Herói não encontrado: ${heroName}`);
      return;
    }
    
    const playerSelection = player === 1 ? scene.selectedHeroesP1 : scene.selectedHeroesP2;
    
    if (playerSelection.includes(heroName)){
      console.warn(`Jogador ${player} já selecionou o herói ${heroName}`);
      return;
    } 
    
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