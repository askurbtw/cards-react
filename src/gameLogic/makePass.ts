import type { GameState } from "../types";
import getPlayer from "../utils/getPlayer";
import addCards from "./addCards";
import findNextPlayers from "./findNextPlayers";
import updateLeftovers from "./updateLeftovers";

export default function makePass(state: GameState): GameState {
  if (state.currentId === state.defenderId) {
    const playersCopy = structuredClone(state.players);
    const currentPlayer = getPlayer(playersCopy, state.currentId);
    const attackPlayer = getPlayer(playersCopy, state.attackerId)
    const currentCardsCopy = structuredClone(state.currentCards);
    const deckCopy = structuredClone(state.deck)
    const currentCards = currentCardsCopy.splice(0);
    currentPlayer.cards.push(...currentCards.map((card) => card.card));
    if(attackPlayer.cards.length<6 && state.deck.cards.length>0){
        addCards(deckCopy,attackPlayer)
    }
    const [nextAttackerId, nextDefenderId] = findNextPlayers(playersCopy,(state.attackerId+2)%playersCopy.length)
    if(nextAttackerId && nextDefenderId)
    return {
        ...state,
        players:playersCopy,
        currentCards:currentCardsCopy,
        deck:deckCopy,
        attackerId:nextAttackerId,
        defenderId:nextDefenderId
    }
  }
  if (state.currentId === state.attackerId) {
    const playersCopy = structuredClone(state.players);
    const currentPlayer = getPlayer(playersCopy, state.currentId);
    const defencePlayer = getPlayer(playersCopy, state.attackerId)
    const currentCardsCopy = structuredClone(state.currentCards);
    const deckCopy = structuredClone(state.deck)
    const currentCards = currentCardsCopy.splice(0);
    if(currentPlayer.cards.length<6 && state.deck.cards.length>0){
        addCards(deckCopy,currentPlayer)
    }
    if(defencePlayer.cards.length<6 && state.deck.cards.length>0){
        addCards(deckCopy,defencePlayer)
    }
    const leftovers = updateLeftovers(currentCards)
    const [nextAttackerId, nextDefenderId] = findNextPlayers(playersCopy,(state.attackerId+1)%playersCopy.length)
    if(nextAttackerId && nextDefenderId)
    return {
        ...state,
        players:playersCopy,
        currentCards:currentCardsCopy,
        deck:deckCopy,
        leftovers:leftovers,
        attackerId:nextAttackerId,
        defenderId:nextDefenderId
    }
  }
  return state

}
