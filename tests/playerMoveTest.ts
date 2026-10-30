import botFindValidCard from "@shared/gameLogic/botFindValidCard";
import makeMove from "@shared/gameLogic/makeMove.js";
import makePass from "@shared/gameLogic/makePass.js";
import type {  Room } from "@shared/types";
import gameView from "../server/utils/gameView";

export default function testPlayerMove(room:Room){
  if(room.state.status==='finished') return gameView(room.state, room.roomId)
    const validCard = botFindValidCard(room.state);
        if (validCard) {
          console.log("Applying move");
          const newState = makeMove(room.state, validCard);
          if (!newState) {
            return
          }
          room.state = newState;
          return gameView(room.state, room.roomId)
        } else {
          console.log("Applying pass");
          const newState = makePass(room.state);
          if (!newState) {
            return
          }
          room.state = newState;
          return gameView(room.state, room.roomId)
        }
}