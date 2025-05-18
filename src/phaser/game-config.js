import socket from '../services/game-api-service.js';
import { SOCKET_EVENTS } from '../../api/events.js';

import GameScene from './scenes/game-scene.js';
import MainMenuScene from './scenes/main-menu-scene.js';
import HeroSelectionScene from './scenes/hero-selection-scene.js';
import MatchOnlineScene from './scenes/match-online-scene.js';
import FindingMatchScene from './scenes/finding-match-scene.js';
import PreMatchScene from './scenes/pre-match-scene.js';

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#333333',
  parent: 'game-container',
  audio: {
    noAudio: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  render: {
    pixelArt: false,
    antialias: true,
    antialiasGL: true,
  },
  fps: {
    target: 60,
    forceSetTimeOut: true
  },
  scene: [
    // MainMenuScene,
    // MatchOnlineScene,
    FindingMatchScene,
    PreMatchScene,
    HeroSelectionScene,
    GameScene
  ]
};

const game = new Phaser.Game(config);

if (!socket.hasSyncGameStateListener) {
  socket.on(SOCKET_EVENTS.SYNC_GAME_STATE, ({ gameState }) => {
    const currentScene = game.scene.getScenes(true)[0];

    if (currentScene && currentScene.scene.key !== 'PreMatchScene') {
      currentScene.scene.stop();
    }

    if (currentScene && currentScene.nameInput) {
      currentScene.nameInput.remove();
    }

    game.scene.start('PreMatchScene', {
      gameState,
      reconnect: true,
    });
  });

  socket.hasSyncGameStateListener = true;
}

socket.once('RECONNECT_FAILED', () => {
  console.warn('Reconexão falhou: a partida não existe mais ou o outro jogador saiu.');
});
