import { it,expect,describe } from "vitest";
import type { GameState, GameView, Player, Room } from "@shared/types";
import createGame from "@shared/gameLogic/createGame";
import { initializePlayer } from "@shared/gameLogic/initializePlayer";
import beginGame from "../server/utils/beginGame";
import playBotMoves from "../server/utils/playBotMoves";
import botFindValidCard from "@shared/gameLogic/botFindValidCard";
import testPlayerMove from "./playerMoveTest";


describe('endGameSinglePlayer',()=>{
    it('single-player: attacker outOfCards, game - finished',()=>{
        const numberOfPlayers = 4
        const currentState:GameState = createGame(numberOfPlayers,'s')
        for(let i = 0;i<numberOfPlayers;i++){
            currentState.players.push(initializePlayer(`player${i}`,currentState.players.length))
        }
        const game = beginGame(currentState)
        const room : Room = {roomId:'1', state:game, tokens:new Map([['token', numberOfPlayers-1]]), sockets:new Map([['socket', 'token']])}
        const token = [...room.sockets.values()][0]
        const playerID = room.tokens.get(token)
        let stateHistory: GameView[] = []
        while(room.state.status !== "finished"){
            stateHistory = stateHistory.concat(playBotMoves(room)) 
            if(room.state.currentId===playerID){
                const newState = testPlayerMove(room)
                if(newState)
                stateHistory.push(newState)
            }
        }
        
        const lastState = stateHistory.pop()
        expect(lastState).toBeDefined()
        console.log(lastState)
        expect(lastState?.finishOrder.length).toBe(numberOfPlayers)
        expect(lastState?.status).toBe('finished')
        const playersOutOfCards = lastState?.players.filter(player=>player.isOutOfCards)
        expect(playersOutOfCards).toBeDefined()
        const isValidNumberOfPlayersOutOfCards = playersOutOfCards.length<=numberOfPlayers
        expect(isValidNumberOfPlayersOutOfCards).toBe(true)
    })
})
describe('botFindValidCard',()=>{
    it('bot picks the most suitable card available',()=>{
        const numberOfPlayers = 1
        const players : Player[] = [{
            id:0,
            name:"Player1",
            cards:[{id:'1',value:7,suit:'diamonds'},
                {id:'2',value:14,suit:'diamonds'}
            ],
            isOutOfCards:false
        }]
        const state : GameState = {
            numberOfPlayers,
            players,
            deck:{cards:[], trump:{id:'3',value:9,suit:'diamonds'}},
            playersOnline:0,
            currentCards:[{card:{id:'4',value:8,suit:'clubs'},moveType:"attack",moveNumber:1}],
            attackerId:1,
            defenderId:0,
            currentId:0,
            leftovers:[],
            movesCounter:1,
            disablePassButton:true,
            status:'playing',
            finishOrder:[],
            isSinglePlayer:true
        }
        const card = botFindValidCard(state)
        const cardExpected = {id:'1',value:7,suit:'diamonds'}
        expect(card).toBeDefined()
        expect(card).toStrictEqual(cardExpected)
    })
})
