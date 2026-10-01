import type { Player } from "../types";

export default function findNextPlayers(
  players: Player[],
  attackerId: number,
): [number, number] {
  const numberOfPlayers = players.length;

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
