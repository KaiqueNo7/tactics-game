import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from '../../api/events';

const socket = io('https://hero-tatics-game-backend-production.up.railway.app');
// const socket = io('localhost:3000');

socket.on('connect', () => {
  const playerId = sessionStorage.getItem('playerId');
  if (playerId) {
    socket.emit(SOCKET_EVENTS.RECONNECTING_PLAYER, { playerId });
  }
});

export default socket;
