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

const waitingQueue = new Map();
const matches = new Map();
const goodLuckCache = new Map();
const disconnectedPlayers = new Map();
const playerIdToSocketId = new Map();

function getMatch(roomId) {
  return matches.get(roomId);
}

io.on('connection', (socket) => {
  socket.on(SOCKET_EVENTS.QUIT_QUEUE, () => {
    if (socket.playerId) {
      waitingQueue.delete(socket.playerId);
    }
  });
  
  socket.on(SOCKET_EVENTS.FINDING_MATCH, ({ player }) => {
    if (!player || typeof player.id !== 'string' || typeof player.name !== 'string') {
      console.warn(`Conexão inválida de ${socket.id}: dados de player ausentes ou inválidos`);
      return;
    }
  
    socket.playerId = player.id;
    playerIdToSocketId.set(player.id, socket.id);
  
    const safeName = (player.name || '').trim().substring(0, 20) || `Jogador_${Math.floor(Math.random() * 1000)}`;

    if (waitingQueue.has(player.id)) return;

    waitingQueue.set(player.id, {
      id: player.id,
      name: safeName,
      heroes: []
    });

    if (waitingQueue.size >= 2) {
      const iterator = waitingQueue.entries();
      const [playerId1, p1] = iterator.next().value;
      waitingQueue.delete(playerId1);
      const [playerId2, p2] = iterator.next().value;
      waitingQueue.delete(playerId2);
  
      const socketId1 = playerIdToSocketId.get(playerId1);
      const socketId2 = playerIdToSocketId.get(playerId2);
  
      const sock1 = io.sockets.sockets.get(socketId1);
      const sock2 = io.sockets.sockets.get(socketId2);
  
      if (!sock1 || !sock2) return;
  
      const roomId = uuidv4();
      sock1.join(roomId);
      sock2.join(roomId);
  
      const match = {
        player1: { ...p1, id: playerId1 },
        player2: { ...p2, id: playerId2 },
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

    const startedPlayerIndex = Math.floor(Math.random() * 2) + 1;
    const startedPlayerId = startedPlayerIndex === 1 ? match.player1.id : match.player2.id;

    io.to(roomId).emit(SOCKET_EVENTS.START_GAME, {
      heroes, players, roomId, startedPlayerId
    });
  });

  socket.on(SOCKET_EVENTS.NEXT_TURN_REQUEST, ({ roomId }) => {
    const match = getMatch(roomId);

    if (!match) return;

    match.gameState.currentTurn.playerId =
      match.gameState.currentTurn.playerId === match.player1.id
        ? match.player2.id
        : match.player1.id;

    goodLuckCache.delete(roomId);

    io.to(roomId).emit(SOCKET_EVENTS.NEXT_TURN, {
      nextPlayerId: match.gameState.currentTurn.playerId
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
    if (!socket.playerId) return;
  
    const playerId = socket.playerId;
  
    waitingQueue.delete(playerId);
    playerIdToSocketId.delete(playerId);
  
    for (const [roomId, match] of matches.entries()) {
      if(match.gameState.status === 'finished') return;

      if (match.player1.id === playerId || match.player2.id === playerId) {
        const opponentId = match.player1.id === playerId ? match.player2.id : match.player1.id;
  
        const opponentDisconnected = disconnectedPlayers.has(opponentId);
  
        if (opponentDisconnected) {
          io.to(roomId).emit(SOCKET_EVENTS.GAME_FINISHED, { winnerId: null });
          io.socketsLeave(roomId);
          matches.delete(roomId);
          disconnectedPlayers.delete(playerId);
          disconnectedPlayers.delete(opponentId);
          return;
        }
  
        const timeout = setTimeout(() => {
          const winnerId = opponentId;
          io.to(roomId).emit(SOCKET_EVENTS.GAME_FINISHED, { winnerId });
          io.socketsLeave(roomId);
          matches.delete(roomId);
          disconnectedPlayers.delete(playerId);
        }, 20000);
  
        disconnectedPlayers.set(playerId, {
          socketId: socket.id,
          roomId,
          timeout
        });
  
        break;
      }
    }
  });
  
  socket.on(SOCKET_EVENTS.RECONNECTING_PLAYER, ({ playerId }) => {
    const data = disconnectedPlayers.get(playerId);
  
    if (!data) {
      socket.emit('RECONNECT_FAILED');
      return;
    }
  
    const { roomId, timeout } = data;
    const match = matches.get(roomId);
  
    if (!match) {
      socket.emit('RECONNECT_FAILED');
      disconnectedPlayers.delete(playerId);
      return;
    }
  
    const opponentId = match.player1.id === playerId ? match.player2.id : match.player1.id;
    const opponentDisconnected = disconnectedPlayers.has(opponentId);
  
    if (opponentDisconnected) {
      socket.emit('RECONNECT_FAILED');
      return;
    }
  
    playerIdToSocketId.set(playerId, socket.id);
    socket.playerId = playerId;
    socket.join(roomId);
    clearTimeout(timeout);
    disconnectedPlayers.delete(playerId);
  
    if (match.gameState) {
      socket.emit(SOCKET_EVENTS.SYNC_GAME_STATE, {
        gameState: match.gameState
      });
    }
  
    console.log(`Jogador ${playerId} reconectado na sala ${roomId}`);
  });  
});
