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
import { initializePlayer } from "../shared/gameLogic/initializePlayer.ts";
import type JoinRoomRequest from "../shared/types/joinrequesttype.types.ts";
import { Server } from "socket.io";
import { initializePlayers } from "../shared/gameLogic/initializePlayers.ts";

const PORT = 8000;
type allowedTypes = CreateRoomRequest | MoveRequest | JoinRoomRequest;
const rooms: Map<string, Room> = new Map();
const applyMovePattern = /^\/routes\/apply\/move\/([^/]+)$/;
const applyPassPattern = /^\/routes\/apply\/pass\/([^/]+)$/;
const joinRoomPattern = /^\/routes\/join\/room\/([^/]+)$/;

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

const getRoom = (req: IncomingMessage, regex: RegExp): Room | undefined => {
  const match = req.url?.match(regex);
  const id = match ? match[1] : null;
  if (id) return rooms.get(id);
  return undefined;
};

const verifyPlayer = (
  playerUUID: string,
  room: Room | undefined,
): boolean | undefined => {
  if (!room) return undefined;
  const validPlayer = room?.tokens.get(playerUUID) === 0 ? true : false;
  return validPlayer;
};

const startGame = (state: GameState): GameState => {
  const newState = initializePlayers(state);
  const attackerId = Math.floor(Math.random() * newState.numberOfPlayers);
  const defenderId = (attackerId + 1) % newState.numberOfPlayers;

  return {
    ...newState,
    attackerId,
    defenderId,
    currentId: attackerId,
    status: "playing",
  };
};

const playBotMoves = (room: Room, res: ServerResponse): GameView[] => {
  const stateHistory: GameView[] = [gameView(room.state, room.roomId)];
  while (room.state.currentId !== 0 && room.state.status != "finished") {
    const validCard = botFindValidCard(room.state);
    if (validCard) {
      const newState = makeMove(room.state, validCard);
      if (!newState) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Something went wrong." }));
        break;
      }
      room.state = newState;
      stateHistory.push(gameView(room.state, room.roomId));
    } else {
      console.log("Applying pass");
      const newState = makePass(room.state);
      if (!newState) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Something went wrong." }));
        break;
      }
      room.state = newState;
      stateHistory.push(gameView(room.state, room.roomId));
    }
  }
  return stateHistory;
};

const gameView = (state: GameState, roomId: string): GameView => {
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
    numberOfPlayers: state.numberOfPlayers,
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
    finishOrder: state.finishOrder,
    playersOnline: state.playersOnline,
  };
};

const broadcastState = (io: Server, room: Room): void => {
  const deckCards: Card[] = [];
  for (let i = 0; i < room.state.deck.cards.length; i++) {
    deckCards.push({
      id: "",
      value: 0,
      suit: "",
    });
  }
  const deckForView = {
    cards: deckCards,
    trump: room.state.deck.trump,
  };
  room.sockets.forEach((socketPlayer, socketID) => {
    const players: Player[] = [];
    room.state.players.forEach((player) => {
      if (player.id === socketPlayer.id) {
        const playerToView = structuredClone(player);
        players.push(playerToView);
      } else {
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
        players.push(playerToView);
      }
    });
    
    const disablePassButton = socketPlayer.id!==room.state.currentId?true:
    socketPlayer.id===room.state.attackerId && room.state.movesCounter===1?true : 
    false
    console.log(
      `${socketPlayer} ${disablePassButton} ${room.state.movesCounter}`,
    );
    const personalState: GameView = {
      numberOfPlayers: room.state.numberOfPlayers,
      players: [...players.slice(socketPlayer.id), ...players.slice(0, socketPlayer.id)],
      deck: deckForView,
      currentCards: room.state.currentCards,
      attackerId: room.state.attackerId,
      defenderId: room.state.defenderId,
      currentId: room.state.currentId,
      leftovers: room.state.leftovers.length,
      disablePassButton: disablePassButton,
      status: room.state.status,
      roomId: room.roomId,

      finishOrder: room.state.finishOrder,
      playersOnline: room.state.playersOnline,
    };
    io.to(socketID).emit("broadcast", personalState);
  });
};

