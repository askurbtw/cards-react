import type {  Player } from "../types";
import checkIfAreAvailablePlayers from "./checkIfAreAvailablePlayers";

export default function findNextPlayers(
  players: Player[],
  attackerId: number,
): [number, number] | [null,null] {
  if (checkIfAreAvailablePlayers(players)) {
    const numberOfPlayers = players.length;
    
    for (let i = 0; i < numberOfPlayers - 1; i++) {
      if (players[attackerId % numberOfPlayers].isOutOfCards === false) {
        break;
      } else {
        attackerId += 1;
      }
    }
    let defenderId = attackerId+1
    for (let i = 0; i < numberOfPlayers - 1; i++) {
      if (players[defenderId % numberOfPlayers].isOutOfCards === false) {
        break;
      } else {
        defenderId += 1;
      }
    }
    return [attackerId,defenderId]
  }
  return [null,null]
  
}
