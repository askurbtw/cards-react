import botFindValidCard from "../../shared/gameLogic/botFindValidCard.js";
import endRound from "../../shared/gameLogic/endRound.js";
import makeMove from "../../shared/gameLogic/makeMove.js";
import makePass from "../../shared/gameLogic/makePass.js";
import type { GameView, Room } from "../../shared/types/index.js";
import gameView from "./gameView.js";

export default function playBotMoves (room: Room): GameView[] {
  const stateHistory: GameView[] = [gameView(room.state, room.roomId)];
  const token = [...room.sockets.values()][0]
  const playerID = room.tokens.get(token)
  if(playerID===undefined) return stateHistory
  while ( room.state.currentId!==playerID && room.state.status !== "finished") {
    const validCard = botFindValidCard(room.state);
    if (validCard) {
      let newState = makeMove(room.state, validCard);
      if (!newState) {
        break;
      }
      room.state = newState;
      stateHistory.push(gameView(room.state, room.roomId));
      if(room.state.players.find(player=>player.id===room.state.attackerId)?.cards.length===0 ||
    room.state.players.find(player=>player.id===room.state.defenderId)?.cards.length===0){
        newState = endRound(room.state,false)
        room.state = newState;
        stateHistory.push(gameView(room.state, room.roomId));
      }
      
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