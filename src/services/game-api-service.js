import { io } from 'socket.io-client';

const socket = io('https://hero-tatics-game-backend-production.up.railway.app');
// const socket = io('localhost:3000');

socket.on('connect', () => {
  console.log('Socket conectado:', socket.id);
});

export default socket;
