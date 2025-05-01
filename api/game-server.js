import express from 'express';
import { SOCKET_EVENTS } from './events.js';
import http from 'http';
import Player from '../src/core/player.js';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    methods: ['GET', 'POST'],
    origin: '*'
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

const waitingQueue = [];
const matches = {};
const goodLuckCache = new Map();
const disconnectedPlayers = new Map();

io.on('connection', (socket) => {
  socket.on(SOCKET_EVENTS.QUIT_QUEUE, () => {
    console.log(`Jogador ${socket.id} saiu da fila`);
    const index = waitingQueue.findIndex(s => s.id === socket.id);
    if (index !== -1) waitingQueue.splice(index, 1);
  });

  socket.on(SOCKET_EVENTS.FINDING_MATCH, ({ name }) => {
    if (waitingQueue.find(s => s.id === socket.id)) return;

    console.log(`Jogador ${socket.id} (${name}) entrou na fila`);
    socket.playerName = name ? name : 'Jogador_' + Math.floor(Math.random() * 1000);

    waitingQueue.push(socket);

    if (waitingQueue.length >= 2) {
      const playerSocket1 = waitingQueue.shift();
      const playerSocket2 = waitingQueue.shift();

      const roomId = `room_${playerSocket1.id}_${playerSocket2.id}`;
      playerSocket1.join(roomId);
      playerSocket2.join(roomId);

      matches[roomId] = {
        player1: new Player(playerSocket1.playerName, [], playerSocket1.id, 1),
        player2: new Player(playerSocket2.playerName, [], playerSocket2.id, 2),
        selectedHeroes: []
      };

      console.log(`Criando partida na sala ${roomId}`);

      io.to(roomId).emit(SOCKET_EVENTS.MATCH_FOUND, {
        players: [
          matches[roomId].player1.toJSON(),
          matches[roomId].player2.toJSON()
        ],
        roomId
      });
    }
  });

  socket.on(SOCKET_EVENTS.HERO_SELECTED, ({ roomId, heroName, player, step }) => {
    const match = matches[roomId];
    if (!match) return;

    console.log(`Jogador ${socket.id} selecionou o herói ${heroName} na sala ${roomId}`);
    socket.to(roomId).emit(SOCKET_EVENTS.HERO_SELECTED, { heroName, player, step });
  });

  socket.on(SOCKET_EVENTS.SELECTION_COMPLETE, ({ roomId, players, heroes }) => {
    const match = matches[roomId];
    if (!match) return;

    console.log(`[SERVER] SELECTION_COMPLETE recebido. Enviando START_GAME para sala ${roomId}`);

    const startingIndex = Math.floor(Math.random() * 2);
    const startedPlayerIndex = startingIndex;

    io.to(roomId).emit(SOCKET_EVENTS.START_GAME, {
      heroes,
      players,
      roomId,
      startedPlayerIndex
    });
  });

  socket.on(SOCKET_EVENTS.NEXT_TURN_REQUEST, ({ roomId }) => {
    const match = matches[roomId];
    if (!match) return;

    match.currentTurnPlayerId = (match.currentTurnPlayerId === match.player1.id) 
    ? match.player2.id 
    : match.player1.id;

    console.log(`[SERVER] NEXT_TURN_REQUEST recebido. Próximo turno: ${match.currentTurnPlayerId}`);
    goodLuckCache.delete(roomId);
    io.to(roomId).emit(SOCKET_EVENTS.NEXT_TURN, {
      nextPlayerId: match.currentTurnPlayerId
    });
  })

  socket.on(SOCKET_EVENTS.HERO_MOVE_REQUEST, ({ roomId, heroId, targetLabel }) => {
    const match = matches[roomId];
    if (!match) return;
  
    console.log(`[SERVER] HERO_MOVE_REQUEST recebido (heroId: ${heroId}). Enviando HERO_MOVED para sala ${roomId}`);
    
    socket.broadcast.to(roomId).emit(SOCKET_EVENTS.HERO_MOVED, { heroId, targetLabel });
  });  

  socket.on(SOCKET_EVENTS.HERO_ATTACK_REQUEST, ({ roomId, heroAttackerId, heroTargetId }) => {
    const match = matches[roomId];
    if (!match) return;

    console.log(`[SERVER] HERO_ATTACK_REQUEST de ${socket.id} - broadcast para sala ${roomId}`);
    socket.broadcast.to(roomId).emit(SOCKET_EVENTS.HERO_ATTACKED, {
      heroAttackerId,
      heroTargetId
    });
  });

  socket.on(SOCKET_EVENTS.HERO_COUNTER_ATTACK_REQUEST, ({ roomId, heroAttackerId, heroTargetId }) => {
    const match = matches[roomId];
    if (!match) return;

    console.log(`[SERVER] HERO_COUNTER_ATTACK_REQUEST de ${socket.id} - broadcast para sala ${roomId}`);
    io.to(roomId).emit(SOCKET_EVENTS.HERO_COUNTER_ATTACK, {
      heroAttackerId,
      heroTargetId
    });
  });

  socket.on(SOCKET_EVENTS.GAME_FINISHED, ({ roomId, winnerId }) => {
    io.to(roomId).emit(SOCKET_EVENTS.GAME_FINISHED, { winnerId });
    delete matches[roomId];
  });

  socket.on('CHECK_GOOD_LUCK', ({ roomId }) => {
    if (goodLuckCache.has(roomId)) {
      const result = goodLuckCache.get(roomId);
      socket.emit('GOOD_LUCK_RESULT', result);
      return;
    }
  
    const gotLucky = Math.random() < 0.5;
    goodLuckCache.set(roomId, gotLucky);
  
    console.log('Resultado do GOOD_LUCK:', gotLucky);
    io.to(roomId).emit('GOOD_LUCK_RESULT', gotLucky);
  });

  socket.on(SOCKET_EVENTS.UPDATE_GAME_STATE, ({ roomId, gameState }) => {
    const match = matches[roomId];
    if (!match) return;
  
    match.gameState = gameState;
    console.log(`[SERVER] gameState atualizado para sala ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Jogador desconectado: ${socket.id}`);
    const index = waitingQueue.findIndex(s => s.id === socket.id);
    if (index !== -1) {
      waitingQueue.splice(index, 1);
    }
  
    let foundRoomId = null;
  
    for (const [roomId, match] of Object.entries(matches)) {
      if (!match?.player1 || !match?.player2) continue;
  
      if (match.player1.id === socket.id || match.player2.id === socket.id) {
        foundRoomId = roomId;
  
        console.log(`Jogador da partida ${roomId} desconectou. Aguardando reconexão...`);
  
        const timeout = setTimeout(() => {
          const winnerId = (match.player1.id === socket.id) ? match.player2.id : match.player1.id;
  
          io.to(roomId).emit(SOCKET_EVENTS.GAME_FINISHED, { winnerId });
          delete matches[roomId];
          disconnectedPlayers.delete(socket.id);
        }, 30000);
  
        disconnectedPlayers.set(socket.id, { roomId, timeout });
        break;
      }
    }
  });  
  
  socket.on(SOCKET_EVENTS.RECONNECTING_PLAYER, ({ oldSocketId, roomId }) => {
    const match = matches[roomId];
    if (!match) return;
  
    console.log(`Jogador reconectando: ${oldSocketId} -> ${socket.id} na sala ${roomId}`);
  
    if (match.player1.id === oldSocketId) {
      match.player1.id = socket.id;
    } else if (match.player2.id === oldSocketId) {
      match.player2.id = socket.id;
    } else {
      console.warn(`Tentativa de reconexão inválida para socket ${socket.id}`);
      return;
    }
  
    socket.join(roomId);
  
    // Cancela o timeout de finalização
    const data = disconnectedPlayers.get(oldSocketId);
    if (data) {
      clearTimeout(data.timeout);
      disconnectedPlayers.delete(oldSocketId);
    }
  
    // Aqui você pode mandar o gameState atual também se quiser:
    if (match.gameState) {
      socket.emit(SOCKET_EVENTS.SYNC_GAME_STATE, { gameState: match.gameState });
    }
  
    console.log(`Reconexão bem-sucedida para o jogador ${socket.id} na sala ${roomId}`);
  });
});
