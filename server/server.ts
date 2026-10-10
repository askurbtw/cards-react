import http, { IncomingMessage, ServerResponse } from "http";
import {
  type Card,
  type GameState,
  type GameView,
  type Player,
  type Room,
} from "../shared/types/index.ts";
import { randomUUID } from "node:crypto";
import createGame from "../shared/gameLogic/createGame.ts";
import type CreateRoomRequest from "../shared/types/createroomtype.types.ts";
import type MoveRequest from "../shared/types/moverequest.types.ts";
import checkValidCard from "../shared/gameLogic/checkValidCard.ts";
import makeMove from "../shared/gameLogic/makeMove.ts";
import botFindValidCard from "../shared/gameLogic/botFindValidCard.ts";
import makePass from "../shared/gameLogic/makePass.ts";

const PORT = 8000;
type allowedTypes = CreateRoomRequest | MoveRequest;
const rooms: Map<string, Room> = new Map();
const applyMovePattern = /^\/routes\/apply\/move\/([^/]+)$/;
const applyPassPattern = /^\/routes\/apply\/pass\/([^/]+)$/

const getData = async <T extends allowedTypes>(
  req: IncomingMessage,
): Promise<T> => {
  const bodyChunks: Buffer[] = [];

  for await (const chunk of req) {
    bodyChunks.push(chunk);
  }
  const rawData = Buffer.concat(bodyChunks).toString();

  try {
    return JSON.parse(rawData) as T;
  } catch {
    throw new Error("Invalid json");
  }
};

const getRoom = (req: IncomingMessage, regex: RegExp) : Room | undefined  => {
  const match = req.url?.match(regex);
  const id = match ? match[1] : null;
  if(id) return rooms.get(id)
  return undefined

};

const verifyPlayer = (
  playerUUID: string,
  room: Room | undefined ,
) : boolean | undefined=>{
  if(!room) return undefined
  const validPlayer =
    room?.tokens.get(playerUUID) === 0
      ? true
      : false;
  return validPlayer
}


const playBotMoves = (room: Room, res:ServerResponse) : GameView[]=> {
  const stateHistory: GameView[] = [gameView(room.state,room.roomId)];
      while (room.state.currentId !== 0 && room.state.status!='finished') {
        const validCard = botFindValidCard(room.state);
        if (validCard) {
          const newState = makeMove(room.state, validCard);
          if (!newState) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Something went wrong." }));
            break;
          }
          room.state = newState;
          stateHistory.push(gameView(room.state,room.roomId));
        } else {
          console.log("Applying pass");
          const newState = makePass(room.state);
          if (!newState) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Something went wrong." }));
            break;
          }
          room.state = newState;
          stateHistory.push(gameView(room.state,room.roomId));
        }
      }
    return stateHistory
}

const gameView = (state: GameState, roomId:string): GameView => {
  const playersForView: Player[] = [];
  const deckCards: Card[] = [];
  for (let i = 0; i < state.deck.cards.length; i++) {
    deckCards.push({
      id: "",
      value: 0,
      suit: "",
    });
  }
  state.players.forEach((player) => {
    if (player.id === 0) {
      const playerToView = structuredClone(player);
      playersForView.push(playerToView);
    }
    if (player.id !== 0) {
      const numberOfCards = player.cards.length;
      const cards: Card[] = [];
      for (let i = 0; i < numberOfCards; i++) {
        const card = {
          id: "",
          value: 0,
          suit: "",
        };
        cards.push(card);
      }
      const playerToView = { ...player, cards };
      playersForView.push(playerToView);
    }
  });
  const deckForView = {
    cards: deckCards,
    trump: state.deck.trump,
  };
  return {
    players: playersForView,
    deck: deckForView,
    currentCards: state.currentCards,
    attackerId: state.attackerId,
    defenderId: state.defenderId,
    currentId: state.currentId,
    leftovers: state.leftovers.length,
    disablePassButton: state.disablePassButton,
    status: state.status,
    roomId,
    finishOrder: state.finishOrder
  };
};

const server = http.createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    if (!req.url) {
  res.writeHead(400, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify({ error: 'Missing request URL' }));
}
    if (req.method === "POST" && req.url === "/routes/create/room") {
      const playerToken = randomUUID();
      const roomId = randomUUID();
      const data = await getData<CreateRoomRequest>(req);
      console.log(data);
      const state = createGame(data.numberOfPlayers, data.playerName);
      const room = {
        roomId,
        state,
        tokens: new Map([[playerToken, 0]]),
      };
      const response = {
        roomId,
        state: gameView(state, roomId),
        token: playerToken
      };
      rooms.set(roomId, room);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(response));
    }
    if (req.method === "POST"  && applyMovePattern.test(req.url)) {
      const playerUUID = req.headers["authorization"];
      if (!playerUUID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON payload" }));
        return;
      }
      const room = getRoom(req, applyMovePattern);
      const validPlayer = verifyPlayer(playerUUID,room)
      const isPlayerTurn = room?.state.currentId === room?.state.players[0].id ? true : false
      if (!validPlayer || !room  || !isPlayerTurn ) {
        res.writeHead(409, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Conflict" }));
        return;
      }
      const data = await getData<MoveRequest>(req);
      
      const moveType =
        room.state.currentId === room.state.attackerId ? "attack" : "defence";
      const {isCardValid, card} = checkValidCard(
        data.cardId,
        room.state,
        moveType,
      );
      if (!isCardValid  || !card) {
        res.writeHead(409, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid move." }));
        return;
      }
      const nextState = makeMove(room.state, card);
      if (!nextState) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Something went wrong." }));
        return;
      }
      room.state = nextState;
      const stateHistory = playBotMoves(room,res)
      const response = {
        stateHistory
      }
      res.writeHead(200, {'Content-Type':'application/json'})
      res.end(JSON.stringify(response))
      return
    }

    if (req.method === "POST" && applyPassPattern.test(req.url)) {
      const playerUUID = req.headers["authorization"];
      if (!playerUUID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON payload" }));
        return;
      }
      const room = getRoom(req, applyPassPattern);
      const validPlayer = verifyPlayer(playerUUID,room)
      const isPlayerTurn = room?.state.currentId === room?.state.players[0].id ? true : false
      if (!validPlayer || !room  || !isPlayerTurn ) {
        res.writeHead(409, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Conflict" }));
        return;
      }
      const nextState = makePass(room.state)
      if (!nextState) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Something went wrong." }));
        return;
      }
      room.state = nextState;
      const stateHistory = playBotMoves(room,res)
      const response = {
        stateHistory
      }
      res.writeHead(200, {'Content-Type':'application/json'})
      res.end(JSON.stringify(response))
      return

    }
  },
);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
