import { SOCKET_EVENTS } from "../../api/events";
import socket from "./game-api-service";

export default function turnManagerSocketEvents(turnManager){
  socket.on(SOCKET_EVENTS.NEXT_TURN, ({ nextPlayerId }) => {
    turnManager.nextTurn(nextPlayerId);
  });

  socket.on(SOCKET_EVENTS.TURN_TIMER_TICK, ({ timeLeft }) => {
    turnManager.gameUI.updateTurnTimer(timeLeft);
  });
  
  socket.on(SOCKET_EVENTS.TURN_TIMEOUT, ({ playerId }) => {
    const myPlayerId = this.user.id;
  
    console.log('turn timeout', playerId, myPlayerId);
  
    if (playerId === myPlayerId) {
      socket.emit(SOCKET_EVENTS.NEXT_TURN_REQUEST, { 
        roomId: turnManager.gameState.roomId, 
        playerId: myPlayerId
      });
    }
  });  
}