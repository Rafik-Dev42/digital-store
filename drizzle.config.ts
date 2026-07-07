import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { sqliteDatabasePath, useSqlite } from "./db/dialect";

const connectionString = process.env.DATABASE_URL;
if (!useSqlite() && !connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

export default defineConfig(
  useSqlite()
    ? {
        schema: "./db/schema.sqlite.ts",
        out: "./db/migrations",
        dialect: "sqlite",
        dbCredentials: {
          url: sqliteDatabasePath(),
        },
      }
    : {
        schema: "./db/schema.mysql.ts",
        out: "./db/migrations",
        dialect: "mysql",
        dbCredentials: {
          url: connectionString!,
        },
      },
);
