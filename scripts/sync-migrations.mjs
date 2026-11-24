// Copies Drizzle's generated SQL migrations into the folder Netlify Database
// applies on every deploy. Drizzle's meta/ history stays in db/drizzle.
import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const from = "db/drizzle";
const to = "netlify/database/migrations";
mkdirSync(to, { recursive: true });

for (const file of readdirSync(from).filter((name) => /^\d+_[a-z0-9_-]+\.sql$/.test(name))) {
  copyFileSync(join(from, file), join(to, file));
  console.log(`synced ${file}`);
}
