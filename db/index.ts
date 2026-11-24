import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local.");
  }
  // prepare: false keeps this compatible with poolers such as Neon's pgbouncer.
  const client = postgres(url, { prepare: false, max: 5 });
  return drizzle(client, { schema });
}

export type Db = ReturnType<typeof createDb>;

// Created lazily so builds don't need a database, and reused across hot reloads.
const globalForDb = globalThis as unknown as { __bbhubDb?: Db };

export function getDb(): Db {
  if (!globalForDb.__bbhubDb) {
    globalForDb.__bbhubDb = createDb();
  }
  return globalForDb.__bbhubDb;
}
