export function getInsertId(result: unknown): number {
  if (Array.isArray(result)) {
    const row = result[0] as { insertId?: number | bigint } | undefined;
    if (row?.insertId != null) {
      return Number(row.insertId);
    }
  }

  if (result && typeof result === "object") {
    const row = result as {
      insertId?: number | bigint;
      lastInsertRowid?: number | bigint;
    };
    if (row.insertId != null) {
      return Number(row.insertId);
    }
    if (row.lastInsertRowid != null) {
      return Number(row.lastInsertRowid);
    }
  }

  throw new Error("Could not determine insert id from database result");
}
