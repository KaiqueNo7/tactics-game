import express from 'express';
import { SOCKET_EVENTS } from './events.js';
import http from 'http';
import Player  from '../src/core/player.js';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

const waitingQueue = [];
const matches = {};
const matchReadyState = {};

io.on('connection', (socket) => {
  socket.on(SOCKET_EVENTS.FINDING_MATCH, () => {
    console.log(`Jogador ${socket.id} entrou na fila`);
    waitingQueue.push(socket);

    if (waitingQueue.length >= 2) {
      const playerSocket1 = waitingQueue.shift();
      const playerSocket2 = waitingQueue.shift();

      const roomId = `room_${playerSocket1.id}_${playerSocket2.id}`;
      playerSocket1.join(roomId);
      playerSocket2.join(roomId);

      matches[roomId] = {
        player1: new Player('Player 1', [], playerSocket1.id, 1),
        player2: new Player('Player 2', [], playerSocket2.id, 2),
        selectedHeroes: []
      };

      console.log(`Criando partida na sala ${roomId}`);

      io.to(roomId).emit(SOCKET_EVENTS.MATCH_FOUND, {
        roomId,
        players: [
          matches[roomId].player1.toJSON(),
          matches[roomId].player2.toJSON()
        ]
      });
    }
  });

  socket.on(SOCKET_EVENTS.HERO_SELECTED, ({ roomId, heroName, player, step }) => {
    console.log(`Jogador ${socket.id} selecionou o herói ${heroName} na sala ${roomId}`);
    socket.to(roomId).emit(SOCKET_EVENTS.HERO_SELECTED, { heroName, player, step });
  });  

    socket.on(SOCKET_EVENTS.SELECTION_COMPLETE, ({ roomId, players, heroes }) => {
      console.log(`[SERVER] SELECTION_COMPLETE recebido. Enviando START_GAME para sala ${roomId}`);
    
      io.to(roomId).emit(SOCKET_EVENTS.START_GAME, {
        roomId,
        players,
        heroes
      });
  });  

  socket.on('disconnect', () => {
    console.log(`Jogador desconectado: ${socket.id}`);
    const index = waitingQueue.findIndex(s => s.id === socket.id);
    if (index !== -1) waitingQueue.splice(index, 1);
  });
});
