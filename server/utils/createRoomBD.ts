
import { pool } from "./connectPostgre.js";

export default async function createRoom(roomId:string, gameType:'s' | 'm') {
    try{
    
    const game_type = gameType==='s'?'singleplayer' : 'multiplayer'
    const status = 'waiting for players'
    const query = `INSERT INTO rooms (id,status, game_type)
    VALUES($1,$2,$3)
    RETURNING id,players_ids,status,result,created_at,finished_at`
    const result = await pool.query(query,[roomId,status,game_type])
    console.log(result)
    }
    catch(err){
        throw new Error(`Error during room creation`, {cause:err})
    }
}
