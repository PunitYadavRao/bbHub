// Handle validation shared by the browser form and the server.

// Words a handle may not contain: impersonation risks and the brand itself.
const RESERVED_WORDS = [
  "admin", "moderator", "mod", "bbhub", "backbencher", "rishihood", "newton",
  "nst", "dean", "warden", "official", "support", "grievance", "staff",
  "faculty", "professor", "registrar", "security",
];

// Basic profanity screen (English and common Hinglish). Expand as moderation grows.
const BLOCKED_WORDS = [
  "fuck", "shit", "bitch", "cunt", "dick", "pussy", "slut", "whore", "rape",
  "nigger", "nigga", "fag", "retard", "chutiya", "chutia", "bhenchod", "bc",
  "madarchod", "mc", "gaand", "gandu", "lund", "randi", "harami", "kutta",
  "kamina", "bsdk", "lodu",
];

export const HANDLE_MIN = 4;
export const HANDLE_MAX = 24;

export function normalizeHandle(raw: string): string {
  return raw.trim().toLowerCase();
}

export type HandleCheck = { valid: true } | { valid: false; reason: string };

export function validateHandleFormat(raw: string): HandleCheck {
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();
  // Compare without separators so "a-d-m-i-n" is caught too.
  const squashed = lower.replace(/[-_]/g, "");

  if (trimmed.length < HANDLE_MIN || trimmed.length > HANDLE_MAX) {
    return { valid: false, reason: `Must be ${HANDLE_MIN}–${HANDLE_MAX} characters.` };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { valid: false, reason: "Only letters, numbers, - and _ are allowed." };
  }
  if (!/[a-zA-Z]/.test(trimmed)) {
    return { valid: false, reason: "Include at least one letter." };
  }
  if (/\d{6,}/.test(squashed)) {
    return { valid: false, reason: "Roll numbers and phone numbers aren't allowed." };
  }
  // Short words only match a whole part ("mod" blocks "Mod-24", not "Modern");
  // longer words match anywhere, even with separators removed.
  const tokens = lower.split(/[-_\d]+/).filter(Boolean);
  const contains = (word: string) =>
    word.length <= 4 ? tokens.includes(word) : squashed.includes(word);

  if (RESERVED_WORDS.some(contains)) {
    return { valid: false, reason: "That word is reserved." };
  }
  if (BLOCKED_WORDS.some(contains)) {
    return { valid: false, reason: "Please choose a cleaner handle." };
  }
  return { valid: true };
}
