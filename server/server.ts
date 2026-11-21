import http, { IncomingMessage, ServerResponse } from "http";
import "dotenv/config";
import { randomUUID } from "node:crypto";
import createGame from "../shared/gameLogic/createGame.js";
import type CreateRoomRequest from "../shared/types/createroomtype.types.ts";
import broadcastState from "./utils/broadcastState.js";
import checkValidCard from "../shared/gameLogic/checkValidCard.js";
import makeMove from "../shared/gameLogic/makeMove.js";
import makePass from "../shared/gameLogic/makePass.js";
import { initializePlayer } from "../shared/gameLogic/initializePlayer.js";
import getData from "./utils/getData.js";
import { Server } from "socket.io";
import playBotMoves from "./utils/playBotMoves.js";
import gameView from "./utils/gameView.js";
import beginGame from "./utils/beginGame.js";
import endRound from "../shared/gameLogic/endRound.js";
import connectRedis from "./utils/connectRedis.js";
import type { RedisClientType } from "redis";
import getRoomHash from "./utils/getRoomHash.js";
import getRoomId from "./utils/getRoomId.js";
import updateRedisRoom from "./utils/updateRedisRoom.js";

const PORT = Number(process.env.PORT) || 8000;
const ALLOWED_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

const joinRoomPattern = /^\/routes\/join\/room\/([^/]+)$/;




let redisClient: RedisClientType | null = null;
try {
  redisClient = await connectRedis();
} catch (err) {
  console.error(err);
  process.exit(1);
}

const server = http.createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
    res.setHeader("Vary", "Origin");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }
    if (req.url && req.url.startsWith("/socket.io/")) {
      return;
    }
    if (!req.url) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Missing request URL" }));
    }
    if (req.method === "POST" && req.url === "/routes/create/room") {
      try{
      const roomId = randomUUID();
      const data = await getData<CreateRoomRequest>(req);
      console.log(data);
      const state = createGame(data.numberOfPlayers, data.gameType);
      const room = {
        roomId,
        state,
        tokens: new Map(),
        sockets: new Map(),
      };
      
      await updateRedisRoom(room)
      const response = {
        roomId,
        state: gameView(state, roomId),
      };
      const room1  = await getRoomHash(roomId)
      console.log(room1)
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(response));
    }
    catch(err){
      console.error(`Error:`, err)
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify(err));
    }
    }
    if (req.method === "POST" && joinRoomPattern.test(req.url)) {
      if(!redisClient){
        res.writeHead(409, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unexpected error." }));
        return;
      }
      const roomId = getRoomId(req,joinRoomPattern)
      if (!roomId ) {
        res.writeHead(409, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "No roomid specified." }));
        return;
      }
      const room = await getRoomHash(roomId)
      
      if (!room ) {
        res.writeHead(409, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "No room found." }));
        return;
      }
      if (room.state.playersOnline === room.state.numberOfPlayers) {
        res.writeHead(409, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Room is full." }));
        return;
      }

      const response = {
        roomId: room.roomId,
        state: gameView(room.state, room.roomId),
      };
      
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(response));
      return;
    }
  },
);

const io = new Server(server, { cors: { origin: ALLOWED_ORIGIN } });

