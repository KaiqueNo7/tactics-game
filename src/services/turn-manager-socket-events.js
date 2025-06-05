import { SOCKET_EVENTS } from "../../api/events";
import { getUserData } from "../utils/helpers";
import { getSocket } from "./game-api-service";

function onNextTurn({ nextPlayerId }, turnManager) {
  turnManager.nextTurn(nextPlayerId);
}

function onTurnTimerTick({ timeLeft }, turnManager) {
  turnManager.gameUI.updateTurnTimer(timeLeft);
}

function onTurnTimeout({ playerId }, turnManager) {
  const myPlayerId = getUserData().id;

  if (playerId === myPlayerId) {
    const socket = getSocket();
    socket.emit(SOCKET_EVENTS.NEXT_TURN_REQUEST, { 
      roomId: turnManager.gameState.roomId, 
      playerId: myPlayerId
    });
  }
}

export function registerTurnManagerSocketEvents(turnManager) {
  const socket = getSocket();

  if (!socket) {
    console.warn('Socket não está conectado!');
    return;
  }

  socket.on(SOCKET_EVENTS.NEXT_TURN, (data) => onNextTurn(data, turnManager));
  socket.on(SOCKET_EVENTS.TURN_TIMER_TICK, (data) => onTurnTimerTick(data, turnManager));
  socket.on(SOCKET_EVENTS.TURN_TIMEOUT, (data) => onTurnTimeout(data, turnManager));
}

export function unregisterTurnManagerSocketEvents() {
  const socket = getSocket();

  if (!socket) {
    return;
  }

  socket.off(SOCKET_EVENTS.NEXT_TURN);
  socket.off(SOCKET_EVENTS.TURN_TIMER_TICK);
  socket.off(SOCKET_EVENTS.TURN_TIMEOUT);
}
