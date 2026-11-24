import { bigint, boolean, index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Colleges and the email domains that prove membership (subdomains included).
// Adding a college means inserting one row.
export const colleges = pgTable("colleges", {
  id: text("id").primaryKey(), // e.g. "rishihood-sonipat"
  name: text("name").notNull(),
  city: text("city").notNull(),
  allowedDomains: text("allowed_domains").array().notNull(),
  timezone: text("timezone").notNull().default("Asia/Kolkata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Preset profile pictures students can pick from.
export const presetAvatars = pgTable("preset_avatars", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull().default("campus"),
  sortOrder: integer("sort_order").notNull().default(0),
});

// ---------------------------------------------------------------------------
// PRIVATE VAULT: Better Auth tables plus BBHub profile fields.
// Never return email or authorToken from a public endpoint.
// ---------------------------------------------------------------------------

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  // Anonymous username: stored lowercase for uniqueness, displayed as chosen.
  username: text("username").unique(),
  displayUsername: text("display_username"),
  avatarId: text("avatar_id").references(() => presetAvatars.id),
  collegeId: text("college_id").references(() => colleges.id),
  // Random token that links a student to their posts. Never sent to browsers.
  authorToken: text("author_token").unique(),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  isBanned: boolean("is_banned").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shared rate-limit counters, so limits hold across serverless instances.
export const rateLimit = pgTable("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});

// ---------------------------------------------------------------------------
// PUBLIC VAULT: anonymous posts, linked to a student only through authorToken.
// ---------------------------------------------------------------------------

export const posts = pgTable(
  "posts",
  {
    id: text("id").primaryKey(),
    collegeId: text("college_id")
      .notNull()
      .references(() => colleges.id),
    authorToken: text("author_token").notNull(),
    tag: text("tag").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    status: text("status").notNull().default("published"), // published | pending_review | hidden
    netVotes: integer("net_votes").notNull().default(1),
    replyCount: integer("reply_count").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("posts_college_status_created_idx").on(table.collegeId, table.status, table.createdAt),
  ],
);
