import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { presetAvatars, user } from "@/db/schema";
import { normalizeHandle, validateHandleFormat } from "./handle-rules";

export type Availability = { available: true } | { available: false; reason: string };

/** Live check used while typing: format rules first, then the database. */
export async function isUsernameAvailable(raw: string, myUserId: string): Promise<Availability> {
  const format = validateHandleFormat(raw);
  if (!format.valid) return { available: false, reason: format.reason };

  const [existing] = await getDb()
    .select({ id: user.id })
    .from(user)
    .where(eq(user.username, normalizeHandle(raw)))
    .limit(1);

  if (existing && existing.id !== myUserId) {
    return { available: false, reason: "Username already exists. Try another." };
  }
  return { available: true };
}

const onboardingSchema = z.object({
  username: z.string().trim().min(1),
  avatarId: z.string().nullable().optional(),
});

export type OnboardingResult = { ok: true } | { ok: false; status: number; error: string };

/** Saves the username (permanent) and optional avatar, once. */
export async function completeOnboarding(
  userId: string,
  input: unknown,
): Promise<OnboardingResult> {
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, status: 400, error: "Pick a username first." };
  }
  const { username, avatarId } = parsed.data;

  const availability = await isUsernameAvailable(username, userId);
  if (!availability.available) {
    return { ok: false, status: 409, error: availability.reason };
  }

  const db = getDb();
  if (avatarId) {
    const [avatar] = await db
      .select({ id: presetAvatars.id })
      .from(presetAvatars)
      .where(eq(presetAvatars.id, avatarId))
      .limit(1);
    if (!avatar) return { ok: false, status: 400, error: "Invalid profile picture." };
  }

  try {
    const updated = await db
      .update(user)
      .set({
        username: normalizeHandle(username),
        displayUsername: username,
        avatarId: avatarId ?? null,
        onboardingCompleted: true,
        updatedAt: new Date(),
      })
      // Only students who haven't picked a username yet: usernames are permanent.
      .where(and(eq(user.id, userId), isNull(user.username)))
      .returning({ id: user.id });

    if (updated.length === 0) {
      return { ok: false, status: 409, error: "Your username is already set." };
    }
    return { ok: true };
  } catch (error) {
    // Unique violation: someone took the username between the check and the save.
    if (isUniqueViolation(error)) {
      return { ok: false, status: 409, error: "That username was just taken. Pick another." };
    }
    throw error;
  }
}

function isUniqueViolation(error: unknown): boolean {
  for (let e: unknown = error; e && typeof e === "object"; e = (e as { cause?: unknown }).cause) {
    if ((e as { code?: string }).code === "23505") return true;
  }
  return false;
}
