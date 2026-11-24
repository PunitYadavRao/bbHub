import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { user } from "@/db/schema";
import { getAuth } from "./auth";

export type CurrentUser = {
  id: string;
  handle: string | null;
  hostelId: string | null;
  batchYear: number | null;
  collegeId: string | null;
  onboardingCompleted: boolean;
  isBanned: boolean;
};

/**
 * Reads the session and loads the user's current row, so onboarding and ban
 * status are always fresh. Returns null when signed out. Never exposes email
 * or authorToken.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  // Read the request first: it marks the caller as dynamic before anything
  // touches the database, so builds never need DATABASE_URL.
  const requestHeaders = await headers();
  const session = await getAuth().api.getSession({ headers: requestHeaders });
  if (!session) return null;

  const [row] = await getDb()
    .select({
      id: user.id,
      handle: user.displayUsername,
      hostelId: user.hostelId,
      batchYear: user.batchYear,
      collegeId: user.collegeId,
      onboardingCompleted: user.onboardingCompleted,
      isBanned: user.isBanned,
    })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  return row ?? null;
}
