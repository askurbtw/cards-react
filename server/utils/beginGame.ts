import { initializePlayers } from "../../shared/gameLogic/initializePlayers.ts";
import type { GameState } from "../../shared/types";

export default function beginGame (state: GameState): GameState{
  const newState = initializePlayers(state);
  const attackerId = Math.floor(Math.random() * newState.numberOfPlayers)
  const defenderId =  (attackerId + 1) % newState.numberOfPlayers

  return {
    ...newState,
    attackerId,
    defenderId,
    currentId: attackerId,
    status: "playing",
  };
};