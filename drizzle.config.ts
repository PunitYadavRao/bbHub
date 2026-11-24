import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

// Drizzle keeps its history in db/drizzle. `npm run db:generate` then copies the
// SQL files into netlify/database/migrations, which Netlify applies on deploy.
export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/drizzle",
  dialect: "postgresql",
  dbCredentials: { url: (process.env.DATABASE_URL || process.env.NETLIFY_DB_URL)! },
});
