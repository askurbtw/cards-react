import { Pool } from "pg";

const getDBURL = ()=>{
        const url = process.env.DATABASE_URL;
        if(!url){
            throw new Error(`Error during getting db url`)
        }
        const parsed = new URL(url);
console.log({
  protocol: parsed.protocol,
  hostname: parsed.hostname,
  port: parsed.port,
  pathname: parsed.pathname,
  hasUsername: Boolean(parsed.username),
  hasPassword: Boolean(parsed.password),
});
        return url
    
}

export const pool = new Pool({
    connectionString:getDBURL(),
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
});

pool.on("error", (err)=>{
    console.error("Postgre error: ",err)
})

pool.on("connect",()=>{
    console.log(`Pool size is now ${pool.totalCount} out of ${pool.options.max}. ${pool.idleCount} connections are idling. ${pool.waitingCount} queries are waiting.`)
})
