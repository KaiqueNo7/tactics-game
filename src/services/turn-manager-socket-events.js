import { SOCKET_EVENTS } from "../../api/events";
import { getUserData } from "../utils/helpers";
import { getSocket } from "./game-api-service";

export default function turnManagerSocketEvents(turnManager) {
  const socket = getSocket();
  
  if (!socket) {
    console.warn('Socket não está conectado!');
    return;
  }

  socket.on(SOCKET_EVENTS.NEXT_TURN, ({ nextPlayerId }) => {
    turnManager.nextTurn(nextPlayerId);
  });

  socket.on(SOCKET_EVENTS.TURN_TIMER_TICK, ({ timeLeft }) => {
    turnManager.gameUI.updateTurnTimer(timeLeft);
  });

  socket.on(SOCKET_EVENTS.TURN_TIMEOUT, ({ playerId }) => {
    const myPlayerId = getUserData().id;

    if (playerId === myPlayerId) {
      socket.emit(SOCKET_EVENTS.NEXT_TURN_REQUEST, { 
        roomId: turnManager.gameState.roomId, 
        playerId: myPlayerId
      });
    }
  });
}
