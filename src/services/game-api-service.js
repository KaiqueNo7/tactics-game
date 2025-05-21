import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from '../../api/events';

const token = localStorage.getItem('token');

// const socket = io('https://hero-tactics-game-backend-production.up.railway.app', {
//   auth: {
//     token: token,
//   },
// });
const socket = io('http://localhost:3000', {
  auth: {
    token: token,
  },
});

socket.on('connect', () => {
  const playerId = sessionStorage.getItem('playerId');

  if (playerId) {
    socket.emit(SOCKET_EVENTS.RECONNECTING_PLAYER, { playerId });
  }
});

export default socket;
