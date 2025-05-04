export default function buildGameState(roomId, players, currentTurn, startedPlayerId) {
  return {
    roomId,
    players,
    currentTurn,
    startedPlayerId,
    lastActionTimestamp: Date.now(),
    status: 'in_progress'
  };
}