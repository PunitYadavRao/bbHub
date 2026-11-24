import type { GlyphName } from "./pixel-glyph";

/** Copy for the public landing page. */

export type SectionId = "about" | "inside" | "drop" | "vault" | "footer";

export const DOMAIN_NOTE = "Only @rishihood.edu.in & @nst.rishihood.edu.in";

export const INTRO_LINES = [
  "Verified campus access. Only Rishihood college Google accounts get in.",
  "Zero real names on public posts. You’re a username, not a roll number.",
  "Built for the nightly 9 PM drop and the campus stuff you check every day.",
];

export type Feature = {
  id: string;
  title: string;
  blurb: string;
  tags: [string, string, string];
  art: GlyphName;
};

export const FEATURES: Feature[] = [
  {
    id: "drop",
    title: "9 PM Daily Drop",
    blurb: "One question at 9 PM. The best answer wears the crown for 24 hours.",
    tags: ["nightly", "crown", "24h"],
    art: "crown",
  },
  {
    id: "top-10",
    title: "Top 10 Today",
    blurb: "The ten posts campus actually cared about, ranked and archived every day.",
    tags: ["ranked", "archive", "text-only"],
    art: "trophy",
  },
  {
    id: "mess",
    title: "Mess Menu Ratings",
    blurb: "Rate today’s dishes before you queue. Know what’s worth the walk.",
    tags: ["daily", "utility", "dishes"],
    art: "bowl",
  },
  {
    id: "wordle",
    title: "Campus Wordle",
    blurb: "One five-letter word a day. Share your grid, not your name.",
    tags: ["5-letter", "share", "daily"],
    art: "tiles",
  },
  {
    id: "league",
    title: "Hostel League",
    blurb: "Hostels earn points for being helpful. A weekly table and bragging rights.",
    tags: ["weekly", "team", "helpfulness"],
    art: "flag",
  },
  {
    id: "issues",
    title: "Facilities Issue Board",
    blurb: "Report what’s broken in your hostel, upvote it and track the fix.",
    tags: ["hostels", "upvotes", "status"],
    art: "board",
  },
];

export const DROP_LINES = [
  "Every night at 9 PM, one question drops for the whole campus.",
  "Answer anonymously and upvote the answers that land.",
  "The most-upvoted answer wins King or Queen of the Day for 24 hours.",
];

export const VAULT_LINES = [
  "Your college email stays locked in a private vault. It’s used once, to verify you.",
  "Public posts carry a one-way anonymous token, never your email.",
  "Every comment thread gives you a fresh alias, like Blue Lantern 7.",
];

export type MenuLink =
  | { label: string; href: string }
  | { label: string; section: SectionId };

export const MENU_LINKS: MenuLink[] = [
  { label: "Feed", href: "/home" },
  { label: "Top 10 Today", section: "inside" },
  { label: "Campus Wordle", section: "inside" },
  { label: "Hostel League", section: "inside" },
  { label: "Grievance", href: "/grievance" },
];
