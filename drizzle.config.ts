import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Next.js keeps local secrets in .env.local, which dotenv doesn't read by default.
config({ path: ".env.local" });

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
