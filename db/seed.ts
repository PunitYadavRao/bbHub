import { config } from "dotenv";
config({ path: ".env.local" });

import { getDb } from "./index";
import { colleges } from "./schema";

async function seed() {
  await getDb()
    .insert(colleges)
    .values({
      id: "rishihood-sonipat",
      name: "Rishihood University",
      city: "Sonipat",
      // Matches rishihood.edu.in and every subdomain, e.g. nst.rishihood.edu.in
      allowedDomains: ["rishihood.edu.in"],
      timezone: "Asia/Kolkata",
    })
    .onConflictDoNothing();

  console.log("Seeded colleges.");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