io.on("connection", (socket) => {
  socket.on("join_room", async (data, callback) => {
    try{
    console.log("Joining1");
    console.log(data.roomId)
    const room = await getRoomHash(data.roomId)
    if (!room) return callback({ error: "No room found" });
    if (room.state.numberOfPlayers === room.state.playersOnline)
      return callback({ error: "Room is full" });
    const player = initializePlayer(data.playerName, room.state.playersOnline);
    const playerToken = randomUUID();
    room.state.players.push(player);
    socket.join(data.roomId);
    room.sockets.set(socket.id, playerToken);
    room.tokens.set(playerToken, player.id);
    room.state.playersOnline += 1;
    console.log("Joining2");
    if (room.state.playersOnline === room.state.numberOfPlayers) {
      console.log("Full");
      const newState = beginGame(room.state);
      if (newState) {
        room.state = newState;
        await updateRedisRoom(room)
        console.log(room.state);
        callback({
          data: { playerID: player.id, token: playerToken },
          error: "",
        });
        broadcastState(io, room);

        return;
      }
    }
    await updateRedisRoom(room)
    console.log("Joining3");
    callback({ data: { playerID: player.id, token: playerToken }, error: "" });
    broadcastState(io, room);
  }
  catch(err){
    return callback({ error: err });
  }
  });
  socket.on("player_left", async () => {
    for (const roomID of socket.rooms)
      if (roomID !== socket.id) {
        socket.leave(roomID);
        const room = await getRoomHash(roomID)
        if (!room) return;
        if (room) {
          const playerToken = room.sockets.get(socket.id);
          if (!playerToken) return;
          const playerID = room.tokens.get(playerToken);
          if (!playerID) return;
          room.state.players = room.state.players.filter(
            (playerstate) => playerstate.id !== playerID,
          );
          room.sockets.delete(socket.id);
          room.state.playersOnline -= 1;
        }
        await updateRedisRoom(room)
        console.log(room.state.players);
        broadcastState(io, room);
      }
  });
  socket.on("make_move", async (cardId, callback) => {
    const roomID = Array.from(socket.rooms)[1];
    console.log(roomID, socket.rooms)
    const room = await getRoomHash(roomID)

    if (!room) {
      console.log("No room");
      return;
    }
    const token = room?.sockets.get(socket.id);
    if (!token) {
      console.log("No token");
      return;
    }
    
     
    const playerID = room.tokens.get(token);

    if (playerID === undefined) {
      console.log("No player");
      return callback({ error: "No player found." });
    }
    const isPlayerTurn = room?.state.currentId === playerID ? true : false;
    if (!room || !isPlayerTurn) {
      console.log("No room");
      return callback({ error: "Invalid move." });
    }
    const moveType =
      room.state.currentId === room.state.attackerId ? "attack" : "defence";
    const { isCardValid, card } = checkValidCard(cardId, room.state, moveType);
    console.log(socket.rooms)
    console.log(room.sockets)
    console.log(room.state.players)
    console.log("-----------")
    console.log(room.state)
    console.log(card)
    console.log(isCardValid)
    if (!isCardValid || !card) {
      console.log("Invalid move.");
      return callback({ error: "Invalid move." });
    }
    const nextState = makeMove(room.state, card);
    callback({ error: null });
    if (!nextState) {
      return callback({ error: "Something went wrong" });
    }
    room.state = nextState;
    if (
      moveType === "attack"
        ? room.state.players.find(
            (player) => player.id === room.state.defenderId,
          )?.cards.length === 0
        : room.state.players.find(
            (player) => player.id === room.state.attackerId,
          )?.cards.length === 0
    ) {
      const newState = endRound(room.state, false);
      room.state = newState;
    }
    if (room.state.isSinglePlayer) {
      const stateHistory = playBotMoves(room);
      io.to(socket.id).emit("broadcast", stateHistory);
    } else {
      broadcastState(io, room);
    }
    await updateRedisRoom(room)
    if (room.state.status === "finished") {
      io.in(roomID).socketsLeave(roomID);
    }
  });

  socket.on("make_pass", async (callback) => {
    const roomID = Array.from(socket.rooms)[1];
    const room = await getRoomHash(roomID)
    console.log(room);
    if (!room) return;
    const token = room?.sockets.get(socket.id);
    if (!token) return;
    const playerID = room.tokens.get(token);
    if (playerID === undefined) {
      console.log("no player");
      return callback({ error: "No player found." });
    }
    const isPlayerTurn = room?.state.currentId === playerID ? true : false;
    if (!room || !isPlayerTurn) {
      console.log("Invalid move.");
      return callback({ error: "Invalid move." });
    }
    const nextState = makePass(room.state);
    if (!nextState) {
      return callback({ error: "Something went wrong" });
    }
    room.state = nextState;
    if (room.state.isSinglePlayer) {
      const stateHistory = playBotMoves(room);
      io.to(socket.id).emit("broadcast", stateHistory);
    } else {
      broadcastState(io, room);
    }
    await updateRedisRoom(room)
    if (room.state.status === "finished") {
      io.in(roomID).socketsLeave(roomID);
    }
  });
  socket.on("rejoin", async (data, callback) => {
    const roomID = data.roomID;
    const token = socket.handshake.auth.token;
    console.log(token, roomID);
    if (!token) return;
    console.log(roomID);
    const room = await getRoomHash(roomID)

    if (!room) {
      console.log("No room");
      return;
    }
    const playerID = room.tokens.get(token);
    if (playerID === undefined) {
      console.log("No player");
      return;
    }
    callback(playerID);
    room.sockets.set(socket.id, token);
    socket.join(roomID);
    await updateRedisRoom(room)
    broadcastState(io, room);
  });
  socket.on("disconnect", async (reason) => {
    console.log(`Player ${socket.id} disconnected.`);
    console.log(reason);
    const roomID = Array.from(socket.rooms)[1];
    const room = await getRoomHash(roomID)
    if (!room) return;
    const result = room.sockets.delete(socket.id);
    await updateRedisRoom(room)
    if (result) console.log("Socket deleted");
    else return console.log("Socket was not deleted.");
  });

  socket.on("single_player", async (data, callback) => {
    const playerName = data.playerName;
    const roomId = data.roomId;
    const room = await getRoomHash(roomId)
    if (!room) return callback({ error: "No room found" });
    socket.join(roomId);
    const player = initializePlayer(playerName, room.state.playersOnline);
    const playerToken = randomUUID();
    room.state.players.push(player);
    callback({ data: { playerID: player.id, token: playerToken }, error: "" });
    socket.join(data.roomId);
    room.sockets.set(socket.id, playerToken);
    room.tokens.set(playerToken, player.id);
    room.state.playersOnline += 1;
    let counter = room.state.players.length;
    for (counter; counter < room.state.numberOfPlayers; counter++) {
      const newBot = initializePlayer(
        `Bot#${counter}`,
        room.state.players.length,
      );
      room.state.players.push(newBot);
      room.state.playersOnline += 1;
    }
    const newState = beginGame(room.state);
    console.log(newState);
    room.state = newState;
    await updateRedisRoom(room)
    const room1 = await getRoomHash(roomId)
    console.log(room1?.state)
    if (newState && newState.currentId !== player.id) {
      const stateHistory = playBotMoves(room);
      await updateRedisRoom(room)
      io.to(socket.id).emit("broadcast", stateHistory);
    } else {
      broadcastState(io, room);
    }
    console.log(socket.rooms)
    console.log(room.sockets)
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
