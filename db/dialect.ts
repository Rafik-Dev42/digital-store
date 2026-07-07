import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function useSqlite(): boolean {
  return process.env.USE_SQLITE === "true";
}

export function sqliteDatabasePath(): string {
  return (
    process.env.SQLITE_DATABASE_PATH ??
    path.resolve(__dirname, "../.local/dev.db")
  );
}