const server = http.createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    if (!req.url) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Missing request URL" }));
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
        tokens: new Map([[playerToken, state.players[0].id]]),
        sockets: new Map(),
      };

      const response = {
        roomId,
        state: gameView(state, roomId),
        token: playerToken,
        playerID : state.players[0].id
      };
      rooms.set(roomId, room);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(response));
    }
    if (req.method === "POST" && applyMovePattern.test(req.url)) {
      const playerUUID = req.headers["authorization"];
      if (!playerUUID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON payload" }));
        return;
      }
      const room = getRoom(req, applyMovePattern);
      const validPlayer = verifyPlayer(playerUUID, room);
      const isPlayerTurn =
        room?.state.currentId === room?.state.players[0].id ? true : false;
      if (!validPlayer || !room || !isPlayerTurn) {
        res.writeHead(409, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Conflict" }));
        return;
      }
      const data = await getData<MoveRequest>(req);

      const moveType =
        room.state.currentId === room.state.attackerId ? "attack" : "defence";
      const { isCardValid, card } = checkValidCard(
        data.cardId,
        room.state,
        moveType,
      );
      if (!isCardValid || !card) {
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
      const stateHistory = playBotMoves(room, res);
      const response = {
        stateHistory,
      };
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(response));
      return;
    }

    if (req.method === "POST" && applyPassPattern.test(req.url)) {
      const playerUUID = req.headers["authorization"];
      if (!playerUUID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON payload" }));
        return;
      }
      const room = getRoom(req, applyPassPattern);
      const validPlayer = verifyPlayer(playerUUID, room);
      const isPlayerTurn =
        room?.state.currentId === room?.state.players[0].id ? true : false;
      if (!validPlayer || !room || !isPlayerTurn) {
        res.writeHead(409, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Conflict" }));
        return;
      }
      const nextState = makePass(room.state);
      if (!nextState) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Something went wrong." }));
        return;
      }
      room.state = nextState;
      const stateHistory = playBotMoves(room, res);
      const response = {
        stateHistory,
      };
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(response));
      return;
    }
    if (req.method === "POST" && joinRoomPattern.test(req.url)) {
      const room = getRoom(req, joinRoomPattern);

      if (!room) {
        res.writeHead(409, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Conflict" }));
        return;
      }
      if (room.state.playersOnline === room.state.numberOfPlayers) {
        res.writeHead(409, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Room is full." }));
        return;
      }
      const data = await getData<JoinRoomRequest>(req);
      const playerToken = randomUUID();
      const player: Player = initializePlayer(
        data.playerName,
        room.state.players.length,
      );
      room.tokens.set(playerToken, player.id);
      room.state.players.push(player);
      const response = {
        roomId: room.roomId,
        state: gameView(room.state, room.roomId),
        token: playerToken,
        playerID: player.id
      };
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(response));
      return;
    }
  },
);

const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  socket.on("join_room", (roomId, callback) => {
    const room = rooms.get(roomId);
    if (!room) return callback({error:"No room found"})
    if(room.state.numberOfPlayers===room.state.playersOnline) return callback({error:"Room is full"})
    socket.join(roomId)
    room.state.playersOnline += 1;
    const player = room.state.players[room.state.players.length - 1];
    room.sockets.set(socket.id, player);
    if (room.state.playersOnline === room.state.numberOfPlayers) {
      console.log("Full");
      const newState = startGame(room.state);
      if (newState) {
        room.state = newState;
        broadcastState(io, room);
        return;
      }
    }
    broadcastState(io, room);
  });
  socket.on("player_left", (token) => {
    for (const roomID of socket.rooms)
      if (roomID !== socket.id) {
        socket.leave(roomID);
        const room: Room | undefined = rooms.get(roomID);
        if (!room) return;
        if (room) {
          const player = room.state.players.find(
            (player) => player.id === room.tokens.get(token),
          );
          console.log(player);
          room.state.players = room.state.players.filter(
            (playerstate) => playerstate.id !== player?.id,
          );
          room.state.playersOnline -= 1;
        }
        console.log(room.state.players);
        broadcastState(io, room);
      }
  });
  socket.on("make_move", (cardId, callback) => {
    const roomID = Array.from(socket.rooms)[1];
    const room = rooms.get(roomID);
    console.log(socket.rooms)
    console.log(roomID)

    console.log(room)
    console.log(room?.sockets)
    const player = room?.sockets.get(socket.id);
    if (!player) {
      return callback({ error: "No player found." });
    }
    const isPlayerTurn = room?.state.currentId === player.id ? true : false;
    if (!room || !isPlayerTurn) {
      console.log("No room");
      return callback({ error: "Invalid move." });
    }
    const moveType =
      room.state.currentId === room.state.attackerId ? "attack" : "defence";
    const { isCardValid, card } = checkValidCard(cardId, room.state, moveType);
    if (!isCardValid || !card) {
      return callback({ error: "Invalid move." });
    }
    const nextState = makeMove(room.state, card);
    if (!nextState) {
      return callback({ error: "Something went wrong" });
    }
    room.state = nextState;
    broadcastState(io, room);
  });

  socket.on("make_pass", (callback) => {
    const roomID = Array.from(socket.rooms)[1];
    const room = rooms.get(roomID);
    
    const player = room?.sockets.get(socket.id);
    if (!player) {
      return callback({ error: "No player found." });
    }
    const isPlayerTurn = room?.state.currentId === player.id ? true : false;
    if (!room || !isPlayerTurn) {
      return callback({ error: "Invalid move." });
    }
    const nextState = makePass(room.state);
    if (!nextState) {
      return callback({ error: "Something went wrong" });
    }
    room.state = nextState;
    broadcastState(io, room);
  });
  socket.on("rejoin",(data,callback)=>{
    const roomID = data.roomID
    const token = data.token
    console.log(roomID)
    const room = rooms.get(roomID)
    
    if(!room) {console.log("No room")
      return}
    const player = room.state.players.find(player=>player.id===room.tokens.get(token))
    if(!player) {console.log("No player")
      return}
    callback(player.id)
    room.sockets.set(socket.id, player)
    broadcastState(io,room)
  })
  socket.on("disconnect",(reason)=>{
    console.log(`Player ${socket.id} disconnected.`)
    console.log(reason)
    const roomID = Array.from(socket.rooms)[1]
    const room = rooms.get(roomID)
    if(!room) return
    const result = room.sockets.delete(socket.id)
    if(result) console.log("Socket deleted")
      else return console.log("Socket was not deleted.")

  })
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
