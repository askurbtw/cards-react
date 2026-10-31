import type { GameState } from "../types/index.ts";

export default function findNextPlayers(
  state: GameState,
  
  attackerId: number,
): [number, number] {
  
  const players = state.players
  const numberOfPlayers = players.length;
  if(state.status==='finished') return [attackerId % numberOfPlayers, (attackerId + 1) % numberOfPlayers];
  for (let i = 0; i < numberOfPlayers - 1; i++) {
    if (players[attackerId % numberOfPlayers].isOutOfCards === false) {
      
      break;
    } else {
      attackerId += 1;
    }
  }
  
  let defenderId = attackerId + 1;
  
  for (let i = 0; i < numberOfPlayers - 1; i++) {
    if (players[defenderId % numberOfPlayers].isOutOfCards === false) {
      
      break;
    } else {
      defenderId += 1;
    }
  }
  
  console.log(attackerId % numberOfPlayers,defenderId % numberOfPlayers )
  return [attackerId % numberOfPlayers, defenderId % numberOfPlayers];
}
