import { config } from "dotenv";
config({ path: ".env.local" });

import { getDb } from "./index";
import { colleges, presetAvatars } from "./schema";

// Self-contained SVG avatars stored as data URLs, so no external image can break.
function makeSvgAvatar(bg: string, accent: string, glyph: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="28" fill="${bg}"/>
    <rect x="6" y="6" width="108" height="108" rx="24" fill="none" stroke="${accent}" stroke-opacity="0.35" stroke-width="2"/>
    <circle cx="60" cy="48" r="20" fill="${accent}"/>
    <path d="M28 104c4-20 18-30 32-30s28 10 32 30" fill="${accent}" fill-opacity="0.85"/>
    <text x="60" y="54" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="16" fill="#0B0B0D">${glyph}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const AVATARS = [
  { id: "av-crimson-owl", label: "Crimson Owl", category: "campus", sortOrder: 1, imageUrl: makeSvgAvatar("#1A1115", "#EF233C", "OWL") },
  { id: "av-solar-chai", label: "2 AM Chai", category: "campus", sortOrder: 2, imageUrl: makeSvgAvatar("#1A1710", "#FACC15", "CHAI") },
  { id: "av-cyber-panda", label: "Cyber Panda", category: "mascots", sortOrder: 3, imageUrl: makeSvgAvatar("#11171A", "#38BDF8", "PND") },
  { id: "av-neon-fox", label: "Neon Fox", category: "mascots", sortOrder: 4, imageUrl: makeSvgAvatar("#1C1310", "#FB923C", "FOX") },
  { id: "av-emerald-bot", label: "Pixel Bot", category: "tech", sortOrder: 5, imageUrl: makeSvgAvatar("#101A16", "#34D399", "BOT") },
  { id: "av-violet-cipher", label: "Night Cipher", category: "tech", sortOrder: 6, imageUrl: makeSvgAvatar("#16121E", "#A78BFA", "0x1") },
  { id: "av-maggi-king", label: "Maggi Chef", category: "campus", sortOrder: 7, imageUrl: makeSvgAvatar("#1B1610", "#FBBF24", "MGI") },
  { id: "av-ghost-coder", label: "Ghost Dev", category: "tech", sortOrder: 8, imageUrl: makeSvgAvatar("#141418", "#F4F4F5", "DEV") },
  { id: "av-rose-falcon", label: "Red Falcon", category: "mascots", sortOrder: 9, imageUrl: makeSvgAvatar("#1D1014", "#F43F5E", "FLC") },
  { id: "av-mint-otter", label: "Chill Otter", category: "mascots", sortOrder: 10, imageUrl: makeSvgAvatar("#101918", "#2DD4BF", "OTR") },
];

async function seed() {
  const db = getDb();

  await db
    .insert(colleges)
    .values({
      id: "rishihood-sonipat",
      name: "Rishihood University",
      city: "Sonipat",
      // Subdomains such as nst.rishihood.edu.in are matched automatically.
      allowedDomains: ["rishihood.edu.in"],
      timezone: "Asia/Kolkata",
    })
    .onConflictDoNothing();

  await db.insert(presetAvatars).values(AVATARS).onConflictDoNothing();

  console.log(`Seeded colleges and ${AVATARS.length} preset avatars.`);
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
