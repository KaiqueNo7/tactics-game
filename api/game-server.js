import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/routes.js';
import {
  configureUtils,
  getMatch,
  startTurnTimer,
  clearTurnTimer,
  startHeroSelectionTimer,
  clearHeroSelectionTimer
} from './utils.js';
import { SOCKET_EVENTS } from './events.js';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

dotenv.config();

const matches = new Map();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'segredo_forte';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  perMessageDeflate: {
    threshold: 1024,
  },
});

configureUtils({
  socketServer: io,
  matchStore: matches,
  events: SOCKET_EVENTS
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Token não fornecido'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    return next(new Error('Token inválido'));
  }
});

const waitingQueue = new Map();
const goodLuckCache = new Map();
const disconnectedPlayers = new Map();
const playerIdToSocketId = new Map();

io.on('connection', (socket) => {
  socket.on(SOCKET_EVENTS.QUIT_QUEUE, () => {
    if (socket.playerId) {
      waitingQueue.delete(socket.playerId);
    }
  });
  
  socket.on(SOCKET_EVENTS.FINDING_MATCH, ({ player }) => {
    if (!player) {
      console.warn(`Conexão inválida de ${socket.id}: dados de player ausentes ou inválidos`);
      return;
    }
  
    setTimeout(() => {
      if (waitingQueue.has(player.id)) {
        waitingQueue.delete(player.id);
        socket.emit(SOCKET_EVENTS.QUIT_QUEUE);
      }
    }, 30000);

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
  
      const roomId = `room_${playerId1}_${playerId2}`;
      sock1.join(roomId);
      sock2.join(roomId);
  
      const match = {
        player1: { ...p1, id: playerId1 },
        player2: { ...p2, id: playerId2 },
        selectedHeroes: [],
        gameState: {
          status: 'selecting_heroes',
        }
      };
  
      matches.set(roomId, match);
  
      io.to(roomId).emit(SOCKET_EVENTS.MATCH_FOUND, {
        players: [match.player1, match.player2],
        roomId
      });

      startHeroSelectionTimer(roomId, match.player1, 0);
    }
  });

  socket.on(SOCKET_EVENTS.HERO_SELECTED_REQUEST, ({ roomId, heroName, player, step }) => {
    console.log(`Jogador ${player} selecionou o herói ${heroName} na sala ${roomId} e passo ${step}`);

    if (!roomId || !heroName) return;

    const match = matches.get(roomId);

    if (!match || match.gameState.status !== 'selecting_heroes') return;

    if (match.selectedHeroes.includes(heroName)) {
      console.warn(`Herói ${heroName} já foi selecionado na sala ${roomId}`);
      return;
    }

    match.selectedHeroes.push(heroName);

    io.to(roomId).emit(SOCKET_EVENTS.HERO_SELECTED, { heroName, player, step });

    const nextPlayer = player === 1 ? 2 : 1;

    clearHeroSelectionTimer(roomId);
    startHeroSelectionTimer(roomId, nextPlayer, step);
  });

  socket.on(SOCKET_EVENTS.SELECTION_COMPLETE, ({ roomId, players, heroes }) => {
    const match = getMatch(roomId);
    if (!match) return;

    const startedPlayerIndex = Math.floor(Math.random() * 2) + 1;
    const startedPlayerId = startedPlayerIndex === 1 ? match.player1.id : match.player2.id;

    startTurnTimer(roomId, startedPlayerId);
    clearHeroSelectionTimer(roomId);

    io.to(roomId).emit(SOCKET_EVENTS.START_GAME, {
       roomId, startedPlayerId
    });
  });

  socket.on(SOCKET_EVENTS.NEXT_TURN_REQUEST, ({ roomId, playerId }) => {
    const match = getMatch(roomId);

    if (!match) return;

    const currentTurnPlayerId = match.gameState.currentTurn.playerId;

    if (playerId !== currentTurnPlayerId) return;

    match.gameState.currentTurn.playerId =
      match.gameState.currentTurn.playerId === match.player1.id
        ? match.player2.id
        : match.player1.id;

    goodLuckCache.delete(roomId);

    io.to(roomId).emit(SOCKET_EVENTS.NEXT_TURN, {
      nextPlayerId: match.gameState.currentTurn.playerId
    });

    clearTurnTimer(roomId);
    startTurnTimer(roomId, match.gameState.currentTurn.playerId);
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

  socket.on(SOCKET_EVENTS.GAME_FINISHED_REQUEST, ({ roomId, winner }) => {
    io.to(roomId).emit(SOCKET_EVENTS.GAME_FINISHED, { winner: winner });
    io.socketsLeave(roomId);
    matches.delete(roomId);
    goodLuckCache.delete(roomId);
    clearTurnTimer(roomId);
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
    console.log(`Jogador ${playerId} desconectado`);
  
    waitingQueue.delete(playerId);
    playerIdToSocketId.delete(playerId);
  
    for (const [roomId, match] of matches.entries()) {
      if (!match) continue;
  
      const isPlayer1 = match.player1.id === playerId;
      const isPlayer2 = match.player2.id === playerId;

      if(match.gameState.status == 'selecting_heroes'){
        console.log(`Partida ${roomId} cancelada por desconexão do jogador ${playerId}`)
        io.to(roomId).emit(SOCKET_EVENTS.RETURN_TO_MATCH_ONLINE);
        io.socketsLeave(roomId);
        matches.delete(roomId);
        return;
      }
  
      if (isPlayer1 || isPlayer2) {
        const opponentId = isPlayer1 ? match.player2.id : match.player1.id;
        const opponentDisconnected = disconnectedPlayers.has(opponentId);

        if(match.gameState.status == 'in_progress'){
          io.to(roomId).emit(SOCKET_EVENTS.PLAYER_DISCONNECTED);
        }
  
        if (opponentDisconnected) {
          const winner = isPlayer1 ? match.gameState.players[1] : match.gameState.players[0];
          console.log(`Jogador ${playerId} desconectado. Vencedor: ${winner.name}`)
          io.to(roomId).emit(SOCKET_EVENTS.GAME_FINISHED, { winner: winner });
          io.socketsLeave(roomId);
          matches.delete(roomId);
          clearTurnTimer(roomId);
          disconnectedPlayers.delete(playerId);
          disconnectedPlayers.delete(opponentId);
          return;
        }
  
        if (!match.gameState || match.gameState.status === 'finished') {
          clearTurnTimer(roomId);
          return;
        }        
  
        const timeout = setTimeout(() => {
          const winner = isPlayer1 ? match.gameState.players[1] : match.gameState.players[0];
          console.log(`Jogador ${playerId} desconectado. Vencedor: ${winner.name}`)
          io.to(roomId).emit(SOCKET_EVENTS.GAME_FINISHED, { winner: winner });
          io.socketsLeave(roomId);
          matches.delete(roomId);
          clearTurnTimer(roomId);
          disconnectedPlayers.delete(playerId);
        }, 20000);
  
        disconnectedPlayers.set(playerId, {
          socketId: socket.id,
          roomId,
          timeout,
        });
  
        break;
      }
    }
  });  

  socket.on(SOCKET_EVENTS.RECONNECTING_PLAYER, ({ playerId }) => {
    const data = disconnectedPlayers.get(playerId);
  
    if (!data) {
      console.log(`Jogador ${playerId} não encontrado na fila de desconexões`);
      socket.emit('RECONNECT_FAILED');
      return;
    }
  
    const { roomId, timeout } = data;
    const match = matches.get(roomId);
  
    if (!match) {
      console.log(`Partida ${roomId} não encontrada`);
      socket.emit('RECONNECT_FAILED');
      disconnectedPlayers.delete(playerId);
      return;
    }
  
    const opponentId = match.player1.id === playerId ? match.player2.id : match.player1.id;
    const opponentDisconnected = disconnectedPlayers.has(opponentId);
  
    if (opponentDisconnected) {
      console.log(`Oponente ${opponentId} ainda desconectado`);
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
        gameState: match.gameState,
      });
    }
    
    io.to(roomId).emit(SOCKET_EVENTS.RECONNECTING_PLAYER_SUCCESS);
    console.log(`Jogador ${playerId} reconectado na sala ${roomId}`);
  });  
});

app.use(cors());
app.use(express.json());

app.use('/api', [routes]);
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));