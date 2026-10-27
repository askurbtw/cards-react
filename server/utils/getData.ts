import type { IncomingMessage } from "http";
import type CreateRoomRequest from "../../shared/types/createroomtype.types";
import type JoinRoomRequest from "../../shared/types/joinrequesttype.types";

type allowedTypes = CreateRoomRequest | JoinRoomRequest;
export default async function getData<T extends allowedTypes> (
  req: IncomingMessage,
): Promise<T>{
  const bodyChunks: Buffer[] = [];

  for await (const chunk of req) {
    bodyChunks.push(chunk);
  }
  const rawData = Buffer.concat(bodyChunks).toString();

  try {
    return JSON.parse(rawData) as T;
  } catch {
    throw new Error("Invalid json");
  }
};