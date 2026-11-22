import { randomUUID } from "node:crypto";
import { pool } from "./connectPostgre.js";


export default async function createUser(nickname:string) {
    try{
    const id = randomUUID()
    const query = `INSERT INTO users(id,nickname)
    VALUES ($1,$2)
    RETURNING id,nickname,created_at`
    const result = await pool.query(query,[id,nickname])
    console.log(result.rows[0])
    return id
    }
    catch(err){
        console.error(`Error during user creation`, err)
    }
    
}
