import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from '../../api/events';
import { setUserData, getUserData } from '../utils/helpers';

const token = localStorage.getItem('token');
const APLICATION_URL = import.meta.env.VITE_APLICATION_URL || 'http://localhost:3000';

// const socket = io('https://hero-tactics-game-backend-production.up.railway.app', {
//   auth: {
//     token: token,
//   },
// });
const socket = io(APLICATION_URL, {
  auth: {
    token: token,
  },
});

socket.on('connect', async () => {
  let user = getUserData();

  if (!user) {
    user = await setUserData();
  }

  if (user?.id) {
    socket.emit(SOCKET_EVENTS.RECONNECTING_PLAYER, { playerId: user.id });
  }
});

export default socket;
