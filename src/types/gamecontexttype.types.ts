export interface GameContextType {
    numberOfPlayers: number | null;
    playerName:string | null
    setNumberOfPlayers:(count:number)=>void;
    setPlayerName:(name:string)=>void;
}