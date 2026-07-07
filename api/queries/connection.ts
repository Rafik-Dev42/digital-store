import { drizzle } from "drizzle-orm/mysql2";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";
import { sqliteDatabasePath, useSqlite } from "@db/dialect";

const fullSchema = { ...schema, ...relations };

type DbInstance =
  | ReturnType<typeof drizzle<typeof fullSchema>>
  | ReturnType<typeof drizzleSqlite<typeof fullSchema>>;

let instance: DbInstance;

export function getDb(): DbInstance {
  if (!instance) {
    if (useSqlite()) {
      const sqlite = new Database(sqliteDatabasePath());
      sqlite.pragma("journal_mode = WAL");
      sqlite.pragma("foreign_keys = ON");
      instance = drizzleSqlite(sqlite, { schema: fullSchema });
    } else {
      instance = drizzle(env.databaseUrl, {
        mode: "planetscale",
        schema: fullSchema,
      });
    }
  }
  return instance;
}
