import { SOCKET_EVENTS } from "../../api/events";
import buildGameState from "../core/game-state";

function createTurn(startedPlayerId) {
  return {
    attackedHeroes: [],
    counterAttack: false,
    movedHeroes: [],
    playerId: startedPlayerId,
    numberTurn: 1,
  };
}

function setupInitialPositions(heros, postionsAvaliable){
  heros.forEach((hero, index) => {
    hero.state.position = postionsAvaliable[index]
  });
}

export default function heroSelectionSocketListeners(socket, scene){
   socket.on(SOCKET_EVENTS.START_GAME, ({ roomId, startedPlayerId }) => {
    console.log('Recebi START_GAME');
      const resolveHeroes = heroNames => heroNames.map(name => scene.HERO_DATA.find(h => h.name === name));
      
      const player1 = scene.player1;
      const player2 = scene.player2;
    
      const enrichedPlayers = [
        {
          ...player1,
          heroes: resolveHeroes(scene.selectedHeroesP1).map(h => ({
            id: h.id,
            name: h.name,
            frame: h.frame,
            firstAttack: h.firstAttack,
            stats: {
              attack: h.stats.attack,
              currentHealth: h.stats.hp
            },
            state: {
              position: null,
              isAlive: true,
              statusEffects: []
            }
          }))
        },
        {
          ...player2,
          heroes: resolveHeroes(scene.selectedHeroesP2).map(h => ({
            id: h.id,
            name: h.name,
            frame: h.frame,
            firstAttack: h.firstAttack,
            stats: {
              attack: h.stats.attack,
              currentHealth: h.stats.hp
            },
            state: {
              position: null,
              isAlive: true,
              statusEffects: []
            }
          }))
        }
      ];

      setupInitialPositions(enrichedPlayers[0].heroes, ['B1', 'C1', 'D1']);
      setupInitialPositions(enrichedPlayers[1].heroes, ['B7', 'C6', 'D7']);      

      const currentTurn = createTurn(startedPlayerId);
    
      const gameState = buildGameState(roomId, enrichedPlayers, currentTurn, startedPlayerId);
    
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

      const opponentSelection = player === 1 ? scene.selectedHeroesP1 : scene.selectedHeroesP2;
      opponentSelection.push(heroName);
  
      scene.updateSelectedHeroDisplay(player, heroData);

      scene.currentStep = step;
      scene.currentStepCount = 0;
    
      scene.updateNamePlayerText();
    });
}