import { createClient, type RedisClientType } from "redis";
import customDelay from "../../shared/utils/customDelay.js";

async function connectWithTimeout(
  client:RedisClientType,
  delay:number
):Promise<void>{
  let timerId: ReturnType<typeof setTimeout> | undefined

  try{
    await Promise.race([
      client.connect(),
      new Promise<never>((_,rej)=>{
        timerId = setTimeout(() => {
          rej(new Error(`Redis connect timed out`))
        }, delay);
      })
    ])
  }
  finally{
    if(timerId){
      clearTimeout(timerId)
    }
  }
}

export default async function connectRedis(
  retries: number = 5,
  delayMs: number = 1000,
): Promise<RedisClientType> {
  for (let i = 1; i <= retries; i++) {
    const client = createClient({
      username: "default",
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: process.env.REDIS_URL,
        port: Number(process.env.REDIS_PORT),
        connectTimeout: 5000
      },
    });
    client.on("error", (err) => {
      console.error(`Redis client error:`, err);
    });
    try {
      await connectWithTimeout(client,3000)
      console.log("redis client connected");
      client.on("reconnecting", () => {
        console.warn(`Redis is reconnecting...`);
      });
      client.on("ready", () => {
        console.log(`Redis is ready.`);
      });
      return client;
    } catch (err) {
      console.warn(`Redis couldn't connect on ${i} try.`);
      client.destroy();
      if (i === retries) {
        throw new Error(`Redis couln't connect after ${retries} attempts.`, {
          cause: err,
        });
      }
      const delay = delayMs * i;
      await customDelay(delay);
    }
  }
  throw new Error(`Redis exit out of retry loop`);
}
