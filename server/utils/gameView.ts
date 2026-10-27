import type { Card, GameState, GameView, Player } from "../../shared/types";

export default function gameView (state: GameState, roomId: string): GameView{
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