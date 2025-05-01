import express from 'express';
import { SOCKET_EVENTS } from './events.js';
import http from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  perMessageDeflate: {
    threshold: 1024
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

// Estruturas otimizadas
const waitingQueue = new Map(); // socket.id => { playerId, name }
const matches = new Map();      // roomId => Match Object
const goodLuckCache = new Map();
const disconnectedPlayers = new Map();

// Função utilitária
function getMatch(roomId) {
  return matches.get(roomId);
}

io.on('connection', (socket) => {
  socket.on(SOCKET_EVENTS.QUIT_QUEUE, () => {
    waitingQueue.delete(socket.id);
  });

  socket.on(SOCKET_EVENTS.FINDING_MATCH, ({ player }) => {
    console.log('Recebido:', player); 
    if (!player || typeof player.id !== 'string' || typeof player.name !== 'string') {
      console.warn(`Conexão inválida de ${socket.id}: dados de player ausentes ou inválidos`);
      return;
    }

    const safeName = (player.name || '').trim().substring(0, 20) || `Jogador_${Math.floor(Math.random() * 1000)}`;
  
    if (waitingQueue.has(socket.id)) return;
  
    waitingQueue.set(socket.id, {
      id: player.id,
      name: safeName,
      number: null,     
      heroes: []          
    });

    if (waitingQueue.size >= 2) {
      const [id1, p1] = waitingQueue.entries().next().value;
      waitingQueue.delete(id1);
      const [id2, p2] = waitingQueue.entries().next().value;
      waitingQueue.delete(id2);
  
      const sock1 = io.sockets.sockets.get(id1);
      const sock2 = io.sockets.sockets.get(id2);
      if (!sock1 || !sock2) return;
  
      const roomId = uuidv4();
      sock1.join(roomId);
      sock2.join(roomId);
  
      const match = {
        player1: { ...p1, id: id1, number: 1 },
        player2: { ...p2, id: id2, number: 2 },
        currentTurnPlayerId: id1,
        selectedHeroes: [],
      };
  
      matches.set(roomId, match);
  
      io.to(roomId).emit(SOCKET_EVENTS.MATCH_FOUND, {
        players: [match.player1, match.player2],
        roomId
      });
    }
  });
  

  socket.on(SOCKET_EVENTS.HERO_SELECTED, ({ roomId, heroName, player, step }) => {
    const match = getMatch(roomId);
    if (!match) return;
    socket.to(roomId).emit(SOCKET_EVENTS.HERO_SELECTED, { heroName, player, step });
  });

  socket.on(SOCKET_EVENTS.SELECTION_COMPLETE, ({ roomId, players, heroes }) => {
    const match = getMatch(roomId);
    if (!match) return;

    const startedPlayerIndex = Math.floor(Math.random() * 2);
    io.to(roomId).emit(SOCKET_EVENTS.START_GAME, {
      heroes, players, roomId, startedPlayerIndex
    });
  });

  socket.on(SOCKET_EVENTS.NEXT_TURN_REQUEST, ({ roomId }) => {
    const match = getMatch(roomId);
    if (!match) return;

    match.currentTurnPlayerId =
      match.currentTurnPlayerId === match.player1.id
        ? match.player2.id
        : match.player1.id;

    goodLuckCache.delete(roomId);

    io.to(roomId).emit(SOCKET_EVENTS.NEXT_TURN, {
      nextPlayerId: match.currentTurnPlayerId
    });
  });

  socket.on(SOCKET_EVENTS.HERO_MOVE_REQUEST, ({ roomId, heroId, targetLabel }) => {
    const match = getMatch(roomId);
    if (!match) return;
    socket.to(roomId).emit(SOCKET_EVENTS.HERO_MOVED, { heroId, targetLabel });
  });

  socket.on(SOCKET_EVENTS.HERO_ATTACK_REQUEST, ({ roomId, heroAttackerId, heroTargetId }) => {
    const match = getMatch(roomId);
    if (!match) return;
    socket.to(roomId).emit(SOCKET_EVENTS.HERO_ATTACKED, {
      heroAttackerId, heroTargetId
    });
  });

  socket.on(SOCKET_EVENTS.HERO_COUNTER_ATTACK_REQUEST, ({ roomId, heroAttackerId, heroTargetId }) => {
    const match = getMatch(roomId);
    if (!match) return;
    io.to(roomId).emit(SOCKET_EVENTS.HERO_COUNTER_ATTACK, {
      heroAttackerId, heroTargetId
    });
  });

  socket.on(SOCKET_EVENTS.GAME_FINISHED, ({ roomId, winnerId }) => {
    io.to(roomId).emit(SOCKET_EVENTS.GAME_FINISHED, { winnerId });
    io.socketsLeave(roomId);
    matches.delete(roomId);
    goodLuckCache.delete(roomId);
  });

  socket.on('CHECK_GOOD_LUCK', ({ roomId }) => {
    if (goodLuckCache.has(roomId)) {
      socket.emit('GOOD_LUCK_RESULT', goodLuckCache.get(roomId));
    } else {
      const result = Math.random() < 0.5;
      goodLuckCache.set(roomId, result);
      io.to(roomId).emit('GOOD_LUCK_RESULT', result);
    }
  });

  socket.on(SOCKET_EVENTS.UPDATE_GAME_STATE, ({ roomId, gameState }) => {
    const match = getMatch(roomId);
    if (!match) return;
    match.gameState = gameState;
  });

  socket.on('disconnect', () => {
    waitingQueue.delete(socket.id);

    for (const [roomId, match] of matches.entries()) {
      if (match.player1.id === socket.id || match.player2.id === socket.id) {
        const timeout = setTimeout(() => {
          const winnerId = match.player1.id === socket.id ? match.player2.id : match.player1.id;
          io.to(roomId).emit(SOCKET_EVENTS.GAME_FINISHED, { winnerId });
          io.socketsLeave(roomId);
          matches.delete(roomId);
        }, 30000);

        disconnectedPlayers.set(socket.id, { roomId, timeout });
        break;
      }
    }
  });

  socket.on(SOCKET_EVENTS.RECONNECTING_PLAYER, ({ oldSocketId, roomId }) => {
    const match = matches.get(roomId);
    if (!match) return;

    if (match.player1.id === oldSocketId) {
      match.player1.id = socket.id;
    } else if (match.player2.id === oldSocketId) {
      match.player2.id = socket.id;
    } else {
      return;
    }

    socket.join(roomId);

    const data = disconnectedPlayers.get(oldSocketId);
    if (data) {
      clearTimeout(data.timeout);
      disconnectedPlayers.delete(oldSocketId);
    }

    if (match.gameState) {
      socket.emit(SOCKET_EVENTS.SYNC_GAME_STATE, { gameState: match.gameState });
    }
  });
});
