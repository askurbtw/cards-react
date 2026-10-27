import botFindValidCard from "@shared/gameLogic/botFindValidCard";
import makeMove from "@shared/gameLogic/makeMove";
import makePass from "@shared/gameLogic/makePass";
import type {  Room } from "@shared/types";
import gameView from "../server/utils/gameView";

export default function testPlayerMove(room:Room){
    const validCard = botFindValidCard(room.state);
        if (validCard) {
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