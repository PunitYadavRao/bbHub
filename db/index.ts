import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/** DATABASE_URL locally; Netlify Database provides NETLIFY_DB_URL in production. */
export function databaseUrl(): string | undefined {
  return process.env.DATABASE_URL || process.env.NETLIFY_DB_URL;
}

function createDb() {
  const url = databaseUrl();
  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local.");
  }
  const client = postgres(url, {
    prepare: false, // compatible with connection poolers
    max: 3, // each serverless instance keeps only a few connections
    idle_timeout: 20,
    connect_timeout: 30, // the free database sleeps when idle and takes a moment to wake
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
