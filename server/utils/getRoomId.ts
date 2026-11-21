import type { IncomingMessage } from "http";

export default function getRoomId (req: IncomingMessage, regex: RegExp): string | undefined {
  const match = req.url?.match(regex);
  const id = match ? match[1] : null;
  if (id) return id
  return undefined;
};