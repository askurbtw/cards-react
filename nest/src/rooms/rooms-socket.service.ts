import { Injectable } from '@nestjs/common';
import { SocketService } from '../socket/socket.service.js';
import { Card } from '../../../shared/types/card.types.js';
import { Room } from '../../../shared/types/room.types.js';
import { Player } from '../../../shared/types/player.types.js';
import { GameView } from '../../../shared/types/gameView.types.js';

@Injectable()
export class RoomsSocketService {
    constructor(private readonly socketService:SocketService){}
    
    broadcast(room: Room){
        const server = this.socketService.getServer()
        if(!server){
            return
        }
        console.log("Broadcasting new state")
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
          room.sockets.forEach((token, socketID) => {
            const playerID = room.tokens.get(token);
            console.log(playerID)
            if (playerID===undefined) return;
            const players: Player[] = [];
            room.state.players.forEach((player) => {
              if (player.id === playerID) {
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
            console.log(players)
            const disablePassButton =
              playerID !== room.state.currentId
                ? true
                : playerID === room.state.attackerId && room.state.movesCounter === 1
                  ? true
                  : false;
        
            const personalState: GameView = {
              numberOfPlayers: room.state.numberOfPlayers,
              players: [...players.slice(playerID), ...players.slice(0, playerID)],
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
            console.log(socketID, playerID)
            server.to(socketID).emit("broadcast", [personalState]);
          });
        

    }

}
