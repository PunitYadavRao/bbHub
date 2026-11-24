import { headers } from "next/headers";
import { getSessionCookie } from "better-auth/cookies";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { presetAvatars, user } from "@/db/schema";
import { getAuth } from "./auth";

export type CurrentUser = {
  id: string;
  username: string | null;
  avatarId: string | null;
  avatarUrl: string | null;
  avatarLabel: string | null;
  collegeId: string | null;
  onboardingCompleted: boolean;
  isBanned: boolean;
};

/**
 * Reads the session and loads the student's current row, so onboarding and ban
 * status are always fresh. Returns null when signed out. Never exposes email
 * or authorToken.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  // Read the request first: it marks the caller as dynamic before anything
  // touches the database, so builds never need DATABASE_URL.
  const requestHeaders = await headers();
  // No session cookie: signed out, no database round trip needed.
  if (!getSessionCookie(requestHeaders)) return null;

  const session = await getAuth().api.getSession({ headers: requestHeaders });
  if (!session) return null;

  const [row] = await getDb()
    .select({
      id: user.id,
      username: user.displayUsername,
      avatarId: user.avatarId,
      avatarUrl: presetAvatars.imageUrl,
      avatarLabel: presetAvatars.label,
      collegeId: user.collegeId,
      onboardingCompleted: user.onboardingCompleted,
      isBanned: user.isBanned,
    })
    .from(user)
    .leftJoin(presetAvatars, eq(user.avatarId, presetAvatars.id))
    .where(eq(user.id, session.user.id))
    .limit(1);

  return row ?? null;
}
