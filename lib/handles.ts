import { randomInt } from "node:crypto";

export { normalizeHandle, validateHandleFormat } from "./handle-rules";

// Hand-picked so every generated handle is safe to show publicly.
const ADJECTIVES = [
  "Cosmic", "Silent", "Velvet", "Midnight", "Lazy", "Sleepy", "Turbo", "Neon",
  "Rapid", "Quiet", "Golden", "Crimson", "Lucky", "Fuzzy", "Witty", "Brave",
  "Mellow", "Stormy", "Frosty", "Sunny", "Swift", "Cheeky", "Chill", "Sneaky",
  "Clever", "Wild", "Calm", "Bold", "Shy", "Jolly", "Rusty", "Pixel",
  "Electric", "Hidden", "Lunar", "Solar", "Misty", "Cozy", "Zesty", "Nimble",
];

const NOUNS = [
  "Panda", "Hawk", "Chai", "Maggi", "Lantern", "Falcon", "Otter", "Nebula",
  "Cipher", "Owl", "Bench", "Spark", "Samosa", "Tiger", "Comet", "Koala",
  "Raven", "Mango", "Pebble", "Rocket", "Walrus", "Parrot", "Biscuit", "Dosa",
  "Fox", "Lynx", "Penguin", "Badger", "Cactus", "Meteor", "Gecko", "Quokka",
  "Yak", "Sparrow", "Turtle", "Wombat", "Jalebi", "Paratha", "Lassi", "Kite",
];

function pick<T>(list: readonly T[]): T {
  return list[randomInt(list.length)];
}

/** Random handles like "Cosmic-Panda-24". Callers still check the database. */
export function generateCandidateHandles(count: number): string[] {
  const handles = new Set<string>();
  while (handles.size < count) {
    const digits = String(randomInt(100)).padStart(2, "0");
    handles.add(`${pick(ADJECTIVES)}-${pick(NOUNS)}-${digits}`);
  }
  return [...handles];
}
