import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from '../../api/events';
import { setUserData, getUserData } from '../utils/helpers';

const APLICATION_URL = import.meta.env.VITE_APLICATION_URL || 'http://localhost:3000';

let socket = null;

export async function connectSocket() {
  const token = localStorage.getItem('token');

  return new Promise((resolve, reject) => {
    if (socket) {
      socket.disconnect();
    }

    socket = io(APLICATION_URL, {
      auth: { token },
    });

    socket.on('connect', async () => {
      let user = getUserData();
      if (!user) {
        user = await setUserData();
      }

      if (user?.id) {
        socket.emit(SOCKET_EVENTS.RECONNECTING_PLAYER, { playerId: user.id });
        resolve(socket);
      } else {
        reject('Usuário inválido');
      }
    });

    socket.on('connect_error', () => {
      reject('Erro de conexão');
    });
  });
}

export function getSocket() {
  return socket;
}
