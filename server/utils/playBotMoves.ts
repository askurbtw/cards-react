import botFindValidCard from "../../shared/gameLogic/botFindValidCard.ts";
import makeMove from "../../shared/gameLogic/makeMove.ts";
import makePass from "../../shared/gameLogic/makePass.ts";
import type { GameView, Room } from "../../shared/types";
import gameView from "./gameView.ts";

export default function playBotMoves (room: Room): GameView[] {
  const stateHistory: GameView[] = [gameView(room.state, room.roomId)];
  const token = [...room.sockets.values()][0]
  const playerID = room.tokens.get(token)
  if(playerID===undefined) return stateHistory
  while ( room.state.currentId!==playerID && room.state.status !== "finished") {
    const validCard = botFindValidCard(room.state);
    if (validCard) {
      const newState = makeMove(room.state, validCard);
      if (!newState) {
        break;
      }
      room.state = newState;
      stateHistory.push(gameView(room.state, room.roomId));
    } else {
      console.log("Applying pass");
      const newState = makePass(room.state);
      if (!newState) {
        break;
      }
      room.state = newState;
      stateHistory.push(gameView(room.state, room.roomId));
    }
  }
  
  return stateHistory;
};