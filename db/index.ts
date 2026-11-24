import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local.");
  }
  const client = postgres(url, {
    prepare: false, // required by Neon's pooled (pgbouncer) connection
    max: 3, // each serverless instance keeps only a few connections
    idle_timeout: 20,
    connect_timeout: 30, // Neon's free tier sleeps when idle and takes a moment to wake
  });
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
