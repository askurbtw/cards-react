import { pool } from "./connectPostgre.js";

type PlayerUpdate = {
  type: "players_ids";
  ids: Array<string>;
};
type StatusUpdate = {
  type: "status";
  status: "waiting for players" | "playing" | "finished";
};
type ResultUpdate = {
  type: "result";
  result: Array<string>;
};
export default async function updateRoomBD(
  roomID: string,
  queryData: Array<PlayerUpdate | StatusUpdate | ResultUpdate>,
) {
  try {
    if (queryData.length === 0) {
      return null;
    }
    const values: Array<string | Array<string> | object> = [roomID];
    const setClauses: string[] = [];
    const whereClauses: string[] = ["id = $1::uuid"];

    queryData.forEach((query) => {
      if (query.type === "players_ids") {

        query.ids.forEach((id) => {
        const paramsIndex = values.length + 1;
          setClauses.push(`players_ids = CASE WHEN NOT(players_ids ? $${paramsIndex}::text) THEN players_ids || jsonb_build_array($${paramsIndex}::text) ELSE players_ids END`);
          values.push(id);
        });
      }
      if (query.type === "result") {
        const paramsIndex = values.length + 1;
        setClauses.push(`result = $${paramsIndex}::jsonb`)
        values.push(JSON.stringify(query.result));
      }
      if (query.type === "status") {
        const paramsIndex = values.length + 1;
       setClauses.push(`status = $${paramsIndex}`)
    values.push(query.status);
      }
      
    });
    if (setClauses.length === 0) {
      return null;
    }
    console.log([...setClauses])
    console.log([...whereClauses])
    const sql = `UPDATE rooms
    SET ${setClauses.join(', ')}
    WHERE ${whereClauses.join(' AND ')}
    RETURNING *`;
    console.log(sql)
    console.log(values)
    const result = await pool.query(sql, values);
    console.log(result?.rows[0],'result');
    return result.rows[0] ?? null
    
    
  } catch (err) {
    console.error(`Error during room update`, err);
  }
}
